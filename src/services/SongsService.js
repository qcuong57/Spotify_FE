import axiosCustom from "../utils/axiosCustom";

// Enhanced error handling function
const handleApiError = (error, context = "API request") => {
  console.error(`${context} error:`, error);

  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 400:
        throw new Error(data.error || "Invalid request parameters");
      case 404:
        throw new Error("Resource not found");
      case 500:
        throw new Error(data.error || "Server error occurred");
      default:
        throw new Error(`Server error: ${status}`);
    }
  } else if (error.request) {
    // Request made but no response received
    throw new Error("Network error: Unable to connect to server");
  } else {
    // Something else happened
    throw new Error(error.message || "An unexpected error occurred");
  }
};

export const getAllSongs = async (page = 1, size = 50) => {
  try {
    return await axiosCustom.get(`/api/songs/?page=${page}&page_size=${size}`);
  } catch (error) {
    handleApiError(error, "Get all songs");
  }
};

// New function to get all songs with pagination
export const getAllSongsWithPagination = async () => {
  let allSongs = [];
  let currentPage = 1;
  let hasMore = true;
  const pageSize = 50;

  try {
    while (hasMore) {
      try {
        const response = await axiosCustom.get(
          `/api/songs/?page=${currentPage}&page_size=${pageSize}`
        );

        if (response?.data?.results && response.data.results.length > 0) {
          allSongs = [...allSongs, ...response.data.results];

          // Check if there are more pages
          const totalCount = response.data.count;
          const totalPages = Math.ceil(totalCount / pageSize);

          hasMore = currentPage < totalPages;
          currentPage++;
        } else {
          hasMore = false;
        }
      } catch (pageError) {
        console.error(`Error fetching page ${currentPage}:`, pageError);
        // Continue with next page or break if too many errors
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
    handleApiError(error, "Get all songs with pagination");
  }
};

// Đơn giản hóa search function - chỉ tìm bài hát và ca sĩ
export const searchSongs = async (query, page = 1, size = 50) => {
  try {
    // Input validation
    if (!query || typeof query !== "string") {
      throw new Error("Search query is required and must be a string");
    }

    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 1) {
      throw new Error("Search query cannot be empty");
    }

    // Build URL đơn giản - chỉ tìm bài hát và ca sĩ
    const url = `/api/songs/search/?q=${encodeURIComponent(
      trimmedQuery
    )}&page=${page}&page_size=${size}`;

    console.log("Making search request to:", url);

    const response = await axiosCustom.get(url);
    return response;
  } catch (error) {
    console.error("Search songs error:", error);

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 400:
          throw new Error("Tham số tìm kiếm không hợp lệ");
        case 404:
          throw new Error("Không tìm thấy kết quả");
        case 500:
          throw new Error("Lỗi server khi tìm kiếm");
        default:
          throw new Error(`Lỗi server: ${status}`);
      }
    } else if (error.request) {
      throw new Error("Lỗi mạng: Không thể kết nối đến server");
    } else {
      throw new Error(error.message || "Đã xảy ra lỗi không mong muốn");
    }
  }
};

// Đơn giản hóa search suggestions - chỉ bài hát và ca sĩ
export const getSearchSuggestions = async (query, limit = 5) => {
  try {
    if (!query || typeof query !== "string") {
      return { data: { suggestions: { songs: [], singers: [] } } };
    }

    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      return { data: { suggestions: { songs: [], singers: [] } } };
    }

    const validLimit = Math.min(Math.max(parseInt(limit) || 5, 1), 10);

    const response = await axiosCustom.get(
      `/api/songs/search-suggestions/?q=${encodeURIComponent(
        trimmedQuery
      )}&limit=${validLimit}`
    );

    // Đảm bảo response có structure đúng
    if (!response.data?.suggestions) {
      return { data: { suggestions: { songs: [], singers: [] } } };
    }

    return response;
  } catch (error) {
    console.error("Search suggestions error:", error);
    // Trả về empty suggestions thay vì throw error
    return { data: { suggestions: { songs: [], singers: [] } } };
  }
};

export const getSongById = async (id) => {
  try {
    if (!id) {
      throw new Error("Song ID is required");
    }
    const response = await axiosCustom.get(`/api/songs/${id}/`);
    return response.data; // <--- TRẢ VỀ DỮ LIỆU TRỰC TIẾP
  } catch (error) {
    handleApiError(error, "Get song by ID");
  }
};

