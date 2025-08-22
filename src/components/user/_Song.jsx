// Optimized _Song.jsx - Theme-based with improved performance

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

// Theme-based PlayButton
const PlayButton = memo(
  ({ isCurrentSong, isPlaying, showPlayButton, onClick, theme }) => {
    const buttonContent = useMemo(() => {
      if (isCurrentSong && isPlaying) {
        return <IconPlayerPauseFilled className="w-5 h-5 text-white" />;
      }
      return <IconPlayerPlayFilled className="w-5 h-5 text-white ml-0.5" />;
    }, [isCurrentSong, isPlaying]);

    // Dynamic button styling based on theme
    const buttonStyle = useMemo(() => {
      const colors = theme.colors;
      return {
        background: `linear-gradient(135deg, ${colors.rgb.buttonGradient.normal})`,
        opacity: showPlayButton ? 1 : 0,
        transition: "all 0.2s ease",
        transform: showPlayButton ? "scale(1)" : "scale(0.9)",
      };
    }, [theme, showPlayButton]);

    const hoverStyle = useMemo(
      () => ({
        background: `linear-gradient(135deg, ${theme.colors.rgb.buttonGradient.hover})`,
        transform: "scale(1.05)",
      }),
      [theme]
    );

    return (
      <button
        className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:shadow-xl"
        onClick={onClick}
        style={{
          ...buttonStyle,
          pointerEvents: showPlayButton ? "auto" : "none",
        }}
        onMouseEnter={(e) => {
          if (showPlayButton) {
            Object.assign(e.target.style, hoverStyle);
          }
        }}
        onMouseLeave={(e) => {
          if (showPlayButton) {
            Object.assign(e.target.style, buttonStyle);
          }
        }}
      >
        {buttonContent}
      </button>
    );
  }
);

// Theme-based RankBadge
const RankBadge = memo(({ rank, theme }) => {
  const getBadgeStyle = () => {
    const colors = theme.colors;
    if (rank === 1)
      return { background: `linear-gradient(135deg, ${colors.rankGold})` };
    if (rank === 2)
      return { background: `linear-gradient(135deg, ${colors.rankSilver})` };
    if (rank === 3)
      return { background: `linear-gradient(135deg, ${colors.rankBronze})` };
    return { background: `linear-gradient(135deg, ${colors.rankDefault})` };
  };

  return (
    <div className="absolute top-3 left-3 z-20">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg"
        style={getBadgeStyle()}
      >
        {rank}
      </div>
    </div>
  );
});

// Theme-based NowPlayingIndicator
const NowPlayingIndicator = memo(({ theme }) => {
  const barStyle = useMemo(
    () => ({
      "--bar-color": theme.colors.rgb.buttonGradient.normal,
      background: `linear-gradient(to top, var(--bar-color))`,
    }),
    [theme]
  );

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
              animationDuration: "1s",
            }}
          />
        ))}
      </div>
    </div>
  );
});

// Theme-based SongInfo
const SongInfo = memo(({ song, isCurrentSong, formattedPlayCount, theme }) => {
  const colors = theme.colors;

  const titleClass = isCurrentSong
    ? `text-base font-bold line-clamp-2 leading-tight`
    : `text-base font-bold line-clamp-2 leading-tight text-white`;

  const artistClass = isCurrentSong
    ? `text-sm line-clamp-1 font-medium`
    : `text-sm line-clamp-1 font-medium text-gray-300`;

  const playCountClass = isCurrentSong
    ? `flex items-center space-x-1 text-xs font-medium`
    : `flex items-center space-x-1 text-xs font-medium text-gray-400`;

  // Dynamic text colors based on theme
  const textStyles = {
    title: isCurrentSong
      ? {
          color: `rgb(${colors.rgb.buttonGradient.hover
            .split(",")[0]
            .replace("rgb(", "")})`,
        }
      : {},
    artist: isCurrentSong
      ? {
          color: `rgb(${colors.rgb.buttonGradient.hover
            .split(",")[1]
            .replace(")", "")
            .trim()})`,
        }
      : {},
    playCount: isCurrentSong
      ? {
          color: `rgb(${colors.rgb.buttonGradient.hover
            .split(",")[0]
            .replace("rgb(", "")})`,
        }
      : {},
  };

  return (
    <div className="space-y-2">
      <h3 className={titleClass} style={textStyles.title}>
        {song.song_name || "Unknown Title"}
      </h3>

      <p className={artistClass} style={textStyles.artist}>
        {song.singer_name || "Unknown Artist"}
      </p>

      {song.play_count !== undefined && song.play_count > 0 && (
        <div className={playCountClass} style={textStyles.playCount}>
          <IconTrendingUp className="w-3 h-3 flex-shrink-0" />
          <span>{formattedPlayCount} lượt nghe</span>
        </div>
      )}
    </div>
  );
});

