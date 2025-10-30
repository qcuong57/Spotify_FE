import React from "react";
// Thêm useCallback
import { useRef, useState, useEffect, useCallback } from "react";
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
  IconPlaylistAdd,
  IconMusic,
  IconCheck,
  IconVideo,
  IconFileMusic,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Button, Anchor, Modal } from "@mantine/core";
import { useAudio } from "../../utils/audioContext";
import { useTheme } from "../../context/themeContext";
import { usePlayList } from "../../utils/playlistContext";
import { formatTime } from "../../utils/timeFormat";
import {
  addToLikedSongsService,
  removeFromLikedSongsService,
  getLikedSongsService,
} from "../../services/SongPlaylistService";
import { addSongToPlaylistService } from "../../services/SongPlaylistService";
import { getUserPlaylistByIdService } from "../../services/playlistService";

const PlayerControls = ({ isVisible, onToggleVisibility }) => {
  const { theme } = useTheme();
  const { playlists } = usePlayList();
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
    setPlaybackTime, // Hàm này giờ đã ổn định từ context
    playNextSong,
    setSongDescriptionAvailable,
    playBackSong,
    repeatMode,
    setRepeatMode,
  } = useAudio();

  const progressRef = useRef(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [loadingLike, setLoadingLike] = useState(false);
  const [loadingPlaylistId, setLoadingPlaylistId] = useState(null);
  const [user, setUser] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // (Các hàm useEffect và logic khác giữ nguyên...)
  // Kiểm tra user đăng nhập
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const accessToken = localStorage.getItem("access_token");

    if (storedUser && accessToken) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    }
  }, []);

  // Lấy danh sách playlist của user
  useEffect(() => {
    const fetchUserPlaylists = async () => {
      if (!user?.id) return;

      try {
        const response = await getUserPlaylistByIdService(user.id);
        if (response?.data?.playlists) {
          // Lọc bỏ playlist "Liked Songs"
          const regularPlaylists = response.data.playlists.filter(
            (playlist) => !playlist.is_liked_song
          );
          setUserPlaylists(regularPlaylists);
        }
      } catch (error) {
        console.error("Error fetching user playlists:", error);
      }
    };

    fetchUserPlaylists();
  }, [user, playlists]);

  // Kiểm tra trạng thái like của bài hát hiện tại
  useEffect(() => {
    const checkLikedStatus = async () => {
      if (!currentSong?.id || !user) {
        setIsLiked(false);
        return;
      }

      try {
        const response = await getLikedSongsService();
        if (response?.data?.results) {
          const likedSongs = response.data.results;
          const isCurrentSongLiked = likedSongs.some(
            (song) => song.id === currentSong.id
          );
          setIsLiked(isCurrentSongLiked);
        } else {
          setIsLiked(false);
        }
      } catch (error) {
        console.error("Error checking liked status:", error);
        setIsLiked(false);
      }
    };

    // Reset trạng thái like khi chuyển bài hát mới
    setIsLiked(false);
    checkLikedStatus();
  }, [currentSong?.id, user]);

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

  const toggleLike = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập để sử dụng chức năng này!");
      return;
    }

    if (!currentSong?.id) {
      console.error("No current song ID");
      return;
    }

    if (loadingLike) return;

    try {
      setLoadingLike(true);

      if (isLiked) {
        await removeFromLikedSongsService(currentSong.id);
        setIsLiked(false);
      } else {
        const formData = new FormData();
        formData.append("song_id", currentSong.id.toString());
        await addToLikedSongsService(formData);
        setIsLiked(true);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      console.error("Error details:", error.response?.data);

      if (error.response?.status === 400) {
        alert("Bài hát này đã có trong danh sách yêu thích hoặc đã bị xóa!");
      } else if (error.response?.status === 404) {
        alert("Không tìm thấy bài hát này!");
      } else {
        alert("Có lỗi xảy ra khi cập nhật trạng thái yêu thích!");
      }

      try {
        const response = await getLikedSongsService();
        if (response?.data?.results) {
          const likedSongs = response.data.results;
          const isCurrentSongLiked = likedSongs.some(
            (song) => song.id === currentSong.id
          );
          setIsLiked(isCurrentSongLiked);
        }
      } catch (recheckError) {
        console.error("Error rechecking liked status:", recheckError);
      }
    } finally {
      setLoadingLike(false);
    }
  };

  const handleAddToPlaylist = async (playlistId) => {
    if (!currentSong?.id || !user || loadingPlaylistId) return;

    try {
      setLoadingPlaylistId(playlistId);

      const formData = new FormData();
      formData.append("playlist_id", playlistId);
      formData.append("song_id", currentSong.id);

      await addSongToPlaylistService(formData);
      
      setShowSuccessMessage(true);

      setTimeout(() => {
        setShowPlaylistModal(false);
        setShowSuccessMessage(false);
      }, 2000);

    } catch (error) {
      console.error("Error adding song to playlist:", error);
      if (error.response?.status === 400) {
        alert("Bài hát đã có trong playlist này!");
      } else {
        alert("Có lỗi xảy ra khi thêm vào playlist!");
      }
    } finally {
      setLoadingPlaylistId(null);
    }
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
        return (
          <IconRepeatOnce
            size={18}
            className={`text-${theme.colors.secondary}-400`}
          />
        );
      default:
        return (
          <IconRepeat
            size={18}
            className={`text-${theme.colors.secondary}-400`}
          />
        );
    }
  };

  // Get theme-specific progress colors (Đã sửa)
  const getProgressColors = () => {
    switch (theme.id) {
      case "pixelCyberpunk":
        return {
          trackBg: "bg-emerald-600/50",
          progressBg: "bg-emerald-300",
          progressHover: "hover:bg-violet-400",
          thumbColor: "#a78bfa", // violet-300
        };
      case "villagePixelArt":
        return {
          trackBg: "bg-amber-600/50",
          progressBg: "bg-amber-300",
          progressHover: "hover:bg-sky-400",
          thumbColor: "#67e8f9", // emerald-300 (theo songIndicator)
        };
      case "cherryBlossom":
        return {
          trackBg: "bg-rose-600/50",
          progressBg: "bg-rose-300",
          progressHover: "hover:bg-white",
          thumbColor: "#ffffff", // white
        };
      case "ocean":
        return {
          trackBg: "bg-teal-600/50",
          progressBg: "bg-teal-300",
          progressHover: "hover:bg-emerald-400",
          thumbColor: "#5eead4", // teal-300
        };
      case "forest":
        return {
          trackBg: "bg-green-600/50",
          progressBg: "bg-amber-400",
          progressHover: "hover:bg-amber-300",
          thumbColor: "#fbbf24", // amber-400
        };
      case "space":
        return {
          trackBg: "bg-purple-600/50",
          progressBg: "bg-purple-300",
          progressHover: "hover:bg-pink-400",
          thumbColor: "#d8b4fe", // purple-300
        };
      case "sunset":
        return {
          trackBg: "bg-orange-600/50",
          progressBg: "bg-orange-300",
          progressHover: "hover:bg-amber-400",
          thumbColor: "#fb923c", // orange-300
        };
      case "kitten":
        return {
          trackBg: "bg-lime-600/50",
          progressBg: "bg-lime-300",
          progressHover: "hover:bg-orange-400",
          thumbColor: "#fdba74", // orange-300
        };
      case "darkmode":
        return {
          trackBg: "bg-gray-600/50",
          progressBg: "bg-gray-300",
          progressHover: "hover:bg-lime-400",
          thumbColor: "#bef264", // lime-300
        };
      case "cyberpunk":
        return {
          trackBg: "bg-red-600/50",
          progressBg: "bg-red-300",
          progressHover: "hover:bg-lime-400",
          thumbColor: "#bef264", // lime-300
        };
      case "autumn":
        return {
          trackBg: "bg-amber-600/50",
          progressBg: "bg-amber-300",
          progressHover: "hover:bg-orange-400",
          thumbColor: "#fdba74", // orange-300
        };
      case "winter":
        return {
          trackBg: "bg-sky-600/50",
          progressBg: "bg-sky-300",
          progressHover: "hover:bg-blue-400",
          thumbColor: "#67e8f9", // cyan-300
        };
      case "neon": 
        return {
          trackBg: "bg-gray-600/50",
          progressBg: "bg-cyan-300",
          progressHover: "hover:bg-fuchsia-400",
          thumbColor: "#06b6d4",
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

  const progressColors = getProgressColors();

  const isValidDuration = duration && !isNaN(duration) && duration > 0;
  const isValidCurrentTime =
    currentTime && !isNaN(currentTime) && currentTime >= 0;
  const progressPercent =
    isValidDuration && isValidCurrentTime ? (currentTime / duration) * 100 : 0;

  // --- BẮT ĐẦU SỬA CÁC HÀM XỬ LÝ KÉO ---

  // Hàm này tính toán vị trí click/touch
  const handleProgressChange = useCallback((e) => {
    if (!progressRef.current || !isValidDuration) return;
    try {
      const rect = progressRef.current.getBoundingClientRect();

      let clientX;
      if (e.touches) {
        clientX = e.touches[0].clientX; // Nếu là sự kiện touch
      } else {
        clientX = e.clientX; // Nếu là sự kiện mouse
      }
      
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

  // Khi nhấn chuột xuống
  const handleProgressMouseDown = useCallback((e) => {
    e.preventDefault();
    if (!isValidDuration) return;
    setIsDragging(true);
    handleProgressChange(e);
    document.body.style.overflow = "hidden";
  }, [isValidDuration, handleProgressChange]);

  // Khi bắt đầu chạm (mobile)
  const handleProgressTouchStart = useCallback((e) => {
    // e.preventDefault(); // <-- XÓA DÒNG NÀY ĐỂ TRÁNH LỖI PASSIVE LISTENER
    e.stopPropagation();
    if (!isValidDuration) return;
    setIsDragging(true);
    handleProgressChange(e);
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
  }, [isValidDuration, handleProgressChange]);

  // Khi kéo chuột
  const handleProgressMouseMove = useCallback((e) => {
    if (!isDragging) return;
    handleProgressChange(e);
  }, [isDragging, handleProgressChange]);

  // Khi kéo trên mobile
  const handleProgressTouchMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault(); // Giữ lại ở đây (vì listener đã được set {passive: false})
    e.stopPropagation();
    handleProgressChange(e);
  }, [isDragging, handleProgressChange]);

  // Khi nhả chuột
  const handleProgressMouseUp = useCallback(() => {
    setIsDragging(false);
    document.body.style.overflow = "";
  }, []);

  // Khi nhả tay (mobile)
  const handleProgressTouchEnd = useCallback(() => {
    setIsDragging(false);
    document.body.style.overflow = "";
    document.body.style.touchAction = "";
  }, []);

  // useEffect để gắn/gỡ listener
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleProgressMouseMove);
      window.addEventListener("mouseup", handleProgressMouseUp);
      window.addEventListener("touchmove", handleProgressTouchMove, {
        passive: false, // <-- Quan trọng: Cho phép preventDefault trong lúc kéo
      });
      window.addEventListener("touchend", handleProgressTouchEnd);
    }
    
    return () => {
      window.removeEventListener("mousemove", handleProgressMouseMove);
      window.removeEventListener("mouseup", handleProgressMouseUp);
      window.removeEventListener("touchmove", handleProgressTouchMove);
      window.removeEventListener("touchend", handleProgressTouchEnd);
    };
  }, [
    isDragging, 
    handleProgressMouseMove, 
    handleProgressMouseUp, 
    handleProgressTouchMove, 
    handleProgressTouchEnd
  ]);
  
  // --- KẾT THÚC SỬA ---

  const handleAvailable = () => {
    setSongDescriptionAvailable(true);
  };


  if (!currentSong) return null;

  return (
    <>
      <div
        className={`fixed bottom-0 left-0 right-0 bg-gradient-to-t ${
          theme.colors.backgroundOverlay
        } px-2 sm:px-4 py-2 sm:py-3 z-[10001] pb-safe transition-transform duration-300 ease-in-out backdrop-blur-md ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <button
          onClick={onToggleVisibility}
          className={`absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-${theme.colors.primary}-500/70 to-${theme.colors.secondary}-500/70 hover:from-${theme.colors.primary}-400/70 hover:to-${theme.colors.secondary}-400/70 text-white rounded-full w-12 h-6 shadow-lg transition-all duration-300 ease-out hover:scale-105 hover:shadow-${theme.colors.primary}-500/30 flex items-center justify-center group`}
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
          {/* Mobile Layout */}
          <div className="flex flex-col w-full sm:hidden">
            <div className="w-full flex items-center gap-2 mb-3 px-2">
              <span
                className={`text-xs text-${theme.colors.text} font-medium min-w-[32px] text-right`}
              >
                {formatTime(currentTime)}
              </span>
              <div
                className={`h-3 flex-1 ${progressColors.trackBg} rounded-full cursor-pointer group relative`}
                ref={progressRef}
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
                  className={`h-3 ${progressColors.progressBg} ${progressColors.progressHover} rounded-full relative transition-colors pointer-events-none`}
                  style={{ width: `${progressPercent}%` }}
                >
                  <div
                    className={`absolute right-0 top-1/2 transform -translate-y-1/2 w-5 h-5 ${progressColors.progressBg} rounded-full shadow-lg`}
                    style={{
                      backgroundColor: progressColors.thumbColor,
                      opacity: isDragging ? 1 : 0,
                      transition: "opacity 0.2s",
                    }}
                  ></div>
                </div>
              </div>
              <span
                className={`text-xs text-${theme.colors.text} font-medium min-w-[32px]`}
              >
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
                  <p
                    className={`text-xs text-${theme.colors.text} truncate hover:underline cursor-pointer hover:text-white`}
                  >
                    {currentSong.singer_name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mx-4">
                <button
                  className={`text-${theme.colors.text} hover:text-white transition-colors p-1 touch-manipulation`}
                  onClick={playBackSong}
                >
                  <IconPlayerSkipBackFilled size={18} />
                </button>

                <button
                  className={`bg-${theme.colors.button} rounded-full p-2 hover:scale-105 transition-transform shadow-lg touch-manipulation`}
                  onClick={togglePlayPause}
                >
                  {isPlaying ? (
                    <IconPlayerPauseFilled
                      className={`text-${theme.colors.primary}-900 w-4 h-4`}
                    />
                  ) : (
                    <IconPlayerPlayFilled
                      className={`text-${theme.colors.primary}-900 w-4 h-4 ml-0.5`}
                    />
                  )}
                </button>

                <button
                  className={`text-${theme.colors.text} hover:text-white transition-colors p-1 touch-manipulation`}
                  onClick={playNextSong}
                >
                  <IconPlayerSkipForwardFilled size={18} />
                </button>
              </div>

              <Menu
                shadow="md"
                position="top-end"
                zIndex={10002}
                classNames={{
                  dropdown: `bg-gradient-to-b ${theme.colors.backgroundOverlay} border border-${theme.colors.border} shadow-2xl backdrop-blur-md rounded-xl p-1`,
                  item: `text-white hover:bg-${theme.colors.cardHover} rounded-md font-medium`,
                }}
              >
                <Menu.Target>
                  <button
                    className={`text-${theme.colors.text} hover:text-white transition-colors p-2 touch-manipulation`}
                  >
                    <IconDotsVertical size={18} />
                  </button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    onClick={toggleRepeat}
                    leftSection={getRepeatIcon()}
                  >
                    Repeat: {repeatMode === "all" ? "All" : "One"}
                  </Menu.Item>
                  <Menu.Item
                    onClick={toggleLike}
                    disabled={loadingLike}
                    leftSection={
                      loadingLike ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : isLiked ? (
                        <IconHeartFilled
                          size={16}
                          className={`text-${theme.colors.secondary}-400`}
                        />
                      ) : (
                        <IconHeart size={16} />
                      )
                    }
                  >
                    {loadingLike
                      ? "Đang xử lý..."
                      : isLiked
                      ? "Bỏ yêu thích"
                      : "Yêu thích"}
                  </Menu.Item>
                  <Menu.Item
                    onClick={() => setShowPlaylistModal(true)}
                    disabled={!user}
                    leftSection={<IconPlaylistAdd size={16} />}
                  >
                    {!user ? "Đăng nhập để thêm" : "Thêm vào playlist"}
                  </Menu.Item>
                  <Menu.Item
                    onClick={handleAvailable}
                    leftSection={<IconArticle size={16} />}
                  >
                    Now Playing
                  </Menu.Item>
                  
                  <Menu.Divider className={`border-${theme.colors.border} my-1`} />

                  <Menu.Item
                    component="a"
                    href={currentSong.video_download_url}
                    leftSection={<IconVideo size={16} />}
                  >
                    Download video
                  </Menu.Item>
                  <Menu.Item
                    component="a"
                    href={currentSong.audio_download_url}
                    leftSection={<IconFileMusic size={16} />}
                  >
                    Download audio
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </div>
          </div>

          {/* Desktop Layout (Giữ nguyên) */}
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
                  <p
                    className={`text-xs text-${theme.colors.text} truncate hover:underline cursor-pointer hover:text-white`}
                  >
                    {currentSong.singer_name}
                  </p>
                </div>
                <button
                  className={`text-${
                    theme.colors.text
                  } hover:text-white transition-colors ml-2 ${
                    loadingLike ? "opacity-50" : ""
                  }`}
                  onClick={toggleLike}
                  disabled={loadingLike || !user}
                  title={
                    !user
                      ? "Đăng nhập để sử dụng"
                      : isLiked
                      ? "Bỏ yêu thích"
                      : "Yêu thích"
                  }
                >
                  {loadingLike ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  ) : isLiked ? (
                    <IconHeartFilled
                      size={16}
                      className={`text-${theme.colors.secondary}-400`}
                    />
                  ) : (
                    <IconHeart size={16} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col items-center w-1/2 max-w-2xl">
              <div className="flex items-center gap-4 mb-2">
                <button
                  className={`text-${theme.colors.text} hover:text-white transition-colors`}
                  onClick={playBackSong}
                >
                  <IconPlayerSkipBackFilled size={20} />
                </button>

                <button
                  className={`bg-${theme.colors.button} rounded-full p-2 hover:scale-105 transition-transform shadow-lg`}
                  onClick={togglePlayPause}
                >
                  {isPlaying ? (
                    <IconPlayerPauseFilled
                      className={`text-${theme.colors.primary}-900 w-5 h-5`}
                    />
                  ) : (
                    <IconPlayerPlayFilled
                      className={`text-${theme.colors.primary}-900 w-5 h-5 ml-0.5`}
                    />
                  )}
                </button>

                <button
                  className={`text-${theme.colors.text} hover:text-white transition-colors`}
                  onClick={playNextSong}
                >
                  <IconPlayerSkipForwardFilled size={20} />
                </button>

                <button
                  className={`text-${theme.colors.secondary}-400 transition-colors`}
                  onClick={toggleRepeat}
                  title={`Repeat: ${repeatMode === "all" ? "All" : "One"}`}
                >
                  {getRepeatIcon()}
                </button>
              </div>

              <div className="w-full flex items-center gap-2">
                <span
                  className={`text-xs text-${theme.colors.text} font-medium min-w-[40px] text-right`}
                >
                  {formatTime(currentTime)}
                </span>
                <div
                  className={`h-1 flex-1 ${progressColors.trackBg} rounded-full cursor-pointer group relative`}
                  ref={progressRef}
                  onMouseDown={handleProgressMouseDown}
                  onTouchStart={handleProgressTouchStart}
                  style={{
                    opacity: isValidDuration ? 1 : 0.5,
                  }}
                >
                  <div
                    className={`h-1 ${progressColors.progressBg} ${progressColors.progressHover} rounded-full relative transition-colors`}
                    style={{ width: `${progressPercent}%` }}
                  >
                    <div
                      className={`absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 ${progressColors.progressBg} rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg`}
                      style={{ backgroundColor: progressColors.thumbColor }}
                    ></div>
                  </div>
                </div>
                <span
                  className={`text-xs text-${theme.colors.text} font-medium min-w-[40px]`}
                >
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3 w-1/4 justify-end">
              <button
                className={`text-${theme.colors.text} hover:text-white transition-colors`}
                onClick={() => setShowPlaylistModal(true)}
                disabled={!user}
                title={!user ? "Đăng nhập để sử dụng" : "Thêm vào playlist"}
              >
                <IconPlaylistAdd size={18} />
              </button>

              <button
                className={`text-${theme.colors.text} hover:text-white transition-colors`}
                onClick={handleAvailable}
              >
                <IconArticle size={18} />
              </button>

              <Menu
                shadow="md"
                position="top-end"
                zIndex={10002}
                classNames={{
                  dropdown: `bg-gradient-to-b ${theme.colors.backgroundOverlay} border border-${theme.colors.border} shadow-2xl backdrop-blur-md rounded-xl p-1`,
                  item: `text-white hover:bg-${theme.colors.cardHover} rounded-md font-medium`,
                }}
              >
                <Menu.Target>
                  <button
                    className={`text-${theme.colors.text} hover:text-white transition-colors`}
                  >
                    <IconDownload size={18} />
                  </button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    component="a"
                    href={currentSong.video_download_url}
                    leftSection={<IconVideo size={16} />}
                  >
                    Download video
                  </Menu.Item>
                  <Menu.Item
                    component="a"
                    href={currentSong.audio_download_url}
                    leftSection={<IconFileMusic size={16} />}
                  >
                    Download audio
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>

              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => setIsMute(!isMute)}
                  className={`text-${theme.colors.text} hover:text-white transition-colors flex-shrink-0`}
                >
                  {isMute ? (
                    <IconVolume3 size={18} />
                  ) : (
                    <IconVolume size={18} />
                  )}
                </button>
                <div className="w-20 lg:w-24 group flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-full h-1 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, ${progressColors.thumbColor} 0%, ${progressColors.thumbColor} ${volume}%, #4d4d4d ${volume}%, #4d4d4d 100%)`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* (CSS giữ nguyên) */}
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
            background: ${progressColors.thumbColor};
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
            background: ${progressColors.thumbColor};
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

      {/* (Modal "Thêm vào playlist" giữ nguyên) */}
      <Modal
        opened={showPlaylistModal}
        onClose={() => {
          setShowPlaylistModal(false);
          setShowSuccessMessage(false);
        }}
        title={
          <h3
            className={`text-lg font-bold bg-gradient-to-r ${theme.colors.gradient} bg-clip-text text-transparent`}
          >
            Thêm vào playlist
          </h3>
        }
        size="md"
        centered
        classNames={{
          overlay: "bg-black/70 backdrop-blur-sm",
          modal: `bg-gradient-to-b ${theme.colors.backgroundOverlay} border border-${theme.colors.border} shadow-2xl backdrop-blur-md rounded-xl`,
          header: `bg-transparent border-b border-${theme.colors.border} pt-3 px-4 pb-3`,
          title: `text-white`,
          close: `text-${theme.colors.text} hover:bg-${theme.colors.cardHover} rounded-full`,
          body: `p-3 sm:p-4`,
        }}
        styles={{
          body: {
            transition: 'height 0.3s ease-in-out'
          }
        }}
      >
        <AnimatePresence mode="wait">
          {!showSuccessMessage ? (
            <motion.div
              key="playlist-list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {currentSong && (
                <div
                  className={`flex items-center gap-3 p-3 rounded-lg border border-${theme.colors.border} bg-${theme.colors.card} shadow-lg`}
                >
                  <img
                    src={currentSong.image}
                    alt="Song cover"
                    className="w-12 h-12 rounded-lg object-cover shadow-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white text-sm font-medium truncate">
                      {currentSong.song_name}
                    </h4>
                    <p
                      className={`text-xs ${theme.colors.text} truncate opacity-80`}
                    >
                      {currentSong.singer_name}
                    </p>
                  </div>
                </div>
              )}

              {!user ? (
                <div className="text-center py-8 flex flex-col items-center">
                  <p
                    className={`text-base ${theme.colors.text} mb-4 opacity-90`}
                  >
                    Vui lòng đăng nhập để sử dụng chức năng này
                  </p>
                  <Button
                    className={`border-none font-medium transition-all duration-200 hover:scale-105 shadow-lg bg-${theme.colors.button} hover:bg-${theme.colors.buttonHover} text-${theme.colors.buttonText}`}
                    onClick={() => {
                      window.location.href = "/login";
                    }}
                  >
                    Đăng nhập
                  </Button>
                </div>
              ) : userPlaylists.length === 0 ? (
                <div className="text-center py-8">
                  <p
                    className={`text-base ${theme.colors.text} mb-4 opacity-90`}
                  >
                    Bạn chưa có playlist nào
                  </p>
                  <p className={`text-sm ${theme.colors.text} opacity-60`}>
                    Hãy tạo playlist đầu tiên trong thư viện
                  </p>
                </div>
              ) : (
                <div
                  className={`max-h-80 overflow-y-auto space-y-2 pr-2 -mr-1 scrollbar-thin scrollbar-thumb-${theme.colors.primary}-500/70 scrollbar-track-transparent`}
                >
                  {userPlaylists.map((playlist) => {
                    const isLoadingThis = loadingPlaylistId === playlist.id;
                    
                    return (
                      <div
                        key={playlist.id}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 
                          bg-${theme.colors.card} border border-${theme.colors.border} shadow-sm
                          hover:bg-${theme.colors.cardHover} hover:scale-[1.02] hover:shadow-lg hover:border-${theme.colors.primary}-500/30
                          ${
                            loadingPlaylistId
                              ? "opacity-50 pointer-events-none"
                              : ""
                          }
                          ${
                            isLoadingThis ? "opacity-75" : ""
                          }
                        `}
                        onClick={() => handleAddToPlaylist(playlist.id)}
                      >
                        {playlist.image ? (
                          <img
                            src={playlist.image}
                            alt={playlist.title}
                            className="w-10 h-10 rounded-lg object-cover shadow-lg flex-shrink-0"
                          />
                        ) : (
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-lg bg-gradient-to-r ${theme.colors.gradient} flex-shrink-0`}
                          >
                            <IconMusic
                              size={20}
                              className="text-white opacity-80"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4
                            className={`text-white text-sm font-medium truncate transition-colors`}
                          >
                            {playlist.title}
                          </h4>
                          <p
                            className={`text-xs ${theme.colors.text} truncate opacity-70`}
                          >
                            {playlist.song_count || 0} bài hát
                          </p>
                        </div>
                        {isLoadingThis && (
                          <div
                            className={`w-5 h-5 border-2 border-${theme.colors.primary}-500 border-t-transparent rounded-full animate-spin`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="success-message"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center space-y-4 py-10 min-h-[300px]"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ duration: 0.6, ease: 'backOut', delay: 0.1 }}
              >
                <IconCheck className={`w-16 h-16 text-${theme.colors.primary}-500`} stroke={3} />
              </motion.div>
              <motion.h3 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-xl font-bold text-white"
              >
                Đã thêm thành công!
              </motion.h3>
            </motion.div>
          )}
        </AnimatePresence>
      </Modal>
    </>
  );
};

export default PlayerControls;