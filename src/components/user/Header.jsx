import {
  IconHome,
  IconSearch,
  IconLogout,
  IconMenu2,
  IconX,
  IconPalette,
  IconMusic,
  IconMicrophone,
  IconClock,
  IconHeadphones,
} from "@tabler/icons-react";
import { memo, useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { searchSongs, getSearchSuggestions } from "../../services/SongsService";
// import ProfilePopup from "./ProfilePopup"; // Giữ comment nếu bạn chưa dùng
import React from "react";
import { useTheme } from "../../context/themeContext.js";

// --- ANIMATION VARIANTS (Giữ nguyên) ---
const searchVariants = {
  hidden: { opacity: 0, scale: 0.98, y: -4 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "tween", duration: 0.15, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: -4,
    transition: { type: "tween", duration: 0.1, ease: "easeIn" },
  },
};

const suggestionContainerVariants = {
  hidden: { opacity: 0, scale: 0.98, y: -8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "tween",
      duration: 0.15,
      ease: "easeOut",
      staggerChildren: 0.01,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: -8,
    transition: { type: "tween", duration: 0.1, ease: "easeIn" },
  },
};

const suggestionItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (index) => ({
    opacity: 1,
    x: 0,
    transition: { type: "tween", duration: 0.1, delay: index * 0.01 },
  }),
  exit: { opacity: 0, x: -10, transition: { type: "tween", duration: 0.05 } },
};

const loadingSpinnerVariants = {
  animate: {
    rotate: 360,
    transition: { duration: 1, repeat: Infinity, ease: "linear" },
  },
};

const mobileSearchVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.1 } },
};

const mobileMenuVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2, staggerChildren: 0.02 },
  },
  exit: { opacity: 0, x: -50, transition: { duration: 0.15 } },
};

const menuItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.1 } },
  exit: { opacity: 0, x: -10, transition: { duration: 0.05 } },
};

