import React, { useState, useRef, useEffect } from "react";
import { 
  IconPlayerPlayFilled, 
  IconPlayerPauseFilled,
  IconTrash
} from "@tabler/icons-react";
import { useTheme } from "../../../context/themeContext";
import { useAudio } from "../../../utils/audioContext";

const Song = ({ song, playlist, deleteSong, songs, index, list }) => {
  const { theme } = useTheme();
  const { setNewPlaylist, currentSong, isPlaying, togglePlayPause } = useAudio();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePlaySong = (e) => {
    if (e) {
      e.stopPropagation(); // Prevent event bubbling
    }
    
    const isCurrentSong = currentSong && currentSong.id === song.id;
    
    if (isCurrentSong) {
      togglePlayPause();
    } else {
      if (list && list.length > 0) {
        setNewPlaylist(list, index);
      }
    }
  };

  const handleDeleteSong = async (e) => {
    e.stopPropagation(); // Prevent triggering play song
    
    if (!deleteSong) return;
    
    // Confirm deletion
    if (!confirm(`Bạn có chắc chắn muốn xóa "${song.song_name}" khỏi playlist?`)) {
      return;
    }
    
    setIsProcessing(true);
    try {
      await deleteSong(song.id);
    } catch (error) {
      console.error("Error deleting song:", error);
      alert("Có lỗi xảy ra khi xóa bài hát!");
    } finally {
      setIsProcessing(false);
    }
  };

  const isCurrentSong = currentSong && currentSong.id === song.id;

  return (
    <div
      className={`group relative grid grid-cols-[16px_1fr_auto] gap-2 sm:gap-4 items-center mx-2 py-3 px-3 rounded-xl transition-all duration-300 cursor-pointer
        ${isCurrentSong 
          ? `bg-gradient-to-r ${theme.colors.songOverlay} border border-${theme.colors.songBorderHover} shadow-lg shadow-${theme.colors.songShadow}` 
          : `hover:bg-${theme.colors.songCardHover} hover:shadow-md hover:shadow-${theme.colors.songShadow} hover:border hover:border-${theme.colors.songBorderHover}`
        }
      `}
      onClick={handlePlaySong}
    >
      {/* Gradient overlay effect */}
      <div className={`absolute inset-0 bg-gradient-to-r ${theme.colors.songOverlay} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none`} />
      
      {/* Content */}
      <div className="relative z-10 contents">
        {/* Index/Play Button */}
        <div className="flex items-center justify-center">
          {isCurrentSong ? (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handlePlaySong(e);
              }}
              className={`p-1 rounded-full bg-${theme.colors.songIndicator} hover:scale-110 transition-all duration-200 shadow-md`}
            >
              {isPlaying ? (
                <IconPlayerPauseFilled className="w-3 h-3 text-black" />
              ) : (
                <IconPlayerPlayFilled className="w-3 h-3 text-black" />
              )}
            </button>
          ) : (
            <div className="relative">
              <span 
                className={`text-sm group-hover:opacity-0 transition-opacity duration-200 text-${theme.colors.songPlayCount} font-medium`}
              >
                {index + 1}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlaySong(e);
                }}
                className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 p-1 rounded-full bg-${theme.colors.songButton} hover:bg-${theme.colors.songButtonHover} hover:scale-110 shadow-md`}
              >
                <IconPlayerPlayFilled className="w-3 h-3 text-black" />
              </button>
            </div>
          )}
        </div>

        {/* Song Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative group/image">
            <img
              src={song.image}
              alt={song.song_name}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl shadow-lg flex-shrink-0 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-${theme.colors.songShadow}`}
              onError={(e) => {
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cpolygon points='10,8 16,12 10,16 10,8'%3E%3C/polygon%3E%3C/svg%3E";
              }}
            />
            {/* Play overlay on image hover */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group/image:opacity-100 transition-opacity duration-200 rounded-xl flex items-center justify-center">
              <IconPlayerPlayFilled className="w-5 h-5 text-white" />
            </div>
          </div>
          
          <div className="min-w-0 flex-1">
            <h4 
              className={`font-bold text-sm sm:text-base truncate transition-colors duration-200 ${
                isCurrentSong 
                  ? `text-${theme.colors.songTextCurrent} drop-shadow-sm` 
                  : `text-${theme.colors.songText} group-hover:text-${theme.colors.songTextHover}`
              }`}
            >
              {song.song_name}
            </h4>
            <p className={`text-xs sm:text-sm truncate transition-colors duration-200 text-${theme.colors.songArtist} group-hover:text-${theme.colors.songArtistHover}`}>
              {song.singer_name}
            </p>
          </div>
        </div>

        {/* Delete Button */}
        <div className="flex items-center">
          {!playlist.is_liked_song && (
            <button
              onClick={handleDeleteSong}
              disabled={isProcessing}
              className={`p-2 rounded-full transition-all duration-200 ${
                isCurrentSong 
                  ? 'opacity-100' 
                  : 'opacity-0 group-hover:opacity-100'
              } text-red-400 hover:text-red-300 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 shadow-sm`}
              title="Xóa khỏi playlist"
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <IconTrash className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Song;