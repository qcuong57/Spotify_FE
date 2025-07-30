import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  getAllSongs,
  getAllSongsWithPagination,
  getTrendingSongs,
  getLatestSongs,
} from "../../services/SongsService";
import { getAllGenres } from "../../services/genresService";
import Song from "./_Song";
import TrendingSong from "./TrendingSong ";

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

  // Context menu event listeners
  useEffect(() => {
    if (contextMenu) {
      document.addEventListener("click", handleClickOutside);
      document.addEventListener("contextmenu", handleClickOutside);
      return () => {
        document.removeEventListener("click", handleClickOutside);
        document.removeEventListener("contextmenu", handleClickOutside);
      };
    }
  }, [contextMenu, handleClickOutside]);

  // Data fetching
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

        // Set data with validation
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

  // Optimized transition handler
  const handleAllSongs = useCallback(
    async (songs, title) => {
      if (!Array.isArray(songs)) {
        console.warn("Invalid songs data:", songs);
        return;
      }

      setIsTransitioning(true);

      setTimeout(() => {
        const data = { songs, title: title || "Songs" };
        setListSongsDetail(data);
        setCurrentView("listSongs");
        setIsTransitioning(false);
      }, 300);
    },
    [setListSongsDetail, setCurrentView]
  );

  // Load more handlers
  const handleLoadAllSongs = useCallback(async () => {
    try {
      setIsLoadingAllSongs(true);
      setIsTransitioning(true);

      const allSongsResponse = await getAllSongsWithPagination();

      if (allSongsResponse?.data?.results) {
        setTimeout(() => {
          const data = {
            songs: allSongsResponse.data.results,
            title: `Tất cả bài hát (${allSongsResponse.data.results.length} bài)`,
          };
          setListSongsDetail(data);
          setCurrentView("listSongs");
          setIsTransitioning(false);
          setIsLoadingAllSongs(false);
        }, 300);
      }
    } catch (error) {
      console.error("Error loading all songs:", error);
      setError("Failed to load all songs. Please try again.");
      setIsTransitioning(false);
      setIsLoadingAllSongs(false);
    }
  }, [setListSongsDetail, setCurrentView]);

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

  // Section component for reusability
  const Section = ({
    title,
    emoji,
    children,
    onViewAll,
    buttonText = "Xem tất cả",
    hoverColor = "green",
  }) => (
    <div
      className={`transition-all duration-700 ease-out ${
        isTransitioning
          ? "opacity-40 translate-y-4"
          : "opacity-100 translate-y-0"
      }`}
    >
      <div className="flex flex-row justify-between items-center mb-6">
        <h2
          className={`text-2xl md:text-3xl font-bold cursor-pointer hover:underline transition-all duration-300 hover:text-${hoverColor}-400 hover:scale-105 flex items-center gap-2`}
        >
          {emoji && <span className="text-2xl">{emoji}</span>}
          {title}
        </h2>
        {onViewAll && (
          <button
            className={`
              text-sm font-semibold px-6 py-3 rounded-full
              transition-all duration-300 ease-out
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
  );

  // Grid component for song layouts
  const SongGrid = ({ songs, showRank = false, keyPrefix = "" }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 gap-y-6">
      {songs.map((song, index) => (
        <div
          key={`${keyPrefix}-${song.id}`}
          className={`transition-all duration-500 ease-out ${
            isTransitioning
              ? "opacity-20 translate-y-8 scale-95"
              : "opacity-100 translate-y-0 scale-100"
          }`}
          style={{ transitionDelay: `${index * 50}ms` }}
        >
          <Song
            song={song}
            contextMenu={contextMenu}
            setContextMenu={setContextMenu}
            handleCloseContextMenu={handleCloseContextMenu}
            list={songs}
            showRank={showRank}
            rank={showRank ? index + 1 : undefined}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div
      className={`
      bg-[#131313] text-white p-3 md:p-4 mr-0 md:mr-2 rounded-lg flex-1 overflow-y-auto 
      space-y-8 scrollbar-hide pb-8
      transition-all duration-500 ease-out transform
      ${
        isTransitioning
          ? "opacity-60 scale-[0.98] blur-sm"
          : "opacity-100 scale-100 blur-none"
      }
    `}
    >
      {/* Trending Songs Section */}
      {trendingSongs.length > 0 && (
        <div
          className={`transition-all duration-700 ease-out ${
            isTransitioning
              ? "opacity-40 translate-y-4"
              : "opacity-100 translate-y-0"
          }`}
        >
          <div className="flex flex-row justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold cursor-pointer hover:underline transition-all duration-300 hover:text-green-400 hover:scale-105 flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              Trending ngay bây giờ
            </h2>
          </div>
          <div className="space-y-1">
            {trendingSongs.slice(0, 10).map((song, index) => (
              <div
                key={`trending-${song.id}`}
                className={`transition-all duration-500 ease-out ${
                  isTransitioning
                    ? "opacity-20 translate-x-8 scale-95"
                    : "opacity-100 translate-x-0 scale-100"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <TrendingSong
                  song={song}
                  contextMenu={contextMenu}
                  setContextMenu={setContextMenu}
                  handleCloseContextMenu={handleCloseContextMenu}
                  list={trendingSongs}
                  rank={index + 1}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Latest Songs Section */}
      {latestSongs.length > 0 && (
        <Section
          title="Mới phát hành"
          emoji="🆕"
          onViewAll={handleLoadMoreLatest}
          hoverColor="green"
        >
          <SongGrid songs={latestSongs} keyPrefix="latest" />
        </Section>
      )}

      {/* All Songs Section */}
      {allSongs.length > 0 && (
        <div
          className={`transition-all duration-700 ease-out ${
            isTransitioning
              ? "opacity-40 translate-y-4"
              : "opacity-100 translate-y-0"
          }`}
        >
          <div className="flex flex-row justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold cursor-pointer hover:underline transition-all duration-300 hover:text-green-400 hover:scale-105">
              Tất cả bài hát
            </h2>
            <button
              className={`
                text-sm font-semibold px-6 py-3 rounded-full
                transition-all duration-300 ease-out
                ${
                  isTransitioning || isLoadingAllSongs
                    ? "pointer-events-none opacity-50 bg-green-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-green-600"
                }
              `}
              onClick={handleLoadAllSongs}
              disabled={isTransitioning || isLoadingAllSongs}
            >
              {isTransitioning || isLoadingAllSongs ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang tải tất cả...</span>
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
          <SongGrid songs={allSongs.slice(0, 12)} keyPrefix="all" />
        </div>
      )}

      {/* Genres Sections */}
      {validGenres.map((genre, genreIndex) => (
        <div
          key={genre.id}
          className={`transition-all duration-700 ease-out ${
            isTransitioning
              ? "opacity-40 translate-y-4"
              : "opacity-100 translate-y-0"
          }`}
          style={{ transitionDelay: `${genreIndex * 100}ms` }}
        >
          <Section
            title={genre.name}
            onViewAll={() => handleAllSongs(genre.songs, genre.name)}
            hoverColor="green"
          >
            <SongGrid
              songs={genre.songs.slice(0, 12)}
              keyPrefix={`genre-${genre.id}`}
            />
          </Section>
        </div>
      ))}

      {/* Empty State */}
      {allSongs.length === 0 &&
        trendingSongs.length === 0 &&
        topSongs.length === 0 &&
        latestSongs.length === 0 &&
        validGenres.length === 0 &&
        !loading && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 transition-all duration-500 ease-out">
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
