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

// Virtual scrolling hook for large song lists
const useVirtualScrolling = (
  items,
  itemHeight = 320,
  containerHeight = 600,
  overscan = 5
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const itemsPerRow =
      window.innerWidth >= 1280
        ? 6
        : window.innerWidth >= 1024
        ? 5
        : window.innerWidth >= 768
        ? 4
        : window.innerWidth >= 640
        ? 3
        : 2;

    const rowHeight = itemHeight + 24; // Include gap
    const totalRows = Math.ceil(items.length / itemsPerRow);

    const startRow = Math.floor(scrollTop / rowHeight);
    const endRow = Math.min(
      startRow + Math.ceil(containerHeight / rowHeight) + overscan,
      totalRows
    );

    return {
      start: Math.max(0, startRow * itemsPerRow),
      end: Math.min(endRow * itemsPerRow, items.length),
      startRow,
      totalRows,
      itemsPerRow,
      rowHeight,
    };
  }, [scrollTop, items.length, itemHeight, containerHeight, overscan]);

  const visibleItems = useMemo(
    () => items.slice(visibleRange.start, visibleRange.end),
    [items, visibleRange.start, visibleRange.end]
  );

  const totalHeight = visibleRange.totalRows * visibleRange.rowHeight;
  const offsetY = visibleRange.startRow * visibleRange.rowHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    visibleRange,
    setScrollTop,
  };
};

// Intersection Observer hook for progressive loading
const useProgressiveLoading = (initialCount = 20, increment = 20) => {
  const [loadedCount, setLoadedCount] = useState(initialCount);
  const observerRef = useRef();

  const loadMoreRef = useCallback(
    (node) => {
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setLoadedCount((prev) => prev + increment);
          }
        },
        {
          rootMargin: "200px",
          threshold: 0.1,
        }
      );

      if (node) observerRef.current.observe(node);
    },
    [increment]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return { loadedCount, loadMoreRef, setLoadedCount };
};

