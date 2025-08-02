import {
  IconHome,
  IconSearch,
  IconArticle,
  IconLogout,
  IconMenu2,
  IconX,
} from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { searchSongs } from "../../services/SongsService";
import ProfilePopup from "./ProfilePopup";

const Header = ({ setCurrentView, setListSongsDetail }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

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
      {/* Updated header with PlayerControls colors */}
      <div className="flex h-16 md:h-20 flex-row items-center text-white bg-gradient-to-t from-teal-900/50 via-teal-800/50 to-teal-700/50 px-4 md:px-6 backdrop-blur-md border-b border-teal-700/30">
        <div className="flex flex-1 flex-row items-center">
          <img
            className="h-8 md:h-12 cursor-pointer mr-3 md:mr-4"
            src="https://yzfbdwvbybecxhbitkmc.supabase.co/storage/v1/object/sign/image/78ed005b-b0aa-427b-bc0d-6f1efb29e653.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82OTc4ZGU2My0wOWQzLTRhYmYtOWRjZC0wZjY0NTBlN2VlYmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS83OGVkMDA1Yi1iMGFhLTQyN2ItYmMwZC02ZjFlZmIyOWU2NTMucG5nIiwiaWF0IjoxNzU0MTM1Mzk4LCJleHAiOjIwNjk0OTUzOTh9.MxsdoFIdkMKWNqhTMN5PTDT2k_K-ELn-q7OzxBEF9PM"
            onClick={() => setCurrentView("main")}
          />
          <div className="flex items-center gap-2">
            <h4 className="text-2xl font-extrabold bg-gradient-to-r from-teal-300 to-emerald-400 text-transparent bg-clip-text drop-shadow-md">
              UIAMusic
            </h4>

            <IconHome
              stroke={2}
              className="bg-teal-600/50 cursor-pointer w-8 h-8 md:w-10 md:h-10 p-2 rounded-full hover:bg-emerald-400/70 transition-colors"
              onClick={() => setCurrentView("main")}
            />
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 flex-row bg-teal-600/50 mx-4 px-4 py-2 items-center rounded-full max-w-md">
            <IconSearch
              stroke={2}
              className="w-5 h-5 md:w-6 md:h-6 cursor-pointer text-teal-300 hover:text-emerald-400"
              onClick={handleSearchChange}
            />
            <input
              type="text"
              placeholder="Tìm kiếm bài hát..."
              className="flex-1 mx-2 bg-transparent border-none outline-none text-sm text-white placeholder-teal-300"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearchChange();
                }
              }}
            />
          </div>

          {/* Mobile Search Icon */}
          <IconSearch
            stroke={2}
            className="md:hidden w-6 h-6 cursor-pointer text-teal-300 hover:text-emerald-400 ml-auto mr-3"
            onClick={() => setShowMobileSearch(true)}
          />
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex flex-row items-center gap-4">
          {user ? (
            <>
              <img
                src={user.avatar || "https://via.placeholder.com/32"}
                alt="User avatar"
                className="w-8 h-8 rounded-full"
              />
              <span
                className="text-sm font-bold text-teal-300 cursor-pointer hover:text-emerald-400"
                onClick={toggleProfilePopup}
              >
                {user.first_name || "User"}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center text-sm font-bold text-teal-300 cursor-pointer hover:text-emerald-400 transition-colors"
              >
                <IconLogout stroke={2} className="w-5 h-5 mr-1" />
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/signup">
                <span className="text-sm font-bold text-teal-300 cursor-pointer hover:text-emerald-400 transition-colors">
                  Đăng ký
                </span>
              </Link>
              <Link to="/login">
                <span className="py-2 px-4 rounded-full bg-teal-300/70 text-teal-900 text-sm cursor-pointer hover:bg-emerald-400/70 transition-colors">
                  Đăng nhập
                </span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <IconMenu2
          stroke={2}
          className="md:hidden w-6 h-6 cursor-pointer text-teal-300 hover:text-emerald-400"
          onClick={() => setShowMobileMenu(true)}
        />
      </div>

      {/* Mobile Search Modal - Updated colors */}
      {showMobileSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
          <div className="bg-gradient-to-t from-teal-900/50 via-teal-800/50 to-teal-700/50 p-4 backdrop-blur-md">
            <div className="flex items-center mb-4">
              <IconX
                stroke={2}
                className="w-6 h-6 cursor-pointer text-white mr-3"
                onClick={() => setShowMobileSearch(false)}
              />
              <div className="flex-1 bg-teal-600/50 px-4 py-2 rounded-full flex items-center">
                <IconSearch stroke={2} className="w-5 h-5 text-teal-300 mr-2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bài hát..."
                  className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-teal-300"
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

      {/* Mobile Menu - Updated colors */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
          <div className="bg-gradient-to-t from-teal-900/50 via-teal-800/50 to-teal-700/50 h-full w-64 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Menu</h2>
              <IconX
                stroke={2}
                className="w-6 h-6 cursor-pointer text-white"
                onClick={() => setShowMobileMenu(false)}
              />
            </div>
            <div className="flex flex-col space-y-4">
              {user ? (
                <>
                  <div className="flex items-center p-3 bg-teal-600/50 rounded-lg">
                    <img
                      src={user.avatar || "https://via.placeholder.com/32"}
                      alt="User avatar"
                      className="w-8 h-8 rounded-full mr-3"
                    />
                    <span
                      className="text-sm font-bold text-teal-300 cursor-pointer hover:text-emerald-400"
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
                    className="flex items-center p-3 text-sm font-bold text-teal-300 cursor-pointer hover:text-emerald-400 hover:bg-emerald-400/70 rounded-lg transition-colors"
                  >
                    <IconLogout stroke={2} className="w-5 h-5 mr-3" />
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link to="/signup" onClick={() => setShowMobileMenu(false)}>
                    <span className="block p-3 text-sm font-bold text-teal-300 cursor-pointer hover:text-emerald-400 hover:bg-emerald-400/70 rounded-lg transition-colors">
                      Đăng ký
                    </span>
                  </Link>
                  <Link to="/login" onClick={() => setShowMobileMenu(false)}>
                    <span className="block p-3 text-sm font-bold bg-teal-300/70 text-teal-900 rounded-lg cursor-pointer hover:bg-emerald-400/70 transition-colors text-center">
                      Đăng nhập
                    </span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Profile Popup */}
      {showProfilePopup && (
        <ProfilePopup
          user={user}
          onClose={toggleProfilePopup}
          onUpdate={handleProfileUpdate}
        />
      )}
    </>
  );
};
export default Header;