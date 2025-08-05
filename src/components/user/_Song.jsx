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

// Enhanced PlayButton component with theme integration
const PlayButton = memo(
  ({ isCurrentSong, isPlaying, showPlayButton, onClick, theme }) => {
    const buttonContent = useMemo(() => {
      if (isCurrentSong && isPlaying) {
        return (
          <IconPlayerPauseFilled className="w-5 h-5 text-white drop-shadow-lg" />
        );
      }
      return (
        <IconPlayerPlayFilled className="w-5 h-5 text-white ml-0.5 drop-shadow-lg" />
      );
    }, [isCurrentSong, isPlaying]);

    const buttonStyle = useMemo(
      () => ({
        background: `linear-gradient(135deg, ${theme.colors.rgb.buttonGradient.normal})`,
        transition: "all 0.3s ease",
      }),
      [theme]
    );

    const hoverStyle = useMemo(
      () => ({
        backgroundImage: `linear-gradient(135deg, ${theme.colors.rgb.buttonGradient.hover})`,
      }),
      [theme]
    );

    return (
      <button
        className={`
          w-11 h-11 rounded-full flex items-center justify-center
          shadow-2xl transition-all duration-300 transform backdrop-blur-sm
          hover:scale-110 active:scale-95
          ${
            showPlayButton
              ? "translate-y-0 opacity-100 pointer-events-auto"
              : "translate-y-3 opacity-0 pointer-events-none"
          }
        `}
        style={buttonStyle}
        onMouseEnter={(e) => {
          e.target.style.backgroundImage = hoverStyle.backgroundImage;
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundImage = buttonStyle.backgroundImage;
        }}
        onClick={onClick}
        tabIndex={showPlayButton ? 0 : -1}
      >
        {buttonContent}
      </button>
    );
  }
);

// Enhanced RankBadge component with theme colors
const RankBadge = memo(({ rank, theme }) => {
  const getBadgeStyle = () => {
    if (rank === 1) {
      return {
        background: `linear-gradient(135deg, ${theme.colors.rankGold})`,
      };
    }
    if (rank === 2) {
      return {
        background: `linear-gradient(135deg, ${theme.colors.rankSilver})`,
      };
    }
    if (rank === 3) {
      return {
        background: `linear-gradient(135deg, ${theme.colors.rankBronze})`,
      };
    }

    // Default theme-based gradient
    return {
      background: `linear-gradient(135deg, ${theme.colors.rankDefault})`,
    };
  };

  return (
    <div className="absolute top-3 left-3 z-20">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xl border border-white/30 backdrop-blur-sm"
        style={getBadgeStyle()}
      >
        {rank}
      </div>
    </div>
  );
});

// Enhanced NowPlayingIndicator with dynamic theme
const NowPlayingIndicator = memo(({ theme }) => {
  const barStyle = {
    background: `linear-gradient(to top, ${theme.colors.rgb.buttonGradient.normal})`,
  };

  return (
    <div className="absolute top-3 right-3 z-20">
      <div className="flex space-x-1">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="w-1 h-4 rounded-full animate-bounce shadow-lg"
            style={{
              ...barStyle,
              animationDelay: `${index * 0.15}s`,
              animationDuration: "1s",
            }}
          />
        ))}
      </div>
    </div>
  );
});

