import React, { useEffect, useState } from "react";
import { getSongsFromPlaylistService } from "../../../services/SongPlaylistService.js";
import { IconCircleDashedCheck } from "@tabler/icons-react";
import { useTheme } from "../../../context/themeContext";

const SearchedSong = ({ song, playlist, addSongToPlaylist, songs }) => {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Kiểm tra xem bài hát có trong danh sách songs hiện tại không
    if (songs && songs.length > 0) {
      setVisible(songs.some((s) => s.id === song.id));
    } else {
      // Fallback: fetch từ server nếu cần
      const fetchSongs = async () => {
        if (!playlist || !playlist.id) return;
        try {
          const response = await getSongsFromPlaylistService(playlist.id);
          setVisible(response.data.songs.some((s) => s.id === song.id));
        } catch (error) {
          console.error("Error fetching songs:", error);
        }
      };
      fetchSongs();
    }
  }, [playlist, song.id, songs]);

  const handleAddSong = async () => {
    await addSongToPlaylist(song.id);
    setVisible(true); // Cập nhật UI ngay lập tức
  };

  return (
    <div
      className={`flex flex-row items-center mx-6 mt-4 p-3 rounded-lg bg-${theme.colors.card} hover:bg-${theme.colors.cardHover} transition-all duration-200 border border-${theme.colors.border} hover:border-${theme.colors.primary}-500/30`}
    >
      <img
        src={song.image}
        alt="Song Cover"
        className="w-12 h-12 rounded-lg shadow-md"
      />
      <div className="flex flex-col ml-3 flex-1">
        <span className={`text-white font-bold hover:text-${theme.colors.textHover} transition-colors`}>
          {song.song_name}
        </span>
        <span className={`text-sm text-${theme.colors.text}`}>
          {song.singer_name}
        </span>
      </div>
      {visible ? (
        <IconCircleDashedCheck
          className={`ml-auto text-${theme.colors.primary}-500`}
          size={24}
        />
      ) : (
        <button
          onClick={handleAddSong}
          className={`ml-auto px-4 py-2 rounded-full border border-${theme.colors.border} bg-${theme.colors.button} hover:bg-${theme.colors.buttonHover} text-${theme.colors.buttonText} text-sm transition-all duration-200 hover:scale-105 shadow-md font-medium`}
        >
          Thêm
        </button>
      )}
    </div>
  );
};

export default SearchedSong;