import React, { memo } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../../context/themeContext";

const SongInfo = memo(({ currentSong }) => {
  const { theme } = useTheme();

  return (
    <div className="flex items-center gap-3 w-1/3">
      <motion.div
        className="w-12 h-12 rounded-lg overflow-hidden relative"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <img
          src={currentSong?.image || "/default-song.jpg"}
          alt={currentSong?.title || "Song"}
          className="w-full h-full object-cover"
          onError={(e) => (e.target.src = "/default-song.jpg")}
        />
      </motion.div>
      <div className="flex flex-col">
        <motion.span
          className={`text-sm font-medium truncate max-w-[150px] md:max-w-[200px] text-${theme.colors.text}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {currentSong?.title || "No song selected"}
        </motion.span>
        <motion.span
          className={`text-xs text-${theme.colors.text}/60 truncate max-w-[150px] md:max-w-[200px]`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {currentSong?.artist || "Unknown artist"}
        </motion.span>
      </div>
    </div>
  );
});

export default SongInfo;