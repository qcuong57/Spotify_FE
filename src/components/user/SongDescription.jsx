import { useEffect, useRef, useState } from "react";
import { useAudio } from "../../utils/audioContext";
import Hls from "hls.js";
import SyncedLyricsDisplay from "../../components/user/SyncedLyricsDisplay";
import {
  IconX,
  IconChevronDown,
  IconHeart,
  IconHeartFilled,
  IconMusic,
  IconMicrophone,
  IconChevronUp,
} from "@tabler/icons-react";
import { Box, Text } from "@mantine/core";

const SongDescription = () => {
  const {
    currentSong,
    audio,
    setIsPlaying,
    isPlaying,
    currentTime,
    setSongDescriptionAvailable,
    repeatMode,
  } = useAudio();
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [isLiked, setIsLiked] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isVideoFullscreen, setIsVideoFullscreen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);

  // Animation effect when component mounts or song changes
  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    return () => clearTimeout(timer);
  }, [currentSong]);

  // Check if device is iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  // Handle video play/pause and tab visibility
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !currentSong) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (isPlaying) {
          videoElement.pause();
        }
      } else {
        if (isPlaying && !videoError && !isVideoFullscreen) {
          const playPromise = videoElement.play();
          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              console.warn("Video autoplay failed:", error);
              setVideoError(true);
            });
          }
        }
      }
    };

    const handleFullscreenEnter = () => {
      console.log("Video entering fullscreen");
      setIsVideoFullscreen(true);
      if (isIOS) {
        audio.pause();
        setIsPlaying(false);
      }
    };

    const handleFullscreenExit = () => {
      console.log("Video exiting fullscreen");
      setIsVideoFullscreen(false);
      if (isIOS) {
        if (isPlaying) {
          audio.play();
        }
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    const handleVideoPlay = () => {
      if (!isPlaying && !isVideoFullscreen) {
        videoElement.pause();
      }
    };

    const handleVideoPause = () => {
      if (isPlaying && !isVideoFullscreen) {
        const playPromise = videoElement.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.warn("Video resume failed:", error);
            setVideoError(true);
          });
        }
      }
    };

    const handleVideoError = () => {
      setVideoError(true);
      console.warn("Video failed to load");
    };

    const handleVideoEnded = () => {
      if (isVideoFullscreen) {
        setIsVideoFullscreen(false);
      }

      if (repeatMode === "one") {
        videoElement.currentTime = 0;
        if (isPlaying) {
          const playPromise = videoElement.play();
          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              console.warn("Video repeat failed:", error);
              setVideoError(true);
            });
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    videoElement.addEventListener(
      "webkitbeginfullscreen",
      handleFullscreenEnter
    );
    videoElement.addEventListener("webkitendfullscreen", handleFullscreenExit);
    videoElement.addEventListener("fullscreenchange", () => {
      if (document.fullscreenElement === videoElement) {
        handleFullscreenEnter();
      } else {
        handleFullscreenExit();
      }
    });

    videoElement.addEventListener("contextmenu", handleContextMenu);
    videoElement.addEventListener("play", handleVideoPlay);
    videoElement.addEventListener("pause", handleVideoPause);
    videoElement.addEventListener("error", handleVideoError);
    videoElement.addEventListener("ended", handleVideoEnded);

    videoElement.playsInline = true;
    videoElement.setAttribute("playsinline", "true");
    videoElement.setAttribute("webkit-playsinline", "true");
    videoElement.muted = true;
    videoElement.controls = false;

    if (isIOS) {
      videoElement.setAttribute("x-webkit-airplay", "allow");
      videoElement.setAttribute("preload", "none");
    }

    setVideoError(false);

    if (
      currentSong.url_video &&
      currentSong.url_video.endsWith(".m3u8") &&
      Hls.isSupported()
    ) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      const hls = new Hls({
        enableWorker: false,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      hls.loadSource(currentSong.url_video);
      hls.attachMedia(videoElement);
      hlsRef.current = hls;

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (isPlaying && !document.hidden && !isVideoFullscreen) {
          const playPromise = videoElement.play();
          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              console.warn("HLS video autoplay failed:", error);
              setVideoError(true);
            });
          }
        }
      });
    } else if (currentSong.url_video) {
      videoElement.src = currentSong.url_video;
      if (isPlaying && !document.hidden && !isVideoFullscreen) {
        const playPromise = videoElement.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.warn("Video autoplay failed:", error);
            setVideoError(true);
          });
        }
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      videoElement.removeEventListener(
        "webkitbeginfullscreen",
        handleFullscreenEnter
      );
      videoElement.removeEventListener(
        "webkitendfullscreen",
        handleFullscreenExit
      );
      videoElement.removeEventListener("contextmenu", handleContextMenu);
      videoElement.removeEventListener("play", handleVideoPlay);
      videoElement.removeEventListener("pause", handleVideoPause);
      videoElement.removeEventListener("error", handleVideoError);
      videoElement.removeEventListener("ended", handleVideoEnded);
    };
  }, [
    currentSong,
    isPlaying,
    isVideoFullscreen,
    audio,
    setIsPlaying,
    isIOS,
    repeatMode,
  ]);

  // Sync video with audio - but not when in fullscreen
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || videoError || isVideoFullscreen) return;

    if (isPlaying) {
      const playPromise = videoElement.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn("Video play error:", error);
          setVideoError(true);
        });
      }
    } else {
      videoElement.pause();
    }
  }, [isPlaying, videoError, isVideoFullscreen]);

  // Sync currentTime when seeking - but not when in fullscreen
  useEffect(() => {
    const videoElement = videoRef.current;
    if (
      videoElement &&
      !videoError &&
      !isVideoFullscreen &&
      Math.abs(videoElement.currentTime - currentTime) > 1
    ) {
      videoElement.currentTime = currentTime;
    }
  }, [currentTime, videoError, isVideoFullscreen]);

  // Handle audio events
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !audio) return;

    const handleAudioEnded = () => {
      if (repeatMode === "one") {
        videoElement.currentTime = 0;
      } else if (repeatMode === "off") {
        videoElement.pause();
        videoElement.currentTime = 0;
        setIsVideoFullscreen(false);
      }
    };

    const handleAudioPlay = () => {
      if (videoElement && !isVideoFullscreen) {
        videoElement.currentTime = audio.currentTime;
      }
    };

    const handleAudioPause = () => {
      if (videoElement && !isVideoFullscreen) {
        videoElement.pause();
      }
    };

    const handleAudioTimeUpdate = () => {
      if (videoElement && !isVideoFullscreen && !videoError) {
        const timeDiff = Math.abs(videoElement.currentTime - audio.currentTime);
        if (timeDiff > 1) {
          videoElement.currentTime = audio.currentTime;
        }
      }
    };

    audio.addEventListener("ended", handleAudioEnded);
    audio.addEventListener("play", handleAudioPlay);
    audio.addEventListener("pause", handleAudioPause);
    audio.addEventListener("timeupdate", handleAudioTimeUpdate);

    return () => {
      audio.removeEventListener("ended", handleAudioEnded);
      audio.removeEventListener("play", handleAudioPlay);
      audio.removeEventListener("pause", handleAudioPause);
      audio.removeEventListener("timeupdate", handleAudioTimeUpdate);
    };
  }, [audio, setIsPlaying, repeatMode, isVideoFullscreen, videoError]);

  const handleClose = () => {
    setIsClosing(true);

    if (isVideoFullscreen && videoRef.current) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (videoRef.current.webkitExitFullscreen) {
        videoRef.current.webkitExitFullscreen();
      }
    }

    setTimeout(() => {
      setSongDescriptionAvailable(false);
    }, 300);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleVideoClick = (e) => {
    if (isIOS) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };

  // Check if song has lyrics and timestamps
  const hasLyrics = currentSong?.lyrics && currentSong.lyrics.trim().length > 0;
  const hasTimestamps =
    hasLyrics &&
    currentSong.lyrics.includes("[") &&
    currentSong.lyrics.includes("]");

  if (!currentSong) return null;

  return (
    <div
      className={`fixed inset-0 z-50 bg-black flex flex-col md:relative md:inset-auto md:bg-transparent md:max-w-[400px] md:bg-[#131313] md:shadow-lg md:rounded-lg transition-all duration-300 ease-out ${
        isVisible && !isClosing
          ? "translate-y-0 opacity-100 md:translate-x-0"
          : "translate-y-full opacity-0 md:translate-y-0 md:translate-x-full"
      }`}
    >
      {/* Mobile Header */}
      <div
        className={`flex items-center justify-between p-4 md:hidden transition-all duration-300 delay-100 ${
          isVisible && !isClosing
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0"
        }`}
      >
        <button
          onClick={handleClose}
          className="p-2 rounded-full hover:bg-gray-800 transition-colors"
        >
          <IconChevronDown size={24} className="text-white" />
        </button>
        <span className="text-sm text-gray-400 font-medium">
          {isVideoFullscreen ? "Video Playing" : "Now Playing"}
        </span>
        <div className="w-10" />
      </div>

      {/* Desktop Header */}
      <div
        className={`hidden md:flex items-center justify-between p-3 border-b border-gray-700 transition-all duration-300 delay-100 ${
          isVisible && !isClosing
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0"
        }`}
      >
        <h2 className="text-lg font-semibold text-white">Now Playing</h2>
        <button
          onClick={handleClose}
          className="p-2 rounded-full hover:bg-gray-800 transition-colors"
        >
          <IconX size={20} className="text-white" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Video Container - Fixed height to leave space for lyrics */}
        <div
          className={`flex-shrink-0 p-3 md:p-4 transition-all duration-500 delay-200 ${
            isVisible && !isClosing
              ? "scale-100 opacity-100"
              : "scale-95 opacity-0"
          }`}
        >
          <div
            className={`relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden shadow-xl ${
              showLyrics && hasLyrics ? "aspect-[16/9]" : "aspect-video"
            }`}
          >
            {currentSong.url_video && !videoError ? (
              <>
                <video
                  id="song-video"
                  ref={videoRef}
                  playsInline
                  webkit-playsinline="true"
                  muted
                  preload={isIOS ? "none" : "metadata"}
                  className="w-full h-full object-cover"
                  onContextMenu={(e) => e.preventDefault()}
                  onClick={handleVideoClick}
                  onTouchStart={isIOS ? (e) => e.preventDefault() : undefined}
                />
                {isIOS && (
                  <div
                    className="absolute inset-0 bg-transparent"
                    onTouchStart={(e) => e.preventDefault()}
                    onTouchEnd={(e) => e.preventDefault()}
                    onTouchMove={(e) => e.preventDefault()}
                    onClick={(e) => e.preventDefault()}
                  />
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
                <img
                  src={currentSong.image}
                  alt={currentSong.song_name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Song Info - Compact version */}
        <div
          className={`flex-shrink-0 px-3 md:px-4 pb-2 transition-all duration-500 delay-300 ${
            isVisible && !isClosing
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
        >
          <div className="text-center md:text-left">
            <h3
              className={`font-bold text-white leading-tight mb-1 line-clamp-1 ${
                showLyrics && hasLyrics ? "text-base" : "text-xl md:text-lg"
              }`}
            >
              {currentSong.song_name || "Unknown Title"}
            </h3>
            <p
              className={`text-gray-400 mb-2 line-clamp-1 ${
                showLyrics && hasLyrics ? "text-xs" : "text-base md:text-sm"
              }`}
            >
              {currentSong.singer_name || "Unknown Artist"}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-center md:justify-start space-x-3">
              <button
                onClick={handleLike}
                className="p-2 rounded-full hover:bg-gray-800 transition-colors"
              >
                {isLiked ? (
                  <IconHeartFilled size={18} className="text-green-500" />
                ) : (
                  <IconHeart
                    size={18}
                    className="text-gray-400 hover:text-white"
                  />
                )}
              </button>

              {/* Lyrics Toggle */}
              {hasLyrics && (
                <button
                  onClick={() => setShowLyrics(!showLyrics)}
                  className={`p-2 rounded-full transition-colors ${
                    showLyrics
                      ? "bg-green-600 text-white"
                      : "hover:bg-gray-800 text-gray-400 hover:text-white"
                  }`}
                  title={showLyrics ? "Hide Lyrics" : "Show Lyrics"}
                >
                  <IconMicrophone size={18} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Lyrics Display Area - Takes remaining space */}
        {showLyrics && hasLyrics && (
          <div
            className={`flex-1 mx-3 md:mx-4 mb-3 md:mb-4 transition-all duration-500 delay-400 ${
              isVisible && !isClosing
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <div
              className="bg-black rounded-lg overflow-hidden"
              style={{ height: "220px", width: "100%" }}
            >
              {hasTimestamps ? (
                <SyncedLyricsDisplay
                  lyricsText={currentSong.lyrics}
                  audioElement={audio}
                  isPlaying={isPlaying}
                  className="h-full"
                />
              ) : (
                <Box
                  style={{
                    height: "100%",
                    width: "100%",
                    overflowY: "auto",
                    padding: "16px",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                  className="no-scrollbar"
                >
                  <style jsx>{`
                    .no-scrollbar::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>
                  <Text
                    style={{
                      color: "rgba(229, 231, 235, 0.8)",
                      fontSize: "14px",
                      fontWeight: 400,
                      lineHeight: 1.5,
                      textAlign: "center",
                      wordWrap: "break-word",
                    }}
                  >
                    {currentSong.lyrics.split("\n").map((line, index) => (
                      <div
                        key={`lyric-line-${index}`}
                        style={{ marginBottom: "8px" }}
                      >
                        {line.trim() || <br />}
                      </div>
                    ))}
                  </Text>
                </Box>
              )}
            </div>
          </div>
        )}

        {/* Mobile Instructions - Only show when lyrics are not displayed */}
        {(!showLyrics || !hasLyrics) && (
          <div
            className={`text-center md:hidden mt-auto p-4 transition-all duration-500 delay-400 ${
              isVisible && !isClosing
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <p className="text-sm text-gray-500">
              {isVideoFullscreen
                ? "Exit fullscreen to control playback"
                : "Swipe down to close"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SongDescription;
