import { useEffect, useState } from "react";
import { useAudio } from "../../utils/audioContext";
import { IconPlayerPlayFilled, IconPlayerPauseFilled } from "@tabler/icons-react";
import ContextMenu from "./library/_ContextMenu";

const Song = ({ song, contextMenu, setContextMenu, handleCloseContextMenu, list }) => {
    const { setCurrentSong, currentSong, audio, setAudio, setIsPlaying, isPlaying, setNewPlaylist } = useAudio();
    const [isHovered, setIsHovered] = useState(false);

    // Check if this song is currently playing
    const isCurrentSong = currentSong?.id === song.id;

    const playAudio = () => {
        // Ensure list is an array and has songs
        const songList = Array.isArray(list) ? list : (list?.songs || []);
        
        if (songList.length === 0) {
            console.warn("No songs available in the list");
            return;
        }

        const currentIndex = songList.findIndex((s) => s.id === song.id);
        
        if (currentIndex === -1) {
            console.warn("Song not found in the list");
            return;
        }

        setNewPlaylist(songList, currentIndex);
    };

    const togglePlayPause = () => {
        if (isCurrentSong && isPlaying) {
            setIsPlaying(false);
        } else {
            playAudio();
        }
    };

    // Handle right-click to show context menu
    const handleContextMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Opening context menu for song:", song.id);
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            songId: song.id,
        });
    };

    return (
        <div 
            className="group relative bg-[#181818] hover:bg-[#282828] transition-all duration-300 p-4 rounded-lg cursor-pointer"
            onClick={playAudio}
            onContextMenu={handleContextMenu}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Album Art Container */}
            <div className="relative mb-4">
                <div className="relative aspect-square overflow-hidden rounded-lg shadow-lg">
                    <img 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                        src={song.image} 
                        alt={song.song_name}
                        loading="lazy"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
                    
                    {/* Play Button */}
                    <div className="absolute bottom-2 right-2">
                        <button
                            className={`
                                w-12 h-12 bg-green-500 rounded-full flex items-center justify-center
                                shadow-lg transition-all duration-300 transform
                                hover:scale-110 hover:bg-green-400
                                ${isHovered || isCurrentSong ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
                            `}
                            onClick={(e) => {
                                e.stopPropagation();
                                togglePlayPause();
                            }}
                        >
                            {isCurrentSong && isPlaying ? (
                                <IconPlayerPauseFilled className="w-6 h-6 text-black" />
                            ) : (
                                <IconPlayerPlayFilled className="w-6 h-6 text-black ml-0.5" />
                            )}
                        </button>
                    </div>

                    {/* Now Playing Indicator */}
                    {isCurrentSong && (
                        <div className="absolute top-2 right-2">
                            <div className="flex space-x-1">
                                <div className={`w-1 h-4 bg-green-500 rounded-full animate-pulse ${isPlaying ? 'animate-bounce' : ''}`} />
                                <div className={`w-1 h-4 bg-green-500 rounded-full animate-pulse ${isPlaying ? 'animate-bounce' : ''}`} style={{ animationDelay: '0.1s' }} />
                                <div className={`w-1 h-4 bg-green-500 rounded-full animate-pulse ${isPlaying ? 'animate-bounce' : ''}`} style={{ animationDelay: '0.2s' }} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Song Info */}
            <div className="space-y-2">
                <h3 className={`
                    text-base font-semibold line-clamp-2 leading-tight
                    ${isCurrentSong ? 'text-green-500' : 'text-white'}
                    group-hover:text-white transition-colors
                `}>
                    {song.song_name || "Unknown Title"}
                </h3>
                <p className="text-sm text-gray-400 line-clamp-1 group-hover:text-gray-300 transition-colors">
                    {song.singer_name || "Unknown Artist"}
                </p>
            </div>

            {/* Context Menu */}
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