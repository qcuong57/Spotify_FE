import { useState, useEffect, useRef } from "react";
import { deleteSongFromPlaylistService } from "../../../services/SongPlaylistService";
import { useAudio } from "../../../utils/audioContext";
import ContextMenu from "./_ContextMenu";
import { formatTime } from "../../../utils/timeFormat";

const Song = ({
  song,
  contextMenu,
  setContextMenu,
  handleCloseContextMenu,
  list,
}) => {
  const {
    setCurrentSong,
    currentSong,
    audio,
    setAudio,
    setIsPlaying,
    setNewPlaylist,
  } = useAudio();

  const playAudio = () => {
    setNewPlaylist(
      list,
      list.findIndex((s) => s.id === song.id)
    );
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      songId: song.id,
    });
  };

  return (
    <div
      className="group hover:bg-gradient-to-b from-[#131313] to-[#272727] text-white cursor-pointer p-2 md:p-3 rounded-md transition-all duration-300"
      onContextMenu={handleContextMenu}
    >
      <div className="relative">
        <img
          className="w-full aspect-square rounded-lg object-cover object-center"
          src={song.image}
          alt={song.song_name}
        />
        <button
          className="absolute bottom-2 right-2 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-green-400"
          onClick={(e) => {
            e.stopPropagation();
            playAudio();
          }}
        >
          <IconPlayerPlayFilled className="w-8 h-8 md:w-10 md:h-10 p-2 text-black" />
        </button>
      </div>
      <div className="mt-2">
        <h3 className="text-sm md:text-base font-medium truncate">
          {song.song_name}
        </h3>
        <span className="text-xs md:text-sm text-gray-400 truncate block">
          {song.singer_name}
        </span>
      </div>

      {contextMenu && contextMenu.songId === song.id && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          song={song}
          onClose={handleCloseContextMenu}
        />
      )}
    </div>
  );
};
export default Song;
