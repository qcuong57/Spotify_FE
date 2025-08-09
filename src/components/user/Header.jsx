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
import {
  motion,
  AnimatePresence,
  useSpring,
  useTransform,
} from "framer-motion";
import { searchSongs, getSearchSuggestions } from "../../services/SongsService";
import ProfilePopup from "./ProfilePopup";
import React from "react";
import { useTheme } from "../../context/themeContext.js";

// Enhanced animation variants with smooth spring physics
const searchVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: -8,
    filter: "blur(4px)",
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
      mass: 0.8,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -8,
    filter: "blur(4px)",
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 40,
      mass: 0.6,
    },
  },
};

const suggestionContainerVariants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
    y: -12,
    backdropFilter: "blur(0px)",
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    backdropFilter: "blur(20px)",
    transition: {
      type: "spring",
      stiffness: 600,
      damping: 35,
      mass: 0.5,
      staggerChildren: 0.02,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: -12,
    backdropFilter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 700,
      damping: 45,
      mass: 0.4,
      staggerChildren: 0.01,
      staggerDirection: -1,
    },
  },
};

const suggestionItemVariants = {
  hidden: {
    opacity: 0,
    x: -20,
    scale: 0.95,
  },
  visible: (index) => ({
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30,
      mass: 0.6,
      delay: index * 0.015,
    },
  }),
  exit: (index) => ({
    opacity: 0,
    x: -20,
    scale: 0.95,
    transition: {
      type: "spring",
      stiffness: 600,
      damping: 40,
      mass: 0.5,
      delay: index * 0.01,
    },
  }),
  hover: {
    scale: 1.02,
    x: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    transition: {
      type: "spring",
      stiffness: 800,
      damping: 25,
      mass: 0.3,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      type: "spring",
      stiffness: 1000,
      damping: 30,
      mass: 0.2,
    },
  },
};

const loadingSpinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 0.8,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

const searchInputVariants = {
  focus: {
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
      mass: 0.8,
    },
  },
  blur: {
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
      mass: 0.8,
    },
  },
};

const mobileSearchVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    backdropFilter: "blur(0px)",
  },
  visible: {
    opacity: 1,
    scale: 1,
    backdropFilter: "blur(16px)",
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30,
      mass: 0.8,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    backdropFilter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 600,
      damping: 35,
      mass: 0.6,
    },
  },
};

const mobileMenuVariants = {
  hidden: {
    opacity: 0,
    x: -100,
    backdropFilter: "blur(0px)",
  },
  visible: {
    opacity: 1,
    x: 0,
    backdropFilter: "blur(16px)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
      mass: 0.8,
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    x: -100,
    backdropFilter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30,
      mass: 0.6,
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
};

const menuItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 600,
      damping: 25,
      mass: 0.5,
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      type: "spring",
      stiffness: 700,
      damping: 30,
      mass: 0.4,
    },
  },
};