// Main Song Component - Fully theme-integrated
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

  // Theme-based card styling
  const cardStyle = useMemo(() => {
    const colors = theme.colors;
    const baseStyle = {
      transition: "all 0.3s ease",
      backdropFilter: "blur(10px)",
      border: `1px solid rgba(${colors.rgb.cardGradient.normal
        .split(",")[0]
        .replace("rgba(", "")}, 0.2)`,
    };

    if (isCurrentSong) {
      return {
        ...baseStyle,
        background: `linear-gradient(135deg, ${colors.rgb.cardGradient.hover})`,
        boxShadow: `0 10px 25px -5px rgba(${colors.rgb.buttonGradient.normal
          .split(",")[0]
          .replace("rgb(", "")}, 0.3)`,
        // borderColor: `rgba(${colors.rgb.buttonGradient.normal
        //   .split(",")[0]
        //   .replace("rgb(", "")}, 0.5)`,
      };
    }

    return {
      ...baseStyle,
      background: `linear-gradient(135deg, ${colors.rgb.cardGradient.normal})`,
    };
  }, [theme, isCurrentSong, isHovered]);

  const hoverCardStyle = useMemo(() => {
    if (isCurrentSong) return cardStyle;

    return {
      ...cardStyle,
      background: `linear-gradient(135deg, ${theme.colors.rgb.cardGradient.hover})`,
      boxShadow: `0 8px 20px -5px rgba(${theme.colors.rgb.buttonGradient.normal
        .split(",")[0]
        .replace("rgb(", "")}, 0.2)`,
      // borderColor: `rgba(${theme.colors.rgb.buttonGradient.normal
      //   .split(",")[0]
      //   .replace("rgb(", "")}, 0.3)`,
      transform: "translateY(-2px)",
    };
  }, [cardStyle, theme, isCurrentSong]);

  // Album art overlay based on theme
  const albumOverlayStyle = useMemo(() => {
    if (!isHovered && !isCurrentSong) return { background: "transparent" };

    return {
      background: `linear-gradient(135deg, ${theme.colors.rgb.albumOverlayGradient.hover})`,
      borderRadius: "0.75rem",
    };
  }, [theme, isHovered, isCurrentSong]);

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
          .catch((error) =>
            console.error("Error incrementing play count:", error)
          );
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

  return (
    <div
      className="relative p-4 rounded-2xl cursor-pointer overflow-hidden"
      style={isHovered ? hoverCardStyle : cardStyle}
      onClick={playAudio}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Rank Badge */}
      {showRank && rank && <RankBadge rank={rank} theme={theme} />}

      {/* Album Art Container */}
      <div className="relative mb-4">
        <div className="relative aspect-square overflow-hidden rounded-xl shadow-lg">
          <img
            className="w-full h-full object-cover transition-transform duration-300"
            src={song.image}
            alt={song.song_name}
            loading="lazy"
            decoding="async"
            style={{
              transform: isHovered ? "scale(1.05)" : "scale(1)",
            }}
          />

          {/* Theme-based overlay */}
          <div
            className="absolute inset-0 transition-all duration-300"
            style={albumOverlayStyle}
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

          {/* Now Playing Indicator - Shows when music is playing */}
          {isCurrentSong && isPlaying && (
            <div className="animate-fadeIn">
              <NowPlayingIndicator theme={theme} />
            </div>
          )}
        </div>
      </div>

      {/* Song Info */}
      <SongInfo
        song={song}
        isCurrentSong={isCurrentSong}
        formattedPlayCount={formattedPlayCount}
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
