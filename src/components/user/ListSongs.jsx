// ListSongs.jsx
import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  lazy,
  Suspense,
} from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useAudio } from "../../utils/audioContext.jsx";
import { useTheme } from "../../context/themeContext.js";

// Lazy load Song component
const Song = lazy(() => import("./_Song"));

// Optimized animation variants - focus on opacity and y-position
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.1,
    }
  }
};

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02,
      delayChildren: 0.05,
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 20
  },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      delay: i * 0.02,
      ease: [0.4, 0, 0.2, 1],
    }
  })
};

const headerVariants = {
  hidden: { 
    opacity: 0, 
    y: -20
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    }
  }
};

const titleVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.3,
      delay: 0.1,
      ease: [0.4, 0, 0.2, 1],
    }
  }
};

const subtitleVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.25,
      delay: 0.15,
      ease: [0.4, 0, 0.2, 1],
    }
  }
};

const loadingVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
    }
  }
};

const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 0.8,
      repeat: Infinity,
      ease: "linear",
    }
  }
};

const emptyStateVariants = {
  hidden: { 
    opacity: 0, 
    y: 30
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    }
  }
};

const emojiVariants = {
  animate: {
    rotate: [0, 5, -5, 0], // Keep rotation for emoji, as in MainContent.jsx
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    }
  }
};

// Mobile detection hook - unchanged
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768 || 
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    return false;
  });
  
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768 || 
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
    };
    
    let timeoutId;
    const debouncedCheck = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 100);
    };
    
    window.addEventListener('resize', debouncedCheck, { passive: true });
    return () => {
      window.removeEventListener('resize', debouncedCheck);
      clearTimeout(timeoutId);
    };
  }, []);
  
  return isMobile;
};

