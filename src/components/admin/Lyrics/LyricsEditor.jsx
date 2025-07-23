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
  IconTextCaption,
} from "@tabler/icons-react";

const LyricsEditor = ({ songData, onLyricsChange, audioUrl }) => {
  const [lyrics, setLyrics] = useState([]);
  const [rawLyrics, setRawLyrics] = useState("");
  const [plainLyrics, setPlainLyrics] = useState(""); // New state for plain text lyrics
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editorMode, setEditorMode] = useState("timeline"); // Added 'plain' mode
  const audioRef = useRef(null);

  // Parse lyrics from LRC format or plain text
  const parseLyricsFromText = (lyricsText, isPlainText = false) => {
    if (!lyricsText) return [];

    const lines = lyricsText.split("\n").filter((line) => line.trim() !== "");
    const parsedLines = [];

    if (isPlainText) {
      // Handle plain text lyrics
      lines.forEach((line, index) => {
        if (line.trim()) {
          parsedLines.push({
            time: index * 4, // Default spacing for plain text
            text: line.trim(),
            id: Date.now() + index + Math.random(),
            estimated: true,
            isPlain: true, // Mark as plain text lyric
          });
        }
      });
    } else {
      // Existing LRC parsing logic
      lines.forEach((line, index) => {
        const timestampRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{2}))?\]/g;
        const timestamps = [];
        let match;

        while ((match = timestampRegex.exec(line)) !== null) {
          const minutes = parseInt(match[1]);
          const seconds = parseInt(match[2]);
          const centiseconds = parseInt(match[3] || 0);
          const timeInSeconds = minutes * 60 + seconds + centiseconds / 100;
          timestamps.push(timeInSeconds);
        }

        if (timestamps.length > 0) {
          const textAfterTimestamps = line
            .replace(/\[(\d{1,2}):(\d{2})(?:\.(\d{2}))?\]\s*/g, "")
            .trim();

          if (textAfterTimestamps) {
            const mainTime = timestamps[0];
            let finalText = textAfterTimestamps;

            if (timestamps.length > 1) {
              const additionalTimestamps = timestamps
                .slice(1)
                .map((time) => {
                  const mins = Math.floor(time / 60);
                  const secs = Math.floor(time % 60);
                  const centisecs = Math.floor((time % 1) * 100);
                  return `[${mins.toString().padStart(2, "0")}:${secs
                    .toString()
                    .padStart(2, "0")}.${centisecs
                    .toString()
                    .padStart(2, "0")}]`;
                })
                .join(" ");
              finalText = additionalTimestamps + " " + textAfterTimestamps;
            }

            parsedLines.push({
              time: mainTime,
              text: finalText,
              id: Date.now() + index + Math.random(),
              hasMultipleTimestamps: timestamps.length > 1,
              originalTimestamps: timestamps,
            });
          }
        } else if (line.trim()) {
          const estimatedTime = index * 4;
          parsedLines.push({
            time: estimatedTime,
            text: line.trim(),
            id: Date.now() + index + Math.random(),
            estimated: true,
          });
        }
      });
    }

    return parsedLines.sort((a, b) => a.time - b.time);
  };

  // Convert lyrics array to LRC format or plain text
  const convertToOutputFormat = (lyricsArray, outputPlain = false) => {
    if (outputPlain) {
      return lyricsArray.map((lyric) => lyric.text).join("\n");
    }
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

  // Initialize lyrics when component mounts
  useEffect(() => {
    if (songData?.lyrics) {
      const isPlainText = !songData.lyrics.includes("[");
      const parsed = parseLyricsFromText(songData.lyrics, isPlainText);
      setLyrics(parsed);
      setRawLyrics(isPlainText ? "" : songData.lyrics);
      setPlainLyrics(isPlainText ? songData.lyrics : "");
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
      estimated: false,
      isPlain: editorMode === "plain",
    };

    const newLyrics = [...lyrics, newLyric].sort((a, b) => a.time - b.time);
    setLyrics(newLyrics);

    const newIndex = newLyrics.findIndex((l) => l.id === newLyric.id);
    setEditingIndex(newIndex);
  };

  const updateLyric = (index, field, value) => {
    const newLyrics = [...lyrics];
    newLyrics[index] = {
      ...newLyrics[index],
      [field]: value,
      estimated: false,
    };
    setLyrics(newLyrics);
  };

  const deleteLyric = (index) => {
    const newLyrics = lyrics.filter((_, i) => i !== index);
    setLyrics(newLyrics);
    setEditingIndex(-1);
  };

  const saveEditing = () => {
    setEditingIndex(-1);
    updateParentLyrics();
  };

  const updateParentLyrics = () => {
    const outputFormat =
      editorMode === "plain"
        ? convertToOutputFormat(lyrics, true)
        : convertToLRCFormat(lyrics);
    setRawLyrics(editorMode === "plain" ? "" : outputFormat);
    setPlainLyrics(editorMode === "plain" ? outputFormat : "");
    onLyricsChange(outputFormat);
  };

  const handleRawLyricsChange = (value) => {
    setRawLyrics(value);
    if (editorMode === "raw") {
      const parsed = parseLyricsFromText(value);
      setLyrics(parsed);
    }
  };

  const handlePlainLyricsChange = (value) => {
    setPlainLyrics(value);
    if (editorMode === "plain") {
      const parsed = parseLyricsFromText(value, true);
      setLyrics(parsed);
    }
  };

  const saveRawLyrics = () => {
    const parsed = parseLyricsFromText(rawLyrics);
    setLyrics(parsed);
    onLyricsChange(rawLyrics);
  };

  const savePlainLyrics = () => {
    const parsed = parseLyricsFromText(plainLyrics, true);
    setLyrics(parsed);
    onLyricsChange(plainLyrics);
  };

  const convertToLRCFormat = (lyricsArray) => {
    return convertToOutputFormat(lyricsArray, false);
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
                      <span>Raw LRC Editor</span>
                    </Group>
                  ),
                  value: "raw",
                },
                {
                  label: (
                    <Group gap="xs">
                      <IconTextCaption size={16} />
                      <span>Plain Text Editor</span>
                    </Group>
                  ),
                  value: "plain",
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
        /* Raw LRC Editor */
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
      ) : editorMode === "plain" ? (
        /* Plain Text Editor */
        <Paper p="md" withBorder>
          <Text size="sm" mb="xs" c="dimmed">
            Enter lyrics as plain text, one line per lyric
          </Text>
          <Textarea
            value={plainLyrics}
            onChange={(e) => handlePlainLyricsChange(e.target.value)}
            minRows={10}
            maxRows={20}
            placeholder="First lyric line&#10;Second lyric line&#10;..."
          />
          <Group mt="md" justify="flex-end">
            <Button onClick={savePlainLyrics} color="green">
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
                            {lyric.isPlain && (
                              <Badge color="gray" variant="light" size="xs">
                                plain
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
