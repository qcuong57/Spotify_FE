import React from "react";
import { useRef, useState, useEffect } from "react";
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
} from "@tabler/icons-react";
import { Menu, Button, Anchor, Modal, Text, ScrollArea } from "@mantine/core";
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
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [loadingLike, setLoadingLike] = useState(false);
  const [loadingPlaylist, setLoadingPlaylist] = useState(false);
  const [user, setUser] = useState(null);

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

    // Prevent multiple clicks while processing
    if (loadingLike) return;

    try {
      setLoadingLike(true);

      if (isLiked) {
        // Bỏ like - remove from liked songs
        await removeFromLikedSongsService(currentSong.id);
        setIsLiked(false);
      } else {
        // Thêm like - add to liked songs
        const formData = new FormData();
        formData.append("song_id", currentSong.id.toString());

        await addToLikedSongsService(formData);
        setIsLiked(true);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      console.error("Error details:", error.response?.data);

      // Show specific error message
      if (error.response?.status === 400) {
        alert("Bài hát này đã có trong danh sách yêu thích hoặc đã bị xóa!");
      } else if (error.response?.status === 404) {
        alert("Không tìm thấy bài hát này!");
      } else {
        alert("Có lỗi xảy ra khi cập nhật trạng thái yêu thích!");
      }

      // Reset to correct state by checking again
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
    if (!currentSong?.id || !user) return;

    try {
      setLoadingPlaylist(true);

      const formData = new FormData();
      formData.append("playlist_id", playlistId);
      formData.append("song_id", currentSong.id);

      await addSongToPlaylistService(formData);

      setShowPlaylistModal(false);
      alert("Đã thêm bài hát vào playlist!");
    } catch (error) {
      console.error("Error adding song to playlist:", error);
      if (error.response?.status === 400) {
        alert("Bài hát đã có trong playlist này!");
      } else {
        alert("Có lỗi xảy ra khi thêm vào playlist!");
      }
    } finally {
      setLoadingPlaylist(false);
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

  // Get theme-specific progress colors
  const getProgressColors = () => {
    switch (theme.id) {
      case "ocean":
        return {
          trackBg: "bg-teal-600/50",
          progressBg: "bg-teal-300",
          progressHover: "hover:bg-emerald-400",
          thumbColor: "#5eead4",
        };
      case "forest":
        return {
          trackBg: "bg-green-600/50",
          progressBg: "bg-amber-400",
          progressHover: "hover:bg-amber-300",
          thumbColor: "#fbbf24",
        };
      case "space":
        return {
          trackBg: "bg-purple-600/50",
          progressBg: "bg-purple-300",
          progressHover: "hover:bg-pink-400",
          thumbColor: "#a855f7",
        };
      case "sunset":
        return {
          trackBg: "bg-orange-600/50",
          progressBg: "bg-orange-300",
          progressHover: "hover:bg-amber-400",
          thumbColor: "#fb923c",
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
                  className={`h-3 ${progressColors.progressBg} ${progressColors.progressHover} rounded-full relative transition-colors pointer-events-none`}
                  style={{ width: `${progressPercent}%` }}
                >
                  <div
                    className={`absolute right-0 top-1/2 transform -translate-y-1/2 w-5 h-5 ${progressColors.progressBg} rounded-full shadow-lg`}
                    style={{
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

              <Menu shadow="md" position="top">
                <Menu.Target>
                  <button
                    className={`text-${theme.colors.text} hover:text-white transition-colors p-2 touch-manipulation`}
                  >
                    <IconDotsVertical size={18} />
                  </button>
                </Menu.Target>
                <Menu.Dropdown
                  className={`bg-${theme.colors.card} border-none backdrop-blur-md`}
                >
                  <Menu.Item
                    className={`text-white hover:bg-${theme.colors.cardHover}`}
                    onClick={toggleRepeat}
                  >
                    <div className="flex items-center gap-2">
                      {getRepeatIcon()}
                      <span>
                        Repeat: {repeatMode === "all" ? "All" : "One"}
                      </span>
                    </div>
                  </Menu.Item>
                  <Menu.Item
                    className={`text-white hover:bg-${theme.colors.cardHover}`}
                    onClick={toggleLike}
                    disabled={loadingLike}
                  >
                    <div className="flex items-center gap-2">
                      {loadingLike ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : isLiked ? (
                        <IconHeartFilled
                          size={16}
                          className={`text-${theme.colors.secondary}-400`}
                        />
                      ) : (
                        <IconHeart size={16} />
                      )}
                      <span>
                        {loadingLike
                          ? "Đang xử lý..."
                          : isLiked
                          ? "Bỏ yêu thích"
                          : "Yêu thích"}
                      </span>
                    </div>
                  </Menu.Item>
                  <Menu.Item
                    className={`text-white hover:bg-${theme.colors.cardHover}`}
                    onClick={() => setShowPlaylistModal(true)}
                    disabled={!user}
                  >
                    <div className="flex items-center gap-2">
                      <IconPlaylistAdd size={16} />
                      <span>
                        {!user ? "Đăng nhập để thêm" : "Thêm vào playlist"}
                      </span>
                    </div>
                  </Menu.Item>
                  <Menu.Item
                    className={`text-white hover:bg-${theme.colors.cardHover}`}
                    onClick={handleAvailable}
                  >
                    <div className="flex items-center gap-2">
                      <IconArticle size={16} />
                      <span>Now Playing</span>
                    </div>
                  </Menu.Item>
                  <Menu.Item
                    className={`text-white hover:bg-${theme.colors.cardHover}`}
                  >
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
                  <Menu.Item
                    className={`text-white hover:bg-${theme.colors.cardHover}`}
                  >
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

          {/* Desktop Layout */}
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
                  onClick={handleProgressClick}
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
                title
                scheduled
                tasks={!user ? "Đăng nhập để sử dụng" : "Thêm vào playlist"}
              >
                <IconPlaylistAdd size={18} />
              </button>

              <button
                className={`text-${theme.colors.text} hover:text-white transition-colors`}
                onClick={handleAvailable}
              >
                <IconArticle size={18} />
              </button>

              <Menu shadow="md" position="top">
                <Menu.Target>
                  <button
                    className={`text-${theme.colors.text} hover:text-white transition-colors`}
                  >
                    <IconDownload size={18} />
                  </button>
                </Menu.Target>
                <Menu.Dropdown
                  className={`bg-${theme.colors.card} border-none backdrop-blur-md`}
                >
                  <Menu.Item
                    className={`text-white hover:bg-${theme.colors.cardHover}`}
                  >
                    <Anchor
                      href={currentSong.video_download_url}
                      underline="never"
                      size="sm"
                      className="text-white"
                    >
                      Download video
                    </Anchor>
                  </Menu.Item>
                  <Menu.Item
                    className={`text-white hover:bg-${theme.colors.cardHover}`}
                  >
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
                    className="w>See full conversation (3 messages)full h-1 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, ${progressColors.thumbColor} 0%, ${progressColors.thumbColor} ${volume}%, #4d4d4d ${volume}%, #4d4d4d 100%)`,
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

      {/* Playlist Selection Modal */}
      <Modal
        opened={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
        title={
          <Text className={`text-lg font-bold ${theme.colors.songText}`}>
            Thêm vào playlist
          </Text>
        }
        size="md"
        styles={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(8px)",
          },
          modal: {
            backgroundColor:
              theme.id === "ocean"
                ? "#0f172a"
                : theme.id === "forest"
                ? "#0c1f0a"
                : theme.id === "space"
                ? "#1a0f2e"
                : theme.id === "sunset"
                ? "#1a0f0a"
                : "#0f172a",
            border:
              theme.id === "ocean"
                ? "1px solid rgb(45 212 191 / 0.3)"
                : theme.id === "forest"
                ? "1px solid rgb(251 191 36 / 0.4)"
                : theme.id === "space"
                ? "1px solid rgb(168 85 247 / 0.3)"
                : theme.id === "sunset"
                ? "1px solid rgb(251 146 60 / 0.3)"
                : "1px solid rgb(45 212 191 / 0.3)",
            backdropFilter: "blur(16px)",
            boxShadow:
              theme.id === "ocean"
                ? "0 25px 50px -12px rgba(45, 212, 191, 0.25)"
                : theme.id === "forest"
                ? "0 25px 50px -12px rgba(34, 197, 94, 0.25)"
                : theme.id === "space"
                ? "0 25px 50px -12px rgba(168, 85, 247, 0.25)"
                : theme.id === "sunset"
                ? "0 25px 50px -12px rgba(251, 146, 60, 0.25)"
                : "0 25px 50px -12px rgba(45, 212, 191, 0.25)",
            // Thêm background gradient overlay
            backgroundImage:
              theme.id === "ocean"
                ? "linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)"
                : theme.id === "forest"
                ? "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(251, 191, 36, 0.05) 100%)"
                : theme.id === "space"
                ? "linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%)"
                : theme.id === "sunset"
                ? "linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)"
                : "linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)",
          },
          header: {
            backgroundColor: "transparent",
            borderBottom:
              theme.id === "ocean"
                ? "1px solid rgb(45 212 191 / 0.2)"
                : theme.id === "forest"
                ? "1px solid rgb(251 191 36 / 0.3)"
                : theme.id === "space"
                ? "1px solid rgb(168 85 247 / 0.2)"
                : theme.id === "sunset"
                ? "1px solid rgb(251 146 60 / 0.2)"
                : "1px solid rgb(45 212 191 / 0.2)",
            paddingBottom: "12px",
          },
          close: {
            color:
              theme.id === "ocean"
                ? "#5eead4"
                : theme.id === "forest"
                ? "#fbbf24"
                : theme.id === "space"
                ? "#c084fc"
                : theme.id === "sunset"
                ? "#fb923c"
                : "#5eead4",
            "&:hover": {
              backgroundColor:
                theme.id === "ocean"
                  ? "rgba(45, 212, 191, 0.1)"
                  : theme.id === "forest"
                  ? "rgba(34, 197, 94, 0.1)"
                  : theme.id === "space"
                  ? "rgba(168, 85, 247, 0.1)"
                  : theme.id === "sunset"
                  ? "rgba(251, 146, 60, 0.1)"
                  : "rgba(45, 212, 191, 0.1)",
            },
          },
          body: {
            paddingTop: "16px",
            // Thêm background pattern cho body
            backgroundImage:
              theme.id === "ocean"
                ? `radial-gradient(circle at 20% 80%, rgba(45, 212, 191, 0.05) 0%, transparent 50%),
             radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)`
                : theme.id === "forest"
                ? `radial-gradient(circle at 20% 80%, rgba(34, 197, 94, 0.05) 0%, transparent 50%),
             radial-gradient(circle at 80% 20%, rgba(251, 191, 36, 0.05) 0%, transparent 50%)`
                : theme.id === "space"
                ? `radial-gradient(circle at 20% 80%, rgba(168, 85, 247, 0.05) 0%, transparent 50%),
             radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.05) 0%, transparent 50%)`
                : theme.id === "sunset"
                ? `radial-gradient(circle at 20% 80%, rgba(251, 146, 60, 0.05) 0%, transparent 50%),
             radial-gradient(circle at 80% 20%, rgba(239, 68, 68, 0.05) 0%, transparent 50%)`
                : `radial-gradient(circle at 20% 80%, rgba(45, 212, 191, 0.05) 0%, transparent 50%),
             radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)`,
          },
        }}
      >
        <div className="space-y-3">
          {currentSong && (
            <div
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 hover:scale-[1.01]`}
              style={{
                backgroundColor:
                  theme.id === "ocean"
                    ? "rgba(15, 118, 110, 0.3)"
                    : theme.id === "forest"
                    ? "rgba(22, 163, 74, 0.3)"
                    : theme.id === "space"
                    ? "rgba(126, 34, 206, 0.3)"
                    : theme.id === "sunset"
                    ? "rgba(234, 88, 12, 0.3)"
                    : "rgba(15, 118, 110, 0.3)",
                borderColor:
                  theme.id === "ocean"
                    ? "rgba(45, 212, 191, 0.3)"
                    : theme.id === "forest"
                    ? "rgba(251, 191, 36, 0.4)"
                    : theme.id === "space"
                    ? "rgba(168, 85, 247, 0.3)"
                    : theme.id === "sunset"
                    ? "rgba(251, 146, 60, 0.3)"
                    : "rgba(45, 212, 191, 0.3)",
                boxShadow:
                  theme.id === "ocean"
                    ? "0 4px 12px rgba(45, 212, 191, 0.15)"
                    : theme.id === "forest"
                    ? "0 4px 12px rgba(34, 197, 94, 0.15)"
                    : theme.id === "space"
                    ? "0 4px 12px rgba(168, 85, 247, 0.15)"
                    : theme.id === "sunset"
                    ? "0 4px 12px rgba(251, 146, 60, 0.15)"
                    : "0 4px 12px rgba(45, 212, 191, 0.15)",
              }}
            >
              <img
                src={currentSong.image}
                alt="Song cover"
                className="w-12 h-12 rounded-lg object-cover shadow-lg"
              />
              <div className="flex-1 min-w-0">
                <h4
                  className={`${theme.colors.songText} text-sm font-medium truncate`}
                >
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
            <div className="text-center py-8">
              <Text className={`${theme.colors.text} mb-4 opacity-90`}>
                Vui lòng đăng nhập để sử dụng chức năng này
              </Text>
              <Button
                className="border-none font-medium transition-all duration-200 hover:scale-105"
                onClick={() => {
                  window.location.href = "/login";
                }}
                styles={{
                  root: {
                    backgroundColor:
                      theme.id === "ocean"
                        ? "rgb(94 234 212)"
                        : theme.id === "forest"
                        ? "rgb(251 191 36)"
                        : theme.id === "space"
                        ? "rgb(196 181 253)"
                        : theme.id === "sunset"
                        ? "rgb(251 146 60)"
                        : "rgb(94 234 212)",
                    color:
                      theme.id === "ocean"
                        ? "#134e4a"
                        : theme.id === "forest"
                        ? "#92400e"
                        : theme.id === "space"
                        ? "#581c87"
                        : theme.id === "sunset"
                        ? "#9a3412"
                        : "#134e4a",
                    boxShadow:
                      theme.id === "ocean"
                        ? "0 8px 25px rgba(45, 212, 191, 0.3)"
                        : theme.id === "forest"
                        ? "0 8px 25px rgba(251, 191, 36, 0.3)"
                        : theme.id === "space"
                        ? "0 8px 25px rgba(168, 85, 247, 0.3)"
                        : theme.id === "sunset"
                        ? "0 8px 25px rgba(251, 146, 60, 0.3)"
                        : "0 8px 25px rgba(45, 212, 191, 0.3)",
                    "&:hover": {
                      backgroundColor:
                        theme.id === "ocean"
                          ? "rgb(52 211 153)"
                          : theme.id === "forest"
                          ? "rgb(245 158 11)"
                          : theme.id === "space"
                          ? "rgb(236 72 153)"
                          : theme.id === "sunset"
                          ? "rgb(251 191 36)"
                          : "rgb(52 211 153)",
                      transform: "scale(1.05)",
                      boxShadow:
                        theme.id === "ocean"
                          ? "0 12px 35px rgba(45, 212, 191, 0.4)"
                          : theme.id === "forest"
                          ? "0 12px 35px rgba(251, 191, 36, 0.4)"
                          : theme.id === "space"
                          ? "0 12px 35px rgba(168, 85, 247, 0.4)"
                          : theme.id === "sunset"
                          ? "0 12px 35px rgba(251, 146, 60, 0.4)"
                          : "0 12px 35px rgba(45, 212, 191, 0.4)",
                    },
                  },
                }}
              >
                Đăng nhập
              </Button>
            </div>
          ) : userPlaylists.length === 0 ? (
            <div className="text-center py-8">
              <Text className={`${theme.colors.text} mb-4 opacity-90`}>
                Bạn chưa có playlist nào
              </Text>
              <Text className={`text-xs ${theme.colors.text} opacity-60`}>
                Hãy tạo playlist đầu tiên trong thư viện
              </Text>
            </div>
          ) : (
            <ScrollArea
              className="max-h-96"
              styles={{
                scrollbar: {
                  '&[data-orientation="vertical"] .mantine-ScrollArea-thumb': {
                    backgroundColor:
                      theme.id === "ocean"
                        ? "rgb(45 212 191 / 0.6)"
                        : theme.id === "forest"
                        ? "rgb(34 197 94 / 0.6)"
                        : theme.id === "space"
                        ? "rgb(168 85 247 / 0.6)"
                        : theme.id === "sunset"
                        ? "rgb(251 146 60 / 0.6)"
                        : "rgb(45 212 191 / 0.6)",
                    borderRadius: "6px",
                  },
                  '&[data-orientation="vertical"]': {
                    backgroundColor:
                      theme.id === "ocean"
                        ? "rgba(45, 212, 191, 0.1)"
                        : theme.id === "forest"
                        ? "rgba(34, 197, 94, 0.1)"
                        : theme.id === "space"
                        ? "rgba(168, 85, 247, 0.1)"
                        : theme.id === "sunset"
                        ? "rgba(251, 146, 60, 0.1)"
                        : "rgba(45, 212, 191, 0.1)",
                  },
                },
              }}
            >
              <div className="space-y-2">
                {userPlaylists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                      loadingPlaylist ? "opacity-50 pointer-events-none" : ""
                    }`}
                    style={{
                      backgroundColor:
                        theme.id === "ocean"
                          ? "rgba(15, 118, 110, 0.2)"
                          : theme.id === "forest"
                          ? "rgba(22, 163, 74, 0.2)"
                          : theme.id === "space"
                          ? "rgba(126, 34, 206, 0.2)"
                          : theme.id === "sunset"
                          ? "rgba(234, 88, 12, 0.2)"
                          : "rgba(15, 118, 110, 0.2)",
                      borderColor:
                        theme.id === "ocean"
                          ? "rgba(45, 212, 191, 0.2)"
                          : theme.id === "forest"
                          ? "rgba(251, 191, 36, 0.3)"
                          : theme.id === "space"
                          ? "rgba(168, 85, 247, 0.2)"
                          : theme.id === "sunset"
                          ? "rgba(251, 146, 60, 0.2)"
                          : "rgba(45, 212, 191, 0.2)",
                      border: "1px solid",
                      boxShadow:
                        theme.id === "ocean"
                          ? "0 2px 8px rgba(45, 212, 191, 0.1)"
                          : theme.id === "forest"
                          ? "0 2px 8px rgba(34, 197, 94, 0.1)"
                          : theme.id === "space"
                          ? "0 2px 8px rgba(168, 85, 247, 0.1)"
                          : theme.id === "sunset"
                          ? "0 2px 8px rgba(251, 146, 60, 0.1)"
                          : "0 2px 8px rgba(45, 212, 191, 0.1)",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor =
                        theme.id === "ocean"
                          ? "rgba(15, 118, 110, 0.4)"
                          : theme.id === "forest"
                          ? "rgba(22, 163, 74, 0.4)"
                          : theme.id === "space"
                          ? "rgba(126, 34, 206, 0.4)"
                          : theme.id === "sunset"
                          ? "rgba(234, 88, 12, 0.4)"
                          : "rgba(15, 118, 110, 0.4)";
                      e.target.style.boxShadow =
                        theme.id === "ocean"
                          ? "0 8px 25px rgba(45, 212, 191, 0.2)"
                          : theme.id === "forest"
                          ? "0 8px 25px rgba(34, 197, 94, 0.2)"
                          : theme.id === "space"
                          ? "0 8px 25px rgba(168, 85, 247, 0.2)"
                          : theme.id === "sunset"
                          ? "0 8px 25px rgba(251, 146, 60, 0.2)"
                          : "0 8px 25px rgba(45, 212, 191, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor =
                        theme.id === "ocean"
                          ? "rgba(15, 118, 110, 0.2)"
                          : theme.id === "forest"
                          ? "rgba(22, 163, 74, 0.2)"
                          : theme.id === "space"
                          ? "rgba(126, 34, 206, 0.2)"
                          : theme.id === "sunset"
                          ? "rgba(234, 88, 12, 0.2)"
                          : "rgba(15, 118, 110, 0.2)";
                      e.target.style.boxShadow =
                        theme.id === "ocean"
                          ? "0 2px 8px rgba(45, 212, 191, 0.1)"
                          : theme.id === "forest"
                          ? "0 2px 8px rgba(34, 197, 94, 0.1)"
                          : theme.id === "space"
                          ? "0 2px 8px rgba(168, 85, 247, 0.1)"
                          : theme.id === "sunset"
                          ? "0 2px 8px rgba(251, 146, 60, 0.1)"
                          : "0 2px 8px rgba(45, 212, 191, 0.1)";
                    }}
                    onClick={() => handleAddToPlaylist(playlist.id)}
                  >
                    {playlist.image ? (
                      <img
                        src={playlist.image}
                        alt={playlist.title}
                        className="w-10 h-10 rounded-lg object-cover shadow-lg"
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-lg opacity-90 flex items-center justify-center shadow-lg"
                        style={{
                          background:
                            theme.id === "ocean"
                              ? "linear-gradient(135deg, #14b8a6, #10b981)"
                              : theme.id === "forest"
                              ? "linear-gradient(135deg, #22c55e, #fbbf24)"
                              : theme.id === "space"
                              ? "linear-gradient(135deg, #a855f7, #ec4899)"
                              : theme.id === "sunset"
                              ? "linear-gradient(135deg, #fb923c, #fbbf24)"
                              : "linear-gradient(135deg, #14b8a6, #10b981)",
                        }}
                      >
                        <IconMusic size={20} className="text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4
                        className={`${theme.colors.songText} text-sm font-medium truncate transition-colors`}
                      >
                        {playlist.title}
                      </h4>
                      <p
                        className={`text-xs ${theme.colors.text} truncate opacity-70`}
                      >
                        {playlist.song_count || 0} bài hát
                      </p>
                    </div>
                    {loadingPlaylist && (
                      <div
                        className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                        style={{
                          borderColor:
                            theme.id === "ocean"
                              ? "rgb(45 212 191 / 0.5)"
                              : theme.id === "forest"
                              ? "rgb(34 197 94 / 0.5)"
                              : theme.id === "space"
                              ? "rgb(168 85 247 / 0.5)"
                              : theme.id === "sunset"
                              ? "rgb(251 146 60 / 0.5)"
                              : "rgb(45 212 191 / 0.5)",
                          borderTopColor: "transparent",
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </Modal>
    </>
  );
};

export default PlayerControls;
