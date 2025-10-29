// src/components/user/main/TrendingSong.jsx

import { useEffect, useState, useCallback, useMemo, useRef, memo } from "react";
import { useAudio } from "../../utils/audioContext";
import { useTheme } from "../../context/themeContext";
import {
  IconPlayerSkipBackFilled, // Giữ lại cho tiện
  IconPlayerSkipForwardFilled, // Giữ lại cho tiện
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
  IconTrendingUp,
  IconEye, // <--- ĐÃ THAY ĐỔI: Thêm Icon Eye
} from "@tabler/icons-react";
import { incrementPlayCount } from "../../services/SongsService";
import { useNavigate } from "react-router-dom";


// // --- NEW COMPONENT: Details Button (Nút Con mắt) ---
// const DetailsButton = memo(({ song, showPlayButton, navigate, theme }) => {
//   const handleDetailsClick = useCallback(
//     (e) => {
//       e.stopPropagation(); // NGĂN SỰ KIỆN NỔI BỌT LÊN THẺ CHA (NGĂN PLAY NHẠC)
//       navigate(`/song/${song.id}`); // CHUYỂN ĐẾN TRANG CHI TIẾT
//     },
//     [navigate, song.id]
//   );

//   // Class cho nút Con Mắt, chỉ hiện khi hover
//   const buttonClass = useMemo(
//     () =>
//       `
//       w-6 h-6 flex items-center justify-center rounded-full 
//       text-${theme.colors.songArtist} hover:text-${theme.colors.songTextHover}
//       transition-all duration-200 transform
//       ${showPlayButton ? "opacity-100 scale-100" : "opacity-0 scale-75"}
//     `
//         .replace(/\s+/g, " ")
//         .trim(),
//     [showPlayButton, theme]
//   );

//   return (
//     <button
//       className={buttonClass}
//       onClick={handleDetailsClick}
//       title="Xem chi tiết bài hát"
//       style={{
//         pointerEvents: showPlayButton ? "auto" : "none",
//         transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
//       }}
//     >
//       <IconEye className="w-4 h-4" /> {/* <--- SỬ DỤNG ICON CON MẮT */}
//     </button>
//   );
// });
// // ---------------------------------------------------


// Optimized PlayButton with theme support
const PlayButton = memo(
  ({ isCurrentSong, isPlaying, showPlayButton, onClick, theme }) => {
    const buttonContent = useMemo(() => {
      if (isCurrentSong && isPlaying) {
        return <IconPlayerPauseFilled className="w-4 h-4" />;
      }
      return <IconPlayerPlayFilled className="w-4 h-4 ml-0.5" />;
    }, [isCurrentSong, isPlaying]);

    const buttonClass = useMemo(
      () =>
        `
    w-8 h-8 flex items-center justify-center rounded-full 
    bg-${theme.colors.songButton} hover:bg-${theme.colors.songButtonHover}
    text-${theme.colors.songButtonText}
    shadow-lg transition-all duration-200 transform
    hover:scale-105 active:scale-95
    ${showPlayButton ? "opacity-100 scale-100" : "opacity-0 scale-75"}
  `
          .replace(/\s+/g, " ")
          .trim(),
      [showPlayButton, theme]
    );

    return (
      <button
        className={buttonClass}
        onClick={onClick}
        style={{
          pointerEvents: showPlayButton ? "auto" : "none",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {buttonContent}
      </button>
    );
  }
);

// Optimized RankNumber component
const RankNumber = memo(({ rank, showPlayButton, isCurrentSong, theme }) => {
  const rankClass = useMemo(() => {
    let colorClass;
    if (rank <= 3) {
      // Sử dụng màu cố định cho Top 3
      colorClass =
        rank === 1
          ? "text-yellow-400"
          : rank === 2
          ? "text-gray-300"
          : "text-amber-600";
    } else {
      colorClass = isCurrentSong
        ? `text-${theme.colors.songTextCurrent}`
        : "text-gray-400";
    }

    const transitionClass = showPlayButton
      ? "opacity-0 scale-75"
      : "opacity-100 scale-100";

    return `
      text-lg font-bold transition-all duration-200 ease-out
      absolute inset-0 flex items-center justify-center
      ${colorClass} ${transitionClass}
    `
      .replace(/\s+/g, " ")
      .trim();
  }, [rank, showPlayButton, isCurrentSong, theme]);

  return <span className={rankClass}>{rank}</span>;
});

// Simple AlbumArt component without complex effects
const AlbumArt = memo(({ song, isCurrentSong, isPlaying, rank, theme }) => {
  return (
    <div className="flex-shrink-0 relative">
      <div
        className={`w-12 h-12 overflow-hidden rounded-md shadow-md border border-${theme.colors.songBorder}`}
      >
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
        <div
          className={`absolute -bottom-1 -right-1 w-4 h-4 bg-${theme.colors.songIndicator} rounded-full flex items-center justify-center shadow-lg animate-pulse`}
        >
          <div className="w-2 h-2 bg-white rounded-full" />
        </div>
      )}

      {/* Simple Trending Badge */}
      {rank <= 3 && (
        <div
          className={`
            absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-lg
            ${
              rank === 1
                ? "bg-yellow-500"
                : rank === 2
                ? "bg-gray-400"
                : "bg-amber-600"
            }
          `}
        >
          <IconTrendingUp className="w-3 h-3 text-white" />
        </div>
      )}
    </div>
  );
});

