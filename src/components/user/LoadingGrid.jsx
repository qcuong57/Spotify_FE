import React, { memo } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/themeContext"; // Import useTheme

const LoadingItem = memo(({ isHorizontal }) => {
  const { theme } = useTheme(); // Sử dụng theme context

  // Màu sắc lấy từ theme hoặc default nếu không có
  const backgroundColor = theme.colors.primaryBackground || "bg-gray-800"; // Màu nền đậm hơn
  const highlightColor = theme.colors.secondaryBackground || "bg-gray-700"; // Màu sáng hơn cho các đường loading

  const containerClass = isHorizontal
    ? `flex items-center gap-4 p-3 rounded-lg animate-pulse ${backgroundColor}`
    : `flex flex-col space-y-2 ${backgroundColor} p-4 rounded-lg`; // Thêm p-4, rounded-lg cho thẻ đứng
  
  const imageClass = isHorizontal
    ? `w-12 h-12 rounded-md ${highlightColor} flex-shrink-0`
    : `w-full h-32 rounded-lg ${highlightColor}`;
  
  const textContainerClass = isHorizontal
    ? "flex-1 min-w-0 space-y-1"
    : "space-y-1 mt-2";
  
  const line1Class = `h-3 ${highlightColor} rounded w-3/4`;
  const line2Class = `h-2.5 ${highlightColor} rounded w-1/2`;

  return (
    <div className={containerClass}>
      <div className={imageClass} />
      <div className={textContainerClass}>
        <div className={line1Class} />
        <div className={line2Class} />
      </div>
    </div>
  );
});

const LoadingGrid = memo(({ count = 6, cols = 6, isHorizontal = false }) => {
  const gridClass = isHorizontal
    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    : `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-${cols} gap-4`;

  return (
    <motion.div className={gridClass}>
      {[...Array(count)].map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: index * 0.05 }}
        >
          <LoadingItem isHorizontal={isHorizontal} />
        </motion.div>
      ))}
    </motion.div>
  );
});

export default LoadingGrid;