// Enhanced SongInfo component with theme integration
const SongInfo = memo(
  ({ song, isCurrentSong, formattedPlayCount, isHovered, theme }) => {
    const getTitleClass = () => {
      let baseClass =
        "text-base font-bold line-clamp-2 leading-tight transition-all duration-300";

      if (isCurrentSong) {
        baseClass += ` text-${theme.colors.songTextCurrent} drop-shadow-lg`;
      } else {
        baseClass += ` text-${theme.colors.songText}`;
      }

      if (isHovered) {
        baseClass += ` text-${theme.colors.songTextHover} transform translate-y-[-2px] drop-shadow-xl`;
      }

      return baseClass;
    };

    const getArtistClass = () => {
      let baseClass =
        "text-sm line-clamp-1 transition-all duration-300 font-medium";

      if (isCurrentSong) {
        baseClass += ` text-${theme.colors.songArtist}`;
      } else {
        baseClass += ` text-${theme.colors.songArtist}/90`;
      }

      if (isHovered) {
        baseClass += ` text-${theme.colors.songArtistHover} transform translate-y-[-1px] drop-shadow-lg`;
      }

      return baseClass;
    };

    const getPlayCountClass = () => {
      let baseClass =
        "flex items-center space-x-1 text-xs transition-all duration-300 font-medium";

      if (isCurrentSong) {
        baseClass += ` text-${theme.colors.songPlayCount}`;
      } else {
        baseClass += ` text-${theme.colors.songPlayCount}/80`;
      }

      if (isHovered) {
        baseClass += ` text-${theme.colors.songPlayCountHover} transform translate-y-[-1px] drop-shadow-md`;
      }

      return baseClass;
    };

    return (
      <div className="space-y-2 relative z-10">
        <h3 className={getTitleClass()}>{song.song_name || "Unknown Title"}</h3>

        <p className={getArtistClass()}>
          {song.singer_name || "Unknown Artist"}
        </p>

        {song.play_count !== undefined && song.play_count > 0 && (
          <div className={getPlayCountClass()}>
            <IconTrendingUp className="w-3 h-3" />
            <span>{formattedPlayCount} lượt nghe</span>
          </div>
        )}
      </div>
    );
  }
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

  // Dynamic card styling using theme colors
  const getCardStyle = () => {
    const opacity = isHovered || isCurrentSong ? "hover" : "normal";
    return {
      background: `linear-gradient(135deg, ${theme.colors.rgb.cardGradient[opacity]})`,
    };
  };

  // Dynamic shadow class using theme
  const getShadowClass = () => {
    if (isHovered) {
      return `shadow-2xl shadow-${theme.colors.songShadowHover}`;
    } else if (isCurrentSong) {
      return `shadow-xl shadow-${theme.colors.songShadow}`;
    } else {
      return `hover:shadow-2xl hover:shadow-${theme.colors.songShadowHover}`;
    }
  };

  const cardClass = useMemo(() => {
    const baseClass =
      "group relative transition-all duration-500 p-4 rounded-2xl cursor-pointer backdrop-blur-md overflow-hidden";
    const scaleClass = isHovered ? "transform scale-[1.03]" : "";

    return `${baseClass} ${getShadowClass()} ${scaleClass}`;
  }, [isHovered, isCurrentSong, theme]);

  // Enhanced animated background effect using theme
  const getAnimatedBgStyle = () => {
    return {
      background: `linear-gradient(135deg, ${theme.colors.rgb.overlayGradient})`,
      opacity: isHovered ? 1 : 0,
    };
  };

  // Dynamic album art styling using theme
  const getAlbumArtClass = () => {
    const baseClass =
      "relative aspect-square overflow-hidden rounded-xl shadow-xl transition-all duration-500";

    if (isHovered) {
      return `${baseClass} shadow-2xl shadow-${theme.colors.songShadowHover} transform rotate-1`;
    } else if (isCurrentSong) {
      return `${baseClass} shadow-xl shadow-${theme.colors.songShadow}`;
    } else {
      return `${baseClass} shadow-lg shadow-slate-900/50`;
    }
  };

  // Enhanced gradient overlay for album art using theme
  const getOverlayStyle = () => {
    if (isHovered || isCurrentSong) {
      return {
        background: `linear-gradient(135deg, ${
          isHovered
            ? theme.colors.rgb.albumOverlayGradient.hover
            : theme.colors.rgb.albumOverlayGradient.normal
        })`,
      };
    }

    return { background: "transparent" };
  };

  return (
    <div
      className={cardClass}
      style={getCardStyle()}
      onClick={playAudio}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background effect */}
      <div
        className="absolute inset-0 transition-opacity duration-500 rounded-2xl"
        style={getAnimatedBgStyle()}
      />

      {/* Rank Badge */}
      {showRank && rank && <RankBadge rank={rank} theme={theme} />}

      {/* Enhanced Album Art Container */}
      <div className="relative mb-4">
        <div className={getAlbumArtClass()}>
          <img
            className={`
              w-full h-full object-cover transition-all duration-500
              ${isHovered ? "scale-110" : isCurrentSong ? "scale-105" : ""}
            `}
            src={song.image}
            alt={song.song_name}
            loading="lazy"
          />

          {/* Enhanced Gradient Overlay */}
          <div
            className="absolute inset-0 transition-all duration-500 rounded-xl"
            style={getOverlayStyle()}
          />

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
