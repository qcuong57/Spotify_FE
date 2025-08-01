import { useEffect, useState, useCallback, useMemo, useRef, memo } from "react";
import { useAudio } from "../../utils/audioContext";
import {
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
  IconTrendingUp,
} from "@tabler/icons-react";
import ContextMenu from "./library/_ContextMenu";
import { incrementPlayCount } from "../../services/SongsService";

// Memoized PlayButton component
const PlayButton = memo(
  ({ isCurrentSong, isPlaying, showPlayButton, onClick }) => {
    const buttonContent = useMemo(() => {
      if (isCurrentSong && isPlaying) {
        return <IconPlayerPauseFilled className="w-6 h-6 text-teal-900" />;
      }
      return <IconPlayerPlayFilled className="w-6 h-6 text-teal-900 ml-0.5" />;
    }, [isCurrentSong, isPlaying]);

    return (
      <button
        className={`
        w-12 h-12 bg-teal-300/70 rounded-full flex items-center justify-center
        shadow-lg transition-all duration-200 transform
        hover:scale-105 hover:bg-emerald-400/70 active:scale-95
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
    if (rank === 1) return "bg-amber-400 text-black";
    if (rank === 2) return "bg-gray-200 text-black";
    if (rank === 3) return "bg-amber-500 text-white";
    return "bg-emerald-400 text-white";
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
          className="w-1 h-4 bg-teal-300 rounded-full animate-bounce"
          style={{ animationDelay: `${index * 0.1}s` }}
        />
      ))}
    </div>
  </div>
));

// Heavily optimized Floating Bubble Effect
const FloatingBubbleEffect = memo(({ isHovered }) => {
  const [isActive, setIsActive] = useState(false);
  const containerRef = useRef(null);
  const timeoutRef = useRef(null);

  // Reduced bubble configurations for better performance
  const bubbleConfigs = useMemo(() => {
    const configs = [];
    
    // Only 4 small bubbles (reduced from 8)
    for (let i = 0; i < 4; i++) {
      configs.push({
        id: `float-${i}`,
        size: 3 + Math.random() * 3, // Smaller range
        x: 20 + Math.random() * 60,
        y: 25 + Math.random() * 50,
        duration: 4 + Math.random() * 1.5, // Shorter duration
        delay: Math.random() * 1,
        type: 'small',
        animationType: 'gentle' // Fixed animation type for consistency
      });
    }

    // Only 2 medium bubbles (reduced from 5)
    for (let i = 0; i < 2; i++) {
      configs.push({
        id: `medium-${i}`,
        size: 4 + Math.random() * 2,
        x: 25 + Math.random() * 50,
        y: 30 + Math.random() * 40,
        duration: 5 + Math.random() * 1,
        delay: Math.random() * 1.5,
        type: 'medium',
        animationType: 'sway'
      });
    }

    // Only 1 large bubble (reduced from 3)
    configs.push({
      id: 'large-0',
      size: 5 + Math.random() * 2,
      x: 35 + Math.random() * 30,
      y: 35 + Math.random() * 30,
      duration: 6,
      delay: Math.random() * 2,
      type: 'large',
      animationType: 'drift'
    });

    return configs;
  }, []); // Only generate once

  // Debounced activation to prevent flickering
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (isHovered) {
      timeoutRef.current = setTimeout(() => {
        setIsActive(true);
      }, 150); // Delay activation to reduce flicker
    } else {
      setIsActive(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isHovered]);

  if (!isActive) return null;

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden z-0 rounded-lg bubble-container-optimized"
    >
      {bubbleConfigs.map((bubble) => (
        <div
          key={bubble.id}
          className={`absolute rounded-full bubble-optimized bubble-${bubble.animationType}-optimized`}
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
            animationDuration: `${bubble.duration}s`,
            animationDelay: `${bubble.delay}s`,
            zIndex: bubble.type === 'large' ? 3 : bubble.type === 'medium' ? 2 : 1,
          }}
        />
      ))}
      
      {/* Simplified ambient light effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-400/1 via-transparent to-emerald-400/1 opacity-30" />
    </div>
  );
});

// Optimized SongInfo component
const SongInfo = memo(({ song, isCurrentSong, formattedPlayCount, isHovered }) => (
  <div className="space-y-2 relative z-10">
    {/* Floating Bubble Effect */}
    <FloatingBubbleEffect isHovered={isHovered} />

    <h3
      className={`
        text-base font-semibold line-clamp-2 leading-tight transition-all duration-300
        ${isCurrentSong ? "text-emerald-400" : "text-white"}
        ${isHovered ? "text-teal-200 transform translate-y-[-1px] drop-shadow-lg" : ""}
        group-hover:text-teal-300
      `}
    >
      {song.song_name || "Unknown Title"}
    </h3>
    <p className={`
      text-sm text-teal-300 line-clamp-1 transition-all duration-300
      ${isHovered ? "text-emerald-300 transform translate-y-[-1px] drop-shadow-md" : ""}
      group-hover:text-emerald-400
    `}>
      {song.singer_name || "Unknown Artist"}
    </p>

    {/* Play Count với hiệu ứng */}
    {song.play_count !== undefined && song.play_count > 0 && (
      <div className={`
        flex items-center space-x-1 text-xs text-teal-300 transition-all duration-300
        ${isHovered ? "text-emerald-300 transform translate-y-[-1px] drop-shadow-sm" : ""}
      `}>
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

  const isLoadingRef = useRef(false);
  const hoverTimeoutRef = useRef(null);

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
      setTimeout(() => {
        isLoadingRef.current = false;
      }, 100);
    }
  }, [songList, song.id, playCountIncremented, setNewPlaylist]);

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

  useEffect(() => {
    if (!isCurrentSong) {
      setPlayCountIncremented(false);
    }
  }, [isCurrentSong]);

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

  // Optimized hover handlers with longer debouncing
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
    }, 300); // Longer delay to prevent rapid state changes
  }, []);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const showPlayButton = useMemo(() => {
    return isHovered || isCurrentSong;
  }, [isHovered, isCurrentSong]);

  return (
    <div
      className={`
        group relative transition-all duration-300 p-4 rounded-lg cursor-pointer backdrop-blur-sm overflow-hidden song-card-optimized
        ${isHovered 
          ? 'bg-teal-800/50 shadow-xl shadow-teal-500/25 transform scale-[1.03] border border-teal-400/20' 
          : 'bg-teal-900/30 hover:bg-teal-800/30 border border-transparent'
        }
      `}
      onClick={playAudio}
      onContextMenu={handleContextMenu}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Rank Badge */}
      {showRank && rank && <RankBadge rank={rank} />}

      {/* Album Art Container với hiệu ứng nâng cao */}
      <div className="relative mb-4">
        <div className={`
          relative aspect-square overflow-hidden rounded-lg shadow-lg transition-all duration-300
          ${isHovered ? 'shadow-2xl shadow-teal-500/40 ring-2 ring-teal-400/30' : ''}
        `}>
          <img
            className={`
              w-full h-full object-cover transition-all duration-500
              ${isHovered 
                ? 'scale-110 brightness-110 contrast-110' 
                : 'group-hover:scale-105'
              }
            `}
            src={song.image}
            alt={song.song_name}
            loading="lazy"
          />

          {/* Enhanced Overlay với gradient động */}
          <div className={`
            absolute inset-0 transition-all duration-500
            ${isHovered 
              ? 'bg-gradient-to-br from-teal-500/15 via-emerald-500/10 to-teal-900/20' 
              : 'bg-gray-900 bg-opacity-0 group-hover:bg-opacity-10'
            }
          `} />

          {/* Play Button */}
          <div className="absolute bottom-2 right-2 z-20">
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
        isHovered={isHovered}
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