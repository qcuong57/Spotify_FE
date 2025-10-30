import React from 'react';
import { useTheme } from '../../context/themeContext'; // Điều chỉnh đường dẫn nếu cần
import { IconMusic } from '@tabler/icons-react';
import { motion } from 'framer-motion';

/**
 * Component con để render một thẻ playlist
 */
const PlaylistCard = ({ playlist, setCurrentView, theme }) => {
  
  const handlePlaylistClick = () => {
    setCurrentView(playlist);
  };

  const isLiked = playlist.is_liked_song;
  
  return (
    <motion.div
      className="flex-shrink-0 w-36 md:w-44 cursor-pointer group"
      onClick={handlePlaylistClick}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div 
        className={`relative aspect-square w-full rounded-lg shadow-lg overflow-hidden border border-transparent group-hover:border-${theme.colors.primary}-500/50 transition-all`}
        // layoutId={`playlist-cover-${playlist.id}`} // <-- XÓA DÒNG NÀY
      >
        {isLiked ? (
          // Thẻ "Liked Songs"
          <div
            className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-${theme.colors.primary}-800 to-${theme.colors.secondary}-700`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className={`w-16 h-16 text-${theme.colors.secondary}-200`}
            >
              <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
            </svg>
          </div>
        ) : playlist.image ? (
          // Thẻ playlist có ảnh
          <img
            src={playlist.image}
            alt={playlist.title}
            className="w-full h-full object-cover"
          />
        ) : (
          // Thẻ playlist không có ảnh (placeholder)
          <div
            className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-${theme.colors.card} to-gray-800/30 border border-${theme.colors.border}`}
          >
            <IconMusic
              stroke={2}
              className={`w-16 h-16 text-${theme.colors.text}/60`}
            />
          </div>
        )}
      </motion.div>
      <h4 className="text-sm font-semibold text-white truncate mt-2 group-hover:text-white">
        {playlist.title}
      </h4>
      <p className={`text-xs text-${theme.colors.text} truncate`}>
        Playlist
      </p>
    </motion.div>
  );
};

/**
 * Component chính cho cả khu vực "Thư viện"
 */
const PlaylistSection = ({ playlists, setCurrentView }) => {
  const { theme } = useTheme();

  // Chỉ hiển thị 8 playlist đầu tiên trên MainContent
  const displayPlaylists = playlists.slice(0, 8);

  // Không hiển thị gì nếu không có playlist
  if (displayPlaylists.length === 0) {
    return null; 
  }

  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }} // Delay nhỏ
    >
      <h2 className="text-2xl font-bold text-white">Thư viện của bạn</h2>
      <div className="flex overflow-x-auto gap-4 md:gap-6 pb-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent -ml-3 pl-3">
        {displayPlaylists.map((playlist) => (
          <PlaylistCard
            key={playlist.id}
            playlist={playlist}
            setCurrentView={setCurrentView}
            theme={theme}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default PlaylistSection;