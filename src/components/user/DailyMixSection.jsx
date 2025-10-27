// src/components/user/main/DailyMixSection.jsx

import React, { useEffect, useState, useMemo, memo } from "react";
import { motion } from "framer-motion";
import { getDailyMixSongs } from "../../services/SongsService";
import Section from "./main/Section";
import SongGrid from "./main/SongGrid";

const DailyMixSection = memo(
  ({ contextMenu, setContextMenu, handleCloseContextMenu, setCurrentView, setListSongsDetail, index }) => {
    const [dailyMixSongs, setDailyMixSongs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mixTitle, setMixTitle] = useState("Daily Mix");

    useEffect(() => {
      const fetchDailyMix = async () => {
        try {
          setIsLoading(true);
          setError(null);
          
          // Gọi API lấy Daily Mix Songs
          const response = await getDailyMixSongs(50); // Lấy 12 bài để hiển thị trên grid
          
          if (response?.data?.results?.length > 0) {
            setDailyMixSongs(response.data.results);
            setMixTitle(response.data.title || "Daily Mix của bạn");
          } else {
            setDailyMixSongs([]);
          }

        } catch (err) {
          console.error("Error fetching daily mix:", err);
          setError("Không thể tải Daily Mix. Vui lòng thử lại sau.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchDailyMix();
    }, []);

    const handleViewAll = () => {
      if (dailyMixSongs.length === 0) return;
      
      const data = {
        songs: dailyMixSongs,
        title: mixTitle,
        isLoading: false,
      };
      setListSongsDetail(data);
      setCurrentView("listSongs");
    };

    if (error) {
        // Tùy chọn: Thay vì hiển thị ErrorState toàn màn hình, chỉ hiển thị lỗi trong section
        return <ErrorState error={error} />; 
    }

    if (!isLoading && dailyMixSongs.length === 0) return null;

    return (
      <Section
        title={mixTitle}
        emoji="🎧"
        onViewAll={handleViewAll}
        buttonText="Nghe toàn bộ"
        isLoading={isLoading}
        index={index}
      >
        <SongGrid
          songs={dailyMixSongs}
          keyPrefix="daily-mix"
          contextMenu={contextMenu}
          setContextMenu={setContextMenu}
          handleCloseContextMenu={handleCloseContextMenu}
          isLoading={isLoading}
          index={index}
        />
      </Section>
    );
  }
);

export default DailyMixSection;