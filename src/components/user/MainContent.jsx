import React, { useEffect, useState } from "react";
import {
  getAllSongs,
  getAllSongsWithPagination,
} from "../../services/SongsService";
import { getAllGenres } from "../../services/genresService";
import Song from "./_Song";

const MainContent = ({ setCurrentView, setListSongsDetail }) => {
  const [allSongs, setAllSongs] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoadingAllSongs, setIsLoadingAllSongs] = useState(false);

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleClickOutside = (e) => {
    if (contextMenu) {
      const contextMenuElement = document.querySelector(".context-menu");
      if (contextMenuElement && !contextMenuElement.contains(e.target)) {
        handleCloseContextMenu();
      }
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("contextmenu", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("contextmenu", handleClickOutside);
    };
  }, [contextMenu]);

  useEffect(() => {
    const fetchAllSongs = async () => {
      try {
        setLoading(true);
        setError(null);

        const [songsResponse, genresResponse] = await Promise.all([
          getAllSongs(),
          getAllGenres(),
        ]);

        if (songsResponse?.data?.results) {
          setAllSongs(songsResponse.data.results);
        }

        if (genresResponse?.data?.results) {
          setGenres(genresResponse.data.results);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load songs. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllSongs();
  }, []);

  const handleAllSongs = async (songs, title) => {
    if (!Array.isArray(songs)) {
      console.warn("Invalid songs data:", songs);
      return;
    }

    // Start transition animation
    setIsTransitioning(true);

    // Add a slight delay for smooth transition
    setTimeout(() => {
      const data = {
        songs: songs,
        title: title || "Songs",
      };
      setListSongsDetail(data);
      setCurrentView("listSongs");
      setIsTransitioning(false);
    }, 300);
  };

  const handleLoadAllSongs = async () => {
    try {
      setIsLoadingAllSongs(true);
      setIsTransitioning(true);

      // Fetch all songs with pagination
      const allSongsResponse = await getAllSongsWithPagination();

      if (allSongsResponse?.data?.results) {
        // Add a slight delay for smooth transition
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
  };

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

  if (error) {
    return (
      <div className="bg-[#131313] text-white p-4 mr-0 md:mr-2 rounded-lg flex-1 overflow-y-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-400 mb-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-green-500 hover:text-green-400 underline"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 gap-y-6">
            {allSongs.slice(0, 12).map((song, index) => (
              <div
                key={song.id}
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
                  list={allSongs}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Genres Sections */}
      {genres.length > 0 &&
        genres.map((genre, genreIndex) => {
          if (
            !genre.songs ||
            !Array.isArray(genre.songs) ||
            genre.songs.length === 0
          ) {
            return null;
          }

          return (
            <div
              key={genre.id}
              className={`transition-all duration-700 ease-out ${
                isTransitioning
                  ? "opacity-40 translate-y-4"
                  : "opacity-100 translate-y-0"
              }`}
              style={{ transitionDelay: `${genreIndex * 100}ms` }}
            >
              <div className="flex flex-row justify-between items-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold cursor-pointer hover:underline transition-all duration-300 hover:text-green-400 hover:scale-105">
                  {genre.name}
                </h2>
                <button
                  className={`
                    text-sm font-semibold px-6 py-3 rounded-full
                    transition-all duration-300 ease-out
                    ${
                      isTransitioning
                        ? "pointer-events-none opacity-50 bg-green-600 text-white"
                        : "text-gray-400 hover:text-white hover:bg-green-600"
                    }
                  `}
                  onClick={() => handleAllSongs(genre.songs, genre.name)}
                  disabled={isTransitioning}
                >
                  {isTransitioning ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Đang tải...</span>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 gap-y-6">
                {genre.songs.slice(0, 12).map((song, index) => (
                  <div
                    key={`${genre.id}-${song.id}`}
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
                      list={genre.songs}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}

      {/* Empty State */}
      {allSongs.length === 0 && genres.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400 transition-all duration-500 ease-out">
          <p className="text-xl mb-2">No songs available</p>
          <p className="text-sm">Check back later for new content</p>
        </div>
      )}
    </div>
  );
};

export default MainContent;
