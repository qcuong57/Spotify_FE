import React, { useEffect, useState, useMemo, useCallback, memo } from "react";
import {
  getAllSongs,
  getAllSongsWithPagination,
  getTrendingSongs,
  getLatestSongs,
} from "../../services/SongsService";
import { getAllGenres } from "../../services/genresService";
import { useTheme } from "../../context/themeContext";
import Song from "./_Song";
import TrendingSong from "./TrendingSong ";

// Memoized Section component with theme support
const Section = memo(
  ({
    title,
    emoji,
    children,
    onViewAll,
    buttonText = "Xem tất cả",
    isLoading = false,
  }) => {
    const { theme } = useTheme();
    
    return (
      <div className="mb-8">
        <div className="flex flex-row justify-between items-center mb-6">
          <h2
            className={`text-2xl md:text-3xl font-bold cursor-pointer hover:underline transition-colors duration-200 hover:text-${theme.colors.secondary}-400 flex items-center gap-2`}
          >
            {emoji && <span className="text-2xl">{emoji}</span>}
            {title}
          </h2>
          {onViewAll && (
            <button
              className={`
              text-sm font-semibold px-6 py-3 rounded-full
              transition-colors duration-200
              ${
                isLoading
                  ? `pointer-events-none opacity-50 bg-${theme.colors.secondary}-600 text-white`
                  : `text-${theme.colors.text} hover:text-white hover:bg-${theme.colors.secondary}-500`
              }
            `}
              onClick={onViewAll}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 relative">
                    <div className="absolute inset-0 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                    <div className="absolute inset-1 rounded-full bg-white opacity-20"></div>
                  </div>
                  <span>Đang tải...</span>
                </div>
              ) : (
                <span className="flex items-center gap-2">
                  <span>{buttonText}</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
              )}
            </button>
          )}
        </div>
        {children}
      </div>
    );
  }
);

