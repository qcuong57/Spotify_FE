import React, { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../context/themeContext";

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

export default GenreFilter;