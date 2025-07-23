import React, { useState, useEffect } from 'react';
import {
  Button,
  Group,
  TextInput,
  Title,
  Select,
  Flex,
  Text,
  LoadingOverlay,
  Tabs,
  Paper,
  FileInput,
  Image,
  Box,
} from '@mantine/core';
import { openModal } from '@mantine/modals';
import { Link, useNavigate, useParams } from 'react-router-dom';
import LyricsEditor from './LyricsEditor';
import { 
  createSong, 
  updateSong, 
  getSongById 
} from '../../../../services/SongsService';

const SongFormWithLyrics = ({ isEdit = false }) => {
  const { songId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  const [formData, setFormData] = useState({
    song_name: '',
    singer_name: '',
    genre_id: '',
    lyrics: '',
    audio_file: null,
    image_file: null,
    video_file: null,
  });

  const [currentUrls, setCurrentUrls] = useState({
    url_audio: '',
    image: '',
    url_video: ''
  });

  const [errors, setErrors] = useState({});
  const [genres] = useState([
    { value: '1', label: 'Pop' },
    { value: '2', label: 'Rock' },
    { value: '3', label: 'Hip Hop' },
    { value: '4', label: 'Jazz' },
    { value: '5', label: 'Classical' },
    { value: '6', label: 'Electronic' },
    { value: '7', label: 'Country' },
    { value: '8', label: 'R&B' },
  ]);

  // Fetch song data for editing
  useEffect(() => {
    if (isEdit && songId) {
      fetchSongData();
    }
  }, [isEdit, songId]);

  const fetchSongData = async () => {
    setIsLoading(true);
    try {
      const response = await getSongById(songId);
      const songData = response.data;
      
      setFormData({
        song_name: songData.song_name || '',
        singer_name: songData.singer_name || '',
        genre_id: songData.genre ? String(songData.genre.id) : '',
        lyrics: songData.lyrics || '',
        audio_file: null,
        image_file: null,
        video_file: null,
      });

      setCurrentUrls({
        url_audio: songData.url_audio || '',
        image: songData.image || '',
        url_video: songData.url_video || ''
      });
    } catch (error) {
      console.error('Error fetching song:', error);
      openModal({
        title: 'Error',
        children: <Text>Failed to fetch song data</Text>,
        centered: true,
        size: 'sm',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const handleLyricsChange = (newLyrics) => {
    setFormData({ ...formData, lyrics: newLyrics });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.song_name.trim()) {
      newErrors.song_name = 'Song name is required';
    }

    if (!formData.singer_name.trim()) {
      newErrors.singer_name = 'Singer name is required';
    }

    if (!formData.genre_id) {
      newErrors.genre_id = 'Genre is required';
    }

    if (!isEdit && !formData.audio_file) {
      newErrors.audio_file = 'Audio file is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setActiveTab('basic'); // Switch to basic tab to show errors
      return;
    }

    setIsLoading(true);

    try {
      if (isEdit) {
        await updateSong(songId, formData, currentUrls);
        openModal({
          title: 'Success',
          children: <Text>Song updated successfully</Text>,
          centered: true,
          size: 'sm',
        });
      } else {
        await createSong(formData);
        openModal({
          title: 'Success',
          children: <Text>Song created successfully</Text>,
          centered: true,
          size: 'sm',
        });
      }
      navigate('/admin/songs');
    } catch (error) {
      console.error('Error saving song:', error);
      openModal({
        title: 'Error',
        children: <Text>Failed to save song</Text>,
        centered: true,
        size: 'sm',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getAudioPreviewUrl = () => {
    if (formData.audio_file) {
      return URL.createObjectURL(formData.audio_file);
    }
    return currentUrls.url_audio;
  };

  return (
    <>
      <LoadingOverlay
        visible={isLoading}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
      />

      <Title order={1} mt={32}>
        {isEdit ? 'Update Song' : 'Create New Song'}
      </Title>

      <Paper p="lg" mt="md" withBorder>
        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab value="basic">Basic Info</Tabs.Tab>
              <Tabs.Tab value="files">Media Files</Tabs.Tab>
              <Tabs.Tab value="lyrics">Lyrics & Timing</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="basic" pt="md">
              <Flex direction="column" gap="md">
                <TextInput
                  label="Song Name"
                  placeholder="Enter song name"
                  value={formData.song_name}
                  onChange={(e) => handleChange('song_name', e.target.value)}
                  error={errors.song_name}
                  required
                  size="md"
                />

                <TextInput
                  label="Singer Name"
                  placeholder="Enter singer name"
                  value={formData.singer_name}
                  onChange={(e) => handleChange('singer_name', e.target.value)}
                  error={errors.singer_name}
                  required
                  size="md"
                />

                <Select
                  label="Genre"
                  placeholder="Select genre"
                  data={genres}
                  value={formData.genre_id}
                  onChange={(value) => handleChange('genre_id', value)}
                  error={errors.genre_id}
                  required
                  size="md"
                />
              </Flex>
            </Tabs.Panel>

            <Tabs.Panel value="files" pt="md">
              <Flex direction="column" gap="md">
                <Box>
                  <FileInput
                    label="Audio File"
                    placeholder="Select audio file"
                    accept="audio/*"
                    value={formData.audio_file}
                    onChange={(file) => handleChange('audio_file', file)}
                    error={errors.audio_file}
                    required={!isEdit}
                    size="md"
                  />
                  {currentUrls.url_audio && !formData.audio_file && (
                    <Text size="sm" c="dimmed" mt="xs">
                      Current: {currentUrls.url_audio.split('/').pop()}
                    </Text>
                  )}
                </Box>

                <Box>
                  <FileInput
                    label="Image File"
                    placeholder="Select image file"
                    accept="image/*"
                    value={formData.image_file}
                    onChange={(file) => handleChange('image_file', file)}
                    size="md"
                  />
                  {currentUrls.image && (
                    <Box mt="sm">
                      <Text size="sm" mb="xs">Current Image:</Text>
                      <Image
                        src={currentUrls.image}
                        alt="Current song image"
                        width={100}
                        height={100}
                        fit="cover"
                        radius="md"
                      />
                    </Box>
                  )}
                </Box>

                <Box>
                  <FileInput
                    label="Video File"
                    placeholder="Select video file"
                    accept="video/*"
                    value={formData.video_file}
                    onChange={(file) => handleChange('video_file', file)}
                    size="md"
                  />
                  {currentUrls.url_video && !formData.video_file && (
                    <Text size="sm" c="dimmed" mt="xs">
                      Current: {currentUrls.url_video.split('/').pop()}
                    </Text>
                  )}
                </Box>
              </Flex>
            </Tabs.Panel>

            <Tabs.Panel value="lyrics" pt="md">
              <LyricsEditor
                songData={{ lyrics: formData.lyrics }}
                onLyricsChange={handleLyricsChange}
                audioUrl={getAudioPreviewUrl()}
              />
            </Tabs.Panel>
          </Tabs>

          <Group mt="xl" justify="flex-end">
            <Link to="/admin/songs">
              <Button variant="light" color="gray">
                Cancel
              </Button>
            </Link>
            <Button type="submit" color="blue">
              {isEdit ? 'Update Song' : 'Create Song'}
            </Button>
          </Group>
        </form>
      </Paper>
    </>
  );
};

export default SongFormWithLyrics;