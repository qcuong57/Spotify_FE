import axiosCustom from "../utils/axiosCustom";

export const createPlaylistService = async (formData) => {
  return await axiosCustom.post("/playlists/create/", formData);
};

export const updatePlaylistService = async (id, formData) => {  
  console.log(formData);
  
  return await axiosCustom.put(`/playlists/${id}/update/`, formData);
};

export const deletePlaylistService = async (id) => {
  return await axiosCustom.delete(`/playlists/${id}/delete/`);
};

export const getPlaylistByIdService = async (id, formData) => {
  return await axiosCustom.get(`/playlists/${id}/`, { params: formData });
};

export const getPlaylistService = async (page = 1, size = 10) => {
  return await axiosCustom.get(`playlists/?page=${page}&page_size=${size}`);
};

export const getUserPlaylistByIdService = async (id) => {
  return await axiosCustom.get(`/playlists/${id}/user`);
};

export const searchPlaylistsService = async (query, page = 1, size = 10) => {    
  return await axiosCustom.get(`/playlists/search/?q=${encodeURIComponent(query)}&page=${page}&page_size=${size}`);
};

export const searchAllPlaylistsService = async (query, page = 1, size = 10) => {    
  return await axiosCustom.get(`/playlists/search-all/?q=${encodeURIComponent(query)}&page=${page}&page_size=${size}`);
};