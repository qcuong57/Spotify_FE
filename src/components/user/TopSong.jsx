import { 
  useEffect, 
  useState, 
  useCallback, 
  useMemo, 
  useRef, 
  memo 
} from "react";
import { useAudio } from "../../utils/audioContext";
import { useTheme } from "../../context/themeContext";
import {
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
  IconTrendingUp,
  IconMedal,
} from "@tabler/icons-react";
import { incrementPlayCount } from "../../services/SongsService";

// PlayButton component
const PlayButton = memo(({ isCurrentSong, isPlaying, showPlayButton, onClick, theme }) => {
  const buttonContent = useMemo(() => {
    if (isCurrentSong && isPlaying) {
      return <IconPlayerPauseFilled className="w-5 h-5" />;
    }
    return <IconPlayerPlayFilled className="w-5 h-5 ml-0.5" />;
  }, [isCurrentSong, isPlaying]);

  const buttonClass = useMemo(() => `
    w-10 h-10 flex items-center justify-center rounded-full 
    bg-${theme.colors.songButton} hover:bg-${theme.colors.songButtonHover}
    text-${theme.colors.songButtonText}
    shadow-lg transition-all duration-200 transform
    hover:scale-110 active:scale-95
    ${showPlayButton ? "opacity-100 scale-100" : "opacity-0 scale-75"}
  `.replace(/\s+/g, ' ').trim(), [showPlayButton, theme]);

  return (
    <button
      className={buttonClass}
      onClick={onClick}
      style={{ 
        pointerEvents: showPlayButton ? "auto" : "none",
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {buttonContent}
    </button>
  );
});

// Rank Badge component
const RankBadge = memo(({ rank, showPlayButton, isCurrentSong, theme }) => {
  const getBadgeColor = () => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-amber-600 to-amber-800';
    return 'from-gray-600 to-gray-800';
  };

  const rankClass = useMemo(() => {
    const transitionClass = showPlayButton 
      ? "opacity-0 scale-75" 
      : "opacity-100 scale-100";

    return `
      absolute inset-0 flex flex-col items-center justify-center rounded-full
      bg-gradient-to-br ${getBadgeColor()} shadow-lg 
      transition-all duration-200 ease-out
      ${transitionClass}
    `.replace(/\s+/g, ' ').trim();
  }, [rank, showPlayButton]);

  return (
    <div className={rankClass}>
      {rank <= 3 ? (
        <>
          <IconMedal className="w-7 h-7 text-white" />
          <span className="text-white font-bold text-xs mt-0.5">#{rank}</span>
        </>
      ) : (
        <span className="text-white font-bold text-lg">{rank}</span>
      )}
    </div>
  );
});

// Album Art component
const AlbumArt = memo(({ song, isCurrentSong, isPlaying, rank, theme }) => {
  return (
    <div className="flex-shrink-0 relative">
      <div className={`w-16 h-16 overflow-hidden rounded-lg shadow-lg border border-${theme.colors.songBorder}`}>
        <img
          className="w-full h-full object-cover"
          src={song.image}
          alt={song.song_name}
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Now Playing Indicator */}
      {isCurrentSong && isPlaying && (
        <div className={`absolute -bottom-1 -right-1 w-5 h-5 bg-${theme.colors.songIndicator} rounded-full flex items-center justify-center shadow-lg animate-pulse`}>
          <div className="w-2.5 h-2.5 bg-white rounded-full" />
        </div>
      )}

      {/* Trending Badge for top 3 */}
      {rank <= 3 && (
        <div
          className={`
            absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-lg
            ${rank === 1 ? "bg-yellow-500" : rank === 2 ? "bg-gray-400" : "bg-amber-600"}
          `}
        >
          <IconTrendingUp className="w-3.5 h-3.5 text-white" />
        </div>
      )}
    </div>
  );
});

// Song Info component
const SongInfo = memo(({ song, isCurrentSong, isHovered, theme }) => {
  const titleClass = useMemo(() => {
    if (isCurrentSong) {
      return `text-base font-semibold truncate text-${theme.colors.songTextCurrent}`;
    }
    if (isHovered) {
      return `text-base font-semibold truncate text-${theme.colors.songTextHover}`;
    }
    return `text-base font-semibold truncate text-${theme.colors.songText}`;
  }, [isCurrentSong, isHovered, theme]);

  const artistClass = useMemo(() => {
    if (isCurrentSong) {
      return `text-sm truncate text-${theme.colors.songTextCurrent}/80`;
    }
    if (isHovered) {
      return `text-sm truncate text-${theme.colors.songArtistHover}`;
    }
    return `text-sm truncate text-${theme.colors.songArtist}`;
  }, [isCurrentSong, isHovered, theme]);

  return (
    <div className="flex-1 min-w-0">
      <h3 className={titleClass}>
        {song.song_name || "Unknown Title"}
      </h3>
      <p className={artistClass}>
        {song.singer_name || "Unknown Artist"}
      </p>
    </div>
  );
});

