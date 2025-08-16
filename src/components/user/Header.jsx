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
import { memo, useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useSpring,
  useTransform,
  useMotionValue,
} from "framer-motion";
import { searchSongs, getSearchSuggestions } from "../../services/SongsService";
import ProfilePopup from "./ProfilePopup";
import React from "react";
import { useTheme } from "../../context/themeContext.js";

// Optimized animation variants - reduced complexity
const searchVariants = {
  hidden: {
    opacity: 0,
    scale: 0.98,
    y: -4,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "tween",
      duration: 0.15,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: -4,
    transition: {
      type: "tween",
      duration: 0.1,
      ease: "easeIn",
    },
  },
};

const suggestionContainerVariants = {
  hidden: {
    opacity: 0,
    scale: 0.98,
    y: -8,
  },
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
    transition: {
      type: "tween",
      duration: 0.1,
      ease: "easeIn",
    },
  },
};

const suggestionItemVariants = {
  hidden: {
    opacity: 0,
    x: -10,
  },
  visible: (index) => ({
    opacity: 1,
    x: 0,
    transition: {
      type: "tween",
      duration: 0.1,
      delay: index * 0.01,
    },
  }),
  exit: {
    opacity: 0,
    x: -10,
    transition: {
      type: "tween",
      duration: 0.05,
    },
  },
};

// Simplified loading spinner
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

// Simplified mobile variants
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

