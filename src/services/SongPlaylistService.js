import axiosCustom from "../utils/axiosCustom";

export const addSongToPlaylistService = async (formData) => {    
    console.log("addSongToPlaylistService - formData:", formData);
    return await axiosCustom.post("/song_playlist/create/", formData);
};

export const getSongsFromPlaylistService = async (playlistId) => {    
    console.log("getSongsFromPlaylistService - playlistId:", playlistId);
    return await axiosCustom.get(`/song_playlist/${playlistId}/songs/`);
};

export const searchSongsFromPlaylistService = async (playlistId, query) => {
    console.log("searchSongsFromPlaylistService - playlistId:", playlistId, "query:", query);
    return await axiosCustom.get(`/song_playlist/${playlistId}/songs/search/?query=${query}`);
};

export const deleteSongFromPlaylistService = async (playlistId, songId) => {
    console.log("deleteSongFromPlaylistService - playlistId:", playlistId, "songId:", songId);
    return await axiosCustom.delete(`/song_playlist/${playlistId}/songs/${songId}/delete/`);
};

export const viewCreditsService = async (songId) => {
    console.log("viewCreditsService - songId:", songId);
    return await axiosCustom.get(`/song_playlist/${songId}/`);
};

export const goToArtistService = async (userId) => {
    console.log("goToArtistService - userId:", userId);
    return await axiosCustom.get(`/song_playlist/${userId}/delete/`);
};

// LikedSong-related services với debug logging
export const addToLikedSongsService = async (formData) => {
    console.log("addToLikedSongsService - Request data:", formData);
    console.log("addToLikedSongsService - Request type:", typeof formData);
    console.log("addToLikedSongsService - Is FormData:", formData instanceof FormData);
    
    try {
        const response = await axiosCustom.post("/song_playlist/liked_songs/add/", formData);
        console.log("addToLikedSongsService - Success response:", response.data);
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
    console.log("getLikedSongsService - Getting liked songs");
    try {
        const response = await axiosCustom.get("/song_playlist/liked_songs/");
        console.log("getLikedSongsService - Success:", response.data);
        return response;
    } catch (error) {
        console.error("getLikedSongsService - Error:", error.response?.data);
        throw error;
    }
};

export const searchLikedSongsService = async (query) => {
    console.log("searchLikedSongsService - query:", query);
    return await axiosCustom.get(`/song_playlist/liked_songs/search/?query=${query}`);
};

export const removeFromLikedSongsService = async (songId) => {
    console.log("removeFromLikedSongsService - songId:", songId);
    try {
        const response = await axiosCustom.delete(`/song_playlist/liked_songs/${songId}/remove/`);
        console.log("removeFromLikedSongsService - Success:", response.data);
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