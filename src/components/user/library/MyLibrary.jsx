import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { searchSongs } from "../../../services/SongsService";
import {
  getSongsFromPlaylistService,
  deleteSongFromPlaylistService,
  addSongToPlaylistService,
} from "../../../services/SongPlaylistService";
import {
  IconChevronRight,
  IconMusic,
  IconArrowsShuffle, // Thay đổi: Import IconShuffle thay vì IconPlayerPlayFilled
  IconList,
  IconDotsVertical,
  IconClockHour3,
  IconSearch,
  IconX,
  IconTrash,
} from "@tabler/icons-react";
import Song from "./_Song";
import SearchedSong from "./_SearchedSong";
import EditPlaylistForm from "./_EditPlaylistForm";
import { usePlayList } from "../../../utils/playlistContext";
import { deletePlaylistService } from "../../../services/playlistService";
import { useAudio } from "../../../utils/audioContext";
import { useTheme } from "../../../context/themeContext";

// Animation variants (giữ nguyên tất cả variants...)
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
    },
  },
};

const headerVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const coverImageVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const playlistInfoVariants = {
  initial: { opacity: 0, x: -30 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
      staggerChildren: 0.1,
    },
  },
};

const titleVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
    },
  },
};

const controlsVariants = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
      staggerChildren: 0.1,
    },
  },
};

// Thay đổi: Rename từ playButtonVariants thành shuffleButtonVariants
const shuffleButtonVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  hover: {
    scale: 1.1,
    rotate: 15, // Thêm hiệu ứng xoay khi hover cho shuffle
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
    },
  },
};

const searchVariants = {
  initial: { opacity: 0, x: 30 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const searchInputVariants = {
  focus: {
    scale: 1.02,
    transition: {
      duration: 0.2,
    },
  },
};

const songsListVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.05,
      delayChildren: 0.2,
    },
  },
};

const songItemVariants = {
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    scale: 0.95,
    transition: {
      duration: 0.2,
    },
  },
};

const emptyStateVariants = {
  initial: { opacity: 0, scale: 0.8, y: 50 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const searchResultsVariants = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      staggerChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    y: -30,
    transition: {
      duration: 0.3,
    },
  },
};

const loadingSpinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

const buttonVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
    },
  },
};

const deleteButtonVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  hover: {
    scale: 1.1,
    rotate: 5,
    transition: {
      duration: 0.2,
    },
  },
  tap: {
    scale: 0.9,
    transition: {
      duration: 0.1,
    },
  },
};

