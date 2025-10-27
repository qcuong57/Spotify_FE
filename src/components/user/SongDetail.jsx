// src/containers/user/SongDetail.jsx

import React, { useState, useEffect, useCallback, memo } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
  IconHeart,
  IconHeartFilled,
} from "@tabler/icons-react";

// Imports từ Context và Service
import { useTheme } from "../../context/themeContext";
import { useAudio } from "../../utils/audioContext";
import { getSongById } from "../../services/SongsService"; // API mới
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
        aria-label={isCurrentSong && isPlaying ? "Tạm dừng" : "Phát nhạc"}
      >
        {isCurrentSong && isPlaying ? (
          <IconPlayerPauseFilled className="w-8 h-8" />
        ) : (
          <IconPlayerPlayFilled className="w-8 h-8 ml-0.5" />
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
                w-10 h-10 rounded-full flex items-center justify-center 
                text-${theme.colors.text} opacity-80 hover:opacity-100 hover:scale-105 transition-transform
            `}
      aria-label={isLiked ? "Bỏ thích" : "Thêm vào mục yêu thích"}
    >
      {isLiked ? (
        <IconHeartFilled className="w-7 h-7 text-red-500" />
      ) : (
        <IconHeart className="w-7 h-7" />
      )}
    </button>
  );
});

// --- Main Component ---

const SongDetail = ({
  contextMenu,
  setContextMenu,
  handleCloseContextMenu,
}) => {
  const { songId } = useParams(); // Lấy songId từ URL

  const { theme } = useTheme();
  const {
    currentSong: audioCurrentSong,
    playSong,
    isPlaying,
    togglePlayPause,
  } = useAudio();

  const [currentSongDetail, setCurrentSongDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);

  const isCurrentSong =
    audioCurrentSong &&
    currentSongDetail &&
    audioCurrentSong.id === currentSongDetail.id;

  // --- Logic Fetch Data ---
  useEffect(() => {
    if (!songId) {
      setError("Không tìm thấy ID bài hát.");
      setIsLoading(false);
      return;
    }

    const fetchSongDetail = async () => {
      setIsLoading(true);
      setCurrentSongDetail(null);
      setError(null);

      try {
        const response = await getSongById(songId);
        if (response?.data) {
          setCurrentSongDetail(response.data);
          // Giả định: API trả về trạng thái is_liked
          setIsLiked(response.data.is_liked || false);
        } else {
          setError("Bài hát này không tồn tại.");
        }
      } catch (err) {
        console.error("Error fetching song detail:", err);
        setError("Lỗi khi tải chi tiết bài hát. Vui lòng kiểm tra kết nối.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongDetail();
  }, [songId]);

  // --- Logic Xử lý Playback ---
  const handlePlayPause = useCallback(() => {
    if (!currentSongDetail) return;

    if (isCurrentSong) {
      togglePlayPause();
    } else {
      // Chơi bài hát mới
      playSong(currentSongDetail, [currentSongDetail]);
    }
  }, [currentSongDetail, isCurrentSong, playSong, togglePlayPause]);

  // --- Logic Xử lý Like (Giả lập) ---
  const handleToggleLike = useCallback(() => {
    // Thực hiện API gọi toggleLikeService(currentSongDetail.id) ở đây
    // Sau đó cập nhật state isLiked
    setIsLiked((prev) => !prev);
  }, []);

  // --- Render Logic ---

  if (isLoading) {
    return <LoadingState message={`Đang tải chi tiết bài hát...`} />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!currentSongDetail) {
    return <ErrorState error="Bài hát bạn tìm không tồn tại hoặc đã bị xóa." />;
  }

  const genreName = currentSongDetail.genre?.name || "Unknown Genre";
  // Tạo gradient nền đầu trang dựa trên màu theme
  const headerBackground = `bg-gradient-to-b from-${theme.colors.cardHover}/70 to-transparent`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className={`text-${theme.colors.text} flex-1 overflow-y-auto scrollbar-spotify`}
    >
      <div className={`min-h-full p-4 md:p-8 space-y-8 ${headerBackground}`}>
        {/* A. PHẦN HEADER VÀ THÔNG TIN BÀI HÁT */}
        <header className="flex flex-col sm:flex-row items-end sm:items-center space-x-0 sm:space-x-6">
          {/* Album Art */}
          <motion.img
            src={currentSongDetail.image}
            alt={currentSongDetail.song_name}
            className="w-48 h-48 sm:w-64 sm:h-64 object-cover rounded-xl shadow-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          />

          {/* Info */}
          <div className="mt-4 sm:mt-0">
            <p className="text-sm font-bold uppercase opacity-70">Bài hát</p>
            <motion.h1
              className="text-4xl md:text-6xl font-black mt-1 leading-tight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {currentSongDetail.song_name}
            </motion.h1>
            <p
              className={`text-lg md:text-2xl font-medium opacity-80 mt-2 text-${theme.colors.textHover}`}
            >
              {currentSongDetail.singer_name}
            </p>
            <p
              className={`text-sm opacity-60 mt-1 text-${theme.colors.text}/70`}
            >
              {currentSongDetail.album_name
                ? `Album: ${currentSongDetail.album_name} • `
                : ""}
              Thể loại: {genreName} • Lượt nghe:{" "}
              {currentSongDetail.play_count?.toLocaleString() || 0}
            </p>
          </div>
        </header>

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

          {/* Nút Context Menu có thể được thêm vào đây */}
        </section>

        <hr className={`my-8 border-${theme.colors.border}`} />

        {/* C. PHẦN GỢI Ý BÀI HÁT LIÊN QUAN */}
        <RelatedSongsSection
          songId={currentSongDetail.id}
          songGenreName={genreName}
          contextMenu={contextMenu}
          setContextMenu={setContextMenu}
          handleCloseContextMenu={handleCloseContextMenu}
        />

        {/* D. PHẦN LYRICS, COMMENT, etc. */}
      </div>
    </motion.div>
  );
};

export default SongDetail;
