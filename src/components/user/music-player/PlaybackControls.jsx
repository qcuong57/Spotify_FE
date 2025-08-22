import React, { memo } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../../context/themeContext";

const buttonVariants = {
  hover: {
    scale: 1.1,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
    },
  },
};

const PlaybackControls = memo(
  ({
    isPlaying,
    togglePlayPause,
    handleNext,
    handlePrevious,
    shuffle,
    toggleShuffle,
    repeat,
    toggleRepeat,
  }) => {
    const { theme } = useTheme();

    return (
      <div className="flex items-center gap-2 md:gap-4">
        {/* Shuffle Button */}
        <motion.button
          onClick={toggleShuffle}
          className={`p-2 rounded-full ${
            shuffle
              ? `text-${theme.colors.secondary}-400`
              : `text-${theme.colors.text}`
          } hover:text-${theme.colors.secondary}-400 transition-colors duration-200`}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          title={shuffle ? "Tắt trộn bài" : "Bật trộn bài"}
        >
          <svg
            className="w-5 h-5 md:w-6 md:h-6"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M14.83 13.83l-2.83 2.83V15H9.17l-2.83 2.83H4v-2h2.17l2.83-2.83H11v-1.66l2.83-2.83H16v-2h-2.17l2.83-2.83 1.41 1.41L13.41 9H18v6h-2.17l-1-1zM6 7h2.17l2.83 2.83H4v-2zm0 10h2.17l2.83-2.83H4v2z" />
          </svg>
        </motion.button>

        {/* Previous Track */}
        <motion.button
          onClick={handlePrevious}
          className={`p-2 rounded-full text-${theme.colors.text} hover:text-${theme.colors.secondary}-400 transition-colors duration-200`}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          title="Bài trước"
        >
          <svg
            className="w-5 h-5 md:w-6 md:h-6"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </motion.button>

        {/* Play/Pause Button */}
        <motion.button
          onClick={togglePlayPause}
          className={`p-3 rounded-full bg-gradient-to-r from-${theme.colors.primary}-500 to-${theme.colors.secondary}-500 text-white hover:from-${theme.colors.primary}-600 hover:to-${theme.colors.secondary}-600 transition-all duration-200 shadow-md`}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          title={isPlaying ? "Tạm dừng" : "Phát"}
        >
          {isPlaying ? (
            <svg
              className="w-6 h-6 md:w-8 md:h-8"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg
              className="w-6 h-6 md:w-8 md:h-8"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </motion.button>

        {/* Next Track */}
        <motion.button
          onClick={handleNext}
          className={`p-2 rounded-full text-${theme.colors.text} hover:text-${theme.colors.secondary}-400 transition-colors duration-200`}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          title="Bài tiếp theo"
        >
          <svg
            className="w-5 h-5 md:w-6 md:h-6"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
          </svg>
        </motion.button>

        {/* Repeat Button */}
        <motion.button
          onClick={toggleRepeat}
          className={`p-2 rounded-full ${
            repeat
              ? `text-${theme.colors.secondary}-400`
              : `text-${theme.colors.text}`
          } hover:text-${theme.colors.secondary}-400 transition-colors duration-200`}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          title={
            repeat === "all"
              ? "Tắt lặp lại"
              : repeat === "one"
              ? "Lặp lại danh sách"
              : "Lặp lại một bài"
          }
        >
          <svg
            className="w-5 h-5 md:w-6 md:h-6"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            {repeat === "one" ? (
              <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z" />
            ) : (
              <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
            )}
          </svg>
        </motion.button>
      </div>
    );
});

export default PlaybackControls;