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

// Memoized Section component để tránh re-render không cần thiết
const Section = memo(
  ({
    title,
    emoji,
    children,
    onViewAll,
    buttonText = "Xem tất cả",
    hoverColor = "green",
    isTransitioning,
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
              isTransitioning
                ? `pointer-events-none opacity-50 bg-${hoverColor}-600 text-white`
                : `text-gray-400 hover:text-white hover:bg-${hoverColor}-600`
            }
          `}
            onClick={onViewAll}
            disabled={isTransitioning}
          >
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
          </button>
        )}
      </div>
      {children}
    </div>
  )
);

// Memoized SongGrid component
const SongGrid = memo(
  ({
    songs,
    showRank = false,
    keyPrefix = "",
    contextMenu,
    setContextMenu,
    handleCloseContextMenu,
  }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 gap-y-6">
      {songs.map((song, index) => (
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
  )
);

// Memoized TrendingSection component
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoadingAllSongs, setIsLoadingAllSongs] = useState(false);

  // Memoized handlers for better performance
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

  // Context menu event listeners - Tối ưu hóa
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

  // Data fetching - Không thay đổi
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

  // Tối ưu hóa transition handler
  const handleAllSongs = useCallback(
    (songs, title) => {
      if (!Array.isArray(songs)) {
        console.warn("Invalid songs data:", songs);
        return;
      }

      // Loại bỏ animation phức tạp, chỉ đơn giản set state
      const data = { songs, title: title || "Songs" };
      setListSongsDetail(data);
      setCurrentView("listSongs");
    },
    [setListSongsDetail, setCurrentView]
  );

  // Load more handlers - Tối ưu hóa với timeout và chunk loading
  const handleLoadAllSongs = useCallback(async () => {
    if (isLoadingAllSongs) return; // Prevent double clicks

    try {
      setIsLoadingAllSongs(true);

      // Thêm timeout để tránh blocking UI
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 15000)
      );

      const fetchPromise = getAllSongsWithPagination();

      const allSongsResponse = await Promise.race([
        fetchPromise,
        timeoutPromise,
      ]);

      if (allSongsResponse?.data?.results) {
        // Sử dụng requestAnimationFrame để không block UI thread
        requestAnimationFrame(() => {
          const data = {
            songs: allSongsResponse.data.results,
            title: `Tất cả bài hát (${allSongsResponse.data.results.length} bài)`,
          };
          setListSongsDetail(data);
          setCurrentView("listSongs");
        });
      }
    } catch (error) {
      console.error("Error loading all songs:", error);
      if (error.message === "Request timeout") {
        setError("Tải dữ liệu quá lâu. Vui lòng thử lại.");
      } else {
        setError("Không thể tải tất cả bài hát. Vui lòng thử lại.");
      }
    } finally {
      // Delay reset loading state một chút để UX tốt hơn
      setTimeout(() => {
        setIsLoadingAllSongs(false);
      }, 300);
    }
  }, [setListSongsDetail, setCurrentView, isLoadingAllSongs]);

  const handleLoadMoreLatest = useCallback(async () => {
    try {
      const response = await getLatestSongs(50);
      if (response?.data?.results) {
        handleAllSongs(response.data.results, "🆕 Bài hát mới nhất");
      }
    } catch (error) {
      console.error("Error loading more latest songs:", error);
    }
  }, [handleAllSongs]);

  // Memoized filtered genres
  const validGenres = useMemo(() => {
    return genres.filter(
      (genre) =>
        genre.songs && Array.isArray(genre.songs) && genre.songs.length > 0
    );
  }, [genres]);

  // Memoized sliced data để tránh re-compute
  const displayAllSongs = useMemo(() => allSongs.slice(0, 12), [allSongs]);
  const displayTrendingSongs = useMemo(
    () => trendingSongs.slice(0, 10),
    [trendingSongs]
  );

  // Loading state
  if (loading) {
    return (
      <div className="bg-[#131313] text-white p-4 mr-0 md:mr-2 rounded-lg flex-1 overflow-y-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
            <p className="text-gray-400">Loading songs...</p>
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
          isTransitioning={isTransitioning}
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
        <div className="mb-8">
          <div className="flex flex-row justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold cursor-pointer hover:underline transition-colors duration-200 hover:text-green-400">
              Tất cả bài hát
            </h2>
            <button
              className={`
                text-sm font-semibold px-6 py-3 rounded-full
                transition-colors duration-200
                ${
                  isLoadingAllSongs
                    ? "pointer-events-none opacity-50 bg-green-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-green-600"
                }
              `}
              onClick={handleLoadAllSongs}
              disabled={isLoadingAllSongs}
            >
              {isLoadingAllSongs ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang tải... {/* Có thể mất vài giây */}</span>
                </div>
              ) : (
                <span className="flex items-center gap-2">
                  <span>Hiện tất cả</span>
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
          </div>
          <SongGrid
            songs={displayAllSongs}
            keyPrefix="all"
            contextMenu={contextMenu}
            setContextMenu={setContextMenu}
            handleCloseContextMenu={handleCloseContextMenu}
          />
        </div>
      )}

      {/* Genres Sections */}
      {validGenres.map((genre) => (
        <Section
          key={genre.id}
          title={genre.name}
          onViewAll={() => handleAllSongs(genre.songs, genre.name)}
          hoverColor="green"
          isTransitioning={isTransitioning}
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
