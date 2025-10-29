import React, { useState, useEffect, useRef } from "react";
import { Box, Text } from "@mantine/core";
import {
  IconX,
  IconHeart,
  IconHeartFilled,
  IconMicrophone,
} from "@tabler/icons-react";
import ExpandedSyncedLyrics from "./ExpandedSyncedLyrics";

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
        isVisible && !isClosing ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
      style={{
        background: `linear-gradient(135deg, ${theme.colors.primary}-900, ${theme.colors.secondary}-800)`,
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-white/5 rounded-full -top-48 -left-48 animate-pulse"></div>
        <div
          className="absolute w-64 h-64 bg-white/3 rounded-full top-1/4 -right-32 animate-bounce"
          style={{ animationDuration: "3s" }}
        ></div>
        <div
          className="absolute w-80 h-80 bg-white/4 rounded-full -bottom-40 left-1/4 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* Header - Only Close Button */}
      {/* CẬP NHẬT: Responsive padding (p-4 md:p-6) */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 md:p-6">
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
      {/* CẬP NHẬT: Thêm flex-col, overflow-y-auto, và padding responsive */}
      <div className="flex flex-col md:flex-row items-center md:items-start h-full p-4 pt-20 pb-16 md:p-8 md:pt-24 md:pb-20 overflow-y-auto scrollbar-spotify">
        <div
          className={`flex flex-col md:flex-row items-center md:items-start w-full h-full max-w-7xl mx-auto transition-all duration-500 gap-4 md:gap-8 ${
            showLyrics && hasLyrics ? "" : "justify-center"
          }`}
        >
          {/* Album Art Section */}
          {/* CẬP NHẬT: Logic responsive w-full md:w-5/12 */}
          <div
            className={`flex-shrink-0 transition-all duration-500 w-full flex justify-center ${
              showLyrics && hasLyrics ? "md:w-5/12" : "md:w-full"
            }`}
          >
            <div className="relative group">
              {/* Glowing Background Effect */}
              <div
                className="absolute inset-0 rounded-3xl opacity-30 blur-3xl scale-110 transition-all duration-300 group-hover:opacity-50 group-hover:scale-115"
                style={{
                  background: `linear-gradient(45deg, ${theme.colors.primary}-500, ${theme.colors.secondary}-500)`,
                }}
              />

              {/* Main Album Art Container - CẬP NHẬT: Kích thước responsive */}
              <div
                className="relative mx-auto aspect-square rounded-3xl overflow-hidden shadow-2xl border border-white/10 transition-all duration-300 group-hover:shadow-3xl group-hover:scale-105 w-full max-w-xs sm:max-w-sm md:max-w-none md:w-[400px] md:h-[400px]"
                // BỎ: style={{ width: "400px", height: "400px", ... }}
              >
                <img
                  src={currentSong.image}
                  alt={currentSong.song_name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  style={{
                    filter: "brightness(1.1) contrast(1.1) saturate(1.2)",
                    // BỎ: width: "400px", height: "400px",
                  }}
                  onError={(e) => {
                    e.target.src = "/placeholder-album.jpg";
                  }}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                {/* Floating Music Note Animation */}
                <div
                  className="absolute top-4 right-4 text-white/30 animate-bounce"
                  style={{ animationDelay: "0.5s" }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>
              </div>

              {/* Song Info Below Album */}
              {/* CẬP NHẬT: Responsive margin (mt-6 md:mt-8) */}
              <div className="mt-6 md:mt-8 text-center">
                <h1
                  // CẬP NHẬT: Thêm class font-size responsive
                  className={`font-bold text-white leading-tight mb-4 transition-all duration-300 text-2xl ${
                    showLyrics && hasLyrics
                      ? "md:text-[32px]"
                      : "md:text-[36px]"
                  }`}
                  style={{
                    // BỎ: fontSize
                    lineHeight: 1.1,
                    textShadow: "0 2px 20px rgba(0,0,0,0.3)",
                  }}
                >
                  {currentSong.song_name || "Unknown Title"}
                </h1>
                <p
                  // CẬP NHẬT: Thêm class font-size responsive (text-lg md:text-xl)
                  className={`text-white/90 mb-8 transition-all duration-300 text-lg md:text-xl`}
                  style={{
                    // BỎ: fontSize
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
          {/* CẬP NHẬT: Thêm w-full cho mobile */}
          {showLyrics && hasLyrics && (
            <div className="flex-1 h-full min-w-0 flex flex-col w-full">
              <div className="h-full flex flex-col md:max-h-[calc(100vh-200px)]">
                {/* Lyrics Container */}
                <div className="flex-1 min-h-0 relative overflow-hidden">
                  <div className="h-full w-full rounded-2xl overflow-hidden">
                    {hasTimestamps ? (
                      <div className="h-full w-full p-1 overflow-hidden">
                        <ExpandedSyncedLyrics
                          lyricsText={currentSong.lyrics}
                          audioElement={audio}
                          isPlaying={isPlaying}
                          className="h-full w-full rounded-xl overflow-hidden"
                        />
                      </div>
                    ) : (
                      <div className="h-full w-full overflow-hidden">
                        <Box
                          // CẬP NHẬT: Thêm class padding responsive
                          className="custom-scrollbar p-4 md:p-8"
                          style={{
                            height: "100%",
                            width: "100%",
                            overflowY: "auto",
                            overflowX: "hidden",
                            borderRadius: "16px",
                            maxHeight: "100%",
                            background: "transparent",
                            // BỎ: padding: "32px",
                          }}
                        >
                          <Text
                            // CẬP NHẬT: Thêm class font-size & line-height responsive
                            className="text-lg leading-relaxed md:text-2xl md:leading-[1.8]"
                            style={{
                              color: "rgba(255, 255, 255, 0.95)",
                              // BỎ: fontSize: "24px",
                              fontWeight: 500,
                              // BỎ: lineHeight: 1.8,
                              textAlign: "left",
                              wordWrap: "break-word",
                              wordBreak: "break-word",
                              overflowWrap: "break-word",
                            }}
                          >
                            {currentSong.lyrics
                              .split("\n")
                              .map((line, index) => (
                                <div
                                  key={`lyric-line-${index}`}
                                  className="transition-all duration-200 hover:text-white/95"
                                  style={{
                                    // CẬP NHẬT: Giảm margin bottom một chút
                                    marginBottom: line.trim() ? "12px" : "8px",
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
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .custom-scrollbar::-webkit-scrollbar {
          display: none;
        }

        /* Smooth animations */
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes glow {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
          }
          50% {
            box-shadow: 0 0 40px rgba(255, 255, 255, 0.2);
          }
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