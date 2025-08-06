import {
  IconHome,
  IconSearch,
  IconLogout,
  IconMenu2,
  IconX,
  IconPalette,
  IconMusic,
  IconMicrophone,
} from "@tabler/icons-react";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { searchSongs, getSearchSuggestions } from "../../services/SongsService";
import ProfilePopup from "./ProfilePopup";
import React from "react";
import { useTheme } from "../../context/themeContext.js";

const Header = ({ setCurrentView, setListSongsDetail }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const { theme, setShowThemeSelector } = useTheme();

  // Search states
  const [suggestions, setSuggestions] = useState({
    songs: [],
    singers: [],
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Refs for suggestion handling
  const searchInputRef = useRef(null);
  const mobileSearchInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const mobileSuggestionsRef = useRef(null);

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

  // Fetch suggestions with debounce
  const fetchSuggestions = async (query) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions({ songs: [], singers: [] });
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const response = await getSearchSuggestions(query, 5);
      setSuggestions(response.data.suggestions);
      setShowSuggestions(true);
      setSelectedSuggestionIndex(-1);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions({ songs: [], singers: [] });
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Handle search input change with debounce
  const handleSearchInputChange = (value) => {
    setSearchText(value);
    setSelectedSuggestionIndex(-1);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const newTimeout = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);

    setSearchTimeout(newTimeout);
  };

  // Search execution
  const handleSearchChange = async (searchQuery = searchText) => {
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);

    try {
      // Show loading state
      const loadingData = {
        songs: [],
        title: `Đang tìm kiếm: ${query}`,
        subtitle: "Tìm kiếm bài hát và nghệ sĩ",
        searchQuery: query,
        isLoading: true,
      };
      setListSongsDetail(loadingData);
      setCurrentView("listSongs");

      // Close mobile components
      setShowMobileSearch(false);
      setShowSuggestions(false);

      // Perform search
      const response = await searchSongs(query, 1, 50);

      // Prepare result data
      let title = `Tìm kiếm: "${query}"`;
      let subtitle = "";

      if (response.data.results && response.data.results.length > 0) {
        subtitle = `Tìm thấy ${response.data.results.length} kết quả`;
      } else {
        subtitle = "Không tìm thấy kết quả";
      }

      const searchData = {
        songs: response.data.results || [],
        title: title,
        subtitle: subtitle,
        searchQuery: query,
        totalResults: response.data.count || 0,
        isLoading: false,
      };

      setListSongsDetail(searchData);
      setSuggestions({ songs: [], singers: [] });
    } catch (error) {
      console.error("Error searching songs:", error);

      const errorData = {
        songs: [],
        title: `Lỗi tìm kiếm: "${query}"`,
        subtitle: "Không thể thực hiện tìm kiếm. Vui lòng thử lại.",
        searchQuery: query,
        error: error.message,
        isLoading: false,
      };
      setListSongsDetail(errorData);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchText(suggestion);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    handleSearchChange(suggestion);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    const allSuggestions = [
      ...suggestions.songs.map((s) => ({ text: s, type: "song" })),
      ...suggestions.singers.map((s) => ({ text: s, type: "singer" })),
    ];

    if (!showSuggestions || allSuggestions.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearchChange();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => {
          const newIndex = prev < allSuggestions.length - 1 ? prev + 1 : 0;
          return newIndex;
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => {
          const newIndex = prev > 0 ? prev - 1 : allSuggestions.length - 1;
          return newIndex >= 0 ? newIndex : allSuggestions.length - 1;
        });
        break;
      case "Enter":
        e.preventDefault();
        if (
          selectedSuggestionIndex >= 0 &&
          selectedSuggestionIndex < allSuggestions.length
        ) {
          const selected = allSuggestions[selectedSuggestionIndex];
          handleSuggestionClick(selected.text);
        } else {
          handleSearchChange();
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target) &&
        mobileSuggestionsRef.current &&
        !mobileSuggestionsRef.current.contains(event.target) &&
        mobileSearchInputRef.current &&
        !mobileSearchInputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Suggestions component
  const SuggestionsList = ({
    suggestions,
    isLoadingSuggestions,
    selectedIndex,
    onSuggestionClick,
    isMobile = false,
  }) => {
    const allSuggestions = [
      ...suggestions.songs.map((s) => ({
        text: s,
        type: "song",
        icon: IconMusic,
        label: "Bài hát",
      })),
      ...suggestions.singers.map((s) => ({
        text: s,
        type: "singer",
        icon: IconMicrophone,
        label: "Nghệ sĩ",
      })),
    ];

    if (!isLoadingSuggestions && allSuggestions.length === 0) {
      return null; // Không hiển thị nếu không có gợi ý và không đang tải
    }

    return (
      <div
        ref={isMobile ? mobileSuggestionsRef : suggestionsRef}
        className="fixed rounded-lg shadow-2xl backdrop-blur-xl max-h-64 overflow-y-auto bg-black/95 border border-white/20"
        style={{
          position: "fixed",
          top: isMobile ? "120px" : "80px",
          left: isMobile ? "16px" : "50%",
          right: isMobile ? "16px" : "auto",
          transform: isMobile ? "none" : "translateX(-50%)",
          width: isMobile ? "calc(100% - 32px)" : "400px",
          maxWidth: isMobile ? "none" : "90vw",
          zIndex: 100000, // Tăng z-index để đảm bảo hiển thị trên cùng
        }}
      >
        {isLoadingSuggestions ? (
          <div className="p-3 text-center text-white/90">
            <div className="animate-spin w-5 h-5 border-2 border-white/40 border-t-white rounded-full mx-auto"></div>
            <span className="text-sm mt-2 block">Đang tìm kiếm...</span>
          </div>
        ) : (
          allSuggestions.map((suggestion, index) => {
            const IconComponent = suggestion.icon;
            const isSelected = index === selectedIndex;

            return (
              <div
                key={`${suggestion.type}-${suggestion.text}-${index}`}
                className={`
                flex items-center px-4 py-3 cursor-pointer transition-all duration-200
                ${
                  isSelected
                    ? "bg-white/20 border-l-4 border-white text-white"
                    : "text-white/90 hover:text-white hover:bg-white/10 border-l-4 border-transparent"
                }
                ${index === 0 ? "rounded-t-lg" : ""}
                ${index === allSuggestions.length - 1 ? "rounded-b-lg" : ""}
              `}
                onClick={() => onSuggestionClick(suggestion.text)}
              >
                <IconComponent className="w-4 h-4 mr-3 opacity-80" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{suggestion.text}</div>
                  <div className="text-xs opacity-70">{suggestion.label}</div>
                </div>
                {isSelected && (
                  <div className="w-2 h-2 bg-white rounded-full opacity-90"></div>
                )}
              </div>
            );
          })
        )}
      </div>
    );
  };

  const toggleProfilePopup = () => {
    setShowProfilePopup(!showProfilePopup);
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  const handleMobileMenuToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMobileMenu((prev) => !prev); // Chuyển đổi trạng thái mở/đóng
  };

  return (
    <>
      {/* Header */}
      <div
        className={`
          relative flex h-16 md:h-20 flex-row items-center text-white 
          bg-gradient-to-r ${theme.colors.background}
          px-4 md:px-6 backdrop-blur-lg border-b border-white/20
          shadow-lg shadow-${theme.colors.primary}-500/20
          before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent
        `}
        style={{ zIndex: 1000 }}
      >
        <div className="flex flex-1 flex-row items-center relative z-10">
          {/* Logo */}
          <div className="relative group">
            <img
              className="h-8 md:h-12 cursor-pointer mr-3 md:mr-4 transition-all duration-300 hover:scale-110 drop-shadow-lg"
              src="https://yzfbdwvbybecxhbitkmc.supabase.co/storage/v1/object/sign/image/78ed005b-b0aa-427b-bc0d-6f1efb29e653.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82OTc4ZGU2My0wOWQzLTRhYmYtOWRjZC0wZjY0NTBlN2VlYmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS83OGVkMDA1Yi1iMGFhLTQyN2ItYmMwZC02ZjFlZmIyOWU2NTMucG5nIiwiaWF0IjoxNzU0MTM1Mzk4LCJleHAiOjIwNjk0OTUzOTh9.MxsdoFIdkMKWNqhTMN5PTDT2k_K-ELn-q7OzxBEF9PM"
              onClick={() => setCurrentView("main")}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
          </div>

          <div className="flex items-center gap-2">
            {/* Title */}
            <h4
              className={`
                text-2xl font-extrabold bg-gradient-to-r ${theme.colors.gradient} 
                text-transparent bg-clip-text drop-shadow-md
                hover:drop-shadow-lg transition-all duration-300
              `}
            >
              UIAMusic
            </h4>

            {/* Home button */}
            <button
              className={`
                bg-${theme.colors.primary}-600/60 hover:bg-${theme.colors.secondary}-600/80 
                border border-${theme.colors.primary}-400/30 shadow-lg shadow-${theme.colors.primary}-500/25
                cursor-pointer w-8 h-8 md:w-10 md:h-10 p-2 rounded-full 
                transition-all duration-300 ease-out
                hover:scale-110 hover:rotate-12
                backdrop-blur-sm
                active:scale-95
              `}
              onClick={() => setCurrentView("main")}
            >
              <IconHome stroke={2} className="w-full h-full text-white" />
            </button>

            {/* Theme Button for Mobile */}
            <button
              className={`
                bg-${theme.colors.primary}-600/60 hover:bg-${theme.colors.secondary}-600/80 
                border border-${theme.colors.primary}-400/30
                md:hidden w-8 h-8 cursor-pointer rounded-full 
                flex items-center justify-center transition-all duration-300 hover:scale-110
                active:scale-95
              `}
              onClick={() => setShowThemeSelector(true)}
            >
              <IconPalette stroke={2} className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 flex-row items-center max-w-md mx-4 relative">
            <div
              className={`
                flex flex-1 flex-row items-center rounded-full
                bg-${theme.colors.card} border border-${theme.colors.border} 
                shadow-lg shadow-${theme.colors.primary}-500/25
                backdrop-blur-md px-4 py-2
                transition-all duration-300 hover:scale-105
                relative overflow-hidden
              `}
            >
              <IconSearch
                stroke={2}
                className="w-5 h-5 cursor-pointer text-white hover:text-white/80 transition-colors"
                onClick={() => handleSearchChange()}
              />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Tìm kiếm bài hát..."
                className="flex-1 mx-2 bg-transparent border-none outline-none text-sm text-white placeholder-white/70"
                value={searchText}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (searchText.length >= 2) {
                    setShowSuggestions(true);
                  }
                }}
                disabled={isSearching}
              />
              {isSearching && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
          </div>

          {/* Mobile Search Icon */}
          <button
            className={`
              md:hidden w-8 h-8 cursor-pointer ml-auto mr-3 rounded-full
              bg-${theme.colors.primary}-600/60 hover:bg-${theme.colors.secondary}-600/80
              border border-${theme.colors.primary}-400/30 shadow-lg shadow-${theme.colors.primary}-500/25
              flex items-center justify-center
              transition-all duration-300 hover:scale-110
              active:scale-95
            `}
            onClick={() => setShowMobileSearch(true)}
          >
            <IconSearch stroke={2} className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex flex-row items-center gap-4 relative z-10">
          {/* Theme Button */}
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
              active:scale-95
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

        {/* Mobile Menu Button */}
        <button
          className={`
            md:hidden w-10 h-10 cursor-pointer rounded-full
            bg-${theme.colors.primary}-600/60 hover:bg-${theme.colors.secondary}-600/80
            border border-${theme.colors.primary}-400/30 shadow-lg shadow-${theme.colors.primary}-500/25
            flex items-center justify-center
            transition-all duration-300 hover:scale-110
            active:scale-95 active:bg-${theme.colors.secondary}-700/80
            relative z-20
            touch-manipulation
          `}
          onClick={handleMobileMenuToggle}
          aria-label="Open mobile menu"
          type="button"
        >
          <IconMenu2
            stroke={2}
            className="w-6 h-6 text-white pointer-events-none"
          />
        </button>
      </div>

      {/* Desktop Suggestions */}
      {showSuggestions && !showMobileSearch && (
        <SuggestionsList
          suggestions={suggestions}
          isLoadingSuggestions={isLoadingSuggestions}
          selectedIndex={selectedSuggestionIndex}
          onSuggestionClick={handleSuggestionClick}
        />
      )}

      {/* Mobile Search Modal */}
      {showMobileSearch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100001] md:hidden">
          <div
            className={`bg-gradient-to-b ${theme.colors.backgroundOverlay} p-4 backdrop-blur-lg border-b border-white/20`}
          >
            <div className="flex items-center mb-4">
              <button
                className="w-8 h-8 cursor-pointer rounded-full bg-white/20 flex items-center justify-center mr-3 hover:bg-white/30 transition-colors"
                onClick={() => {
                  setShowMobileSearch(false);
                  setShowSuggestions(false);
                  setSearchText(""); // Xóa input khi đóng
                }}
              >
                <IconX stroke={2} className="w-5 h-5 text-white" />
              </button>

              <div className="flex-1 relative">
                <div
                  className={`
              bg-${theme.colors.card} border border-${theme.colors.border}
              shadow-lg shadow-${theme.colors.primary}-500/25
              px-4 py-2 rounded-full flex items-center backdrop-blur-md
            `}
                >
                  <input
                    ref={mobileSearchInputRef}
                    type="text"
                    placeholder="Tìm kiếm bài hát..."
                    className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-white/70"
                    value={searchText}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                      if (searchText.length >= 2) {
                        setShowSuggestions(true);
                      }
                    }}
                    autoFocus
                    disabled={isSearching}
                  />
                  <button
                    onClick={() => handleSearchChange()}
                    disabled={isSearching || !searchText.trim()}
                    className={`
                ml-2 p-1 hover:bg-white/10 rounded-full transition-colors
                ${
                  isSearching || !searchText.trim()
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }
              `}
                  >
                    {isSearching ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <IconSearch stroke={2} className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Suggestions */}
          {showSuggestions && (
            <SuggestionsList
              suggestions={suggestions}
              isLoadingSuggestions={isLoadingSuggestions}
              selectedIndex={selectedSuggestionIndex}
              onSuggestionClick={(text) => {
                handleSuggestionClick(text);
                setShowMobileSearch(false); // Đóng modal khi chọn gợi ý
              }}
              isMobile={true}
            />
          )}
        </div>
      )}

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100000] md:hidden"
          onClick={() => setShowMobileMenu(false)} // Đóng menu khi click ngoài
        >
          <div
            className={`bg-gradient-to-b ${theme.colors.backgroundOverlay} h-full w-64 p-4 backdrop-blur-lg border-r border-white/20`}
            onClick={(e) => e.stopPropagation()} // Ngăn đóng khi click trong menu
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Menu</h2>
              <button
                className="w-8 h-8 cursor-pointer rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                <IconX stroke={2} className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="flex flex-col space-y-4">
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
