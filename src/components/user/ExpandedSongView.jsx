// ExpandedSongView.jsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Box, Text, Menu } from "@mantine/core";
import {
  IconX,
  IconMicrophone,
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
  IconPlayerSkipForwardFilled,
  IconPlayerSkipBackFilled,
  IconPalette,
  IconVolume,
  IconVolumeOff,
  IconRepeat,
  IconRepeatOnce,
} from "@tabler/icons-react";
import ExpandedSyncedLyrics from "./ExpandedSyncedLyrics";
import { useAudio } from "../../utils/audioContext";
import { NeatGradient } from "@firecms/neat";
import ColorPalettePopup from "./ColorPalettePopup";

// --- IMPORT CONFIG MỚI TỪ FILE RIÊNG ---
import { NEAT_GRADIENTS } from "../../utils/neatGradients";

// ... (Giữ nguyên MiniPlayerControls component) ...
// ... (Bạn copy lại đoạn code MiniPlayerControls cũ vào đây) ...
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
  volume,
  setVolume,
  repeatMode,
  toggleRepeat,
  getRepeatIcon,
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
              style={{
                width: `${progressPercent}%`,
                backgroundColor: progressColors.thumbColor,
              }}
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
        <div className="flex items-center justify-center gap-4 md:gap-5 w-full">
          {/* Volume */}
          <Menu
            shadow="lg"
            position="top-start"
            offset={15}
            zIndex={20001}
            classNames={{
              dropdown: `bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-0 overflow-hidden`,
            }}
          >
            <Menu.Target>
              <button
                className="text-white/70 hover:text-white transition-colors p-2"
                title="Âm lượng"
              >
                {volume == 0 ? (
                  <IconVolumeOff size={24} />
                ) : (
                  <IconVolume size={24} />
                )}
              </button>
            </Menu.Target>
            <Menu.Dropdown>
              <div className="flex justify-center items-center w-12 h-40 p-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-32 h-2 cursor-pointer transform -rotate-90 vertical-slider"
                />
              </div>
            </Menu.Dropdown>
          </Menu>

          {/* Controls */}
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

          {/* Repeat */}
          <button
            className={`transition-colors p-2 ${
              repeatMode === "none"
                ? "text-white/50 hover:text-white/70"
                : "text-white hover:text-white/80"
            }`}
            onClick={toggleRepeat}
          >
            {getRepeatIcon()}
          </button>
        </div>
      </div>
    </div>
  );
};

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

  // Logic nền động & Neat Gradient
  const [showColorPalette, setShowColorPalette] = useState(false);

  // Mặc định chọn cái đầu tiên trong danh sách
  const [selectedGradient, setSelectedGradient] = useState(NEAT_GRADIENTS[0]);

  const canvasRef = useRef(null);
  const neatRef = useRef(null);

  // Random màu khi mở (Optional)
  useEffect(() => {
    if (isVisible && !isClosing) {
      const randomIndex = Math.floor(Math.random() * NEAT_GRADIENTS.length);
      setSelectedGradient(NEAT_GRADIENTS[randomIndex]);
    }
  }, [isVisible, isClosing]);

  // --- QUAN TRỌNG: Effect khởi tạo Neat Gradient ---
  useEffect(() => {
    if (!canvasRef.current || !isVisible) return;

    // 1. Hủy instance cũ nếu có
    if (neatRef.current) {
      neatRef.current.destroy();
    }

    // 2. Tạo instance mới với config từ file neatGradients.js
    // config được lấy từ: selectedGradient.config
    neatRef.current = new NeatGradient({
      ref: canvasRef.current,
      ...selectedGradient.config, // Spread toàn bộ settings vào đây
    });

    // 3. Cleanup
    return () => {
      if (neatRef.current) {
        neatRef.current.destroy();
      }
    };
  }, [selectedGradient, isVisible]);

  const {
    currentTime,
    duration,
    setPlaybackTime,
    playNextSong,
    playBackSong,
    setIsPlaying,
    volume,
    setVolume,
    repeatMode,
    setRepeatMode,
  } = useAudio();

  const toggleRepeat = () => {
    if (repeatMode === "none") {
      setRepeatMode("all");
    } else if (repeatMode === "all") {
      setRepeatMode("one");
    } else {
      setRepeatMode("none");
    }
  };

  const getRepeatIcon = () => {
    switch (repeatMode) {
      case "one":
        return <IconRepeatOnce size={24} />;
      default:
        return <IconRepeat size={24} />;
    }
  };

  const getProgressColorsLocal = () => {
    // Giữ nguyên logic cũ của bạn
    switch (theme.id) {
      case "pixelCyberpunk":
        return {
          trackBg: "bg-emerald-600/50",
          progressBg: "bg-emerald-300",
          progressHover: "hover:bg-violet-400",
          thumbColor: "#a78bfa",
        };
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

  // Logic Progress Bar (Giữ nguyên logic kéo thả cũ của bạn - rút gọn để hiển thị)
  const progressRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const isValidDuration = duration && !isNaN(duration) && duration > 0;
  const isValidCurrentTime =
    currentTime && !isNaN(currentTime) && currentTime >= 0;
  const progressPercent =
    isValidDuration && isValidCurrentTime ? (currentTime / duration) * 100 : 0;

  const togglePlayPause = () => {
    setIsPlaying((prev) => {
      const newState = !prev;
      if (newState) audio.play();
      else audio.pause();
      return newState;
    });
  };

  // ... (Giữ nguyên các hàm handleProgressChange, handleProgressMouseDown, etc.) ...
  const handleProgressChange = useCallback(
    (e) => {
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
        console.error("Error:", error);
      }
    },
    [isValidDuration, duration, setPlaybackTime]
  );

  const handleProgressMouseDown = useCallback(
    (e) => {
      e.preventDefault();
      if (!isValidDuration) return;
      setIsDragging(true);
      handleProgressChange(e);
    },
    [isValidDuration, handleProgressChange]
  );
  const handleProgressTouchStart = useCallback(
    (e) => {
      e.stopPropagation();
      if (!isValidDuration) return;
      setIsDragging(true);
      handleProgressChange(e);
    },
    [isValidDuration, handleProgressChange]
  );
  const handleProgressMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      handleProgressChange(e);
    },
    [isDragging, handleProgressChange]
  );
  const handleProgressTouchMove = useCallback(
    (e) => {
      if (!isDragging) return;
      e.preventDefault();
      e.stopPropagation();
      handleProgressChange(e);
    },
    [isDragging, handleProgressChange]
  );
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

  const hasLyrics = currentSong?.lyrics && currentSong.lyrics.trim().length > 0;
  const hasTimestamps =
    hasLyrics &&
    currentSong.lyrics.includes("[") &&
    currentSong.lyrics.includes("]");

  useEffect(() => {
    if (hasLyrics) setShowLyrics(true);
  }, [hasLyrics]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setTimeout(() => setIsClosing(false), 50);
    }, 300);
  };

  if (!currentSong) return null;

  return (
    <div
      className={`fixed inset-0 z-[20000] transition-all duration-300 ease-out ${
        isVisible && !isClosing ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
    >
      {/* --- Canvas cho Neat Gradient --- */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none -z-10"
        style={{ isolation: "isolate" }}
      />

      {/* Overlay mờ */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none -z-10" />

      {/* Header Buttons */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 md:p-6">
        <div className="flex items-center justify-end">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowColorPalette(true)}
              className={`p-3 rounded-full transition-all duration-200 backdrop-blur-sm border border-white/20 hover:bg-white/15 text-white/70 hover:text-white hover:scale-105 ${
                showColorPalette
                  ? "bg-white/25 text-white shadow-lg scale-105"
                  : ""
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

      {/* Main Layout */}
      <div className="flex flex-col md:flex-row items-center md:items-start h-full p-4 pt-20 pb-16 md:p-8 md:pt-24 md:pb-20">
        <div
          className={`flex flex-col md:flex-row items-center md:items-start w-full h-full max-w-7xl mx-auto transition-all duration-500 gap-4 md:gap-8 ${
            showLyrics && hasLyrics ? "" : "justify-center"
          }`}
        >
          {/* Left: Artwork & Controls */}
          <div
            className={`flex-shrink-0 transition-all duration-500 flex flex-col items-center ${
              showLyrics && hasLyrics ? "hidden md:flex md:w-5/12" : "w-full"
            }`}
          >
            <div className="relative group">
              {/* Glowing Effect behind album */}
              <div
                className="absolute inset-0 rounded-3xl opacity-30 blur-3xl scale-110 transition-all duration-300 group-hover:opacity-50 group-hover:scale-115"
                // Dùng màu đầu tiên trong config để làm glow
                style={{
                  background: selectedGradient.config.colors[0].color,
                }}
              />

              <div className="relative mx-auto aspect-square rounded-3xl overflow-hidden shadow-2xl border border-white/10 transition-all duration-300 group-hover:shadow-3xl group-hover:scale-105 w-full max-w-xs sm:max-w-sm md:max-w-none md:w-[325px] md:h-[325px]">
                <img
                  src={currentSong.image}
                  alt={currentSong.song_name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.target.src = "/placeholder-album.jpg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>

              <div className="mt-6 md:mt-8 text-center">
                <h1
                  className={`font-bold text-white leading-tight mb-4 transition-all duration-300 text-2xl ${
                    showLyrics && hasLyrics
                      ? "md:text-[32px]"
                      : "md:text-[36px]"
                  }`}
                >
                  {currentSong.song_name || "Unknown Title"}
                </h1>
                <p className="text-white/90 mb-8 transition-all duration-300 text-lg md:text-xl font-medium">
                  {currentSong.singer_name || "Unknown Artist"}
                </p>
              </div>
            </div>

            {/* Controls */}
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
              volume={volume}
              setVolume={setVolume}
              repeatMode={repeatMode}
              toggleRepeat={toggleRepeat}
              getRepeatIcon={getRepeatIcon}
            />
          </div>

          {/* Right: Lyrics */}
          {showLyrics && hasLyrics && (
            <div className="flex-1 h-full min-w-0 flex flex-col w-full">
              <div className="h-full flex flex-col overflow-hidden">
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
                          <Text className="text-lg leading-relaxed md:text-2xl md:leading-[1.8] text-white/95 font-medium">
                            {currentSong.lyrics
                              .split("\n")
                              .map((line, index) => (
                                <div
                                  key={`lyric-line-${index}`}
                                  className="mb-3 hover:text-white"
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

      {/* Popup Bảng màu */}
      <ColorPalettePopup
        isVisible={showColorPalette}
        onClose={() => setShowColorPalette(false)}
        gradients={NEAT_GRADIENTS} // Truyền danh sách MỚI
        currentGradient={selectedGradient}
        onSelectGradient={setSelectedGradient}
      />

      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          display: none;
        }
        :global(body.dragging) {
          overflow: hidden;
          touch-action: none;
        }
        .vertical-slider {
          -webkit-appearance: none;
          appearance: none;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 5px;
          outline: none;
          transition: background 0.3s;
        }
        .vertical-slider:hover {
          background: rgba(255, 255, 255, 0.4);
        }
        .vertical-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${progressColors.thumbColor};
          cursor: ns-resize;
          border: 3px solid white;
          box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
        }
        .vertical-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${progressColors.thumbColor};
          cursor: ns-resize;
          border: 3px solid white;
          box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </div>
  );
};

export default ExpandedSongView;
