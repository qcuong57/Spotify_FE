import React, { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../context/themeContext";

const modalVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: { 
    opacity: 0, 
    scale: 0.8,
    transition: {
      duration: 0.2,
    },
  },
};

const PlayerModal = memo(
  ({
    isModalOpen,
    setIsModalOpen,
    currentSong,
    formatTime,
    currentTime,
    duration,
  }) => {
    const { theme } = useTheme();

    return (
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              className={`bg-${theme.colors.card} rounded-2xl p-6 max-w-md w-full shadow-2xl border border-${theme.colors.border}`}
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <div className="flex flex-col items-center gap-4">
                <motion.div
                  className="w-64 h-64 rounded-xl overflow-hidden relative"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <img
                    src={currentSong?.image || "/default-song.jpg"}
                    alt={currentSong?.title || "Song"}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target.src = "/default-song.jpg")}
                  />
                </motion.div>
                <div className="text-center">
                  <motion.h3
                    className={`text-xl font-bold text-${theme.colors.text}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  >
                    {currentSong?.title || "No song selected"}
                  </motion.h3>
                  <motion.p
                    className={`text-sm text-${theme.colors.text}/60`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                  >
                    {currentSong?.artist || "Unknown artist"}
                  </motion.p>
                </div>
                <div className="flex items-center gap-2 w-full">
                  <span className={`text-xs text-${theme.colors.text}/60`}>
                    {formatTime(currentTime)}
                  </span>
                  <div className={`flex-1 h-2 bg-${theme.colors.card} rounded-full`} />
                  <span className={`text-xs text-${theme.colors.text}/60`}>
                    {formatTime(duration)}
                  </span>
                </div>
                <motion.button
                  onClick={() => setIsModalOpen(false)}
                  className={`mt-4 px-6 py-2 rounded-full bg-gradient-to-r from-${theme.colors.primary}-500 to-${theme.colors.secondary}-500 text-white hover:from-${theme.colors.primary}-600 hover:to-${theme.colors.secondary}-600 transition-all duration-200`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Đóng
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);

export default PlayerModal;