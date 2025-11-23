import React, {
  useState,
  useEffect,
  useCallback,
  memo,
  useMemo,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Menu } from "@mantine/core";
import {
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
  IconHeart,
  IconHeartFilled,
  IconX,
  IconPlayerSkipBackFilled,
  IconPlayerSkipForwardFilled,
  IconVolume,
  IconVolumeOff,
  IconRepeat,
  IconRepeatOnce,
} from "@tabler/icons-react";

import { useTheme } from "../../context/themeContext";
import { useAudio } from "../../utils/audioContext";
import { getSongNameById, getRelatedSongs } from "../../services/SongsService";

import RelatedSongsSection from "./RelatedSongsSection";
import LoadingState from "../../components/user/main/LoadingState";
import ErrorState from "../../components/user/main/ErrorState";

// --- 1. COMPONENT CONTROL PLAYER ĐÃ SỬA ---
const DetailPlayerControls = ({
  theme,
  currentTime,
  duration,
  progressPercent,
  togglePlayPause,
  playNextSong,
  playBackSong,
  handleProgressMouseDown,
  handleProgressTouchStart,
  progressRef,
  isDragging,
  volume,
  setVolume,
  repeatMode,
  toggleRepeat,
  getRepeatIcon,
  isPlaying,
  // Thêm props cho Like
  isLiked,
  onToggleLike,
}) => {
  const formatTime = (time) => {
    if (!time || isNaN(time) || time < 0) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full flex flex-col gap-3 mt-4">
      {/* 1. Progress Bar (Đã sửa màu hiển thị) */}
      <div className="w-full flex items-center gap-3 select-none">
        <span
          className={`text-xs text-${theme.colors.text}/70 font-medium min-w-[35px] text-right`}
        >
          {formatTime(currentTime)}
        </span>

        <div
          className="h-1 flex-1 bg-white/20 rounded-full cursor-pointer group relative transition-all duration-150 ease-out hover:h-1.5 py-2 bg-clip-content" // Thêm py-2 để vùng bấm rộng hơn dễ kéo
          ref={progressRef}
          onMouseDown={handleProgressMouseDown}
          onTouchStart={handleProgressTouchStart}
          style={{ touchAction: "none" }}
        >
          {/* Thanh nền mờ */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-white/20 rounded-full group-hover:h-1.5 transition-all" />

          {/* Thanh màu đang chạy (Dùng bg-white để chắc chắn hiện màu) */}
          <div
            className="absolute top-1/2 -translate-y-1/2 left-0 h-1 rounded-full bg-white group-hover:h-1.5 transition-all"
            style={{ width: `${progressPercent}%` }}
          >
            {/* Cục tròn ở đầu thanh (Thumb) */}
            <div
              className={`absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md transition-all duration-200 ${
                isDragging
                  ? "opacity-100 scale-125"
                  : "opacity-0 group-hover:opacity-100"
              }`}
            />
          </div>
        </div>

        <span
          className={`text-xs text-${theme.colors.text}/70 font-medium min-w-[35px] text-left`}
        >
          {formatTime(duration)}
        </span>
      </div>

      {/* 2. Buttons Control Row (Tích hợp Like vào đây) */}
      <div className="flex items-center justify-between px-1 relative">
        {/* LEFT: Volume */}
        <div className="flex-1 flex justify-start">
          <Menu shadow="lg" position="top-start" offset={10} zIndex={20002}>
            <Menu.Target>
              <button
                className={`text-${theme.colors.text}/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10`}
              >
                {volume === 0 ? (
                  <IconVolumeOff size={20} />
                ) : (
                  <IconVolume size={20} />
                )}
              </button>
            </Menu.Target>
            <Menu.Dropdown className="bg-black/80 backdrop-blur-md border border-white/10 p-0 overflow-hidden rounded-xl">
              <div className="flex justify-center items-center w-10 h-32 p-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-24 h-1 cursor-pointer transform -rotate-90 vertical-slider"
                />
              </div>
            </Menu.Dropdown>
          </Menu>
        </div>

        {/* CENTER: Play Controls */}
        <div className="flex items-center gap-6">
          <button
            onClick={playBackSong}
            className={`text-${theme.colors.text}/70 hover:text-white transition-colors p-2 hover:scale-110 active:scale-95`}
          >
            <IconPlayerSkipBackFilled size={24} />
          </button>

          <button
            onClick={togglePlayPause}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 bg-white text-black`}
            // Dùng bg-white text-black để nút play luôn nổi bật nhất
          >
            {isPlaying ? (
              <IconPlayerPauseFilled className="w-7 h-7" />
            ) : (
              <IconPlayerPlayFilled className="w-7 h-7 translate-x-0.5" />
            )}
          </button>

          <button
            onClick={playNextSong}
            className={`text-${theme.colors.text}/70 hover:text-white transition-colors p-2 hover:scale-110 active:scale-95`}
          >
            <IconPlayerSkipForwardFilled size={24} />
          </button>
        </div>

        {/* RIGHT: Like & Repeat */}
        <div className="flex-1 flex justify-end items-center gap-2">
          {/* Nút Like (Đã đưa vào đây) */}
          <button
            onClick={onToggleLike}
            className={`p-2 rounded-full transition-colors hover:bg-white/10 ${
              isLiked
                ? "text-red-500"
                : `text-${theme.colors.text}/70 hover:text-white`
            }`}
            title={isLiked ? "Bỏ thích" : "Thích"}
          >
            {isLiked ? <IconHeartFilled size={20} /> : <IconHeart size={20} />}
          </button>

          {/* Nút Repeat */}
          <button
            onClick={toggleRepeat}
            className={`p-2 rounded-full transition-colors hover:bg-white/10 ${
              repeatMode === "none"
                ? `text-${theme.colors.text}/70 hover:text-white`
                : `text-${theme.colors.primary}-400`
            }`}
            title="Lặp lại"
          >
            {getRepeatIcon()}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---
const SongDetail = ({ songId, onClose }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    currentSong: audioCurrentSong,
    setNewPlaylist,
    isPlaying,
    setIsPlaying,
    audio,
    currentTime,
    duration,
    setPlaybackTime,
    playNextSong,
    playBackSong,
    volume,
    setVolume,
    repeatMode,
    setRepeatMode,
    togglePlay,
  } = useAudio();

  const scrollRef = useRef(null);
  const originalPath = useRef(
    location.pathname.startsWith("/song/") ? "/" : location.pathname
  );

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
    audioCurrentSong &&
    currentSongDetail &&
    audioCurrentSong.id === currentSongDetail.id;

  // --- Fetch Data ---
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

  useEffect(() => {
    if (songId) {
      fetchAllData(songId);
      const expectedPath = `/song/${songId}`;
      if (location.pathname !== expectedPath) {
        window.history.pushState(null, "", expectedPath);
      }
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }, [songId, fetchAllData, location.pathname]);

  // --- Logic Control ---
  const togglePlayPause = useCallback(
    (e) => {
      if (e) e.stopPropagation();

      if (
        currentSongDetail &&
        (!audioCurrentSong || audioCurrentSong.id !== currentSongDetail.id)
      ) {
        if (setNewPlaylist) setNewPlaylist([currentSongDetail], 0);
        return;
      }

      setIsPlaying((prev) => {
        const newState = !prev;
        if (newState) audio.play();
        else audio.pause();
        return newState;
      });
    },
    [currentSongDetail, audioCurrentSong, setNewPlaylist, setIsPlaying, audio]
  );

  const toggleRepeat = () => {
    if (repeatMode === "none") setRepeatMode("all");
    else if (repeatMode === "all") setRepeatMode("one");
    else setRepeatMode("none");
  };

  const getRepeatIcon = () => {
    switch (repeatMode) {
      case "one":
        return <IconRepeatOnce size={20} />;
      default:
        return <IconRepeat size={20} />;
    }
  };

  // Logic Progress
  const progressRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const isValidDuration = duration && !isNaN(duration) && duration > 0;
  const isValidCurrentTime =
    currentTime && !isNaN(currentTime) && currentTime >= 0;

  const showProgress = isCurrentSong;
  const progressPercent =
    showProgress && isValidDuration && isValidCurrentTime
      ? (currentTime / duration) * 100
      : 0;
  const displayCurrentTime = showProgress ? currentTime : 0;
  const displayDuration = showProgress
    ? duration
    : currentSongDetail?.duration || 0;

  const handleProgressChange = useCallback(
    (e) => {
      if (!progressRef.current || !isValidDuration || !isCurrentSong) return;
      try {
        const rect = progressRef.current.getBoundingClientRect();
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        if (clientX === undefined) return;
        const clickX = clientX - rect.left;
        const width = rect.width;
        if (width <= 0) return;
        const percentage = Math.max(0, Math.min(clickX / width, 1));
        const newTime = percentage * duration;
        setPlaybackTime(Math.round(newTime));
      } catch (error) {
        console.error(error);
      }
    },
    [isValidDuration, duration, setPlaybackTime, isCurrentSong]
  );

  const handleProgressMouseDown = useCallback(
    (e) => {
      e.preventDefault();
      if (!isValidDuration || !isCurrentSong) return;
      setIsDragging(true);
      handleProgressChange(e);
    },
    [isValidDuration, handleProgressChange, isCurrentSong]
  );

  const handleProgressTouchStart = useCallback(
    (e) => {
      e.stopPropagation();
      if (!isValidDuration || !isCurrentSong) return;
      setIsDragging(true);
      handleProgressChange(e);
    },
    [isValidDuration, handleProgressChange, isCurrentSong]
  );

  const handleProgressMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      handleProgressChange(e);
    },
    [isDragging, handleProgressChange]
  );

  const handleProgressUp = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleProgressMouseMove);
      window.addEventListener("mouseup", handleProgressUp);
      window.addEventListener("touchmove", handleProgressMouseMove);
      window.addEventListener("touchend", handleProgressUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleProgressMouseMove);
      window.removeEventListener("mouseup", handleProgressUp);
      window.removeEventListener("touchmove", handleProgressMouseMove);
      window.removeEventListener("touchend", handleProgressUp);
    };
  }, [isDragging, handleProgressMouseMove, handleProgressUp]);

  const handleClose = useCallback(() => {
    navigate(originalPath.current, { replace: true });
    if (onClose) onClose();
  }, [onClose, navigate]);

  const handleToggleLike = useCallback((e) => {
    e.stopPropagation();
    setIsLiked((prev) => !prev);
  }, []);

  const handleRelatedSongSelect = useCallback(
    (newSongId) => {
      if (newSongId !== songId) navigate(`/song/${newSongId}`);
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
      {currentSongDetail && (
        <Helmet>
          <title>{`${currentSongDetail.song_name} - ${currentSongDetail.singer_name}`}</title>
          <meta property="og:title" content={currentSongDetail.song_name} />
          <meta
            property="og:description"
            content={`Trình bày bởi: ${currentSongDetail.singer_name}`}
          />
          <meta property="og:image" content={currentSongDetail.image} />
        </Helmet>
      )}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-lg"
        onClick={handleClose}
      />

      <motion.div
        key={songId}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3 }}
        className={`relative z-10 w-full h-full max-w-4xl max-h-[90vh] bg-gradient-to-br ${theme.colors.background} rounded-lg overflow-hidden flex flex-col shadow-2xl shadow-${theme.colors.songShadow}`}
      >
        <button
          onClick={handleClose}
          className={`absolute top-3 right-3 z-50 p-2 rounded-full backdrop-blur-md bg-white/10 hover:bg-white/20 text-${theme.colors.text} hover:text-white shadow-lg transition-all hover:scale-105`}
        >
          <IconX className="w-6 h-6" />
        </button>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              className={`text-${theme.colors.text} flex-1 flex items-center justify-center`}
            >
              <LoadingState message="Đang tải..." />
            </motion.div>
          ) : error || !currentSongDetail ? (
            <motion.div
              key="error"
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
              className={`text-${theme.colors.text} flex-1 overflow-y-auto scrollbar-spotify`}
            >
              <div
                className={`min-h-full p-4 md:p-8 space-y-8 ${headerBackground}`}
              >
                <header className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6 items-start pt-8">
                  {/* Image */}
                  <motion.div className="flex justify-center md:justify-start md:col-span-1">
                    <img
                      src={currentSongDetail.image}
                      alt={currentSongDetail.song_name}
                      className="w-48 h-48 sm:w-64 sm:h-64 object-cover rounded-xl shadow-2xl"
                    />
                  </motion.div>

                  {/* Info */}
                  <motion.div className="md:col-span-2 xl:col-span-3 flex flex-col justify-start min-w-0 mt-4 md:mt-0">
                    <h1
                      className={`text-3xl sm:text-5xl font-extrabold line-clamp-2 text-${
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

                    {/* Integrated Controls (Đã tích hợp Like vào trong) */}
                    <div className="pt-6 w-full max-w-lg">
                      <DetailPlayerControls
                        theme={theme}
                        currentTime={displayCurrentTime}
                        duration={displayDuration}
                        progressPercent={progressPercent}
                        togglePlayPause={togglePlayPause}
                        playNextSong={playNextSong}
                        playBackSong={playBackSong}
                        handleProgressMouseDown={handleProgressMouseDown}
                        handleProgressTouchStart={handleProgressTouchStart}
                        progressRef={progressRef}
                        isDragging={isDragging}
                        volume={volume}
                        setVolume={setVolume}
                        repeatMode={repeatMode}
                        toggleRepeat={toggleRepeat}
                        getRepeatIcon={getRepeatIcon}
                        isPlaying={isCurrentSong && isPlaying}
                        // Props cho Like
                        isLiked={isLiked}
                        onToggleLike={handleToggleLike}
                      />
                    </div>
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
                    onSongSelect={handleRelatedSongSelect}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <style jsx>{`
        .vertical-slider {
          -webkit-appearance: none;
          appearance: none;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 5px;
          outline: none;
        }
        .vertical-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default SongDetail;
