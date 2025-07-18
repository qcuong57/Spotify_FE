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

  return (
    <div className="bg-[#131313] text-white flex-1 mr-2 sm:mr-0 rounded-lg overflow-y-auto">
      <h3 className="p-3 font-bold text-xl sm:text-2xl">{listSongs.title}</h3>
      <div
        className={`grid gap-4 p-4 ${
          songDescriptionAvailable
            ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
            : "grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
        }`}
      >
        {listSongs.songs.length > 0 &&
          listSongs.songs.map((song, index) => (
            <Song
              key={song.id}
              song={song}
              contextMenu={contextMenu}
              setContextMenu={setContextMenu}
              handleCloseContextMenu={handleCloseContextMenu}
              list={listSongs}
            />
          ))}
      </div>
    </div>
  );
};

export default ListSongs;