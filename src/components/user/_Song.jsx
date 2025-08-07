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
} from "@tabler/icons-react";
import ContextMenu from "./library/_ContextMenu";
import { incrementPlayCount } from "../../services/SongsService";

// Performance-optimized PlayButton with minimal re-renders
const PlayButton = memo(({ isCurrentSong, isPlaying, showPlayButton, onClick, theme }) => {
  const buttonRef = useRef();
  
  // Memoize button content to prevent unnecessary renders
  const buttonContent = useMemo(() => {
    if (isCurrentSong && isPlaying) {
      return <IconPlayerPauseFilled className="w-5 h-5 text-white drop-shadow-lg" />;
    }
    return <IconPlayerPlayFilled className="w-5 h-5 text-white ml-0.5 drop-shadow-lg" />;
  }, [isCurrentSong, isPlaying]);

  // Optimized button styles using CSS variables
  const buttonStyle = useMemo(() => ({
    '--gradient-normal': theme.colors.rgb.buttonGradient.normal,
    '--gradient-hover': theme.colors.rgb.buttonGradient.hover,
    background: `linear-gradient(135deg, var(--gradient-normal))`,
    transition: 'all 0.2s ease-out',
  }), [theme]);

  // Use CSS hover instead of JS hover for better performance
  const buttonClass = useMemo(() => `
    w-11 h-11 rounded-full flex items-center justify-center
    shadow-lg transition-all duration-200 transform backdrop-blur-sm
    hover:scale-105 active:scale-95
    hover:bg-gradient-to-r
    ${showPlayButton 
      ? "translate-y-0 opacity-100 pointer-events-auto" 
      : "translate-y-3 opacity-0 pointer-events-none"
    }
  `, [showPlayButton]);

  return (
    <button
      ref={buttonRef}
      className={buttonClass}
      style={buttonStyle}
      onClick={onClick}
      tabIndex={showPlayButton ? 0 : -1}
    >
      {buttonContent}
    </button>
  );
});

// Optimized RankBadge with CSS custom properties
const RankBadge = memo(({ rank, theme }) => {
  const badgeStyle = useMemo(() => {
    let gradient;
    if (rank === 1) gradient = theme.colors.rankGold;
    else if (rank === 2) gradient = theme.colors.rankSilver;
    else if (rank === 3) gradient = theme.colors.rankBronze;
    else gradient = theme.colors.rankDefault;

    return {
      background: `linear-gradient(135deg, ${gradient})`,
      willChange: 'transform',
    };
  }, [rank, theme]);

  return (
    <div className="absolute top-3 left-3 z-20">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg border border-white/20 backdrop-blur-sm"
        style={badgeStyle}
      >
        {rank}
      </div>
    </div>
  );
});

// Highly optimized NowPlayingIndicator using CSS animations
const NowPlayingIndicator = memo(({ theme }) => {
  const barStyle = useMemo(() => ({
    '--bar-color': theme.colors.rgb.buttonGradient.normal,
    background: `linear-gradient(to top, var(--bar-color))`,
  }), [theme]);

  return (
    <div className="absolute top-3 right-3 z-20">
      <div className="flex space-x-1">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="w-1 h-4 rounded-full shadow-sm animate-bounce"
            style={{
              ...barStyle,
              animationDelay: `${index * 0.15}s`,
              animationDuration: '1s',
            }}
          />
        ))}
      </div>
    </div>
  );
});

// Performance-optimized SongInfo with minimal DOM updates
const SongInfo = memo(({ song, isCurrentSong, formattedPlayCount, isHovered, theme }) => {
  // Pre-calculate all class names to avoid runtime concatenation
  const titleClass = useMemo(() => {
    const baseClasses = ['text-base', 'font-bold', 'line-clamp-2', 'leading-tight', 'transition-all', 'duration-200'];
    
    if (isCurrentSong) {
      baseClasses.push(`text-${theme.colors.songTextCurrent}`, 'drop-shadow-sm');
    } else {
      baseClasses.push(`text-${theme.colors.songText}`);
    }
    
    if (isHovered) {
      baseClasses.push(`text-${theme.colors.songTextHover}`, 'transform', 'translate-y-[-1px]', 'drop-shadow-md');
    }
    
    return baseClasses.join(' ');
  }, [isCurrentSong, isHovered, theme]);

  const artistClass = useMemo(() => {
    const baseClasses = ['text-sm', 'line-clamp-1', 'transition-all', 'duration-200', 'font-medium'];
    
    if (isCurrentSong) {
      baseClasses.push(`text-${theme.colors.songArtist}`);
    } else {
      baseClasses.push(`text-${theme.colors.songArtist}/90`);
    }
    
    if (isHovered) {
      baseClasses.push(`text-${theme.colors.songArtistHover}`, 'transform', 'translate-y-[-1px]');
    }
    
    return baseClasses.join(' ');
  }, [isCurrentSong, isHovered, theme]);

  const playCountClass = useMemo(() => {
    const baseClasses = ['flex', 'items-center', 'space-x-1', 'text-xs', 'transition-all', 'duration-200', 'font-medium'];
    
    if (isCurrentSong) {
      baseClasses.push(`text-${theme.colors.songPlayCount}`);
    } else {
      baseClasses.push(`text-${theme.colors.songPlayCount}/80`);
    }
    
    if (isHovered) {
      baseClasses.push(`text-${theme.colors.songPlayCountHover}`, 'transform', 'translate-y-[-1px]');
    }
    
    return baseClasses.join(' ');
  }, [isCurrentSong, isHovered, theme]);

  return (
    <div className="space-y-2 relative z-10">
      <h3 className={titleClass}>
        {song.song_name || "Unknown Title"}
      </h3>
      
      <p className={artistClass}>
        {song.singer_name || "Unknown Artist"}
      </p>
      
      {song.play_count !== undefined && song.play_count > 0 && (
        <div className={playCountClass}>
          <IconTrendingUp className="w-3 h-3 flex-shrink-0" />
          <span>{formattedPlayCount} lượt nghe</span>
        </div>
      )}
    </div>
  );
});

