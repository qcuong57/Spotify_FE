import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  lazy,
  Suspense,
} from "react";
import { useAudio } from "../../utils/audioContext.jsx";
import { useTheme } from "../../context/themeContext.js";

// Lazy load Song component for better performance
const Song = lazy(() => import("./_Song"));

// Mobile detection hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768 || 
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
};

// Optimized Skeleton component
const SongSkeleton = React.memo(() => {
  const { theme } = useTheme();

  return (
    <div
      className={`bg-gradient-to-br from-${theme.colors.card}/60 to-${theme.colors.cardHover}/60 p-4 rounded-2xl animate-pulse`}
    >
      <div
        className={`aspect-square bg-${theme.colors.secondary}-600 rounded-xl mb-4`}
      />
      <div className="space-y-2">
        <div className={`h-4 bg-${theme.colors.secondary}-600 rounded`} />
        <div className={`h-3 bg-${theme.colors.secondary}-600 rounded w-3/4`} />
      </div>
    </div>
  );
});

// Improved Progressive Loading Hook with mobile optimization
const useProgressiveLoading = (totalItems, isMobile = false) => {
  // Reduce initial count on mobile for better performance
  const initialCount = isMobile ? 12 : 24;
  const increment = isMobile ? 12 : 24;
  
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
            
            // Clear any existing timeout
            if (loadingTimeoutRef.current) {
              clearTimeout(loadingTimeoutRef.current);
            }
            
            // Use longer delay on mobile to prevent scroll jank
            const delay = isMobile ? 100 : 50;
            
            loadingTimeoutRef.current = setTimeout(() => {
              requestAnimationFrame(() => {
                setLoadedCount((prev) => Math.min(prev + increment, totalItems));
                setIsLoading(false);
              });
            }, delay);
          }
        },
        {
          rootMargin: isMobile ? "200px" : "400px", // Smaller preload on mobile
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

  // Reset when total items change
  useEffect(() => {
    setLoadedCount(Math.min(initialCount, totalItems));
    setIsLoading(false);
  }, [totalItems, initialCount]);

  return { loadedCount, loadMoreRef, setLoadedCount, isLoading, hasMore };
};

// Optimized Song Grid Component with mobile-specific improvements
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
      const baseClasses = "grid gap-3 gap-y-4"; // Reduced gaps on mobile
      if (songDescriptionAvailable) {
        return `${baseClasses} grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`;
      }
      // Optimize grid for mobile
      return `${baseClasses} ${isMobile ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'}`;
    }, [songDescriptionAvailable, isMobile]);

    const visibleSongs = useMemo(
      () => songs.slice(0, loadedCount),
      [songs, loadedCount]
    );

    if (songs.length === 0) {
      return (
        <div className={`flex flex-col items-center justify-center h-64 text-${theme.colors.text}`}>
          <div className="text-4xl mb-4 opacity-50">🎵</div>
          <p className="text-lg mb-2">Không có bài hát nào</p>
          <p className={`text-sm opacity-75 text-${theme.colors.text}/60`}>Thử duyệt các danh mục khác</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Songs Grid */}
        <div className={gridClasses}>
          {visibleSongs.map((song, index) => (
            <Suspense
              key={`song-${song.id}-${index}`}
              fallback={<SongSkeleton />}
            >
              <Song
                song={song}
                contextMenu={contextMenu}
                setContextMenu={setContextMenu}
                handleCloseContextMenu={handleCloseContextMenu}
                list={songs}
              />
            </Suspense>
          ))}
        </div>

        {/* Loading More Indicator - Optimized for mobile */}
        {hasMore && (
          <div 
            ref={loadMoreRef} 
            className="flex justify-center items-center py-6 min-h-[60px]"
          >
            {isLoading ? (
              <div className={`flex items-center space-x-2 text-${theme.colors.secondary}-400`}>
                <div className="relative">
                  <div className={`w-5 h-5 border-2 border-${theme.colors.secondary}-400 border-t-transparent rounded-full animate-spin`}></div>
                </div>
                <span className="text-sm font-medium">Đang tải...</span>
                {!isMobile && (
                  <span className={`text-xs text-${theme.colors.text}/60`}>
                    ({loadedCount}/{songs.length})
                  </span>
                )}
              </div>
            ) : (
              <div className={`text-${theme.colors.text}/40 text-sm text-center`}>
                {isMobile ? 'Cuộn để xem thêm' : `Cuộn xuống để xem thêm (${songs.length - loadedCount} bài còn lại)`}
              </div>
            )}
          </div>
        )}

        {/* End of Content Spacer */}
        {!hasMore && (
          <div className="flex justify-center items-center py-6">
            <div className={`text-${theme.colors.text}/60 text-sm flex items-center space-x-2`}>
              <span>🎉</span>
              <span>{isMobile ? `${songs.length} bài hát` : `Đã hiển thị tất cả ${songs.length} bài hát`}</span>
              <span>🎉</span>
            </div>
          </div>
        )}
      </div>
    );
  }
);