// Play Count component
const PlayCount = memo(({ song, isHovered, isCurrentSong, theme }) => {
  const formattedPlayCount = useMemo(() => {
    const count = song.play_count;
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + "M";
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + "K";
    }
    return count?.toString() || "0";
  }, [song.play_count]);

  const playCountClass = useMemo(() => {
    let colorClass;
    if (isCurrentSong) {
      colorClass = `text-${theme.colors.songTextCurrent}`;
    } else if (isHovered) {
      colorClass = `text-${theme.colors.songPlayCountHover}`;
    } else {
      colorClass = `text-${theme.colors.songPlayCount}`;
    }

    return `flex flex-shrink-0 items-center gap-2 text-sm min-w-0 ${colorClass} font-medium`;
  }, [isHovered, isCurrentSong, theme]);

  return (
    <div className={playCountClass}>
      <IconTrendingUp className="w-4 h-4 flex-shrink-0" />
      <span className="truncate">
        {formattedPlayCount}
      </span>
      <span className="hidden md:inline text-xs opacity-70">plays</span>
    </div>
  );
});

// Main TopSong Component
const TopSong = ({ song, list, rank }) => {
  const {
    setCurrentSong,
    currentSong,
    setIsPlaying,
    isPlaying,
    setNewPlaylist,
  } = useAudio();
  
  const { theme } = useTheme();

  // Minimal state management
  const [isHovered, setIsHovered] = useState(false);
  const [playCountIncremented, setPlayCountIncremented] = useState(false);
  const isLoadingRef = useRef(false);

  // Memoized calculations
  const isCurrentSong = useMemo(
    () => currentSong?.id === song.id,
    [currentSong?.id, song.id]
  );

  const songList = useMemo(() => {
    return Array.isArray(list) ? list : list?.songs || [];
  }, [list]);

  const showPlayButton = useMemo(() => {
    return isHovered || isCurrentSong;
  }, [isHovered, isCurrentSong]);

  // Optimized play audio function
  const playAudio = useCallback(async () => {
    if (songList.length === 0 || isLoadingRef.current) return;

    const currentIndex = songList.findIndex((s) => s.id === song.id);
    if (currentIndex === -1) return;

    isLoadingRef.current = true;

    try {
      setNewPlaylist(songList, currentIndex);

      if (!playCountIncremented) {
        incrementPlayCount(song.id)
          .then(() => setPlayCountIncremented(true))
          .catch((error) => console.error("Error incrementing play count:", error));
      }
    } finally {
      setTimeout(() => {
        isLoadingRef.current = false;
      }, 100);
    }
  }, [songList, song.id, playCountIncremented, setNewPlaylist]);

  const togglePlayPause = useCallback((e) => {
    e?.stopPropagation();
    if (isLoadingRef.current) return;

    if (isCurrentSong && isPlaying) {
      setIsPlaying(false);
    } else {
      playAudio();
    }
  }, [isCurrentSong, isPlaying, setIsPlaying, playAudio]);

  // Reset play count increment when song changes
  useEffect(() => {
    if (!isCurrentSong) {
      setPlayCountIncremented(false);
    }
  }, [isCurrentSong]);

  // Simple hover handlers
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // Card styling with theme support
  const cardClass = useMemo(() => {
    const baseClass = "group relative flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200";
    
    if (isCurrentSong) {
      return `${baseClass} bg-${theme.colors.songCardHover} border-2 border-${theme.colors.songBorderHover} shadow-lg`;
    }
    if (isHovered) {
      return `${baseClass} bg-${theme.colors.songCardHover} shadow-md`;
    }
    return `${baseClass} hover:bg-${theme.colors.songCard} border-2 border-transparent`;
  }, [isCurrentSong, isHovered, theme]);

  return (
    <div
      className={cardClass}
      onClick={playAudio}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Rank Badge / Play Button */}
      <div className="flex-shrink-0 w-14 h-14">
        <div className="relative w-full h-full">
          <RankBadge 
            rank={rank} 
            showPlayButton={showPlayButton}
            isCurrentSong={isCurrentSong}
            theme={theme} 
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <PlayButton
              isCurrentSong={isCurrentSong}
              isPlaying={isPlaying}
              showPlayButton={showPlayButton}
              onClick={togglePlayPause}
              theme={theme}
            />
          </div>
        </div>
      </div>

      {/* Album Art */}
      <AlbumArt
        song={song}
        isCurrentSong={isCurrentSong}
        isPlaying={isPlaying}
        rank={rank}
        theme={theme}
      />

      {/* Song Info */}
      <SongInfo
        song={song}
        isCurrentSong={isCurrentSong}
        isHovered={isHovered}
        theme={theme}
      />

      {/* Play Count */}
      <PlayCount
        song={song}
        isHovered={isHovered}
        isCurrentSong={isCurrentSong}
        theme={theme}
      />
    </div>
  );
};

export default memo(TopSong);