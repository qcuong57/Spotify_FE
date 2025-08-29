import React, { useState, useEffect, useRef } from "react";
import { Box, Text } from "@mantine/core";
import { IconMusic, IconMicrophone } from "@tabler/icons-react";

const ExpandedSyncedLyrics = ({
  lyricsText,
  audioElement,
  isPlaying = false,
  className = "",
}) => {
  const [lyrics, setLyrics] = useState([]);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);
  const [currentTime, setCurrentTime] = useState(0);
  const containerRef = useRef(null);

  // Parse lyrics từ LRC format
  const parseLyricsFromText = (lyricsText) => {
    if (!lyricsText) return [];

    const lines = lyricsText.split("\n").filter((line) => line.trim() !== "");
    const parsedLines = [];

    lines.forEach((line, index) => {
      const timestampRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{2,3}))?\]/g;
      const timestamps = [];
      let match;

      while ((match = timestampRegex.exec(line)) !== null) {
        const minutes = parseInt(match[1]);
        const seconds = parseInt(match[2]);
        const centiseconds = parseInt(match[3] || 0);
        const timeInSeconds =
          minutes * 60 +
          seconds +
          centiseconds / (match[3]?.length === 3 ? 1000 : 100);
        timestamps.push(timeInSeconds);
      }

      if (timestamps.length > 0) {
        const textAfterTimestamps = line
          .replace(/\[(\d{1,2}):(\d{2})(?:\.(\d{2,3}))?\]\s*/g, "")
          .trim();

        if (textAfterTimestamps) {
          timestamps.forEach((time) => {
            parsedLines.push({
              time: time,
              text: textAfterTimestamps,
              id: `${time}-${index}-${Math.random()}`,
            });
          });
        }
      } else if (line.trim()) {
        parsedLines.push({
          time: null,
          text: line.trim(),
          id: `plain-${index}-${Math.random()}`,
          isPlain: true,
        });
      }
    });

    return parsedLines.sort((a, b) => {
      if (a.time === null) return 1;
      if (b.time === null) return -1;
      return a.time - b.time;
    });
  };

  // Initialize lyrics khi component mount
  useEffect(() => {
    if (lyricsText) {
      const parsed = parseLyricsFromText(lyricsText);
      setLyrics(parsed);
      setCurrentLyricIndex(-1);
    }
  }, [lyricsText]);

  // Update current time và tìm lyric hiện tại
  useEffect(() => {
    if (!audioElement || !isPlaying || lyrics.length === 0) return;

    const updateTime = () => {
      const time = audioElement.currentTime;
      setCurrentTime(time);

      const syncedLyrics = lyrics.filter((l) => l.time !== null);
      let activeIndex = -1;

      for (let i = 0; i < syncedLyrics.length; i++) {
        const currentLyric = syncedLyrics[i];
        const nextLyric = syncedLyrics[i + 1];

        if (
          currentLyric.time <= time &&
          (!nextLyric || nextLyric.time > time)
        ) {
          activeIndex = lyrics.findIndex(
            (lyric) => lyric.id === currentLyric.id
          );
          break;
        }
      }

      setCurrentLyricIndex(activeIndex);
    };

    const interval = setInterval(updateTime, 100);
    return () => clearInterval(interval);
  }, [audioElement, isPlaying, lyrics]);

  // Seek to specific lyric
  const seekToLyric = (time) => {
    if (audioElement && time !== null) {
      audioElement.currentTime = time;
    }
  };

  // Auto scroll to current lyric
  useEffect(() => {
    if (currentLyricIndex >= 0 && containerRef.current) {
      const container = containerRef.current;
      const currentElement = container.querySelector(
        `[data-index="${currentLyricIndex}"]`
      );

      if (currentElement) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = currentElement.getBoundingClientRect();
        const containerCenter = containerRect.height / 2;
        const elementCenter =
          elementRect.top - containerRect.top + elementRect.height / 2;
        const scrollOffset = elementCenter - containerCenter;

        container.scrollTo({
          top: container.scrollTop + scrollOffset,
          behavior: "smooth",
        });
      }
    }
  }, [currentLyricIndex]);

  const hasTimestamps = lyrics.some((lyric) => lyric.time !== null);

  // Empty state - no lyrics
  if (!lyrics.length) {
    return (
      <Box
        className={`${className}`}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <IconMusic
          size={48}
          style={{
            color: "rgba(255, 255, 255, 0.4)",
            marginBottom: "16px",
            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
          }}
        />
        <Text
          style={{
            color: "rgba(255, 255, 255, 0.6)",
            textAlign: "center",
            fontWeight: 500,
            fontSize: "16px",
            fontFamily:
              "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            letterSpacing: "0.5px",
            textShadow: "0 2px 4px rgba(0,0,0,0.3)",
          }}
        >
          No lyrics available
        </Text>
      </Box>
    );
  }

  // Single lyric mode (for large display)
  if (!hasTimestamps || lyrics.length <= 3) {
    const currentLyric =
      currentLyricIndex >= 0 ? lyrics[currentLyricIndex] : null;

    return (
      <Box
        className={`${className}`}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
          position: "relative",
          overflow: "hidden",
          cursor: currentLyric ? "pointer" : "default",
          padding: "40px",
        }}
        onClick={() => currentLyric && seekToLyric(currentLyric.time)}
      >
        {/* Waiting state */}
        {(!currentLyric || !isPlaying) && (
          <Box
            style={{
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <IconMicrophone
              size={56}
              style={{
                color: "rgba(255, 255, 255, 0.5)",
                marginBottom: "24px",
                filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.4))",
              }}
            />
            <Text
              style={{
                color: "rgba(255, 255, 255, 0.7)",
                textAlign: "center",
                fontWeight: 500,
                fontSize: "18px",
                fontFamily:
                  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                letterSpacing: "0.5px",
                textShadow: "0 4px 8px rgba(0,0,0,0.4)",
              }}
            >
              {lyrics.length > 0 && !isPlaying
                ? "Press play to start"
                : "Ready to play"}
            </Text>
          </Box>
        )}

        {/* Current lyric display */}
        {currentLyric && isPlaying && (
          <Box
            style={{
              textAlign: "center",
              width: "100%",
              position: "relative",
            }}
          >
            <Text
              style={{
                color: "rgba(255, 255, 255, 0.95)",
                fontSize: "36px",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                wordWrap: "break-word",
                textAlign: "center",
                fontFamily:
                  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                textShadow: "0 2px 20px rgba(0,0,0,0.5)",
                animation: "fadeIn 0.6s ease-out",
                position: "relative",
                zIndex: 1,
              }}
            >
              {currentLyric.text}
            </Text>
          </Box>
        )}

        <style jsx>{`
          @keyframes fadeIn {
            0% {
              opacity: 0;
              transform: translateY(20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </Box>
    );
  }

  // Scrollable lyrics mode - Spotify-like styling
  return (
    <Box
      ref={containerRef}
      className={`${className} custom-lyrics-scroll`}
      style={{
        width: "100%",
        height: "100%",
        background: "transparent",
        position: "relative",
        overflow: "auto",
        padding: "60px 32px",
        scrollBehavior: "smooth",
      }}
    >
      {/* Top fade gradient */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "80px",
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

      {/* Bottom fade gradient */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "80px",
          background: "linear-gradient(to top, rgba(0,0,0,0.3), transparent)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

      {/* Lyrics list */}
      <div style={{ padding: "40px 0" }}>
        {lyrics.map((lyric, index) => {
          const isActive = index === currentLyricIndex;
          const isPassed =
            hasTimestamps && lyric.time !== null && lyric.time < currentTime;
          const isNext = index === currentLyricIndex + 1;

          return (
            <div
              key={lyric.id}
              data-index={index}
              style={{
                padding: "20px 16px",
                marginBottom: "8px",
                cursor: lyric.time !== null ? "pointer" : "default",
                transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                borderRadius: "12px",
                position: "relative",
              }}
              onClick={() => lyric.time !== null && seekToLyric(lyric.time)}
              onMouseEnter={(e) => {
                if (lyric.time !== null && !isActive) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                }
              }}
              onMouseLeave={(e) => {
                if (lyric.time !== null && !isActive) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <Text
                style={{
                  color: isActive
                    ? "rgba(255, 255, 255, 1)"
                    : isPassed
                    ? "rgba(255, 255, 255, 0.4)"
                    : "rgba(255, 255, 255, 0.65)",
                  fontSize: isActive ? "32px" : "28px",
                  fontWeight: isActive ? 700 : 600,
                  lineHeight: 1.3,
                  textAlign: "left",
                  transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                  wordWrap: "break-word",
                  fontFamily:
                    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                  letterSpacing: isActive ? "-0.02em" : "-0.01em",
                  textShadow: isActive
                    ? "0 2px 20px rgba(0,0,0,0.4)"
                    : "0 1px 10px rgba(0,0,0,0.3)",
                  transform: isActive ? "translateX(8px)" : "translateX(0)",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {lyric.text}
              </Text>

              {/* Active lyric indicator */}
              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "4px",
                    height: "24px",
                    background: "rgba(255, 255, 255, 0.8)",
                    borderRadius: "2px",
                    animation: "slideIn 0.4s ease-out",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        /* Import Google Fonts */
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");

        .custom-lyrics-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
        }

        .custom-lyrics-scroll::-webkit-scrollbar {
          width: 4px;
        }

        .custom-lyrics-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-lyrics-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 2px;
          transition: background 0.2s ease;
        }

        .custom-lyrics-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.25);
        }

        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          0% {
            height: 0;
            opacity: 0;
          }
          100% {
            height: 24px;
            opacity: 1;
          }
        }
      `}</style>
    </Box>
  );
};

export default ExpandedSyncedLyrics;
