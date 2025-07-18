import { useEffect, useRef, useState } from "react";
import { useAudio } from "../../utils/audioContext";
import Hls from "hls.js";
import {
  IconX,
  IconChevronDown,
  IconHeart,
  IconHeartFilled,
} from "@tabler/icons-react";

const SongDescription = () => {
  const {
    currentSong,
    audio,
    setIsPlaying,
    isPlaying,
    currentTime,
    setSongDescriptionAvailable,
  } = useAudio();
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [isLiked, setIsLiked] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isVideoFullscreen, setIsVideoFullscreen] = useState(false);

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
          // Only try to play if user has interacted with the page and not in fullscreen
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

    // Handle fullscreen events - iOS specific
    const handleFullscreenEnter = (e) => {
      console.log("Video entering fullscreen");
      setIsVideoFullscreen(true);
      if (isIOS) {
        // On iOS, when video goes fullscreen, we pause the audio
        audio.pause();
        setIsPlaying(false);
      }
    };

    const handleFullscreenExit = (e) => {
      console.log("Video exiting fullscreen");
      setIsVideoFullscreen(false);
      if (isIOS) {
        // On iOS, when exiting fullscreen, we resume audio if it was playing
        if (isPlaying) {
          audio.play();
        }
      }
    };

    // Prevent context menu on video
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // Handle video play/pause sync with audio
    const handleVideoPlay = () => {
      if (!isPlaying && !isVideoFullscreen) {
        videoElement.pause();
      }
    };

    const handleVideoPause = () => {
      // If video is paused but audio should be playing, resume audio
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

    // Handle video ended
    const handleVideoEnded = () => {
      if (isVideoFullscreen) {
        setIsVideoFullscreen(false);
      }
    };

    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    // iOS fullscreen events
    videoElement.addEventListener("webkitbeginfullscreen", handleFullscreenEnter);
    videoElement.addEventListener("webkitendfullscreen", handleFullscreenExit);
    
    // Standard fullscreen events
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

    // Set up mobile attributes - More restrictive for iOS
    videoElement.playsInline = true;
    videoElement.setAttribute("playsinline", "true");
    videoElement.setAttribute("webkit-playsinline", "true");
    videoElement.muted = true;
    videoElement.controls = false;
    
    // Additional iOS-specific attributes
    if (isIOS) {
      videoElement.setAttribute("x-webkit-airplay", "allow");
      videoElement.setAttribute("preload", "none");
    }

    // Reset video error state
    setVideoError(false);

    // Handle HLS or direct MP4
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
      videoElement.removeEventListener("webkitbeginfullscreen", handleFullscreenEnter);
      videoElement.removeEventListener("webkitendfullscreen", handleFullscreenExit);
      videoElement.removeEventListener("contextmenu", handleContextMenu);
      videoElement.removeEventListener("play", handleVideoPlay);
      videoElement.removeEventListener("pause", handleVideoPause);
      videoElement.removeEventListener("error", handleVideoError);
      videoElement.removeEventListener("ended", handleVideoEnded);
    };
  }, [currentSong, isPlaying, isVideoFullscreen, audio, setIsPlaying, isIOS]);

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

  // Stop video when audio ends
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !audio) return;

    const handleAudioEnded = () => {
      videoElement.pause();
      videoElement.currentTime = 0;
      setIsPlaying(false);
      setIsVideoFullscreen(false);
    };

    audio.addEventListener("ended", handleAudioEnded);

    return () => {
      audio.removeEventListener("ended", handleAudioEnded);
    };
  }, [audio, setIsPlaying]);

  const handleClose = () => {
    // If video is in fullscreen, exit it first
    if (isVideoFullscreen && videoRef.current) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (videoRef.current.webkitExitFullscreen) {
        videoRef.current.webkitExitFullscreen();
      }
    }
    setSongDescriptionAvailable(false);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  // Handle video click - prevent fullscreen on iOS
  const handleVideoClick = (e) => {
    if (isIOS) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };

  if (!currentSong) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col md:relative md:inset-auto md:bg-transparent md:max-w-[400px] md:bg-[#131313] md:shadow-lg md:rounded-lg">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 md:hidden">
        <button
          onClick={handleClose}
          className="p-2 rounded-full hover:bg-gray-800 transition-colors"
        >
          <IconChevronDown size={24} className="text-white" />
        </button>
        <span className="text-sm text-gray-400 font-medium">
          {isVideoFullscreen ? "Video Playing" : "Now Playing"}
        </span>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">Now Playing</h2>
        <button
          onClick={handleClose}
          className="p-2 rounded-full hover:bg-gray-800 transition-colors"
        >
          <IconX size={20} className="text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 md:p-6 flex flex-col">
        {/* Video Container */}
        <div className="relative w-full mb-6 md:mb-4">
          <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden shadow-2xl">
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
                {/* iOS specific overlay to prevent accidental fullscreen */}
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
              // Fallback to album art if video fails or unavailable
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

        {/* Song Info */}
        <div className="flex-1 flex flex-col justify-center md:justify-start">
          <div className="text-center md:text-left mb-6 md:mb-4">
            <h3 className="text-2xl md:text-xl font-bold text-white leading-tight mb-2">
              {currentSong.song_name || "Unknown Title"}
            </h3>
            <p className="text-lg md:text-base text-gray-400 mb-4">
              {currentSong.singer_name || "Unknown Artist"}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-center md:justify-start space-x-4">
              <button
                onClick={handleLike}
                className="p-3 rounded-full hover:bg-gray-800 transition-colors"
              >
                {isLiked ? (
                  <IconHeartFilled size={24} className="text-green-500" />
                ) : (
                  <IconHeart
                    size={24}
                    className="text-gray-400 hover:text-white"
                  />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Instructions */}
          <div className="text-center md:hidden mt-auto">
            <p className="text-sm text-gray-500">
              {isVideoFullscreen ? "Exit fullscreen to control playback" : "Swipe down to close"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongDescription;