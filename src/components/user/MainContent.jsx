import React, { useEffect, useState, useMemo, useCallback, memo } from "react";
import {
  getAllSongs,
  getAllSongsWithPagination,
  getTrendingSongs,
  getLatestSongs,
} from "../../services/SongsService";
import { getAllGenres } from "../../services/genresService";
import Song from "./_Song";
import TrendingSong from "./TrendingSong ";

// Memoized Section component
const Section = memo(
  ({
    title,
    emoji,
    children,
    onViewAll,
    buttonText = "Xem tất cả",
    hoverColor = "green",
    isLoading = false,
  }) => (
    <div className="mb-8">
      <div className="flex flex-row justify-between items-center mb-6">
        <h2
          className={`text-2xl md:text-3xl font-bold cursor-pointer hover:underline transition-colors duration-200 hover:text-${hoverColor}-400 flex items-center gap-2`}
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
                ? `pointer-events-none opacity-50 bg-${hoverColor}-600 text-white`
                : `text-gray-400 hover:text-white hover:bg-${hoverColor}-600`
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
  )
);

const SongCardSkeleton = () => (
  <div className="bg-[#181818] p-4 rounded-lg overflow-hidden">
    {/* Image skeleton with shimmer effect */}
    <div className="aspect-square bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg mb-4 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600/50 to-transparent animate-pulse"
        style={{
          animation: "shimmer 2s infinite",
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
        }}
      ></div>
    </div>

    {/* Text skeleton */}
    <div className="space-y-2">
      <div className="h-4 bg-gradient-to-r from-gray-700 to-gray-600 rounded animate-pulse"></div>
      <div className="h-3 bg-gradient-to-r from-gray-700 to-gray-600 rounded w-3/4 animate-pulse"></div>
    </div>
  </div>
);

// Memoized SongGrid với lazy loading
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
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-colors duration-200"
            >
              Xem thêm ({songs.length - currentIndex} bài)
            </button>
          </div>
        )}
      </div>
    );
  }
);

// Memoized TrendingSection
const TrendingSection = memo(
  ({ trendingSongs, contextMenu, setContextMenu, handleCloseContextMenu }) => (
    <div className="mb-8">
      <div className="flex flex-row justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold cursor-pointer hover:underline transition-colors duration-200 hover:text-green-400 flex items-center gap-2">
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
  )
);

const MainContent = ({ setCurrentView, setListSongsDetail }) => {
  const [allSongs, setAllSongs] = useState([]);
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [latestSongs, setLatestSongs] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load songs. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Quick navigation function
  const handleAllSongs = useCallback(
    (songs, title, genreId = null) => {
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

      // Immediate navigation without delay
      const data = { songs, title: title || "Songs" };
      setListSongsDetail(data);
      setCurrentView("listSongs");

      // Clear loading state after navigation
      if (genreId) {
        setTimeout(() => {
          setLoadingStates((prev) => ({
            ...prev,
            genres: { ...prev.genres, [genreId]: false },
          }));
        }, 500);
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
      const response = await getLatestSongs(50);
      if (response?.data?.results) {
        handleAllSongs(response.data.results, "🆕 Bài hát mới nhất");
      }
    } catch (error) {
      console.error("Error loading more latest songs:", error);
      setError("Không thể tải bài hát mới. Vui lòng thử lại.");
    } finally {
      setLoadingStates((prev) => ({ ...prev, latest: false }));
    }
  }, [handleAllSongs, loadingStates.latest]);

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

  // Loading state
  if (loading) {
    return (
      <div className="bg-[#131313] text-white p-4 mr-0 md:mr-2 rounded-lg flex-1 overflow-y-auto">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-6">
            {/* Main Loading Animation */}
            <div className="relative">
              {/* Pulsing Circle Background */}
              <div className="absolute inset-0 w-32 h-32 mx-auto">
                <div className="w-full h-full rounded-full bg-green-500 opacity-20 animate-ping"></div>
              </div>
              <div className="absolute inset-2 w-28 h-28 mx-auto">
                <div
                  className="w-full h-full rounded-full bg-green-500 opacity-30 animate-ping"
                  style={{ animationDelay: "0.5s" }}
                ></div>
              </div>

              {/* Central Music Icon */}
              <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center animate-bounce">
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
              <h2 className="text-2xl font-bold text-green-400 animate-pulse">
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
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-[#131313] text-white p-4 mr-0 md:mr-2 rounded-lg flex-1 overflow-y-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-400 mb-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-green-500 hover:text-green-400 underline transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#131313] text-white p-3 md:p-4 mr-0 md:mr-2 rounded-lg flex-1 overflow-y-auto space-y-8 scrollbar-hide pb-8">
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
          hoverColor="green"
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
          hoverColor="green"
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
          hoverColor="green"
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

      {/* Empty State */}
      {allSongs.length === 0 &&
        trendingSongs.length === 0 &&
        latestSongs.length === 0 &&
        validGenres.length === 0 &&
        !loading && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <div className="text-6xl mb-4 opacity-50">🎵</div>
            <p className="text-xl mb-2 font-medium">No songs available</p>
            <p className="text-sm opacity-75">
              Check back later for new content
            </p>
          </div>
        )}
    </div>
  );
};

export default MainContent;
