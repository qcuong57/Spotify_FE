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
  const [songDescriptionAvailable, setSongDescriptionAvailable] = useState(false);
  const [repeatMode, setRepeatMode] = useState("all");

  // Setup Media Session API
  const setupMediaSession = (song) => {
    if ('mediaSession' in navigator) {
      // Set metadata cho notification panel - sử dụng đúng field names
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.song_name || song.title || 'Unknown Title',
        artist: song.singer_name || song.artist || 'Unknown Artist', 
        album: song.album || '',
        artwork: [
          {
            src: song.image || song.artwork || 'https://via.placeholder.com/512x512/4f46e5/ffffff?text=Music',
            sizes: '96x96',
            type: 'image/jpeg'
          },
          {
            src: song.image || song.artwork || 'https://via.placeholder.com/512x512/4f46e5/ffffff?text=Music',
            sizes: '128x128', 
            type: 'image/jpeg'
          },
          {
            src: song.image || song.artwork || 'https://via.placeholder.com/512x512/4f46e5/ffffff?text=Music',
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: song.image || song.artwork || 'https://via.placeholder.com/512x512/4f46e5/ffffff?text=Music',
            sizes: '256x256',
            type: 'image/jpeg'
          },
          {
            src: song.image || song.artwork || 'https://via.placeholder.com/512x512/4f46e5/ffffff?text=Music',
            sizes: '384x384',
            type: 'image/jpeg'
          },
          {
            src: song.image || song.artwork || 'https://via.placeholder.com/512x512/4f46e5/ffffff?text=Music',
            sizes: '512x512',
            type: 'image/jpeg'
          }
        ]
      });

      // Set action handlers cho các nút điều khiển
      navigator.mediaSession.setActionHandler('play', () => {
        if (audio && !isPlaying) {
          togglePlay();
        }
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        if (audio && isPlaying) {
          togglePlay();
        }
      });

      // Chỉ set next/previous nếu có playlist với nhiều bài
      if (playlist.length > 1) {
        navigator.mediaSession.setActionHandler('previoustrack', () => {
          playBackSong();
        });

        navigator.mediaSession.setActionHandler('nexttrack', () => {
          playNextSong();
        });
      } else {
        // Remove handlers nếu chỉ có 1 bài
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
      }

      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const skipTime = details.seekOffset || 10;
        if (audio) {
          const newTime = Math.max(0, audio.currentTime - skipTime);
          setPlaybackTime(newTime);
        }
      });

      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const skipTime = details.seekOffset || 10;
        if (audio) {
          const newTime = Math.min(audio.duration, audio.currentTime + skipTime);
          setPlaybackTime(newTime);
        }
      });

      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime && audio) {
          setPlaybackTime(details.seekTime);
        }
      });

      // Update position state cho progress bar trên notification
      navigator.mediaSession.setPositionState({
        duration: audio ? audio.duration : 0,
        playbackRate: 1,
        position: audio ? audio.currentTime : 0
      });
    }
  };

  // Update Media Session position
  const updateMediaSessionPosition = () => {
    if ('mediaSession' in navigator && audio) {
      navigator.mediaSession.setPositionState({
        duration: audio.duration || 0,
        playbackRate: audio.playbackRate || 1,
        position: audio.currentTime || 0
      });
    }
  };

  // Hàm để phát/tạm dừng bài hát
  const togglePlay = () => {
    if (audio) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
        navigator.mediaSession.playbackState = 'paused';
      } else {
        audio.play().catch((error) => console.error("Playback failed:", error));
        setIsPlaying(true);
        navigator.mediaSession.playbackState = 'playing';
      }
    }
  };

  // Hàm để set thời gian phát
  const setPlaybackTime = (timeInSeconds) => {
    if (audio) {
      audio.currentTime = timeInSeconds;
      setCurrentTime(Math.round(timeInSeconds));
      updateMediaSessionPosition();
    }
  };

  // Hàm để phát bài hát tiếp theo
  const playNextSong = () => {
    if (playlist.length === 0) return;

    let nextIndex = currentSongIndex + 1;
    if (nextIndex >= playlist.length) {
      nextIndex = 0;
    }

    setCurrentSongIndex(nextIndex);
    setCurrentSong(playlist[nextIndex]);
  };

  const playBackSong = () => {
    if (playlist.length === 0) return;

    let nextIndex = currentSongIndex - 1;
    if (nextIndex < 0) {
      nextIndex = playlist.length - 1;
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
      
      // Setup Media Session cho bài hát mới
      setupMediaSession(currentSong);
      
      newAudio
        .play()
        .catch((error) => console.error("Playback failed:", error));
      setAudio(newAudio);
      setIsPlaying(true);
      
      // Set playback state
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }
    }
  }, [currentSong, playlist.length]); // Thêm playlist.length vào dependencies

  // Lấy duration của bài hát
  useEffect(() => {
    if (audio) {
      const updateDuration = () => {
        setDuration(Math.round(audio.duration));
        updateMediaSessionPosition();
      };
      audio.addEventListener("loadedmetadata", updateDuration);
      if (audio.duration) {
        setDuration(Math.round(audio.duration));
        updateMediaSessionPosition();
      }
      return () => audio.removeEventListener("loadedmetadata", updateDuration);
    }
  }, [audio]);

  // Cập nhật currentTime khi audio đang phát
  useEffect(() => {
    if (audio) {
      const updateTime = () => {
        setCurrentTime(Math.round(audio.currentTime));
        updateMediaSessionPosition();
      };
      audio.addEventListener("timeupdate", updateTime);
      return () => audio.removeEventListener("timeupdate", updateTime);
    }
  }, [audio]);

  // Xử lý khi bài hát kết thúc
  useEffect(() => {
    if (audio) {
      const handleEnded = () => {
        console.log("Audio ended, repeat mode:", repeatMode);
        navigator.mediaSession.playbackState = 'paused';
        
        if (repeatMode === "one") {
          setTimeout(() => {
            if (audio && !isNaN(audio.duration) && audio.duration > 0) {
              audio.currentTime = 0;
              setPlaybackTime(0);
              audio
                .play()
                .catch((error) => console.error("Repeat failed:", error));
              setIsPlaying(true);
              navigator.mediaSession.playbackState = 'playing';
            }
          }, 100);
        } else {
          setTimeout(() => {
            playNextSong();
          }, 100);
        }
      };

      audio.addEventListener("ended", handleEnded);
      return () => audio.removeEventListener("ended", handleEnded);
    }
  }, [audio, repeatMode]);

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
      // Clear media session
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = null;
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
        navigator.mediaSession.setActionHandler('seekbackward', null);
        navigator.mediaSession.setActionHandler('seekforward', null);
        navigator.mediaSession.setActionHandler('seekto', null);
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