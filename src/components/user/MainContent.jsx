import React, { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAllSongs,
  getAllSongsWithPagination,
  getTrendingSongs,
  getLatestSongs,
  getTopSongs, // <--- THÊM MỚI
  getGenreRanking, // <--- THÊM MỚI
} from "../../services/SongsService";
import { getAllGenres } from "../../services/genresService";
import { useTheme } from "../../context/themeContext";
import { usePlayList } from "../../utils/playlistContext"; // <-- THÊM DÒNG NÀY
import GenreFilter from "../../components/user/main/GenreFilter";
import SongGrid from "../../components/user/main/SongGrid";
import TrendingSection from "../../components/user/main/TrendingSection";
import LoadingState from "../../components/user/main/LoadingState";
import ErrorState from "../../components/user/main/ErrorState";
import Section from "../../components/user/main/Section";
import TopSongsSection from "../../components/user/TopSongsSection";
import DailyMixSection from "../../components/user/DailyMixSection";
import PlaylistSection from "../../components/user/PlaylistSection"; // <-- THÊM DÒNG NÀY
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
    },
  },
};

const emptyStateVariants = {
  initial: { opacity: 0, scale: 0.8, y: 50 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const MainContent = ({ setCurrentView, setListSongsDetail }) => {
  const { theme } = useTheme();
  const { playlists } = usePlayList(); // <-- THÊM DÒNG NÀY
  const [allSongs, setAllSongs] = useState([]);
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [latestSongs, setLatestSongs] = useState([]);
  const [topSongs, setTopSongs] = useState([]); // <--- THÊM MỚI
  const [genreRanking, setGenreRanking] = useState([]);
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
    topSongs: false,
    genres: {},
  });

  const isTokenExpired = (error) => {
    if (
      error?.response?.status === 401 ||
      error?.response?.status === 403 ||
      error?.status === 401 ||
      error?.status === 403
    ) {
      return true;
    }

    const errorMessage =
      error?.message?.toLowerCase() ||
      error?.response?.data?.message?.toLowerCase() ||
      "";

    return (
      errorMessage.includes("token") ||
      errorMessage.includes("unauthorized") ||
      errorMessage.includes("authentication") ||
      errorMessage.includes("expired") ||
      errorMessage.includes("invalid token")
    );
  };

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
          topSongsResponse, // <--- THÊM MỚI
          genreRankingResponse, // <--- THÊM MỚI
          latestResponse,
        ] = await Promise.all([
          getAllSongs(),
          getAllGenres(),
          getTrendingSongs(12),
          getTopSongs(10), // <--- THÊM MỚI: Top 10 bài hát
          getGenreRanking(5), // <--- THÊM MỚI: Top 5 bài/thể loại
          getLatestSongs(12),
        ]);

        setAllSongs(songsResponse?.data?.results || []);
        setGenres(genresResponse?.data?.results || []);
        setTrendingSongs(trendingResponse?.data?.results || []);
        setLatestSongs(latestResponse?.data?.results || []);
        setTopSongs(topSongsResponse?.data?.results || []); // <--- THÊM MỚI
        setGenreRanking(genreRankingResponse?.data || []); // <--- THÊM MỚI
        setFilteredSongs(songsResponse?.data?.results || []);
      } catch (error) {
        console.error("Error fetching data:", error);

        if (isTokenExpired(error)) {
          setError(
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục."
          );
        } else {
          setError("Không thể tải dữ liệu. Vui lòng thử lại.");
        }
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
          setFilteredSongs(allSongs);
        } else {
          const genreSongs = genre.songs || [];
          setFilteredSongs(genreSongs);
        }
      } catch (error) {
        console.error("Error filtering by genre:", error);

        if (isTokenExpired(error)) {
          setError(
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục."
          );
        }
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

      if (genreId) {
        setLoadingStates((prev) => ({
          ...prev,
          genres: { ...prev.genres, [genreId]: true },
        }));
      }

      const loadingData = {
        songs: [],
        title: "Đang tải...",
        isLoading: true,
      };
      setListSongsDetail(loadingData);
      setCurrentView("listSongs");

      await new Promise((resolve) => setTimeout(resolve, 300));

      const data = {
        songs,
        title: title || "Songs",
        isLoading: false,
      };
      setListSongsDetail(data);

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

      const loadingToast = {
        songs: [],
        title: "Đang tải tất cả bài hát...",
        isLoading: true,
      };
      setListSongsDetail(loadingToast);
      setCurrentView("listSongs");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      try {
        const allSongsResponse = await getAllSongsWithPagination({
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (allSongsResponse?.data?.results) {
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

      let errorMessage = "Không thể tải tất cả bài hát. Vui lòng thử lại.";

      if (error.message === "Request timeout") {
        errorMessage = "Tải dữ liệu quá lâu. Vui lòng thử lại.";
      } else if (isTokenExpired(error)) {
        errorMessage =
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.";
      }

      const errorData = {
        songs: [],
        title: "Lỗi tải dữ liệu",
        error: errorMessage,
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

      let errorMessage = "Không thể tải bài hát mới. Vui lòng thử lại.";

      if (isTokenExpired(error)) {
        errorMessage =
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.";
      }

      const errorData = {
        songs: [],
        title: "Lỗi tải dữ liệu",
        error: errorMessage,
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

  // Optimized load all top songs with progress indication
  const handleLoadAllTopSongs = useCallback(async () => {
    // <--- THÊM MỚI
    if (loadingStates.topSongs) return;

    try {
      setLoadingStates((prev) => ({ ...prev, topSongs: true }));

      const loadingToast = {
        songs: [],
        title: "Đang tải Top 100 bài hát...",
        isLoading: true,
      };
      setListSongsDetail(loadingToast);
      setCurrentView("listSongs");

      // Gọi API với limit lớn hơn (ví dụ 100)
      const topSongsResponse = await getTopSongs(100);

      if (topSongsResponse?.data?.results) {
        const data = {
          songs: topSongsResponse.data.results,
          title: `👑 Top 100 Bài hát (${topSongsResponse.data.results.length} bài)`,
          isLoading: false,
        };
        setListSongsDetail(data);
      }
    } catch (error) {
      console.error("Error loading all top songs:", error);

      let errorMessage = "Không thể tải Top bài hát. Vui lòng thử lại.";

      if (isTokenExpired(error)) {
        errorMessage =
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.";
      }

      const errorData = {
        songs: [],
        title: "Lỗi tải dữ liệu",
        error: errorMessage,
        isLoading: false,
      };
      setListSongsDetail(errorData);
    } finally {
      setLoadingStates((prev) => ({ ...prev, topSongs: false }));
    }
  }, [setListSongsDetail, setCurrentView, loadingStates.topSongs]); // <--- THAY ĐỔI DEPENDENCY

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

  // Enhanced states with animations
  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <motion.div
      className="text-white p-3 md:p-4 mr-0 md:mr-2 rounded-lg flex-1 overflow-y-auto space-y-8 scrollbar-spotify pb-8"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Genre Filter Section */}
      {/* --- SỬA LỖI: TÁCH KHỐI ANIMATEPRESENCE --- */}
      <AnimatePresence>
        {validGenres.length > 0 && (
          <GenreFilter
            key="genre-filter" // Thêm key tường minh
            genres={validGenres}
            selectedGenre={selectedGenre}
            onGenreSelect={handleGenreSelect}
            isLoading={genreFilterLoading}
          />
        )}
      </AnimatePresence>
      
      {/* --- SỬA LỖI: ĐÂY LÀ KHỐI MỚI ĐƯỢC TÁCH RA --- */}
      <AnimatePresence>
        {playlists.length > 0 && (
          <PlaylistSection
            key="playlist-section" // Thêm key tường minh
            playlists={playlists}
            setCurrentView={setCurrentView}
          />
        )}
      </AnimatePresence>
      {/* --- KẾT THÚC SỬA LỖI --- */}

      {/* Filtered Songs Section (when genre is selected) */}
      <AnimatePresence>
        {selectedGenre && (
          <Section
            key={selectedGenre.id} // Sử dụng key động
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
            index={0}
          >
            <SongGrid
              songs={filteredSongs.slice(0, 12)}
              keyPrefix={`filtered-${selectedGenre.id}`}
              contextMenu={contextMenu}
              setContextMenu={setContextMenu}
              handleCloseContextMenu={handleCloseContextMenu}
              isLoading={genreFilterLoading}
              index={0}
            />
          </Section>
        )}
      </AnimatePresence>

      {/* Show other sections only when no genre is selected */}
      <AnimatePresence>
        {!selectedGenre && (
          // Thêm key tường minh cho fragment
          <React.Fragment key="main-content-sections"> 
            {/* Trending Songs Section */}
            {trendingSongs.length > 0 && (
              <TrendingSection
                trendingSongs={displayTrendingSongs}
                contextMenu={contextMenu}
                setContextMenu={setContextMenu}
                handleCloseContextMenu={handleCloseContextMenu}
                index={0}
              />
            )}

            {topSongs.length > 0 && ( // <--- THÊM MỚI
              <TopSongsSection
                topSongs={topSongs}
                contextMenu={contextMenu}
                setContextMenu={setContextMenu}
                handleCloseContextMenu={handleCloseContextMenu}
                onViewAll={handleLoadAllTopSongs}
                isLoading={loadingStates.topSongs}
                index={1} // Đổi index
              />
            )}

            {/* Daily Mix Section (TEST COMPONENT) */}
            <DailyMixSection // <--- THÊM COMPONENT MỚI
              contextMenu={contextMenu}
              setContextMenu={setContextMenu}
              handleCloseContextMenu={handleCloseContextMenu}
              setCurrentView={setCurrentView}
              setListSongsDetail={setListSongsDetail}
              index={1}
            />

            {/* Latest Songs Section */}
            {latestSongs.length > 0 && (
              <Section
                title="Mới phát hành"
                emoji="🆕"
                onViewAll={handleLoadMoreLatest}
                isLoading={loadingStates.latest}
                index={1}
              >
                <SongGrid
                  songs={latestSongs}
                  keyPrefix="latest"
                  contextMenu={contextMenu}
                  setContextMenu={setContextMenu}
                  handleCloseContextMenu={handleCloseContextMenu}
                  index={1}
                />
              </Section>
            )}

            {/* {genreRanking.length > 0 && ( // <--- THÊM MỚI
              <GenreRankingSection
                genreRanking={genreRanking}
                handleGenreViewAll={handleGenreViewAll}
                contextMenu={contextMenu}
                setContextMenu={setContextMenu}
                handleCloseContextMenu={handleCloseContextMenu}
                loadingStates={loadingStates}
              />
            )} */}

            {/* All Songs Section */}
            {allSongs.length > 0 && (
              <Section
                title="Tất cả bài hát"
                onViewAll={handleLoadAllSongs}
                buttonText="Hiện tất cả"
                isLoading={loadingStates.allSongs}
                index={2}
              >
                <SongGrid
                  songs={displayAllSongs}
                  keyPrefix="all"
                  contextMenu={contextMenu}
                  setContextMenu={setContextMenu}
                  handleCloseContextMenu={handleCloseContextMenu}
                  index={2}
                />
              </Section>
            )}

            {/* Genres Sections */}
            {validGenres.map((genre, idx) => (
              <Section
                key={genre.id} // Key này đã OK
                title={genre.name}
                onViewAll={() =>
                  handleGenreViewAll(genre.songs, genre.name, genre.id)
                }
                isLoading={loadingStates.genres[genre.id]}
                index={idx + 3}
              >
                <SongGrid
                  songs={genre.songs.slice(0, 12)}
                  keyPrefix={`genre-${genre.id}`}
                  contextMenu={contextMenu}
                  setContextMenu={setContextMenu}
                  handleCloseContextMenu={handleCloseContextMenu}
                  index={idx + 3}
                />
              </Section>
            ))}
          </React.Fragment>
        )}
      </AnimatePresence>

      {/* Empty State */}
      <AnimatePresence>
        {allSongs.length === 0 &&
          trendingSongs.length === 0 &&
          latestSongs.length === 0 &&
          validGenres.length === 0 &&
          !loading && (
            <motion.div
              key="empty-state" // Thêm key tường minh
              className={`flex flex-col items-center justify-center h-64 text-${theme.colors.text}`}
              variants={emptyStateVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <motion.div
                className="text-6xl mb-4 opacity-50"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                🎵
              </motion.div>
              <motion.p
                className="text-xl mb-2 font-medium"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                No songs available
              </motion.p>
              <motion.p
                className={`text-sm opacity-75 text-${theme.colors.text}/60`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                Check back later for new content
              </motion.p>
            </motion.div>
          )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MainContent;