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
      <div className="bg-[#131313] text-white flex-1 mr-2 sm:mr-0 rounded-lg p-4">
        <p className="text-gray-400">No songs available</p>
      </div>
    );
  }

  return (
    <div className="bg-[#131313] text-white flex-1 mr-2 sm:mr-0 rounded-lg overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-[#131313] z-10 border-b border-gray-800">
        <h3 className="p-4 font-bold text-xl sm:text-2xl">
          {listSongs.title || "Songs"}
        </h3>
      </div>

      {/* Songs Grid */}
      <div
        className={`
          grid gap-4 p-4
          ${songDescriptionAvailable 
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
            list={listSongs.songs} // Pass the songs array directly
          />
        ))}
      </div>

      {/* Empty State */}
      {listSongs.songs.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <p className="text-lg mb-2">No songs found</p>
          <p className="text-sm">Try browsing other categories</p>
        </div>
      )}
    </div>
  );
};

export default ListSongs;