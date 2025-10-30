import axiosCustom from "../utils/axiosCustom";

export const addSongToPlaylistService = async (formData) => {
    return await axiosCustom.post("/song_playlist/create/", formData);
};

export const getSongsFromPlaylistService = async (playlistId) => {    
    return await axiosCustom.get(`/song_playlist/${playlistId}/songs/`);
};

export const searchSongsFromPlaylistService = async (playlistId, query) => {
    return await axiosCustom.get(`/song_playlist/${playlistId}/songs/search/?query=${query}`);
};

export const deleteSongFromPlaylistService = async (playlistId, songId) => {
    return await axiosCustom.delete(`/song_playlist/${playlistId}/songs/${songId}/delete/`);
};

export const viewCreditsService = async (songId) => {
    return await axiosCustom.get(`/song_playlist/${songId}/`);
};

export const goToArtistService = async (userId) => {
    return await axiosCustom.get(`/song_playlist/${userId}/delete/`);
};

// LikedSong-related services với debug logging
export const addToLikedSongsService = async (formData) => {
    try {
        const response = await axiosCustom.post("/song_playlist/liked_songs/add/", formData);
        return response;
    } catch (error) {
        console.error("addToLikedSongsService - Error details:", {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            headers: error.response?.headers,
            config: error.config
        });
        throw error;
    }
};

export const getLikedSongsService = async () => {
    try {
        const response = await axiosCustom.get("/song_playlist/liked_songs/");
        return response;
    } catch (error) {
        console.error("getLikedSongsService - Error:", error.response?.data);
        throw error;
    }
};

export const searchLikedSongsService = async (query) => {
    return await axiosCustom.get(`/song_playlist/liked_songs/search/?query=${query}`);
};

export const removeFromLikedSongsService = async (songId) => {
    try {
        const response = await axiosCustom.delete(`/song_playlist/liked_songs/${songId}/remove/`);
        return response;
    } catch (error) {
        console.error("removeFromLikedSongsService - Error details:", {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
        });
        throw error;
    }
};