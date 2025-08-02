import React from "react";
import { useRef, useState } from "react";
import {
  IconPlayerSkipBackFilled,
  IconPlayerSkipForwardFilled,
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
  IconVolume,
  IconVolume3,
  IconDownload,
  IconArticle,
  IconHeart,
  IconHeartFilled,
  IconDotsVertical,
  IconRepeat,
  IconRepeatOnce,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import { Menu, Button, Anchor } from "@mantine/core";
import { useAudio } from "../../utils/audioContext";
import { formatTime } from "../../utils/timeFormat";

const PlayerControls = ({ isVisible, onToggleVisibility }) => {
  const {
    currentSong,
    audio,
    setIsPlaying,
    isPlaying,
    setIsMute,
    isMute,
    volume,
    setVolume,
    currentTime,
    duration,
    setPlaybackTime,
    playNextSong,
    setSongDescriptionAvailable,
    playBackSong,
    repeatMode,
    setRepeatMode,
  } = useAudio();
  const progressRef = useRef(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    setVolume(newVolume);
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  const toggleRepeat = () => {
    const modes = ["all", "one"];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
  };

  const getRepeatIcon = () => {
    switch (repeatMode) {
      case "one":
        return <IconRepeatOnce size={18} className="text-teal-400" />;
      default:
        return <IconRepeat size={18} className="text-teal-400" />;
    }
  };

  const isValidDuration = duration && !isNaN(duration) && duration > 0;
  const isValidCurrentTime =
    currentTime && !isNaN(currentTime) && currentTime >= 0;
  const progressPercent =
    isValidDuration && isValidCurrentTime ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e) => {
    if (!progressRef.current || !isValidDuration) return;
    try {
      const rect = progressRef.current.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
      if (!clientX) return;
      const clickX = clientX - rect.left;
      const width = rect.width;
      if (width <= 0) return;
      const percentage = clickX / width;
      const newTime = percentage * duration;
      const clampedTime = Math.max(0, Math.min(newTime, duration));
      setPlaybackTime(Math.round(clampedTime));
    } catch (error) {
      console.error("Error in handleProgressClick:", error);
    }
  };

  const handleProgressMouseDown = (e) => {
    e.preventDefault();
    if (!isValidDuration) return;
    setIsDragging(true);
    handleProgressClick(e);
    document.body.style.overflow = "hidden";
  };

  const handleProgressTouchStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isValidDuration) return;
    setIsDragging(true);
    handleProgressClick(e);
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
  };

  const handleProgressMouseMove = (e) => {
    if (!isDragging || !progressRef.current || !isValidDuration) return;
    try {
      e.preventDefault();
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const width = rect.width;
      if (width <= 0) return;
      const percentage = clickX / width;
      const newTime = percentage * duration;
      const clampedTime = Math.max(0, Math.min(newTime, duration));
      setPlaybackTime(Math.round(clampedTime));
    } catch (error) {
      console.error("Error in handleProgressMouseMove:", error);
    }
  };

  const handleProgressTouchMove = (e) => {
    if (!isDragging || !progressRef.current || !isValidDuration) return;
    try {
      e.preventDefault();
      e.stopPropagation();
      const rect = progressRef.current.getBoundingClientRect();
      const clientX = e.touches[0]?.clientX;
      if (!clientX) return;
      const clickX = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const width = rect.width;
      if (width <= 0) return;
      const percentage = clickX / width;
      const newTime = percentage * duration;
      const clampedTime = Math.max(0, Math.min(newTime, duration));
      setPlaybackTime(Math.round(clampedTime));
    } catch (error) {
      console.error("Error in handleProgressTouchMove:", error);
    }
  };

  const handleProgressMouseUp = () => {
    setIsDragging(false);
    document.body.style.overflow = "";
  };

  const handleProgressTouchEnd = () => {
    setIsDragging(false);
    document.body.style.overflow = "";
    document.body.style.touchAction = "";
  };

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleProgressMouseMove);
      window.addEventListener("mouseup", handleProgressMouseUp);
      window.addEventListener("touchmove", handleProgressTouchMove, {
        passive: false,
      });
      window.addEventListener("touchend", handleProgressTouchEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleProgressMouseMove);
      window.removeEventListener("mouseup", handleProgressMouseUp);
      window.removeEventListener("touchmove", handleProgressTouchMove);
      window.removeEventListener("touchend", handleProgressTouchEnd);
    };
  }, [isDragging, isValidDuration]);

  const handleAvailable = () => {
    setSongDescriptionAvailable(true);
  };

  if (!currentSong) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-gradient-to-t from-teal-900/50 via-teal-800/50 to-teal-700/50 px-2 sm:px-4 py-2 sm:py-3 z-50 pb-safe transition-transform duration-300 ease-in-out backdrop-blur-md ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <button
        onClick={onToggleVisibility}
        className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-teal-500/70 to-emerald-500/70 hover:from-teal-400/70 hover:to-emerald-400/70 text-white rounded-full w-12 h-6 shadow-lg transition-all duration-300 ease-out hover:scale-105 hover:shadow-teal-500/30 flex items-center justify-center group"
        title={isVisible ? "Ẩn player" : "Hiện player"}
      >
        <div className="absolute inset-0 bg-white/10 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        <div className="relative z-10 flex items-center justify-center">
          {isVisible ? (
            <IconChevronDown
              stroke={2.5}
              className="w-4 h-4 group-hover:animate-bounce"
            />
          ) : (
            <IconChevronUp
              stroke={2.5}
              className="w-4 h-4 group-hover:animate-bounce"
            />
          )}
        </div>
      </button>

      <div className="flex items-center justify-between max-w-full mx-auto">
        <div className="flex flex-col w-full sm:hidden">
          <div className="w-full flex items-center gap-2 mb-3 px-2">
            <span className="text-xs text-teal-300 font-medium min-w-[32px] text-right">
              {formatTime(currentTime)}
            </span>
            <div
              className="h-3 flex-1 bg-teal-600/50 rounded-full cursor-pointer group relative"
              ref={progressRef}
              onClick={handleProgressClick}
              onMouseDown={handleProgressMouseDown}
              onTouchStart={handleProgressTouchStart}
              style={{
                touchAction: "none",
                minHeight: "24px",
                padding: "4px 0",
                display: "flex",
                alignItems: "center",
                WebkitTapHighlightColor: "transparent",
                opacity: isValidDuration ? 1 : 0.5,
              }}
            >
              <div
                className="h-3 bg-teal-300/70 rounded-full relative group-hover:bg-emerald-400/70 transition-colors pointer-events-none"
                style={{ width: `${progressPercent}%` }}
              >
                <div
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-teal-300/70 rounded-full shadow-lg"
                  style={{
                    opacity: isDragging ? 1 : 0,
                    transition: "opacity 0.2s",
                  }}
                ></div>
              </div>
            </div>
            <span className="text-xs text-teal-300 font-medium min-w-[32px]">
              {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <img
                src={currentSong.image}
                alt="Song cover"
                className="h-10 w-10 rounded-lg shadow-lg object-cover flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-white text-sm font-medium truncate hover:underline cursor-pointer">
                  {currentSong.song_name}
                </h4>
                <p className="text-xs text-teal-300 truncate hover:underline cursor-pointer hover:text-white">
                  {currentSong.singer_name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mx-4">
              <button
                className="text-teal-300 hover:text-white transition-colors p-1 touch-manipulation"
                onClick={playBackSong}
              >
                <IconPlayerSkipBackFilled size={18} />
              </button>

              <button
                className="bg-teal-300/70 rounded-full p-2 hover:scale-105 transition-transform shadow-lg touch-manipulation"
                onClick={togglePlayPause}
              >
                {isPlaying ? (
                  <IconPlayerPauseFilled className="text-teal-900 w-4 h-4" />
                ) : (
                  <IconPlayerPlayFilled className="text-teal-900 w-4 h-4 ml-0.5" />
                )}
              </button>

              <button
                className="text-teal-300 hover:text-white transition-colors p-1 touch-manipulation"
                onClick={playNextSong}
              >
                <IconPlayerSkipForwardFilled size={18} />
              </button>
            </div>

            <Menu shadow="md" position="top">
              <Menu.Target>
                <button className="text-teal-300 hover:text-white transition-colors p-2 touch-manipulation">
                  <IconDotsVertical size={18} />
                </button>
              </Menu.Target>
              <Menu.Dropdown className="bg-teal-800/50 border-none backdrop-blur-md">
                <Menu.Item
                  className="text-white hover:bg-teal-700/50"
                  onClick={toggleRepeat}
                >
                  <div className="flex items-center gap-2">
                    {getRepeatIcon()}
                    <span>Repeat: {repeatMode === "all" ? "All" : "One"}</span>
                  </div>
                </Menu.Item>
                <Menu.Item
                  className="text-white hover:bg-teal-700/50"
                  onClick={toggleLike}
                >
                  <div className="flex items-center gap-2">
                    {isLiked ? (
                      <IconHeartFilled size={16} className="text-emerald-400" />
                    ) : (
                      <IconHeart size={16} />
                    )}
                    <span>{isLiked ? "Unlike" : "Like"}</span>
                  </div>
                </Menu.Item>
                <Menu.Item
                  className="text-white hover:bg-teal-700/50"
                  onClick={handleAvailable}
                >
                  <div className="flex items-center gap-2">
                    <IconArticle size={16} />
                    <span>Now Playing</span>
                  </div>
                </Menu.Item>
                <Menu.Item className="text-white hover:bg-teal-700/50">
                  <Anchor
                    href={currentSong.video_download_url}
                    underline="never"
                    size="sm"
                    className="text-white flex items-center gap-2"
                  >
                    <IconDownload size={16} />
                    Download video
                  </Anchor>
                </Menu.Item>
                <Menu.Item className="text-white hover:bg-teal-700/50">
                  <Anchor
                    href={currentSong.audio_download_url}
                    underline="never"
                    size="sm"
                    className="text-white flex items-center gap-2"
                  >
                    <IconDownload size={16} />
                    Download audio
                  </Anchor>
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>
        </div>

        <div className="hidden sm:flex items-center justify-between w-full">
          <div className="flex items-center w-1/4 min-w-0">
            <div className="flex items-center gap-3 md:gap-4 min-w-0">
              <img
                src={currentSong.image}
                alt="Song cover"
                className="h-12 w-12 md:h-14 md:w-14 rounded-lg shadow-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-white text-sm font-medium truncate hover:underline cursor-pointer">
                  {currentSong.song_name}
                </h4>
                <p className="text-xs text-teal-300 truncate hover:underline cursor-pointer hover:text-white">
                  {currentSong.singer_name}
                </p>
              </div>
              <button
                className="text-teal-300 hover:text-white transition-colors ml-2"
                onClick={toggleLike}
              >
                {isLiked ? (
                  <IconHeartFilled size={16} className="text-emerald-400" />
                ) : (
                  <IconHeart size={16} />
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center w-1/2 max-w-2xl">
            <div className="flex items-center gap-4 mb-2">
              <button
                className="text-teal-300 hover:text-white transition-colors"
                onClick={playBackSong}
              >
                <IconPlayerSkipBackFilled size={20} />
              </button>

              <button
                className="bg-teal-300/70 rounded-full p-2 hover:scale-105 transition-transform shadow-lg"
                onClick={togglePlayPause}
              >
                {isPlaying ? (
                  <IconPlayerPauseFilled className="text-teal-900 w-5 h-5" />
                ) : (
                  <IconPlayerPlayFilled className="text-teal-900 w-5 h-5 ml-0.5" />
                )}
              </button>

              <button
                className="text-teal-300 hover:text-white transition-colors"
                onClick={playNextSong}
              >
                <IconPlayerSkipForwardFilled size={20} />
              </button>

              <button
                className="text-teal-400 transition-colors"
                onClick={toggleRepeat}
                title={`Repeat: ${repeatMode === "all" ? "All" : "One"}`}
              >
                {getRepeatIcon()}
              </button>
            </div>

            <div className="w-full flex items-center gap-2">
              <span className="text-xs text-teal-300 font-medium min-w-[40px] text-right">
                {formatTime(currentTime)}
              </span>
              <div
                className="h-1 flex-1 bg-teal-600/50 rounded-full cursor-pointer group relative"
                ref={progressRef}
                onClick={handleProgressClick}
                onMouseDown={handleProgressMouseDown}
                onTouchStart={handleProgressTouchStart}
                style={{
                  opacity: isValidDuration ? 1 : 0.5,
                }}
              >
                <div
                  className="h-1 bg-teal-300/70 rounded-full relative group-hover:bg-emerald-400/70 transition-colors"
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-teal-300/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"></div>
                </div>
              </div>
              <span className="text-xs text-teal-300 font-medium min-w-[40px]">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 w-1/4 justify-end">
            <button
              className="text-teal-300 hover:text-white transition-colors"
              onClick={handleAvailable}
            >
              <IconArticle size={18} />
            </button>

            <Menu shadow="md" position="top">
              <Menu.Target>
                <button className="text-teal-300 hover:text-white transition-colors">
                  <IconDownload size={18} />
                </button>
              </Menu.Target>
              <Menu.Dropdown className="bg-teal-800/50 border-none backdrop-blur-md">
                <Menu.Item className="text-white hover:bg-teal-700/50">
                  <Anchor
                    href={currentSong.video_download_url}
                    underline="never"
                    size="sm"
                    className="text-white"
                  >
                    Download video
                  </Anchor>
                </Menu.Item>
                <Menu.Item className="text-white hover:bg-teal-700/50">
                  <Anchor
                    href={currentSong.audio_download_url}
                    underline="never"
                    size="sm"
                    className="text-white"
                  >
                    Download audio
                  </Anchor>
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>

            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setIsMute(!isMute)}
                className="text-teal-300 hover:text-white transition-colors flex-shrink-0"
              >
                {isMute ? <IconVolume3 size={18} /> : <IconVolume size={18} />}
              </button>
              <div className="w-20 lg:w-24 group flex items-center">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-full h-1 bg-teal-600/50 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #2dd4bf 0%, #2dd4bf ${volume}%, #4d4d4d ${volume}%, #4d4d4d 100%)`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom);
        }

        .touch-manipulation {
          touch-action: manipulation;
        }

        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #2dd4bf;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .slider:hover::-webkit-slider-thumb {
          opacity: 1;
        }

        .slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #2dd4bf;
          cursor: pointer;
          border: none;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .slider:hover::-moz-range-thumb {
          opacity: 1;
        }

        body.dragging {
          overflow: hidden;
          touch-action: none;
        }

        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s infinite;
        }
      `}</style>
    </div>
  );
};

export default PlayerControls;