export const createSong = async (songData) => {
  try {
    if (!songData?.song_name?.trim()) {
      throw new Error("Song name is required");
    }
    if (!songData?.singer_name?.trim()) {
      throw new Error("Singer name is required");
    }
    if (!songData?.genre_id) {
      throw new Error("Genre is required");
    }

    const formData = new FormData();
    formData.append("song_name", songData.song_name.trim());
    formData.append("singer_name", songData.singer_name.trim());
    formData.append("genre", songData.genre_id);

    // Add lyrics to formData
    if (songData.lyrics) formData.append("lyrics", songData.lyrics);
    if (songData.audio_file) formData.append("audio_file", songData.audio_file);
    if (songData.image_file) formData.append("image_file", songData.image_file);
    if (songData.video_file) formData.append("video_file", songData.video_file);

    return await axiosCustom.post("/api/songs/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } catch (error) {
    handleApiError(error, "Create song");
  }
};

export const updateSong = async (id, songData, currentUrls) => {
  try {
    if (!id) {
      throw new Error("Song ID is required for update");
    }
    if (!songData?.song_name?.trim()) {
      throw new Error("Song name is required");
    }
    if (!songData?.singer_name?.trim()) {
      throw new Error("Singer name is required");
    }
    if (!songData?.genre_id) {
      throw new Error("Genre is required");
    }

    console.log("Updating song with data:", songData);

    const formData = new FormData();
    formData.append("song_name", songData.song_name.trim());
    formData.append("singer_name", songData.singer_name.trim());
    formData.append("genre", songData.genre_id);

    // Add lyrics to formData
    if (songData.lyrics !== undefined)
      formData.append("lyrics", songData.lyrics);
    if (songData.audio_file) formData.append("audio_file", songData.audio_file);
    else if (currentUrls?.url_audio)
      formData.append("url_audio", currentUrls.url_audio);
    if (songData.image_file) formData.append("image_file", songData.image_file);
    else if (currentUrls?.image) formData.append("image", currentUrls.image);
    if (songData.video_file) formData.append("video_file", songData.video_file);
    else if (currentUrls?.url_video)
      formData.append("url_video", currentUrls.url_video);

    // Log FormData content for debugging
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    return await axiosCustom.put(`/api/songs/${id}/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } catch (error) {
    handleApiError(error, "Update song");
  }
};

export const deleteSong = async (id) => {
  try {
    if (!id) {
      throw new Error("Song ID is required for deletion");
    }
    return await axiosCustom.delete(`/api/songs/${id}/`);
  } catch (error) {
    handleApiError(error, "Delete song");
  }
};

// Get song lyrics with error handling
export const getSongLyrics = async (id) => {
  try {
    if (!id) {
      throw new Error("Song ID is required");
    }
    return await axiosCustom.get(`/api/songs/${id}/lyrics/`);
  } catch (error) {
    handleApiError(error, "Get song lyrics");
  }
};

// Update song lyrics with error handling
export const updateSongLyrics = async (id, lyrics) => {
  try {
    if (!id) {
      throw new Error("Song ID is required");
    }
    return await axiosCustom.patch(`/api/songs/${id}/lyrics/`, { lyrics });
  } catch (error) {
    handleApiError(error, "Update song lyrics");
  }
};

// ==================== RANKING & STATS APIs ====================

// Increment play count when playing music
export const incrementPlayCount = async (songId) => {
  try {
    if (!songId) {
      throw new Error("Song ID is required");
    }
    return await axiosCustom.post(`/api/songs/${songId}/play/`);
  } catch (error) {
    handleApiError(error, "Increment play count");
  }
};

// Get top songs by play count
export const getTopSongs = async (limit = 10, genreId = null) => {
  try {
    const validLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
    let url = `/api/songs/top-songs/?limit=${validLimit}`;
    if (genreId) {
      url += `&genre=${genreId}`;
    }
    return await axiosCustom.get(url);
  } catch (error) {
    handleApiError(error, "Get top songs");
  }
};

// Get trending songs (new with high play count)
export const getTrendingSongs = async (limit = 20) => {
  try {
    const validLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 50);

    const response = await axiosCustom.get(
      `/api/songs/trending/?limit=${validLimit}`
    );

    // Transform response to add rank if not present
    if (response.data && response.data.results) {
      const songsWithRank = response.data.results.map((song, index) => ({
        ...song,
        rank: song.rank || index + 1,
      }));

      return {
        ...response,
        data: {
          ...response.data,
          results: songsWithRank,
        },
      };
    }

    return response;
  } catch (error) {
    handleApiError(error, "Get trending songs");
  }
};

// Get ranking by each genre
export const getGenreRanking = async (limitPerGenre = 5) => {
  try {
    const validLimit = Math.min(Math.max(parseInt(limitPerGenre) || 5, 1), 10);
    return await axiosCustom.get(
      `/api/songs/genre-ranking/?limit=${validLimit}`
    );
  } catch (error) {
    handleApiError(error, "Get genre ranking");
  }
};


// Get general statistics
export const getStats = async () => {
  try {
    return await axiosCustom.get(`/api/songs/stats/`);
  } catch (error) {
    handleApiError(error, "Get statistics");
  }
};

// Get latest songs
export const getLatestSongs = async (limit = 10) => {
  try {
    const validLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
    return await axiosCustom.get(`/api/songs/latest/?limit=${validLimit}`);
  } catch (error) {
    handleApiError(error, "Get latest songs");
  }
};

// Get a list of completely random songs
export const getRandomSongs = async (limit = 10) => {
  try {
    const validLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
    return await axiosCustom.get(`/api/songs/random/?limit=${validLimit}`);
  } catch (error) {
    handleApiError(error, "Get random songs");
  }
};

// Get a daily fixed random mix (for "Daily Mix" playlists)
export const getDailyMixSongs = async (limit = 30) => {
  try {
    const validLimit = Math.min(Math.max(parseInt(limit) || 30, 1), 100);
    return await axiosCustom.get(`/api/songs/daily-mix/?limit=${validLimit}`);
  } catch (error) {
    handleApiError(error, "Get daily mix songs");
  }
};

export const getRelatedSongs = async (songId, limit = 10) => {
  try {
    if (!songId) {
      throw new Error("Song ID is required for related songs API");
    }
    const validLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 50);
    return await axiosCustom.get(`/api/songs/${songId}/related/?limit=${validLimit}`);
  } catch (error) {
    handleApiError(error, "Get related songs");
  }
};