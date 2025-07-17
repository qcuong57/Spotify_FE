// MainContent.jsx - Responsive version
import React, { useEffect, useState } from "react";
import { getAllSongs } from "../../services/SongsService";
import { getAllGenres } from "../../services/genresService";
import Song from "./_Song";

const MainContent = ({ setCurrentView, setListSongsDetail }) => {
  const [allSongs, setAllSongs] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [genres, setGenres] = useState([]);

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
        const response = await getAllSongs();
        setAllSongs(response.data.results);
        const genresResponse = await getAllGenres();
        setGenres(genresResponse.data.results);
      } catch (error) {
        console.error("Error fetching trending songs:", error);
      }
    };

    fetchAllSongs();
  }, []);

  const handleAllSongs = (songs, title) => {
    const data = {
      songs: songs,
      title: title,
    };
    setListSongsDetail(data);
    setCurrentView("listSongs");
  };

  return (
    <div className="bg-[#131313] text-white p-3 md:p-4 mr-0 md:mr-2 rounded-lg flex-1 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
      <div>
        <div className="flex flex-row justify-between items-center mb-4">
          <h2 className="text-lg md:text-2xl font-bold cursor-pointer hover:underline">
            Tất cả bài hát
          </h2>
          <button
            className="text-xs md:text-sm font-bold text-gray-400 cursor-pointer hover:text-white hover:underline transition-colors"
            onClick={() => handleAllSongs(allSongs, "Tất cả bài hát")}
          >
            Hiện tất cả
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {allSongs.slice(0, 12).map((song) => (
            <Song
              key={song.id}
              song={song}
              contextMenu={contextMenu}
              setContextMenu={setContextMenu}
              handleCloseContextMenu={handleCloseContextMenu}
              list={allSongs}
            />
          ))}
        </div>
      </div>
      
      {genres.length > 0 &&
        genres.map((genre) => (
          <div key={genre.id}>
            <div className="flex flex-row justify-between items-center mb-4">
              <h2 className="text-lg md:text-2xl font-bold cursor-pointer hover:underline">
                {genre.name}
              </h2>
              <button
                className="text-xs md:text-sm font-bold text-gray-400 cursor-pointer hover:text-white hover:underline transition-colors"
                onClick={() => handleAllSongs(genre.songs, genre.name)}
              >
                Hiện tất cả
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {genre.songs.slice(0, 12).map((song) => (
                <Song
                  key={song.id}
                  song={song}
                  contextMenu={contextMenu}
                  setContextMenu={setContextMenu}
                  handleCloseContextMenu={handleCloseContextMenu}
                  list={genre.songs}
                />
              ))}
            </div>
          </div>
        ))}
    </div>
  );
};
export default MainContent;