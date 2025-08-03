import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useAudio } from "../../utils/audioContext";
import { useTheme } from "../../context/themeContext";
import {
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
  IconTrendingUp,
} from "@tabler/icons-react";
import { incrementPlayCount } from "../../services/SongsService";

const TrendingSong = ({ song, list, rank }) => {
  const {
    setCurrentSong,
    currentSong,
    setIsPlaying,
    isPlaying,
    setNewPlaylist,
  } = useAudio();
  
  const { theme } = useTheme();

  const [isHovered, setIsHovered] = useState(false);
  const [playCountIncremented, setPlayCountIncremented] = useState(false);

  // Sử dụng ref để tránh re-render không cần thiết
  const isLoadingRef = useRef(false);
  const hoverTimeoutRef = useRef(null);

  // Memoized check if this song is currently playing
  const isCurrentSong = useMemo(
    () => currentSong?.id === song.id,
    [currentSong?.id, song.id]
  );

  // Memoized song list processing
  const songList = useMemo(() => {
    return Array.isArray(list) ? list : list?.songs || [];
  }, [list]);

  // Optimized play audio function
  const playAudio = useCallback(async () => {
    if (songList.length === 0 || isLoadingRef.current) {
      console.warn("No songs available or already loading");
      return;
    }

    const currentIndex = songList.findIndex((s) => s.id === song.id);
    if (currentIndex === -1) {
      console.warn("Song not found in the list");
      return;
    }

    isLoadingRef.current = true;

    try {
      setNewPlaylist(songList, currentIndex);

      if (!playCountIncremented) {
        try {
          await incrementPlayCount(song.id);
          setPlayCountIncremented(true);
          console.log(`Play count incremented for song: ${song.song_name}`);
        } catch (error) {
          console.error("Error incrementing play count:", error);
        }
      }
    } finally {
      setTimeout(() => {
        isLoadingRef.current = false;
      }, 150);
    }
  }, [songList, song.id, song.song_name, playCountIncremented, setNewPlaylist]);

  // Optimized toggle play/pause
  const togglePlayPause = useCallback(
    (e) => {
      e.stopPropagation();
      if (isLoadingRef.current) return;

      if (isCurrentSong && isPlaying) {
        setIsPlaying(false);
      } else {
        playAudio();
      }
    },
    [isCurrentSong, isPlaying, setIsPlaying, playAudio]
  );

  // Reset play count increment flag when song changes
  useEffect(() => {
    if (!isCurrentSong) {
      setPlayCountIncremented(false);
    }
  }, [isCurrentSong]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Optimized hover handlers với smooth transition
  const handleMouseEnter = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    // Delay nhẹ để tránh flicker khi di chuyển chuột nhanh
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 100);
  }, []);

  // Memoized format play count function
  const formattedPlayCount = useMemo(() => {
    const count = song.play_count;
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + "M";
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + "K";
    }
    return count?.toString() || "0";
  }, [song.play_count]);

  // Memoized rank styling với theme support
  const rankStyle = useMemo(() => {
    if (rank <= 3) {
      return rank === 1
        ? "text-yellow-400 drop-shadow-sm"
        : rank === 2
        ? "text-gray-300 drop-shadow-sm"
        : "text-amber-600 drop-shadow-sm";
    }
    return isCurrentSong ? `text-${theme.colors.songTextCurrent}` : "text-gray-400";
  }, [rank, isCurrentSong, theme.colors.songTextCurrent]);

  // Memoized play count styling với theme support - UPDATED
  const playCountStyle = useMemo(() => {
    if (isCurrentSong) {
      return `text-${theme.colors.songTextCurrent}`;
    }
    if (isHovered) {
      return `text-${theme.colors.songPlayCountHover}`;
    }
    return `text-${theme.colors.songPlayCount}`;
  }, [isHovered, isCurrentSong, theme.colors.songPlayCount, theme.colors.songPlayCountHover, theme.colors.songTextCurrent]);

  // Memoized song info styling với theme support - UPDATED
  const songInfoStyle = useMemo(() => {
    const titleClass = isCurrentSong
      ? `text-${theme.colors.songTextCurrent} drop-shadow-sm`
      : isHovered
      ? `text-${theme.colors.songTextHover} transform translate-x-1`
      : `text-${theme.colors.songText} group-hover:text-${theme.colors.songTextHover}`;

    // UPDATED: Singer name giờ sẽ cùng màu với theme khi hover và current
    const artistClass = isCurrentSong
      ? `text-${theme.colors.songTextCurrent}/80`
      : isHovered
      ? `text-${theme.colors.songArtistHover} transform translate-x-1`
      : `text-${theme.colors.songArtist} group-hover:text-${theme.colors.songArtistHover}`;

    return { titleClass, artistClass };
  }, [
    isCurrentSong,
    isHovered,
    theme.colors.songTextCurrent,
    theme.colors.songText,
    theme.colors.songTextHover,
    theme.colors.songArtist,
    theme.colors.songArtistHover,
  ]);

  // Memoized card styling với theme support
  const cardStyle = useMemo(() => {
    if (isCurrentSong) {
      return `bg-${theme.colors.songCardHover} border border-${theme.colors.songBorderHover} shadow-lg shadow-${theme.colors.songShadowHover}`;
    }
    if (isHovered) {
      return `bg-${theme.colors.songCardHover} shadow-xl shadow-${theme.colors.songShadowHover} scale-[1.02]`;
    }
    return `hover:bg-${theme.colors.songCard}`;
  }, [
    isCurrentSong,
    isHovered,
    theme.colors.songCard,
    theme.colors.songCardHover,
    theme.colors.songBorderHover,
    theme.colors.songShadowHover,
  ]);

  // Memoized button content
  const buttonContent = useMemo(() => {
    if (isCurrentSong && isPlaying) {
      return <IconPlayerPauseFilled className="w-4 h-4 text-black" />;
    }
    return <IconPlayerPlayFilled className="w-4 h-4 text-black ml-0.5" />;
  }, [isCurrentSong, isPlaying]);

  // Determine if should show play button
  const showPlayButton = isHovered || isCurrentSong;

  return (
    <div
      className={`
        group relative flex items-center gap-4 p-3 rounded-lg cursor-pointer
        transition-all duration-500 ease-out transform
        ${cardStyle}
        ${isHovered ? "backdrop-blur-sm" : ""}
      `}
      onClick={playAudio}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Rank Number / Play Button */}
      <div className="flex-shrink-0 w-8 text-center">
        <div className="relative">
          {/* Rank Number */}
          <span
            className={`
              text-lg font-bold transition-all duration-300 ease-out
              ${rankStyle}
              ${showPlayButton ? "opacity-0 scale-75" : "opacity-100 scale-100"}
              absolute inset-0 flex items-center justify-center
            `}
          >
            {rank}
          </span>

          {/* Play Button với theme color */}
          <button
            className={`
              w-8 h-8 flex items-center justify-center rounded-full 
              bg-${theme.colors.songButton} hover:bg-${theme.colors.songButtonHover}
              transition-all duration-300 ease-out transform
              hover:scale-110 active:scale-95
              shadow-lg shadow-${theme.colors.songShadow}
              ${showPlayButton ? "opacity-100 scale-100" : "opacity-0 scale-75"}
            `}
            onClick={togglePlayPause}
            style={{ pointerEvents: showPlayButton ? "auto" : "none" }}
          >
            <div className={`text-${theme.colors.songButtonText}`}>
              {buttonContent}
            </div>
          </button>
        </div>
      </div>

      {/* Album Art */}
      <div className="flex-shrink-0 relative">
        <div className={`w-12 h-12 overflow-hidden rounded-md shadow-md transition-all duration-300 group-hover:shadow-lg border border-${theme.colors.songBorder}`}>
          <img
            className="w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-110 group-hover:brightness-110"
            src={song.image}
            alt={song.song_name}
            loading="lazy"
          />

          {/* Hover overlay với theme overlay */}
          <div
            className={`
            absolute inset-0 transition-opacity duration-300
            ${isHovered ? `bg-gradient-to-br ${theme.colors.songOverlay} opacity-50` : "opacity-0"}
          `}
          />
        </div>

        {/* Now Playing Indicator với theme color */}
        {isCurrentSong && isPlaying && (
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 bg-${theme.colors.songIndicator} rounded-full flex items-center justify-center shadow-lg animate-pulse`}>
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        )}

        {/* Trending Badge */}
        {rank <= 3 && (
          <div
            className={`
            absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center
            transition-all duration-300 shadow-lg
            ${
              rank === 1
                ? "bg-yellow-500"
                : rank === 2
                ? "bg-gray-400"
                : "bg-amber-600"
            }
            ${isHovered ? "scale-110 shadow-xl" : "scale-100"}
          `}
          >
            <IconTrendingUp className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      {/* Song Info với theme colors - UPDATED */}
      <div className="flex-1 min-w-0">
        <h3
          className={`
            text-sm font-medium truncate transition-all duration-300 ease-out
            ${songInfoStyle.titleClass}
          `}
        >
          {song.song_name || "Unknown Title"}
        </h3>
        <p
          className={`
          text-xs truncate transition-all duration-300 ease-out
          ${songInfoStyle.artistClass}
        `}
        >
          {song.singer_name || "Unknown Artist"}
        </p>
      </div>

      {/* Play Count với theme colors - UPDATED */}
      <div
        className={`
        hidden md:flex flex-shrink-0 items-center gap-1 text-xs min-w-0
        transition-all duration-300 ease-out
        ${isHovered ? "scale-105" : ""}
      `}
      >
        <IconTrendingUp className={`w-3 h-3 flex-shrink-0 transition-colors duration-300 ${playCountStyle}`} />
        <span className={`truncate font-medium transition-colors duration-300 ${playCountStyle}`}>
          {formattedPlayCount}
        </span>
      </div>

      {/* Premium Glow Effect với theme gradient */}
      {rank <= 5 && isHovered && (
        <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${theme.colors.songOverlay} pointer-events-none animate-pulse`}></div>
      )}

      {/* Subtle border animation for top songs với theme colors */}
      {rank <= 3 && isHovered && (
        <div
          className={`
          absolute inset-0 rounded-lg pointer-events-none
          border transition-all duration-300
          border-${theme.colors.songRing}
        `}
        ></div>
      )}
    </div>
  );
};

export default TrendingSong;