import React, { useEffect, useState } from "react";
import {
  createPlaylistService,
  getUserPlaylistByIdService,
  searchPlaylistsService,
  getPlaylistByIdService,
} from "../../../services/playlistService";
import { addSongToPlaylistService, addToLikedSongsService } from "../../../services/SongPlaylistService";
import { usePlayList } from "../../../utils/playlistContext";

const ContextMenu = ({ x, y, deleteSong, song, onClose }) => {
  const [showPlaylists, setShowPlaylists] = useState(false);
  const { playlists, setPlaylists, setRefreshKeyPlayLists } = usePlayList();

  const addSongToPlaylist = async (playlistId) => {
    try {
      console.log("Adding song to playlist:", playlistId, song.id);
      const formData = {
        playlist_id: playlistId,
        song_id: song.id,
        token: localStorage.getItem("access_token"),
      };
      await addSongToPlaylistService(formData);
      setRefreshKeyPlayLists(Date.now());
      alert("Thêm bài hát vào playlist thành công!");
    } catch (error) {
      console.error("Error adding song to playlist:", error);
    }
  };

  const addSongLikedSong = async () => {
    try {
      const formData = {
        song_id: song.id,
      };
      await addToLikedSongsService(formData);
      setRefreshKeyPlayLists(Date.now());
      alert("Thêm bài hát vào danh sách yêu thích thành công!");
    } catch (error) {
      alert("Thêm bài hát vào danh sách yêu thích thất bại!");
      console.error("Error adding song to liked songs:", error);
    }
  };

  return (
    <div
      className="context-menu absolute bg-[#242424] rounded-md shadow-lg border border-gray-700 z-50 max-w-[90vw]"
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="block w-full text-left px-3 sm:px-4 py-2 text-white hover:bg-white/10 text-sm sm:text-base"
        onClick={addSongLikedSong}
      >
        Thêm vào Liked Songs
      </button>
      <div
        className="relative"
        onMouseEnter={() => setShowPlaylists(true)}
        onMouseLeave={() => setShowPlaylists(false)}
      >
        <button className="block w-full text-left px-3 sm:px-4 py-2 text-white hover:bg-white/10 text-sm sm:text-base">
          Thêm vào danh sách phát
        </button>
        {showPlaylists && (
          <div className="absolute left-full top-0 mt-1 bg-[#242424] rounded-md shadow-lg z-50 w-40 sm:w-48 max-w-[90vw]">
            {playlists.length > 0 ? (
              playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  className="block w-full text-left px-3 sm:px-4 py-2 text-white hover:bg-white/10 text-sm sm:text-base"
                  onClick={(e) => {
                    e.stopPropagation();
                    addSongToPlaylist(playlist.id);
                  }}
                >
                  {playlist.title}
                </button>
              ))
            ) : (
              <div className="px-3 sm:px-4 py-2 text-gray-400 text-sm sm:text-base">
                No playlists available
              </div>
            )}
          </div>
        )}
      </div>
      {deleteSong && (
        <button
          className="block w-full text-left px-3 sm:px-4 py-2 text-white hover:bg-white/10 text-sm sm:text-base"
          onClick={deleteSong}
        >
          Xóa khỏi danh sách phát
        </button>
      )}
    </div>
  );
};

export default ContextMenu;