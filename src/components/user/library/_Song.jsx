import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
  IconTrash,
} from "@tabler/icons-react";
import { useTheme } from "../../../context/themeContext";
import { useAudio } from "../../../utils/audioContext";

// Animation variants - Đã tắt toàn bộ chuyển động scale/y gây giật
const songCardVariants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
      staggerChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.2,
    },
  },
  hover: {
    y: 0, // QUAN TRỌNG: Khóa cứng trục Y, không cho nhảy
    scale: 1, // QUAN TRỌNG: Khóa cứng Scale, không cho phóng to
    transition: {
      duration: 0.2,
      ease: "linear",
    },
  },
  tap: {
    scale: 0.99, // Nhún cực nhẹ khi click
    transition: {
      duration: 0.05,
    },
  },
};

const playButtonVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3 },
  },
  hover: {
    scale: 1.1,
    transition: { duration: 0.2 },
  },
  tap: { scale: 0.9 },
};

const indexVariants = {
  initial: { opacity: 1 },
  hover: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

const hoverPlayButtonVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2 },
  },
  hover: {
    scale: 1.1,
    transition: { duration: 0.2 },
  },
  tap: { scale: 0.9 },
};

const imageVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4 },
  },
  hover: {
    scale: 1.05, // Zoom ảnh nhẹ bên trong khung
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const imageOverlayVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
};

const songInfoVariants = {
  initial: { opacity: 0, x: -10 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, staggerChildren: 0.1 },
  },
};

const titleVariants = {
  initial: { opacity: 0, y: 5 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
  hover: {
    x: 2, // Chỉ trượt nhẹ chữ sang phải, không nhảy lên
    transition: { duration: 0.2 },
  },
};

const artistVariants = {
  initial: { opacity: 0, y: 5 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: 0.1 },
  },
};

const deleteButtonVariants = {
  initial: { opacity: 0, scale: 0.5 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2 },
  },
  hover: {
    scale: 1.1,
    color: "#ef4444", // Red-500
    transition: { duration: 0.2 },
  },
  tap: { scale: 0.9 },
};

const overlayVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
};

const Song = ({ song, playlist, deleteSong, songs, index, list }) => {
  const { theme } = useTheme();
  const { setNewPlaylist, currentSong, isPlaying, togglePlayPause } =
    useAudio();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handlePlaySong = (e) => {
    if (e) e.stopPropagation();

    const isCurrentSong = currentSong && currentSong.id === song.id;
    if (isCurrentSong) {
      togglePlayPause();
    } else {
      if (list && list.length > 0) {
        setNewPlaylist(list, index);
      }
    }
  };

  const handleDeleteSong = async (e) => {
    e.stopPropagation();
    if (!deleteSong) return;
    if (
      !confirm(`Bạn có chắc chắn muốn xóa "${song.song_name}" khỏi playlist?`)
    )
      return;

    setIsProcessing(true);
    try {
      await deleteSong(song.id);
    } catch (error) {
      console.error("Error deleting song:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const isCurrentSong = currentSong && currentSong.id === song.id;

  return (
    <motion.div
      // 1. SỬ DỤNG padding-right (pr-12) để chừa chỗ cho nút Delete, tránh nội dung bị đẩy qua lại
      className={`group relative grid grid-cols-[16px_1fr] gap-4 items-center mx-2 py-3 px-3 pr-12 rounded-xl cursor-pointer overflow-hidden
        ${
          isCurrentSong
            ? `bg-gradient-to-r ${theme.colors.songOverlay} border border-${theme.colors.songBorderHover} shadow-lg shadow-${theme.colors.songShadow}`
            : `hover:bg-${theme.colors.songCardHover} hover:shadow-md hover:shadow-${theme.colors.songShadow} hover:border hover:border-${theme.colors.songBorderHover}`
        }
      `}
      variants={songCardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover="hover"
      whileTap="tap"
      onClick={handlePlaySong}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      // 2. QUAN TRỌNG: Đã xóa prop "layout" để tránh lỗi layout shift (nhảy khung)
    >
      {/* Background Overlay */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r ${theme.colors.songOverlay} pointer-events-none rounded-xl`}
        variants={overlayVariants}
        initial="initial"
        animate={isHovered ? "animate" : "initial"}
      />

      {/* Index & Play Button Area */}
      <div className="relative z-10 flex items-center justify-center w-4 h-4">
        <AnimatePresence mode="wait">
          {isCurrentSong ? (
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                handlePlaySong(e);
              }}
              className={`flex items-center justify-center w-full h-full rounded-full bg-${theme.colors.songIndicator}`}
              variants={playButtonVariants}
              key="current-play"
            >
              {isPlaying ? (
                <IconPlayerPauseFilled size={10} className="text-black" />
              ) : (
                <IconPlayerPlayFilled size={10} className="text-black" />
              )}
            </motion.button>
          ) : (
            <>
              <motion.span
                className={`text-sm font-medium text-${theme.colors.songPlayCount} absolute`}
                variants={indexVariants}
                animate={isHovered ? "hover" : "initial"}
              >
                {index + 1}
              </motion.span>

              {isHovered && (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlaySong(e);
                  }}
                  className={`absolute inset-0 flex items-center justify-center rounded-full bg-${theme.colors.songButton} shadow-sm`}
                  variants={hoverPlayButtonVariants}
                  initial="initial"
                  animate="animate"
                  exit="initial"
                >
                  <IconPlayerPlayFilled size={10} className="text-black" />
                </motion.button>
              )}
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Song Info */}
      <motion.div
        className="relative z-10 flex items-center gap-3 min-w-0"
        variants={songInfoVariants}
      >
        <div className="relative flex-shrink-0 overflow-hidden rounded-xl">
          <motion.img
            src={song.image}
            alt={song.song_name}
            className="w-12 h-12 sm:w-14 sm:h-14 object-cover"
            variants={imageVariants}
            whileHover="hover" // Ảnh chỉ zoom nhẹ bên trong
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/150";
            }}
          />
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="absolute inset-0 bg-black/40 flex items-center justify-center"
                variants={imageOverlayVariants}
                initial="initial"
                animate="animate"
                exit="initial"
              >
                <IconPlayerPlayFilled
                  size={20}
                  className="text-white drop-shadow-md"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <motion.h4
            className={`font-bold text-sm sm:text-base truncate ${
              isCurrentSong
                ? `text-${theme.colors.songTextCurrent}`
                : `text-${theme.colors.songText}`
            }`}
            variants={titleVariants}
            whileHover="hover"
          >
            {song.song_name}
          </motion.h4>
          <motion.p
            className={`text-xs sm:text-sm truncate mt-0.5 ${
              isCurrentSong
                ? "text-white/80"
                : `text-${theme.colors.songArtist}`
            }`}
            variants={artistVariants}
          >
            {song.singer_name}
          </motion.p>
        </div>
      </motion.div>

      {/* Delete Button - ABSOLUTE POSITIONING để không đẩy layout */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20">
        <AnimatePresence>
          {!playlist.is_liked_song && (isCurrentSong || isHovered) && (
            <motion.button
              onClick={handleDeleteSong}
              disabled={isProcessing}
              className="p-2 rounded-full text-red-400 hover:bg-red-500/10 transition-colors"
              variants={deleteButtonVariants}
              initial="initial"
              animate="animate"
              exit="initial"
              whileHover="hover"
              whileTap="tap"
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <IconTrash size={18} />
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Song;