const iconFloatVariants = {
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const MyLibrary = ({ playlist, setCurrentView }) => {
  const { theme } = useTheme();
  const [songs, setSongs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [referesh, setRefresh] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const {
    playlists,
    setPlaylists,
    refreshKeyPlayLists,
    setRefreshKeyPlayLists,
  } = usePlayList();
  const [user, setUser] = useState(null);
  const { setNewPlaylist } = useAudio();

  // Kiểm tra user đăng nhập
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Fetch songs từ playlist
  useEffect(() => {
    const fetchSongs = async () => {
      if (!playlist || !playlist.id) {
        console.log("MyLibrary - No playlist or playlist.id");
        return;
      }

      try {
        console.log("MyLibrary - Fetching songs for playlist:", playlist.id);
        const response = await getSongsFromPlaylistService(playlist.id);
        console.log("MyLibrary - Songs response:", response);

        if (response && response.data && response.data.songs) {
          setSongs(response.data.songs);
          console.log("MyLibrary - Songs set:", response.data.songs);

          // CẬP NHẬT SONG COUNT TRONG CONTEXT DỰA TRÊN DỮ LIỆU THỰC TẾ
          const actualSongCount = response.data.songs.length;
          setPlaylists((prevPlaylists) =>
            prevPlaylists.map((p) =>
              p.id === playlist.id ? { ...p, song_count: actualSongCount } : p
            )
          );
        } else {
          setSongs([]);
          // Nếu không có songs, set song_count = 0
          setPlaylists((prevPlaylists) =>
            prevPlaylists.map((p) =>
              p.id === playlist.id ? { ...p, song_count: 0 } : p
            )
          );
        }
      } catch (error) {
        console.error("MyLibrary - Error fetching songs:", error);
        setSongs([]);
      }
    };

    fetchSongs();
  }, [playlist, referesh, setPlaylists]);

  const handleSearch = async (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      setIsSearching(true);
      try {
        console.log("MyLibrary - Searching for:", searchQuery);
        const response = await searchSongs(searchQuery);
        console.log("MyLibrary - Search response:", response);

        if (response && response.data && response.data.results) {
          setSearchResults(response.data.results);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error("MyLibrary - Error searching songs:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }
  };

  const handleSearchClick = async () => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      try {
        console.log("MyLibrary - Searching for:", searchQuery);
        const response = await searchSongs(searchQuery);
        console.log("MyLibrary - Search response:", response);

        if (response && response.data && response.data.results) {
          setSearchResults(response.data.results);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error("MyLibrary - Error searching songs:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }
  };

  const deleteSong = async (songId) => {
    if (!playlist || !playlist.id) return;

    try {
      console.log(
        "MyLibrary - Deleting song:",
        songId,
        "from playlist:",
        playlist.id
      );
      await deleteSongFromPlaylistService(playlist.id, songId);

      // Cập nhật UI ngay lập tức bằng cách xóa song khỏi state
      setSongs((prevSongs) => prevSongs.filter((song) => song.id !== songId));

      // Cập nhật song count trong context
      setPlaylists((prevPlaylists) =>
        prevPlaylists.map((p) =>
          p.id === playlist.id
            ? { ...p, song_count: Math.max((p.song_count || 1) - 1, 0) }
            : p
        )
      );

      console.log("MyLibrary - Song deleted successfully");
    } catch (error) {
      console.error("MyLibrary - Error deleting song:", error);
      alert("Có lỗi xảy ra khi xóa bài hát!");
      // Refresh lại nếu có lỗi
      setRefresh(Date.now());
    }
  };

  const addSongToPlaylist = async (songId) => {
    if (!playlist || !playlist.id) return;

    try {
      console.log(
        "MyLibrary - Adding song:",
        songId,
        "to playlist:",
        playlist.id
      );

      const formData = {
        playlist_id: playlist.id,
        song_id: songId,
        token: localStorage.getItem("access_token"),
      };

      await addSongToPlaylistService(formData);

      // Tìm bài hát trong searchResults để thêm vào songs
      const addedSong = searchResults.find((song) => song.id === songId);
      if (addedSong) {
        // Cập nhật songs state ngay lập tức
        setSongs((prevSongs) => [...prevSongs, addedSong]);

        // Cập nhật song count trong context
        setPlaylists((prevPlaylists) =>
          prevPlaylists.map((p) =>
            p.id === playlist.id
              ? { ...p, song_count: (p.song_count || 0) + 1 }
              : p
          )
        );
      }

      // Clear search results sau khi thêm thành công
      setSearchResults([]);
      setSearchQuery("");

      console.log("MyLibrary - Song added successfully");
    } catch (error) {
      console.error("MyLibrary - Error adding song to playlist:", error);
      alert("Có lỗi xảy ra khi thêm bài hát!");
    }
  };

  const removeSearch = () => {
    setSearchResults([]);
    setSearchQuery("");
  };

  // Thay đổi: Function mới để shuffle và play playlist
  const shuffleAndPlayPlaylist = () => {
    if (songs.length > 0) {
      // Tạo bản copy của songs array để không ảnh hưởng đến state gốc
      const shuffledSongs = [...songs];
      
      // Fisher-Yates shuffle algorithm
      for (let i = shuffledSongs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledSongs[i], shuffledSongs[j]] = [shuffledSongs[j], shuffledSongs[i]];
      }
      
      // Set playlist với thứ tự đã shuffle, bắt đầu từ bài đầu tiên (index 0)
      setNewPlaylist(shuffledSongs, 0);
    }
  };

  const handleRemove = async () => {
    if (!playlist || !playlist.id) return;

    try {
      const isConfirmed = confirm("Bạn có chắc chắn xóa danh sách này không?");
      if (isConfirmed) {
        console.log("MyLibrary - Deleting playlist:", playlist.id);
        await deletePlaylistService(playlist.id);

        // Xóa playlist khỏi danh sách trong context
        setPlaylists((prevPlaylists) =>
          prevPlaylists.filter((p) => p.id !== playlist.id)
        );
        setRefreshKeyPlayLists(Date.now());

        alert("Xóa thành công");
        console.log("MyLibrary - Playlist deleted successfully");
        setCurrentView("main");
      }
    } catch (error) {
      console.error("MyLibrary - Error deleting playlist:", error);
      alert("Đã xảy ra lỗi khi xóa danh sách");
    }
  };

  const handleEditComplete = (updatedPlaylist) => {
    // Cập nhật playlist trong context sau khi edit
    setPlaylists((prevPlaylists) =>
      prevPlaylists.map((p) =>
        p.id === playlist.id ? { ...p, ...updatedPlaylist } : p
      )
    );
    setRefreshKeyPlayLists(Date.now());
    setCurrentView(updatedPlaylist);
  };

  // Nếu không có playlist, hiển thị loading hoặc error
  if (!playlist) {
    return (
      <motion.div
        className={`bg-gradient-to-b ${theme.colors.backgroundOverlay} backdrop-blur-md text-white flex-1 mr-0 sm:mr-2 rounded-lg overflow-y-auto flex items-center justify-center`}
        variants={pageVariants}
        initial="initial"
        animate="animate"
      >
        <motion.div
          className="text-center"
          variants={emptyStateVariants}
          initial="initial"
          animate="animate"
        >
          <motion.div
            className="w-16 h-16 mx-auto mb-4 flex items-center justify-center"
            variants={iconFloatVariants}
            animate="animate"
          >
            <IconMusic stroke={2} className="w-16 h-16 text-gray-400" />
          </motion.div>
          <motion.h2
            className="text-xl font-bold mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Không tìm thấy playlist
          </motion.h2>
          <motion.p
            className="text-gray-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Vui lòng chọn một playlist từ thư viện
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`bg-gradient-to-b ${theme.colors.backgroundOverlay} backdrop-blur-md text-white flex-1 mr-0 sm:mr-2 rounded-lg overflow-y-auto scrollbar-spotify`}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="flex flex-col">
        {/* Header Section */}
        <motion.div
          className={`flex flex-col sm:flex-row items-center sm:items-end gap-2 sm:gap-4 p-4 pb-4 sm:pb-6 bg-gradient-to-b ${theme.colors.background}`}
          variants={headerVariants}
        >
          <motion.div
            className={`w-[150px] h-[150px] sm:w-[232px] sm:h-[232px] bg-gradient-to-br from-${theme.colors.card} to-gray-800/30 flex items-center justify-center rounded-lg shadow-lg`}
            variants={coverImageVariants}
            whileHover="hover"
          >
            {playlist.image ? (
              <motion.img
                src={playlist.image}
                alt={playlist.title}
                className="w-full h-full object-cover rounded-lg"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                onError={(e) => {
                  console.log("MyLibrary - Image load error:", e);
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : (
              <motion.div
                className={`w-full h-full bg-gradient-to-br from-${theme.colors.card} to-gray-800/30 flex items-center justify-center rounded-lg`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center"
                  variants={iconFloatVariants}
                  animate="animate"
                >
                  <IconMusic
                    stroke={2}
                    className={`w-16 h-16 sm:w-24 sm:h-24 text-${theme.colors.text}`}
                  />
                </motion.div>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            className="flex flex-col gap-2 sm:gap-4 cursor-pointer flex-1"
            onClick={() => !playlist.is_liked_song && setIsEditing(true)}
            variants={playlistInfoVariants}
          >
            <div>
              <motion.span
                className={`text-sm text-${theme.colors.text}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                Danh sách phát
              </motion.span>
              <motion.h1
                className={`text-3xl sm:text-5xl font-bold mt-2 cursor-pointer text-white bg-gradient-to-r ${theme.colors.gradient} bg-clip-text text-transparent`}
                variants={titleVariants}
                whileHover="hover"
              >
                {playlist.title || "Playlist"}
              </motion.h1>
            </div>
            <motion.h3
              className={`text-xs sm:text-sm text-${theme.colors.text}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              {playlist.description || "Không có mô tả"}
            </motion.h3>
            {user && (
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <motion.img
                  src={user.avatar}
                  alt="User Avatar"
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full"
                  whileHover={{ scale: 1.1 }}
                  onError={(e) => {
                    e.target.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E";
                  }}
                />
                <span className="text-xs sm:text-sm font-semibold text-white">
                  {user.first_name || user.username || "User"}
                </span>
                <span
                  className={`text-xs sm:text-sm text-${theme.colors.text}`}
                >
                  • {songs.length} bài hát
                </span>
              </motion.div>
            )}
          </motion.div>

          {!playlist.is_liked_song && (
            <motion.div
              className="flex justify-end"
              variants={deleteButtonVariants}
            >
              <motion.div whileHover="hover" whileTap="tap">
                <IconTrash
                  stroke={2}
                  className={`cursor-pointer size-5 sm:size-6 text-${theme.colors.text} hover:text-red-400 transition-colors`}
                  onClick={handleRemove}
                />
              </motion.div>
            </motion.div>
          )}
        </motion.div>

        {/* Controls Section với Search đơn giản */}
        <motion.div
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mx-4 sm:mx-6 py-4 gap-4"
          variants={controlsVariants}
        >
          {/* Shuffle button và List info */}
          <div className="flex flex-row justify-between items-center w-full sm:w-auto">
            <div className="flex flex-row items-center">
              {songs.length > 0 ? (
                <motion.div
                  onClick={shuffleAndPlayPlaylist} // Thay đổi: Gọi function shuffle mới
                  className={`mr-2 sm:mr-4 bg-${theme.colors.primary}-500 cursor-pointer rounded-full transition-all duration-300 hover:scale-110 hover:bg-${theme.colors.primary}-400 shadow-lg`}
                  variants={shuffleButtonVariants} // Thay đổi: Sử dụng shuffleButtonVariants
                  whileHover="hover"
                  whileTap="tap"
                >
                  {/* Thay đổi: Sử dụng IconShuffle thay vì IconPlayerPlayFilled */}
                  <IconArrowsShuffle className="size-8 sm:size-12 p-2 sm:p-3 text-black" />
                </motion.div>
              ) : (
                <motion.div
                  className="mr-2 sm:mr-4 bg-gray-600 rounded-full"
                  variants={shuffleButtonVariants} // Thay đổi: Sử dụng shuffleButtonVariants
                >
                  {/* Thay đổi: Sử dụng IconArrowsShuffle thay vì IconShuffle */}
                  <IconArrowsShuffle className="size-8 sm:size-12 p-2 sm:p-3 text-gray-400" />
                </motion.div>
              )}
            </div>
            <motion.div
              className="flex flex-row items-center sm:hidden"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <h3 className={`text-sm text-${theme.colors.text} mr-2`}>
                Danh sách
              </h3>
              <IconList
                stroke={2}
                className={`size-4 text-${theme.colors.text}`}
              />
            </motion.div>
          </div>

          {/* Search Section đơn giản */}
          <motion.div
            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto"
            variants={searchVariants}
          >
            <motion.div
              className="hidden sm:flex flex-row items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <h3 className={`text-sm text-${theme.colors.text} mr-2`}>
                Danh sách
              </h3>
              <IconList
                stroke={2}
                className={`size-4 text-${theme.colors.text}`}
              />
            </motion.div>

            <div className="flex flex-row items-center gap-3 w-full sm:w-auto">
              <motion.div
                className="relative flex-1 sm:flex-none"
                variants={searchInputVariants}
                whileFocus="focus"
              >
                <motion.input
                  type="text"
                  placeholder="Tìm bài hát..."
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                  value={searchQuery}
                  disabled={isSearching}
                  className={`w-full sm:w-[280px] bg-${theme.colors.card} px-4 py-2 pl-10 rounded-full text-sm placeholder:text-${theme.colors.text} border border-${theme.colors.border} focus:border-${theme.colors.primary}-500 focus:outline-none transition-all duration-300 text-white hover:bg-${theme.colors.cardHover}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                />
                <IconSearch
                  className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-${theme.colors.text}`}
                />
                <AnimatePresence>
                  {isSearching && (
                    <motion.div
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.div
                        className={`w-4 h-4 border-2 border-${theme.colors.primary}-400 border-t-transparent rounded-full`}
                        variants={loadingSpinnerVariants}
                        animate="animate"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.button
                onClick={handleSearchClick}
                disabled={!searchQuery.trim() || isSearching}
                className={`px-4 py-2 bg-${theme.colors.button} hover:bg-${theme.colors.buttonHover} disabled:opacity-50 disabled:cursor-not-allowed rounded-full text-${theme.colors.buttonText} text-sm font-medium transition-all duration-300 hover:scale-105 shadow-md flex-shrink-0`}
                variants={buttonVariants}
                whileHover={!isSearching ? "hover" : {}}
                whileTap={!isSearching ? "tap" : {}}
              >
                <AnimatePresence mode="wait">
                  {isSearching ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.div
                        className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                        variants={loadingSpinnerVariants}
                        animate="animate"
                      />
                    </motion.div>
                  ) : (
                    <motion.span
                      key="text"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      Tìm
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              <AnimatePresence>
                {(searchQuery || searchResults.length > 0) && (
                  <motion.button
                    onClick={removeSearch}
                    className={`p-2 bg-${theme.colors.card} hover:bg-${theme.colors.cardHover} border border-${theme.colors.border} rounded-full text-${theme.colors.text} hover:text-white transition-all duration-300 hover:scale-105 shadow-md flex-shrink-0`}
                    variants={buttonVariants}
                    initial="initial"
                    animate="animate"
                    exit={{ opacity: 0, scale: 0.8, x: 10 }}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <IconX className="size-4" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>

        {/* Songs List Section */}
        <motion.div className="mx-4 sm:mx-12 mb-4" variants={songsListVariants}>
          <motion.div
            className={`grid grid-cols-[16px_1fr_auto] gap-2 sm:gap-4 text-xs sm:text-sm text-${theme.colors.text} border-b border-${theme.colors.border} pb-2 mb-4`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div>#</div>
            <div>Tiêu đề</div>
            <div className="w-8"></div>
          </motion.div>

          <AnimatePresence mode="wait">
            {songs.length > 0 ? (
              <motion.div
                key="songs-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <AnimatePresence>
                  {songs.map((song, index) => (
                    <motion.div
                      key={`song-${song.id}-${index}`}
                      variants={songItemVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      custom={index}
                      layout
                    >
                      <Song
                        song={song}
                        playlist={playlist}
                        deleteSong={deleteSong}
                        songs={songs}
                        index={index}
                        list={songs}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="empty-state"
                className={`text-${theme.colors.text} mt-8 text-center`}
                variants={emptyStateVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <motion.div
                  className="w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                  variants={iconFloatVariants}
                  animate="animate"
                >
                  <IconMusic
                    stroke={2}
                    className={`w-16 h-16 text-${theme.colors.text}/60`}
                  />
                </motion.div>
                <motion.h3
                  className="text-lg font-bold mb-2 text-white"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  Playlist trống
                </motion.h3>
                <motion.p
                  className="text-sm mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  Chưa có bài hát nào trong playlist này
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Search Results */}
        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div
              className="pb-6 mx-4"
              variants={searchResultsVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <motion.h4
                className="text-lg font-bold mb-4 mx-2 text-white"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                Kết quả tìm kiếm
              </motion.h4>
              <AnimatePresence>
                {searchResults.map((song, index) => (
                  <motion.div
                    key={`search-${song.id}-${index}`}
                    variants={songItemVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    custom={index}
                    layout
                  >
                    <SearchedSong
                      song={song}
                      playlist={playlist}
                      addSongToPlaylist={addSongToPlaylist}
                      songs={songs}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Edit Playlist Modal */}
      <AnimatePresence>
        {isEditing && (
          <EditPlaylistForm
            playlist={playlist}
            onClose={() => setIsEditing(false)}
            setCurrentView={handleEditComplete}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MyLibrary;