import React, { useState, useRef, useEffect } from "react";
import {
  Button,
  Group,
  TextInput,
  Textarea,
  Box,
  Text,
  Paper,
  ActionIcon,
  Flex,
  NumberInput,
  Modal,
  ScrollArea,
  SegmentedControl,
  Badge,
} from "@mantine/core";
import {
  IconPlayerPlay,
  IconPlus,
  IconTrash,
  IconEdit,
  IconPlayerPause,
  IconCheck,
  IconX,
  IconMusic,
  IconClock,
  IconFileText,
} from "@tabler/icons-react";

const LyricsEditor = ({ songData, onLyricsChange, audioUrl }) => {
  const [lyrics, setLyrics] = useState([]);
  const [rawLyrics, setRawLyrics] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editorMode, setEditorMode] = useState("timeline"); // 'timeline' or 'raw'
  const audioRef = useRef(null);

  // Parse lyrics từ format LRC hoặc text thường
  const parseLyricsFromText = (lyricsText) => {
    if (!lyricsText) return [];

    const lines = lyricsText.split("\n").filter((line) => line.trim() !== "");
    const parsedLines = [];

    lines.forEach((line, index) => {
      // Tìm tất cả timestamps trong một dòng - support multiple timestamps
      const timestampRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{2}))?\]/g;
      const timestamps = [];
      let match;

      // Extract all timestamps
      while ((match = timestampRegex.exec(line)) !== null) {
        const minutes = parseInt(match[1]);
        const seconds = parseInt(match[2]);
        const centiseconds = parseInt(match[3] || 0);
        const timeInSeconds = minutes * 60 + seconds + centiseconds / 100;
        timestamps.push(timeInSeconds);
      }

      if (timestamps.length > 0) {
        // Lấy text sau tất cả timestamps
        const textAfterTimestamps = line
          .replace(/\[(\d{1,2}):(\d{2})(?:\.(\d{2}))?\]\s*/g, "")
          .trim();

        if (textAfterTimestamps) {
          // Nếu có nhiều timestamps, chỉ lấy timestamp đầu tiên làm chính
          // Các timestamp khác sẽ được giữ nguyên trong text
          const mainTime = timestamps[0];
          let finalText = textAfterTimestamps;

          // Nếu có nhiều hơn 1 timestamp, thêm các timestamp còn lại vào đầu text
          if (timestamps.length > 1) {
            const additionalTimestamps = timestamps
              .slice(1)
              .map((time) => {
                const mins = Math.floor(time / 60);
                const secs = Math.floor(time % 60);
                const centisecs = Math.floor((time % 1) * 100);
                return `[${mins.toString().padStart(2, "0")}:${secs
                  .toString()
                  .padStart(2, "0")}.${centisecs.toString().padStart(2, "0")}]`;
              })
              .join(" ");
            finalText = additionalTimestamps + " " + textAfterTimestamps;
          }

          parsedLines.push({
            time: mainTime,
            text: finalText,
            id: Date.now() + index + Math.random(), // Thêm random để tránh duplicate ID
            hasMultipleTimestamps: timestamps.length > 1,
            originalTimestamps: timestamps,
          });
        }
      } else if (line.trim()) {
        // CHỈ tạo timestamp ước tính khi KHÔNG có lyrics hiện tại
        // hoặc khi đang parse từ raw text lần đầu
        const estimatedTime = index * 4; // 4 giây mỗi dòng
        parsedLines.push({
          time: estimatedTime,
          text: line.trim(),
          id: Date.now() + index + Math.random(),
          estimated: true,
        });
      }
    });

    return parsedLines.sort((a, b) => a.time - b.time);
  };

  // Convert lyrics array về format LRC
  const convertToLRCFormat = (lyricsArray) => {
    return lyricsArray
      .sort((a, b) => a.time - b.time)
      .map((lyric) => {
        const minutes = Math.floor(lyric.time / 60);
        const seconds = Math.floor(lyric.time % 60);
        const centiseconds = Math.floor((lyric.time % 1) * 100);

        const timeStr = `[${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}]`;
        return `${timeStr} ${lyric.text}`;
      })
      .join("\n");
  };

  // Initialize lyrics khi component mount
  useEffect(() => {
    if (songData?.lyrics) {
      const parsed = parseLyricsFromText(songData.lyrics);
      setLyrics(parsed);
      setRawLyrics(songData.lyrics);
    }
  }, [songData]);

  // Update audio current time
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  // Audio controls
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const seekTo = (time) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Lyrics management
  const addLyricLine = () => {
    const newLyric = {
      id: Date.now(),
      time: currentTime,
      text: "",
      estimated: false, // Đánh dấu không phải estimated
    };

    const newLyrics = [...lyrics, newLyric].sort((a, b) => a.time - b.time);
    setLyrics(newLyrics);

    // Find index of new lyric and start editing
    const newIndex = newLyrics.findIndex((l) => l.id === newLyric.id);
    setEditingIndex(newIndex);
  };

  const updateLyric = (index, field, value) => {
    const newLyrics = [...lyrics];
    newLyrics[index] = {
      ...newLyrics[index],
      [field]: value,
      estimated: false, // Đánh dấu không phải estimated khi user edit
    };
    setLyrics(newLyrics);
  };

  const deleteLyric = (index) => {
    const newLyrics = lyrics.filter((_, i) => i !== index);
    setLyrics(newLyrics);
    setEditingIndex(-1); // Reset editing state
  };

  const saveEditing = () => {
    setEditingIndex(-1);
    // Cập nhật parent ngay lập tức để tránh mất data
    updateParentLyrics();
  };

  // FIX: Cập nhật hàm này để không parse lại khi đang trong timeline mode
  const updateParentLyrics = () => {
    const lrcFormat = convertToLRCFormat(lyrics);
    setRawLyrics(lrcFormat); // Sync raw lyrics với current state
    onLyricsChange(lrcFormat);
  };

  // FIX: Cập nhật hàm xử lý raw lyrics
  const handleRawLyricsChange = (value) => {
    setRawLyrics(value);
    // CHỈ parse lại khi đang ở raw mode và user thực sự thay đổi
    if (editorMode === "raw") {
      const parsed = parseLyricsFromText(value);
      setLyrics(parsed);
    }
  };

  // FIX: Thêm hàm save cho raw editor
  const saveRawLyrics = () => {
    const parsed = parseLyricsFromText(rawLyrics);
    setLyrics(parsed);
    onLyricsChange(rawLyrics);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const centisecs = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}.${centisecs.toString().padStart(2, "0")}`;
  };

  return (
    <Box>
      {/* Audio Player */}
      {audioUrl && (
        <Paper p="md" mb="md" withBorder>
          <audio ref={audioRef} src={audioUrl} />
          <Group justify="space-between" align="center">
            <Group>
              <ActionIcon
                size="lg"
                variant="filled"
                color="blue"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <IconPlayerPause size={16} />
                ) : (
                  <IconPlayerPlay size={16} />
                )}
              </ActionIcon>
              <Text size="sm">
                {formatTime(currentTime)} /{" "}
                {audioRef.current
                  ? formatTime(audioRef.current.duration || 0)
                  : "00:00.00"}
              </Text>
            </Group>
            {editorMode === "timeline" && (
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={addLyricLine}
                variant="light"
                color="green"
              >
                Add Lyric at {formatTime(currentTime)}
              </Button>
            )}
          </Group>
        </Paper>
      )}

      {/* Editor Mode Toggle */}
      <Paper p="md" mb="md" withBorder bg="gray.0">
        <Group justify="space-between" align="center">
          <Box>
            <Text size="sm" fw={500} mb={4}>
              Choose Editor Mode:
            </Text>
            <SegmentedControl
              value={editorMode}
              onChange={setEditorMode}
              size="md"
              data={[
                {
                  label: (
                    <Group gap="xs">
                      <IconClock size={16} />
                      <span>Timeline Editor</span>
                    </Group>
                  ),
                  value: "timeline",
                },
                {
                  label: (
                    <Group gap="xs">
                      <IconFileText size={16} />
                      <span>Raw Text Editor</span>
                    </Group>
                  ),
                  value: "raw",
                },
              ]}
            />
          </Box>
          <Group>
            <Badge color={lyrics.length > 0 ? "green" : "gray"} variant="light">
              {lyrics.length} lyrics lines
            </Badge>
            {lyrics.some((l) => !l.estimated) && (
              <Badge color="blue" variant="light">
                ✓ Synced
              </Badge>
            )}
          </Group>
        </Group>
      </Paper>

      {editorMode === "raw" ? (
        /* Raw Text Editor */
        <Paper p="md" withBorder>
          <Text size="sm" mb="xs" c="dimmed">
            Enter lyrics in LRC format: [mm:ss.xx] Lyric text
          </Text>
          <Textarea
            value={rawLyrics}
            onChange={(e) => handleRawLyricsChange(e.target.value)}
            minRows={10}
            maxRows={20}
            placeholder="[00:12.50] First lyric line&#10;[00:17.20] Second lyric line&#10;..."
          />
          <Group mt="md" justify="flex-end">
            <Button onClick={saveRawLyrics} color="green">
              Save Changes
            </Button>
          </Group>
        </Paper>
      ) : (
        /* Timeline Editor */
        <Paper p="md" withBorder>
          <ScrollArea h={400}>
            <Box>
              {lyrics.length === 0 ? (
                <Paper p="xl" ta="center" c="dimmed">
                  <IconMusic size={48} />
                  <Text mt="md">
                    No lyrics yet. Add some lyrics to get started!
                  </Text>
                  <Text size="sm" mt="xs">
                    Use the "Add Lyric" button above to sync lyrics with audio
                    timing
                  </Text>
                </Paper>
              ) : (
                lyrics.map((lyric, index) => (
                  <Paper
                    key={lyric.id}
                    p="md"
                    mb="sm"
                    withBorder
                    bg={
                      Math.abs(currentTime - lyric.time) < 2
                        ? "blue.0"
                        : "white"
                    }
                    style={{
                      border:
                        Math.abs(currentTime - lyric.time) < 2
                          ? "2px solid #339af0"
                          : undefined,
                    }}
                  >
                    {editingIndex === index ? (
                      /* Editing Mode */
                      <Flex direction="column" gap="sm">
                        <Group grow>
                          <NumberInput
                            label="Time (seconds)"
                            value={lyric.time}
                            onChange={(value) =>
                              updateLyric(index, "time", value || 0)
                            }
                            precision={2}
                            step={0.1}
                            min={0}
                            leftSection={<IconClock size={16} />}
                          />
                          <Group>
                            <ActionIcon
                              color="green"
                              onClick={saveEditing}
                              size="lg"
                            >
                              <IconCheck size={16} />
                            </ActionIcon>
                            <ActionIcon
                              color="red"
                              onClick={() => setEditingIndex(-1)}
                              size="lg"
                            >
                              <IconX size={16} />
                            </ActionIcon>
                          </Group>
                        </Group>
                        <TextInput
                          placeholder="Enter lyric text"
                          value={lyric.text}
                          onChange={(e) =>
                            updateLyric(index, "text", e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              saveEditing();
                            }
                          }}
                        />
                      </Flex>
                    ) : (
                      /* Display Mode */
                      <Group justify="space-between" align="center">
                        <Box style={{ flex: 1 }}>
                          <Group mb="xs">
                            <Badge color="blue" variant="light" size="sm">
                              {formatTime(lyric.time)}
                            </Badge>
                            {lyric.estimated && (
                              <Badge color="orange" variant="light" size="xs">
                                estimated
                              </Badge>
                            )}
                            {lyric.hasMultipleTimestamps && (
                              <Badge color="purple" variant="light" size="xs">
                                multi-time
                              </Badge>
                            )}
                          </Group>
                          <Text>{lyric.text || "Empty lyric"}</Text>
                        </Box>
                        <Group>
                          <ActionIcon
                            variant="light"
                            onClick={() => seekTo(lyric.time)}
                            title="Seek to this time"
                          >
                            <IconPlayerPlay size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="light"
                            onClick={() => setEditingIndex(index)}
                            title="Edit timestamp and text"
                            color="blue"
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="light"
                            color="red"
                            onClick={() => deleteLyric(index)}
                            title="Delete"
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Group>
                    )}
                  </Paper>
                ))
              )}
            </Box>
          </ScrollArea>

          {/* Save button for timeline editor */}
          {lyrics.length > 0 && (
            <Group mt="md" justify="flex-end">
              <Button onClick={updateParentLyrics} color="green" size="md">
                Save Lyrics Changes
              </Button>
            </Group>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default LyricsEditor;