// --- COMPONENT: SUGGESTIONS LIST (Tách ra ngoài để tránh định nghĩa lại) ---
const SuggestionsList = memo(
  ({
    suggestions,
    isLoadingSuggestions,
    selectedIndex,
    onSuggestionClick,
    isMobile = false,
  }) => {
    const allSuggestions = useMemo(
      () => [
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
      ],
      [suggestions]
    );

    if (!isLoadingSuggestions && allSuggestions.length === 0) return null;

    return (
      <motion.div
        className="absolute left-0 right-0 rounded-xl shadow-2xl max-h-80 overflow-hidden bg-black/95 border border-white/20"
        style={{
          top: "100%",
          marginTop: "8px",
          zIndex: 999,
          width: isMobile ? "100%" : "420px",
          maxWidth: "90vw",
        }}
        variants={suggestionContainerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="overflow-y-auto max-h-80 custom-scrollbar">
          {isLoadingSuggestions ? (
            <div className="p-6 text-center text-white/90">
              <motion.div
                className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full mx-auto mb-3"
                variants={loadingSpinnerVariants}
                animate="animate"
              />
              <span className="text-sm font-medium">Đang tìm kiếm...</span>
            </div>
          ) : (
            <div className="py-2">
              {allSuggestions.map((suggestion, index) => {
                const IconComponent = suggestion.icon;
                const isSelected = index === selectedIndex;
                return (
                  <motion.div
                    key={`${suggestion.type}-${suggestion.text}-${index}`}
                    className={`flex items-center px-4 py-3 cursor-pointer transition-colors duration-150
                  ${
                    isSelected
                      ? "bg-white/15 border-l-4 border-white text-white"
                      : "text-white/90 border-l-4 border-transparent hover:bg-white/10"
                  }`}
                    variants={suggestionItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    custom={index}
                    onClick={() => onSuggestionClick(suggestion.text)}
                    onMouseDown={(e) => e.preventDefault()} // Ngăn mất focus input
                  >
                    <div className="mr-3">
                      <IconComponent className="w-5 h-5 opacity-80" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {suggestion.text}
                      </div>
                      <div className="text-xs opacity-70">
                        {suggestion.label}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    );
  }
);

// --- COMPONENT: CLOCK WIDGET (Tách riêng để Header không bị render lại mỗi giây) ---
const ClockWidget = memo(({ themeClasses }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [listenTime, setListenTime] = useState(0);
  const [showClock, setShowClock] = useState(true);

  useEffect(() => {
    const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
    const listenId = setInterval(() => setListenTime((prev) => prev + 1), 1000);
    return () => {
      clearInterval(timerId);
      clearInterval(listenId);
    };
  }, []);

  const formatListenTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds]
      .map((val) => val.toString().padStart(2, "0"))
      .join(":");
  };

  return (
    <motion.button
      onClick={() => setShowClock((prev) => !prev)}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-full
        bg-${themeClasses.primary}-600/60 hover:bg-${themeClasses.secondary}-600/80
        border border-${themeClasses.primary}-400/30
        text-white backdrop-blur-sm transition-all duration-150
        relative overflow-hidden group w-[120px] justify-center
      `}
      title={showClock ? "Hiển thị đồng hồ" : "Hiển thị giờ đã nghe"}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <AnimatePresence mode="wait">
        {showClock ? (
          <motion.div
            key="clock"
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
          >
            <IconClock className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium font-mono tracking-wider">
              {currentTime.toLocaleTimeString("en-GB")}
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="timer"
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
          >
            <IconHeadphones className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium font-mono tracking-wider">
              {formatListenTime(listenTime)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
});

// --- COMPONENT: SEARCH BAR (Tách logic Search ra khỏi Header) ---
const SearchBar = memo(
  ({ themeClasses, onSearch, isMobile = false, closeMobileSearch }) => {
    const [searchText, setSearchText] = useState("");
    const [suggestions, setSuggestions] = useState({ songs: [], singers: [] });
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const searchInputRef = useRef(null);
    const searchTimeoutRef = useRef(null);
    const isUnmountedRef = useRef(false);

    useEffect(() => {
      return () => {
        isUnmountedRef.current = true;
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      };
    }, []);

    const fetchSuggestions = useCallback(async (query) => {
      if (!query.trim() || query.length < 2 || isUnmountedRef.current) {
        setSuggestions({ songs: [], singers: [] });
        setShowSuggestions(false);
        return;
      }
      setIsLoadingSuggestions(true);
      try {
        const response = await getSearchSuggestions(query, 6);
        if (!isUnmountedRef.current) {
          setSuggestions(response.data.suggestions);
          setShowSuggestions(true);
          setSelectedSuggestionIndex(-1);
        }
      } catch (error) {
        if (!isUnmountedRef.current) {
          setSuggestions({ songs: [], singers: [] });
          setShowSuggestions(false);
        }
      } finally {
        if (!isUnmountedRef.current) setIsLoadingSuggestions(false);
      }
    }, []);

    const handleInputChange = (e) => {
      const value = e.target.value;
      setSearchText(value);
      setSelectedSuggestionIndex(-1);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(() => fetchSuggestions(value), 300);
    };

    const executeSearch = async (query) => {
      if (!query || !query.trim() || isSearching) return;
      setIsSearching(true);
      setShowSuggestions(false);

      // Gọi callback lên Header để chuyển trang
      await onSearch(query, () => setIsSearching(false));

      if (isMobile && closeMobileSearch) closeMobileSearch();
      if (searchInputRef.current) searchInputRef.current.blur();
    };

    const handleSuggestionClick = (text) => {
      setSearchText(text);
      executeSearch(text);
    };

    const handleKeyDown = (e) => {
      const all = [
        ...suggestions.songs.map((s) => ({ text: s })),
        ...suggestions.singers.map((s) => ({ text: s })),
      ];
      if (!showSuggestions || all.length === 0) {
        if (e.key === "Enter") {
          e.preventDefault();
          executeSearch(searchText);
        }
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < all.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev > 0 ? prev - 1 : all.length - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (selectedSuggestionIndex >= 0)
          handleSuggestionClick(all[selectedSuggestionIndex].text);
        else executeSearch(searchText);
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    };

    // Click outside logic
    useEffect(() => {
      const handleClickOutside = (e) => {
        if (
          searchInputRef.current &&
          !searchInputRef.current.parentElement.contains(e.target)
        ) {
          setShowSuggestions(false);
        }
      };
      if (showSuggestions)
        document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [showSuggestions]);

    // UI của Desktop và Mobile input hơi khác nhau về container, xử lý bên dưới
    if (isMobile) {
      return (
        <div className="flex-1 relative">
          <motion.div
            className={`
                    bg-${themeClasses.card} border border-${themeClasses.border}
                    shadow-lg shadow-${themeClasses.primary}-500/25
                    px-4 py-2 rounded-full flex items-center backdrop-blur-md
                    relative transition-all duration-200
                `}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
          >
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Tìm kiếm bài hát..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-white/70"
              value={searchText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => searchText.length >= 2 && setShowSuggestions(true)}
              autoFocus
              autoComplete="off"
            />
            <motion.button
              onClick={() => executeSearch(searchText)}
              disabled={isSearching || !searchText.trim()}
              className={`ml-2 p-1 rounded-full ${
                isSearching ? "opacity-50" : "hover:bg-white/10"
              }`}
            >
              {isSearching ? (
                <motion.div
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  variants={loadingSpinnerVariants}
                  animate="animate"
                />
              ) : (
                <IconSearch stroke={2} className="w-4 h-4 text-white" />
              )}
            </motion.button>
            <AnimatePresence>
              {showSuggestions && (
                <SuggestionsList
                  suggestions={suggestions}
                  isLoadingSuggestions={isLoadingSuggestions}
                  selectedIndex={selectedSuggestionIndex}
                  onSuggestionClick={handleSuggestionClick}
                  isMobile={true}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      );
    }

    // Desktop UI
    return (
      <div className="hidden md:flex flex-1 flex-row items-center max-w-md mx-4 relative">
        <motion.div
          className={`
            flex flex-1 flex-row items-center rounded-full
            bg-${themeClasses.card} border border-${themeClasses.border} 
            shadow-lg shadow-${themeClasses.primary}-500/25
            backdrop-blur-md px-4 py-2
            relative transition-all duration-200
            `}
          whileHover={{ scale: 1.01 }}
        >
          <IconSearch
            stroke={2}
            className="w-5 h-5 cursor-pointer text-white hover:text-white/80 transition-colors duration-150 mr-2"
            onClick={() => executeSearch(searchText)}
          />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Tìm kiếm bài hát..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-white/70"
            value={searchText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => searchText.length >= 2 && setShowSuggestions(true)}
            autoComplete="off"
          />
          <AnimatePresence>
            {isSearching && (
              <motion.div
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full ml-2"
                variants={loadingSpinnerVariants}
                animate="animate"
                exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>
        </motion.div>
        <AnimatePresence>
          {showSuggestions && (
            <SuggestionsList
              suggestions={suggestions}
              isLoadingSuggestions={isLoadingSuggestions}
              selectedIndex={selectedSuggestionIndex}
              onSuggestionClick={handleSuggestionClick}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }
);

// --- MAIN COMPONENT: HEADER ---
const Header = ({ setCurrentView, setListSongsDetail }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const { theme, setShowThemeSelector } = useTheme();

  // Memoize theme classes để tránh render lại
  const themeClasses = useMemo(
    () => ({
      background: theme.colors.background,
      card: theme.colors.card,
      border: theme.colors.border,
      primary: theme.colors.primary,
      secondary: theme.colors.secondary,
      gradient: theme.colors.gradient,
    }),
    [theme.colors]
  );

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  }, [navigate]);

  // Logic chuyển trang khi search (được gọi từ SearchBar)
  const handleSearchNavigation = useCallback(
    async (query, onComplete) => {
      try {
        setListSongsDetail({
          songs: [],
          title: `Đang tìm kiếm: ${query}`,
          subtitle: "Tìm kiếm bài hát và nghệ sĩ",
          searchQuery: query,
          isLoading: true,
        });
        setCurrentView("listSongs");

        const response = await searchSongs(query, 1, 50);

        const subtitle =
          response.data.results && response.data.results.length > 0
            ? `Tìm thấy ${response.data.results.length} kết quả`
            : "Không tìm thấy kết quả";

        setListSongsDetail({
          songs: response.data.results || [],
          title: `Tìm kiếm: "${query}"`,
          subtitle: subtitle,
          searchQuery: query,
          totalResults: response.data.count || 0,
          isLoading: false,
        });
      } catch (error) {
        setListSongsDetail({
          songs: [],
          title: `Lỗi tìm kiếm: "${query}"`,
          subtitle: "Vui lòng thử lại.",
          searchQuery: query,
          isLoading: false,
        });
      } finally {
        if (onComplete) onComplete();
      }
    },
    [setCurrentView, setListSongsDetail]
  );

  return (
    <>
      <motion.div
        className={`
          relative flex h-16 md:h-20 flex-row items-center text-white 
          bg-gradient-to-r ${themeClasses.background}
          px-4 md:px-6 backdrop-blur-lg border-b border-white/20
          shadow-lg shadow-${themeClasses.primary}-500/20
        `}
        style={{ zIndex: 1000 }}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-1 flex-row items-center relative z-10">
          {/* Logo */}
          <motion.div
            className="relative group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <img
              className="h-8 md:h-12 cursor-pointer mr-3 md:mr-4 drop-shadow-lg"
              src="https://yzfbdwvbybecxhbitkmc.supabase.co/storage/v1/object/sign/image/78ed005b-b0aa-427b-bc0d-6f1efb29e653.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82OTc4ZGU2My0wOWQzLTRhYmYtOWRjZC0wZjY0NTBlN2VlYmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS83OGVkMDA1Yi1iMGFhLTQyN2ItYmMwZC02ZjFlZmIyOWU2NTMucG5nIiwiaWF0IjoxNzU0MTM1Mzk4LCJleHAiOjIwNjk0OTUzOTh9.MxsdoFIdkMKWNqhTMN5PTDT2k_K-ELn-q7OzxBEF9PM"
              onClick={() => setCurrentView("main")}
              alt="Logo"
            />
          </motion.div>

          <div className="flex items-center gap-2">
            <h4
              className={`text-2xl font-extrabold bg-gradient-to-r ${themeClasses.gradient} text-transparent bg-clip-text drop-shadow-md`}
            >
              UIAMusic
            </h4>

            {/* Home button */}
            <motion.button
              className={`bg-${themeClasses.primary}-600/60 hover:bg-${themeClasses.secondary}-600/80 border border-${themeClasses.primary}-400/30 shadow-lg shadow-${themeClasses.primary}-500/25 cursor-pointer w-8 h-8 md:w-10 md:h-10 p-2 rounded-full backdrop-blur-sm transition-colors duration-150`}
              onClick={() => setCurrentView("main")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <IconHome stroke={2} className="w-full h-full text-white" />
            </motion.button>

            {/* Mobile Theme Button */}
            <motion.button
              className={`md:hidden w-8 h-8 cursor-pointer rounded-full bg-${themeClasses.primary}-600/60 hover:bg-${themeClasses.secondary}-600/80 border border-${themeClasses.primary}-400/30 flex items-center justify-center`}
              onClick={() => setShowThemeSelector(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <IconPalette stroke={2} className="w-5 h-5 text-white" />
            </motion.button>
          </div>

          {/* DESKTOP SEARCH COMPONENT (Đã tách riêng) */}
          <SearchBar
            themeClasses={themeClasses}
            onSearch={handleSearchNavigation}
          />

          {/* Mobile Search Icon */}
          <motion.button
            className={`md:hidden w-8 h-8 cursor-pointer ml-auto mr-3 rounded-full bg-${themeClasses.primary}-600/60 hover:bg-${themeClasses.secondary}-600/80 border border-${themeClasses.primary}-400/30 shadow-lg shadow-${themeClasses.primary}-500/25 flex items-center justify-center`}
            onClick={() => setShowMobileSearch(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <IconSearch stroke={2} className="w-5 h-5 text-white" />
          </motion.button>
        </div>

        {/* Desktop Menu */}
        <motion.div
          className="hidden md:flex flex-row items-center gap-4 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.1 }}
        >
          {/* CLOCK WIDGET (Đã tách riêng) */}
          <ClockWidget themeClasses={themeClasses} />

          {/* Theme Button */}
          <motion.button
            onClick={() => setShowThemeSelector(true)}
            className={`flex items-center gap-2 px-3 py-2 rounded-full bg-${themeClasses.primary}-600/60 hover:bg-${themeClasses.secondary}-600/80 border border-${themeClasses.primary}-400/30 text-white backdrop-blur-sm relative overflow-hidden group`}
            title="Thay đổi chủ đề"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <IconPalette className="w-5 h-5" />
            <span className="text-sm font-medium hidden lg:block">Chủ đề</span>
          </motion.button>

          {user ? (
            <>
              <motion.div
                className="relative group"
                whileHover={{ scale: 1.05 }}
              >
                <img
                  src={user.avatar || "https://via.placeholder.com/32"}
                  alt="User"
                  className="w-8 h-8 rounded-full border-2 border-white/30 hover:border-white/60"
                />
              </motion.div>
              <motion.span
                className="text-sm font-bold text-white cursor-pointer hover:text-white/80"
                onClick={() => setShowProfilePopup(!showProfilePopup)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {user.first_name || "User"}
              </motion.span>
              <motion.button
                onClick={handleLogout}
                className="flex items-center text-sm font-bold text-white cursor-pointer hover:text-white/80"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <IconLogout stroke={2} className="w-5 h-5 mr-1" />
                Đăng xuất
              </motion.button>
            </>
          ) : (
            <Link to="/signup">
              <motion.span
                className="text-sm font-bold text-white cursor-pointer hover:text-white/80"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Đăng nhập
              </motion.span>
            </Link>
          )}
        </motion.div>

        {/* Mobile Menu Button */}
        <motion.button
          className={`md:hidden w-10 h-10 cursor-pointer rounded-full bg-${themeClasses.primary}-600/60 hover:bg-${themeClasses.secondary}-600/80 border border-${themeClasses.primary}-400/30 shadow-lg shadow-${themeClasses.primary}-500/25 flex items-center justify-center relative z-20`}
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div animate={{ rotate: showMobileMenu ? 90 : 0 }}>
            <IconMenu2 stroke={2} className="w-6 h-6 text-white" />
          </motion.div>
        </motion.button>
      </motion.div>

      {/* Mobile Search Modal */}
      <AnimatePresence>
        {showMobileSearch && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-[100001] md:hidden"
            variants={mobileSearchVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              className={`bg-gradient-to-b ${themeClasses.background}Overlay p-4 backdrop-blur-lg border-b border-white/20 relative`}
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              exit={{ y: -50 }}
            >
              <div className="flex items-center mb-4">
                <motion.button
                  className="w-8 h-8 cursor-pointer rounded-full bg-white/20 flex items-center justify-center mr-3 hover:bg-white/30"
                  onClick={() => setShowMobileSearch(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <IconX stroke={2} className="w-5 h-5 text-white" />
                </motion.button>

                {/* MOBILE SEARCH COMPONENT (Reused logic) */}
                <SearchBar
                  themeClasses={themeClasses}
                  onSearch={handleSearchNavigation}
                  isMobile={true}
                  closeMobileSearch={() => setShowMobileSearch(false)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-[100000] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMobileMenu(false)}
          >
            <motion.div
              className={`bg-gradient-to-b ${themeClasses.background}Overlay h-full w-64 p-4 backdrop-blur-lg border-r border-white/20`}
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="flex items-center justify-between mb-6"
                variants={menuItemVariants}
              >
                <h2 className="text-lg font-bold text-white">Menu</h2>
                <motion.button
                  className="w-8 h-8 cursor-pointer rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30"
                  onClick={() => setShowMobileMenu(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <IconX stroke={2} className="w-5 h-5 text-white" />
                </motion.button>
              </motion.div>

              <div className="flex flex-col space-y-4">
                <motion.button
                  onClick={() => {
                    setShowThemeSelector(true);
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center p-3 text-sm font-bold text-white cursor-pointer rounded-lg backdrop-blur-sm border border-white/20 hover:bg-white/20"
                  variants={menuItemVariants}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <IconPalette stroke={2} className="w-5 h-5 mr-3" />
                  Thay đổi chủ đề
                </motion.button>

                {user ? (
                  <>
                    <motion.div
                      className="flex items-center p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20"
                      variants={menuItemVariants}
                    >
                      <img
                        src={user.avatar || "https://via.placeholder.com/32"}
                        alt="User"
                        className="w-8 h-8 rounded-full mr-3 border border-white/30"
                      />
                      <span className="text-sm font-bold text-white">
                        {user.first_name || "User"}
                      </span>
                    </motion.div>
                    <motion.button
                      onClick={() => {
                        handleLogout();
                        setShowMobileMenu(false);
                      }}
                      className="flex items-center p-3 text-sm font-bold text-white cursor-pointer rounded-lg backdrop-blur-sm border border-white/20 hover:bg-white/20"
                      variants={menuItemVariants}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <IconLogout stroke={2} className="w-5 h-5 mr-3" />
                      Đăng xuất
                    </motion.button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setShowMobileMenu(false)}>
                    <motion.span
                      className="block p-3 text-sm font-bold bg-white/20 text-white rounded-lg cursor-pointer text-center border border-white/30 hover:bg-white/30"
                      variants={menuItemVariants}
                    >
                      Đăng nhập
                    </motion.span>
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Popup - Uncomment nếu cần */}
      {/* <AnimatePresence>
        {showProfilePopup && <ProfilePopup user={user} onClose={() => setShowProfilePopup(false)} />}
      </AnimatePresence> */}
    </>
  );
};

export default memo(Header);
