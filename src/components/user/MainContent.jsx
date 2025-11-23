import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAllSongs,
  getAllSongsWithPagination,
  getTrendingSongs,
  getLatestSongs,
  getTopSongs,
  getGenreRanking,
} from "../../services/SongsService";
import { getAllGenres } from "../../services/genresService";
import { useTheme } from "../../context/themeContext";
import { usePlayList } from "../../utils/playlistContext";
import GenreFilter from "../../components/user/main/GenreFilter";
import SongGrid from "../../components/user/main/SongGrid";
import TrendingSection from "../../components/user/main/TrendingSection";
import LoadingState from "../../components/user/main/LoadingState";
import ErrorState from "../../components/user/main/ErrorState";
import Section from "../../components/user/main/Section";
import TopSongsSection from "../../components/user/TopSongsSection";
import DailyMixSection from "../../components/user/DailyMixSection";
import PlaylistSection from "../../components/user/PlaylistSection";

// --- 1. TẠO CACHE BÊN NGOÀI COMPONENT ---
// Biến này sẽ tồn tại miễn là trang web chưa bị F5 (reload)
// Giúp dữ liệu giữ nguyên khi chuyển qua lại giữa các View
let cachedData = {
  allSongs: [],
  trendingSongs: [],
  latestSongs: [],
  topSongs: [],
  genreRanking: [],
  genres: [],
  timestamp: 0, // Dùng để kiểm tra thời gian cache (nếu cần reload sau X phút)
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 phút mới cần fetch lại API background

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4, // Giảm duration xuống chút cho cảm giác nhanh hơn
      ease: "easeOut", // Dùng easeOut cho mượt
      staggerChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
    },
  },
};

