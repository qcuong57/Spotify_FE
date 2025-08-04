import React, { useEffect, useState } from "react";
import {
  createPlaylistService,
  getUserPlaylistByIdService,
  searchPlaylistsService,
  getPlaylistByIdService,
} from "../../../services/playlistService";
import { addSongToPlaylistService, addToLikedSongsService } from "../../../services/SongPlaylistService";
import { usePlayList } from "../../../utils/playlistContext";
import { useTheme } from "../../../context/themeContext";

const ContextMenu = ({ x, y, deleteSong, song, onClose }) => {
  const { theme } = useTheme();
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
      className={`context-menu absolute bg-gradient-to-b ${theme.colors.backgroundOverlay} backdrop-blur-md rounded-lg shadow-2xl border border-${theme.colors.border} z-50 max-w-[90vw] overflow-hidden`}
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className={`block w-full text-left px-3 sm:px-4 py-2 text-white hover:bg-${theme.colors.cardHover} text-sm sm:text-base transition-all duration-200 hover:text-${theme.colors.textHover}`}
        onClick={addSongLikedSong}
      >
        Thêm vào Liked Songs
      </button>
      <div
        className="relative"
        onMouseEnter={() => setShowPlaylists(true)}
        onMouseLeave={() => setShowPlaylists(false)}
      >
        <button className={`block w-full text-left px-3 sm:px-4 py-2 text-white hover:bg-${theme.colors.cardHover} text-sm sm:text-base transition-all duration-200 hover:text-${theme.colors.textHover}`}>
          Thêm vào danh sách phát
        </button>
        {showPlaylists && (
          <div className={`absolute left-full top-0 mt-1 bg-gradient-to-b ${theme.colors.backgroundOverlay} backdrop-blur-md rounded-lg shadow-2xl border border-${theme.colors.border} z-50 w-40 sm:w-48 max-w-[90vw] overflow-hidden`}>
            {playlists.length > 0 ? (
              playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  className={`block w-full text-left px-3 sm:px-4 py-2 text-white hover:bg-${theme.colors.cardHover} text-sm sm:text-base transition-all duration-200 hover:text-${theme.colors.textHover} truncate`}
                  onClick={(e) => {
                    e.stopPropagation();
                    addSongToPlaylist(playlist.id);
                  }}
                  title={playlist.title}
                >
                  {playlist.title}
                </button>
              ))
            ) : (
              <div className={`px-3 sm:px-4 py-2 text-${theme.colors.text} text-sm sm:text-base`}>
                No playlists available
              </div>
            )}
          </div>
        )}
      </div>
      {deleteSong && (
        <button
          className={`block w-full text-left px-3 sm:px-4 py-2 text-white hover:bg-red-600/20 hover:text-red-400 text-sm sm:text-base transition-all duration-200 border-t border-${theme.colors.border}`}
          onClick={deleteSong}
        >
          Xóa khỏi danh sách phát
        </button>
      )}
    </div>
  );
};

export default ContextMenu;