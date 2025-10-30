import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IconPlayerPlayFilled, 
  IconPlayerPauseFilled,
  IconTrash
} from "@tabler/icons-react";
import { useTheme } from "../../../context/themeContext";
import { useAudio } from "../../../utils/audioContext";

// Animation variants
const songCardVariants = {
  initial: { 
    opacity: 0, 
    x: -20, 
    scale: 0.95 
  },
  animate: { 
    opacity: 1, 
    x: 0, 
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
      staggerChildren: 0.05,
    }
  },
  exit: {
    opacity: 0,
    x: 20,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    }
  },
  hover: {
    y: -2,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
    }
  }
};

const playButtonVariants = {
  initial: { 
    opacity: 0, 
    scale: 0.8 
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    }
  },
  hover: {
    scale: 1.1,
    rotate: 5,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    }
  },
  tap: {
    scale: 0.9,
    transition: {
      duration: 0.1,
    }
  }
};

const indexVariants = {
  initial: { opacity: 1 },
  hover: { 
    opacity: 0,
    transition: {
      duration: 0.2,
    }
  }
};

const hoverPlayButtonVariants = {
  initial: { 
    opacity: 0, 
    scale: 0.8,
    rotate: -10
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    }
  },
  hover: {
    scale: 1.2,
    rotate: 10,
    transition: {
      duration: 0.2,
    }
  },
  tap: {
    scale: 0.9,
    transition: {
      duration: 0.1,
    }
  }
};

const imageVariants = {
  initial: { 
    opacity: 0, 
    scale: 0.9 
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    }
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    }
  }
};

const imageOverlayVariants = {
  initial: { 
    opacity: 0,
    scale: 0.8
  },
  animate: { 
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    }
  }
};

const songInfoVariants = {
  initial: { 
    opacity: 0, 
    x: -10 
  },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
      staggerChildren: 0.1,
    }
  }
};

const titleVariants = {
  initial: { 
    opacity: 0, 
    y: 10 
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    }
  },
  hover: {
    x: 2,
    transition: {
      duration: 0.2,
    }
  }
};

const artistVariants = {
  initial: { 
    opacity: 0, 
    y: 10 
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
      delay: 0.1,
    }
  }
};

const deleteButtonVariants = {
  initial: { 
    opacity: 0, 
    scale: 0.8,
    x: 10
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    x: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    }
  },
  hover: {
    scale: 1.1,
    rotate: 5,
    transition: {
      duration: 0.2,
    }
  },
  tap: {
    scale: 0.9,
    transition: {
      duration: 0.1,
    }
  }
};

const loadingSpinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    }
  }
};

const overlayVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      duration: 0.3,
    }
  }
};

const currentSongIndicatorVariants = {
  initial: { 
    scale: 0.8,
    opacity: 0
  },
  animate: { 
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    }
  },
  pulse: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    }
  }
};

