// src/components/user/main/RelatedSongsSection.jsx

import React, { useEffect, useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getRelatedSongs } from "../../services/SongsService";
import { useTheme } from "../../context/themeContext";
import Section from "./main/Section";
import SongGrid from "./main/SongGrid";
import LoadingGrid from "./LoadingGrid";

const sectionVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  exit: { opacity: 0, y: -20 },
};

const RelatedSongsSection = memo(
  ({ 
      songId, 
      songGenreName, // Tên thể loại của bài hát hiện tại để hiển thị tiêu đề
      contextMenu, 
      setContextMenu, 
      handleCloseContextMenu 
    }) => {
    
    const { theme } = useTheme();
    const [relatedSongs, setRelatedSongs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Dùng memoization cho các props của SongGrid
    const gridProps = { contextMenu, setContextMenu, handleCloseContextMenu };

    useEffect(() => {
      if (!songId) return;

      const fetchRelatedSongs = async () => {
        setIsLoading(true);
        setError(null);

        try {
          // Lấy 12 bài hát liên quan để hiển thị
          const response = await getRelatedSongs(songId, 12);
          
          if (response?.data?.results?.length > 0) {
            setRelatedSongs(response.data.results);
          } else {
            setRelatedSongs([]);
          }

        } catch (err) {
          console.error("Error fetching related songs:", err);
          setError("Không thể tải các bài hát liên quan.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchRelatedSongs();
    }, [songId]); // Gọi lại API khi ID bài hát thay đổi

    // Xử lý khi không có bài hát liên quan
    if (!isLoading && relatedSongs.length === 0) return null;

    // Hàm onViewAll (có thể điều hướng đến trang listSongs với filter theo Genre)
    const handleViewAll = () => {
      // Logic điều hướng đến trang danh sách bài hát cùng thể loại
      console.log(`Maps to genre list: ${songGenreName}`);
      // Nếu bạn muốn hiển thị toàn bộ 50 bài related (chứ không phải toàn bộ genre)
      // bạn sẽ cần một hàm load đầy đủ ở đây
    };

    return (
      <AnimatePresence>
        {isLoading || relatedSongs.length > 0 ? (
          <motion.div
            variants={sectionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="mt-8"
          >
            <Section
              title={songGenreName 
                       ? `Khám phá thêm: ${songGenreName}` 
                       : "Bài hát tương tự"}
              emoji="💡"
              onViewAll={handleViewAll}
              buttonText="Xem tất cả"
              isLoading={isLoading}
              index={10} // Index cao vì đây là secondary content
            >
              {isLoading ? (
                // Hiển thị khung tải 6 cột, 2 hàng
                <LoadingGrid count={12} cols={6} isHorizontal={false} />
              ) : (
                <SongGrid
                  songs={relatedSongs}
                  keyPrefix={`related-${songId}`}
                  {...gridProps}
                  isLoading={false}
                  index={10}
                />
              )}
            </Section>
          </motion.div>
        ) : null}
      </AnimatePresence>
    );
  }
);

export default RelatedSongsSection;