const emptyStateVariants = {
  initial: { opacity: 0, scale: 0.9, y: 30 }, // Giảm khoảng cách animation
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const MainContent = ({ setCurrentView, setListSongsDetail }) => {
  const { theme } = useTheme();
  const { playlists } = usePlayList();

  // --- 2. KHỞI TẠO STATE TỪ CACHE ---
  // Nếu có cache, loading = false ngay lập tức -> Hiển thị luôn UI
  const hasCache = cachedData.timestamp > 0;

  const [allSongs, setAllSongs] = useState(cachedData.allSongs);
  const [trendingSongs, setTrendingSongs] = useState(cachedData.trendingSongs);
  const [latestSongs, setLatestSongs] = useState(cachedData.latestSongs);
  const [topSongs, setTopSongs] = useState(cachedData.topSongs);
  const [genreRanking, setGenreRanking] = useState(cachedData.genreRanking);
  const [genres, setGenres] = useState(cachedData.genres);

  const [contextMenu, setContextMenu] = useState(null);
  const [loading, setLoading] = useState(!hasCache); // Chỉ loading nếu chưa có cache
  const [error, setError] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [filteredSongs, setFilteredSongs] = useState(cachedData.allSongs); // Init bằng cache luôn
  const [genreFilterLoading, setGenreFilterLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    allSongs: false,
    latest: false,
    topSongs: false,
    genres: {},
  });

  // Ref để tránh memory leak khi unmount giữa chừng fetch
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

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

  // --- 3. FETCH DATA TỐI ƯU ---
  useEffect(() => {
    const fetchAllData = async () => {
      // Nếu đã có cache và chưa hết hạn, không cần fetch lại để UI mượt mà
      // (Hoặc có thể fetch ngầm background nếu muốn update mới nhất)
      const now = Date.now();
      if (hasCache && now - cachedData.timestamp < CACHE_DURATION) {
        // Dữ liệu đã được load từ useState(init) ở trên, không cần làm gì thêm
        // Hoặc có thể set lại để chắc chắn
        setLoading(false);
        return;
      }

      try {
        // Chỉ hiện loading nếu chưa có dữ liệu nào (lần đầu tiên vào app)
        if (!hasCache) setLoading(true);
        setError(null);

        const [
          songsResponse,
          genresResponse,
          trendingResponse,
          topSongsResponse,
          genreRankingResponse,
          latestResponse,
        ] = await Promise.all([
          getAllSongs(),
          getAllGenres(),
          getTrendingSongs(12),
          getTopSongs(10),
          getGenreRanking(5),
          getLatestSongs(12),
        ]);

        if (isMounted.current) {
          const newAllSongs = songsResponse?.data?.results || [];
          const newGenres = genresResponse?.data?.results || [];
          const newTrending = trendingResponse?.data?.results || [];
          const newLatest = latestResponse?.data?.results || [];
          const newTop = topSongsResponse?.data?.results || [];
          const newRank = genreRankingResponse?.data || [];

          // Cập nhật State
          setAllSongs(newAllSongs);
          setGenres(newGenres);
          setTrendingSongs(newTrending);
          setLatestSongs(newLatest);
          setTopSongs(newTop);
          setGenreRanking(newRank);
          setFilteredSongs(newAllSongs);

          // Cập nhật Cache
          cachedData = {
            allSongs: newAllSongs,
            genres: newGenres,
            trendingSongs: newTrending,
            latestSongs: newLatest,
            topSongs: newTop,
            genreRanking: newRank,
            timestamp: Date.now(),
          };
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        if (isMounted.current) {
          if (isTokenExpired(error)) {
            setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          } else {
            // Nếu lỗi nhưng có cache cũ, vẫn dùng cache cũ chứ không hiện lỗi
            if (!hasCache) {
              setError("Không thể tải dữ liệu. Vui lòng thử lại.");
            }
          }
        }
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    fetchAllData();
  }, [hasCache]); // Dependency là hasCache để chạy 1 lần logic

  const handleGenreSelect = useCallback(
    async (genre) => {
      setGenreFilterLoading(true);
      setSelectedGenre(genre);
      try {
        if (genre === null) {
          setFilteredSongs(allSongs);
        } else {
          // Logic đơn giản hóa: Lọc từ allSongs có sẵn hoặc dùng songs trong genre
          // Nếu genre.songs có sẵn và đầy đủ thì dùng, không thì filter từ allSongs
          const genreSongs =
            genre.songs && genre.songs.length > 0
              ? genre.songs
              : allSongs.filter((s) => s.genre_id === genre.id); // Ví dụ filter dự phòng

          setFilteredSongs(genreSongs);
        }
      } catch (error) {
        console.error("Error filtering by genre:", error);
      } finally {
        // setTimeout nhỏ để tạo cảm giác chuyển đổi mượt mà, tránh nháy
        setTimeout(() => setGenreFilterLoading(false), 200);
      }
    },
    [allSongs]
  );

  const handleAllSongs = useCallback(
    async (songs, title, genreId = null) => {
      if (!Array.isArray(songs)) return;

      if (genreId) {
        setLoadingStates((prev) => ({
          ...prev,
          genres: { ...prev.genres, [genreId]: true },
        }));
      }

      // Pre-set view để UI phản hồi ngay lập tức
      const loadingData = { songs: [], title: "Đang tải...", isLoading: true };
      setListSongsDetail(loadingData);
      setCurrentView("listSongs");

      // Giả lập delay cực ngắn để thread render kịp UI chuyển trang
      await new Promise((resolve) => setTimeout(resolve, 50));

      const data = { songs, title: title || "Songs", isLoading: false };
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

  const handleLoadAllSongs = useCallback(async () => {
    if (loadingStates.allSongs) return;

    try {
      setLoadingStates((prev) => ({ ...prev, allSongs: true }));
      // Set UI ngay lập tức
      setListSongsDetail({
        songs: [],
        title: "Đang tải tất cả...",
        isLoading: true,
      });
      setCurrentView("listSongs");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      try {
        const allSongsResponse = await getAllSongsWithPagination({
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (allSongsResponse?.data?.results) {
          setListSongsDetail({
            songs: allSongsResponse.data.results,
            title: `Tất cả bài hát (${allSongsResponse.data.results.length} bài)`,
            isLoading: false,
          });
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error) {
      console.error("Error loading all songs:", error);
      // Xử lý lỗi...
    } finally {
      setLoadingStates((prev) => ({ ...prev, allSongs: false }));
    }
  }, [setListSongsDetail, setCurrentView, loadingStates.allSongs]);

  // Các hàm load khác giữ nguyên logic, chỉ cần đảm bảo gọi setListSongsDetail hợp lý
  const handleLoadMoreLatest = useCallback(async () => {
    if (loadingStates.latest) return;
    try {
      setLoadingStates((prev) => ({ ...prev, latest: true }));
      setListSongsDetail({
        songs: [],
        title: "Đang tải bài mới...",
        isLoading: true,
      });
      setCurrentView("listSongs");

      const response = await getLatestSongs(50);
      if (response?.data?.results) {
        setListSongsDetail({
          songs: response.data.results,
          title: "🆕 Bài hát mới nhất",
          isLoading: false,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, latest: false }));
    }
  }, [setListSongsDetail, setCurrentView, loadingStates.latest]);

  const handleLoadAllTopSongs = useCallback(async () => {
    if (loadingStates.topSongs) return;
    try {
      setLoadingStates((prev) => ({ ...prev, topSongs: true }));
      setListSongsDetail({
        songs: [],
        title: "Đang tải Top 100...",
        isLoading: true,
      });
      setCurrentView("listSongs");

      const topSongsResponse = await getTopSongs(100);
      if (topSongsResponse?.data?.results) {
        setListSongsDetail({
          songs: topSongsResponse.data.results,
          title: `👑 Top 100 Bài hát`,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, topSongs: false }));
    }
  }, [setListSongsDetail, setCurrentView, loadingStates.topSongs]);

  const handleGenreViewAll = useCallback(
    (songs, title, genreId) => {
      handleAllSongs(songs, title, genreId);
    },
    [handleAllSongs]
  );

  const validGenres = useMemo(() => {
    return genres.filter(
      (genre) =>
        genre.songs && Array.isArray(genre.songs) && genre.songs.length > 0
    );
  }, [genres]);

  // Memoize data hiển thị để tránh render lại khi scroll
  const displayAllSongs = useMemo(() => allSongs.slice(0, 12), [allSongs]);
  const displayTrendingSongs = useMemo(
    () => trendingSongs.slice(0, 10),
    [trendingSongs]
  );

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <motion.div
      className="text-white p-3 md:p-4 mr-0 md:mr-2 rounded-lg flex-1 overflow-y-auto space-y-8 scrollbar-spotify pb-8"
      variants={pageVariants}
      initial={hasCache ? "animate" : "initial"} // Nếu có cache, bỏ qua animation load vào
      animate="animate"
      exit="exit"
    >
      <AnimatePresence mode="wait">
        {validGenres.length > 0 && (
          <GenreFilter
            key="genre-filter"
            genres={validGenres}
            selectedGenre={selectedGenre}
            onGenreSelect={handleGenreSelect}
            isLoading={genreFilterLoading}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {playlists.length > 0 && (
          <PlaylistSection
            key="playlist-section"
            playlists={playlists}
            setCurrentView={setCurrentView}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {selectedGenre ? (
          <motion.div
            key="selected-genre-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
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
          </motion.div>
        ) : (
          <motion.div
            key="main-content-sections"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {trendingSongs.length > 0 && (
              <TrendingSection
                trendingSongs={displayTrendingSongs}
                contextMenu={contextMenu}
                setContextMenu={setContextMenu}
                handleCloseContextMenu={handleCloseContextMenu}
                index={0}
              />
            )}

            {topSongs.length > 0 && (
              <TopSongsSection
                topSongs={topSongs}
                contextMenu={contextMenu}
                setContextMenu={setContextMenu}
                handleCloseContextMenu={handleCloseContextMenu}
                onViewAll={handleLoadAllTopSongs}
                isLoading={loadingStates.topSongs}
                index={1}
              />
            )}

            <DailyMixSection
              contextMenu={contextMenu}
              setContextMenu={setContextMenu}
              handleCloseContextMenu={handleCloseContextMenu}
              setCurrentView={setCurrentView}
              setListSongsDetail={setListSongsDetail}
              index={1}
            />

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

            {validGenres.map((genre, idx) => (
              <Section
                key={genre.id}
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
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {allSongs.length === 0 &&
          trendingSongs.length === 0 &&
          latestSongs.length === 0 &&
          validGenres.length === 0 &&
          !loading && (
            <motion.div
              key="empty-state"
              className={`flex flex-col items-center justify-center h-64 text-${theme.colors.text}`}
              variants={emptyStateVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <motion.div
                className="text-6xl mb-4 opacity-50"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                🎵
              </motion.div>
              <p className="text-xl mb-2 font-medium">No songs available</p>
            </motion.div>
          )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MainContent;
