import React, { memo } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../../context/themeContext";

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

export default SongCardSkeleton;