// Main ListSongs Component with mobile optimizations
const ListSongs = ({ listSongs }) => {
  const [contextMenu, setContextMenu] = useState(null);
  const { currentSong, songDescriptionAvailable } = useAudio();
  const { theme } = useTheme();
  const scrollContainerRef = useRef();
  const isMobile = useIsMobile();

  // Use refs to prevent unnecessary re-renders
  const contextMenuRef = useRef(contextMenu);
  contextMenuRef.current = contextMenu;

  // Optimized context menu handlers
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

  // Throttled scroll handler for better mobile performance
  const scrollTimeoutRef = useRef();
  const handleScroll = useCallback((e) => {
    // Clear previous timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Throttle scroll events on mobile
    if (isMobile) {
      scrollTimeoutRef.current = setTimeout(() => {
        const container = e.target;
        if (container.scrollTop < 0) {
          container.scrollTop = 0;
        }
      }, 16); // ~60fps
    } else {
      const container = e.target;
      if (container.scrollTop < 0) {
        container.scrollTop = 0;
      }
    }
  }, [isMobile]);

  // Optimized event listeners
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

  // Add scroll event listener with passive option for mobile
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

  // Memoized validation
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
      <div 
        ref={scrollContainerRef}
        className="text-white flex-1 mr-2 sm:mr-0 rounded-lg overflow-y-auto"
        style={{
          scrollBehavior: isMobile ? "auto" : "smooth", // Disable smooth scroll on mobile
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch", // iOS momentum scrolling
        }}
      >
        <div
          className={`sticky top-0 z-10 bg-gradient-to-b ${theme.colors.backgroundOverlay} backdrop-blur-md border-b border-white/10`}
        >
          <div className="p-4 pb-6">
            <h3 className={`font-bold text-xl sm:text-2xl text-${theme.colors.text}`}>
              {listSongs.title || "Đang tải..."}
            </h3>
            <div className="mt-3">
              <div className={`h-1 bg-${theme.colors.card} rounded-full overflow-hidden`}>
                <div className={`h-full bg-gradient-to-r from-${theme.colors.primary}-500 to-${theme.colors.secondary}-400 rounded-full animate-pulse w-1/3`}></div>
              </div>
            </div>
          </div>
        </div>

        <div className={`p-4 ${currentSong ? (isMobile ? 'pb-24' : 'pb-32 sm:pb-36 md:pb-40') : 'pb-8'}`}>
          <div
            className={`grid gap-3 gap-y-4 ${
              songDescriptionAvailable
                ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                : isMobile ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
            }`}
          >
            {Array.from({ length: isMobile ? 8 : 12 }).map((_, index) => (
              <SongSkeleton key={`loading-skeleton-${index}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (listSongs?.error) {
    return (
      <div className="text-white flex-1 mr-2 sm:mr-0 rounded-lg p-4">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-6xl mb-4 opacity-50">⚠️</div>
          <p className="text-xl mb-2 font-medium text-red-400">
            {listSongs.title || "Có lỗi xảy ra"}
          </p>
          <p className={`text-sm opacity-75 text-${theme.colors.text}/60 text-center max-w-md`}>
            {listSongs.error}
          </p>
        </div>
      </div>
    );
  }

  // Invalid data state
  if (!isValidData) {
    return (
      <div className="text-white flex-1 mr-2 sm:mr-0 rounded-lg p-4">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-4xl mb-4 opacity-50">🎵</div>
          <p className={`text-lg mb-2 text-${theme.colors.text}`}>
            Không có bài hát nào
          </p>
          <p className={`text-sm opacity-75 text-${theme.colors.text}/60`}>
            Thử duyệt các danh mục khác
          </p>
        </div>
      </div>
    );
  }

  const songs = listSongs.songs;

  // Calculate dynamic padding based on music player state and device
  const getBottomPadding = () => {
    if (currentSong) {
      // Reduced padding on mobile for better screen usage
      return isMobile ? "pb-24" : "pb-32 sm:pb-36 md:pb-40";
    }
    return "pb-8";
  };

  return (
    <div 
      ref={scrollContainerRef}
      className="text-white flex-1 mr-2 sm:mr-0 rounded-lg overflow-y-auto"
      style={{
        scrollBehavior: isMobile ? "auto" : "smooth", // Disable smooth scroll on mobile for performance
        overscrollBehavior: "contain",
        transform: "translateZ(0)", // Hardware acceleration
        willChange: "scroll-position",
        WebkitOverflowScrolling: "touch", // iOS momentum scrolling
      }}
    >
      {/* Sticky Header with mobile optimization */}
      <div
        className={`sticky top-0 z-20 bg-gradient-to-b ${theme.colors.backgroundOverlay} backdrop-blur-md border-b border-white/10`}
        style={{
          transform: "translateZ(0)", // Hardware acceleration for sticky element
          backfaceVisibility: "hidden", // Prevent flicker on mobile
        }}
      >
        <div className={isMobile ? "p-3 pb-4" : "p-4 pb-6"}>
          <h3 className={`font-bold ${isMobile ? 'text-lg' : 'text-xl sm:text-2xl'} text-${theme.colors.text}`}>
            {listSongs.title || "Songs"}
          </h3>
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} opacity-75 text-${theme.colors.text}/60 mt-1`}>
            {songs.length} bài hát
          </p>
        </div>
      </div>

      {/* Songs Content with mobile-optimized padding */}
      <div className={`px-${isMobile ? '3' : '4'} pt-4 ${getBottomPadding()}`}>
        <SmoothSongGrid
          songs={songs}
          contextMenu={contextMenu}
          setContextMenu={setContextMenu}
          handleCloseContextMenu={handleCloseContextMenu}
          songDescriptionAvailable={songDescriptionAvailable}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
};

export default React.memo(ListSongs);