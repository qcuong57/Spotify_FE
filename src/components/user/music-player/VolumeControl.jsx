import React, { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../../context/themeContext";
import { formatTime } from "../../../utils/timeFormat";

const ProgressBar = memo(
  ({ currentTime, duration, handleSeek }) => {
    const { theme } = useTheme();

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    const handleProgressClick = useCallback(
      (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const newTime = (clickX / width) * duration;
        handleSeek(newTime);
      },
      [duration, handleSeek]
    );

    return (
      <div className="flex items-center gap-2 w-full max-w-md">
        <span className={`text-xs text-${theme.colors.text}/60`}>
          {formatTime(currentTime)}
        </span>
        <div
          className={`flex-1 h-1 bg-${theme.colors.card} rounded-full cursor-pointer relative overflow-hidden`}
          onClick={handleProgressClick}
        >
          <motion.div
            className={`h-full bg-gradient-to-r from-${theme.colors.primary}-500 to-${theme.colors.secondary}-500 rounded-full`}
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          />
        </div>
        <span className={`text-xs text-${theme.colors.text}/60`}>
          {formatTime(duration)}
        </span>
      </div>
    );
  }
);

export default ProgressBar;