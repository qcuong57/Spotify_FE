import { createContext, useContext, useState, useEffect, useCallback } from "react"; // <-- THÊM useCallback

// Tạo Context
const AudioContext = createContext();

// (Phần console.warn/error giữ nguyên)
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

  // --- BỌC CÁC HÀM TRONG USECALLBACK ---

  // Update Media Session position
  const updateMediaSessionPosition = useCallback(() => {
    if ("mediaSession" in navigator && audio) {
      if (!isNaN(audio.duration) && isFinite(audio.duration)) {
        navigator.mediaSession.setPositionState({
          duration: audio.duration,
          playbackRate: audio.playbackRate || 1,
          position: audio.currentTime || 0,
        });
      }
    }
  }, [audio]); // Phụ thuộc vào [audio]

  // Hàm để set thời gian phát
  const setPlaybackTime = useCallback((timeInSeconds) => {
    if (audio) {
      audio.currentTime = timeInSeconds;
      setCurrentTime(Math.round(timeInSeconds)); // Dùng setter
      updateMediaSessionPosition();
    }
  }, [audio, updateMediaSessionPosition]); // Phụ thuộc vào [audio, updateMediaSessionPosition]

  // Hàm để phát/tạm dừng bài hát
  const togglePlay = useCallback(() => {
    if (audio) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
        navigator.mediaSession.playbackState = "paused";
      } else {
        audio.play().catch((error) => console.error("Playback failed:", error));
        setIsPlaying(true);
        navigator.mediaSession.playbackState = "playing";
      }
    }
  }, [audio, isPlaying]); // Phụ thuộc vào [audio, isPlaying] (setIsPlaying ổn định)

  // Hàm để phát bài hát tiếp theo
  const playNextSong = useCallback(() => {
    if (playlist.length === 0) return;

    let nextIndex = currentSongIndex + 1;
    if (nextIndex >= playlist.length) {
      nextIndex = 0;
    }

    setCurrentSongIndex(nextIndex);
    setCurrentSong(playlist[nextIndex]);
  }, [playlist, currentSongIndex]); // Phụ thuộc vào [playlist, currentSongIndex]

  // Hàm phát bài hát trước
  const playBackSong = useCallback(() => {
    if (playlist.length === 0) return;

    let nextIndex = currentSongIndex - 1;
    if (nextIndex < 0) {
      nextIndex = playlist.length - 1;
    }

    setCurrentSongIndex(nextIndex);
    setCurrentSong(playlist[nextIndex]);
  }, [playlist, currentSongIndex]); // Phụ thuộc vào [playlist, currentSongIndex]

  // Setup Media Session API
  const setupMediaSession = useCallback((song) => {
    if ("mediaSession" in navigator) {
      // (Metadata giữ nguyên)
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.song_name || song.title || "Unknown Title",
        artist: song.singer_name || song.artist || "Unknown Artist",
        album: song.album || "",
        artwork: [
          // (artwork array giữ nguyên)
          {
            src:
              song.image ||
              song.artwork ||
              "https://via.placeholder.com/512x512/4f46e5/ffffff?text=Music",
            sizes: "96x96",
            type: "image/jpeg",
          },
          {
            src:
              song.image ||
              song.artwork ||
              "https://via.placeholder.com/512x512/4f46e5/ffffff?text=Music",
            sizes: "128x128",
            type: "image/jpeg",
          },
          {
            src:
              song.image ||
              song.artwork ||
              "https://via.placeholder.com/512x512/4f46e5/ffffff?text=Music",
            sizes: "192x192",
            type: "image/jpeg",
          },
          {
            src:
              song.image ||
              song.artwork ||
              "https://via.placeholder.com/512x512/4f46e5/ffffff?text=Music",
            sizes: "256x256",
            type: "image/jpeg",
          },
          {
            src:
              song.image ||
              song.artwork ||
              "https://via.placeholder.com/512x512/4f46e5/ffffff?text=Music",
            sizes: "384x384",
            type: "image/jpeg",
          },
          {
            src:
              song.image ||
              song.artwork ||
              "https://via.placeholder.com/512x512/4f46e5/ffffff?text=Music",
            sizes: "512x512",
            type: "image/jpeg",
          },
        ],
      });

      // Set action handlers
      navigator.mediaSession.setActionHandler("play", () => {
        console.log("Media Session: Play button pressed");
        if (audio && !isPlaying) {
          audio
            .play()
            .then(() => {
              setIsPlaying(true);
              navigator.mediaSession.playbackState = "playing";
            })
            .catch((error) => console.error("Play failed:", error));
        }
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        console.log("Media Session: Pause button pressed");
        if (audio && isPlaying) {
          audio.pause();
          setIsPlaying(false);
          navigator.mediaSession.playbackState = "paused";
        }
      });
      
      // Giờ đây các hàm này đã được bọc trong useCallback nên sẽ luôn là phiên bản mới nhất
      navigator.mediaSession.setActionHandler("previoustrack", playBackSong);
      navigator.mediaSession.setActionHandler("nexttrack", playNextSong);

      // (Các handler seek giữ nguyên)
      navigator.mediaSession.setActionHandler("seekbackward", (details) => {
        const skipTime = details.seekOffset || 10;
        if (audio) {
          const newTime = Math.max(0, audio.currentTime - skipTime);
          setPlaybackTime(newTime);
        }
      });
      navigator.mediaSession.setActionHandler("seekforward", (details) => {
        const skipTime = details.seekOffset || 10;
        if (audio) {
          const newTime = Math.min(
            audio.duration,
            audio.currentTime + skipTime
          );
          setPlaybackTime(newTime);
        }
      });
      navigator.mediaSession.setActionHandler("seekto", (details) => {
        if (details.seekTime && audio) {
          setPlaybackTime(details.seekTime);
        }
      });

      // Update position state
      if (audio && !isNaN(audio.duration) && isFinite(audio.duration)) {
        navigator.mediaSession.setPositionState({
          duration: audio.duration,
          playbackRate: audio.playbackRate || 1,
          position: audio.currentTime || 0,
        });
      }
    }
  }, [audio, isPlaying, playBackSong, playNextSong, setPlaybackTime]); // Thêm dependencies

  // Hàm để phát single song (không cần playlist)
  const playSingleSong = useCallback((song) => {
    setSongDescriptionAvailable(true);
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
    setPlaylist([song]); // Tạo playlist với 1 bài
    setCurrentSongIndex(0);
    setCurrentSong(song);
  }, [audio]); // Phụ thuộc [audio]

  // Hàm để thêm danh sách bài hát
  const setNewPlaylist = useCallback((newPlaylist, startIndex = 0) => {
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
  }, [audio]); // Phụ thuộc [audio]

  // --- CẬP NHẬT CÁC USEEFFECT ---

  // Tạo audio mới khi bài hát thay đổi
  useEffect(() => {
    if (currentSong) {
      if (audio) {
        audio.pause();
      }
      const newAudio = new Audio(currentSong.url_audio);
      newAudio.volume = isMute ? 0 : volume / 100;

      // Setup Media Session cho bài hát mới
      setupMediaSession(currentSong); // Hàm này giờ đã ổn định

      newAudio
        .play()
        .catch((error) => console.error("Playback failed:", error));
      setAudio(newAudio);
      setIsPlaying(true);

      if ("mediaSession" in navigator) {
        navigator.mediaSession.playbackState = "playing";
      }
    }
  // Bỏ 'playlist' khỏi dependencies, chỉ giữ 'currentSong'
  // Thêm 'setupMediaSession' (đã useCallback) và các state liên quan
  }, [currentSong, setupMediaSession, isMute, volume]); 

  // Lấy duration của bài hát
  useEffect(() => {
    if (audio) {
      const updateDuration = () => {
        setDuration(Math.round(audio.duration));
        updateMediaSessionPosition(); // Hàm này giờ đã ổn định
      };
      audio.addEventListener("loadedmetadata", updateDuration);
      if (audio.duration) {
        updateDuration();
      }
      return () => audio.removeEventListener("loadedmetadata", updateDuration);
    }
  }, [audio, updateMediaSessionPosition]); // Cập nhật dependencies

  // Cập nhật currentTime khi audio đang phát
  useEffect(() => {
    if (audio) {
      const updateTime = () => {
        setCurrentTime(Math.round(audio.currentTime));
        updateMediaSessionPosition(); // Hàm này giờ đã ổn định
      };
      audio.addEventListener("timeupdate", updateTime);
      return () => audio.removeEventListener("timeupdate", updateTime);
    }
  }, [audio, updateMediaSessionPosition]); // Cập nhật dependencies

  // Xử lý khi bài hát kết thúc
  useEffect(() => {
    if (audio) {
      const handleEnded = () => {
        console.log("Audio ended, repeat mode:", repeatMode);
        navigator.mediaSession.playbackState = "paused";

        if (repeatMode === "one") {
          setTimeout(() => {
            if (audio && !isNaN(audio.duration) && audio.duration > 0) {
              audio.currentTime = 0;
              setPlaybackTime(0); // Hàm này giờ đã ổn định
              audio
                .play()
                .catch((error) => console.error("Repeat failed:", error));
              setIsPlaying(true);
              navigator.mediaSession.playbackState = "playing";
            }
          }, 100);
        } else {
          setTimeout(() => {
            playNextSong(); // Hàm này giờ đã ổn định
          }, 100);
        }
      };

      audio.addEventListener("ended", handleEnded);
      return () => audio.removeEventListener("ended", handleEnded);
    }
  }, [audio, repeatMode, playNextSong, setPlaybackTime]); // Cập nhật dependencies

  // Cập nhật volume và mute
  useEffect(() => {
    if (audio) {
      audio.volume = isMute ? 0 : volume / 100;
    }
  }, [volume, isMute, audio]);

  // Cleanup khi component unmount
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
        navigator.mediaSession.setActionHandler("seekbackward", null);
        navigator.mediaSession.setActionHandler("seekforward", null);
        navigator.mediaSession.setActionHandler("seekto", null);
      }
    };
  }, [audio]); // Thêm [audio] dependency cho cleanup

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        setIsPlaying,
        currentSong,
        setCurrentSong,
        audio,
        setAudio,
        togglePlay, // Đã ổn định
        isMute,
        setIsMute,
        volume,
        setVolume,
        currentTime,
        setPlaybackTime, // Đã ổn định
        duration,
        setDuration,
        playlist,
        setNewPlaylist, // Đã ổn định
        currentSongIndex,
        playNextSong, // Đã ổn định
        playBackSong, // Đã ổn định
        songDescriptionAvailable,
        setSongDescriptionAvailable,
        repeatMode,
        playSingleSong, // Đã ổn định
        setRepeatMode,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

// Custom Hook để sử dụng Context
export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};