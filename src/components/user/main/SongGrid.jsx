import React, { memo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../context/themeContext";
import Song from "./../_Song";
import SongCardSkeleton from "./SongCardSkeleton";

const gridVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
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
    },
  }),
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
    },
  },
};

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
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
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
          </motion.p>{" "}
          {/* ✅ đúng */}
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

export default SongGrid;
