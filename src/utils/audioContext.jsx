import { createContext, useContext, useState, useEffect } from "react";

// Tạo Context
const AudioContext = createContext();

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
  const [repeatMode, setRepeatMode] = useState("all"); // "all", "one"

  // Hàm để phát/tạm dừng bài hát
  const togglePlay = () => {
    if (audio) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play().catch((error) => console.error("Playback failed:", error));
        setIsPlaying(true);
      }
    }
  };

  // Hàm để set thời gian phát
  const setPlaybackTime = (timeInSeconds) => {
    if (audio) {
      audio.currentTime = timeInSeconds;
      setCurrentTime(Math.round(timeInSeconds));
    }
  };

  // Hàm để phát bài hát tiếp theo
  const playNextSong = () => {
    if (playlist.length === 0) return;

    let nextIndex = currentSongIndex + 1;
    if (nextIndex >= playlist.length) {
      nextIndex = 0; // Quay lại bài đầu tiên nếu hết danh sách
    }

    setCurrentSongIndex(nextIndex);
    setCurrentSong(playlist[nextIndex]);
  };

  const playBackSong = () => {
    if (playlist.length === 0) return;

    let nextIndex = currentSongIndex - 1;
    if (nextIndex < 0) {
      nextIndex = playlist.length - 1; // Quay lại bài cuối cùng nếu ở bài đầu
    }

    setCurrentSongIndex(nextIndex);
    setCurrentSong(playlist[nextIndex]);
  };

  // Hàm để thêm danh sách bài hát
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

  // Tạo audio mới khi bài hát thay đổi
  useEffect(() => {
    if (currentSong) {
      if (audio) {
        audio.pause();
      }
      const newAudio = new Audio(currentSong.url_audio);
      newAudio.volume = isMute ? 0 : volume / 100;
      newAudio
        .play()
        .catch((error) => console.error("Playback failed:", error));
      setAudio(newAudio);
      setIsPlaying(true);
    }
  }, [currentSong]);

  // Lấy duration của bài hát
  useEffect(() => {
    if (audio) {
      const updateDuration = () => setDuration(Math.round(audio.duration));
      audio.addEventListener("loadedmetadata", updateDuration);
      if (audio.duration) {
        setDuration(Math.round(audio.duration));
      }
      return () => audio.removeEventListener("loadedmetadata", updateDuration);
    }
  }, [audio]);

  // Cập nhật currentTime khi audio đang phát
  useEffect(() => {
    if (audio) {
      const updateTime = () => setCurrentTime(Math.round(audio.currentTime));
      audio.addEventListener("timeupdate", updateTime);
      return () => audio.removeEventListener("timeupdate", updateTime);
    }
  }, [audio]);

  // Xử lý khi bài hát kết thúc
  useEffect(() => {
    if (audio) {
      const handleEnded = () => {
        console.log("Audio ended, repeat mode:", repeatMode);
        if (repeatMode === "one") {
          setTimeout(() => {
            if (audio && !isNaN(audio.duration) && audio.duration > 0) {
              audio.currentTime = 0;
              setPlaybackTime(0);
              audio
                .play()
                .catch((error) => console.error("Repeat failed:", error));
              setIsPlaying(true);
            }
          }, 100);
        } else {
          // repeatMode === "all"
          setTimeout(() => {
            playNextSong();
          }, 100);
        }
      };

      audio.addEventListener("ended", handleEnded);
      return () => audio.removeEventListener("ended", handleEnded);
    }
  }, [audio, repeatMode, playNextSong, setPlaybackTime, setIsPlaying]);

  // Cập nhật volume và mute
  useEffect(() => {
    if (audio) {
      audio.volume = isMute ? 0 : volume / 100;
    }
  }, [volume, isMute, audio]);

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
