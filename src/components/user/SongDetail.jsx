import React, {
  useState,
  useEffect,
  useCallback,
  memo,
  useMemo,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom"; // [QUAN TRỌNG] Dùng để đổi ID trên link
import { Helmet } from "react-helmet-async"; // [QUAN TRỌNG] Dùng để hiện tên bài khi share
import {
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
  IconHeart,
  IconHeartFilled,
  IconX,
} from "@tabler/icons-react";

import { useTheme } from "../../context/themeContext";
import { useAudio } from "../../utils/audioContext";
import { getSongNameById, getRelatedSongs } from "../../services/SongsService";

import RelatedSongsSection from "./RelatedSongsSection";
import LoadingState from "../../components/user/main/LoadingState";
import ErrorState from "../../components/user/main/ErrorState";

// --- Helper Components ---
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
  const navigate = useNavigate(); // Hook để điều hướng URL
  const {
    currentSong: audioCurrentSong,
    setNewPlaylist,
    isPlaying,
    togglePlay,
  } = useAudio();

  const scrollRef = useRef(null); // Ref để cuộn lên đầu khi đổi bài

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

  // --- 1. FETCH DATA ---
  const fetchAllData = useCallback(async (id) => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    setCurrentSongDetail(null);
    setRelatedSongs([]);

    try {
      const [detailData, relatedResponse] = await Promise.all([
        getSongNameById(id),
        getRelatedSongs(id, 12),
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
      console.error("Error fetching data:", err);
      setError(err.message || "Không thể tải dữ liệu.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- 2. EFFECT: Tự động tải lại khi songId thay đổi ---
  useEffect(() => {
    if (songId) {
      fetchAllData(songId);
      // Cuộn lên đầu trang mỗi khi ID đổi
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }, [songId, fetchAllData]);

  const handlePlayPause = useCallback(
    (e) => {
      e.stopPropagation();
      if (!currentSongDetail) return;
      if (!isCurrentSong) {
        if (setNewPlaylist) setNewPlaylist([currentSongDetail], 0);
      } else {
        if (togglePlay) togglePlay();
      }
    },
    [currentSongDetail, isCurrentSong, setNewPlaylist, togglePlay]
  );

  const handleClose = useCallback(() => {
    if (onClose) onClose(); // Gọi hàm đóng từ wrapper (sẽ navigate về '/')
  }, [onClose]);

  const handleToggleLike = useCallback((e) => {
    e.stopPropagation();
    setIsLiked((prev) => !prev);
  }, []);

  // --- 3. XỬ LÝ CHUYỂN BÀI (Đổi link URL) ---
  const handleRelatedSongSelect = useCallback(
    (newSongId) => {
      if (newSongId !== songId) {
        // Lệnh này sẽ đổi URL thành /song/ID_MỚI
        // App.jsx sẽ bắt được URL mới -> Render lại SongDetail với ID mới
        navigate(`/song/${newSongId}`);
      }
    },
    [songId, navigate]
  );

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
      {/* --- HELMET: Cập nhật thẻ meta để share link --- */}
      {currentSongDetail && (
        <Helmet>
          <title>{`${currentSongDetail.song_name} - ${currentSongDetail.singer_name}`}</title>
          <meta property="og:title" content={currentSongDetail.song_name} />
          <meta
            property="og:description"
            content={`Trình bày bởi: ${currentSongDetail.singer_name}`}
          />
          <meta property="og:image" content={currentSongDetail.image} />
          <meta property="og:url" content={window.location.href} />
          <meta property="og:type" content="music.song" />
        </Helmet>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-lg"
        onClick={handleClose}
      />

      <motion.div
        // Thêm key để Animation kích hoạt lại khi đổi bài
        key={songId}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`relative z-10 w-full h-full max-w-4xl max-h-[90vh] 
                    bg-gradient-to-br ${theme.colors.background} 
                    rounded-lg overflow-hidden flex flex-col 
                    shadow-2xl shadow-${theme.colors.songShadow}`}
      >
        <button
          onClick={handleClose}
          className={`absolute top-3 right-3 z-50 p-2 rounded-full backdrop-blur-md transition-colors duration-200 
                bg-white/10 hover:bg-white/20 text-${theme.colors.text} hover:text-white 
                shadow-lg transform hover:scale-105 active:scale-95`}
        >
          <IconX className="w-6 h-6" />
        </button>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`text-${theme.colors.text} flex-1 flex items-center justify-center`}
            >
              <LoadingState message={`Đang tải...`} />
            </motion.div>
          ) : error || !currentSongDetail ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`text-${theme.colors.text} flex-1 flex items-center justify-center`}
            >
              <ErrorState message={error} />
            </motion.div>
          ) : (
            <motion.div
              key={`content-${songId}`}
              ref={scrollRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`text-${theme.colors.text} flex-1 overflow-y-auto scrollbar-spotify`}
            >
              <div
                className={`min-h-full p-4 md:p-8 space-y-8 ${headerBackground}`}
              >
                {/* Header Section */}
                <header className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6 items-start pt-8">
                  <motion.div className="flex justify-center md:justify-start md:col-span-1">
                    <img
                      src={currentSongDetail.image}
                      alt={currentSongDetail.song_name}
                      className="w-48 h-48 sm:w-64 sm:h-64 object-cover rounded-xl shadow-2xl"
                    />
                  </motion.div>

                  <motion.div className="md:col-span-2 xl:col-span-3 flex flex-col justify-start min-w-0 mt-4 md:mt-0">
                    <h1
                      className={`text-4xl sm:text-5xl font-extrabold line-clamp-2 text-${
                        theme.colors.title || "white"
                      } mb-2`}
                    >
                      {currentSongDetail.song_name}
                    </h1>
                    <p
                      className={`text-lg sm:text-xl font-semibold text-${theme.colors.text}`}
                    >
                      {currentSongDetail.singer_name}
                    </p>
                    <p
                      className={`text-sm opacity-60 mt-1 text-${theme.colors.text}/70`}
                    >
                      {currentSongDetail.album_name
                        ? `Album: ${currentSongDetail.album_name} • `
                        : ""}
                      Lượt nghe:{" "}
                      {currentSongDetail.play_count?.toLocaleString() || 0}
                    </p>

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

                {relatedSongs.length > 0 && (
                  <RelatedSongsSection
                    songs={relatedSongs}
                    songGenreName={currentSongDetail.genre_name}
                    contextMenu={contextMenu}
                    setContextMenu={setContextMenu}
                    handleCloseContextMenu={handleCloseContextMenu}
                    onSongSelect={handleRelatedSongSelect} // [QUAN TRỌNG] Truyền hàm xử lý điều hướng
                  />
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