// Main Song Component with extensive performance optimizations
const Song = ({
  song,
  contextMenu,
  setContextMenu,
  handleCloseContextMenu,
  list,
  showRank = false,
  rank,
}) => {
  const { theme } = useTheme();
  const {
    setCurrentSong,
    currentSong,
    audio,
    setAudio,
    setIsPlaying,
    isPlaying,
    setNewPlaylist,
  } = useAudio();

  // Use refs to minimize re-renders
  const [isHovered, setIsHovered] = useState(false);
  const [playCountIncremented, setPlayCountIncremented] = useState(false);
  const isLoadingRef = useRef(false);
  const songCardRef = useRef();

  // Memoize expensive calculations
  const isCurrentSong = useMemo(
    () => currentSong?.id === song.id,
    [currentSong?.id, song.id]
  );

  const songList = useMemo(() => {
    return Array.isArray(list) ? list : list?.songs || [];
  }, [list]);

  const formattedPlayCount = useMemo(() => {
    const count = song.play_count;
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + "M";
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + "K";
    }
    return count?.toString() || "0";
  }, [song.play_count]);

  // Optimized audio play function
  const playAudio = useCallback(async () => {
    if (songList.length === 0 || isLoadingRef.current) return;

    const currentIndex = songList.findIndex((s) => s.id === song.id);
    if (currentIndex === -1) return;

    isLoadingRef.current = true;

    try {
      setNewPlaylist(songList, currentIndex);

      // Increment play count asynchronously without blocking UI
      if (!playCountIncremented) {
        incrementPlayCount(song.id)
          .then(() => setPlayCountIncremented(true))
          .catch((error) => console.error("Error incrementing play count:", error));
      }
    } finally {
      // Use requestAnimationFrame for smooth state updates
      requestAnimationFrame(() => {
        isLoadingRef.current = false;
      });
    }
  }, [songList, song.id, playCountIncremented, setNewPlaylist]);

  // Optimized play/pause toggle
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

  // Optimized context menu handler
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      songId: song.id,
    });
  }, [song.id, setContextMenu]);

  // Memoize show/hide logic
  const showPlayButton = useMemo(() => {
    return isHovered || isCurrentSong;
  }, [isHovered, isCurrentSong]);

  // Pre-calculated styles using CSS custom properties for better performance
  const cardStyle = useMemo(() => {
    const opacity = isHovered || isCurrentSong ? "hover" : "normal";
    return {
      '--card-gradient': theme.colors.rgb.cardGradient[opacity],
      '--shadow-color': isHovered 
        ? theme.colors.songShadowHover 
        : isCurrentSong 
        ? theme.colors.songShadow 
        : 'transparent',
      background: `linear-gradient(135deg, var(--card-gradient))`,
      boxShadow: `0 10px 25px -5px var(--shadow-color), 0 4px 6px -2px var(--shadow-color)`,
      transform: isHovered ? 'scale(1.02)' : 'scale(1)',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      willChange: isHovered ? 'transform' : 'auto',
    };
  }, [isHovered, isCurrentSong, theme]);

  // Optimized album art styles
  const albumArtStyle = useMemo(() => ({
    '--overlay-gradient': isHovered || isCurrentSong 
      ? theme.colors.rgb.albumOverlayGradient[isHovered ? 'hover' : 'normal']
      : 'transparent',
    transform: isHovered ? 'rotate(0.5deg) scale(1.05)' : isCurrentSong ? 'scale(1.02)' : 'scale(1)',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  }), [isHovered, isCurrentSong, theme]);

  // Optimized hover handlers using passive events
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <div
      ref={songCardRef}
      className="group relative p-4 rounded-2xl cursor-pointer backdrop-blur-sm overflow-hidden"
      style={cardStyle}
      onClick={playAudio}
      onContextMenu={handleContextMenu}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Rank Badge */}
      {showRank && rank && <RankBadge rank={rank} theme={theme} />}

      {/* Album Art Container */}
      <div className="relative mb-4">
        <div className="relative aspect-square overflow-hidden rounded-xl shadow-lg">
          <img
            className="w-full h-full object-cover"
            style={albumArtStyle}
            src={song.image}
            alt={song.song_name}
            loading="lazy"
            decoding="async"
          />

          {/* Overlay with CSS custom property */}
          <div
            className="absolute inset-0 transition-all duration-300 rounded-xl"
            style={{
              background: `linear-gradient(135deg, var(--overlay-gradient))`,
            }}
          />

          {/* Play Button */}
          <div className="absolute bottom-3 right-3 z-20">
            <PlayButton
              isCurrentSong={isCurrentSong}
              isPlaying={isPlaying}
              showPlayButton={showPlayButton}
              onClick={togglePlayPause}
              theme={theme}
            />
          </div>

          {/* Now Playing Indicator */}
          {isCurrentSong && isPlaying && <NowPlayingIndicator theme={theme} />}
        </div>
      </div>

      {/* Song Info */}
      <SongInfo
        song={song}
        isCurrentSong={isCurrentSong}
        formattedPlayCount={formattedPlayCount}
        isHovered={isHovered}
        theme={theme}
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