// Optimized Song Grid Component
const VirtualizedSongGrid = React.memo(
  ({
    songs,
    contextMenu,
    setContextMenu,
    handleCloseContextMenu,
    isLoading = false,
    songDescriptionAvailable = false,
  }) => {
    const containerRef = useRef();
    const [containerHeight, setContainerHeight] = useState(600);

    // Use virtual scrolling for large lists
    const { visibleItems, totalHeight, offsetY, visibleRange, setScrollTop } =
      useVirtualScrolling(songs, 320, containerHeight);

    // Handle scroll events with throttling
    const handleScroll = useCallback(
      (e) => {
        const scrollTop = e.target.scrollTop;
        setScrollTop(scrollTop);
      },
      [setScrollTop]
    );

    // Update container height on mount and resize
    useEffect(() => {
      const updateHeight = () => {
        if (containerRef.current) {
          setContainerHeight(containerRef.current.clientHeight);
        }
      };

      updateHeight();
      window.addEventListener("resize", updateHeight);
      return () => window.removeEventListener("resize", updateHeight);
    }, []);

    // Grid column classes based on song description availability
    const gridClasses = useMemo(() => {
      const baseClasses = "grid gap-4";
      if (songDescriptionAvailable) {
        return `${baseClasses} grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`;
      }
      return `${baseClasses} grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6`;
    }, [songDescriptionAvailable]);

    if (isLoading) {
      return (
        <div className={gridClasses}>
          {Array.from({ length: 12 }).map((_, index) => (
            <SongSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      );
    }

    if (songs.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <div className="text-4xl mb-4 opacity-50">🎵</div>
          <p className="text-lg mb-2">Không có bài hát nào</p>
          <p className="text-sm opacity-75">Thử duyệt các danh mục khác</p>
        </div>
      );
    }

    // For small lists, use regular grid without virtualization
    if (songs.length <= 50) {
      return (
        <div className={gridClasses}>
          {songs.map((song, index) => (
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
      );
    }

    // Use virtualization for large lists
    return (
      <div
        ref={containerRef}
        className="relative overflow-auto scroll-optimized"
        style={{ height: "70vh", maxHeight: "800px" }}
        onScroll={handleScroll}
      >
        <div className="relative" style={{ height: totalHeight }}>
          <div
            className={gridClasses}
            style={{
              transform: `translateY(${offsetY}px) translateZ(0)`,
              position: "absolute",
              top: 0,
              width: "100%",
              willChange: "transform",
            }}
          >
            {visibleItems.map((song, index) => (
              <Suspense
                key={`song-${song.id}-${visibleRange.start + index}`}
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
        </div>
      </div>
    );
  }
);

// Progressive Loading Grid for better perceived performance
const ProgressiveLoadingGrid = React.memo(
  ({
    songs,
    contextMenu,
    setContextMenu,
    handleCloseContextMenu,
    songDescriptionAvailable = false,
  }) => {
    const { loadedCount, loadMoreRef } = useProgressiveLoading(20, 20);

    const gridClasses = useMemo(() => {
      const baseClasses = "grid gap-4";
      if (songDescriptionAvailable) {
        return `${baseClasses} grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`;
      }
      return `${baseClasses} grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6`;
    }, [songDescriptionAvailable]);

    const visibleSongs = useMemo(
      () => songs.slice(0, Math.min(loadedCount, songs.length)),
      [songs, loadedCount]
    );

    return (
      <div className="space-y-4">
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

        {/* Load more trigger */}
        {loadedCount < songs.length && (
          <div ref={loadMoreRef} className="flex justify-center py-8">
            <div className="flex items-center space-x-2 text-gray-400">
              <div className="loading-spinner"></div>
              <span>Đang tải thêm bài hát...</span>
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

  // Optimized event listeners with passive events
  useEffect(() => {
    if (contextMenu) {
      const options = { passive: true, capture: false };
      document.addEventListener("click", handleClickOutside, options);
      document.addEventListener("contextmenu", handleClickOutside, options);

      return () => {
        document.removeEventListener("click", handleClickOutside, options);
        document.removeEventListener(
          "contextmenu",
          handleClickOutside,
          options
        );
      };
    }
  }, [contextMenu, handleClickOutside]);

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
      <div className="text-white flex-1 mr-2 sm:mr-0 rounded-lg overflow-y-auto scrollbar-optimized">
        <div
          className={`sticky top-0 z-10 bg-gradient-to-t ${theme.colors.backgroundOverlay} backdrop-blur-md`}
        >
          <h3
            className={`p-4 font-bold text-xl sm:text-2xl text-${theme.colors.text}`}
          >
            {listSongs.title || "Đang tải..."}
          </h3>
        </div>

        <div className="p-4">
          <div
            className={`grid gap-4 ${
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
          <p
            className={`text-sm opacity-75 text-${theme.colors.text}/60 text-center max-w-md`}
          >
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

  return (
    <div className="text-white flex-1 mr-2 sm:mr-0 rounded-lg overflow-y-auto scrollbar-optimized">
      {/* Sticky Header */}
      <div
        className={`sticky top-0 z-10 bg-gradient-to-t ${theme.colors.backgroundOverlay} backdrop-blur-md border-b border-white/10`}
      >
        <div className="p-4">
          <h3
            className={`font-bold text-xl sm:text-2xl text-${theme.colors.text}`}
          >
            {listSongs.title || "Songs"}
          </h3>
          <p className={`text-sm opacity-75 text-${theme.colors.text}/60 mt-1`}>
            {songs.length} bài hát
          </p>
        </div>
      </div>

      {/* Songs Content */}
      <div className="p-4">
        {songs.length > 100 ? (
          // Use virtualization for very large lists
          <VirtualizedSongGrid
            songs={songs}
            contextMenu={contextMenu}
            setContextMenu={setContextMenu}
            handleCloseContextMenu={handleCloseContextMenu}
            songDescriptionAvailable={songDescriptionAvailable}
          />
        ) : (
          // Use progressive loading for medium-sized lists
          <ProgressiveLoadingGrid
            songs={songs}
            contextMenu={contextMenu}
            setContextMenu={setContextMenu}
            handleCloseContextMenu={handleCloseContextMenu}
            songDescriptionAvailable={songDescriptionAvailable}
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(ListSongs);
