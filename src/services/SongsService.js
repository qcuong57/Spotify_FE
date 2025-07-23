import axiosCustom from "../utils/axiosCustom";

export const getAllSongs = async (page = 1, size = 50) => {
  return await axiosCustom.get(`/api/songs/?page=${page}&page_size=${size}`);
};

// New function to get all songs with pagination
export const getAllSongsWithPagination = async () => {
  let allSongs = [];
  let currentPage = 1;
  let hasMore = true;
  const pageSize = 50;

  try {
    while (hasMore) {
      const response = await axiosCustom.get(
        `/api/songs/?page=${currentPage}&page_size=${pageSize}`
      );

      if (response?.data?.results && response.data.results.length > 0) {
        allSongs = [...allSongs, ...response.data.results];

        // Check if there are more pages
        // Assuming the API returns total count or next page info
        const totalCount = response.data.count;
        const totalPages = Math.ceil(totalCount / pageSize);

        hasMore = currentPage < totalPages;
        currentPage++;
      } else {
        hasMore = false;
      }
    }

    return {
      data: {
        results: allSongs,
        count: allSongs.length,
      },
    };
  } catch (error) {
    console.error("Error fetching all songs:", error);
    throw error;
  }
};

export const searchSongs = async (query, page = 1, size = 10) => {
  return await axiosCustom.get(
    `/api/songs/search/?q=${encodeURIComponent(
      query
    )}&page=${page}&page_size=${size}`
  );
};

export const getSongById = async (id) => {
  return await axiosCustom.get(`/api/songs/${id}/`);
};

export const createSong = async (songData) => {
  const formData = new FormData();
  formData.append("song_name", songData.song_name);
  formData.append("singer_name", songData.singer_name);
  formData.append("genre", songData.genre_id);
  // Thêm lyrics vào formData
  if (songData.lyrics) formData.append("lyrics", songData.lyrics);
  if (songData.audio_file) formData.append("audio_file", songData.audio_file);
  if (songData.image_file) formData.append("image_file", songData.image_file);
  if (songData.video_file) formData.append("video_file", songData.video_file);

  return await axiosCustom.post("/api/songs/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateSong = async (id, songData, currentUrls) => {
  console.log(songData);

  const formData = new FormData();
  formData.append("song_name", songData.song_name);
  formData.append("singer_name", songData.singer_name);
  formData.append("genre", songData.genre_id);
  // Thêm lyrics vào formData
  if (songData.lyrics !== undefined) formData.append("lyrics", songData.lyrics);
  if (songData.audio_file) formData.append("audio_file", songData.audio_file);
  else if (currentUrls.url_audio)
    formData.append("url_audio", currentUrls.url_audio);
  if (songData.image_file) formData.append("image_file", songData.image_file);
  else if (currentUrls.image) formData.append("image", currentUrls.image);
  if (songData.video_file) formData.append("video_file", songData.video_file);
  else if (currentUrls.url_video)
    formData.append("url_video", currentUrls.url_video);

  // Log FormData content correctly
  for (let [key, value] of formData.entries()) {
    console.log(`${key}:`, value);
  }

  return await axiosCustom.put(`/api/songs/${id}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteSong = async (id) => {
  return await axiosCustom.delete(`/api/songs/${id}/`);
};

// Thêm function để lấy lyrics riêng (tùy chọn)
export const getSongLyrics = async (id) => {
  return await axiosCustom.get(`/api/songs/${id}/lyrics/`);
};

// Thêm function để cập nhật chỉ lyrics (tùy chọn)
export const updateSongLyrics = async (id, lyrics) => {
  return await axiosCustom.patch(`/api/songs/${id}/lyrics/`, { lyrics });
};