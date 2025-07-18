import React, { useEffect, useState } from "react";
import { getAllSongs } from "../../services/SongsService";
import { getAllGenres } from "../../services/genresService";
import Song from "./_Song";

const MainContent = ({ setCurrentView, setListSongsDetail }) => {
  const [allSongs, setAllSongs] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          getAllGenres()
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

  const handleAllSongs = (songs, title) => {
    if (!Array.isArray(songs)) {
      console.warn("Invalid songs data:", songs);
      return;
    }

    const data = {
      songs: songs,
      title: title || "Songs",
    };
    setListSongsDetail(data);
    setCurrentView("listSongs");
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
    <div className="bg-[#131313] text-white p-3 md:p-4 mr-0 md:mr-2 rounded-lg flex-1 overflow-y-auto space-y-8 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent pb-8">
      
      {/* All Songs Section */}
      {allSongs.length > 0 && (
        <div>
          <div className="flex flex-row justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold cursor-pointer hover:underline">
              Tất cả bài hát
            </h2>
            <button
              className="text-sm font-semibold text-gray-400 cursor-pointer hover:text-white hover:underline transition-colors px-4 py-2 rounded-full hover:bg-gray-800"
              onClick={() => handleAllSongs(allSongs, "Tất cả bài hát")}
            >
              Hiện tất cả
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 gap-y-6">
            {allSongs.slice(0, 12).map((song) => (
              <Song
                key={song.id}
                song={song}
                contextMenu={contextMenu}
                setContextMenu={setContextMenu}
                handleCloseContextMenu={handleCloseContextMenu}
                list={allSongs} // Pass the array directly
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Genres Sections */}
      {genres.length > 0 &&
        genres.map((genre) => {
          // Ensure genre has songs and it's an array
          if (!genre.songs || !Array.isArray(genre.songs) || genre.songs.length === 0) {
            return null;
          }

          return (
            <div key={genre.id}>
              <div className="flex flex-row justify-between items-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold cursor-pointer hover:underline">
                  {genre.name}
                </h2>
                <button
                  className="text-sm font-semibold text-gray-400 cursor-pointer hover:text-white hover:underline transition-colors px-4 py-2 rounded-full hover:bg-gray-800"
                  onClick={() => handleAllSongs(genre.songs, genre.name)}
                >
                  Hiện tất cả
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 gap-y-6">
                {genre.songs.slice(0, 12).map((song) => (
                  <Song
                    key={`${genre.id}-${song.id}`}
                    song={song}
                    contextMenu={contextMenu}
                    setContextMenu={setContextMenu}
                    handleCloseContextMenu={handleCloseContextMenu}
                    list={genre.songs} // Pass the songs array directly
                  />
                ))}
              </div>
            </div>
          );
        })}

      {/* Empty State */}
      {allSongs.length === 0 && genres.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <p className="text-xl mb-2">No songs available</p>
          <p className="text-sm">Check back later for new content</p>
        </div>
      )}
    </div>
  );
};

export default MainContent;