import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useAudio } from "../../utils/audioContext";
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

  // Memoized rank styling
  const rankStyle = useMemo(() => {
    if (rank <= 3) {
      return rank === 1
        ? "text-yellow-400 drop-shadow-sm"
        : rank === 2
        ? "text-gray-300 drop-shadow-sm"
        : "text-amber-600 drop-shadow-sm";
    }
    return isCurrentSong ? "text-green-500" : "text-gray-400";
  }, [rank, isCurrentSong]);

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
        ${
          isCurrentSong
            ? "bg-green-500/10 border border-green-500/20 shadow-lg shadow-green-500/10"
            : isHovered
            ? "bg-white/8 shadow-xl shadow-black/20 scale-[1.02]"
            : "hover:bg-white/5"
        }
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

          {/* Play Button */}
          <button
            className={`
              w-8 h-8 flex items-center justify-center rounded-full 
              bg-green-500 hover:bg-green-400 
              transition-all duration-300 ease-out transform
              hover:scale-110 active:scale-95
              shadow-lg shadow-green-500/30
              ${showPlayButton ? "opacity-100 scale-100" : "opacity-0 scale-75"}
            `}
            onClick={togglePlayPause}
            style={{ pointerEvents: showPlayButton ? "auto" : "none" }}
          >
            {buttonContent}
          </button>
        </div>
      </div>

      {/* Album Art */}
      <div className="flex-shrink-0 relative">
        <div className="w-12 h-12 overflow-hidden rounded-md shadow-md transition-all duration-300 group-hover:shadow-lg">
          <img
            className="w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-110 group-hover:brightness-110"
            src={song.image}
            alt={song.song_name}
            loading="lazy"
          />

          {/* Hover overlay */}
          <div
            className={`
            absolute inset-0 bg-black transition-opacity duration-300
            ${isHovered ? "bg-opacity-10" : "bg-opacity-0"}
          `}
          />
        </div>

        {/* Now Playing Indicator */}
        {isCurrentSong && isPlaying && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
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

      {/* Song Info */}
      <div className="flex-1 min-w-0">
        <h3
          className={`
            text-sm font-medium truncate transition-all duration-300 ease-out
            ${
              isCurrentSong
                ? "text-green-500 drop-shadow-sm"
                : isHovered
                ? "text-white transform translate-x-1"
                : "text-gray-200 group-hover:text-white"
            }
          `}
        >
          {song.song_name || "Unknown Title"}
        </h3>
        <p
          className={`
          text-xs truncate transition-all duration-300 ease-out
          ${
            isHovered
              ? "text-gray-300 transform translate-x-1"
              : "text-gray-400 group-hover:text-gray-300"
          }
        `}
        >
          {song.singer_name || "Unknown Artist"}
        </p>
      </div>

      {/* Play Count */}
      <div
        className={`
        hidden md:flex flex-shrink-0 items-center gap-1 text-xs min-w-0
        transition-all duration-300 ease-out
        ${isHovered ? "text-emerald-300 scale-105" : "text-teal-400"}
      `}
      >
        <IconTrendingUp className="w-3 h-3 flex-shrink-0" />
        <span className="truncate">{formattedPlayCount}</span>
      </div>

      {/* Premium Glow Effect */}
      {rank <= 5 && isHovered && (
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-orange-500/5 via-pink-500/5 to-purple-500/5 pointer-events-none animate-pulse"></div>
      )}

      {/* Subtle border animation for top songs */}
      {rank <= 3 && isHovered && (
        <div
          className={`
          absolute inset-0 rounded-lg pointer-events-none
          border transition-all duration-300
          ${
            rank === 1
              ? "border-yellow-400/30"
              : rank === 2
              ? "border-gray-300/30"
              : "border-amber-600/30"
          }
        `}
        ></div>
      )}
    </div>
  );
};

export default TrendingSong;