// Optimized SongInfo with theme support
const SongInfo = memo(({ song, isCurrentSong, isHovered, theme }) => {
  const titleClass = useMemo(() => {
    if (isCurrentSong) {
      return `text-sm font-medium truncate text-${theme.colors.songTextCurrent}`;
    }
    if (isHovered) {
      return `text-sm font-medium truncate text-${theme.colors.songTextHover}`;
    }
    return `text-sm font-medium truncate text-${theme.colors.songText}`;
  }, [isCurrentSong, isHovered, theme]);

  const artistClass = useMemo(() => {
    if (isCurrentSong) {
      return `text-xs truncate text-${theme.colors.songTextCurrent}/80`;
    }
    if (isHovered) {
      return `text-xs truncate text-${theme.colors.songArtistHover}`;
    }
    return `text-xs truncate text-${theme.colors.songArtist}`;
  }, [isCurrentSong, isHovered, theme]);

  return (
    <div className="flex-1 min-w-0">
      <h3 className={titleClass}>{song.song_name || "Unknown Title"}</h3>
      <p className={artistClass}>{song.singer_name || "Unknown Artist"}</p>
    </div>
  );
});

// Optimized PlayCount component
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

    return `hidden md:flex flex-shrink-0 items-center gap-1 text-xs min-w-0 ${colorClass}`;
  }, [isHovered, isCurrentSong, theme]);

  return (
    <div className={playCountClass}>
      <IconTrendingUp className="w-3 h-3 flex-shrink-0" />
      <span className="truncate font-medium">{formattedPlayCount}</span>
    </div>
  );
});

// Main TrendingSong Component - updated
const TrendingSong = ({ song, list, rank }) => {
  const {
    currentSong,
    setIsPlaying,
    isPlaying,
    setNewPlaylist,
  } = useAudio();
  const navigate = useNavigate();
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

  // Optimized play audio function (Logic cũ)
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

  // Logic click thẻ: HOÀN NGUYÊN về Play Audio
  const handleCardClick = useCallback(() => {
    playAudio(); // <-- Click vào thẻ là PHÁT/CHUYỂN nhạc
  }, [playAudio]); 

  const togglePlayPause = useCallback(
    (e) => {
      e?.stopPropagation(); // Ngăn nổi bọt để không trigger handleCardClick
      if (isLoadingRef.current) return;

      if (isCurrentSong && isPlaying) {
        setIsPlaying(false);
      } else {
        playAudio();
      }
    },
    [isCurrentSong, isPlaying, setIsPlaying, playAudio]
  );

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

  // Simple card styling with theme support
  const cardClass = useMemo(() => {
    const baseClass =
      "group relative flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors duration-200";

    if (isCurrentSong) {
      return `${baseClass} bg-${theme.colors.songCardHover} border border-${theme.colors.songBorderHover}`;
    }
    if (isHovered) {
      return `${baseClass} bg-${theme.colors.songCardHover}`;
    }
    return `${baseClass} hover:bg-${theme.colors.songCard}`;
  }, [isCurrentSong, isHovered, theme]);

  return (
    <div
      className={cardClass}
      onClick={handleCardClick} // <-- Gọi Play Audio
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Rank Number / Play Button */}
      <div className="flex-shrink-0 w-8 text-center">
        <div className="relative">
          <RankNumber
            rank={rank}
            showPlayButton={showPlayButton}
            isCurrentSong={isCurrentSong}
            theme={theme}
          />
          {/* Nút Play/Pause (chỉ hiện khi hover/đang phát) */}
          <PlayButton
            isCurrentSong={isCurrentSong}
            isPlaying={isPlaying}
            showPlayButton={showPlayButton}
            onClick={togglePlayPause} // <-- Đảm bảo gọi e.stopPropagation()
            theme={theme}
          />
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
      
      {/* NÚT CON MẮT (Details Button)
      // <div className="ml-auto flex-shrink-0">
      //   <DetailsButton
      //       song={song}
      //       navigate={navigate}
      //       theme={theme}
      //       showPlayButton={showPlayButton}
      //   />
      // </div> */}
    </div>
  );
};

export default memo(TrendingSong);