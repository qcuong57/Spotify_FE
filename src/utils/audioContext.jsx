import { createContext, useContext, useState, useEffect, useRef } from "react";

// Tạo Context
const AudioContext = createContext();

// Giữ nguyên logic override console của bạn
const originalWarn = console.warn;
const originalError = console.error;

console.warn = (...args) => {
  const message = args.join(" ");
  if (
    message.includes("MediaSession: duration is not ready yet") ||
    message.includes("Playback aborted")
  ) {
    return;
  }
  originalWarn(...args);
};

console.error = (...args) => {
  const message = args.join(" ");
  if (
    message.includes("Playback failed: AbortError") ||
    message.includes("MediaSession: duration is not ready yet")
  ) {
    return;
  }
  originalError(...args);
};

// Provider Component
export const AudioProvider = ({ children }) => {
  // --- STATE ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [audio, setAudio] = useState(null);
  const [isMute, setIsMute] = useState(false);
  const [volume, setVolume] = useState(50);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playlist, setPlaylist] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(-1);
  const [songDescriptionAvailable, setSongDescriptionAvailable] =
    useState(false);
  const [repeatMode, setRepeatMode] = useState("all");

  // --- REFS (FIX: Dùng để lưu giá trị mới nhất cho MediaSession chạy nền) ---
  const audioRef = useRef(audio);
  const playlistRef = useRef(playlist);
  const indexRef = useRef(currentSongIndex);
  const repeatModeRef = useRef(repeatMode);

  // Cập nhật Refs mỗi khi State thay đổi
  useEffect(() => {
    audioRef.current = audio;
  }, [audio]);
  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);
  useEffect(() => {
    indexRef.current = currentSongIndex;
  }, [currentSongIndex]);
  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  // --- LOGIC CHUYỂN BÀI (Sử dụng Ref để đảm bảo hoạt động khi tắt màn hình) ---
  const handleNextSong = () => {
    const currentPlaylist = playlistRef.current;
    const currentIndex = indexRef.current;

    if (currentPlaylist.length === 0) return;

    let nextIndex = currentIndex + 1;
    if (nextIndex >= currentPlaylist.length) {
      nextIndex = 0; // Quay lại đầu
    }

    setCurrentSongIndex(nextIndex);
    setCurrentSong(currentPlaylist[nextIndex]);
  };

  const handleBackSong = () => {
    const currentPlaylist = playlistRef.current;
    const currentIndex = indexRef.current;

    if (currentPlaylist.length === 0) return;

    let nextIndex = currentIndex - 1;
    if (nextIndex < 0) {
      nextIndex = currentPlaylist.length - 1; // Quay về cuối
    }

    setCurrentSongIndex(nextIndex);
    setCurrentSong(currentPlaylist[nextIndex]);
  };

  // --- SETUP MEDIA SESSION ---
  const setupMediaSession = (song, activeAudio) => {
    if ("mediaSession" in navigator) {
      // 1. Set Metadata
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.song_name || song.title || "Unknown Title",
        artist: song.singer_name || song.artist || "Unknown Artist",
        album: song.album || "",
        artwork: [
          {
            src: song.image || "https://via.placeholder.com/96",
            sizes: "96x96",
            type: "image/jpeg",
          },
          {
            src: song.image || "https://via.placeholder.com/128",
            sizes: "128x128",
            type: "image/jpeg",
          },
          {
            src: song.image || "https://via.placeholder.com/512",
            sizes: "512x512",
            type: "image/jpeg",
          },
        ],
      });

      // 2. Set Action Handlers
      // Play
      navigator.mediaSession.setActionHandler("play", () => {
        const targetAudio = activeAudio || audioRef.current;
        if (targetAudio) {
          targetAudio
            .play()
            .then(() => {
              setIsPlaying(true);
              navigator.mediaSession.playbackState = "playing";
            })
            .catch((err) => console.error("MediaSession Play failed:", err));
        }
      });

      // Pause
      navigator.mediaSession.setActionHandler("pause", () => {
        const targetAudio = activeAudio || audioRef.current;
        if (targetAudio) {
          targetAudio.pause();
          setIsPlaying(false);
          navigator.mediaSession.playbackState = "paused";
        }
      });

      // Next & Previous (Gọi hàm xử lý qua Ref)
      navigator.mediaSession.setActionHandler("previoustrack", handleBackSong);
      navigator.mediaSession.setActionHandler("nexttrack", handleNextSong);

      // Seek
      navigator.mediaSession.setActionHandler("seekto", (details) => {
        const targetAudio = activeAudio || audioRef.current;
        if (details.seekTime !== undefined && targetAudio) {
          targetAudio.currentTime = details.seekTime;
          setCurrentTime(Math.round(details.seekTime));
          updateMediaSessionPosition(targetAudio);
        }
      });

      navigator.mediaSession.setActionHandler("seekbackward", (details) => {
        const skipTime = details.seekOffset || 10;
        const targetAudio = activeAudio || audioRef.current;
        if (targetAudio) {
          targetAudio.currentTime = Math.max(
            targetAudio.currentTime - skipTime,
            0
          );
          updateMediaSessionPosition(targetAudio);
        }
      });

      navigator.mediaSession.setActionHandler("seekforward", (details) => {
        const skipTime = details.seekOffset || 10;
        const targetAudio = activeAudio || audioRef.current;
        if (targetAudio) {
          targetAudio.currentTime = Math.min(
            targetAudio.currentTime + skipTime,
            targetAudio.duration
          );
          updateMediaSessionPosition(targetAudio);
        }
      });
    }
  };

  // Helper update position state
  const updateMediaSessionPosition = (targetAudio = audio) => {
    if ("mediaSession" in navigator && targetAudio) {
      if (!isNaN(targetAudio.duration) && isFinite(targetAudio.duration)) {
        navigator.mediaSession.setPositionState({
          duration: targetAudio.duration,
          playbackRate: targetAudio.playbackRate || 1,
          position: targetAudio.currentTime || 0,
        });
      }
    }
  };

  // --- CÁC HÀM PUBLIC (Dùng trong component) ---
  const togglePlay = () => {
    if (audio) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
        if ("mediaSession" in navigator)
          navigator.mediaSession.playbackState = "paused";
      } else {
        audio.play().catch((error) => console.error("Playback failed:", error));
        setIsPlaying(true);
        if ("mediaSession" in navigator)
          navigator.mediaSession.playbackState = "playing";
      }
    }
  };

  const setPlaybackTime = (timeInSeconds) => {
    if (audio) {
      audio.currentTime = timeInSeconds;
      setCurrentTime(Math.round(timeInSeconds));
      updateMediaSessionPosition(audio);
    }
  };

  // Hàm public gọi lại logic chung
  const playNextSong = () => handleNextSong();
  const playBackSong = () => handleBackSong();

  const playSingleSong = (song) => {
    setSongDescriptionAvailable(true);
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
    setPlaylist([song]);
    setCurrentSongIndex(0);
    setCurrentSong(song);
  };

  const setNewPlaylist = (newPlaylist, startIndex = 0) => {
    setSongDescriptionAvailable(true);
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
    setPlaylist(newPlaylist);
    if (newPlaylist.length > 0) {
      setCurrentSongIndex(startIndex);
      setCurrentSong(newPlaylist[startIndex]);
    } else {
      setCurrentSongIndex(-1);
      setCurrentSong(null);
    }
  };

  // --- EFFECT: KHỞI TẠO AUDIO MỚI ---
  useEffect(() => {
    if (currentSong) {
      // Cleanup audio cũ
      if (audio) {
        audio.pause();
        // Xóa event listener cũ để tránh leak
        audio.onended = null;
        audio.ontimeupdate = null;
        audio.onloadedmetadata = null;
      }

      const newAudio = new Audio(currentSong.url_audio);
      newAudio.volume = isMute ? 0 : volume / 100;

      // FIX: Setup MediaSession NGAY LẬP TỨC với newAudio
      setupMediaSession(currentSong, newAudio);

      newAudio
        .play()
        .then(() => {
          setIsPlaying(true);
          if ("mediaSession" in navigator)
            navigator.mediaSession.playbackState = "playing";
        })
        .catch((error) => console.error("Playback failed:", error));

      setAudio(newAudio);
      audioRef.current = newAudio; // Update ref ngay
    }
  }, [currentSong]);
  // Lưu ý: Bỏ 'playlist' khỏi dependency array này để tránh reload nhạc khi chỉ thay đổi danh sách chờ

  // --- EFFECT: LOADED METADATA ---
  useEffect(() => {
    if (audio) {
      const handleLoadedMetadata = () => {
        setDuration(Math.round(audio.duration));
        updateMediaSessionPosition(audio);
      };
      audio.addEventListener("loadedmetadata", handleLoadedMetadata);
      return () =>
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    }
  }, [audio]);

  // --- EFFECT: TIME UPDATE ---
  useEffect(() => {
    if (audio) {
      const handleTimeUpdate = () => {
        setCurrentTime(Math.round(audio.currentTime));
        // Không updateMediaSessionPosition liên tục ở đây để tối ưu performance
      };
      audio.addEventListener("timeupdate", handleTimeUpdate);
      return () => audio.removeEventListener("timeupdate", handleTimeUpdate);
    }
  }, [audio]);

  // --- EFFECT: ENDED (Xử lý repeat/next) ---
  useEffect(() => {
    if (audio) {
      const handleEnded = () => {
        const currentRepeatMode = repeatModeRef.current; // Dùng Ref để lấy mode mới nhất
        console.log("Ended. Mode:", currentRepeatMode);

        if ("mediaSession" in navigator)
          navigator.mediaSession.playbackState = "paused";

        if (currentRepeatMode === "one") {
          // Phát lại bài hiện tại
          audio.currentTime = 0;
          audio
            .play()
            .then(() => {
              setIsPlaying(true);
              if ("mediaSession" in navigator)
                navigator.mediaSession.playbackState = "playing";
            })
            .catch((e) => console.error("Replay failed", e));
        } else {
          // Tự động next
          handleNextSong();
        }
      };

      audio.addEventListener("ended", handleEnded);
      return () => audio.removeEventListener("ended", handleEnded);
    }
  }, [audio]); // Chỉ cần phụ thuộc vào audio instance

  // --- EFFECT: VOLUME CONTROL ---
  useEffect(() => {
    if (audio) {
      audio.volume = isMute ? 0 : volume / 100;
    }
  }, [volume, isMute, audio]);

  // --- CLEANUP KHI UNMOUNT ---
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
      }
      if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = null;
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
        navigator.mediaSession.setActionHandler("previoustrack", null);
        navigator.mediaSession.setActionHandler("nexttrack", null);
        navigator.mediaSession.setActionHandler("seekto", null);
      }
    };
  }, []);

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        setIsPlaying,
        currentSong,
        setCurrentSong,
        audio,
        setAudio,
        togglePlay,
        isMute,
        setIsMute,
        volume,
        setVolume,
        currentTime,
        setPlaybackTime,
        duration,
        setDuration,
        playlist,
        setNewPlaylist,
        currentSongIndex,
        playNextSong,
        playBackSong,
        songDescriptionAvailable,
        setSongDescriptionAvailable,
        repeatMode,
        playSingleSong,
        setRepeatMode,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

// Custom Hook
export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};
