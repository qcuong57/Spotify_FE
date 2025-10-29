// src/components/user/main/RelatedSongsSection.jsx

import React, { memo } from "react";
import { motion } from "framer-motion";
import Section from "./main/Section"; // Đảm bảo đường dẫn đúng
import SongGrid from "./main/SongGrid"; // Đảm bảo đường dẫn đúng

const sectionVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const RelatedSongsSection = memo(
  ({
    songs,
    songGenreName,
    contextMenu,
    setContextMenu,
    handleCloseContextMenu,
    onSongSelect, // <-- 1. NHẬN PROP MỚI
  }) => {
    
    // Dùng memoization cho các props của SongGrid
    const gridProps = {
      contextMenu,
      setContextMenu,
      handleCloseContextMenu,
      onSongSelect, // <-- 2. THÊM VÀO PROPS
    };

    const handleViewAll = () => {
      console.log(`Maps to genre list: ${songGenreName}`);
    };

    return (
      <motion.div
        variants={sectionVariants}
        initial="initial"
        animate="animate"
        className="mt-8"
      >
        <Section
          title={
            songGenreName
              ? `Khám phá thêm: ${songGenreName}`
              : "Bài hát tương tự"
          }
          emoji="💡"
          onViewAll={handleViewAll}
          buttonText="Xem tất cả"
          index={10}
        >
          <SongGrid
            songs={songs}
            keyPrefix={`related-songs`}
            {...gridProps} // <-- 3. TRUYỀN XUỐNG TẠI ĐÂY
            isLoading={false}
            index={10}
          />
        </Section>
      </motion.div>
    );
  }
);

export default RelatedSongsSection;