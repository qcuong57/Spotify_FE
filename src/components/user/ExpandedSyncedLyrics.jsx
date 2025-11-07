import React, { useState, useEffect, useRef, useCallback } from "react";
import { Box, Text } from "@mantine/core";
import { IconMusic, IconMicrophone } from "@tabler/icons-react";

// Định nghĩa ngưỡng để xác định dòng lyrics có đang "được xem" hay không
const VISIBILITY_THRESHOLD = 0.5;

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
  const [visibleLyricIndex, setVisibleLyricIndex] = useState(-1);
  const scrollAnimationRef = useRef(null);

  // Parse lyrics từ LRC format (Giữ nguyên)
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
      setVisibleLyricIndex(-1);
    }
  }, [lyricsText]);

  // --- THAY ĐỔI: Logic tìm lyric hiện tại (Sửa lỗi tua lại/lặp lại) ---
  useEffect(() => {
    if (!audioElement || lyrics.length === 0) return;

    let animationFrameId;

    /**
     * --- THAY ĐỔI: Hàm này được sửa lại để luôn tìm kiếm từ đầu ---
     * Điều này sửa lỗi khi tua lại (seek backward) hoặc lặp lại bài hát.
     * Nó tìm dòng lyric CUỐI CÙNG có thời gian <= thời gian hiện tại của bài hát.
     */
    const findActiveLyricIndex = (time, syncedLyrics) => {
      let activeIndexInSynced = -1; // Chỉ số của lyric trong mảng `syncedLyrics` (đã lọc)

      // Luôn tìm từ đầu mảng đã lọc
      for (let i = 0; i < syncedLyrics.length; i++) {
        if (syncedLyrics[i].time <= time) {
          activeIndexInSynced = i; // Cập nhật lyric cuối cùng khớp với thời gian
        } else {
          // Vì mảng đã được sắp xếp, chúng ta có thể dừng ngay khi vượt quá thời gian
          break;
        }
      }

      if (activeIndexInSynced === -1) {
        // Thời gian hiện tại sớm hơn lyric đầu tiên
        return -1;
      }

      // Ánh xạ chỉ số `activeIndexInSynced` (từ mảng `syncedLyrics`)
      // về chỉ số đúng trong mảng `lyrics` gốc (bao gồm cả dòng không có timestamp)
      const targetId = syncedLyrics[activeIndexInSynced].id;
      return lyrics.findIndex((lyric) => lyric.id === targetId);
    };

    const updateTime = () => {
      if (!isPlaying || audioElement.paused) {
        animationFrameId = requestAnimationFrame(updateTime);
        return;
      }

      const time = audioElement.currentTime;
      setCurrentTime(time);

      const syncedLyrics = lyrics.filter((l) => l.time !== null);

      // --- THAY ĐỔI: Không truyền `currentLyricIndex` vào hàm tìm kiếm nữa ---
      const newIndex = findActiveLyricIndex(time, syncedLyrics);
      
      // `currentLyricIndex` ở đây là bản "tươi" nhất từ state (do có trong dependency array)
      if (newIndex !== currentLyricIndex) {
        setCurrentLyricIndex(newIndex);
      }

      animationFrameId = requestAnimationFrame(updateTime);
    };

    animationFrameId = requestAnimationFrame(updateTime);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [audioElement, isPlaying, lyrics, currentLyricIndex]); // <-- Giữ nguyên dependency array

  // Seek to specific lyric (Giữ nguyên)
  const seekToLyric = useCallback(
    (time) => {
      if (audioElement && time !== null) {
        audioElement.currentTime = time;
      }
    },
    [audioElement]
  );

  // Hủy cuộn tự động khi người dùng tương tác (Giữ nguyên)
  const handleManualScroll = () => {
    if (scrollAnimationRef.current) {
      cancelAnimationFrame(scrollAnimationRef.current);
      scrollAnimationRef.current = null;
    }
  };

  // Logic AUTO SCROLL (Giữ nguyên)
  useEffect(() => {
    if (currentLyricIndex >= 0 && containerRef.current) {
      const container = containerRef.current;
      const currentElement = container.querySelector(
        `[data-index="${currentLyricIndex}"]`
      );

      if (currentElement) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = currentElement.getBoundingClientRect();

        const targetPositionRatio = 0.35;
        const scrollOffset =
          elementRect.top -
          containerRect.top -
          containerRect.height * targetPositionRatio +
          elementRect.height / 2;

        const targetScrollTop = container.scrollTop + scrollOffset;

        if (scrollAnimationRef.current) {
          cancelAnimationFrame(scrollAnimationRef.current);
        }

        const startScrollTop = container.scrollTop;
        const distance = targetScrollTop - startScrollTop;
        const duration = 600; // 600ms
        let startTime = null;

        const easeInOutCubic = (t) => {
          return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        };

        const animation = (currentTime) => {
          if (startTime === null) startTime = currentTime;
          const timeElapsed = currentTime - startTime;
          const progress = Math.min(timeElapsed / duration, 1);
          const easedProgress = easeInOutCubic(progress);

          container.scrollTop = startScrollTop + distance * easedProgress;

          if (timeElapsed < duration) {
            scrollAnimationRef.current = requestAnimationFrame(animation);
          } else {
            scrollAnimationRef.current = null;
          }
        };

        scrollAnimationRef.current = requestAnimationFrame(animation);
      }
    }
  }, [currentLyricIndex]);

  // Logic kiểm tra dòng lyrics đang được cuộn xem (Giữ nguyên)
  useEffect(() => {
    if (!containerRef.current || !lyrics.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio > VISIBILITY_THRESHOLD) {
            const index = parseInt(entry.target.dataset.index);
            setVisibleLyricIndex(index);
          } else if (entry.intersectionRatio < VISIBILITY_THRESHOLD / 2) {
            const index = parseInt(entry.target.dataset.index);
            if (index === visibleLyricIndex) {
              setVisibleLyricIndex(-1);
            }
          }
        });
      },
      {
        root: containerRef.current,
        threshold: [0, VISIBILITY_THRESHOLD / 2, VISIBILITY_THRESHOLD],
      }
    );

    const lyricElements = containerRef.current.querySelectorAll("[data-index]");
    lyricElements.forEach((el) => observer.observe(el));

    return () => {
      lyricElements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, [lyrics, visibleLyricIndex]);

  const hasTimestamps = lyrics.some((lyric) => lyric.time !== null);

  // Empty state & Single Lyric Mode (Giữ nguyên)
  if (!lyrics.length || !hasTimestamps || lyrics.length <= 3) {
    const currentLyric =
      currentLyricIndex >= 0 ? lyrics[currentLyricIndex] : null;

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
                "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              letterSpacing: "0.5px",
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            No lyrics available
          </Text>
        </Box>
      );
    }

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
                  "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
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
                  "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
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

  // Scrollable lyrics mode
  const fontStyle =
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", "Helvetica Neue", Helvetica, Arial, sans-serif';

  return (
    <Box
      ref={containerRef}
      onWheel={handleManualScroll}
      onTouchMove={handleManualScroll}
      className={`${className} custom-lyrics-scroll`}
      style={{
        width: "100%",
        height: "100%",
        background: "transparent",
        position: "relative",
        overflow: "auto",
        padding: "45% 32px 35%",
        scrollBehavior: "auto",
      }}
    >
      {/* Lyrics list */}
      <div style={{ padding: "0" }}>
        {lyrics.map((lyric, index) => {
          const isActive = index === currentLyricIndex;

          const opacity = isActive ? 1 : 0.4;
          const fontWeight = 600;
          const fontSize = "28px";
          const color = isActive
            ? "rgba(255, 255, 255, 1)"
            : "rgba(255, 255, 255, 0.8)";

          const wordWrapStyle = {
            whiteSpace: "normal",
            wordWrap: "break-word",
            maxWidth: "100%",
            display: "block",
          };

          return (
            <div
              key={lyric.id}
              data-index={index}
              style={{
                padding: "12px 0",
                marginBottom: "10px",
                cursor: lyric.time !== null ? "pointer" : "default",
                transition: "opacity 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                position: "relative",

                transform: "scale(1)",
                opacity: opacity,
              }}
              onClick={() => lyric.time !== null && seekToLyric(lyric.time)}
              onMouseEnter={(e) => {
                if (lyric.time !== null) {
                  e.currentTarget.style.opacity = 1;
                }
              }}
              onMouseLeave={(e) => {
                if (lyric.time !== null && !isActive) {
                  e.currentTarget.style.opacity = opacity;
                }
              }}
            >
              <Text
                style={{
                  color: color,

                  fontFamily: fontStyle,
                  letterSpacing: "normal",

                  textAlign: "left",

                  fontSize: 30,
                  fontWeight: 655,
                  lineHeight: 1.35,

                  textShadow: isActive
                    ? "0 2px 10px rgba(0,0,0,0.5)"
                    : "0 1px 5px rgba(0,0,0,0.3)",

                  transition: "color 0.4s",
                  position: "relative",
                  zIndex: 1,

                  ...wordWrapStyle,
                }}
              >
                {lyric.text}
              </Text>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        /* Import Google Fonts (Giữ lại Inter) */
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");

        .custom-lyrics-scroll {
          /* Ẩn thanh cuộn */
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .custom-lyrics-scroll::-webkit-scrollbar {
          display: none;
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
      `}</style>
    </Box>
  );
};

export default ExpandedSyncedLyrics;