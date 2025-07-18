import { useRef, useState } from "react";
import {
  IconCirclePlus,
  IconPlayerSkipBackFilled,
  IconPlayerSkipForwardFilled,
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
  IconVolume,
  IconVolume3,
  IconDownload,
  IconArticle,
  IconRepeat,
} from "@tabler/icons-react";
import { Menu, Button, Anchor } from "@mantine/core";
import { useAudio } from "../../utils/audioContext";
import { formatTime } from "../../utils/timeFormat";

const PlayerControls = () => {
  const {
    currentSong,
    audio,
    setIsPlaying,
    isPlaying,
    setIsMute,
    isMute,
    volume,
    setVolume,
    currentTime,
    duration,
    setPlaybackTime,
    playNextSong,
    setSongDescriptionAvailable,
    playBackSong,
  } = useAudio();
  const [isRepeat, setIsRepeat] = useState(false);
  const progressRef = useRef(null);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    setVolume(newVolume);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e) => {
    if (progressRef.current && duration > 0) {
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const newTime = (clickX / width) * duration;
      setPlaybackTime(Math.round(newTime));
    }
  };

  const handleAvailable = () => {
    setSongDescriptionAvailable(true);
  };

  const handleRepeatToggle = () => {
    setIsRepeat(!isRepeat);
    audio.loop = !isRepeat;
  };

  return (
    currentSong !== null && (
      <div className="border-t bg-black py-2 items-center border-gray-800 px-2 sm:px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between mx-auto">
          {/* Currently Playing */}
          <div className="flex items-center w-full sm:w-1/4 mb-2 sm:mb-0">
            <img
              src={currentSong.image}
              alt="Song cover"
              className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg object-cover mr-3 sm:mr-4 shadow-md"
            />
            <div className="truncate">
              <h4 className="text-white text-sm sm:text-base font-medium">{currentSong.song_name}</h4>
              <p className="text-xs sm:text-sm text-gray-400">{currentSong.singer_name}</p>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex flex-col items-center w-full sm:w-1/2">
            <div className="flex items-center gap-3 sm:gap-4 mb-2">
              <IconPlayerSkipBackFilled
                stroke={2}
                className="cursor-pointer text-white size-5 sm:size-6 hover:text-gray-300 transition-colors"
                onClick={playBackSong}
              />
              <button className="rounded-full p-2 hover:bg-gray-800 transition-colors" onClick={togglePlayPause}>
                {isPlaying ? (
                  <IconPlayerPauseFilled className="text-white w-6 h-6 sm:w-8 sm:h-8" />
                ) : (
                  <IconPlayerPlayFilled className="text-white w-6 h-6 sm:w-8 sm:h-8" />
                )}
              </button>
              <IconPlayerSkipForwardFilled
                className="text-white size-5 sm:size-6 cursor-pointer hover:text-gray-300 transition-colors"
                onClick={isRepeat ? () => {} : playNextSong}
              />
              <IconRepeat
                stroke={2}
                className={`size-5 sm:size-6 cursor-pointer transition-colors ${
                  isRepeat ? "text-blue-500" : "text-white hover:text-gray-300"
                }`}
                onClick={handleRepeatToggle}
              />
            </div>
            <div className="w-full flex items-center gap-2">
              <span className="text-xs sm:text-sm text-gray-400">{formatTime(currentTime)}</span>
              <div
                className="h-1.5 flex-1 bg-gray-600 rounded-full cursor-pointer hover:bg-gray-500 transition-colors"
                ref={progressRef}
                onClick={handleProgressClick}
              >
                <div className="h-1.5 bg-blue-500 rounded-full transition-all" style={{ width: `${progressPercent}%` }}></div>
              </div>
              <span className="text-xs sm:text-sm text-gray-400">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2 w-full sm:w-1/4 justify-end mt-2 sm:mt-0">
            <IconArticle
              stroke={2}
              className="size-5 sm:size-6 cursor-pointer text-white hover:text-gray-300 transition-colors"
              onClick={handleAvailable}
            />
            <Menu shadow="md">
              <Menu.Target>
                <Button variant="transparent" color="gray">
                  <IconDownload size={16} sm:size-20 />
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item>
                  <Anchor href={currentSong.video_download_url} underline="never" size="sm">
                    Download video
                  </Anchor>
                </Menu.Item>
                <Menu.Item>
                  <Anchor href={currentSong.audio_download_url} underline="never" size="sm">
                    Download audio
                  </Anchor>
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
            <div onClick={() => setIsMute(!isMute)}>
              {isMute ? (
                <IconVolume3 stroke={2} className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 cursor-pointer hover:text-white transition-colors" />
              ) : (
                <IconVolume stroke={2} className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 cursor-pointer hover:text-white transition-colors" />
              )}
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
              className="w-16 sm:w-24 accent-blue-500"
            />
          </div>
        </div>
      </div>
    )
  );
};

export default PlayerControls;