// Genre Filter Component with theme support
const GenreFilter = memo(
  ({ genres, selectedGenre, onGenreSelect, isLoading }) => {
    const { theme } = useTheme();

    return (
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 md:gap-3">
          {/* All Genres Button */}
          <button
            onClick={() => onGenreSelect(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-out
              ${
                selectedGenre === null
                  ? `bg-gradient-to-r from-${theme.colors.primary}-600 to-${theme.colors.secondary}-500 text-white shadow-md scale-105`
                  : `bg-${theme.colors.card} text-${theme.colors.text} hover:bg-${theme.colors.cardHover} hover:text-${theme.colors.textHover} hover:shadow-lg hover:scale-105`
              }`}
          >
            Tất cả
          </button>

          {/* Genre Buttons */}
          {genres.map((genre) => (
            <button
              key={genre.id}
              onClick={() => onGenreSelect(genre)}
              disabled={isLoading}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-out
                ${
                  selectedGenre?.id === genre.id
                    ? `bg-gradient-to-r from-${theme.colors.primary}-600 to-${theme.colors.secondary}-500 text-white shadow-md scale-105`
                    : `bg-${theme.colors.card} text-${theme.colors.text} hover:bg-${theme.colors.cardHover} hover:text-${theme.colors.textHover} hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`
                }`}
            >
              {genre.name}
              {genre.songs && (
                <span className="ml-1 text-xs opacity-75">
                  ({genre.songs.length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Loading indicator for genre filter */}
        {isLoading && (
          <div className="flex items-center justify-center mt-4">
            <div className={`flex items-center gap-2 text-${theme.colors.secondary}-300`}>
              <div className="w-4 h-4 relative">
                <div className={`absolute inset-0 rounded-full border-2 border-${theme.colors.secondary}-300 border-t-transparent animate-spin`}></div>
              </div>
              <span className="text-sm">Đang tải bài hát...</span>
            </div>
          </div>
        )}
      </div>
    );
  }
);

// Enhanced SongCardSkeleton with theme support
const SongCardSkeleton = memo(() => {
  const { theme } = useTheme();

  // Get theme-specific skeleton colors
  const getSkeletonColors = () => {
    switch (theme.id) {
      case "ocean":
        return {
          card: "from-teal-800/60 via-teal-700/60 to-emerald-600/60",
          image: "from-teal-600 to-teal-500",
          shimmer: "from-transparent via-teal-400/30 to-transparent",
          text: "from-teal-600 to-teal-500",
        };
      case "forest":
        return {
          card: "from-green-800/60 via-green-700/60 to-emerald-600/60",
          image: "from-green-600 to-green-500",
          shimmer: "from-transparent via-amber-400/30 to-transparent",
          text: "from-green-600 to-green-500",
        };
      case "space":
        return {
          card: "from-purple-800/60 via-purple-700/60 to-indigo-600/60",
          image: "from-purple-600 to-purple-500",
          shimmer: "from-transparent via-purple-400/30 to-transparent",
          text: "from-purple-600 to-purple-500",
        };
      case "sunset":
        return {
          card: "from-orange-800/60 via-red-700/60 to-yellow-600/60",
          image: "from-orange-600 to-orange-500",
          shimmer: "from-transparent via-orange-400/30 to-transparent",
          text: "from-orange-600 to-orange-500",
        };
      case "neon":
        return {
          card: "from-gray-800/60 via-blue-800/60 to-purple-700/60",
          image: "from-cyan-600 to-cyan-500",
          shimmer: "from-transparent via-cyan-400/30 to-transparent",
          text: "from-cyan-600 to-cyan-500",
        };
      default:
        return {
          card: "from-teal-800/60 via-teal-700/60 to-emerald-600/60",
          image: "from-teal-600 to-teal-500",
          shimmer: "from-transparent via-teal-400/30 to-transparent",
          text: "from-teal-600 to-teal-500",
        };
    }
  };

  const colors = getSkeletonColors();

  return (
    <div className={`bg-gradient-to-br ${colors.card} p-4 rounded-2xl overflow-hidden backdrop-blur-md border border-${theme.colors.songBorder}`}>
      {/* Image skeleton with shimmer effect */}
      <div className={`aspect-square bg-gradient-to-br ${colors.image} rounded-xl mb-4 relative overflow-hidden`}>
        <div
          className={`absolute inset-0 bg-gradient-to-r ${colors.shimmer} animate-pulse`}
          style={{
            animation: "shimmer 2s infinite",
          }}
        />
      </div>

      {/* Text skeleton */}
      <div className="space-y-2">
        <div className={`h-4 bg-gradient-to-r ${colors.text} rounded animate-pulse`} />
        <div className={`h-3 bg-gradient-to-r ${colors.text} rounded w-3/4 animate-pulse`} />
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
});

// Memoized SongGrid với lazy loading and theme support
const SongGrid = memo(
  ({
    songs,
    showRank = false,
    keyPrefix = "",
    contextMenu,
    setContextMenu,
    handleCloseContextMenu,
    isLoading = false,
  }) => {
    const { theme } = useTheme();
    const [visibleSongs, setVisibleSongs] = useState(songs.slice(0, 12));
    const [currentIndex, setCurrentIndex] = useState(12);

    // Update visible songs when songs prop changes
    useEffect(() => {
      setVisibleSongs(songs.slice(0, 12));
      setCurrentIndex(12);
    }, [songs]);

    // Lazy load more songs on scroll or interaction
    const loadMoreSongs = useCallback(() => {
      if (currentIndex < songs.length) {
        const nextBatch = songs.slice(currentIndex, currentIndex + 12);
        setVisibleSongs((prev) => [...prev, ...nextBatch]);
        setCurrentIndex((prev) => prev + 12);
      }
    }, [songs, currentIndex]);

    if (isLoading) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 gap-y-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <SongCardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      );
    }

    if (songs.length === 0) {
      return (
        <div className={`flex flex-col items-center justify-center py-12 text-${theme.colors.text}`}>
          <div className="text-4xl mb-4 opacity-50">🎵</div>
          <p className="text-lg mb-2">Không có bài hát nào</p>
          <p className={`text-sm opacity-75 text-${theme.colors.text}/60`}>Thể loại này chưa có bài hát</p>
        </div>
      );
    }

    return (
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 gap-y-6">
          {visibleSongs.map((song, index) => (
            <Song
              key={`${keyPrefix}-${song.id}`}
              song={song}
              contextMenu={contextMenu}
              setContextMenu={setContextMenu}
              handleCloseContextMenu={handleCloseContextMenu}
              list={songs}
              showRank={showRank}
              rank={showRank ? index + 1 : undefined}
            />
          ))}
        </div>

        {/* Load More Button nếu còn songs */}
        {currentIndex < songs.length && (
          <div className="text-center mt-6">
            <button
              onClick={loadMoreSongs}
              className={`px-6 py-3 bg-${theme.colors.card} hover:bg-${theme.colors.cardHover} text-${theme.colors.text} hover:text-white rounded-full transition-colors duration-200 border border-${theme.colors.border}`}
            >
              Xem thêm ({songs.length - currentIndex} bài)
            </button>
          </div>
        )}
      </div>
    );
  }
);

// Memoized TrendingSection with theme support
const TrendingSection = memo(
  ({ trendingSongs, contextMenu, setContextMenu, handleCloseContextMenu }) => {
    const { theme } = useTheme();
    
    return (
      <div className="mb-8">
        <div className="flex flex-row justify-between items-center mb-6">
          <h2 className={`text-2xl md:text-3xl font-bold cursor-pointer hover:underline transition-colors duration-200 hover:text-${theme.colors.secondary}-400 flex items-center gap-2`}>
            <span className="text-2xl">🔥</span>
            Trending ngay bây giờ
          </h2>
        </div>
        <div className="space-y-1">
          {trendingSongs.slice(0, 10).map((song, index) => (
            <TrendingSong
              key={`trending-${song.id}`}
              song={song}
              contextMenu={contextMenu}
              setContextMenu={setContextMenu}
              handleCloseContextMenu={handleCloseContextMenu}
              list={trendingSongs}
              rank={index + 1}
            />
          ))}
        </div>
      </div>
    );
  }
);

const MainContent = ({ setCurrentView, setListSongsDetail }) => {
  const { theme } = useTheme();
  const [allSongs, setAllSongs] = useState([]);
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [latestSongs, setLatestSongs] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [genreFilterLoading, setGenreFilterLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    allSongs: false,
    latest: false,
    genres: {},
  });

  // Memoized handlers
  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleClickOutside = useCallback(
    (e) => {
      if (contextMenu) {
        const contextMenuElement = document.querySelector(".context-menu");
        if (contextMenuElement && !contextMenuElement.contains(e.target)) {
          handleCloseContextMenu();
        }
      }
    },
    [contextMenu, handleCloseContextMenu]
  );

  // Context menu event listeners
  useEffect(() => {
    if (contextMenu) {
      const handleClick = (e) => handleClickOutside(e);
      const handleContextMenuClick = (e) => handleClickOutside(e);

      document.addEventListener("click", handleClick, { passive: true });
      document.addEventListener("contextmenu", handleContextMenuClick, {
        passive: true,
      });

      return () => {
        document.removeEventListener("click", handleClick);
        document.removeEventListener("contextmenu", handleContextMenuClick);
      };
    }
  }, [contextMenu, handleClickOutside]);

  // Initial data fetching
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          songsResponse,
          genresResponse,
          trendingResponse,
          latestResponse,
        ] = await Promise.all([
          getAllSongs(),
          getAllGenres(),
          getTrendingSongs(12),
          getLatestSongs(12),
        ]);

        setAllSongs(songsResponse?.data?.results || []);
        setGenres(genresResponse?.data?.results || []);
        setTrendingSongs(trendingResponse?.data?.results || []);
        setLatestSongs(latestResponse?.data?.results || []);

        // Set initial filtered songs to all songs
        setFilteredSongs(songsResponse?.data?.results || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load songs. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Handle genre filter selection
  const handleGenreSelect = useCallback(
    async (genre) => {
      setGenreFilterLoading(true);
      setSelectedGenre(genre);

      try {
        if (genre === null) {
          // Show all songs
          setFilteredSongs(allSongs);
        } else {
          // Filter songs by selected genre
          const genreSongs = genre.songs || [];
          setFilteredSongs(genreSongs);
        }
      } catch (error) {
        console.error("Error filtering by genre:", error);
      } finally {
        setGenreFilterLoading(false);
      }
    },
    [allSongs]
  );

  // Quick navigation function
  const handleAllSongs = useCallback(
    async (songs, title, genreId = null) => {
      if (!Array.isArray(songs)) {
        console.warn("Invalid songs data:", songs);
        return;
      }

      // Set loading state for specific genre if genreId is provided
      if (genreId) {
        setLoadingStates((prev) => ({
          ...prev,
          genres: { ...prev.genres, [genreId]: true },
        }));
      }

      // Show loading state on destination page first
      const loadingData = {
        songs: [],
        title: "Đang tải...",
        isLoading: true,
      };
      setListSongsDetail(loadingData);
      setCurrentView("listSongs");

      // Simulate loading time for better UX
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Then show actual data
      const data = {
        songs,
        title: title || "Songs",
        isLoading: false,
      };
      setListSongsDetail(data);

      // Clear loading state for genre button
      if (genreId) {
        setLoadingStates((prev) => ({
          ...prev,
          genres: { ...prev.genres, [genreId]: false },
        }));
      }
    },
    [setListSongsDetail, setCurrentView]
  );

  // Optimized load all songs with progress indication
  const handleLoadAllSongs = useCallback(async () => {
    if (loadingStates.allSongs) return;

    try {
      setLoadingStates((prev) => ({ ...prev, allSongs: true }));

      // Show immediate feedback
      const loadingToast = {
        songs: [],
        title: "Đang tải tất cả bài hát...",
        isLoading: true,
      };
      setListSongsDetail(loadingToast);
      setCurrentView("listSongs");

      // Fetch data with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      try {
        const allSongsResponse = await getAllSongsWithPagination({
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (allSongsResponse?.data?.results) {
          // Update with actual data
          const data = {
            songs: allSongsResponse.data.results,
            title: `Tất cả bài hát (${allSongsResponse.data.results.length} bài)`,
            isLoading: false,
          };
          setListSongsDetail(data);
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === "AbortError") {
          throw new Error("Request timeout");
        }
        throw fetchError;
      }
    } catch (error) {
      console.error("Error loading all songs:", error);

      // Update list view with error state
      const errorData = {
        songs: [],
        title: "Lỗi tải dữ liệu",
        error:
          error.message === "Request timeout"
            ? "Tải dữ liệu quá lâu. Vui lòng thử lại."
            : "Không thể tải tất cả bài hát. Vui lòng thử lại.",
        isLoading: false,
      };
      setListSongsDetail(errorData);
    } finally {
      setLoadingStates((prev) => ({ ...prev, allSongs: false }));
    }
  }, [setListSongsDetail, setCurrentView, loadingStates.allSongs]);

  // Optimized load more latest
  const handleLoadMoreLatest = useCallback(async () => {
    if (loadingStates.latest) return;

    try {
      setLoadingStates((prev) => ({ ...prev, latest: true }));

      // Show loading on destination page first
      const loadingData = {
        songs: [],
        title: "Đang tải bài hát mới nhất...",
        isLoading: true,
      };
      setListSongsDetail(loadingData);
      setCurrentView("listSongs");

      const response = await getLatestSongs(50);
      if (response?.data?.results) {
        const data = {
          songs: response.data.results,
          title: "🆕 Bài hát mới nhất",
          isLoading: false,
        };
        setListSongsDetail(data);
      }
    } catch (error) {
      console.error("Error loading more latest songs:", error);
      const errorData = {
        songs: [],
        title: "Lỗi tải dữ liệu",
        error: "Không thể tải bài hát mới. Vui lòng thử lại.",
        isLoading: false,
      };
      setListSongsDetail(errorData);
    } finally {
      setLoadingStates((prev) => ({ ...prev, latest: false }));
    }
  }, [setListSongsDetail, setCurrentView, loadingStates.latest]);

  // Handle genre view all with loading state
  const handleGenreViewAll = useCallback(
    (songs, title, genreId) => {
      handleAllSongs(songs, title, genreId);
    },
    [handleAllSongs]
  );

  // Memoized filtered genres
  const validGenres = useMemo(() => {
    return genres.filter(
      (genre) =>
        genre.songs && Array.isArray(genre.songs) && genre.songs.length > 0
    );
  }, [genres]);

  // Memoized display data
  const displayAllSongs = useMemo(() => allSongs.slice(0, 12), [allSongs]);
  const displayTrendingSongs = useMemo(
    () => trendingSongs.slice(0, 10),
    [trendingSongs]
  );

  // Enhanced loading state with theme colors
  if (loading) {
    return (
      <div className="text-white p-4 mr-0 md:mr-2 rounded-lg flex-1 overflow-y-auto scrollbar-spotify">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-6">
            {/* Main Loading Animation */}
            <div className="relative">
              {/* Pulsing Circle Background */}
              <div className="absolute inset-0 w-32 h-32 mx-auto">
                <div className={`w-full h-full rounded-full bg-${theme.colors.secondary}-500 opacity-20 animate-ping`}></div>
              </div>
              <div className="absolute inset-2 w-28 h-28 mx-auto">
                <div
                  className={`w-full h-full rounded-full bg-${theme.colors.secondary}-500 opacity-30 animate-ping`}
                  style={{ animationDelay: "0.5s" }}
                ></div>
              </div>

              {/* Central Music Icon */}
              <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                <div className={`w-20 h-20 bg-gradient-to-br from-${theme.colors.primary}-400 to-${theme.colors.secondary}-600 rounded-full flex items-center justify-center animate-bounce`}>
                  <svg
                    className="w-10 h-10 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Loading Text with Animation */}
            <div className="space-y-2">
              <h2 className={`text-2xl font-bold text-${theme.colors.secondary}-400 animate-pulse`}>
                Đang tải nhạc...
              </h2>
              <div className="flex justify-center space-x-1">
                {["🎵", "🎶", "🎵"].map((emoji, index) => (
                  <span
                    key={index}
                    className="text-2xl animate-bounce"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    {emoji}
                  </span>
                ))}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-64 mx-auto">
              <div className={`h-2 bg-${theme.colors.card} rounded-full overflow-hidden`}>
                <div className={`h-full bg-gradient-to-r from-${theme.colors.primary}-500 to-${theme.colors.secondary}-400 rounded-full animate-pulse`}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state with theme colors
  if (error) {
    return (
      <div className="text-white p-4 mr-0 md:mr-2 rounded-lg flex-1 overflow-y-auto scrollbar-spotify">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className={`text-red-400 mb-2`}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className={`text-${theme.colors.secondary}-500 hover:text-${theme.colors.secondary}-400 underline transition-colors`}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white p-3 md:p-4 mr-0 md:mr-2 rounded-lg flex-1 overflow-y-auto space-y-8 scrollbar-spotify pb-8">
      {/* Genre Filter Section */}
      {validGenres.length > 0 && (
        <GenreFilter
          genres={validGenres}
          selectedGenre={selectedGenre}
          onGenreSelect={handleGenreSelect}
          isLoading={genreFilterLoading}
        />
      )}

      {/* Filtered Songs Section (when genre is selected) */}
      {selectedGenre && (
        <Section
          title={`${selectedGenre.name}`}
          emoji="🎵"
          onViewAll={() =>
            handleGenreViewAll(
              filteredSongs,
              selectedGenre.name,
              selectedGenre.id
            )
          }
          isLoading={genreFilterLoading}
        >
          <SongGrid
            songs={filteredSongs.slice(0, 12)}
            keyPrefix={`filtered-${selectedGenre.id}`}
            contextMenu={contextMenu}
            setContextMenu={setContextMenu}
            handleCloseContextMenu={handleCloseContextMenu}
            isLoading={genreFilterLoading}
          />
        </Section>
      )}

      {/* Show other sections only when no genre is selected */}
      {!selectedGenre && (
        <>
          {/* Trending Songs Section */}
          {trendingSongs.length > 0 && (
            <TrendingSection
              trendingSongs={displayTrendingSongs}
              contextMenu={contextMenu}
              setContextMenu={setContextMenu}
              handleCloseContextMenu={handleCloseContextMenu}
            />
          )}

          {/* Latest Songs Section */}
          {latestSongs.length > 0 && (
            <Section
              title="Mới phát hành"
              emoji="🆕"
              onViewAll={handleLoadMoreLatest}
              isLoading={loadingStates.latest}
            >
              <SongGrid
                songs={latestSongs}
                keyPrefix="latest"
                contextMenu={contextMenu}
                setContextMenu={setContextMenu}
                handleCloseContextMenu={handleCloseContextMenu}
              />
            </Section>
          )}

          {/* All Songs Section */}
          {allSongs.length > 0 && (
            <Section
              title="Tất cả bài hát"
              onViewAll={handleLoadAllSongs}
              buttonText="Hiện tất cả"
              isLoading={loadingStates.allSongs}
            >
              <SongGrid
                songs={displayAllSongs}
                keyPrefix="all"
                contextMenu={contextMenu}
                setContextMenu={setContextMenu}
                handleCloseContextMenu={handleCloseContextMenu}
              />
            </Section>
          )}

          {/* Genres Sections */}
          {validGenres.map((genre) => (
            <Section
              key={genre.id}
              title={genre.name}
              onViewAll={() =>
                handleGenreViewAll(genre.songs, genre.name, genre.id)
              }
              isLoading={loadingStates.genres[genre.id]}
            >
              <SongGrid
                songs={genre.songs.slice(0, 12)}
                keyPrefix={`genre-${genre.id}`}
                contextMenu={contextMenu}
                setContextMenu={setContextMenu}
                handleCloseContextMenu={handleCloseContextMenu}
              />
            </Section>
          ))}
        </>
      )}

      {/* Empty State */}
      {allSongs.length === 0 &&
        trendingSongs.length === 0 &&
        latestSongs.length === 0 &&
        validGenres.length === 0 &&
        !loading && (
          <div className={`flex flex-col items-center justify-center h-64 text-${theme.colors.text}`}>
            <div className="text-6xl mb-4 opacity-50">🎵</div>
            <p className="text-xl mb-2 font-medium">No songs available</p>
            <p className={`text-sm opacity-75 text-${theme.colors.text}/60`}>
              Check back later for new content
            </p>
          </div>
        )}
    </div>
  );
};

export default MainContent;