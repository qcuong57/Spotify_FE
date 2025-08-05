import {
  IconHome,
  IconSearch,
  IconArticle,
  IconLogout,
  IconMenu2,
  IconX,
  IconPalette,
} from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { searchSongs } from "../../services/SongsService";
import ProfilePopup from "./ProfilePopup";
import { useTheme } from "../../context/themeContext.js";

const Header = ({ setCurrentView, setListSongsDetail }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const { theme, setShowThemeSelector } = useTheme();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const handleSearchChange = async () => {
    if (!searchText.trim()) return;
    try {
      const response = await searchSongs(searchText);
      const data = {
        songs: response.data.results,
        title: "Tìm kiếm: " + searchText,
      };
      setListSongsDetail(data);
      setCurrentView("listSongs");
      setShowMobileSearch(false);
    } catch (error) {
      console.error("Error fetching songs:", error);
    }
  };

  const toggleProfilePopup = () => {
    setShowProfilePopup(!showProfilePopup);
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <>
      {/* Enhanced header with dynamic theme styling */}
      <div
        className={`
          relative flex h-16 md:h-20 flex-row items-center text-white 
          bg-gradient-to-r ${theme.colors.background}
          px-4 md:px-6 backdrop-blur-lg border-b border-white/20
          shadow-lg shadow-${theme.colors.primary}-500/20
          before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent
        `}
      >
        <div className="flex flex-1 flex-row items-center relative z-10">
          {/* Logo with enhanced glow */}
          <div className="relative group">
            <img
              className="h-8 md:h-12 cursor-pointer mr-3 md:mr-4 transition-all duration-300 hover:scale-110 drop-shadow-lg"
              src="https://yzfbdwvbybecxhbitkmc.supabase.co/storage/v1/object/sign/image/78ed005b-b0aa-427b-bc0d-6f1efb29e653.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82OTc4ZGU2My0wOWQzLTRhYmYtOWRjZC0wZjY0NTBlN2VlYmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS83OGVkMDA1Yi1iMGFhLTQyN2ItYmMwZC02ZjFlZmIyOWU2NTMucG5nIiwiaWF0IjoxNzU0MTM1Mzk4LCJleHAiOjIwNjk0OTUzOTh9.MxsdoFIdkMKWNqhTMN5PTDT2k_K-ELn-q7OzxBEF9PM"
              onClick={() => setCurrentView("main")}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
          </div>

          <div className="flex items-center gap-2">
            {/* Title with dynamic gradient */}
            <h4
              className={`
                text-2xl font-extrabold bg-gradient-to-r ${theme.colors.gradient} 
                text-transparent bg-clip-text drop-shadow-md
                hover:drop-shadow-lg transition-all duration-300
              `}
            >
              UIAMusic
            </h4>

            {/* Enhanced Home button with dynamic theme styling */}
            <div
              className={`
                bg-${theme.colors.primary}-600/60 hover:bg-${theme.colors.secondary}-600/80 
                border border-${theme.colors.primary}-400/30 shadow-lg shadow-${theme.colors.primary}-500/25
                cursor-pointer w-8 h-8 md:w-10 md:h-10 p-2 rounded-full 
                transition-all duration-300 ease-out
                hover:scale-110 hover:rotate-12
                backdrop-blur-sm
              `}
              onClick={() => setCurrentView("main")}
            >
              <IconHome stroke={2} className="w-full h-full text-white" />
            </div>

            {/* Theme Button for Mobile */}
            <div
              className={`
                bg-${theme.colors.primary}-600/60 hover:bg-${theme.colors.secondary}-600/80 
                border border-${theme.colors.primary}-400/30
                md:hidden w-8 h-8 cursor-pointer rounded-full 
                flex items-center justify-center transition-all duration-300 hover:scale-110
              `}
              onClick={() => setShowThemeSelector(true)}
            >
              <IconPalette stroke={2} className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Desktop Search with dynamic theme */}
          <div
            className={`
              hidden md:flex flex-1 flex-row items-center rounded-full max-w-md mx-4
              bg-${theme.colors.card} border border-${theme.colors.border} 
              shadow-lg shadow-${theme.colors.primary}-500/25
              backdrop-blur-md px-4 py-2
              transition-all duration-300 hover:scale-105
              relative overflow-hidden
            `}
          >
            <IconSearch
              stroke={2}
              className={`w-5 h-5 md:w-6 md:h-6 cursor-pointer text-white hover:text-${theme.colors.secondary}-300 transition-colors z-10`}
              onClick={handleSearchChange}
            />
            <input
              type="text"
              placeholder="Tìm kiếm bài hát..."
              className="flex-1 mx-2 bg-transparent border-none outline-none text-sm text-white placeholder-white/70 z-10"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearchChange();
                }
              }}
            />
          </div>

          {/* Mobile Search Icon with dynamic theme */}
          <div
            className={`
              md:hidden w-8 h-8 cursor-pointer ml-auto mr-3 rounded-full
              bg-${theme.colors.primary}-600/60 hover:bg-${theme.colors.secondary}-600/80
              border border-${theme.colors.primary}-400/30 shadow-lg shadow-${theme.colors.primary}-500/25
              flex items-center justify-center
              transition-all duration-300 hover:scale-110
            `}
            onClick={() => setShowMobileSearch(true)}
          >
            <IconSearch stroke={2} className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Enhanced Desktop Menu */}
        <div className="hidden md:flex flex-row items-center gap-4 relative z-10">
          {/* Enhanced Theme Button with dynamic styling */}
          <button
            onClick={() => setShowThemeSelector(true)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-full
              bg-${theme.colors.primary}-600/60 hover:bg-${theme.colors.secondary}-600/80
              border border-${theme.colors.primary}-400/30
              text-white backdrop-blur-sm
              transition-all duration-300 ease-out
              hover:scale-105 hover:shadow-xl
              relative overflow-hidden group
            `}
            title="Thay đổi chủ đề"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
            <IconPalette className="w-5 h-5 z-10" />
            <span className="text-sm font-medium hidden lg:block z-10">
              Chủ đề
            </span>
          </button>

          {user ? (
            <>
              <div className="relative group">
                <img
                  src={user.avatar || "https://via.placeholder.com/32"}
                  alt="User avatar"
                  className="w-8 h-8 rounded-full border-2 border-white/30 hover:border-white/60 transition-all duration-300 hover:scale-110"
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <span
                className="text-sm font-bold text-white cursor-pointer hover:text-white/80 transition-colors"
                onClick={toggleProfilePopup}
              >
                {user.first_name || "User"}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center text-sm font-bold text-white cursor-pointer hover:text-white/80 transition-all duration-300 hover:scale-105"
              >
                <IconLogout stroke={2} className="w-5 h-5 mr-1" />
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/signup">
                <span className="text-sm font-bold text-white cursor-pointer hover:text-white/80 transition-colors">
                  Đăng ký
                </span>
              </Link>
              <Link to="/login">
                <span
                  className={`
                    py-2 px-4 rounded-full text-sm cursor-pointer 
                    bg-white/20 hover:bg-white/30 text-white
                    backdrop-blur-sm border border-white/30
                    transition-all duration-300 hover:scale-105 hover:shadow-lg
                  `}
                >
                  Đăng nhập
                </span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button with dynamic theme */}
        <div
          className={`
            md:hidden w-8 h-8 cursor-pointer rounded-full
            bg-${theme.colors.primary}-600/60 hover:bg-${theme.colors.secondary}-600/80
            border border-${theme.colors.primary}-400/30 shadow-lg shadow-${theme.colors.primary}-500/25
            flex items-center justify-center
            transition-all duration-300 hover:scale-110
          `}
          onClick={() => setShowMobileMenu(true)}
        >
          <IconMenu2 stroke={2} className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Enhanced Mobile Search Modal with dynamic theme */}
      {showMobileSearch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden">
          <div
            className={`bg-gradient-to-b ${theme.colors.backgroundOverlay} p-4 backdrop-blur-lg border-b border-white/20`}
          >
            <div className="flex items-center mb-4">
              <div
                className="w-8 h-8 cursor-pointer rounded-full bg-white/20 flex items-center justify-center mr-3 hover:bg-white/30 transition-colors"
                onClick={() => setShowMobileSearch(false)}
              >
                <IconX stroke={2} className="w-5 h-5 text-white" />
              </div>
              <div
                className={`
                  flex-1 bg-${theme.colors.card} border border-${theme.colors.border}
                  shadow-lg shadow-${theme.colors.primary}-500/25
                  px-4 py-2 rounded-full flex items-center backdrop-blur-md
                `}
              >
                <IconSearch stroke={2} className="w-5 h-5 text-white mr-2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bài hát..."
                  className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-white/70"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearchChange();
                    }
                  }}
                  autoFocus
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Mobile Menu with dynamic theme */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden">
          <div
            className={`bg-gradient-to-b ${theme.colors.backgroundOverlay} h-full w-64 p-4 backdrop-blur-lg border-r border-white/20`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Menu</h2>
              <div
                className="w-8 h-8 cursor-pointer rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                <IconX stroke={2} className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex flex-col space-y-4">
              {/* Theme Button in Mobile Menu */}
              <button
                onClick={() => {
                  setShowThemeSelector(true);
                  setShowMobileMenu(false);
                }}
                className="flex items-center p-3 text-sm font-bold text-white cursor-pointer hover:bg-white/20 rounded-lg transition-all duration-300 backdrop-blur-sm border border-white/20"
              >
                <IconPalette stroke={2} className="w-5 h-5 mr-3" />
                Thay đổi chủ đề
              </button>

              {user ? (
                <>
                  <div className="flex items-center p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                    <img
                      src={user.avatar || "https://via.placeholder.com/32"}
                      alt="User avatar"
                      className="w-8 h-8 rounded-full mr-3 border border-white/30"
                    />
                    <span
                      className="text-sm font-bold text-white cursor-pointer hover:text-white/80"
                      onClick={() => {
                        toggleProfilePopup();
                        setShowMobileMenu(false);
                      }}
                    >
                      {user.first_name || "User"}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowMobileMenu(false);
                    }}
                    className="flex items-center p-3 text-sm font-bold text-white cursor-pointer hover:bg-white/20 rounded-lg transition-all duration-300 backdrop-blur-sm border border-white/20"
                  >
                    <IconLogout stroke={2} className="w-5 h-5 mr-3" />
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link to="/signup" onClick={() => setShowMobileMenu(false)}>
                    <span className="block p-3 text-sm font-bold text-white cursor-pointer hover:bg-white/20 rounded-lg transition-all duration-300 backdrop-blur-sm border border-white/20">
                      Đăng ký
                    </span>
                  </Link>
                  <Link to="/login" onClick={() => setShowMobileMenu(false)}>
                    <span className="block p-3 text-sm font-bold bg-white/20 text-white rounded-lg cursor-pointer hover:bg-white/30 transition-all duration-300 text-center backdrop-blur-sm border border-white/30">
                      Đăng nhập
                    </span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* {showProfilePopup && (
        <ProfilePopup
          user={user}
          onClose={toggleProfilePopup}
          onUpdate={handleProfileUpdate}
        />
      )} */}
    </>
  );
};

export default Header;