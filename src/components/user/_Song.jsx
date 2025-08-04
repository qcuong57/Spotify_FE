import { useEffect, useState, useCallback, useMemo, useRef, memo } from "react";
import { useAudio } from "../../utils/audioContext";
import { useTheme } from "../../context/themeContext";
import {
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
  IconTrendingUp,
} from "@tabler/icons-react";
import ContextMenu from "./library/_ContextMenu";
import { incrementPlayCount } from "../../services/SongsService";

// Memoized PlayButton component with dynamic theme support
const PlayButton = memo(
  ({ isCurrentSong, isPlaying, showPlayButton, onClick, theme }) => {
    const buttonContent = useMemo(() => {
      if (isCurrentSong && isPlaying) {
        return (
          <IconPlayerPauseFilled
            className={`w-5 h-5 text-${theme.colors.songButtonText} drop-shadow-lg`}
          />
        );
      }
      return (
        <IconPlayerPlayFilled
          className={`w-5 h-5 text-${theme.colors.songButtonText} ml-0.5 drop-shadow-lg`}
        />
      );
    }, [isCurrentSong, isPlaying, theme.colors.songButtonText]);

    const isGradient = theme.colors.songButton.includes("gradient-to-r");

    const buttonClass = useMemo(() => {
      const baseClass = `
        w-11 h-11 rounded-full flex items-center justify-center
        shadow-2xl transition-all duration-300 transform backdrop-blur-sm
        hover:scale-110 active:scale-95
        ${
          showPlayButton
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "translate-y-3 opacity-0 pointer-events-none"
        }
      `;

      if (isGradient) {
        return `${baseClass} bg-${theme.colors.songButton} hover:bg-${theme.colors.songButtonHover} shadow-${theme.colors.primary}-500/50`;
      } else {
        return `${baseClass} bg-${theme.colors.songButton} hover:bg-${theme.colors.songButtonHover} shadow-${theme.colors.primary}-500/50`;
      }
    }, [showPlayButton, isGradient, theme.colors]);

    return (
      <button
        className={buttonClass}
        onClick={onClick}
        tabIndex={showPlayButton ? 0 : -1}
      >
        {buttonContent}
      </button>
    );
  }
);

