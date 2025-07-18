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
} from "@tabler/icons-react";
import { Menu, Button, Anchor } from "@mantine/core";
import { useAudio } from "../../utils/audioContext";
import { formatTime } from "../../utils/timeFormat";

const PlayerControls = () => {
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
  } = useAudio();
  const progressRef = useRef(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [repeatMode, setRepeatMode] = useState("off"); // "off", "all", "one"

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
    const modes = ["off", "all", "one"];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
  };

  const getRepeatIcon = () => {
    switch (repeatMode) {
      case "one":
        return <IconRepeatOnce size={18} className="text-green-500" />;
      case "all":
        return <IconRepeat size={18} className="text-green-500" />;
      default:
        return <IconRepeat size={18} />;
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e) => {
    if (progressRef.current && duration > 0) {
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const newTime = (clickX / width) * duration;
      setPlaybackTime(Math.round(newTime));
    }
  };

  const handleProgressMouseDown = (e) => {
    setIsDragging(true);
    handleProgressClick(e);
  };

  const handleProgressMouseMove = (e) => {
    if (isDragging && progressRef.current && duration > 0) {
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const width = rect.width;
      const newTime = (clickX / width) * duration;
      setPlaybackTime(Math.round(newTime));
    }
  };

  const handleProgressMouseUp = () => {
    setIsDragging(false);
  };

  // Add event listeners for mouse move and up on window
  const handleMouseMove = (e) => {
    if (isDragging) {
      handleProgressMouseMove(e);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      handleProgressMouseUp();
    }
  };

  // Add event listeners when dragging starts
  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // Handle audio ended event for repeat functionality
  React.useEffect(() => {
    if (audio) {
      const handleEnded = () => {
        console.log("Audio ended, repeat mode:", repeatMode);
        
        if (repeatMode === "one") {
          // Repeat current song
          setTimeout(() => {
            audio.currentTime = 0;
            setPlaybackTime(0);
            audio.play().catch(console.error);
            setIsPlaying(true);
          }, 100);
        } else if (repeatMode === "all") {
          // Play next song (or first song if at end of playlist)
          setTimeout(() => {
            playNextSong();
          }, 100);
        } else {
          // Off mode - stop playing
          setIsPlaying(false);
        }
      };

      audio.addEventListener("ended", handleEnded);
      return () => {
        audio.removeEventListener("ended", handleEnded);
      };
    }
  }, [audio, repeatMode, playNextSong, setIsPlaying, setPlaybackTime]);

  // Alternative approach - check if song is about to end
  React.useEffect(() => {
    if (audio && duration > 0 && currentTime > 0) {
      // Check if song is within 0.5 seconds of ending
      if (duration - currentTime <= 0.5 && duration - currentTime > 0) {
        if (repeatMode === "one") {
          // Prepare for repeat
          console.log("Song about to end, preparing to repeat");
        }
      }
    }
  }, [currentTime, duration, repeatMode, audio]);

  const handleAvailable = () => {
    setSongDescriptionAvailable(true);
  };

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 px-2 sm:px-4 py-2 sm:py-3 z-50">
      <div className="flex items-center justify-between max-w-full mx-auto">
        {/* Mobile Layout - Stack vertically on very small screens */}
        <div className="flex flex-col w-full sm:hidden">
          {/* Progress Bar - Mobile Top */}
          <div className="w-full flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-400 font-medium min-w-[32px] text-right">
              {formatTime(currentTime)}
            </span>
            <div
              className="h-1 flex-1 bg-gray-600 rounded-full cursor-pointer group relative"
              ref={progressRef}
              onClick={handleProgressClick}
              onMouseDown={handleProgressMouseDown}
            >
              <div
                className="h-1 bg-white rounded-full relative group-hover:bg-green-500 transition-colors"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"></div>
              </div>
            </div>
            <span className="text-xs text-gray-400 font-medium min-w-[32px]">
              {formatTime(duration)}
            </span>
          </div>

          {/* Main Controls - Mobile Bottom */}
          <div className="flex items-center justify-between">
            {/* Song Info - Mobile */}
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
                <p className="text-xs text-gray-400 truncate hover:underline cursor-pointer hover:text-white">
                  {currentSong.singer_name}
                </p>
              </div>
            </div>

            {/* Playback Controls - Mobile */}
            <div className="flex items-center gap-2 mx-4">
              <button
                className="text-gray-400 hover:text-white transition-colors"
                onClick={playBackSong}
              >
                <IconPlayerSkipBackFilled size={18} />
              </button>

              <button
                className="bg-white rounded-full p-2 hover:scale-105 transition-transform shadow-lg"
                onClick={togglePlayPause}
              >
                {isPlaying ? (
                  <IconPlayerPauseFilled className="text-black w-4 h-4" />
                ) : (
                  <IconPlayerPlayFilled className="text-black w-4 h-4 ml-0.5" />
                )}
              </button>

              <button
                className="text-gray-400 hover:text-white transition-colors"
                onClick={playNextSong}
              >
                <IconPlayerSkipForwardFilled size={18} />
              </button>
            </div>

            {/* Mobile Menu */}
            <Menu shadow="md" position="top">
              <Menu.Target>
                <button className="text-gray-400 hover:text-white transition-colors p-2">
                  <IconDotsVertical size={18} />
                </button>
              </Menu.Target>
              <Menu.Dropdown className="bg-gray-800 border-gray-700">
                <Menu.Item
                  className="text-white hover:bg-gray-700"
                  onClick={toggleRepeat}
                >
                  <div className="flex items-center gap-2">
                    {getRepeatIcon()}
                    <span>
                      Repeat: {repeatMode === "off" ? "Off" : repeatMode === "all" ? "All" : "One"}
                    </span>
                  </div>
                </Menu.Item>
                <Menu.Item
                  className="text-white hover:bg-gray-700"
                  onClick={toggleLike}
                >
                  <div className="flex items-center gap-2">
                    {isLiked ? (
                      <IconHeartFilled size={16} className="text-green-500" />
                    ) : (
                      <IconHeart size={16} />
                    )}
                    <span>{isLiked ? "Unlike" : "Like"}</span>
                  </div>
                </Menu.Item>
                <Menu.Item
                  className="text-white hover:bg-gray-700"
                  onClick={handleAvailable}
                >
                  <div className="flex items-center gap-2">
                    <IconArticle size={16} />
                    <span>Now Playing</span>
                  </div>
                </Menu.Item>
                <Menu.Item className="text-white hover:bg-gray-700">
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
                <Menu.Item className="text-white hover:bg-gray-700">
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

        {/* Desktop Layout - Hidden on mobile */}
        <div className="hidden sm:flex items-center justify-between w-full">
          {/* Currently Playing - Left Section */}
          <div className="flex items-center w-1/4 min-w-0">
            <div className="flex items-center gap-3 md:gap-4 min-w-0">
              <img
                src={currentSong.image}
                alt="Song cover"
                className="h-12 w-12 md:h-14 md:w-14 rounded-lg shadow-lg object-cover flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-white text-sm font-medium truncate hover:underline cursor-pointer">
                  {currentSong.song_name}
                </h4>
                <p className="text-xs text-gray-400 truncate hover:underline cursor-pointer hover:text-white">
                  {currentSong.singer_name}
                </p>
              </div>
              <button
                className="text-gray-400 hover:text-white transition-colors ml-2"
                onClick={toggleLike}
              >
                {isLiked ? (
                  <IconHeartFilled size={16} className="text-green-500" />
                ) : (
                  <IconHeart size={16} />
                )}
              </button>
            </div>
          </div>

          {/* Playback Controls - Center Section */}
          <div className="flex flex-col items-center w-1/2 max-w-2xl">
            <div className="flex items-center gap-4 mb-2">
              <button
                className="text-gray-400 hover:text-white transition-colors"
                onClick={playBackSong}
              >
                <IconPlayerSkipBackFilled size={20} />
              </button>

              <button
                className="bg-white rounded-full p-2 hover:scale-105 transition-transform shadow-lg"
                onClick={togglePlayPause}
              >
                {isPlaying ? (
                  <IconPlayerPauseFilled className="text-black w-5 h-5" />
                ) : (
                  <IconPlayerPlayFilled className="text-black w-5 h-5 ml-0.5" />
                )}
              </button>

              <button
                className="text-gray-400 hover:text-white transition-colors"
                onClick={playNextSong}
              >
                <IconPlayerSkipForwardFilled size={20} />
              </button>

              <button
                className={`transition-colors ${
                  repeatMode !== "off" ? "text-green-500" : "text-gray-400 hover:text-white"
                }`}
                onClick={toggleRepeat}
                title={`Repeat: ${repeatMode === "off" ? "Off" : repeatMode === "all" ? "All" : "One"}`}
              >
                {getRepeatIcon()}
              </button>
            </div>

            <div className="w-full flex items-center gap-2">
              <span className="text-xs text-gray-400 font-medium min-w-[40px] text-right">
                {formatTime(currentTime)}
              </span>
              <div
                className="h-1 flex-1 bg-gray-600 rounded-full cursor-pointer group relative"
                ref={progressRef}
                onClick={handleProgressClick}
                onMouseDown={handleProgressMouseDown}
              >
                <div
                  className="h-1 bg-white rounded-full relative group-hover:bg-green-500 transition-colors"
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"></div>
                </div>
              </div>
              <span className="text-xs text-gray-400 font-medium min-w-[40px]">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Volume Control - Right Section */}
          <div className="flex items-center gap-2 md:gap-3 w-1/4 justify-end">
            <button
              className="text-gray-400 hover:text-white transition-colors"
              onClick={handleAvailable}
            >
              <IconArticle size={18} />
            </button>

            <Menu shadow="md" position="top">
              <Menu.Target>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <IconDownload size={18} />
                </button>
              </Menu.Target>
              <Menu.Dropdown className="bg-gray-800 border-gray-700">
                <Menu.Item className="text-white hover:bg-gray-700">
                  <Anchor
                    href={currentSong.video_download_url}
                    underline="never"
                    size="sm"
                    className="text-white"
                  >
                    Download video
                  </Anchor>
                </Menu.Item>
                <Menu.Item className="text-white hover:bg-gray-700">
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
                className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
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
                  className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #1db954 0%, #1db954 ${volume}%, #4d4d4d ${volume}%, #4d4d4d 100%)`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #1db954;
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
          background: #1db954;
          cursor: pointer;
          border: none;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .slider:hover::-moz-range-thumb {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default PlayerControls;