// src/components/user/main/RelatedSongsSection.jsx

import React, { memo } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/themeContext";
import Section from "./main/Section";
import SongGrid from "./main/SongGrid";

const sectionVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const RelatedSongsSection = memo(
  ({
    songs, // NHẬN TRỰC TIẾP TỪ PROPS
    songGenreName,
    contextMenu,
    setContextMenu,
    handleCloseContextMenu,
  }) => {
    // Không cần theme ở đây trừ khi <Section> hoặc <SongGrid> cần
    // const { theme } = useTheme();

    // Dùng memoization cho các props của SongGrid
    const gridProps = { contextMenu, setContextMenu, handleCloseContextMenu };

    // BỎ check loading (vì cha đã check)
    // BỎ if (!songs || songs.length === 0) return null; (vì cha đã check)
    
    // Hàm onViewAll (Giữ nguyên)
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
          {/* KHỐI NÀY LÀ QUAN TRỌNG NHẤT:
            Không còn bất kỳ toán tử 3 ngôi (ternary) hay if/else nào ở đây.
            Chúng ta render SongGrid trực tiếp, vì chúng ta biết
            component này chỉ được render khi đã có data.
          */}
          <SongGrid
            songs={songs} // Dùng 'songs' từ props
            keyPrefix={`related-songs`}
            {...gridProps}
            isLoading={false} // Gán cứng là FALSE, vì SongDetail đã đảm bảo data sẵn sàng
            index={10}
          />
        </Section>
      </motion.div>
    );
  }
);

export default RelatedSongsSection; 