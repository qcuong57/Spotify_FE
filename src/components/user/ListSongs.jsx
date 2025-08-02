import React, { useEffect, useState } from "react";
import Song from "./_Song";
import { useAudio } from "../../utils/audioContext.jsx";

const ListSongs = ({ listSongs }) => {
  const [contextMenu, setContextMenu] = useState(null);
  const { currentSong, songDescriptionAvailable } = useAudio();

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

  // Ensure we have valid data
  if (!listSongs || !listSongs.songs || !Array.isArray(listSongs.songs)) {
    return (
      <div className="text-white flex-1 mr-2 sm:mr-0 rounded-lg p-4">
        <p className="text-teal-300/80">No songs available</p>
      </div>
    );
  }

  return (
    <div className="text-white flex-1 mr-2 sm:mr-0 rounded-lg overflow-y-auto scrollbar-teal">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-teal-700/50 bg-gradient-to-t from-teal-900/30 via-teal-800/30 to-teal-700/30 backdrop-blur-md">
        <h3 className="p-4 font-bold text-xl sm:text-2xl text-teal-300">
          {listSongs.title || "Songs"}
        </h3>
      </div>

      {/* Songs Grid */}
      <div
        className={`
          grid gap-4 p-4
          ${
            songDescriptionAvailable
              ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
          }
        `}
      >
        {listSongs.songs.map((song, index) => (
          <Song
            key={`${song.id}-${index}`}
            song={song}
            contextMenu={contextMenu}
            setContextMenu={setContextMenu}
            handleCloseContextMenu={handleCloseContextMenu}
            list={listSongs.songs}
          />
        ))}
      </div>

      {/* Empty State */}
      {listSongs.songs.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-teal-300/80">
          <p className="text-lg mb-2">No songs found</p>
          <p className="text-sm">Try browsing other categories</p>
        </div>
      )}
    </div>
  );
};

export default ListSongs;