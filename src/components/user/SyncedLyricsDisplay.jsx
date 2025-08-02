import React, { useState, useEffect, useRef } from "react";
import { Box, Text } from "@mantine/core";
import { IconMusic, IconMicrophone } from "@tabler/icons-react";

const SyncedLyricsDisplay = ({
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
          background: "transparent", // Đã loại bỏ background
          position: "relative",
          overflow: "hidden",
        }}
      >
        <IconMusic
          size={32}
          style={{
            color: "rgba(209, 250, 229, 0.6)", // teal-300/60
            marginBottom: "8px",
          }}
        />
        <Text
          size="sm"
          style={{
            color: "rgba(209, 250, 229, 0.8)", // teal-300/80
            textAlign: "center",
            fontWeight: 500,
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
          background: "transparent", // Đã loại bỏ background
          position: "relative",
          overflow: "hidden",
          cursor: currentLyric ? "pointer" : "default",
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
              size={28}
              style={{
                color: "rgba(209, 250, 229, 0.6)", // teal-300/60
                marginBottom: "8px",
              }}
            />
            <Text
              size="md"
              style={{
                color: "rgba(209, 250, 229, 0.8)", // teal-300/80
                textAlign: "center",
                fontWeight: 500,
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
              padding: "16px",
              position: "relative",
            }}
          >
            <Text
              style={{
                color: "rgba(209, 250, 229, 1)", // teal-300
                fontSize: "16px",
                fontWeight: 600,
                letterSpacing: "0.3px",
                lineHeight: 1.4,
                wordWrap: "break-word",
                textAlign: "center",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                animation: "fadeSlideIn 0.6s ease-out",
              }}
            >
              {currentLyric.text}
            </Text>
          </Box>
        )}

        <style jsx>{`
          @keyframes fadeSlideIn {
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

  // Scrollable lyrics mode
  return (
    <Box
      ref={containerRef}
      className={`${className}`}
      style={{
        width: "100%",
        height: "100%",
        background: "transparent", // Đã loại bỏ background
        position: "relative",
        overflow: "auto",
        padding: "12px 8px",
        scrollBehavior: "smooth",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      <style jsx>{`
        .${className}::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Lyrics list - đã loại bỏ Top/Bottom gradients */}
      <div style={{ padding: "20px 0" }}>
        {lyrics.map((lyric, index) => {
          const isActive = index === currentLyricIndex;
          const isPassed =
            hasTimestamps && lyric.time !== null && lyric.time < currentTime;
          const isUpcoming =
            hasTimestamps && lyric.time !== null && lyric.time > currentTime;

          return (
            <div
              key={lyric.id}
              data-index={index}
              style={{
                padding: "8px 16px",
                marginBottom: "4px",
                cursor: lyric.time !== null ? "pointer" : "default",
                transition: "all 0.3s ease",
                transform: isActive ? "scale(1.02)" : "scale(1)",
              }}
              onClick={() => lyric.time !== null && seekToLyric(lyric.time)}
              onMouseEnter={(e) => {
                if (lyric.time !== null && !isActive) {
                  e.target.style.color = "rgba(209, 250, 229, 0.9)"; // teal-300/90
                }
              }}
              onMouseLeave={(e) => {
                if (lyric.time !== null && !isActive) {
                  e.target.style.color = isActive
                    ? "rgba(209, 250, 229, 1)" // teal-300
                    : isPassed
                    ? "rgba(209, 250, 229, 0.7)" // teal-300/70
                    : isUpcoming
                    ? "rgba(209, 250, 229, 0.6)" // teal-300/60
                    : "rgba(209, 250, 229, 0.8)"; // teal-300/80
                }
              }}
            >
              <Text
                style={{
                  color: isActive
                    ? "rgba(209, 250, 229, 1)" // teal-300
                    : isPassed
                    ? "rgba(209, 250, 229, 0.7)" // teal-300/70
                    : isUpcoming
                    ? "rgba(209, 250, 229, 0.6)" // teal-300/60
                    : "rgba(209, 250, 229, 0.8)", // teal-300/80
                  fontSize: isActive ? "15px" : "14px",
                  fontWeight: isActive ? 600 : 400,
                  lineHeight: 1.5,
                  textAlign: "center",
                  transition: "all 0.3s ease",
                  wordWrap: "break-word",
                }}
              >
                {lyric.text}
              </Text>
            </div>
          );
        })}
      </div>
    </Box>
  );
};

export default SyncedLyricsDisplay;