const Song = ({ song, playlist, deleteSong, songs, index, list }) => {
  const { theme } = useTheme();
  const { setNewPlaylist, currentSong, isPlaying, togglePlayPause } = useAudio();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handlePlaySong = (e) => {
    if (e) {
      e.stopPropagation();
    }
    
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
    
    if (!confirm(`Bạn có chắc chắn muốn xóa "${song.song_name}" khỏi playlist?`)) {
      return;
    }
    
    setIsProcessing(true);
    try {
      await deleteSong(song.id);
    } catch (error) {
      console.error("Error deleting song:", error);
      alert("Có lỗi xảy ra khi xóa bài hát!");
    } finally {
      setIsProcessing(false);
    }
  };

  const isCurrentSong = currentSong && currentSong.id === song.id;

  return (
    <motion.div
      className={`group relative grid grid-cols-[16px_1fr_auto] gap-2 sm:gap-4 items-center mx-2 py-3 px-3 rounded-xl cursor-pointer overflow-hidden
        ${isCurrentSong 
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
      layout
    >
      {/* Animated gradient overlay */}
      <motion.div 
        className={`absolute inset-0 bg-gradient-to-r ${theme.colors.songOverlay} pointer-events-none rounded-xl`}
        variants={overlayVariants}
        initial="initial"
        animate={isHovered ? "animate" : "initial"}
      />
      
      {/* Current song pulse indicator */}
      <AnimatePresence>
        {isCurrentSong && (
          <motion.div
            className={`absolute inset-0 bg-gradient-to-r ${theme.colors.songOverlay} pointer-events-none rounded-xl`}
            variants={currentSongIndicatorVariants}
            initial="initial"
            animate="pulse"
            exit="initial"
          />
        )}
      </AnimatePresence>
      
      {/* Content */}
      <div className="relative z-10 contents">
        {/* Index/Play Button */}
        <div className="flex items-center justify-center">
          <AnimatePresence mode="wait">
            {isCurrentSong ? (
              <motion.button 
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlaySong(e);
                }}
                className={`p-1 rounded-full bg-${theme.colors.songIndicator} shadow-md`}
                variants={playButtonVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                whileTap="tap"
                key="current-play-button"
              >
                <AnimatePresence mode="wait">
                  {isPlaying ? (
                    <motion.div
                      key="pause"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <IconPlayerPauseFilled className="w-3 h-3 text-black" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="play"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <IconPlayerPlayFilled className="w-3 h-3 text-black" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ) : (
              <div className="relative" key="index-play-container">
                {/* Index number */}
                <motion.span 
                  className={`text-sm font-medium text-${theme.colors.songPlayCount}`}
                  variants={indexVariants}
                  animate={isHovered ? "hover" : "initial"}
                >
                  {index + 1}
                </motion.span>
                
                {/* Hover play button */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlaySong(e);
                      }}
                      className={`absolute inset-0 flex items-center justify-center p-1 rounded-full bg-${theme.colors.songButton} hover:bg-${theme.colors.songButtonHover} shadow-md`}
                      variants={hoverPlayButtonVariants}
                      initial="initial"
                      animate="animate"
                      exit="initial"
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <IconPlayerPlayFilled className="w-3 h-3 text-black" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Song Info */}
        <motion.div 
          className="flex items-center gap-3 min-w-0"
          variants={songInfoVariants}
        >
          <div className="relative group/image">
            <motion.img
              src={song.image}
              alt={song.song_name}
              // --- THAY ĐỔI DÒNG NÀY ---
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl shadow-lg flex-shrink-0 object-cover`}
              variants={imageVariants}
              whileHover="hover"
              onError={(e) => {
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cpolygon points='10,8 16,12 10,16 10,8'%3E%3C/polygon%3E%3C/svg%3E";
              }}
            />
            
            {/* Play overlay on image hover */}
            <AnimatePresence>
              {isHovered && (
                <motion.div 
                  className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center"
                  variants={imageOverlayVariants}
                  initial="initial"
                  animate="animate"
                  exit="initial"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <IconPlayerPlayFilled className="w-5 h-5 text-white" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="min-w-0 flex-1">
            <motion.h4 
              className={`font-bold text-sm sm:text-base truncate transition-colors duration-200 ${
                isCurrentSong 
                  ? `text-${theme.colors.songTextCurrent} drop-shadow-sm` 
                  : `text-${theme.colors.songText} group-hover:text-${theme.colors.songTextHover}`
              }`}
              variants={titleVariants}
              whileHover="hover"
            >
              {song.song_name}
            </motion.h4>
            <motion.p 
              className={`text-xs sm:text-sm truncate transition-colors duration-200 text-${theme.colors.songArtist} group-hover:text-${theme.colors.songArtistHover}`}
              variants={artistVariants}
            >
              {song.singer_name}
            </motion.p>
          </div>
        </motion.div>

        {/* Delete Button */}
        <div className="flex items-center">
          <AnimatePresence>
            {!playlist.is_liked_song && (isCurrentSong || isHovered) && (
              <motion.button
                onClick={handleDeleteSong}
                disabled={isProcessing}
                className="p-2 rounded-full text-red-400 hover:text-red-300 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                variants={deleteButtonVariants}
                initial="initial"
                animate="animate"
                exit="initial"
                whileHover="hover"
                whileTap="tap"
                title="Xóa khỏi playlist"
              >
                <AnimatePresence mode="wait">
                  {isProcessing ? (
                    <motion.div
                      key="loading"
                      className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                      variants={loadingSpinnerVariants}
                      animate="animate"
                      initial={{ opacity: 0 }}
                      exit={{ opacity: 0 }}
                    />
                  ) : (
                    <motion.div
                      key="trash"
                      initial={{ opacity: 0, rotate: -10 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <IconTrash className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default Song;