// Enhanced RankBadge component with dynamic theme
const RankBadge = memo(({ rank, theme }) => {
  const badgeClass = useMemo(() => {
    if (rank === 1)
      return "bg-gradient-to-br from-amber-400 to-yellow-500 text-black shadow-amber-500/50";
    if (rank === 2)
      return "bg-gradient-to-br from-gray-300 to-gray-400 text-black shadow-gray-400/50";
    if (rank === 3)
      return "bg-gradient-to-br from-amber-600 to-orange-500 text-white shadow-amber-600/50";
    return `bg-gradient-to-br from-${theme.colors.primary}-400 to-${theme.colors.secondary}-500 text-white shadow-${theme.colors.primary}-500/50`;
  }, [rank, theme.colors]);

  return (
    <div className="absolute top-3 left-3 z-20">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${badgeClass} shadow-xl border border-white/30 backdrop-blur-sm`}
      >
        {rank}
      </div>
    </div>
  );
});

// Enhanced NowPlayingIndicator with dynamic theme
const NowPlayingIndicator = memo(({ theme }) => (
  <div className="absolute top-3 right-3 z-20">
    <div className="flex space-x-1">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`w-1 h-4 bg-gradient-to-t from-${theme.colors.primary}-400 to-${theme.colors.secondary}-300 rounded-full animate-bounce shadow-lg`}
          style={{
            animationDelay: `${index * 0.15}s`,
            animationDuration: "1s",
          }}
        />
      ))}
    </div>
  </div>
));

// Enhanced SongInfo component with dynamic theme
const SongInfo = memo(
  ({ song, isCurrentSong, formattedPlayCount, isHovered, theme }) => (
    <div className="space-y-2 relative z-10">
      <h3
        className={`
        text-base font-bold line-clamp-2 leading-tight transition-all duration-300
        ${
          isCurrentSong
            ? `text-${theme.colors.songTextCurrent} drop-shadow-lg`
            : `text-${theme.colors.songText}`
        }
        ${
          isHovered
            ? `text-${theme.colors.songTextHover} transform translate-y-[-2px] drop-shadow-xl`
            : ""
        }
        group-hover:text-${theme.colors.songTextHover}
      `}
      >
        {song.song_name || "Unknown Title"}
      </h3>
      <p
        className={`
      text-sm line-clamp-1 transition-all duration-300 font-medium
      ${
        isCurrentSong
          ? `text-${theme.colors.songArtist}`
          : `text-${theme.colors.songArtist}/90`
      }
      ${
        isHovered
          ? `text-${theme.colors.songArtistHover} transform translate-y-[-1px] drop-shadow-lg`
          : ""
      }
      group-hover:text-${theme.colors.songArtistHover}
    `}
      >
        {song.singer_name || "Unknown Artist"}
      </p>

      {/* Enhanced Play Count with dynamic theme styling */}
      {song.play_count !== undefined && song.play_count > 0 && (
        <div
          className={`
        flex items-center space-x-1 text-xs transition-all duration-300 font-medium
        ${
          isCurrentSong
            ? `text-${theme.colors.songPlayCount}`
            : `text-${theme.colors.songPlayCount}/80`
        }
        ${
          isHovered
            ? `text-${theme.colors.songPlayCountHover} transform translate-y-[-1px] drop-shadow-md`
            : ""
        }
      `}
        >
          <IconTrendingUp className="w-3 h-3" />
          <span>{formattedPlayCount} lượt nghe</span>
        </div>
      )}
    </div>
  )
);

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

  const [isHovered, setIsHovered] = useState(false);
  const [playCountIncremented, setPlayCountIncremented] = useState(false);

  const isLoadingRef = useRef(false);

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

  const showPlayButton = useMemo(() => {
    return isHovered || isCurrentSong;
  }, [isHovered, isCurrentSong]);

  // Dynamic card styling based on theme with gradient background
  const cardClass = useMemo(() => {
    const baseClass =
      "group relative transition-all duration-500 p-4 rounded-2xl cursor-pointer backdrop-blur-md overflow-hidden";

    // Get theme-specific gradient background
    const getThemeBackground = (isActive = false) => {
      const opacity = isActive ? "/80" : "/60";
      switch (theme.id) {
        case "ocean":
          return `bg-gradient-to-br from-teal-900${opacity} via-teal-900${opacity} to-emerald-900${opacity}`;
        case "forest":
          return `bg-gradient-to-br from-green-900${opacity} via-green-900${opacity} to-emerald-900${opacity}`;
        case "space":
          return `bg-gradient-to-br from-purple-900${opacity} via-purple-900${opacity} to-indigo-800${opacity}`;
        case "sunset":
          return `bg-gradient-to-br from-orange-900${opacity} via-red-900${opacity} to-yellow-900${opacity}`;
        case "neon":
          return `bg-gradient-to-br from-gray-900${opacity} via-blue-900${opacity} to-purple-900${opacity}`;
        default:
          return `bg-gradient-to-br from-teal-900${opacity} via-teal-900${opacity} to-emerald-900${opacity}`;
      }
    };

    if (isHovered) {
      return `${baseClass} ${getThemeBackground(true)} shadow-2xl shadow-${theme.colors.songShadowHover} transform scale-[1.03]`;
    } else if (isCurrentSong) {
      return `${baseClass} ${getThemeBackground(true)} shadow-xl shadow-${theme.colors.songShadow}`;
    } else {
      return `${baseClass} ${getThemeBackground()} hover:shadow-2xl hover:shadow-${theme.colors.songShadowHover}`;
    }
  }, [isHovered, isCurrentSong, theme.colors, theme.id]);

  // Enhanced animated background effect with theme-specific overlay
  const animatedBgClass = useMemo(() => {
    const getOverlayGradient = () => {
      switch (theme.id) {
        case "ocean":
          return "from-teal-400/10 via-emerald-300/5 to-teal-600/10";
        case "forest":
          return "from-green-400/10 via-amber-300/5 to-green-600/10";
        case "space":
          return "from-purple-400/10 via-pink-300/5 to-purple-600/10";
        case "sunset":
          return "from-orange-400/10 via-amber-300/5 to-orange-600/10";
        case "neon":
          return "from-cyan-400/10 via-fuchsia-300/5 to-cyan-600/10";
        default:
          return "from-teal-400/10 via-emerald-300/5 to-teal-600/10";
      }
    };

    return `
      absolute inset-0 opacity-0 transition-opacity duration-500 rounded-2xl
      ${isHovered ? "opacity-100" : ""}
      bg-gradient-to-br ${getOverlayGradient()}
    `;
  }, [isHovered, theme.id]);

  // Dynamic album art shadow - removed white border and blur effects
  const albumArtClass = useMemo(() => {
    const baseClass =
      "relative aspect-square overflow-hidden rounded-xl shadow-xl transition-all duration-500";

    if (isHovered) {
      return `${baseClass} shadow-2xl shadow-${theme.colors.songShadowHover} transform rotate-1`;
    } else if (isCurrentSong) {
      return `${baseClass} shadow-xl shadow-${theme.colors.songShadow}`;
    } else {
      return `${baseClass} shadow-lg shadow-slate-900/50`;
    }
  }, [isHovered, isCurrentSong, theme.colors]);

  // Enhanced gradient overlay with theme-specific styling - removed blur
  const overlayClass = useMemo(() => {
    const baseClass = "absolute inset-0 transition-all duration-500 rounded-xl";

    const getThemeOverlay = () => {
      switch (theme.id) {
        case "ocean":
          return "from-teal-500/15 via-transparent to-teal-900/15";
        case "forest":
          return "from-amber-500/15 via-transparent to-green-900/15";
        case "space":
          return "from-purple-500/15 via-transparent to-purple-900/15";
        case "sunset":
          return "from-orange-500/15 via-transparent to-orange-900/15";
        case "neon":
          return "from-cyan-500/15 via-transparent to-blue-900/15";
        default:
          return "from-teal-500/15 via-transparent to-teal-900/15";
      }
    };

    if (isHovered) {
      return `${baseClass} bg-gradient-to-br ${getThemeOverlay()}`;
    } else if (isCurrentSong) {
      return `${baseClass} bg-gradient-to-br from-${theme.colors.primary}-600/10 via-transparent to-${theme.colors.secondary}-900/20`;
    } else {
      return `${baseClass} bg-transparent`;
    }
  }, [isHovered, isCurrentSong, theme.colors, theme.id]);

  return (
    <div
      className={cardClass}
      onClick={playAudio}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background effect */}
      <div className={animatedBgClass} />

      {/* Rank Badge */}
      {showRank && rank && <RankBadge rank={rank} theme={theme} />}

      {/* Enhanced Album Art Container */}
      <div className="relative mb-4">
        <div className={albumArtClass}>
          <img
            className={`
              w-full h-full object-cover transition-all duration-500
              ${
                isHovered
                  ? "scale-110"
                  : isCurrentSong
                  ? "scale-105"
                  : ""
              }
            `}
            src={song.image}
            alt={song.song_name}
            loading="lazy"
          />

          {/* Enhanced Gradient Overlay */}
          <div className={overlayClass} />

          {/* Shimmer effect on hover */}
          <div
            className={`
            absolute inset-0 transition-all duration-700 rounded-xl
            ${
              isHovered
                ? "bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"
                : ""
            }
          `}
          />

          {/* Enhanced Play Button */}
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

      {/* Enhanced Song Info */}
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