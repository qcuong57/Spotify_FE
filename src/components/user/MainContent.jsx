import React, { useEffect, useState, useMemo, useCallback, memo } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  getAllSongs,
  getAllSongsWithPagination,
  getTrendingSongs,
  getLatestSongs,
} from "../../services/SongsService";
import { getAllGenres } from "../../services/genresService";
import { useTheme } from "../../context/themeContext";
import Song from "./_Song";
import TrendingSong from "./TrendingSong";

// Animation variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
      staggerChildren: 0.1,
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
    }
  }
};

const sectionVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    }
  }
};

const headerVariants = {
  initial: { opacity: 0, x: -30 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    }
  },
  hover: {
    x: 5,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    }
  }
};

const buttonVariants = {
  initial: { opacity: 0, x: 30 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    }
  },
  hover: {
    scale: 1.05,
    x: -5,
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
  },
  loading: {
    opacity: 0.7,
    scale: 0.98,
    transition: {
      duration: 0.2,
    }
  }
};

const gridVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    }
  }
};

const gridItemVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      delay: i * 0.05,
      ease: [0.4, 0, 0.2, 1],
    }
  })
};

const genreFilterVariants = {
  initial: { opacity: 0, y: -20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.05,
      delayChildren: 0.2,
    }
  }
};

const genreButtonVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    }
  },
  hover: {
    scale: 1.08,
    y: -3,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    }
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
    }
  },
  selected: {
    scale: 1.05,
    y: -2,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    }
  }
};

const loadingVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.2,
    }
  }
};

const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    }
  }
};

const pulseVariants = {
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.3, 0.8, 0.3],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    }
  }
};

const bounceVariants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut",
    }
  }
};

const emptyStateVariants = {
  initial: { opacity: 0, scale: 0.8, y: 50 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    }
  }
};

const errorVariants = {
  initial: { opacity: 0, scale: 0.9, y: 30 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    }
  }
};

// Enhanced Section component with motion
const Section = memo(
  ({
    title,
    emoji,
    children,
    onViewAll,
    buttonText = "Xem tất cả",
    isLoading = false,
    index = 0,
  }) => {
    const { theme } = useTheme();
    
    return (
      <motion.div 
        className="mb-8"
        variants={sectionVariants}
        initial="initial"
        animate="animate"
        custom={index}
      >
        <div className="flex flex-row justify-between items-center mb-6">
          <motion.h2
            className={`text-2xl md:text-3xl font-bold cursor-pointer transition-colors duration-200 hover:text-${theme.colors.secondary}-400 flex items-center gap-2`}
            variants={headerVariants}
            whileHover="hover"
          >
            {emoji && (
              <motion.span 
                className="text-2xl"
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: index * 0.5
                }}
              >
                {emoji}
              </motion.span>
            )}
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              {title}
            </motion.span>
          </motion.h2>
          {onViewAll && (
            <motion.button
              className={`
              text-sm font-semibold px-6 py-3 rounded-full
              transition-colors duration-200
              ${
                isLoading
                  ? `pointer-events-none opacity-50 bg-${theme.colors.secondary}-600 text-white`
                  : `text-${theme.colors.text} hover:text-white hover:bg-${theme.colors.secondary}-500`
              }
            `}
              onClick={onViewAll}
              disabled={isLoading}
              variants={buttonVariants}
              initial="initial"
              animate={isLoading ? "loading" : "animate"}
              whileHover={!isLoading ? "hover" : {}}
              whileTap={!isLoading ? "tap" : {}}
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div 
                    className="flex items-center gap-2"
                    key="loading"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div 
                      className="w-4 h-4 relative"
                      variants={spinnerVariants}
                      animate="animate"
                    >
                      <div className="absolute inset-0 rounded-full border-2 border-white border-t-transparent"></div>
                      <div className="absolute inset-1 rounded-full bg-white opacity-20"></div>
                    </motion.div>
                    <span>Đang tải...</span>
                  </motion.div>
                ) : (
                  <motion.span 
                    className="flex items-center gap-2"
                    key="button-text"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span>{buttonText}</span>
                    <motion.svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.2 }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </motion.svg>
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {children}
        </motion.div>
      </motion.div>
    );
  }
);

