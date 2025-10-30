// src/containers/user/SongDetail.jsx

import React, {
  useState,
  useEffect,
  useCallback,
  memo,
  useMemo,
  useRef, // <-- 1. THÊM MỚI
} from "react";
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
import { getSongNameById, getRelatedSongs } from "../../services/SongsService";
// import { toggleLikeService } from '../../services/SongPlaylistService'; // Giả định API like

// Imports từ Components
import RelatedSongsSection from "./RelatedSongsSection"; // ĐỔI TÊN ĐƯỜNG DẪN NẾU CẦN
import LoadingState from "../../components/user/main/LoadingState";
import ErrorState from "../../components/user/main/ErrorState";

// --- Helper Components (Giữ nguyên) ---
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

const SongDetail = ({ songId, onClose }) => {
  const { theme } = useTheme();
  const {
    currentSong: audioCurrentSong,
    setNewPlaylist,
    isPlaying,
    togglePlay,
  } = useAudio();

  // --- 2. THÊM STATE MỚI VÀ REF ---
  const [currentDisplayId, setCurrentDisplayId] = useState(songId); // ID bài hát đang hiển thị
  const scrollRef = useRef(null); // Ref cho div cuộn

  const [currentSongDetail, setCurrentSongDetail] = useState(null);
  const [relatedSongs, setRelatedSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);

  const [contextMenu, setContextMenu] = useState({
    show: false,
    x: 0,
    y: 0,
    song: null,
  });
  const handleCloseContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, show: false }));
  }, []);

  const isCurrentSong =
    audioCurrentSong && audioCurrentSong.id === currentSongDetail?.id;

  // --- LOGIC FETCH ALL DATA ---
  // (Không thay đổi logic bên trong, chỉ thay đổi cách nó được gọi)
  const fetchAllData = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    setCurrentSongDetail(null); // Reset để kích hoạt loading
    setRelatedSongs([]);

    try {
      const [detailData, relatedResponse] = await Promise.all([
        getSongNameById(id),
        getRelatedSongs(id, 12), // Vẫn lấy 12, service sẽ giới hạn 8
      ]);

      if (detailData) {
        setCurrentSongDetail(detailData);
        setIsLiked(detailData.is_liked || false);
      } else {
        throw new Error("Không tìm thấy chi tiết bài hát.");
      }

      if (relatedResponse?.data?.results) {
        setRelatedSongs(relatedResponse.data.results);
      }

    } catch (err) {
      console.error("❌ Lỗi khi fetch dữ liệu:", err);
      setError(err.message || "Không thể tải dữ liệu. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }, []); // Bỏ [fetchAllData] khỏi dependency array nếu nó được định nghĩa bên trong

  // --- CẬP NHẬT useEffects ---

  // Effect 1: Đồng bộ prop `songId` vào state `currentDisplayId`
  // (Khi modal được mở lại với 1 bài hát khác từ bên ngoài)
  useEffect(() => {
    if (songId !== currentDisplayId) {
      setCurrentDisplayId(songId);
    }
  }, [songId]);

  // Effect 2: Tải dữ liệu bất cứ khi nào `currentDisplayId` thay đổi
  useEffect(() => {
    if (currentDisplayId) {
      fetchAllData(currentDisplayId);
    }
  }, [currentDisplayId, fetchAllData]);

  // --- LOGIC PHÁT NHẠC (Giữ nguyên) ---
  const handlePlayPause = useCallback(
    (e) => {
      e.stopPropagation();
      if (!currentSongDetail) return;
      if (!isCurrentSong) {
        if (setNewPlaylist) {
          setNewPlaylist([currentSongDetail], 0);
        }
      } else {
        if (typeof togglePlay === "function") {
          togglePlay();
        }
      }
    },
    [currentSongDetail, isCurrentSong, setNewPlaylist, togglePlay]
  );

  // --- LOGIC NÚT ĐÓNG (Giữ nguyên) ---
  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  // --- Logic Xử lý Like (Giữ nguyên) ---
  const handleToggleLike = useCallback((e) => {
    e.stopPropagation();
    setIsLiked((prev) => !prev);
  }, []);

  // --- 3. HÀM MỚI: XỬ LÝ CLICK BÀI HÁT LIÊN QUAN ---
  const handleRelatedSongSelect = useCallback(
    (newSongId) => {
      if (newSongId !== currentDisplayId) {
        // Cuộn modal lên đầu
        if (scrollRef.current) {
          scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
        }
        // Thay đổi ID, việc này sẽ kích hoạt Effect 2
        setCurrentDisplayId(newSongId);
      }
    },
    [currentDisplayId]
  );

  // --- Render Logic ---
  const headerBackground = useMemo(
    () => `bg-gradient-to-b from-${theme.colors.cardHover}/60 to-transparent`,
    [theme.colors.cardHover]
  );

  return (
    <div
      className="fixed inset-0 z-[20000] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* 1. BACKDROP (Lớp mờ) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-lg"
        onClick={handleClose}
      />

      {/* 2. MODAL PANEL (Khung nội dung) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`relative z-10 w-full h-full max-w-4xl max-h-[90vh] 
                    bg-gradient-to-br ${theme.colors.background} 
                    rounded-lg overflow-hidden flex flex-col 
                    shadow-2xl shadow-${theme.colors.songShadow}`}
      >
        {/* NÚT ĐÓNG */}
        <button
          onClick={handleClose}
          className={`absolute top-3 right-3 z-50 p-2 rounded-full backdrop-blur-md transition-colors duration-200 
                bg-white/10 hover:bg-white/20 text-${theme.colors.text} hover:text-white 
                shadow-lg transform hover:scale-105 active:scale-95`}
          title="Đóng chi tiết bài hát"
        >
          <IconX className="w-6 h-6" />
        </button>

        {/* 3. NỘI DUNG (Loading, Error, Content) */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`text-${theme.colors.text} flex-1 overflow-y-auto scrollbar-spotify pt-12 flex items-center justify-center`}
            >
              {/* Giữ nội dung cũ để đỡ giật, hoặc hiển thị loading nhỏ */}
              {currentSongDetail ? (
                <div className="opacity-50">
                  <LoadingState message="Đang tải bài hát mới..." />
                </div>
              ) : (
                <LoadingState message={`Đang tải chi tiết bài hát...`} />
              )}
            </motion.div>
          ) : error || !currentSongDetail ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`text-${theme.colors.text} flex-1 overflow-y-auto scrollbar-spotify pt-12 flex items-center justify-center`}
            >
              <ErrorState message={error} />
            </motion.div>
          ) : (
            // PHẦN NỘI DUNG CHÍNH (Làm cho nó cuộn được)
            <motion.div
              key={currentDisplayId} // <-- THAY ĐỔI KEY ĐỂ RESET ANIMATION
              ref={scrollRef} // <-- GÁN REF VÀO ĐÂY
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`text-${theme.colors.text} flex-1 overflow-y-auto scrollbar-spotify`}
            >
              {/* Thêm padding ở đây */}
              <div
                className={`min-h-full p-4 md:p-8 space-y-8 ${headerBackground}`}
              >
                {/* A. PHẦN HEADER VÀ THÔNG TIN BÀI HÁT */}
                <header className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6 items-start pt-8">
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
                                text-${theme.colors.title || "white"} mb-2`}
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
                {relatedSongs.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <RelatedSongsSection
                      songs={relatedSongs}
                      songGenreName={currentSongDetail.genre_name}
                      contextMenu={contextMenu}
                      setContextMenu={setContextMenu}
                      handleCloseContextMenu={handleCloseContextMenu}
                      onSongSelect={handleRelatedSongSelect} // <-- 4. TRUYỀN HÀM XUỐNG
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default SongDetail;