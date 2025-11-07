import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Box, Text } from "@mantine/core";
import { IconMusic, IconMicrophone } from "@tabler/icons-react";

// Định nghĩa ngưỡng để xác định dòng lyrics có đang "được xem" hay không
const VISIBILITY_THRESHOLD = 0.5;

// --- MỚI: Hàm Easing (ease-out-cubic) cho cảm giác mượt mà ---
// Bắt đầu nhanh và chậm dần (cảm giác "phone-like")
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
// Thời gian animation
const ANIMATION_DURATION = 600; // 600ms

const ExpandedSyncedLyrics = ({
  lyricsText,
  audioElement,
  isPlaying = false,
  className = "",
}) => {
  const [lyrics, setLyrics] = useState([]);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);
  const [currentTime, setCurrentTime] = useState(0);
  
  const containerRef = useRef(null); // Container (viewport)
  // --- MỚI: Ref cho wrapper chứa list lyric ---
  const listWrapperRef = useRef(null); // List (sẽ được transform)
  // --- MỚI: Ref để lưu trữ ID animation và vị trí Y hiện tại ---
  const scrollAnimationRef = useRef(null);
  const currentTranslateYRef = useRef(0);
  // --- MỚI: Ref để xử lý việc người dùng tự cuộn ---
  const isUserScrollingRef = useRef(false);
  const userScrollTimeoutRef = useRef(null);


  const hasTimestamps = useMemo(() => {
    if (!lyricsText) return false;
    return lyrics.some((lyric) => lyric.time !== null);
  }, [lyrics, lyricsText]);

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
    }
  }, [lyricsText]);

  // Logic tìm lyric (Đã tối ưu hóa)
  useEffect(() => {
    if (!audioElement || lyrics.length === 0) return;

    let animationFrameId;
    const isSingleLyricMode = (lyrics.length <= 3 || !hasTimestamps);

    const findActiveLyricIndex = (time, syncedLyrics) => {
      let activeIndexInSynced = -1;
      for (let i = 0; i < syncedLyrics.length; i++) {
        if (syncedLyrics[i].time <= time) {
          activeIndexInSynced = i;
        } else {
          break;
        }
      }
      if (activeIndexInSynced === -1) {
        return -1;
      }
      const targetId = syncedLyrics[activeIndexInSynced].id;
      return lyrics.findIndex((lyric) => lyric.id === targetId);
    };

    const updateTime = () => {
      if (!isPlaying || audioElement.paused) {
        animationFrameId = requestAnimationFrame(updateTime);
        return;
      }

      const time = audioElement.currentTime;
      
      if (isSingleLyricMode) {
        setCurrentTime(time);
      }

      const syncedLyrics = lyrics.filter((l) => l.time !== null);
      const newIndex = findActiveLyricIndex(time, syncedLyrics);
      
      if (newIndex !== currentLyricIndex) {
        setCurrentLyricIndex(newIndex);
      }

      animationFrameId = requestAnimationFrame(updateTime);
    };

    animationFrameId = requestAnimationFrame(updateTime);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [audioElement, isPlaying, lyrics, currentLyricIndex, hasTimestamps, lyrics.length]); 

  // Seek to specific lyric (Giữ nguyên)
  const seekToLyric = useCallback(
    (time) => {
      if (audioElement && time !== null) {
        // --- MỚI: Tắt cờ "user scrolling" khi bấm vào lyric ---
        isUserScrollingRef.current = false;
        clearTimeout(userScrollTimeoutRef.current);
        // ---
        audioElement.currentTime = time;
      }
    },
    [audioElement]
  );
  
  // --- THAY ĐỔI HOÀN TOÀN: Logic AUTO SCROLL (Dùng `transform`) ---
  useEffect(() => {
    // Nếu người dùng đang tự cuộn, không tự động cuộn
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
        // Vị trí của top element so với list wrapper
        const elementTopInWrapper = currentElement.offsetTop; 
        
        // Vị trí Y mục tiêu (căn giữa theo 35% viewport)
        const targetPositionRatio = 0.35;
        const targetYPositionForElement = containerHeight * targetPositionRatio;

        // Tính toán vị trí Y mới cho list wrapper
        const targetTranslateY = -(
          elementTopInWrapper -
          targetYPositionForElement +
          elementHeight / 2
        );
        
        // Hủy animation cũ (nếu có)
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
          const easedProgress = easeOutCubic(progress); // Dùng ease-out

          const newY = startTranslateY + distance * easedProgress;
          
          listWrapper.style.transform = `translateY(${newY}px)`;
          currentTranslateYRef.current = newY; // Lưu lại vị trí Y hiện tại

          if (timeElapsed < duration) {
            scrollAnimationRef.current = requestAnimationFrame(animation);
          } else {
            scrollAnimationRef.current = null;
          }
        };

        scrollAnimationRef.current = requestAnimationFrame(animation);
      }
    }
  // Thêm `isUserScrollingRef.current` vào dependency để check lại khi người dùng ngừng cuộn
  }, [currentLyricIndex, isUserScrollingRef.current]); 
  
  
  // --- MỚI: Hủy cuộn tự động khi người dùng tương tác ---
  const handleManualInteraction = () => {
    // Bật cờ "đang cuộn"
    isUserScrollingRef.current = true;
    
    // Hủy animation tự động ngay lập tức
    if (scrollAnimationRef.current) {
      cancelAnimationFrame(scrollAnimationRef.current);
      scrollAnimationRef.current = null;
    }
    
    // Hủy timeout cũ (nếu có)
    clearTimeout(userScrollTimeoutRef.current);
    
    // Đặt timeout: nếu người dùng ngừng cuộn 3 giây, bật lại auto-scroll
    userScrollTimeoutRef.current = setTimeout(() => {
      isUserScrollingRef.current = false;
    }, 3000); // 3 giây
  };
  
  // --- MỚI: Reset vị trí cuộn khi đổi bài hát ---
  useEffect(() => {
    if (listWrapperRef.current) {
      listWrapperRef.current.style.transition = 'none'; // Tắt transition
      listWrapperRef.current.style.transform = `translateY(0px)`; // Reset
      currentTranslateYRef.current = 0;
      isUserScrollingRef.current = false;
      clearTimeout(userScrollTimeoutRef.current);
    }
  }, [lyricsText]); // Dùng lyricsText làm trigger đổi bài


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
      // --- MỚI: Thêm sự kiện để phát hiện người dùng "cuộn" ---
      onWheel={handleManualInteraction}
      onTouchStart={handleManualInteraction}
      className={`${className} custom-lyrics-scroll`}
      style={{
        width: "100%",
        height: "100%",
        background: "transparent",
        position: "relative",
        // --- THAY ĐỔI: Ẩn thanh cuộn ---
        overflow: "hidden",
        padding: "0 32px", // Chỉ padding trái phải, trên dưới sẽ do list wrapper xử lý
      }}
    >
      {/* --- MỚI: Thêm List Wrapper --- */}
      <div 
        ref={listWrapperRef}
        style={{
          // --- MỚI: Thêm 2 thuộc tính này để trình duyệt "biết" là sẽ có transform
          // Giúp tối ưu hóa (GPU)
          willChange: 'transform',
          transform: 'translateY(0px)',
          // Thêm padding (thay cho padding của container)
          padding: "45% 0 35%",
        }}
      >
        {lyrics.map((lyric, index) => {
          const isActive = index === currentLyricIndex;

          const opacity = isActive ? 1 : 0.4;
          const color = isActive
            ? "rgba(255, 255, 255, 1)"
            : "rgba(255, 255, 255, 0.8)";
          
          const textShadow = isActive
            ? "0 2px 10px rgba(0,0,0,0.5)"
            : "0 1px 5px rgba(0,0,0,0.3)";

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
                transition: "opacity 0.4s ease-out", // Chỉ transition opacity
                position: "relative",
                opacity: opacity,
              }}
              onClick={() => lyric.time !== null && seekToLyric(lyric.time)}
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
                  textShadow: textShadow,
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
          /* --- THAY ĐỔI: Tắt thanh cuộn --- */
          overflow: hidden; 
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