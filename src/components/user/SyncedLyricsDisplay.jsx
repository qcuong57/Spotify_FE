import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Box, Text } from "@mantine/core";
import { IconMusic, IconMicrophone } from "@tabler/icons-react";

// --- CẤU HÌNH ANIMATION ---
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const ANIMATION_DURATION = 600; // ms

const SyncedLyricsDisplay = ({
  lyricsText,
  audioElement,
  isPlaying = false,
  className = "",
}) => {
  const [lyrics, setLyrics] = useState([]);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);
  const [currentTime, setCurrentTime] = useState(0);

  // --- REFS ---
  const containerRef = useRef(null);
  const listWrapperRef = useRef(null);
  const scrollAnimationRef = useRef(null);
  const currentTranslateYRef = useRef(0);
  const isUserScrollingRef = useRef(false);
  const userScrollTimeoutRef = useRef(null);

  const hasTimestamps = useMemo(() => {
    if (!lyricsText) return false;
    return lyrics.some((lyric) => lyric.time !== null);
  }, [lyrics, lyricsText]);

  // --- PARSE LYRICS ---
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

  useEffect(() => {
    if (lyricsText) {
      const parsed = parseLyricsFromText(lyricsText);
      setLyrics(parsed);
      setCurrentLyricIndex(-1);
      
      if (listWrapperRef.current) {
        listWrapperRef.current.style.transform = `translateY(0px)`;
        currentTranslateYRef.current = 0;
      }
    }
  }, [lyricsText]);

  // --- SYNC LOGIC ---
  useEffect(() => {
    if (!audioElement || lyrics.length === 0) return;

    let animationFrameId;
    const syncedLyrics = lyrics.filter((l) => l.time !== null);

    const findActiveLyricIndex = (time) => {
      let activeIndex = -1;
      for (let i = 0; i < syncedLyrics.length; i++) {
        if (syncedLyrics[i].time <= time) {
          activeIndex = i;
        } else {
          break;
        }
      }
      
      if (activeIndex === -1) return -1;
      const targetId = syncedLyrics[activeIndex].id;
      return lyrics.findIndex((lyric) => lyric.id === targetId);
    };

    const updateTime = () => {
      if (!isPlaying || audioElement.paused) {
        animationFrameId = requestAnimationFrame(updateTime);
        return;
      }

      const time = audioElement.currentTime;
      setCurrentTime(time);

      const newIndex = findActiveLyricIndex(time);
      if (newIndex !== currentLyricIndex) {
        setCurrentLyricIndex(newIndex);
      }

      animationFrameId = requestAnimationFrame(updateTime);
    };

    animationFrameId = requestAnimationFrame(updateTime);
    return () => cancelAnimationFrame(animationFrameId);
  }, [audioElement, isPlaying, lyrics, currentLyricIndex]);

  // --- SEEK ---
  const seekToLyric = useCallback((time) => {
    if (audioElement && time !== null) {
      isUserScrollingRef.current = false;
      clearTimeout(userScrollTimeoutRef.current);
      audioElement.currentTime = time;
    }
  }, [audioElement]);

  // --- AUTO SCROLL ---
  useEffect(() => {
    if (isUserScrollingRef.current) return;

    if (currentLyricIndex >= 0 && containerRef.current && listWrapperRef.current) {
      const container = containerRef.current;
      const listWrapper = listWrapperRef.current;
      const currentElement = container.querySelector(
        `[data-index="${currentLyricIndex}"]`
      );

      if (currentElement) {
        const containerHeight = container.clientHeight;
        const elementHeight = currentElement.clientHeight;
        const elementTopInWrapper = currentElement.offsetTop;

        // Căn giữa dòng hát ở khoảng 40% chiều cao container
        const targetPositionRatio = 0.4;
        const targetYPositionForElement = containerHeight * targetPositionRatio;

        const targetTranslateY = -(
          elementTopInWrapper -
          targetYPositionForElement +
          elementHeight / 2
        );

        if (scrollAnimationRef.current) {
          cancelAnimationFrame(scrollAnimationRef.current);
        }

        const startTranslateY = currentTranslateYRef.current;
        const distance = targetTranslateY - startTranslateY;
        const duration = ANIMATION_DURATION;
        let startTime = null;

        const animation = (currentTime) => {
          if (startTime === null) startTime = currentTime;
          const timeElapsed = currentTime - startTime;
          const progress = Math.min(timeElapsed / duration, 1);
          const easedProgress = easeOutCubic(progress);

          const newY = startTranslateY + distance * easedProgress;

          listWrapper.style.transform = `translateY(${newY}px)`;
          currentTranslateYRef.current = newY;

          if (timeElapsed < duration) {
            scrollAnimationRef.current = requestAnimationFrame(animation);
          } else {
            scrollAnimationRef.current = null;
          }
        };

        scrollAnimationRef.current = requestAnimationFrame(animation);
      }
    }
  }, [currentLyricIndex, isUserScrollingRef.current]);

  // --- MANUAL INTERACTION ---
  const handleManualInteraction = () => {
    isUserScrollingRef.current = true;
    if (scrollAnimationRef.current) {
      cancelAnimationFrame(scrollAnimationRef.current);
      scrollAnimationRef.current = null;
    }
    clearTimeout(userScrollTimeoutRef.current);
    userScrollTimeoutRef.current = setTimeout(() => {
      isUserScrollingRef.current = false;
    }, 3000);
  };

  // --- RENDER HELPERS ---
  if (!lyrics.length) {
    return (
      <Box className={className} style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <IconMusic size={32} style={{ color: "rgba(209, 250, 229, 0.6)", marginBottom: "8px" }} />
        <Text size="sm" style={{ color: "rgba(209, 250, 229, 0.8)", fontWeight: 500 }}>No lyrics available</Text>
      </Box>
    );
  }

  if (!hasTimestamps || lyrics.length <= 3) {
    const currentLyric = currentLyricIndex >= 0 ? lyrics[currentLyricIndex] : null;
    return (
      <Box className={className} style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", cursor: currentLyric ? "pointer" : "default", overflow: "hidden" }} onClick={() => currentLyric && seekToLyric(currentLyric.time)}>
        {(!currentLyric || !isPlaying) && (
          <Box style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <IconMicrophone size={28} style={{ color: "rgba(209, 250, 229, 0.6)", marginBottom: "8px" }} />
            <Text size="md" style={{ color: "rgba(209, 250, 229, 0.8)", fontWeight: 500 }}>{lyrics.length > 0 && !isPlaying ? "Press play to start" : "Ready to play"}</Text>
          </Box>
        )}
        {currentLyric && isPlaying && (
          <Box style={{ padding: "16px", width: "100%" }}>
            <Text style={{ color: "rgba(209, 250, 229, 1)", fontSize: "16px", fontWeight: 600, textAlign: "center", lineHeight: 1.4, animation: "fadeIn 0.5s ease-out" }}>{currentLyric.text}</Text>
          </Box>
        )}
        <style jsx>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      </Box>
    );
  }

  // --- MAIN RENDER ---
  const fontStyle = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", Helvetica, Arial, sans-serif';

  return (
    <Box
      ref={containerRef}
      onWheel={handleManualInteraction}
      onTouchStart={handleManualInteraction}
      className={`${className} custom-lyrics-scroll`}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        padding: "0 12px", // Padding nhỏ hơn chút
      }}
    >
      <div
        ref={listWrapperRef}
        style={{
          willChange: "transform",
          transform: "translateY(0px)",
          padding: "45% 0 55%",
        }}
      >
        {lyrics.map((lyric, index) => {
          const isActive = index === currentLyricIndex;
          
          const opacity = isActive ? 1 : 0.5;
          const color = isActive ? "rgba(209, 250, 229, 1)" : "rgba(209, 250, 229, 0.7)";
          const scale = isActive ? "scale(1.05)" : "scale(1)";
          const fontWeight = isActive ? 600 : 400; // Chữ thường mỏng hơn chút
          const blur = isActive ? "blur(0)" : "blur(0.5px)";

          return (
            <div
              key={lyric.id}
              data-index={index}
              onClick={() => lyric.time !== null && seekToLyric(lyric.time)}
              style={{
                padding: "6px 0", // Khoảng cách giữa các dòng
                marginBottom: "6px",
                cursor: lyric.time !== null ? "pointer" : "default",
                transition: "opacity 0.4s ease-out, transform 0.4s ease-out, filter 0.4s ease",
                opacity: opacity,
                transform: scale,
                transformOrigin: "center center", // --- QUAN TRỌNG: Phóng to từ tâm ---
                filter: blur,
                display: "flex",        // ---
                justifyContent: "center" // --- Căn giữa container
              }}
            >
              <Text
                style={{
                  color: color,
                  fontFamily: fontStyle,
                  fontSize: "16px", // --- QUAN TRỌNG: Cỡ chữ nhỏ lại (16px) ---
                  fontWeight: fontWeight,
                  lineHeight: 1.5,
                  textAlign: "center", // --- QUAN TRỌNG: Căn giữa text ---
                  wordWrap: "break-word",
                  maxWidth: "100%",
                }}
              >
                {lyric.text}
              </Text>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .custom-lyrics-scroll {
          overflow: hidden;
          scrollbar-width: none;
          -ms-overflow-style: none;
          mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
          -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
        }
        .custom-lyrics-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </Box>
  );
};

export default SyncedLyricsDisplay;