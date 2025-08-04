// Enhanced Context Menu Component with improved add to playlist functionality
import React, { useEffect, useState } from "react";
import {
  createPlaylistService,
  getUserPlaylistByIdService,
  searchPlaylistsService,
  getPlaylistByIdService,
} from "../../../services/playlistService";
import { 
  addSongToPlaylistService, 
  addToLikedSongsService 
} from "../../../services/SongPlaylistService";
import { usePlayList } from "../../../utils/playlistContext";
import { IconPlus, IconSearch, IconX, IconCheck, IconMusic } from "@tabler/icons-react";

const EnhancedContextMenu = ({ x, y, deleteSong, song, onClose }) => {
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [showCreatePlaylistForm, setShowCreatePlaylistForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPlaylists, setFilteredPlaylists] = useState([]);
  const [addingToPlaylist, setAddingToPlaylist] = useState(null);
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const { playlists, setPlaylists, setRefreshKeyPlayLists } = usePlayList();

  useEffect(() => {
    // Filter playlists based on search query
    if (searchQuery.trim()) {
      setFilteredPlaylists(
        playlists.filter(playlist =>
          playlist.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredPlaylists(playlists);
    }
  }, [searchQuery, playlists]);

  const addSongToPlaylist = async (playlistId) => {
    setAddingToPlaylist(playlistId);
    try {
      const formData = {
        playlist_id: playlistId,
        song_id: song.id,
        token: localStorage.getItem("access_token"),
      };
      await addSongToPlaylistService(formData);
      setRefreshKeyPlayLists(Date.now());
      
      // Show success feedback
      const playlistName = playlists.find(p => p.id === playlistId)?.title || "playlist";
      alert(`Đã thêm "${song.song_name}" vào "${playlistName}" thành công!`);
      onClose();
    } catch (error) {
      console.error("Error adding song to playlist:", error);
      alert("Có lỗi xảy ra khi thêm bài hát vào playlist. Vui lòng thử lại!");
    } finally {
      setAddingToPlaylist(null);
    }
  };

  const createNewPlaylistAndAddSong = async () => {
    if (!newPlaylistName.trim()) {
      alert("Vui lòng nhập tên playlist!");
      return;
    }

    setIsCreatingPlaylist(true);
    try {
      // Create new playlist
      const playlistData = {
        title: newPlaylistName.trim(),
        description: `Playlist chứa ${song.song_name}`,
        token: localStorage.getItem("access_token"),
      };
      
      const newPlaylistResponse = await createPlaylistService(playlistData);
      const newPlaylistId = newPlaylistResponse.data.id;

      // Add song to the newly created playlist
      await addSongToPlaylist(newPlaylistId);
      
      // Reset form
      setNewPlaylistName("");
      setShowCreatePlaylistForm(false);
      setRefreshKeyPlayLists(Date.now());
      
    } catch (error) {
      console.error("Error creating playlist:", error);
      alert("Có lỗi xảy ra khi tạo playlist mới!");
    } finally {
      setIsCreatingPlaylist(false);
    }
  };

  const addSongLikedSong = async () => {
    try {
      const formData = {
        song_id: song.id,
      };
      await addToLikedSongsService(formData);
      setRefreshKeyPlayLists(Date.now());
      alert(`Đã thêm "${song.song_name}" vào danh sách yêu thích!`);
      onClose();
    } catch (error) {
      alert("Thêm bài hát vào danh sách yêu thích thất bại!");
      console.error("Error adding song to liked songs:", error);
    }
  };

  return (
    <div
      className="context-menu absolute bg-[#242424] rounded-md shadow-lg border border-gray-700 z-50 max-w-[90vw] min-w-[200px]"
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Add to Liked Songs */}
      <button
        className="block w-full text-left px-4 py-3 text-white hover:bg-white/10 text-sm flex items-center gap-2 transition-colors duration-200"
        onClick={addSongLikedSong}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
        </svg>
        Thêm vào Liked Songs
      </button>

      {/* Add to Playlist */}
      <div
        className="relative"
        onMouseEnter={() => setShowPlaylists(true)}
        onMouseLeave={() => setShowPlaylists(false)}
      >
        <button className="block w-full text-left px-4 py-3 text-white hover:bg-white/10 text-sm flex items-center gap-2 transition-colors duration-200">
          <IconPlus className="w-4 h-4" />
          Thêm vào danh sách phát
        </button>
        
        {showPlaylists && (
          <div className="absolute left-full top-0 ml-1 bg-[#242424] rounded-md shadow-lg z-50 w-64 max-w-[90vw] border border-gray-700">
            {/* Search bar */}
            <div className="p-3 border-b border-gray-700">
              <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-md px-3 py-2">
                <IconSearch className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm playlist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-gray-400 hover:text-white"
                  >
                    <IconX className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Create new playlist option */}
            <div className="p-2 border-b border-gray-700">
              {!showCreatePlaylistForm ? (
                <button
                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-white hover:bg-white/10 text-sm rounded transition-colors duration-200"
                  onClick={() => setShowCreatePlaylistForm(true)}
                >
                  <IconPlus className="w-4 h-4" />
                  Tạo playlist mới
                </button>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Tên playlist mới..."
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    className="w-full bg-[#1a1a1a] text-white text-sm px-3 py-2 rounded outline-none placeholder-gray-400"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        createNewPlaylistAndAddSong();
                      } else if (e.key === 'Escape') {
                        setShowCreatePlaylistForm(false);
                        setNewPlaylistName("");
                      }
                    }}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded transition-colors duration-200 disabled:opacity-50"
                      onClick={createNewPlaylistAndAddSong}
                      disabled={isCreatingPlaylist || !newPlaylistName.trim()}
                    >
                      {isCreatingPlaylist ? "Đang tạo..." : "Tạo"}
                    </button>
                    <button
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-sm px-3 py-1 rounded transition-colors duration-200"
                      onClick={() => {
                        setShowCreatePlaylistForm(false);
                        setNewPlaylistName("");
                      }}
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Existing playlists */}
            <div className="max-h-48 overflow-y-auto">
              {filteredPlaylists.length > 0 ? (
                filteredPlaylists.map((playlist) => (
                  <button
                    key={playlist.id}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 text-white hover:bg-white/10 text-sm transition-colors duration-200 disabled:opacity-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      addSongToPlaylist(playlist.id);
                    }}
                    disabled={addingToPlaylist === playlist.id}
                  >
                    {playlist.image ? (
                      <img
                        src={playlist.image}
                        alt={playlist.title}
                        className="w-8 h-8 rounded object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
                        <IconMusic className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{playlist.title}</div>
                      <div className="text-xs text-gray-400">
                        {playlist.song_count || 0} bài hát
                      </div>
                    </div>
                    {addingToPlaylist === playlist.id && (
                      <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-gray-400 text-sm">
                  {searchQuery ? "Không tìm thấy playlist nào" : "Chưa có playlist nào"}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Remove from playlist option (if applicable) */}
      {deleteSong && (
        <button
          className="block w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 text-sm flex items-center gap-2 transition-colors duration-200"
          onClick={deleteSong}
        >
          <IconX className="w-4 h-4" />
          Xóa khỏi danh sách phát
        </button>
      )}
    </div>
  );
};

// Enhanced Add to Playlist Button Component (for use in other places)
const AddToPlaylistButton = ({ song, className = "", children }) => {
  const [showPlaylistSelector, setShowPlaylistSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPlaylists, setFilteredPlaylists] = useState([]);
  const [addingToPlaylist, setAddingToPlaylist] = useState(null);
  const { playlists, setRefreshKeyPlayLists } = usePlayList();

  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredPlaylists(
        playlists.filter(playlist =>
          playlist.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredPlaylists(playlists);
    }
  }, [searchQuery, playlists]);

  const addSongToPlaylist = async (playlistId) => {
    setAddingToPlaylist(playlistId);
    try {
      const formData = {
        playlist_id: playlistId,
        song_id: song.id,
        token: localStorage.getItem("access_token"),
      };
      await addSongToPlaylistService(formData);
      setRefreshKeyPlayLists(Date.now());
      
      const playlistName = playlists.find(p => p.id === playlistId)?.title || "playlist";
      alert(`Đã thêm "${song.song_name}" vào "${playlistName}" thành công!`);
      setShowPlaylistSelector(false);
    } catch (error) {
      console.error("Error adding song to playlist:", error);
      alert("Có lỗi xảy ra khi thêm bài hát vào playlist!");
    } finally {
      setAddingToPlaylist(null);
    }
  };

  return (
    <div className="relative">
      <button
        className={`${className}`}
        onClick={(e) => {
          e.stopPropagation();
          setShowPlaylistSelector(!showPlaylistSelector);
        }}
      >
        {children || (
          <>
            <IconPlus className="w-4 h-4 mr-2" />
            Thêm vào playlist
          </>
        )}
      </button>

      {showPlaylistSelector && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPlaylistSelector(false)}
          />
          
          {/* Playlist selector modal */}
          <div className="absolute right-0 top-full mt-2 w-72 bg-[#242424] rounded-lg shadow-xl border border-gray-700 z-50">
            <div className="p-4">
              <h3 className="text-white font-semibold mb-3">Thêm vào playlist</h3>
              
              {/* Search */}
              <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-md px-3 py-2 mb-3">
                <IconSearch className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm playlist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-400"
                />
              </div>

              {/* Playlists list */}
              <div className="max-h-64 overflow-y-auto space-y-1">
                {filteredPlaylists.map((playlist) => (
                  <button
                    key={playlist.id}
                    className="flex items-center gap-3 w-full text-left p-3 text-white hover:bg-white/10 rounded transition-colors duration-200 disabled:opacity-50"
                    onClick={() => addSongToPlaylist(playlist.id)}
                    disabled={addingToPlaylist === playlist.id}
                  >
                    {playlist.image ? (
                      <img
                        src={playlist.image}
                        alt={playlist.title}
                        className="w-10 h-10 rounded object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-600 rounded flex items-center justify-center">
                        <IconMusic className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{playlist.title}</div>
                      <div className="text-xs text-gray-400">
                        {playlist.song_count || 0} bài hát
                      </div>
                    </div>
                    {addingToPlaylist === playlist.id ? (
                      <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <IconPlus className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                ))}
                
                {filteredPlaylists.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    {searchQuery ? "Không tìm thấy playlist nào" : "Chưa có playlist nào"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export { EnhancedContextMenu as default, AddToPlaylistButton };