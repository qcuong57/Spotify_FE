import React, { useState, useEffect, useRef } from "react";
import { Box, Text } from "@mantine/core";
import { IconX, IconHeart, IconHeartFilled, IconMicrophone } from "@tabler/icons-react";
import SyncedLyricsDisplay from "./SyncedLyricsDisplay";

const ExpandedSongView = ({
  currentSong,
  audio,
  isPlaying,
  theme,
  onClose,
  isVisible = true,
}) => {
  const [showLyrics, setShowLyrics] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const hasLyrics = currentSong?.lyrics && currentSong.lyrics.trim().length > 0;
  const hasTimestamps =
    hasLyrics &&
    currentSong.lyrics.includes("[") &&
    currentSong.lyrics.includes("]");

  useEffect(() => {
    // Auto show lyrics if available
    if (hasLyrics) {
      setShowLyrics(true);
    }
  }, [hasLyrics]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!currentSong) return null;

  return (
    <div
      className={`fixed inset-0 z-[20000] transition-all duration-300 ease-out ${
        isVisible && !isClosing
          ? "opacity-100 scale-100"
          : "opacity-0 scale-95"
      }`}
      style={{
        background: `linear-gradient(135deg, ${theme.colors.primary}-900/95, ${theme.colors.secondary}-800/95)`,
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-white/5 rounded-full -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-64 h-64 bg-white/3 rounded-full top-1/4 -right-32 animate-bounce" style={{ animationDuration: '3s' }}></div>
        <div className="absolute w-80 h-80 bg-white/4 rounded-full -bottom-40 left-1/4 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header - Only Close Button */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6">
        <div className="flex items-center justify-end">
          <div className="flex items-center space-x-3">
            {hasLyrics && (
              <button
                onClick={() => setShowLyrics(!showLyrics)}
                className={`p-3 rounded-full transition-all duration-200 backdrop-blur-sm border border-white/20 ${
                  showLyrics
                    ? `bg-white/25 text-white shadow-lg scale-105`
                    : `hover:bg-white/15 text-white/70 hover:text-white hover:scale-105`
                }`}
                title={showLyrics ? "Hide Lyrics" : "Show Lyrics"}
              >
                <IconMicrophone size={20} />
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-3 rounded-full hover:bg-white/15 transition-all duration-200 backdrop-blur-sm border border-white/20 hover:scale-105"
            >
              <IconX size={20} className="text-white/70 hover:text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-start justify-center h-full p-8 pt-24 pb-20 overflow-hidden">
        <div className={`flex items-start w-full h-full max-w-7xl mx-auto transition-all duration-500 ${
          showLyrics && hasLyrics ? 'gap-8' : 'justify-center items-center'
        }`}>
          
          {/* Album Art Section */}
          <div className={`flex-shrink-0 transition-all duration-500 ${
            showLyrics && hasLyrics ? 'w-5/12' : 'w-full flex justify-center'
          }`}>
            <div className="relative group">
              {/* Glowing Background Effect */}
              <div 
                className="absolute inset-0 rounded-3xl opacity-30 blur-3xl scale-110 transition-all duration-300 group-hover:opacity-50 group-hover:scale-115"
                style={{
                  background: `linear-gradient(45deg, ${theme.colors.primary}-500, ${theme.colors.secondary}-500)`,
                }}
              />
              
              {/* Main Album Art Container */}
              <div 
                className="relative mx-auto aspect-square rounded-3xl overflow-hidden shadow-2xl border border-white/10 transition-all duration-300 group-hover:shadow-3xl group-hover:scale-105"
                style={{
                  width: showLyrics && hasLyrics ? "100%" : "60%",
                  maxWidth: showLyrics && hasLyrics ? "450px" : "480px",
                }}
              >
                <img
                  src={currentSong.image}
                  alt={currentSong.song_name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  style={{
                    filter: "brightness(1.1) contrast(1.1) saturate(1.2)",
                  }}
                  onError={(e) => {
                    e.target.src = "/placeholder-album.jpg";
                  }}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                
                {/* Floating Music Note Animation */}
                <div className="absolute top-4 right-4 text-white/30 animate-bounce" style={{ animationDelay: '0.5s' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                </div>
              </div>

              {/* Song Info Below Album */}
              <div className="mt-8 text-center">
                <h1
                  className="font-bold text-white leading-tight mb-4 transition-all duration-300"
                  style={{
                    fontSize: showLyrics && hasLyrics ? "32px" : "36px",
                    lineHeight: 1.1,
                    textShadow: "0 2px 20px rgba(0,0,0,0.3)",
                  }}
                >
                  {currentSong.song_name || "Unknown Title"}
                </h1>
                <p
                  className="text-white/90 mb-8 transition-all duration-300"
                  style={{
                    fontSize: showLyrics && hasLyrics ? "20px" : "20px",
                    fontWeight: 500,
                    textShadow: "0 1px 10px rgba(0,0,0,0.2)",
                  }}
                >
                  {currentSong.singer_name || "Unknown Artist"}
                </p>
              </div>
            </div>
          </div>

          {/* Lyrics Section */}
          {showLyrics && hasLyrics && (
            <div className="flex-1 h-full min-w-0 flex flex-col">
              <div className="h-full flex flex-col max-h-[calc(100vh-200px)]">
                
                {/* Lyrics Container */}
                <div className="flex-1 min-h-0 relative overflow-hidden">
                  <div 
                    className="h-full w-full bg-black/25 rounded-2xl border border-white/15 backdrop-blur-sm shadow-inner transition-all duration-300 hover:bg-black/30 hover:border-white/25 overflow-hidden"
                  >
                    {hasTimestamps ? (
                      <div className="h-full w-full p-1 overflow-hidden">
                        <SyncedLyricsDisplay
                          lyricsText={currentSong.lyrics}
                          audioElement={audio}
                          isPlaying={isPlaying}
                          className="h-full w-full rounded-xl overflow-hidden"
                        />
                      </div>
                    ) : (
                      <div className="h-full w-full overflow-hidden">
                        <Box
                          style={{
                            height: "100%",
                            width: "100%",
                            overflowY: "auto",
                            overflowX: "hidden",
                            padding: "32px",
                            borderRadius: "16px",
                            maxHeight: "100%",
                          }}
                          className="custom-scrollbar"
                        >
                          <Text
                            style={{
                              color: "rgba(255, 255, 255, 0.95)",
                              fontSize: "24px",
                              fontWeight: 500,
                              lineHeight: 1.8,
                              textAlign: "left",
                              wordWrap: "break-word",
                              wordBreak: "break-word",
                              overflowWrap: "break-word",
                            }}
                          >
                            {currentSong.lyrics.split("\n").map((line, index) => (
                              <div
                                key={`lyric-line-${index}`}
                                className="transition-all duration-200 hover:text-white/95"
                                style={{ 
                                  marginBottom: line.trim() ? "16px" : "8px",
                                  maxWidth: "100%",
                                }}
                              >
                                {line.trim() || <br />}
                              </div>
                            ))}
                          </Text>
                        </Box>
                      </div>
                    )}
                  </div>
                  
                  {/* Scroll Indicator */}
                  <div className="absolute right-2 top-4 bottom-4 w-1 bg-white/10 rounded-full">
                    <div className="w-full h-8 bg-white/30 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
          background-clip: content-box;
        }

        /* Smooth animations */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.1); }
          50% { box-shadow: 0 0 40px rgba(255, 255, 255, 0.2); }
        }

        /* Enhanced hover effects */
        .group:hover .animate-bounce {
          animation: float 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ExpandedSongView;