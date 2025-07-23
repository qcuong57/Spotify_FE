import {
  Button,
  Flex,
  Group,
  LoadingOverlay,
  Select,
  TextInput,
  Title,
  FileInput,
  Text,
  Tabs,
  Paper,
  Box,
} from "@mantine/core";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { getSongById, updateSong } from "../../../../services/SongsService";
import { getAllGenres } from "../../../../services/genresService";
import { notifications } from "@mantine/notifications";
import LyricsEditor from "../../Lyrics/LyricsEditor"; 

const UpdateSongForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState({
    song_name: "",
    singer_name: "",
    genre_id: "",
    lyrics: "",
    audio_file: null,
    image_file: null,
    video_file: null,
  });
  const [genres, setGenres] = useState([]);
  const [currentUrls, setCurrentUrls] = useState({
    url_audio: "",
    image: "",
    url_video: "",
  });
  const navigate = useNavigate();
  const { id } = useParams();

  // Lấy danh sách genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await getAllGenres();
        setGenres(
          response.data.map((genre) => ({
            value: genre.id,
            label: genre.name,
          }))
        );
      } catch (error) {
        console.error("Error fetching genres:", error);
        notifications.show({
          title: "Error",
          message: "Failed to load genres",
          color: "red",
        });
      }
    };
    fetchGenres();
  }, []);

  // Lấy thông tin bài hát
  useEffect(() => {
    const fetchSong = async () => {
      setIsLoading(true);
      try {
        const response = await getSongById(id);
        setFormData({
          song_name: response.data.song_name,
          singer_name: response.data.singer_name,
          genre_id: response.data.genre,
          lyrics: response.data.lyrics || "",
          audio_file: null,
          image_file: null,
          video_file: null,
        });
        setCurrentUrls({
          url_audio: response.data.url_audio || "",
          image: response.data.image || "",
          url_video: response.data.url_video || "",
        });
      } catch (error) {
        console.error("Error fetching song:", error);
        notifications.show({
          title: "Error",
          message: "Failed to load song data",
          color: "red",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSong();
  }, [id]);

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateSong(id, formData, currentUrls);
      notifications.show({
        title: "Success",
        message: "Song updated successfully",
        color: "green",
      });
      navigate("/admin/songs");
    } catch (error) {
      console.error("Error updating song:", error);
      notifications.show({
        title: "Error",
        message:
          error.response?.status === 403
            ? "You do not have permission to update this song"
            : "Failed to update song",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý thay đổi input
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Xử lý thay đổi lyrics từ LyricsEditor
  const handleLyricsChange = (newLyrics) => {
    setFormData((prev) => ({ ...prev, lyrics: newLyrics }));
  };

  // Lấy URL audio để preview
  const getAudioPreviewUrl = () => {
    if (formData.audio_file) {
      return URL.createObjectURL(formData.audio_file);
    }
    return currentUrls.url_audio;
  };

  // Kiểm tra có lyrics với timestamps không
  const hasTimestamps =
    formData.lyrics &&
    formData.lyrics.includes("[") &&
    formData.lyrics.includes("]");

  return (
    <>
      <LoadingOverlay
        visible={isLoading}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
      />

      <Title order={1} mt={32} className="text-[#1db954]">
        Update Song
      </Title>

      <Paper p="lg" mt="md" withBorder>
        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab value="basic">Basic Info</Tabs.Tab>
              <Tabs.Tab value="files">Media Files</Tabs.Tab>
              <Tabs.Tab value="lyrics">
                Lyrics & Timing
                {hasTimestamps && (
                  <Text size="xs" c="green" ml="xs" component="span">
                    ✓ Synced
                  </Text>
                )}
              </Tabs.Tab>
            </Tabs.List>

            {/* Basic Info Tab */}
            <Tabs.Panel value="basic" pt="md">
              <Flex direction="column" gap={20}>
                <TextInput
                  label="Song Name"
                  size="md"
                  value={formData.song_name}
                  onChange={(e) =>
                    handleInputChange("song_name", e.target.value)
                  }
                  placeholder="Enter song title"
                  required
                />

                <TextInput
                  label="Singer Name"
                  size="md"
                  value={formData.singer_name}
                  onChange={(e) =>
                    handleInputChange("singer_name", e.target.value)
                  }
                  placeholder="Enter singer name"
                  required
                />

                <Select
                  label="Genre"
                  size="md"
                  value={formData.genre_id}
                  onChange={(value) => handleInputChange("genre_id", value)}
                  placeholder="Select genre"
                  data={genres}
                  allowDeselect={false}
                  required
                />
              </Flex>
            </Tabs.Panel>

            {/* Media Files Tab */}
            <Tabs.Panel value="files" pt="md">
              <Flex direction="column" gap={20}>
                <Box>
                  <Text size="sm" mb={5} fw={500}>
                    Audio File
                  </Text>
                  {currentUrls.url_audio && (
                    <Text size="sm" mb={5} c="blue">
                      Current: {currentUrls.url_audio.split("/").pop()}
                    </Text>
                  )}
                  <FileInput
                    placeholder="Upload new audio file"
                    size="md"
                    accept="audio/mp3,audio/mp4,audio/wav"
                    onChange={(file) => handleInputChange("audio_file", file)}
                  />
                </Box>

                <Box>
                  <Text size="sm" mb={5} fw={500}>
                    Image File
                  </Text>
                  {currentUrls.image && (
                    <Text size="sm" mb={5} c="blue">
                      Current: {currentUrls.image.split("/").pop()}
                    </Text>
                  )}
                  <FileInput
                    placeholder="Upload new image file"
                    size="md"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={(file) => handleInputChange("image_file", file)}
                  />
                </Box>

                <Box>
                  <Text size="sm" mb={5} fw={500}>
                    Video File
                  </Text>
                  {currentUrls.url_video && (
                    <Text size="sm" mb={5} c="blue">
                      Current: {currentUrls.url_video.split("/").pop()}
                    </Text>
                  )}
                  <FileInput
                    placeholder="Upload new video file"
                    size="md"
                    accept="video/mp4,video/mov,video/avi"
                    onChange={(file) => handleInputChange("video_file", file)}
                  />
                </Box>
              </Flex>
            </Tabs.Panel>

            {/* Lyrics & Timing Tab */}
            <Tabs.Panel value="lyrics" pt="md">
              <Box>
                <Text size="lg" fw={500} mb="md">
                  Lyrics Editor with Timeline Sync
                </Text>
                <Text size="sm" c="dimmed" mb="lg">
                  Use the advanced lyrics editor to add timestamps for
                  synchronized lyrics display. The timestamps will be used to
                  highlight lyrics as the song plays.
                </Text>

                <LyricsEditor
                  songData={{ lyrics: formData.lyrics }}
                  onLyricsChange={handleLyricsChange}
                  audioUrl={getAudioPreviewUrl()}
                />

                {hasTimestamps && (
                  <Paper p="md" mt="md" bg="green.0" withBorder>
                    <Group>
                      <Text size="sm" c="green" fw={500}>
                        ✓ Lyrics are synchronized with timestamps
                      </Text>
                    </Group>
                    <Text size="xs" c="dimmed" mt="xs">
                      These synchronized lyrics will be displayed with
                      highlighting during playback in the song description page.
                    </Text>
                  </Paper>
                )}
              </Box>
            </Tabs.Panel>
          </Tabs>

          {/* Form Actions */}
          <Group mt={32} justify="flex-end">
            <Link to="/admin/songs">
              <Button variant="filled" color="gray">
                Cancel
              </Button>
            </Link>
            <Button type="submit" variant="filled" color="#1db954">
              Save Changes
            </Button>
          </Group>
        </form>
      </Paper>
    </>
  );
};

export default UpdateSongForm;
