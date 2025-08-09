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

// Improved Progressive Loading Hook
const useProgressiveLoading = (totalItems, initialCount = 24, increment = 24) => {
  const [loadedCount, setLoadedCount] = useState(Math.min(initialCount, totalItems));
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef();
  const hasMore = loadedCount < totalItems;

  const loadMoreRef = useCallback(
    (node) => {
      if (isLoading || !hasMore) return;
      
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && hasMore && !isLoading) {
            setIsLoading(true);
            // Use requestAnimationFrame for smoother loading
            requestAnimationFrame(() => {
              setTimeout(() => {
                setLoadedCount((prev) => Math.min(prev + increment, totalItems));
                setIsLoading(false);
              }, 50); // Small delay for better UX
            });
          }
        },
        {
          rootMargin: "400px", // Load earlier
          threshold: 0.1,
        }
      );

      if (node) observerRef.current.observe(node);
    },
    [hasMore, isLoading, increment, totalItems]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
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

// Smooth Scrolling Grid Component - No Virtualization for Better UX
const SmoothSongGrid = React.memo(
  ({
    songs,
    contextMenu,
    setContextMenu,
    handleCloseContextMenu,
    songDescriptionAvailable = false,
  }) => {
    const { theme } = useTheme();
    
    // Use progressive loading instead of virtualization for smoother experience
    const { loadedCount, loadMoreRef, isLoading, hasMore } = useProgressiveLoading(
      songs.length,
      24, // Start with 24 songs
      24  // Load 24 more at a time
    );

    const gridClasses = useMemo(() => {
      const baseClasses = "grid gap-4 gap-y-6";
      if (songDescriptionAvailable) {
        return `${baseClasses} grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`;
      }
      return `${baseClasses} grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6`;
    }, [songDescriptionAvailable]);

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
      <div className="space-y-6">
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

        {/* Loading More Indicator */}
        {hasMore && (
          <div 
            ref={loadMoreRef} 
            className="flex justify-center items-center py-8 min-h-[80px]"
          >
            {isLoading ? (
              <div className={`flex items-center space-x-3 text-${theme.colors.secondary}-400`}>
                <div className="relative">
                  <div className={`w-6 h-6 border-2 border-${theme.colors.secondary}-400 border-t-transparent rounded-full animate-spin`}></div>
                  <div className={`absolute inset-1 border border-${theme.colors.secondary}-400/30 rounded-full`}></div>
                </div>
                <span className="text-sm font-medium">Đang tải thêm bài hát...</span>
                <span className={`text-xs text-${theme.colors.text}/60`}>
                  ({loadedCount}/{songs.length})
                </span>
              </div>
            ) : (
              <div className={`text-${theme.colors.text}/40 text-sm`}>
                Cuộn xuống để xem thêm ({songs.length - loadedCount} bài còn lại)
              </div>
            )}
          </div>
        )}

        {/* End of Content Spacer */}
        {!hasMore && (
          <div className="flex justify-center items-center py-8">
            <div className={`text-${theme.colors.text}/60 text-sm flex items-center space-x-2`}>
              <span>🎉</span>
              <span>Đã hiển thị tất cả {songs.length} bài hát</span>
              <span>🎉</span>
            </div>
          </div>
        )}
      </div>
    );
  }
);

// Main ListSongs Component
const ListSongs = ({ listSongs }) => {
  const [contextMenu, setContextMenu] = useState(null);
  const { currentSong, songDescriptionAvailable } = useAudio();
  const { theme } = useTheme();
  const scrollContainerRef = useRef();

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

  // Optimized scroll handler with throttling
  const handleScroll = useCallback((e) => {
    // Add smooth scrolling behavior
    const container = e.target;
    if (container.scrollTop < 0) {
      container.scrollTop = 0;
    }
  }, []);

  // Optimized event listeners with passive events
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

  // Add scroll event listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
      return () => {
        container.removeEventListener("scroll", handleScroll);
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
          scrollBehavior: "smooth",
          overscrollBehavior: "contain"
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

        <div className={`p-4 ${currentSong ? 'pb-32 sm:pb-36 md:pb-40' : 'pb-8'}`}>
          <div
            className={`grid gap-4 gap-y-6 ${
              songDescriptionAvailable
                ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
            }`}
          >
            {Array.from({ length: 12 }).map((_, index) => (
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

  // Calculate dynamic padding based on music player state
  const getBottomPadding = () => {
    if (currentSong) {
      // When music is playing, add more padding for the music player
      return "pb-32 sm:pb-36 md:pb-40"; // Larger padding for music player
    }
    return "pb-8"; // Normal padding when no music playing
  };

  return (
    <div 
      ref={scrollContainerRef}
      className="text-white flex-1 mr-2 sm:mr-0 rounded-lg overflow-y-auto"
      style={{
        scrollBehavior: "smooth",
        overscrollBehavior: "contain",
        transform: "translateZ(0)", // Hardware acceleration
        willChange: "scroll-position"
      }}
    >
      {/* Sticky Header */}
      <div
        className={`sticky top-0 z-20 bg-gradient-to-b ${theme.colors.backgroundOverlay} backdrop-blur-md border-b border-white/10`}
        style={{
          transform: "translateZ(0)", // Hardware acceleration for sticky element
        }}
      >
        <div className="p-4 pb-6">
          <h3 className={`font-bold text-xl sm:text-2xl text-${theme.colors.text}`}>
            {listSongs.title || "Songs"}
          </h3>
          <p className={`text-sm opacity-75 text-${theme.colors.text}/60 mt-1`}>
            {songs.length} bài hát
          </p>
        </div>
      </div>

      {/* Songs Content with dynamic bottom padding based on music player */}
      <div className={`px-4 pt-4 ${getBottomPadding()}`}>
        <SmoothSongGrid
          songs={songs}
          contextMenu={contextMenu}
          setContextMenu={setContextMenu}
          handleCloseContextMenu={handleCloseContextMenu}
          songDescriptionAvailable={songDescriptionAvailable}
        />
      </div>
    </div>
  );
};

export default React.memo(ListSongs);