const Header = ({ setCurrentView, setListSongsDetail }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const { theme, setShowThemeSelector } = useTheme();

  // Enhanced search states
  const [suggestions, setSuggestions] = useState({ songs: [], singers: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Refs
  const searchInputRef = useRef(null);
  const mobileSearchInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const mobileSuggestionsRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const isUnmountedRef = useRef(false);

  // Optimized motion values
  const searchOpacity = useMotionValue(1);
  const suggestionOpacity = useMotionValue(0);

  // Memoized theme classes
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
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    return () => {
      isUnmountedRef.current = true;
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  }, [navigate]);

  // Optimized debounced fetch suggestions
  const fetchSuggestions = useCallback(
    async (query) => {
      if (!query.trim() || query.length < 2 || isUnmountedRef.current) {
        setSuggestions({ songs: [], singers: [] });
        setShowSuggestions(false);
        suggestionOpacity.set(0);
        return;
      }

      setIsLoadingSuggestions(true);
      suggestionOpacity.set(1);

      try {
        const response = await getSearchSuggestions(query, 6); // Reduced from 8 to 6
        if (!isUnmountedRef.current) {
          setSuggestions(response.data.suggestions);
          setShowSuggestions(true);
          setSelectedSuggestionIndex(-1);
        }
      } catch (error) {
        if (!isUnmountedRef.current) {
          console.error("Error fetching suggestions:", error);
          setSuggestions({ songs: [], singers: [] });
          setShowSuggestions(false);
        }
      } finally {
        if (!isUnmountedRef.current) {
          setIsLoadingSuggestions(false);
        }
      }
    },
    [suggestionOpacity]
  );

  // Optimized search input change with better debouncing
  const handleSearchInputChange = useCallback(
    (value) => {
      setSearchText(value);
      setSelectedSuggestionIndex(-1);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Longer debounce for better performance
      searchTimeoutRef.current = setTimeout(() => {
        if (!isUnmountedRef.current) {
          fetchSuggestions(value);
        }
      }, 300); // Increased from 200ms to 300ms
    },
    [fetchSuggestions]
  );

  // Optimized search execution
  const handleSearchChange = useCallback(
    async (searchQuery = searchText) => {
      const query = searchQuery.trim();
      if (!query || isSearching) return;

      setIsSearching(true);
      searchOpacity.set(0.7);

      try {
        const loadingData = {
          songs: [],
          title: `Đang tìm kiếm: ${query}`,
          subtitle: "Tìm kiếm bài hát và nghệ sĩ",
          searchQuery: query,
          isLoading: true,
        };
        setListSongsDetail(loadingData);
        setCurrentView("listSongs");

        setShowMobileSearch(false);
        setShowSuggestions(false);
        suggestionOpacity.set(0);

        const response = await searchSongs(query, 1, 50);

        if (!isUnmountedRef.current) {
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
        }
      } catch (error) {
        if (!isUnmountedRef.current) {
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
        }
      } finally {
        if (!isUnmountedRef.current) {
          setIsSearching(false);
          searchOpacity.set(1);
        }
      }
    },
    [
      searchText,
      isSearching,
      setListSongsDetail,
      setCurrentView,
      searchOpacity,
      suggestionOpacity,
    ]
  );

  // Optimized suggestion click
  const handleSuggestionClick = useCallback(
    (suggestion) => {
      setSearchText(suggestion);
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
      suggestionOpacity.set(0);
      handleSearchChange(suggestion);
    },
    [handleSearchChange, suggestionOpacity]
  );

  // Optimized keyboard navigation
  const handleKeyDown = useCallback(
    (e) => {
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
          setSelectedSuggestionIndex((prev) =>
            prev < allSuggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedSuggestionIndex((prev) =>
            prev > 0 ? prev - 1 : allSuggestions.length - 1
          );
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
          suggestionOpacity.set(0);
          break;
      }
    },
    [
      suggestions,
      showSuggestions,
      selectedSuggestionIndex,
      handleSearchChange,
      handleSuggestionClick,
      suggestionOpacity,
    ]
  );

  // Optimized click outside handling
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
        setIsSearchFocused(false);
        suggestionOpacity.set(0);
      }
    };

    if (showSuggestions) {
      document.addEventListener("mousedown", handleClickOutside, {
        passive: true,
      });
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showSuggestions, suggestionOpacity]);

  // Optimized Suggestions List Component
  const SuggestionsList = memo(function SuggestionsList({
    suggestions,
    isLoadingSuggestions,
    selectedIndex,
    onSuggestionClick,
    isMobile = false,
  }) {
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
      [suggestions.songs, suggestions.singers]
    );

    if (!isLoadingSuggestions && allSuggestions.length === 0) {
      return null;
    }
    return (
      <motion.div
        ref={isMobile ? mobileSuggestionsRef : suggestionsRef}
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
        <div className="overflow-y-auto max-h-80">
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
                    className={`flex items-center px-4 py-3 cursor-pointer
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
  });

  const toggleProfilePopup = useCallback(() => {
    setShowProfilePopup(!showProfilePopup);
  }, [showProfilePopup]);

  const handleProfileUpdate = useCallback((updatedUser) => {
    setUser(updatedUser);
  }, []);

  const handleMobileMenuToggle = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMobileMenu((prev) => !prev);
  }, []);

  return (
    <>
      {/* Header - Simplified animations and reduced re-renders */}
      <motion.div
        className={`
          relative flex h-16 md:h-20 flex-row items-center text-white 
          bg-gradient-to-r ${themeClasses.background}
          px-4 md:px-6 backdrop-blur-lg border-b border-white/20
          shadow-lg shadow-${themeClasses.primary}-500/20
        `}
        style={{
          zIndex: 1000,
          willChange: "transform",
        }}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="flex flex-1 flex-row items-center relative z-10">
          {/* Logo */}
          <motion.div
            className="relative group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.1 }}
          >
            <img
              className="h-8 md:h-12 cursor-pointer mr-3 md:mr-4 drop-shadow-lg"
              src="https://yzfbdwvbybecxhbitkmc.supabase.co/storage/v1/object/sign/image/78ed005b-b0aa-427b-bc0d-6f1efb29e653.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82OTc4ZGU2My0wOWQzLTRhYmYtOWRjZC0wZjY0NTBlN2VlYmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS83OGVkMDA1Yi1iMGFhLTQyN2ItYmMwZC02ZjFlZmIyOWU2NTMucG5nIiwiaWF0IjoxNzU0MTM1Mzk4LCJleHAiOjIwNjk0OTUzOTh9.MxsdoFIdkMKWNqhTMN5PTDT2k_K-ELn-q7OzxBEF9PM"
              onClick={() => setCurrentView("main")}
              loading="lazy"
            />
          </motion.div>

          <div className="flex items-center gap-2">
            {/* Title */}
            <h4
              className={`
                text-2xl font-extrabold bg-gradient-to-r ${themeClasses.gradient} 
                text-transparent bg-clip-text drop-shadow-md
              `}
            >
              UIAMusic
            </h4>

            {/* Home button */}
            <motion.button
              className={`
                bg-${themeClasses.primary}-600/60 hover:bg-${themeClasses.secondary}-600/80 
                border border-${themeClasses.primary}-400/30 shadow-lg shadow-${themeClasses.primary}-500/25
                cursor-pointer w-8 h-8 md:w-10 md:h-10 p-2 rounded-full 
                backdrop-blur-sm transition-colors duration-150
              `}
              onClick={() => setCurrentView("main")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.1 }}
            >
              <IconHome stroke={2} className="w-full h-full text-white" />
            </motion.button>

            {/* Theme Button for Mobile */}
            <motion.button
              className={`
                bg-${themeClasses.primary}-600/60 hover:bg-${themeClasses.secondary}-600/80 
                border border-${themeClasses.primary}-400/30
                md:hidden w-8 h-8 cursor-pointer rounded-full 
                flex items-center justify-center transition-colors duration-150
              `}
              onClick={() => setShowThemeSelector(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.1 }}
            >
              <IconPalette stroke={2} className="w-5 h-5 text-white" />
            </motion.button>
          </div>

          {/* Desktop Search - Optimized */}
          <div className="hidden md:flex flex-1 flex-row items-center max-w-md mx-4 relative">
            <motion.div
              className={`
                flex flex-1 flex-row items-center rounded-full
                bg-${themeClasses.card} border border-${themeClasses.border} 
                shadow-lg shadow-${themeClasses.primary}-500/25
                backdrop-blur-md px-4 py-2
                relative transition-all duration-200
              `}
              style={{ willChange: "transform" }}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.15 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
              >
                <IconSearch
                  stroke={2}
                  className="w-5 h-5 cursor-pointer text-white hover:text-white/80 transition-colors duration-150"
                  onClick={() => handleSearchChange()}
                />
              </motion.div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Tìm kiếm bài hát..."
                className="flex-1 mx-2 bg-transparent border-none outline-none text-sm text-white placeholder-white/70"
                value={searchText}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  setIsSearchFocused(true);
                  if (searchText.length >= 2) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => {
                  setTimeout(() => setIsSearchFocused(false), 150);
                }}
                disabled={isSearching}
                autoComplete="off"
                spellCheck="false"
              />
              <AnimatePresence>
                {isSearching && (
                  <motion.div
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    variants={loadingSpinnerVariants}
                    animate="animate"
                    initial={{ opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                  />
                )}
              </AnimatePresence>
            </motion.div>

            {/* Desktop Suggestions */}
            <AnimatePresence>
              {showSuggestions && !showMobileSearch && (
                <SuggestionsList
                  suggestions={suggestions}
                  isLoadingSuggestions={isLoadingSuggestions}
                  selectedIndex={selectedSuggestionIndex}
                  onSuggestionClick={handleSuggestionClick}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Search Icon */}
          <motion.button
            className={`
              md:hidden w-8 h-8 cursor-pointer ml-auto mr-3 rounded-full
              bg-${themeClasses.primary}-600/60 hover:bg-${themeClasses.secondary}-600/80
              border border-${themeClasses.primary}-400/30 shadow-lg shadow-${themeClasses.primary}-500/25
              flex items-center justify-center transition-colors duration-150
            `}
            onClick={() => setShowMobileSearch(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.1 }}
          >
            <IconSearch stroke={2} className="w-5 h-5 text-white" />
          </motion.button>
        </div>

        {/* Desktop Menu - Simplified */}
        <motion.div
          className="hidden md:flex flex-row items-center gap-4 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.1 }}
        >
          {/* Theme Button */}
          <motion.button
            onClick={() => setShowThemeSelector(true)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-full
              bg-${themeClasses.primary}-600/60 hover:bg-${themeClasses.secondary}-600/80
              border border-${themeClasses.primary}-400/30
              text-white backdrop-blur-sm transition-all duration-150
              relative overflow-hidden group
            `}
            title="Thay đổi chủ đề"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.1 }}
          >
            <IconPalette className="w-5 h-5" />
            <span className="text-sm font-medium hidden lg:block">Chủ đề</span>
          </motion.button>

          {user ? (
            <>
              <motion.div
                className="relative group"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.1 }}
              >
                <img
                  src={user.avatar || "https://via.placeholder.com/32"}
                  alt="User avatar"
                  className="w-8 h-8 rounded-full border-2 border-white/30 hover:border-white/60 transition-all duration-200"
                  loading="lazy"
                />
              </motion.div>
              <motion.span
                className="text-sm font-bold text-white cursor-pointer transition-colors duration-150 hover:text-white/80"
                onClick={toggleProfilePopup}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.1 }}
              >
                {user.first_name || "User"}
              </motion.span>
              <motion.button
                onClick={handleLogout}
                className="flex items-center text-sm font-bold text-white cursor-pointer transition-colors duration-150 hover:text-white/80"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.1 }}
              >
                <IconLogout stroke={2} className="w-5 h-5 mr-1" />
                Đăng xuất
              </motion.button>
            </>
          ) : (
            <>
              <Link to="/signup">
                <motion.span
                  className="text-sm font-bold text-white cursor-pointer transition-colors duration-150 hover:text-white/80"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.1 }}
                >
                  Đăng nhập
                </motion.span>
              </Link>
            </>
          )}
        </motion.div>

        {/* Mobile Menu Button */}
        <motion.button
          className={`
            md:hidden w-10 h-10 cursor-pointer rounded-full
            bg-${themeClasses.primary}-600/60 hover:bg-${themeClasses.secondary}-600/80
            border border-${themeClasses.primary}-400/30 shadow-lg shadow-${themeClasses.primary}-500/25
            flex items-center justify-center transition-colors duration-150
            relative z-20
            touch-manipulation
          `}
          onClick={handleMobileMenuToggle}
          aria-label="Open mobile menu"
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.1 }}
        >
          <motion.div
            animate={{ rotate: showMobileMenu ? 90 : 0 }}
            transition={{ duration: 0.15 }}
          >
            <IconMenu2
              stroke={2}
              className="w-6 h-6 text-white pointer-events-none"
            />
          </motion.div>
        </motion.button>
      </motion.div>

      {/* Mobile Search Modal - Optimized */}
      <AnimatePresence>
        {showMobileSearch && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-[100001] md:hidden"
            variants={mobileSearchVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ willChange: "opacity" }}
          >
            <motion.div
              className={`bg-gradient-to-b ${themeClasses.background}Overlay p-4 backdrop-blur-lg border-b border-white/20 relative`}
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              exit={{ y: -50 }}
              transition={{ duration: 0.15 }}
            >
              <div className="flex items-center mb-4">
                <motion.button
                  className="w-8 h-8 cursor-pointer rounded-full bg-white/20 flex items-center justify-center mr-3 transition-colors duration-150 hover:bg-white/30"
                  onClick={() => {
                    setShowMobileSearch(false);
                    setShowSuggestions(false);
                    setSearchText("");
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                >
                  <IconX stroke={2} className="w-5 h-5 text-white" />
                </motion.button>

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
                    transition={{ duration: 0.1 }}
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
                      autoComplete="off"
                      spellCheck="false"
                    />
                    <motion.button
                      onClick={() => handleSearchChange()}
                      disabled={isSearching || !searchText.trim()}
                      className={`
                        ml-2 p-1 rounded-full transition-colors duration-150
                        ${
                          isSearching || !searchText.trim()
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer hover:bg-white/10"
                        }
                      `}
                      whileHover={
                        !isSearching && searchText.trim() ? { scale: 1.05 } : {}
                      }
                      whileTap={
                        !isSearching && searchText.trim() ? { scale: 0.95 } : {}
                      }
                      transition={{ duration: 0.1 }}
                    >
                      <AnimatePresence mode="wait">
                        {isSearching ? (
                          <motion.div
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                            variants={loadingSpinnerVariants}
                            animate="animate"
                            initial={{ opacity: 0 }}
                            exit={{ opacity: 0 }}
                          />
                        ) : (
                          <motion.div
                            key="search"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.1 }}
                          >
                            <IconSearch
                              stroke={2}
                              className="w-4 h-4 text-white"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>

                    {/* Mobile Suggestions */}
                    <AnimatePresence>
                      {showSuggestions && (
                        <SuggestionsList
                          suggestions={suggestions}
                          isLoadingSuggestions={isLoadingSuggestions}
                          selectedIndex={selectedSuggestionIndex}
                          onSuggestionClick={(text) => {
                            handleSuggestionClick(text);
                            setShowMobileSearch(false);
                          }}
                          isMobile={true}
                        />
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu - Optimized */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-[100000] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setShowMobileMenu(false)}
            style={{ willChange: "opacity" }}
          >
            <motion.div
              className={`bg-gradient-to-b ${themeClasses.background}Overlay h-full w-64 p-4 backdrop-blur-lg border-r border-white/20`}
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              style={{ willChange: "transform" }}
            >
              <motion.div
                className="flex items-center justify-between mb-6"
                variants={menuItemVariants}
              >
                <h2 className="text-lg font-bold text-white">Menu</h2>
                <motion.button
                  className="w-8 h-8 cursor-pointer rounded-full bg-white/20 flex items-center justify-center transition-colors duration-150 hover:bg-white/30"
                  onClick={() => setShowMobileMenu(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.1 }}
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
                  className="flex items-center p-3 text-sm font-bold text-white cursor-pointer rounded-lg backdrop-blur-sm border border-white/20 transition-colors duration-150 hover:bg-white/20"
                  variants={menuItemVariants}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.1 }}
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
                        alt="User avatar"
                        className="w-8 h-8 rounded-full mr-3 border border-white/30"
                        loading="lazy"
                      />
                      <motion.span
                        className="text-sm font-bold text-white cursor-pointer transition-colors duration-150 hover:text-white/80"
                        onClick={() => {
                          toggleProfilePopup();
                          setShowMobileMenu(false);
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.1 }}
                      >
                        {user.first_name || "User"}
                      </motion.span>
                    </motion.div>
                    <motion.button
                      onClick={() => {
                        handleLogout();
                        setShowMobileMenu(false);
                      }}
                      className="flex items-center p-3 text-sm font-bold text-white cursor-pointer rounded-lg backdrop-blur-sm border border-white/20 transition-colors duration-150 hover:bg-white/20"
                      variants={menuItemVariants}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      transition={{ duration: 0.1 }}
                    >
                      <IconLogout stroke={2} className="w-5 h-5 mr-3" />
                      Đăng xuất
                    </motion.button>
                  </>
                ) : (
                  <>
                    <Link to="/signup" onClick={() => setShowMobileMenu(false)}>
                      <motion.span
                        className="block p-3 text-sm font-bold text-white cursor-pointer rounded-lg backdrop-blur-sm border border-white/20 transition-colors duration-150 hover:bg-white/20"
                        variants={menuItemVariants}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        transition={{ duration: 0.1 }}
                      >
                        Đăng ký
                      </motion.span>
                    </Link>
                    <Link to="/login" onClick={() => setShowMobileMenu(false)}>
                      <motion.span
                        className="block p-3 text-sm font-bold bg-white/20 text-white rounded-lg cursor-pointer text-center backdrop-blur-sm border border-white/30 transition-colors duration-150 hover:bg-white/30"
                        variants={menuItemVariants}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        transition={{ duration: 0.1 }}
                      >
                        Đăng nhập
                      </motion.span>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Popup */}
      <AnimatePresence>
        {showProfilePopup && (
          <ProfilePopup
            user={user}
            onClose={() => setShowProfilePopup(false)}
            onUpdate={handleProfileUpdate}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default memo(Header);
