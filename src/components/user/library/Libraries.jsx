import { useState, useEffect } from "react";
import {
  IconPlus,
  IconSearch,
  IconX,
  IconMusic,
  IconWorld,
  IconMail,
  IconBrandFacebook,
  IconChevronLeft,
} from "@tabler/icons-react";
import { useTheme } from "../../../context/themeContext";
import {
  createPlaylistService,
  getUserPlaylistByIdService,
} from "../../../services/playlistService";
import { usePlayList } from "../../../utils/playlistContext";

const Library = ({
  playlist,
  setCurrentView,
  index,
  theme,
  onLibraryClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 50);
    return () => clearTimeout(timer);
  }, [index]);

  const handlePlaylistClick = () => {
    setCurrentView(playlist);
    if (window.innerWidth < 768) {
      onLibraryClose();
    }
  };

  return (
    <div
      className={`flex items-center cursor-pointer h-14 md:h-16 w-full rounded-lg px-3 md:px-4 transition-all duration-300 ease-out ${
        playlist.is_liked_song
          ? `bg-gradient-to-br from-${theme.colors.primary}-800 to-${theme.colors.secondary}-700`
          : `bg-gradient-to-br from-${theme.colors.card} to-gray-800/30`
      } hover:bg-${
        theme.colors.cardHover
      } hover:scale-[1.02] hover:shadow-lg border border-${
        theme.colors.border
      } hover:border-${theme.colors.primary}-500/30 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
      }`}
      onClick={handlePlaylistClick}
    >
      <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
        {playlist.is_liked_song ? (
          <div
            className={`flex items-center justify-center bg-${theme.colors.primary}-600 p-2 rounded flex-shrink-0 transition-transform duration-200 hover:scale-110 shadow-lg`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className={`w-5 h-5 md:w-6 md:h-6 text-${theme.colors.secondary}-200`}
            >
              <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
            </svg>
          </div>
        ) : playlist.image ? (
          <img
            src={playlist.image}
            alt={playlist.title}
            className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover flex-shrink-0 shadow-md transition-transform duration-200 hover:scale-110"
          />
        ) : (
          <div
            className={`p-2 rounded bg-gradient-to-br from-${theme.colors.primary}-800/30 to-${theme.colors.secondary}-800/30 flex items-center justify-center flex-shrink-0 transition-transform duration-200 hover:scale-110 border border-${theme.colors.border}`}
          >
            <IconMusic
              stroke={2}
              className={`w-5 h-5 md:w-6 md:h-6 text-${theme.colors.text}`}
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3
            className={`text-sm md:text-base font-bold cursor-pointer truncate text-white hover:text-${theme.colors.textHover} transition-colors duration-200`}
          >
            {playlist.title}
          </h3>
          <p
            className={`text-xs md:text-sm text-${theme.colors.text} truncate`}
          >
            {playlist.song_count || 0} bài hát
          </p>
        </div>
      </div>
    </div>
  );
};

const Libraries = ({ setCurrentView, onClose }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [user, setUser] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const {
    playlists,
    setPlaylists,
    refreshKeyPlayLists,
    setRefreshKeyPlayLists,
  } = usePlayList();

  const [filteredPlaylists, setFilteredPlaylists] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const accessToken = localStorage.getItem("access_token");

    if (storedUser && accessToken) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    }
  }, []);

  useEffect(() => {
    const fetchUserPlaylists = async () => {
      if (!user || !user.id) {
        setPlaylists([]);
        return;
      }

      try {
        setLoading(true);

        const response = await getUserPlaylistByIdService(user.id);

        if (response && response.data && response.data.playlists) {
          const playlistsData = response.data.playlists;


          playlistsData.forEach((playlist, index) => {
            console.log(`Playlist ${index + 1}:`, {
              id: playlist.id,
              title: playlist.title,
              song_count: playlist.song_count,
              is_liked_song: playlist.is_liked_song,
            });
          });

          setPlaylists(playlistsData);
        } else {
          console.log("Libraries - response structure:", {
            hasData: !!response?.data,
            dataKeys: response?.data ? Object.keys(response.data) : [],
            fullResponse: response,
          });
          setPlaylists([]);
        }
      } catch (error) {
        console.error("Libraries - error fetching user playlists:", error);
        if (error.response) {
          console.error("Error response:", error.response.data);
          console.error("Error status:", error.response.status);
        }
        setPlaylists([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPlaylists();
  }, [user, refreshKeyPlayLists, setPlaylists]);

  useEffect(() => {
    if (!searchValue.trim()) {
      setFilteredPlaylists(playlists);
    } else {
      const filtered = playlists.filter((playlist) =>
        playlist.title.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredPlaylists(filtered);
    }
  }, [playlists, searchValue]);

  const handleClose = () => {
    setIsClosing(true);
    setCurrentView("main");
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleLibraryClose = () => {
    onClose();
  };

  const handleCreatePlaylist = async () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    try {
      setLoading(true);

      const playlistData = {
        title: `Danh sách phát của tôi #${playlists.length + 1}`,
        description: "Danh sách phát mới",
        image: null,
      };


      
      const response = await createPlaylistService(playlistData);

      if (response && response.data) {
        const newPlaylist = {
          id: response.data.id,
          title: response.data.title,
          description: response.data.description || "Danh sách phát mới",
          image: response.data.image || null,
          is_liked_song: false,
          song_count: 0,
          user_id: user.id,
          created_at: response.data.created_at || new Date().toISOString(),
          updated_at: response.data.updated_at || new Date().toISOString(),
        };


        setPlaylists((prevPlaylists) => {
          const updatedPlaylists = [newPlaylist, ...prevPlaylists];
          return updatedPlaylists;
        });

        setRefreshKeyPlayLists(Date.now());

        setTimeout(() => {
          setCurrentView(newPlaylist);
          if (window.innerWidth < 768) {
            handleLibraryClose();
          }
        }, 100);
      } else {
        console.error("Libraries - Invalid response format:", response);
        alert("Có lỗi xảy ra khi tạo playlist!");
      }
    } catch (error) {
      console.error("Libraries - error creating playlist:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        alert(
          `Có lỗi xảy ra: ${
            error.response.data.message ||
            error.response.data.error ||
            "Unknown error"
          }`
        );
      } else {
        alert("Có lỗi xảy ra khi tạo playlist!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
  };

  const clearSearch = () => {
    setSearchValue("");
  };

  return (
    <div
      className={`
        fixed inset-0 z-[10000] bg-gradient-to-b ${
          theme.colors.backgroundOverlay
        } backdrop-blur-md
        md:relative md:inset-auto md:flex md:w-full md:max-w-[420px] md:z-auto
        flex flex-col text-white rounded-r-lg px-2 md:px-4 
        transition-all duration-300 ease-out shadow-2xl 
        ${
          isVisible && !isClosing
            ? "translate-x-0 opacity-100"
            : "translate-x-[-100%] opacity-0"
        }
      `}
    >
      <button
        onClick={handleClose}
        className={`md:hidden absolute top-4 left-4 z-[10001] bg-${
          theme.colors.card
        } hover:bg-${
          theme.colors.cardHover
        } rounded-full p-2 transition-all duration-300 group shadow-lg ${
          isVisible && !isClosing
            ? "scale-100 opacity-100"
            : "scale-0 opacity-0"
        }`}
        title="Quay lại"
      >
        <IconChevronLeft
          stroke={2}
          className={`w-5 h-5 text-${theme.colors.text} group-hover:text-white transition-colors duration-200`}
        />
      </button>

      <button
        onClick={handleClose}
        className={`hidden md:block absolute top-3 right-3 z-[10001] bg-${
          theme.colors.card
        } hover:bg-${
          theme.colors.cardHover
        } rounded-full p-1.5 transition-all duration-300 group shadow-lg ${
          isVisible && !isClosing
            ? "scale-100 opacity-100"
            : "scale-0 opacity-0"
        }`}
        title="Đóng thư viện"
      >
        <IconX
          stroke={2}
          className={`w-4 h-4 md:w-5 md:h-5 text-${theme.colors.text} group-hover:text-white transition-colors duration-200`}
        />
      </button>

      <div
        className={`flex flex-row justify-between items-center pt-16 md:pt-4 pb-6 px-2 pr-10 transition-all duration-300 delay-100 ${
          isVisible && !isClosing
            ? "translate-y-0 opacity-100"
            : "translate-y-[-20px] opacity-0"
        }`}
      >
        <span
          className={`text-xl md:text-lg font-bold text-white bg-gradient-to-r ${theme.colors.gradient} bg-clip-text text-transparent`}
        >
          Thư viện
        </span>
        <button
          className={`bg-${
            theme.colors.card
          } flex items-center justify-center h-10 md:h-10 px-4 md:px-4 rounded-full cursor-pointer hover:bg-${
            theme.colors.cardHover
          } transition-all duration-200 hover:scale-105 shadow-lg ${
            loading ? `bg-${theme.colors.primary}-600/20` : ""
          }`}
          onClick={handleCreatePlaylist}
          disabled={loading}
        >
          <IconPlus
            stroke={2}
            className={`w-5 h-5 md:w-5 md:h-5 mr-2 md:mr-1 transition-transform duration-200 text-${
              theme.colors.text
            } ${loading ? "animate-spin" : ""}`}
          />
          <span
            className={`text-sm md:text-base font-bold text-${theme.colors.text}`}
          >
            {loading ? "Tạo..." : "Tạo"}
          </span>
        </button>
      </div>

      {showLoginPrompt && (
        <div
          className={`bg-${theme.colors.card} p-4 md:p-6 rounded-lg mb-4 mx-2 transition-all duration-200 shadow-lg`}
        >
          <h3 className="font-bold text-base md:text-base mb-2 text-white">
            Vui lòng đăng nhập
          </h3>
          <p className={`text-sm md:text-sm text-${theme.colors.text} mb-4`}>
            Bạn cần đăng nhập để tạo danh sách phát mới.
          </p>
          <button
            className={`text-sm md:text-sm font-bold bg-${theme.colors.button} hover:bg-${theme.colors.buttonHover} text-${theme.colors.primary}-900 rounded-full py-2 px-4 transition-all duration-200 hover:scale-105 shadow-md`}
            onClick={() => setShowLoginPrompt(false)}
          >
            Đóng
          </button>
        </div>
      )}

      <div
        className={`mb-4 mx-2 transition-all duration-300 delay-200 ${
          isVisible && !isClosing
            ? "translate-y-0 opacity-100"
            : "translate-y-[-20px] opacity-0"
        }`}
      >
        <div
          className={`flex flex-1 flex-row bg-${theme.colors.card} mb-3 px-4 py-3 md:py-2 items-center rounded-full hover:bg-${theme.colors.cardHover} transition-colors duration-200 shadow-md`}
        >
          <IconSearch
            stroke={2}
            className={`w-5 h-5 md:w-6 md:h-6 text-${theme.colors.text}`}
          />
          <input
            onChange={handleSearchChange}
            type="text"
            placeholder="Tìm kiếm playlist..."
            value={searchValue}
            className={`flex-1 mx-2 bg-transparent border-none outline-none text-base md:text-sm text-white placeholder-${theme.colors.text} transition-all duration-200 focus:placeholder-${theme.colors.textHover}`}
          />
          {searchValue && (
            <IconX
              stroke={2}
              className={`w-5 h-5 md:w-4 md:h-4 text-${theme.colors.text} cursor-pointer hover:text-white transition-colors duration-200`}
              onClick={clearSearch}
            />
          )}
        </div>
      </div>

      <div
        className={`flex-1 overflow-y-auto space-y-3 md:space-y-3 pr-1 mx-2 scrollbar-thin scrollbar-thumb-${
          theme.colors.primary
        }-600 scrollbar-track-transparent transition-all duration-300 delay-300 ${
          isVisible && !isClosing
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0"
        }`}
      >
        {!user ? (
          <div
            className={`bg-${theme.colors.card} p-6 md:p-6 rounded-lg transition-all duration-200 hover:bg-${theme.colors.cardHover} shadow-lg`}
          >
            <h3 className="font-bold text-base md:text-base mb-2 text-white">
              Đăng nhập để xem thư viện
            </h3>
            <p className={`text-sm md:text-sm text-${theme.colors.text} mb-4`}>
              Đăng nhập để tạo và quản lý danh sách phát của bạn
            </p>
          </div>
        ) : loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`bg-${theme.colors.card} p-4 rounded-lg transition-all duration-200 shadow-lg`}
              >
                <div className="animate-pulse flex space-x-4">
                  <div className="rounded bg-gray-600 h-12 w-12 flex-shrink-0"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-600 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredPlaylists.length === 0 ? (
          <div
            className={`bg-${theme.colors.card} p-6 md:p-6 rounded-lg transition-all duration-200 hover:bg-${theme.colors.cardHover} shadow-lg`}
          >
            <h3 className="font-bold text-base md:text-base mb-2 text-white">
              {searchValue ? "Không tìm thấy playlist" : "Chưa có playlist nào"}
            </h3>
            <p className={`text-sm md:text-sm text-${theme.colors.text} mb-4`}>
              {searchValue
                ? `Không có playlist nào khớp với "${searchValue}"`
                : "Hãy tạo playlist đầu tiên của bạn"}
            </p>
            {!searchValue && (
              <button
                className={`text-sm md:text-sm font-bold bg-${theme.colors.button} hover:bg-${theme.colors.buttonHover} text-${theme.colors.primary}-900 rounded-full py-2 px-4 transition-all duration-200 hover:scale-105 shadow-md`}
                onClick={handleCreatePlaylist}
                disabled={loading}
              >
                {loading ? "Đang tạo..." : "Tạo danh sách phát"}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3 md:space-y-3">
            {filteredPlaylists.map((playlist, index) => (
              <Library
                key={`playlist-${playlist.id}-${index}`}
                playlist={playlist}
                setCurrentView={setCurrentView}
                index={index}
                theme={theme}
                onLibraryClose={handleLibraryClose}
              />
            ))}
          </div>
        )}
      </div>

      <div
        className={`border-t border-${
          theme.colors.border
        } mt-4 pt-4 pb-6 md:pb-4 mx-2 transition-all duration-300 delay-400 ${
          isVisible && !isClosing
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0"
        }`}
      >
        <div className="space-y-3 md:space-y-2">
          <div className="flex items-center gap-2">
            <IconMail
              stroke={2}
              className={`w-4 h-4 text-${theme.colors.text} flex-shrink-0`}
            />
            <span
              className={`text-sm md:text-xs text-${theme.colors.text} truncate`}
            >
              Gmail: quoccuong572003@gmail.com
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://www.facebook.com/gnoucdasick/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <IconBrandFacebook
                stroke={2}
                className={`w-4 h-4 text-${theme.colors.text} flex-shrink-0`}
              />
              <span className={`text-sm md:text-xs text-${theme.colors.text}`}>
                FB: Quốc Cường
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Libraries;