const Header = ({ setCurrentView, setListSongsDetail }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const { theme, setShowThemeSelector } = useTheme();

  // Enhanced search states with better UX
  const [suggestions, setSuggestions] = useState({
    songs: [],
    singers: [],
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Refs for suggestion handling
  const searchInputRef = useRef(null);
  const mobileSearchInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const mobileSuggestionsRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Spring animations for smooth interactions
  const searchScale = useSpring(1);
  const suggestionScale = useSpring(0.96);

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

  // Enhanced fetch suggestions with better debouncing
  const fetchSuggestions = async (query) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions({ songs: [], singers: [] });
      setShowSuggestions(false);
      suggestionScale.set(0.96);
      return;
    }

    setIsLoadingSuggestions(true);
    suggestionScale.set(1);

    try {
      const response = await getSearchSuggestions(query, 8);
      setSuggestions(response.data.suggestions);
      setShowSuggestions(true);
      setSelectedSuggestionIndex(-1);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions({ songs: [], singers: [] });
      setShowSuggestions(false);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Enhanced search input change with smoother debouncing
  const handleSearchInputChange = (value) => {
    setSearchText(value);
    setSelectedSuggestionIndex(-1);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Faster debounce for better UX
    const newTimeout = setTimeout(() => {
      fetchSuggestions(value);
    }, 200);

    setSearchTimeout(newTimeout);
  };

  // Enhanced search execution
  const handleSearchChange = async (searchQuery = searchText) => {
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    searchScale.set(0.98);

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
      suggestionScale.set(0.96);

      const response = await searchSongs(query, 1, 50);

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
      searchScale.set(1);
    }
  };

  // Enhanced suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchText(suggestion);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    suggestionScale.set(0.96);
    handleSearchChange(suggestion);
  };

  // Enhanced keyboard navigation
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
        suggestionScale.set(0.96);
        break;
    }
  };

  // Enhanced click outside handling
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
        suggestionScale.set(0.96);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Enhanced Suggestions List Component
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
      return null;
    }

    return (
      <motion.div
        ref={isMobile ? mobileSuggestionsRef : suggestionsRef}
        className="absolute left-0 right-0 rounded-xl shadow-2xl max-h-80 overflow-hidden bg-black/95 border border-white/20"
        style={{
          position: "absolute",
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
        <div className="overflow-y-auto max-h-80 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {isLoadingSuggestions ? (
            <motion.div
              className="p-6 text-center text-white/90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <motion.div
                className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full mx-auto mb-3"
                variants={loadingSpinnerVariants}
                animate="animate"
              />
              <span className="text-sm font-medium">Đang tìm kiếm...</span>
            </motion.div>
          ) : (
            <div className="py-2">
              {allSuggestions.map((suggestion, index) => {
                const IconComponent = suggestion.icon;
                const isSelected = index === selectedIndex;

                return (
                  <motion.div
                    key={`${suggestion.type}-${suggestion.text}-${index}`}
                    className={`
                      flex items-center px-4 py-3 cursor-pointer
                      ${
                        isSelected
                          ? "bg-white/15 border-l-4 border-white text-white"
                          : "text-white/90 border-l-4 border-transparent"
                      }
                    `}
                    variants={suggestionItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    whileHover="hover"
                    whileTap="tap"
                    custom={index}
                    onClick={() => onSuggestionClick(suggestion.text)}
                  >
                    <motion.div
                      className="mr-3"
                      animate={{
                        rotate: isSelected ? 360 : 0,
                        scale: isSelected ? 1.1 : 1,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                    >
                      <IconComponent className="w-5 h-5 opacity-80" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <motion.div
                        className="text-sm font-medium truncate"
                        animate={{ x: isSelected ? 4 : 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 25,
                        }}
                      >
                        {suggestion.text}
                      </motion.div>
                      <motion.div
                        className="text-xs opacity-70"
                        animate={{
                          opacity: isSelected ? 1 : 0.7,
                          x: isSelected ? 4 : 0,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 25,
                        }}
                      >
                        {suggestion.label}
                      </motion.div>
                    </div>
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          className="w-2 h-2 bg-white rounded-full"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 600,
                            damping: 25,
                          }}
                        />
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
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
    setShowMobileMenu((prev) => !prev);
  };

  return (
    <>
      {/* Header */}
      <motion.div
        className={`
          relative flex h-16 md:h-20 flex-row items-center text-white 
          bg-gradient-to-r ${theme.colors.background}
          px-4 md:px-6 backdrop-blur-lg border-b border-white/20
          shadow-lg shadow-${theme.colors.primary}-500/20
          before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent
        `}
        style={{ zIndex: 1000 }}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
          mass: 0.8,
        }}
      >
        <div className="flex flex-1 flex-row items-center relative z-10">
          {/* Logo */}
          <motion.div
            className="relative group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 15,
            }}
          >
            <img
              className="h-8 md:h-12 cursor-pointer mr-3 md:mr-4 drop-shadow-lg"
              src="https://yzfbdwvbybecxhbitkmc.supabase.co/storage/v1/object/sign/image/78ed005b-b0aa-427b-bc0d-6f1efb29e653.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82OTc4ZGU2My0wOWQzLTRhYmYtOWRjZC0wZjY0NTBlN2VlYmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS83OGVkMDA1Yi1iMGFhLTQyN2ItYmMwZC02ZjFlZmIyOWU2NTMucG5nIiwiaWF0IjoxNzU0MTM1Mzk4LCJleHAiOjIwNjk0OTUzOTh9.MxsdoFIdkMKWNqhTMN5PTDT2k_K-ELn-q7OzxBEF9PM"
              onClick={() => setCurrentView("main")}
            />
          </motion.div>

          <div className="flex items-center gap-2">
            {/* Title */}
            <motion.h4
              className={`
                text-2xl font-extrabold bg-gradient-to-r ${theme.colors.gradient} 
                text-transparent bg-clip-text drop-shadow-md
              `}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: 0.1,
              }}
              whileHover={{ scale: 1.02 }}
            >
              UIAMusic
            </motion.h4>

            {/* Home button */}
            <motion.button
              className={`
                bg-${theme.colors.primary}-600/60 hover:bg-${theme.colors.secondary}-600/80 
                border border-${theme.colors.primary}-400/30 shadow-lg shadow-${theme.colors.primary}-500/25
                cursor-pointer w-8 h-8 md:w-10 md:h-10 p-2 rounded-full 
                backdrop-blur-sm
              `}
              onClick={() => setCurrentView("main")}
              whileHover={{
                scale: 1.1,
                rotate: 12,
                boxShadow: `0 0 20px rgba(147, 51, 234, 0.4)`,
              }}
              whileTap={{ scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 15,
              }}
            >
              <IconHome stroke={2} className="w-full h-full text-white" />
            </motion.button>

            {/* Theme Button for Mobile */}
            <motion.button
              className={`
                bg-${theme.colors.primary}-600/60 hover:bg-${theme.colors.secondary}-600/80 
                border border-${theme.colors.primary}-400/30
                md:hidden w-8 h-8 cursor-pointer rounded-full 
                flex items-center justify-center
              `}
              onClick={() => setShowThemeSelector(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 15,
              }}
            >
              <IconPalette stroke={2} className="w-5 h-5 text-white" />
            </motion.button>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 flex-row items-center max-w-md mx-4 relative">
            <motion.div
              ref={searchContainerRef}
              className={`
                flex flex-1 flex-row items-center rounded-full
                bg-${theme.colors.card} border border-${theme.colors.border} 
                shadow-lg shadow-${theme.colors.primary}-500/25
                backdrop-blur-md px-4 py-2
                relative
              `}
              variants={searchInputVariants}
              animate={isSearchFocused ? "focus" : "blur"}
              whileHover={{ scale: 1.02 }}
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 15,
                }}
              >
                <IconSearch
                  stroke={2}
                  className="w-5 h-5 cursor-pointer text-white hover:text-white/80 transition-colors"
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
              />
              <AnimatePresence>
                {isSearching && (
                  <motion.div
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    variants={loadingSpinnerVariants}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 20,
                    }}
                  />
                )}
              </AnimatePresence>
            </motion.div>

            {/* Desktop Suggestions - positioned outside search container to avoid overflow issues */}
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
              bg-${theme.colors.primary}-600/60 hover:bg-${theme.colors.secondary}-600/80
              border border-${theme.colors.primary}-400/30 shadow-lg shadow-${theme.colors.primary}-500/25
              flex items-center justify-center
            `}
            onClick={() => setShowMobileSearch(true)}
            whileHover={{
              scale: 1.1,
              boxShadow: `0 0 15px rgba(147, 51, 234, 0.4)`,
            }}
            whileTap={{ scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 15,
            }}
          >
            <IconSearch stroke={2} className="w-5 h-5 text-white" />
          </motion.button>
        </div>

        {/* Desktop Menu */}
        <motion.div
          className="hidden md:flex flex-row items-center gap-4 relative z-10"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: 0.2,
          }}
        >
          {/* Theme Button */}
          <motion.button
            onClick={() => setShowThemeSelector(true)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-full
              bg-${theme.colors.primary}-600/60 hover:bg-${theme.colors.secondary}-600/80
              border border-${theme.colors.primary}-400/30
              text-white backdrop-blur-sm
              relative overflow-hidden group
            `}
            title="Thay đổi chủ đề"
            whileHover={{
              scale: 1.05,
              boxShadow: `0 0 20px rgba(147, 51, 234, 0.4)`,
            }}
            whileTap={{ scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 15,
            }}
          >
            <motion.div
              animate={{ rotate: [0, 180, 360] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <IconPalette className="w-5 h-5 z-10" />
            </motion.div>
            <span className="text-sm font-medium hidden lg:block z-10">
              Chủ đề
            </span>
          </motion.button>

          {user ? (
            <>
              <motion.div
                className="relative group"
                whileHover={{ scale: 1.1 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 15,
                }}
              >
                <img
                  src={user.avatar || "https://via.placeholder.com/32"}
                  alt="User avatar"
                  className="w-8 h-8 rounded-full border-2 border-white/30 hover:border-white/60 transition-all duration-300"
                />
              </motion.div>
              <motion.span
                className="text-sm font-bold text-white cursor-pointer"
                onClick={toggleProfilePopup}
                whileHover={{
                  scale: 1.05,
                  color: "rgba(255,255,255,0.8)",
                }}
                whileTap={{ scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 15,
                }}
              >
                {user.first_name || "User"}
              </motion.span>
              <motion.button
                onClick={handleLogout}
                className="flex items-center text-sm font-bold text-white cursor-pointer"
                whileHover={{
                  scale: 1.05,
                  color: "rgba(255,255,255,0.8)",
                }}
                whileTap={{ scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 15,
                }}
              >
                <IconLogout stroke={2} className="w-5 h-5 mr-1" />
                Đăng xuất
              </motion.button>
            </>
          ) : (
            <>
              <Link to="/signup">
                <motion.span
                  className="text-sm font-bold text-white cursor-pointer"
                  whileHover={{
                    scale: 1.05,
                    color: "rgba(255,255,255,0.8)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  Đăng ký
                </motion.span>
              </Link>
              <Link to="/login">
                <motion.span
                  className={`
                    py-2 px-4 rounded-full text-sm cursor-pointer 
                    bg-white/20 hover:bg-white/30 text-white
                    backdrop-blur-sm border border-white/30
                  `}
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "rgba(255,255,255,0.3)",
                    boxShadow: "0 0 15px rgba(255,255,255,0.2)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 15,
                  }}
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
            bg-${theme.colors.primary}-600/60 hover:bg-${theme.colors.secondary}-600/80
            border border-${theme.colors.primary}-400/30 shadow-lg shadow-${theme.colors.primary}-500/25
            flex items-center justify-center
            relative z-20
            touch-manipulation
          `}
          onClick={handleMobileMenuToggle}
          aria-label="Open mobile menu"
          type="button"
          whileHover={{
            scale: 1.1,
            boxShadow: `0 0 20px rgba(147, 51, 234, 0.4)`,
          }}
          whileTap={{ scale: 0.95 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 15,
          }}
        >
          <motion.div
            animate={{ rotate: showMobileMenu ? 180 : 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 20,
            }}
          >
            <IconMenu2
              stroke={2}
              className="w-6 h-6 text-white pointer-events-none"
            />
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
              className={`bg-gradient-to-b ${theme.colors.backgroundOverlay} p-4 backdrop-blur-lg border-b border-white/20 relative`}
              initial={{ y: -100 }}
              animate={{ y: 0 }}
              exit={{ y: -100 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
              }}
            >
              <div className="flex items-center mb-4">
                <motion.button
                  className="w-8 h-8 cursor-pointer rounded-full bg-white/20 flex items-center justify-center mr-3"
                  onClick={() => {
                    setShowMobileSearch(false);
                    setShowSuggestions(false);
                    setSearchText("");
                  }}
                  whileHover={{
                    scale: 1.1,
                    backgroundColor: "rgba(255,255,255,0.3)",
                  }}
                  whileTap={{ scale: 0.9 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 15,
                  }}
                >
                  <IconX stroke={2} className="w-5 h-5 text-white" />
                </motion.button>

                <div className="flex-1 relative">
                  <motion.div
                    className={`
                      bg-${theme.colors.card} border border-${theme.colors.border}
                      shadow-lg shadow-${theme.colors.primary}-500/25
                      px-4 py-2 rounded-full flex items-center backdrop-blur-md
                      relative
                    `}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 20,
                      delay: 0.1,
                    }}
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
                    <motion.button
                      onClick={() => handleSearchChange()}
                      disabled={isSearching || !searchText.trim()}
                      className={`
                        ml-2 p-1 rounded-full transition-colors
                        ${
                          isSearching || !searchText.trim()
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer hover:bg-white/10"
                        }
                      `}
                      whileHover={
                        !isSearching && searchText.trim() ? { scale: 1.1 } : {}
                      }
                      whileTap={
                        !isSearching && searchText.trim() ? { scale: 0.9 } : {}
                      }
                    >
                      <AnimatePresence mode="wait">
                        {isSearching ? (
                          <motion.div
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                            variants={loadingSpinnerVariants}
                            animate="animate"
                            initial={{ opacity: 0, scale: 0 }}
                            exit={{ opacity: 0, scale: 0 }}
                          />
                        ) : (
                          <motion.div
                            key="search"
                            initial={{ opacity: 0, rotate: -90 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: 90 }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 20,
                            }}
                          >
                            <IconSearch
                              stroke={2}
                              className="w-4 h-4 text-white"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>

                    {/* Mobile Suggestions - positioned relative to mobile search container */}
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

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-[100000] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
            }}
            onClick={() => setShowMobileMenu(false)}
          >
            <motion.div
              className={`bg-gradient-to-b ${theme.colors.backgroundOverlay} h-full w-64 p-4 backdrop-blur-lg border-r border-white/20`}
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
                  className="w-8 h-8 cursor-pointer rounded-full bg-white/20 flex items-center justify-center"
                  onClick={() => setShowMobileMenu(false)}
                  whileHover={{
                    scale: 1.1,
                    backgroundColor: "rgba(255,255,255,0.3)",
                  }}
                  whileTap={{ scale: 0.9 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 15,
                  }}
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
                  className="flex items-center p-3 text-sm font-bold text-white cursor-pointer rounded-lg backdrop-blur-sm border border-white/20"
                  variants={menuItemVariants}
                  whileHover={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    scale: 1.02,
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 15,
                  }}
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
                      />
                      <motion.span
                        className="text-sm font-bold text-white cursor-pointer"
                        onClick={() => {
                          toggleProfilePopup();
                          setShowMobileMenu(false);
                        }}
                        whileHover={{ opacity: 0.8 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {user.first_name || "User"}
                      </motion.span>
                    </motion.div>
                    <motion.button
                      onClick={() => {
                        handleLogout();
                        setShowMobileMenu(false);
                      }}
                      className="flex items-center p-3 text-sm font-bold text-white cursor-pointer rounded-lg backdrop-blur-sm border border-white/20"
                      variants={menuItemVariants}
                      whileHover={{
                        backgroundColor: "rgba(255,255,255,0.2)",
                        scale: 1.02,
                      }}
                      whileTap={{ scale: 0.98 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 15,
                      }}
                    >
                      <IconLogout stroke={2} className="w-5 h-5 mr-3" />
                      Đăng xuất
                    </motion.button>
                  </>
                ) : (
                  <>
                    <Link to="/signup" onClick={() => setShowMobileMenu(false)}>
                      <motion.span
                        className="block p-3 text-sm font-bold text-white cursor-pointer rounded-lg backdrop-blur-sm border border-white/20"
                        variants={menuItemVariants}
                        whileHover={{
                          backgroundColor: "rgba(255,255,255,0.2)",
                          scale: 1.02,
                        }}
                        whileTap={{ scale: 0.98 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 15,
                        }}
                      >
                        Đăng ký
                      </motion.span>
                    </Link>
                    <Link to="/login" onClick={() => setShowMobileMenu(false)}>
                      <motion.span
                        className="block p-3 text-sm font-bold bg-white/20 text-white rounded-lg cursor-pointer text-center backdrop-blur-sm border border-white/30"
                        variants={menuItemVariants}
                        whileHover={{
                          backgroundColor: "rgba(255,255,255,0.3)",
                          scale: 1.02,
                          boxShadow: "0 0 15px rgba(255,255,255,0.2)",
                        }}
                        whileTap={{ scale: 0.98 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 15,
                        }}
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

export default Header;