// Enhanced Genre Filter Component with motion
const GenreFilter = memo(
  ({ genres, selectedGenre, onGenreSelect, isLoading }) => {
    const { theme } = useTheme();

    return (
      <motion.div 
        className="mb-8"
        variants={genreFilterVariants}
        initial="initial"
        animate="animate"
      >
        <motion.div 
          className="flex flex-wrap gap-2 md:gap-3"
          variants={gridVariants}
        >
          {/* All Genres Button */}
          <motion.button
            onClick={() => onGenreSelect(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-out
              ${
                selectedGenre === null
                  ? `bg-gradient-to-r from-${theme.colors.primary}-600 to-${theme.colors.secondary}-500 text-white shadow-md`
                  : `bg-${theme.colors.card} text-${theme.colors.text} hover:bg-${theme.colors.cardHover} hover:text-${theme.colors.textHover} hover:shadow-lg`
              }`}
            variants={genreButtonVariants}
            whileHover="hover"
            whileTap="tap"
            animate={selectedGenre === null ? "selected" : "animate"}
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              Tất cả
            </motion.span>
          </motion.button>

          {/* Genre Buttons */}
          {genres.map((genre, index) => (
            <motion.button
              key={genre.id}
              onClick={() => onGenreSelect(genre)}
              disabled={isLoading}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-out
                ${
                  selectedGenre?.id === genre.id
                    ? `bg-gradient-to-r from-${theme.colors.primary}-600 to-${theme.colors.secondary}-500 text-white shadow-md`
                    : `bg-${theme.colors.card} text-${theme.colors.text} hover:bg-${theme.colors.cardHover} hover:text-${theme.colors.textHover} hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`
                }`}
              variants={genreButtonVariants}
              custom={index}
              whileHover={!isLoading ? "hover" : {}}
              whileTap={!isLoading ? "tap" : {}}
              animate={selectedGenre?.id === genre.id ? "selected" : "animate"}
            >
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                {genre.name}
                {genre.songs && (
                  <motion.span 
                    className="ml-1 text-xs opacity-75"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (index * 0.05) + 0.2, duration: 0.3 }}
                  >
                    ({genre.songs.length})
                  </motion.span>
                )}
              </motion.span>
            </motion.button>
          ))}
        </motion.div>

        {/* Loading indicator for genre filter */}
        <AnimatePresence>
          {isLoading && (
            <motion.div 
              className="flex items-center justify-center mt-4"
              variants={loadingVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <motion.div 
                className={`flex items-center gap-2 text-${theme.colors.secondary}-300`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="w-4 h-4 relative"
                  variants={spinnerVariants}
                  animate="animate"
                >
                  <div className={`absolute inset-0 rounded-full border-2 border-${theme.colors.secondary}-300 border-t-transparent`}></div>
                </motion.div>
                <span className="text-sm">Đang tải bài hát...</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);

// Enhanced SongCardSkeleton with motion
const SongCardSkeleton = memo(({ index = 0 }) => {
  const { theme } = useTheme();

  const getSkeletonColors = () => {
    switch (theme.id) {
      case "ocean":
        return {
          card: "from-teal-800/60 via-teal-800/60 to-emerald-800/60",
          image: "from-teal-600 to-teal-500",
          shimmer: "from-transparent via-teal-400/30 to-transparent",
          text: "from-teal-600 to-teal-500",
        };
      case "forest":
        return {
          card: "from-green-800/60 via-green-800/60 to-emerald-800/60",
          image: "from-green-600 to-green-500",
          shimmer: "from-transparent via-amber-400/30 to-transparent",
          text: "from-green-600 to-green-500",
        };
      case "space":
        return {
          card: "from-purple-800/60 via-purple-800/60 to-indigo-800/60",
          image: "from-purple-600 to-purple-500",
          shimmer: "from-transparent via-purple-400/30 to-transparent",
          text: "from-purple-600 to-purple-500",
        };
      case "sunset":
        return {
          card: "from-orange-800/60 via-red-800/60 to-yellow-800/60",
          image: "from-orange-600 to-orange-500",
          shimmer: "from-transparent via-orange-400/30 to-transparent",
          text: "from-orange-600 to-orange-500",
        };
      case "neon":
        return {
          card: "from-gray-800/60 via-blue-800/60 to-purple-700/60",
          image: "from-cyan-600 to-cyan-500",
          shimmer: "from-transparent via-cyan-400/30 to-transparent",
          text: "from-cyan-600 to-cyan-500",
        };
      default:
        return {
          card: "from-teal-800/60 via-teal-800/60 to-emerald-800/60",
          image: "from-teal-600 to-teal-500",
          shimmer: "from-transparent via-teal-400/30 to-transparent",
          text: "from-teal-600 to-teal-500",
        };
    }
  };

  const colors = getSkeletonColors();

  return (
    <motion.div 
      className={`bg-gradient-to-br ${colors.card} p-4 rounded-2xl overflow-hidden backdrop-blur-md border border-${theme.colors.songBorder}`}
      variants={gridItemVariants}
      custom={index}
      initial="initial"
      animate="animate"
    >
      {/* Image skeleton with shimmer effect */}
      <motion.div 
        className={`aspect-square bg-gradient-to-br ${colors.image} rounded-xl mb-4 relative overflow-hidden`}
        initial={{ opacity: 0.6 }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          className={`absolute inset-0 bg-gradient-to-r ${colors.shimmer}`}
          animate={{ x: ["-100%", "100%"] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.1,
          }}
        />
      </motion.div>

      {/* Text skeleton */}
      <div className="space-y-2">
        <motion.div 
          className={`h-4 bg-gradient-to-r ${colors.text} rounded`}
          initial={{ opacity: 0.6, width: "100%" }}
          animate={{ 
            opacity: [0.6, 1, 0.6],
            width: ["100%", "90%", "100%"]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: index * 0.05
          }}
        />
        <motion.div 
          className={`h-3 bg-gradient-to-r ${colors.text} rounded`}
          initial={{ opacity: 0.6, width: "75%" }}
          animate={{ 
            opacity: [0.6, 1, 0.6],
            width: ["75%", "60%", "75%"]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: (index * 0.05) + 0.3
          }}
        />
      </div>
    </motion.div>
  );
});

// Enhanced SongGrid with motion
const SongGrid = memo(
  ({
    songs,
    showRank = false,
    keyPrefix = "",
    contextMenu,
    setContextMenu,
    handleCloseContextMenu,
    isLoading = false,
    index = 0,
  }) => {
    const { theme } = useTheme();
    const [visibleSongs, setVisibleSongs] = useState(songs.slice(0, 12));
    const [currentIndex, setCurrentIndex] = useState(12);

    useEffect(() => {
      setVisibleSongs(songs.slice(0, 12));
      setCurrentIndex(12);
    }, [songs]);

    const loadMoreSongs = useCallback(() => {
      if (currentIndex < songs.length) {
        const nextBatch = songs.slice(currentIndex, currentIndex + 12);
        setVisibleSongs((prev) => [...prev, ...nextBatch]);
        setCurrentIndex((prev) => prev + 12);
      }
    }, [songs, currentIndex]);

    if (isLoading) {
      return (
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 gap-y-6"
          variants={gridVariants}
          initial="initial"
          animate="animate"
        >
          {Array.from({ length: 12 }).map((_, idx) => (
            <SongCardSkeleton key={`skeleton-${idx}`} index={idx} />
          ))}
        </motion.div>
      );
    }

    if (songs.length === 0) {
      return (
        <motion.div 
          className={`flex flex-col items-center justify-center py-12 text-${theme.colors.text}`}
          variants={emptyStateVariants}
          initial="initial"
          animate="animate"
        >
          <motion.div 
            className="text-4xl mb-4 opacity-50"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            🎵
          </motion.div>
          <motion.p 
            className="text-lg mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Không có bài hát nào
          </motion.p>
          <motion.p 
            className={`text-sm opacity-75 text-${theme.colors.text}/60`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Thể loại này chưa có bài hát
          </motion.p>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
      >
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 gap-y-6"
          variants={gridVariants}
          initial="initial"
          animate="animate"
        >
          {visibleSongs.map((song, idx) => (
            <motion.div
              key={`${keyPrefix}-${song.id}`}
              variants={gridItemVariants}
              custom={idx}
            >
              <Song
                song={song}
                contextMenu={contextMenu}
                setContextMenu={setContextMenu}
                handleCloseContextMenu={handleCloseContextMenu}
                list={songs}
                showRank={showRank}
                rank={showRank ? idx + 1 : undefined}
                index={idx}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Load More Button */}
        <AnimatePresence>
          {currentIndex < songs.length && (
            <motion.div 
              className="text-center mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <motion.button
                onClick={loadMoreSongs}
                className={`px-6 py-3 bg-${theme.colors.card} hover:bg-${theme.colors.cardHover} text-${theme.colors.text} hover:text-white rounded-full transition-colors duration-200 border border-${theme.colors.border}`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  Xem thêm ({songs.length - currentIndex} bài)
                </motion.span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);

// Enhanced TrendingSection with motion
const TrendingSection = memo(
  ({ trendingSongs, contextMenu, setContextMenu, handleCloseContextMenu, index }) => {
    const { theme } = useTheme();
    
    return (
      <Section
        title="Trending ngay bây giờ"
        emoji="🔥"
        index={index}
      >
        <motion.div 
          className="space-y-1"
          variants={gridVariants}
          initial="initial"
          animate="animate"
        >
          {trendingSongs.slice(0, 10).map((song, idx) => (
            <motion.div
              key={`trending-${song.id}`}
              variants={gridItemVariants}
              custom={idx}
            >
              <TrendingSong
                song={song}
                contextMenu={contextMenu}
                setContextMenu={setContextMenu}
                handleCloseContextMenu={handleCloseContextMenu}
                list={trendingSongs}
                rank={idx + 1}
              />
            </motion.div>
          ))}
        </motion.div>
      </Section>
    );
  }
);

// Enhanced Loading State Component
const LoadingState = memo(() => {
  const { theme } = useTheme();

  return (
    <motion.div 
      className="text-white p-4 mr-0 md:mr-2 rounded-lg flex-1 overflow-y-auto scrollbar-spotify"
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div 
          className="text-center space-y-6"
          variants={loadingVariants}
          initial="initial"
          animate="animate"
        >
          {/* Main Loading Animation */}
          <div className="relative">
            {/* Pulsing Circle Background */}
            <motion.div 
              className="absolute inset-0 w-32 h-32 mx-auto"
              variants={pulseVariants}
              animate="animate"
            >
              <div className={`w-full h-full rounded-full bg-${theme.colors.secondary}-500 opacity-20`}></div>
            </motion.div>
            <motion.div 
              className="absolute inset-2 w-28 h-28 mx-auto"
              variants={pulseVariants}
              animate="animate"
              style={{ animationDelay: "0.5s" }}
            >
              <div className={`w-full h-full rounded-full bg-${theme.colors.secondary}-500 opacity-30`}></div>
            </motion.div>

            {/* Central Music Icon */}
            <motion.div 
              className="relative w-32 h-32 mx-auto flex items-center justify-center"
              variants={bounceVariants}
              animate="animate"
            >
              <div className={`w-20 h-20 bg-gradient-to-br from-${theme.colors.primary}-400 to-${theme.colors.secondary}-600 rounded-full flex items-center justify-center`}>
                <motion.svg
                  className="w-10 h-10 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </motion.svg>
              </div>
            </motion.div>
          </div>

          {/* Loading Text with Animation */}
          <div className="space-y-2">
            <motion.h2 
              className={`text-2xl font-bold text-${theme.colors.secondary}-400`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Đang tải nhạc...
            </motion.h2>
            <div className="flex justify-center space-x-1">
              {["🎵", "🎶", "🎵"].map((emoji, idx) => (
                <motion.span
                  key={idx}
                  className="text-2xl"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    delay: idx * 0.2,
                    ease: "easeInOut"
                  }}
                >
                  {emoji}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <motion.div 
            className="w-64 mx-auto"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className={`h-2 bg-${theme.colors.card} rounded-full overflow-hidden`}>
              <motion.div 
                className={`h-full bg-gradient-to-r from-${theme.colors.primary}-500 to-${theme.colors.secondary}-400 rounded-full`}
                initial={{ width: "0%" }}
                animate={{ width: ["0%", "100%", "0%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
});

// Enhanced Error State Component
const ErrorState = memo(({ error }) => {
  const { theme } = useTheme();
  const isTokenError = error.includes("Phiên đăng nhập đã hết hạn") || 
                      error.includes("đăng nhập lại");

  return (
    <motion.div 
      className="text-white p-4 mr-0 md:mr-2 rounded-lg flex-1 overflow-y-auto scrollbar-spotify"
      variants={errorVariants}
      initial="initial"
      animate="animate"
    >
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div 
          className="text-center space-y-6"
          variants={loadingVariants}
          initial="initial"
          animate="animate"
        >
          {/* Error Icon */}
          <div className="relative">
            <motion.div 
              className="w-32 h-32 mx-auto flex items-center justify-center"
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: isTokenError ? [0, 5, -5, 0] : [0, 2, -2, 0]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <div className={`w-20 h-20 bg-gradient-to-br ${isTokenError ? 'from-amber-400 to-orange-600' : 'from-red-400 to-red-600'} rounded-full flex items-center justify-center`}>
                <motion.svg 
                  className="w-10 h-10 text-white" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5, ease: "backOut" }}
                >
                  {isTokenError ? (
                    <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" />
                  ) : (
                    <path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z" />
                  )}
                </motion.svg>
              </div>
            </motion.div>
          </div>

          {/* Error Message */}
          <div className="space-y-3">
            <motion.h2 
              className={`text-2xl font-bold ${isTokenError ? 'text-amber-400' : 'text-red-400'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {isTokenError ? 'Phiên đăng nhập hết hạn' : 'Lỗi tải dữ liệu'}
            </motion.h2>
            <motion.p 
              className={`text-${theme.colors.text} max-w-md mx-auto leading-relaxed`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {error}
            </motion.p>
          </div>

          {/* Action Button */}
          <div className="space-y-3">
            <motion.button
              onClick={() => window.location.reload()}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                isTokenError 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white'
                  : `bg-${theme.colors.secondary}-500 hover:bg-${theme.colors.secondary}-600 text-white`
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              {isTokenError ? 'Đăng nhập lại' : 'Thử lại'}
            </motion.button>
            
            {isTokenError && (
              <motion.p 
                className={`text-sm text-${theme.colors.text}/60`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                Bạn sẽ được chuyển đến trang đăng nhập
              </motion.p>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
});

// Main Enhanced MainContent Component
const MainContent = ({ setCurrentView, setListSongsDetail }) => {
  const { theme } = useTheme();
  const [allSongs, setAllSongs] = useState([]);
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [latestSongs, setLatestSongs] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [genreFilterLoading, setGenreFilterLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    allSongs: false,
    latest: false,
    genres: {},
  });

  const isTokenExpired = (error) => {
    if (error?.response?.status === 401 || 
        error?.response?.status === 403 ||
        error?.status === 401 ||
        error?.status === 403) {
      return true;
    }
    
    const errorMessage = error?.message?.toLowerCase() || 
                        error?.response?.data?.message?.toLowerCase() || 
                        '';
    
    return errorMessage.includes('token') || 
           errorMessage.includes('unauthorized') || 
           errorMessage.includes('authentication') ||
           errorMessage.includes('expired') ||
           errorMessage.includes('invalid token');
  };

  // Memoized handlers
  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleClickOutside = useCallback(
    (e) => {
      if (contextMenu) {
        const contextMenuElement = document.querySelector(".context-menu");
        if (contextMenuElement && !contextMenuElement.contains(e.target)) {
          handleCloseContextMenu();
        }
      }
    },
    [contextMenu, handleCloseContextMenu]
  );

  // Context menu event listeners
  useEffect(() => {
    if (contextMenu) {
      const handleClick = (e) => handleClickOutside(e);
      const handleContextMenuClick = (e) => handleClickOutside(e);

      document.addEventListener("click", handleClick, { passive: true });
      document.addEventListener("contextmenu", handleContextMenuClick, {
        passive: true,
      });

      return () => {
        document.removeEventListener("click", handleClick);
        document.removeEventListener("contextmenu", handleContextMenuClick);
      };
    }
  }, [contextMenu, handleClickOutside]);

  // Initial data fetching
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          songsResponse,
          genresResponse,
          trendingResponse,
          latestResponse,
        ] = await Promise.all([
          getAllSongs(),
          getAllGenres(),
          getTrendingSongs(12),
          getLatestSongs(12),
        ]);

        setAllSongs(songsResponse?.data?.results || []);
        setGenres(genresResponse?.data?.results || []);
        setTrendingSongs(trendingResponse?.data?.results || []);
        setLatestSongs(latestResponse?.data?.results || []);
        setFilteredSongs(songsResponse?.data?.results || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        
        if (isTokenExpired(error)) {
          setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.");
        } else {
          setError("Không thể tải dữ liệu. Vui lòng thử lại.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Handle genre filter selection
  const handleGenreSelect = useCallback(
    async (genre) => {
      setGenreFilterLoading(true);
      setSelectedGenre(genre);

      try {
        if (genre === null) {
          setFilteredSongs(allSongs);
        } else {
          const genreSongs = genre.songs || [];
          setFilteredSongs(genreSongs);
        }
      } catch (error) {
        console.error("Error filtering by genre:", error);
        
        if (isTokenExpired(error)) {
          setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.");
        }
      } finally {
        setGenreFilterLoading(false);
      }
    },
    [allSongs]
  );

  // Quick navigation function
  const handleAllSongs = useCallback(
    async (songs, title, genreId = null) => {
      if (!Array.isArray(songs)) {
        console.warn("Invalid songs data:", songs);
        return;
      }

      if (genreId) {
        setLoadingStates((prev) => ({
          ...prev,
          genres: { ...prev.genres, [genreId]: true },
        }));
      }

      const loadingData = {
        songs: [],
        title: "Đang tải...",
        isLoading: true,
      };
      setListSongsDetail(loadingData);
      setCurrentView("listSongs");

      await new Promise((resolve) => setTimeout(resolve, 300));

      const data = {
        songs,
        title: title || "Songs",
        isLoading: false,
      };
      setListSongsDetail(data);

      if (genreId) {
        setLoadingStates((prev) => ({
          ...prev,
          genres: { ...prev.genres, [genreId]: false },
        }));
      }
    },
    [setListSongsDetail, setCurrentView]
  );

  // Optimized load all songs with progress indication
  const handleLoadAllSongs = useCallback(async () => {
    if (loadingStates.allSongs) return;

    try {
      setLoadingStates((prev) => ({ ...prev, allSongs: true }));

      const loadingToast = {
        songs: [],
        title: "Đang tải tất cả bài hát...",
        isLoading: true,
      };
      setListSongsDetail(loadingToast);
      setCurrentView("listSongs");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      try {
        const allSongsResponse = await getAllSongsWithPagination({
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (allSongsResponse?.data?.results) {
          const data = {
            songs: allSongsResponse.data.results,
            title: `Tất cả bài hát (${allSongsResponse.data.results.length} bài)`,
            isLoading: false,
          };
          setListSongsDetail(data);
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === "AbortError") {
          throw new Error("Request timeout");
        }
        throw fetchError;
      }
    } catch (error) {
      console.error("Error loading all songs:", error);

      let errorMessage = "Không thể tải tất cả bài hát. Vui lòng thử lại.";
      
      if (error.message === "Request timeout") {
        errorMessage = "Tải dữ liệu quá lâu. Vui lòng thử lại.";
      } else if (isTokenExpired(error)) {
        errorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.";
      }

      const errorData = {
        songs: [],
        title: "Lỗi tải dữ liệu",
        error: errorMessage,
        isLoading: false,
      };
      setListSongsDetail(errorData);
    } finally {
      setLoadingStates((prev) => ({ ...prev, allSongs: false }));
    }
  }, [setListSongsDetail, setCurrentView, loadingStates.allSongs]);

  // Optimized load more latest
  const handleLoadMoreLatest = useCallback(async () => {
    if (loadingStates.latest) return;

    try {
      setLoadingStates((prev) => ({ ...prev, latest: true }));

      const loadingData = {
        songs: [],
        title: "Đang tải bài hát mới nhất...",
        isLoading: true,
      };
      setListSongsDetail(loadingData);
      setCurrentView("listSongs");

      const response = await getLatestSongs(50);
      if (response?.data?.results) {
        const data = {
          songs: response.data.results,
          title: "🆕 Bài hát mới nhất",
          isLoading: false,
        };
        setListSongsDetail(data);
      }
    } catch (error) {
      console.error("Error loading more latest songs:", error);
      
      let errorMessage = "Không thể tải bài hát mới. Vui lòng thử lại.";
      
      if (isTokenExpired(error)) {
        errorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.";
      }
      
      const errorData = {
        songs: [],
        title: "Lỗi tải dữ liệu",
        error: errorMessage,
        isLoading: false,
      };
      setListSongsDetail(errorData);
    } finally {
      setLoadingStates((prev) => ({ ...prev, latest: false }));
    }
  }, [setListSongsDetail, setCurrentView, loadingStates.latest]);

  // Handle genre view all with loading state
  const handleGenreViewAll = useCallback(
    (songs, title, genreId) => {
      handleAllSongs(songs, title, genreId);
    },
    [handleAllSongs]
  );

  // Memoized filtered genres
  const validGenres = useMemo(() => {
    return genres.filter(
      (genre) =>
        genre.songs && Array.isArray(genre.songs) && genre.songs.length > 0
    );
  }, [genres]);

  // Memoized display data
  const displayAllSongs = useMemo(() => allSongs.slice(0, 12), [allSongs]);
  const displayTrendingSongs = useMemo(
    () => trendingSongs.slice(0, 10),
    [trendingSongs]
  );

  // Enhanced states with animations
  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <motion.div 
      className="text-white p-3 md:p-4 mr-0 md:mr-2 rounded-lg flex-1 overflow-y-auto space-y-8 scrollbar-spotify pb-8"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Genre Filter Section */}
      <AnimatePresence>
        {validGenres.length > 0 && (
          <GenreFilter
            genres={validGenres}
            selectedGenre={selectedGenre}
            onGenreSelect={handleGenreSelect}
            isLoading={genreFilterLoading}
          />
        )}
      </AnimatePresence>

      {/* Filtered Songs Section (when genre is selected) */}
      <AnimatePresence>
        {selectedGenre && (
          <Section
            title={`${selectedGenre.name}`}
            emoji="🎵"
            onViewAll={() =>
              handleGenreViewAll(
                filteredSongs,
                selectedGenre.name,
                selectedGenre.id
              )
            }
            isLoading={genreFilterLoading}
            index={0}
          >
            <SongGrid
              songs={filteredSongs.slice(0, 12)}
              keyPrefix={`filtered-${selectedGenre.id}`}
              contextMenu={contextMenu}
              setContextMenu={setContextMenu}
              handleCloseContextMenu={handleCloseContextMenu}
              isLoading={genreFilterLoading}
              index={0}
            />
          </Section>
        )}
      </AnimatePresence>

      {/* Show other sections only when no genre is selected */}
      <AnimatePresence>
        {!selectedGenre && (
          <>
            {/* Trending Songs Section */}
            {trendingSongs.length > 0 && (
              <TrendingSection
                trendingSongs={displayTrendingSongs}
                contextMenu={contextMenu}
                setContextMenu={setContextMenu}
                handleCloseContextMenu={handleCloseContextMenu}
                index={0}
              />
            )}

            {/* Latest Songs Section */}
            {latestSongs.length > 0 && (
              <Section
                title="Mới phát hành"
                emoji="🆕"
                onViewAll={handleLoadMoreLatest}
                isLoading={loadingStates.latest}
                index={1}
              >
                <SongGrid
                  songs={latestSongs}
                  keyPrefix="latest"
                  contextMenu={contextMenu}
                  setContextMenu={setContextMenu}
                  handleCloseContextMenu={handleCloseContextMenu}
                  index={1}
                />
              </Section>
            )}

            {/* All Songs Section */}
            {allSongs.length > 0 && (
              <Section
                title="Tất cả bài hát"
                onViewAll={handleLoadAllSongs}
                buttonText="Hiện tất cả"
                isLoading={loadingStates.allSongs}
                index={2}
              >
                <SongGrid
                  songs={displayAllSongs}
                  keyPrefix="all"
                  contextMenu={contextMenu}
                  setContextMenu={setContextMenu}
                  handleCloseContextMenu={handleCloseContextMenu}
                  index={2}
                />
              </Section>
            )}

            {/* Genres Sections */}
            {validGenres.map((genre, idx) => (
              <Section
                key={genre.id}
                title={genre.name}
                onViewAll={() =>
                  handleGenreViewAll(genre.songs, genre.name, genre.id)
                }
                isLoading={loadingStates.genres[genre.id]}
                index={idx + 3}
              >
                <SongGrid
                  songs={genre.songs.slice(0, 12)}
                  keyPrefix={`genre-${genre.id}`}
                  contextMenu={contextMenu}
                  setContextMenu={setContextMenu}
                  handleCloseContextMenu={handleCloseContextMenu}
                  index={idx + 3}
                />
              </Section>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Empty State */}
      <AnimatePresence>
        {allSongs.length === 0 &&
          trendingSongs.length === 0 &&
          latestSongs.length === 0 &&
          validGenres.length === 0 &&
          !loading && (
            <motion.div 
              className={`flex flex-col items-center justify-center h-64 text-${theme.colors.text}`}
              variants={emptyStateVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <motion.div 
                className="text-6xl mb-4 opacity-50"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                🎵
              </motion.div>
              <motion.p 
                className="text-xl mb-2 font-medium"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                No songs available
              </motion.p>
              <motion.p 
                className={`text-sm opacity-75 text-${theme.colors.text}/60`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                Check back later for new content
              </motion.p>
            </motion.div>
          )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MainContent;