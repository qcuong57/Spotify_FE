import React, { memo } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../../context/themeContext";

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

export default LoadingState;