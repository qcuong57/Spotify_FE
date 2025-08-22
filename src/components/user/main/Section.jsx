import React, { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../context/themeContext";

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
export default Section;