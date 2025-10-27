// src/containers/user/SongDetail.jsx

import React, { useState, useEffect, useCallback, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; 
import {
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
  IconHeart,
  IconHeartFilled,
  IconX,
} from "@tabler/icons-react";

// Imports từ Context và Service
import { useTheme } from "../../context/themeContext";
import { useAudio } from "../../utils/audioContext";
import { getSongById } from "../../services/SongsService";
// import { toggleLikeService } from '../../services/SongPlaylistService'; // Giả định API like

// Imports từ Components
import RelatedSongsSection from "./RelatedSongsSection";
import LoadingState from "../../components/user/main/LoadingState";
import ErrorState from "../../components/user/main/ErrorState";

// --- Helper Components for UI ---

const PlayButton = memo(
  ({ isCurrentSong, isPlaying, handlePlayPause, theme }) => {
    return (
      <button
        onClick={handlePlayPause}
        className={`
                w-16 h-16 rounded-full flex items-center justify-center shadow-2xl
                transition-all duration-300 transform active:scale-95
                text-black
                bg-${theme.colors.button} hover:bg-${theme.colors.buttonHover}
            `}
        aria-label={isCurrentSong && isPlaying ? "Tạm dừng" : "Phát"}
      >
        {isCurrentSong && isPlaying ? (
          <IconPlayerPauseFilled className="w-8 h-8" />
        ) : (
          <IconPlayerPlayFilled className="w-8 h-8 translate-x-[1px]" />
        )}
      </button>
    );
  }
);

const LikeButton = memo(({ isLiked, onToggleLike, theme }) => {
  return (
    <button
      onClick={onToggleLike}
      className={`
                w-12 h-12 rounded-full flex items-center justify-center 
                text-white transition-colors duration-200
                bg-${theme.colors.cardHover}/50 hover:bg-${theme.colors.cardHover}/80
                backdrop-blur-sm
            `}
      aria-label={isLiked ? "Bỏ thích bài hát" : "Thích bài hát"}
    >
      {isLiked ? (
        <IconHeartFilled className="w-6 h-6 text-red-500" />
      ) : (
        <IconHeart className="w-6 h-6 opacity-80" />
      )}
    </button>
  );
});

// --- Main Component ---

const SongDetail = () => {
  const { songId } = useParams();
  const navigate = useNavigate();

  const { theme } = useTheme();
  const {
    currentSong: audioCurrentSong,
    setNewPlaylist, 
    isPlaying,
    togglePlay, 
  } = useAudio();

  const [currentSongDetail, setCurrentSongDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);

  const isCurrentSong = audioCurrentSong && audioCurrentSong.id === currentSongDetail?.id;

  // --- LOGIC FETCH SONG DETAIL ---
  const fetchSongDetail = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSongById(id);
      if (data) {
        setCurrentSongDetail(data);
        setIsLiked(data.is_liked || false);
      } else {
        setError("Không tìm thấy chi tiết bài hát.");
      }
    } catch (err) {
      console.error("Lỗi khi fetch chi tiết bài hát:", err);
      setError("Không thể tải chi tiết bài hát. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (songId) {
      fetchSongDetail(songId);
    }
  }, [songId, fetchSongDetail]);
  
  // --- LOGIC PHÁT NHẠC (ĐÃ SỬA: SỬ DỤNG togglePlay) ---
  const handlePlayPause = useCallback(
    (e) => {
      e.stopPropagation();

      if (!currentSongDetail) return;
      
      if (!isCurrentSong) {
        // Phát bài hát mới bằng cách set một playlist 1 bài
        if (setNewPlaylist) {
             setNewPlaylist([currentSongDetail], 0);
        } else {
             console.warn("setNewPlaylist is missing from AudioContext.");
        }
      } else {
        // Toggle nếu nó là bài đang phát
        if (typeof togglePlay === 'function') {
            togglePlay();
        } else {
            console.warn("togglePlay is not a function in AudioContext.");
        }
      }
    },
    [currentSongDetail, isCurrentSong, setNewPlaylist, togglePlay] 
  );
  
  // --- LOGIC NÚT ĐÓNG ---
  const handleClose = useCallback(() => {
    navigate(-1); // Quay lại trang trước đó
  }, [navigate]);

  // --- Logic Xử lý Like (Giả lập) ---
  const handleToggleLike = useCallback((e) => {
    e.stopPropagation();
    setIsLiked(prev => !prev);
  }, []);

  // --- Render Logic ---

  // Lớp gradient nhẹ cho header, vẫn giữ nguyên
  const headerBackground = `bg-gradient-to-b from-${theme.colors.cardHover}/70 to-transparent`;

  // Bọc logic render trong AnimatePresence
  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          // THAY ĐỔI: Sử dụng bg-black
          className={`text-${theme.colors.text} flex-1 overflow-y-auto scrollbar-spotify pt-12 bg-black`}
        >
          <LoadingState message={`Đang tải chi tiết bài hát...`} />
        </motion.div>
      ) : error || !currentSongDetail ? (
        <motion.div
          key="error"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          // THAY ĐỔI: Sử dụng bg-black
          className={`text-${theme.colors.text} flex-1 overflow-y-auto scrollbar-spotify pt-12 bg-black`}
        >
          <ErrorState message={error} />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }} 
          // THAY ĐỔI: Sử dụng bg-black
          className={`text-${theme.colors.text} flex-1 overflow-y-auto scrollbar-spotify pt-12 bg-black`} 
        >
          <div className={`min-h-full p-4 md:p-8 space-y-8 ${headerBackground}`}>
            
            {/* NÚT ĐÓNG */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex justify-end mb-2" 
            >
              <button
                onClick={handleClose}
                className={`p-2 rounded-full backdrop-blur-md transition-colors duration-200 
                    bg-white/10 hover:bg-white/20 text-${theme.colors.text} hover:text-white 
                    shadow-lg transform hover:scale-105 active:scale-95`}
                title="Đóng chi tiết bài hát"
              >
                <IconX className="w-6 h-6" />
              </button>
            </motion.div>
            
            {/* A. PHẦN HEADER VÀ THÔNG TIN BÀI HÁT */}
            <header className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6 items-start"> 
              
              {/* Album Art */}
              <motion.div 
                className="flex justify-center md:justify-start md:col-span-1"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }} 
              >
                <img
                  src={currentSongDetail.image}
                  alt={currentSongDetail.song_name}
                  className="w-48 h-48 sm:w-64 sm:h-64 object-cover rounded-xl shadow-2xl"
                />
              </motion.div>

              {/* Info & Controls */}
              <motion.div 
                className="md:col-span-2 xl:col-span-3 flex flex-col justify-start min-w-0 mt-4 md:mt-0" 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Tên bài hát */}
                <h1
                  className={`text-4xl sm:text-5xl lg:text-5xl font-extrabold line-clamp-2 
                                text-${theme.colors.title} mb-2`}
                  title={currentSongDetail.song_name} 
                >
                  {currentSongDetail.song_name}
                </h1>
                
                {/* Ca sĩ */}
                <p
                  className={`text-lg sm:text-xl font-semibold 
                                text-${theme.colors.text}`}
                >
                  {currentSongDetail.singer_name}
                </p>
                
                {/* Album và Lượt nghe */}
                <p
                  className={`text-sm opacity-60 mt-1 text-${theme.colors.text}/70`}
                >
                  {currentSongDetail.album_name
                    ? `Album: ${currentSongDetail.album_name} • `
                    : ""}
                  Lượt nghe:{" "}
                  {currentSongDetail.play_count?.toLocaleString() || 0}
                </p>
                
                {/* B. PHẦN ĐIỀU KHIỂN & TƯƠNG TÁC */}
                <section className="flex items-center space-x-6 pt-4">
                  <PlayButton
                    isCurrentSong={isCurrentSong}
                    isPlaying={isPlaying}
                    handlePlayPause={handlePlayPause}
                    theme={theme}
                  />

                  <LikeButton
                    isLiked={isLiked}
                    onToggleLike={handleToggleLike}
                    theme={theme}
                  />
                </section>

              </motion.div>
            </header>

            <hr className={`my-8 border-${theme.colors.border}`} />

            {/* C. PHẦN GỢI Ý BÀI HÁT LIÊN QUAN */}
            <RelatedSongsSection
              songId={currentSongDetail.id}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SongDetail;