// Enhanced Skeleton component - remove scale from animations
const SongSkeleton = React.memo(() => {
  const { theme } = useTheme();
  const ref = useRef();
  const isInView = useInView(ref, { once: true, margin: "-20px" });

  const shimmerVariants = {
    initial: { x: "-100%" },
    animate: {
      x: "100%",
      transition: {
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut",
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      className={`bg-gradient-to-br from-${theme.colors.card}/60 to-${theme.colors.cardHover}/60 p-4 rounded-2xl overflow-hidden backdrop-blur-md`}
      variants={itemVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      custom={Math.random() * 3}
    >
      <motion.div
        className={`aspect-square bg-${theme.colors.secondary}-600 rounded-xl mb-4 relative overflow-hidden`}
        initial={{ opacity: 0.6 }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          variants={shimmerVariants}
          initial="initial"
          animate="animate"
        />
      </motion.div>
      
      <div className="space-y-2">
        <motion.div 
          className={`h-4 bg-${theme.colors.secondary}-600 rounded`}
          initial={{ opacity: 0.6, width: "100%" }}
          animate={{ 
            opacity: [0.6, 1, 0.6],
            width: ["100%", "90%", "100%"]
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className={`h-3 bg-${theme.colors.secondary}-600 rounded`}
          initial={{ opacity: 0.6, width: "75%" }}
          animate={{ 
            opacity: [0.6, 1, 0.6],
            width: ["75%", "60%", "75%"]
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 0.1
          }}
        />
      </div>
    </motion.div>
  );
});

// Highly optimized Progressive Loading Hook - unchanged
const useProgressiveLoading = (totalItems, isMobile = false) => {
  const initialCount = isMobile ? 20 : 36;
  const increment = isMobile ? 16 : 24;
  
  const [loadedCount, setLoadedCount] = useState(Math.min(initialCount, totalItems));
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef();
  const loadingTimeoutRef = useRef();
  const hasMore = loadedCount < totalItems;

  const loadMoreRef = useCallback(
    (node) => {
      if (isLoading || !hasMore) return;
      
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && hasMore && !isLoading) {
            setIsLoading(true);
            
            if (loadingTimeoutRef.current) {
              clearTimeout(loadingTimeoutRef.current);
            }
            
            const delay = isMobile ? 50 : 30;
            
            loadingTimeoutRef.current = setTimeout(() => {
              requestAnimationFrame(() => {
                setLoadedCount((prev) => Math.min(prev + increment, totalItems));
                setIsLoading(false);
              });
            }, delay);
          }
        },
        {
          rootMargin: isMobile ? "300px" : "500px",
          threshold: 0.1,
        }
      );

      if (node) observerRef.current.observe(node);
    },
    [hasMore, isLoading, increment, totalItems, isMobile]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setLoadedCount(Math.min(initialCount, totalItems));
    setIsLoading(false);
  }, [totalItems, initialCount]);

  return { loadedCount, loadMoreRef, setLoadedCount, isLoading, hasMore };
};

// Highly optimized Song Grid Component
const SmoothSongGrid = React.memo(
  ({
    songs,
    contextMenu,
    setContextMenu,
    handleCloseContextMenu,
    songDescriptionAvailable = false,
    isMobile = false,
  }) => {
    const { theme } = useTheme();
    const { loadedCount, loadMoreRef, isLoading, hasMore } = useProgressiveLoading(
      songs.length,
      isMobile
    );

    const gridClasses = useMemo(() => {
      const baseClasses = "grid gap-3 gap-y-4";
      if (songDescriptionAvailable) {
        return `${baseClasses} grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`;
      }
      return `${baseClasses} ${
        isMobile 
          ? 'grid-cols-2' 
          : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7'
      }`;
    }, [songDescriptionAvailable, isMobile]);

    const visibleSongs = useMemo(
      () => songs.slice(0, loadedCount),
      [songs, loadedCount]
    );

    const [renderBatch, setRenderBatch] = useState(isMobile ? 10 : 18);
    
    useEffect(() => {
      if (visibleSongs.length > renderBatch) {
        const timer = setTimeout(() => {
          setRenderBatch(prev => Math.min(prev + (isMobile ? 10 : 18), visibleSongs.length));
        }, 16);
        return () => clearTimeout(timer);
      }
    }, [visibleSongs.length, renderBatch, isMobile]);

    const renderedSongs = useMemo(
      () => visibleSongs.slice(0, renderBatch),
      [visibleSongs, renderBatch]
    );

    if (songs.length === 0) {
      return (
        <motion.div 
          className={`flex flex-col items-center justify-center h-64 text-${theme.colors.text}`}
          variants={emptyStateVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="text-4xl mb-4 opacity-50"
            variants={emojiVariants}
            animate="animate"
          >
            🎵
          </motion.div>
          <motion.p 
            className="text-lg mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            Không có bài hát nào
          </motion.p>
          <motion.p 
            className={`text-sm opacity-75 text-${theme.colors.text}/60`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            Thử duyệt các danh mục khác
          </motion.p>
        </motion.div>
      );
    }

    return (
      <motion.div 
        className="space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Songs Grid */}
        <motion.div 
          className={gridClasses}
          variants={gridVariants}
          initial="hidden"
          animate="visible"
        >
          {renderedSongs.map((song, index) => (
            <Suspense key={`${song.id}-${index}`}>
              <Song
                song={song}
                list={songs}
                contextMenu={contextMenu}
                setContextMenu={setContextMenu}
                handleCloseContextMenu={handleCloseContextMenu}

                index={index}
              />
            </Suspense>
          ))}
          {hasMore && (
            <div ref={loadMoreRef} className="h-10 w-full" />
          )}
        </motion.div>
        
        {/* End of Content Spacer */}
        <AnimatePresence>
          {!hasMore && (
            <motion.div 
              className="flex justify-center items-center py-6"
              variants={loadingVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div 
                className={`text-${theme.colors.text}/60 text-sm flex items-center space-x-2`}
                whileHover={{ x: 5 }} // Match MainContent.jsx hover style
                transition={{ duration: 0.2 }}
              >
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  🎉
                </motion.span>
                <span>
                  {isMobile ? `${songs.length} bài hát` : `Đã hiển thị tất cả ${songs.length} bài hát`}
                </span>
                <motion.span
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 0.3
                  }}
                >
                  🎉
                </motion.span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);

// Main ListSongs Component with performance optimizations
const ListSongs = ({ listSongs }) => {
  const [contextMenu, setContextMenu] = useState(null);
  const { currentSong, songDescriptionAvailable } = useAudio();
  const { theme } = useTheme();
  const scrollContainerRef = useRef();
  const isMobile = useIsMobile();

  const contextMenuRef = useRef(contextMenu);
  contextMenuRef.current = contextMenu;

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleClickOutside = useCallback(
    (e) => {
      if (contextMenuRef.current) {
        const contextMenuElement = document.querySelector(".context-menu");
        if (contextMenuElement && !contextMenuElement.contains(e.target)) {
          handleCloseContextMenu();
        }
      }
    },
    [handleCloseContextMenu]
  );

  const scrollTimeoutRef = useRef();
  const handleScroll = useCallback((e) => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    const container = e.target;
    if (container.scrollTop < 0) {
      container.scrollTop = 0;
    }

    if (isMobile) {
      scrollTimeoutRef.current = setTimeout(() => {}, 16);
    }
  }, [isMobile]);

  useEffect(() => {
    if (contextMenu) {
      const options = { passive: true, capture: false };
      document.addEventListener("click", handleClickOutside, options);
      document.addEventListener("contextmenu", handleClickOutside, options);

      return () => {
        document.removeEventListener("click", handleClickOutside, options);
        document.removeEventListener("contextmenu", handleClickOutside, options);
      };
    }
  }, [contextMenu, handleClickOutside]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollOptions = { 
        passive: true,
        capture: false
      };
      
      container.addEventListener("scroll", handleScroll, scrollOptions);
      return () => {
        container.removeEventListener("scroll", handleScroll, scrollOptions);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }
  }, [handleScroll]);

  const isValidData = useMemo(() => {
    return (
      listSongs &&
      listSongs.songs &&
      Array.isArray(listSongs.songs) &&
      listSongs.songs.length > 0
    );
  }, [listSongs]);

  // Loading state
  if (listSongs?.isLoading) {
    return (
      <motion.div 
        ref={scrollContainerRef}
        className="text-white flex-1 mr-2 sm:mr-0 rounded-lg overflow-y-auto"
        style={{
          scrollBehavior: isMobile ? "auto" : "smooth",
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
        }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <motion.div
          className={`sticky top-0 z-10 bg-gradient-to-b ${theme.colors.backgroundOverlay} backdrop-blur-md border-b border-white/10`}
          variants={headerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="p-4 pb-6">
            <motion.h3 
              className={`font-bold text-xl sm:text-2xl text-${theme.colors.text}`}
              variants={titleVariants}
            >
              {listSongs.title || "Đang tải..."}
            </motion.h3>
            <motion.div 
              className="mt-3"
              variants={subtitleVariants}
            >
              <div className={`h-1 bg-${theme.colors.card} rounded-full overflow-hidden`}>
                <motion.div 
                  className={`h-full bg-gradient-to-r from-${theme.colors.primary}-500 to-${theme.colors.secondary}-400 rounded-full`}
                  initial={{ width: "0%" }}
                  animate={{ 
                    width: ["0%", "70%", "100%", "30%"],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div 
          className={`p-4 ${currentSong ? (isMobile ? 'pb-24' : 'pb-32 sm:pb-36 md:pb-40') : 'pb-8'}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className={`grid gap-3 gap-y-4 ${
              songDescriptionAvailable
                ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                : isMobile ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
            }`}
            variants={gridVariants}
          >
            {Array.from({ length: isMobile ? 6 : 9 }).map((_, index) => (
              <SongSkeleton key={`loading-skeleton-${index}`} />
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  // Error state
  if (listSongs?.error) {
    return (
      <motion.div 
        className="text-white flex-1 mr-2 sm:mr-0 rounded-lg p-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <motion.div 
          className="flex flex-col items-center justify-center h-64"
          variants={emptyStateVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="text-6xl mb-4 opacity-50"
            animate={{ 
              rotate: [0, 3, -3, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            ⚠️
          </motion.div>
          <motion.p 
            className="text-xl mb-2 font-medium text-red-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            {listSongs.title || "Có lỗi xảy ra"}
          </motion.p>
          <motion.p 
            className={`text-sm opacity-75 text-${theme.colors.text}/60 text-center max-w-md`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            {listSongs.error}
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  // Invalid data state
  if (!isValidData) {
    return (
      <motion.div 
        className="text-white flex-1 mr-2 sm:mr-0 rounded-lg p-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className="flex flex-col items-center justify-center h-64"
          variants={emptyStateVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="text-4xl mb-4 opacity-50"
            variants={emojiVariants}
            animate="animate"
          >
            🎵
          </motion.div>
          <motion.p 
            className={`text-lg mb-2 text-${theme.colors.text}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            Không có bài hát nào
          </motion.p>
          <motion.p 
            className={`text-sm opacity-75 text-${theme.colors.text}/60`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            Thử duyệt các danh mục khác
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  const songs = listSongs.songs;

  const getBottomPadding = () => {
    if (currentSong) {
      return isMobile ? "pb-24" : "pb-32 sm:pb-36 md:pb-40";
    }
    return "pb-8";
  };

  return (
    <motion.div 
      ref={scrollContainerRef}
      className="text-white flex-1 mr-2 sm:mr-0 rounded-lg overflow-y-auto"
      style={{
        scrollBehavior: isMobile ? "auto" : "smooth",
        overscrollBehavior: "contain",
        transform: "translateZ(0)",
        willChange: "scroll-position",
        WebkitOverflowScrolling: "touch",
      }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Sticky Header */}
      <motion.div
        className={`sticky top-0 z-20 bg-gradient-to-b ${theme.colors.backgroundOverlay} backdrop-blur-md border-b border-white/10`}
        style={{
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
        }}
        variants={headerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className={isMobile ? "p-3 pb-4" : "p-4 pb-6"}>
          <motion.h3 
            className={`font-bold ${isMobile ? 'text-lg' : 'text-xl sm:text-2xl'} text-${theme.colors.text}`}
            variants={titleVariants}
          >
            {listSongs.title || "Songs"}
          </motion.h3>
          <motion.p 
            className={`${isMobile ? 'text-xs' : 'text-sm'} opacity-75 text-${theme.colors.text}/60 mt-1`}
            variants={subtitleVariants}
          >
            {songs.length} bài hát
          </motion.p>
        </div>
      </motion.div>

      {/* Songs Content */}
      <motion.div 
        className={`px-${isMobile ? '3' : '4'} pt-4 ${getBottomPadding()}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <SmoothSongGrid
          songs={songs}
          contextMenu={contextMenu}
          setContextMenu={setContextMenu}
          handleCloseContextMenu={handleCloseContextMenu}
          songDescriptionAvailable={songDescriptionAvailable}
          isMobile={isMobile}
        />
      </motion.div>
    </motion.div>
  );
};

export default React.memo(ListSongs);