import { useEffect, useState, useCallback, useMemo, useRef, memo } from "react";
import { useAudio } from "../../utils/audioContext";
import {
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
  IconTrendingUp,
} from "@tabler/icons-react";
import ContextMenu from "./library/_ContextMenu";
import { incrementPlayCount } from "../../services/SongsService";

// Memoized PlayButton component để tránh re-render icon
const PlayButton = memo(
  ({ isCurrentSong, isPlaying, showPlayButton, onClick }) => {
    const buttonContent = useMemo(() => {
      if (isCurrentSong && isPlaying) {
        return <IconPlayerPauseFilled className="w-6 h-6 text-black" />;
      }
      return <IconPlayerPlayFilled className="w-6 h-6 text-black ml-0.5" />;
    }, [isCurrentSong, isPlaying]);

    return (
      <button
        className={`
        w-12 h-12 bg-green-500 rounded-full flex items-center justify-center
        shadow-lg transition-all duration-200 transform
        hover:scale-105 hover:bg-green-400 active:scale-95
        ${
          showPlayButton
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "translate-y-2 opacity-0 pointer-events-none"
        }
      `}
        onClick={onClick}
        tabIndex={showPlayButton ? 0 : -1}
      >
        {buttonContent}
      </button>
    );
  }
);

// Memoized RankBadge component
const RankBadge = memo(({ rank }) => {
  const badgeClass = useMemo(() => {
    if (rank === 1) return "bg-yellow-500 text-black";
    if (rank === 2) return "bg-gray-300 text-black";
    if (rank === 3) return "bg-amber-600 text-white";
    return "bg-green-600 text-white";
  }, [rank]);

  return (
    <div className="absolute top-2 left-2 z-10">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${badgeClass} shadow-lg`}
      >
        {rank}
      </div>
    </div>
  );
});

// Memoized NowPlayingIndicator component
const NowPlayingIndicator = memo(() => (
  <div className="absolute top-2 right-2">
    <div className="flex space-x-1">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="w-1 h-4 bg-green-500 rounded-full animate-bounce"
          style={{ animationDelay: `${index * 0.1}s` }}
        />
      ))}
    </div>
  </div>
));

// Memoized SongInfo component
const SongInfo = memo(({ song, isCurrentSong, formattedPlayCount }) => (
  <div className="space-y-2">
    <h3
      className={`
        text-base font-semibold line-clamp-2 leading-tight transition-colors duration-200
        ${isCurrentSong ? "text-green-500" : "text-white"}
        group-hover:text-white
      `}
    >
      {song.song_name || "Unknown Title"}
    </h3>
    <p className="text-sm text-gray-400 line-clamp-1 group-hover:text-gray-300 transition-colors duration-200">
      {song.singer_name || "Unknown Artist"}
    </p>

    {/* Play Count */}
    {song.play_count !== undefined && song.play_count > 0 && (
      <div className="flex items-center space-x-1 text-xs text-gray-500">
        <IconTrendingUp className="w-3 h-3" />
        <span>{formattedPlayCount} lượt nghe</span>
      </div>
    )}
  </div>
));

const Song = ({
  song,
  contextMenu,
  setContextMenu,
  handleCloseContextMenu,
  list,
  showRank = false,
  rank,
}) => {
  const {
    setCurrentSong,
    currentSong,
    audio,
    setAudio,
    setIsPlaying,
    isPlaying,
    setNewPlaylist,
  } = useAudio();

  const [isHovered, setIsHovered] = useState(false);
  const [playCountIncremented, setPlayCountIncremented] = useState(false);

  // Sử dụng ref để tránh re-render khi loading
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

  // Optimized play audio function
  const playAudio = useCallback(async () => {
    if (songList.length === 0 || isLoadingRef.current) {
      return;
    }

    const currentIndex = songList.findIndex((s) => s.id === song.id);
    if (currentIndex === -1) {
      return;
    }

    isLoadingRef.current = true;

    try {
      setNewPlaylist(songList, currentIndex);

      // Increment play count asynchronously without blocking
      if (!playCountIncremented) {
        incrementPlayCount(song.id)
          .then(() => {
            setPlayCountIncremented(true);
          })
          .catch((error) => {
            console.error("Error incrementing play count:", error);
          });
      }
    } finally {
      // Clear loading flag immediately to prevent multiple clicks
      setTimeout(() => {
        isLoadingRef.current = false;
      }, 100);
    }
  }, [songList, song.id, playCountIncremented, setNewPlaylist]);

  // Optimized toggle play/pause
  const togglePlayPause = useCallback(
    (e) => {
      e?.stopPropagation();
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

  // Optimized context menu handler
  const handleContextMenu = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        songId: song.id,
      });
    },
    [song.id, setContextMenu]
  );

  // Optimized hover handlers với debounce
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
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 100);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Stable logic for showing play button
  const showPlayButton = useMemo(() => {
    return isHovered || isCurrentSong;
  }, [isHovered, isCurrentSong]);

  return (
    <div
      className="group relative bg-[#181818] hover:bg-[#282828] transition-colors duration-200 p-4 rounded-lg cursor-pointer"
      onClick={playAudio}
      onContextMenu={handleContextMenu}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Rank Badge */}
      {showRank && rank && <RankBadge rank={rank} />}

      {/* Album Art Container */}
      <div className="relative mb-4">
        <div className="relative aspect-square overflow-hidden rounded-lg shadow-lg">
          <img
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            src={song.image}
            alt={song.song_name}
            loading="lazy"
          />

          {/* Simplified Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-200" />

          {/* Play Button */}
          <div className="absolute bottom-2 right-2">
            <PlayButton
              isCurrentSong={isCurrentSong}
              isPlaying={isPlaying}
              showPlayButton={showPlayButton}
              onClick={togglePlayPause}
            />
          </div>

          {/* Now Playing Indicator */}
          {isCurrentSong && isPlaying && <NowPlayingIndicator />}
        </div>
      </div>

      {/* Song Info */}
      <SongInfo
        song={song}
        isCurrentSong={isCurrentSong}
        formattedPlayCount={formattedPlayCount}
      />

      {/* Context Menu */}
      {contextMenu && contextMenu.songId === song.id && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          song={song}
          onClose={handleCloseContextMenu}
        />
      )}
    </div>
  );
};

export default memo(Song);
