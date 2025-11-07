// ExpandedSongView.jsx (Đã lọc màu sáng + Thêm lại logic Random)

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Box, Text } from "@mantine/core";
import {
  IconX,
  IconHeart,
  IconHeartFilled,
  IconMicrophone,
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
  IconPlayerSkipForwardFilled,
  IconPlayerSkipBackFilled,
  IconPalette,
} from "@tabler/icons-react";
import ExpandedSyncedLyrics from "./ExpandedSyncedLyrics";
import { useAudio } from "../../utils/audioContext";
import { motion, AnimatePresence } from "framer-motion";
import ColorPalettePopup from "./ColorPalettePopup";

// --- MiniPlayerControls Component (Không thay đổi) ---
const MiniPlayerControls = ({
  theme,
  currentTime,
  duration,
  progressColors,
  progressPercent,
  togglePlayPause,
  playNextSong,
  playBackSong,
  handleProgressMouseDown,
  handleProgressTouchStart,
  progressRef,
  isDragging,
}) => {
  const { isPlaying } = useAudio();
  const formatTime = (time) => {
    if (!time || isNaN(time) || time < 0) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="relative p-0 mt-4 md:mt-6 w-full max-w-xs sm:max-w-sm md:max-w-none md:w-[325px]"
      style={{ minHeight: "100px" }}
    >
      <div className="relative z-20 flex flex-col items-center">
        {/* Progress Bar */}
        <div className="w-full flex items-center gap-2 mb-4">
          <span className="text-xs text-white/70 font-medium min-w-[32px] text-right">
            {formatTime(currentTime)}
          </span>
          <div
            className={`h-1 flex-1 bg-white/30 rounded-full cursor-pointer group relative transition-all duration-150 ease-out hover:h-2`}
            ref={progressRef}
            onMouseDown={handleProgressMouseDown}
            onTouchStart={handleProgressTouchStart}
            style={{ touchAction: "none" }}
          >
            <div
              className={`h-full rounded-full relative transition-colors pointer-events-none`}
              style={{ width: `${progressPercent}%`, backgroundColor: progressColors.thumbColor }}
            >
              <div
                className={`absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full shadow-xl transition-all duration-200`}
                style={{
                  backgroundColor: progressColors.thumbColor,
                  opacity: isDragging ? 1 : 0,
                  transform: `translateY(-50%) scale(${isDragging ? 1.5 : 1})`,
                }}
              />
            </div>
          </div>
          <span className="text-xs text-white/70 font-medium min-w-[32px] text-left">
            {formatTime(duration)}
          </span>
        </div>

        {/* Playback Buttons */}
        <div className="flex items-center gap-6">
          <button
            className="text-white/70 hover:text-white transition-colors p-2"
            onClick={playBackSong}
          >
            <IconPlayerSkipBackFilled size={24} />
          </button>

          <button
            className={`bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-xl hover:scale-105 transition-transform duration-200`}
            onClick={togglePlayPause}
          >
            {isPlaying ? (
              <IconPlayerPauseFilled className="w-6 h-6 text-black" />
            ) : (
              <IconPlayerPlayFilled className="w-6 h-6 text-black ml-0.5" />
            )}
          </button>

          <button
            className="text-white/70 hover:text-white transition-colors p-2"
            onClick={playNextSong}
          >
            <IconPlayerSkipForwardFilled size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- DANH SÁCH GRADIENT CỐ ĐỊNH (ĐÃ LỌC BỎ CÁC MÀU QUÁ SÁNG) ---
const PREDEFINED_GRADIENTS = [
  { id: 'default', name: 'Mặc định', c1: 'hsl(220, 80%, 30%)', c2: 'hsl(290, 70%, 25%)', c3: 'hsl(330, 75%, 30%)' },
  { id: 'sunset', name: 'Hoàng hôn', c1: '#4c114e', c2: '#a4364c', c3: '#f78a3a' },
  { id: 'ocean', name: 'Đại dương', c1: '#0d324d', c2: '#1b5f70', c3: '#76dbd1' },
  { id: 'forest', name: 'Rừng rậm', c1: '#1E4620', c2: '#376F3A', c3: '#6ABE6D' },
  { id: 'royal', name: 'Hoàng gia', c1: '#240b36', c2: '#5f0f40', c3: '#c31432' },
  { id: 'dream', name: 'Mơ màng', c1: '#1f1c2c', c2: '#928dab', c3: '#a79ab2' },
  { id: 'dark_neon', name: 'Neon tối', c1: '#000000', c2: '#0b3c53', c3: '#d900ff' },
  { id: 'vintage', name: 'Cổ điển', c1: '#6D5D4B', c2: '#B09B71', c3: '#D8C8A8' },
  // Đã lọc bỏ 4 màu sáng: 'light_sky', 'light_peach', 'light_mint', 'rose'
];


// --- ExpandedSongView Component ---

const ExpandedSongView = ({
  currentSong,
  audio,
  isPlaying,
  theme,
  onClose,
  isVisible = true,
}) => {
  const [showLyrics, setShowLyrics] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // --- START: Logic nền động (ĐÃ THAY ĐỔI) ---
  // State để hiển thị/ẩn popup
  const [showColorPalette, setShowColorPalette] = useState(false);
  // State cho gradient đã chọn, khởi đầu là màu đầu tiên
  const [selectedGradient, setSelectedGradient] = useState(PREDEFINED_GRADIENTS[0]);

  // --- MỚI: Thêm lại logic chọn màu ngẫu nhiên khi mở ---
  useEffect(() => {
    // Chỉ chọn màu ngẫu nhiên khi component bắt đầu hiển thị
    if (isVisible && !isClosing) {
      const randomIndex = Math.floor(Math.random() * PREDEFINED_GRADIENTS.length);
      setSelectedGradient(PREDEFINED_GRADIENTS[randomIndex]);
    }
  }, [isVisible, isClosing]); // Phụ thuộc vào isVisible và isClosing
  // --- END: Logic nền động ---
  
  // Lấy dữ liệu từ useAudio
  const {
    currentTime,
    duration,
    setPlaybackTime,
    playNextSong,
    playBackSong,
    setIsPlaying,
  } = useAudio();

  // Tái tạo logic progress colors (Giữ nguyên)
  const getProgressColorsLocal = () => {
    // ... (Giữ nguyên toàn bộ switch case của bạn)
    switch (theme.id) {
      case "pixelCyberpunk":
        return {
          trackBg: "bg-emerald-600/50",
          progressBg: "bg-emerald-300",
          progressHover: "hover:bg-violet-400",
          thumbColor: "#a78bfa",
        };
      // ... (và tất cả các case khác)
      default:
        return {
          trackBg: "bg-teal-600/50",
          progressBg: "bg-teal-300",
          progressHover: "hover:bg-emerald-400",
          thumbColor: "#5eead4",
        };
    }
  };
  const progressColors = getProgressColorsLocal();
  
  // Logic Progress Bar (Giữ nguyên)
  const progressRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // ... (Toàn bộ logic kéo thanh Progress Bar được giữ nguyên)
  const isValidDuration = duration && !isNaN(duration) && duration > 0;
  const isValidCurrentTime = currentTime && !isNaN(currentTime) && currentTime >= 0;
  const progressPercent =
    isValidDuration && isValidCurrentTime ? (currentTime / duration) * 100 : 0;

  const togglePlayPause = () => {
    setIsPlaying((prev) => {
      const newState = !prev;
      if (newState) {
        audio.play();
      } else {
        audio.pause();
      }
      return newState;
    });
  };

  const handleProgressChange = useCallback((e) => {
    if (!progressRef.current || !isValidDuration) return;
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
      console.error("Error in handleProgressChange:", error);
    }
  }, [isValidDuration, duration, setPlaybackTime]);

  const handleProgressMouseDown = useCallback((e) => {
    e.preventDefault();
    if (!isValidDuration) return;
    setIsDragging(true);
    handleProgressChange(e);
  }, [isValidDuration, handleProgressChange]);

  const handleProgressTouchStart = useCallback((e) => {
    e.stopPropagation();
    if (!isValidDuration) return;
    setIsDragging(true);
    handleProgressChange(e);
  }, [isValidDuration, handleProgressChange]);

  const handleProgressMouseMove = useCallback((e) => {
    if (!isDragging) return;
    handleProgressChange(e);
  }, [isDragging, handleProgressChange]);

  const handleProgressTouchMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();
    e.stopPropagation();
    handleProgressChange(e);
  }, [isDragging, handleProgressChange]);

  const handleProgressUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.body.classList.add("dragging");
      window.addEventListener("mousemove", handleProgressMouseMove);
      window.addEventListener("mouseup", handleProgressUp);
      window.addEventListener("touchmove", handleProgressTouchMove, {
        passive: false,
      });
      window.addEventListener("touchend", handleProgressUp);
    } else {
      document.body.classList.remove("dragging");
    }
    
    return () => {
      document.body.classList.remove("dragging");
      window.removeEventListener("mousemove", handleProgressMouseMove);
      window.removeEventListener("mouseup", handleProgressUp);
      window.removeEventListener("touchmove", handleProgressTouchMove);
      window.removeEventListener("touchend", handleProgressUp);
    };
  }, [
    isDragging, 
    handleProgressMouseMove, 
    handleProgressUp, 
    handleProgressTouchMove,
  ]);
  // --- END Logic kéo thanh Progress ---

  const hasLyrics = currentSong?.lyrics && currentSong.lyrics.trim().length > 0;
  const hasTimestamps =
    hasLyrics &&
    currentSong.lyrics.includes("[") &&
    currentSong.lyrics.includes("]");

  useEffect(() => {
    if (hasLyrics) {
      setShowLyrics(true);
    }
  }, [hasLyrics]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      // Reset lại isClosing sau khi đã đóng
      setTimeout(() => setIsClosing(false), 50); 
    }, 300);
  };

  if (!currentSong) return null;

  return (
    <div
      className={`fixed inset-0 z-[20000] transition-all duration-300 ease-out ${
        isVisible && !isClosing ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
      style={{
        background: `linear-gradient(135deg, ${selectedGradient.c1}, ${selectedGradient.c2})`,
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        transition: "background 0.5s ease-out",
      }}
    >
      {/* Nền động (Sử dụng màu đã chọn) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
        <div
          className="absolute w-[800px] h-[800px] rounded-full blur-[200px]"
          style={{
            backgroundColor: selectedGradient.c1,
            animation: "swirl 30s infinite alternate",
            top: "-30%",
            left: "-30%",
            transition: "background-color 1s ease-out",
          }}
        />
        <div
          className="absolute w-[700px] h-[700px] rounded-full blur-[180px]"
          style={{
            backgroundColor: selectedGradient.c2,
            animation: "swirl 40s infinite linear reverse",
            bottom: "-40%",
            right: "-40%",
            transition: "background-color 1s ease-out",
          }}
        />
        <div
          className="absolute w-[600px] h-[600px] rounded-full blur-[150px]"
          style={{
            backgroundColor: selectedGradient.c3,
            animation: "swirl 35s infinite alternate-reverse",
            bottom: "10%",
            left: "20%",
            transition: "background-color 1s ease-out",
          }}
        />
      </div>

      {/* Header - Nút Bảng màu */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 md:p-6">
        <div className="flex items-center justify-end">
          <div className="flex items-center space-x-3">
            
            <button
              onClick={() => setShowColorPalette(true)}
              className={`p-3 rounded-full transition-all duration-200 backdrop-blur-sm border border-white/20 hover:bg-white/15 text-white/70 hover:text-white hover:scale-105 ${
                showColorPalette ? "bg-white/25 text-white shadow-lg scale-105" : ""
              }`}
              title="Đổi Nền"
            >
              <IconPalette size={20} />
            </button>

            {hasLyrics && (
              <button
                onClick={() => setShowLyrics(!showLyrics)}
                className={`p-3 rounded-full transition-all duration-200 backdrop-blur-sm border border-white/20 ${
                  showLyrics
                    ? `bg-white/25 text-white shadow-lg scale-105`
                    : `hover:bg-white/15 text-white/70 hover:text-white hover:scale-105`
                }`}
                title={showLyrics ? "Ẩn Lời" : "Hiện Lời"}
              >
                <IconMicrophone size={20} />
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-3 rounded-full hover:bg-white/15 transition-all duration-200 backdrop-blur-sm border border-white/20 hover:scale-105"
            >
              <IconX size={20} className="text-white/70 hover:text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row items-center md:items-start h-full p-4 pt-20 pb-16 md:p-8 md:pt-24 md:pb-20">
        <div
          className={`flex flex-col md:flex-row items-center md:items-start w-full h-full max-w-7xl mx-auto transition-all duration-500 gap-4 md:gap-8 ${
            showLyrics && hasLyrics ? "" : "justify-center"
          }`}
        >
          {/* Album Art Section + Mini Player Controls */}
          <div
            className={`flex-shrink-0 transition-all duration-500 flex flex-col items-center ${
              showLyrics && hasLyrics ? "hidden md:flex md:w-5/12" : "w-full"
            }`}
          >
            <div className="relative group">
              {/* Glowing Background Effect */}
              <div
                className="absolute inset-0 rounded-3xl opacity-30 blur-3xl scale-110 transition-all duration-300 group-hover:opacity-50 group-hover:scale-115"
                style={{
                  background: selectedGradient.c3,
                }}
              />

              {/* Main Album Art Container */}
              <div
                className="relative mx-auto aspect-square rounded-3xl overflow-hidden shadow-2xl border border-white/10 transition-all duration-300 group-hover:shadow-3xl group-hover:scale-105 w-full max-w-xs sm:max-w-sm md:max-w-none md:w-[325px] md:h-[325px]" 
              >
                <img
                  src={currentSong.image}
                  alt={currentSong.song_name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  style={{
                    filter: "brightness(1.1) contrast(1.1) saturate(1.2)",
                  }}
                  onError={(e) => {
                    e.target.src = "/placeholder-album.jpg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                <div
                  className="absolute top-4 right-4 text-white/30 animate-bounce"
                  style={{ animationDelay: "0.5s" }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>
              </div>

              {/* Song Info Below Album */}
              <div className="mt-6 md:mt-8 text-center">
                <h1
                  className={`font-bold text-white leading-tight mb-4 transition-all duration-300 text-2xl ${
                    showLyrics && hasLyrics
                      ? "md:text-[32px]"
                      : "md:text-[36px]"
                  }`}
                  style={{
                    lineHeight: 1.1,
                    textShadow: "0 2px 20px rgba(0,0,0,0.3)",
                  }}
                >
                  {currentSong.song_name || "Unknown Title"}
                </h1>
                <p
                  className={`text-white/90 mb-8 transition-all duration-300 text-lg md:text-xl`}
                  style={{
                    fontWeight: 500,
                    textShadow: "0 1px 10px rgba(0,0,0,0.2)",
                  }}
                >
                  {currentSong.singer_name || "Unknown Artist"}
                </p>
              </div>
            </div>

            {/* MINI PLAYER CONTROLS */}
            <MiniPlayerControls
              theme={theme}
              currentTime={currentTime}
              duration={duration}
              progressColors={progressColors}
              progressPercent={progressPercent}
              togglePlayPause={togglePlayPause}
              playNextSong={playNextSong}
              playBackSong={playBackSong}
              handleProgressMouseDown={handleProgressMouseDown}
              handleProgressTouchStart={handleProgressTouchStart}
              progressRef={progressRef}
              isDragging={isDragging}
            />

          </div>

          {/* Lyrics Section */}
          {showLyrics && hasLyrics && (
            <div className="flex-1 h-full min-w-0 flex flex-col w-full">
              <div className="h-full flex flex-col overflow-hidden"> 
                {/* Lyrics Container */}
                <div className="flex-1 min-h-0 relative overflow-hidden">
                  <div className="h-full w-full rounded-2xl overflow-hidden flex justify-center">
                    {hasTimestamps ? (
                      <div className="h-full w-full p-1 overflow-hidden max-w-3xl mx-auto"> 
                        <ExpandedSyncedLyrics
                          lyricsText={currentSong.lyrics}
                          audioElement={audio}
                          isPlaying={isPlaying}
                          className="h-full w-full rounded-xl overflow-hidden"
                        />
                      </div>
                    ) : (
                      <div className="h-full w-full overflow-hidden max-w-3xl mx-auto">
                        <Box
                          className="custom-scrollbar p-4 md:p-8"
                          style={{
                            height: "100%",
                            width: "100%",
                            overflowY: "auto",
                            overflowX: "hidden",
                            borderRadius: "16px",
                            maxHeight: "100%",
                            background: "transparent",
                          }}
                        >
                          <Text
                            className="text-lg leading-relaxed md:text-2xl md:leading-[1.8]"
                            style={{
                              color: "rgba(255, 255, 255, 0.95)",
                              fontWeight: 500,
                              textAlign: "left",
                              wordWrap: "break-word",
                              wordBreak: "break-word",
                              overflowWrap: "break-word",
                            }}
                          >
                            {currentSong.lyrics
                              .split("\n")
                              .map((line, index) => (
                                <div
                                  key={`lyric-line-${index}`}
                                  className="transition-all duration-200 hover:text-white/95"
                                  style={{
                                    marginBottom: line.trim() ? "12px" : "8px",
                                    maxWidth: "100%",
                                  }}
                                >
                                  {line.trim() || <br />}
                                </div>
                              ))}
                          </Text>
                        </Box>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* RENDER POPUP BẢNG MÀU */}
      <ColorPalettePopup
        isVisible={showColorPalette}
        onClose={() => setShowColorPalette(false)}
        gradients={PREDEFINED_GRADIENTS} // Sử dụng danh sách đã lọc
        currentGradient={selectedGradient}
        onSelectGradient={setSelectedGradient}
      />


      <style jsx>{`
        /* Giữ nguyên tất cả các style jsx... */
        .custom-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          display: none;
        }
        :global(body.dragging) {
            overflow: hidden;
            touch-action: none;
        }
        @keyframes swirl {
          0% {
            transform: translate(0px, 0px) rotate(0deg) scale(1.2);
            opacity: 0.6;
          }
          25% {
            transform: translate(50px, -80px) rotate(90deg) scale(1.0);
            opacity: 0.8;
          }
          50% {
            transform: translate(-50px, 80px) rotate(180deg) scale(1.3);
            opacity: 0.7;
          }
          75% {
            transform: translate(80px, 50px) rotate(270deg) scale(1.1);
            opacity: 0.9;
          }
          100% {
            transform: translate(0px, 0px) rotate(360deg) scale(1.2);
            opacity: 0.6;
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes glow {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
          }
          50% {
            box-shadow: 0 0 40px rgba(255, 255, 255, 0.2);
          }
        }
        .group:hover .animate-bounce {
          animation: float 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ExpandedSongView;