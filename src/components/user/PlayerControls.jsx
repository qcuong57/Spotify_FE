import { useRef } from "react";
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
} from "@tabler/icons-react";
import { Menu, Button, Anchor } from "@mantine/core";
import { useAudio } from "../../utils/audioContext";
import { formatTime } from "../../utils/timeFormat";

const PlayerControls = () => {
    const { currentSong, audio, setIsPlaying, isPlaying, setIsMute, isMute, volume, setVolume, currentTime, duration, setPlaybackTime, playNextSong, setSongDescriptionAvailable, playBackSong } = useAudio();
    const progressRef = useRef(null);

    const togglePlayPause = () => {
        setIsPlaying(!isPlaying);
        if (isPlaying) {
            audio.pause(); // Tạm dừng bài hát nếu đang phát
        } else {
            audio.play(); // Phát bài hát nếu không đang phát
        }
    };

    const handleVolumeChange = (e) => {
        const newVolume = e.target.value;
        setVolume(newVolume);
    };

    // Tính phần trăm tiến trình
    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    // Xử lý khi nhấp vào thanh tiến trình
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
        setSongDescriptionAvailable(true)
    }

    return (
        currentSong !== null && (
            <div className="border-t bg-black py-2 items-center border-gray-800 px-4">
                <div className="flex items-center justify-between mx-auto">
                    {/* Currently Playing */}
                    <div className="flex items-center w-1/4">
                        <img src={currentSong.image} alt="Song cover" className="h-14 w-14 rounded-md mr-4" />
                        <div>
                            <h4 className="text-white text-sm">{currentSong.song_name}</h4>
                            <p className="text-xs text-gray-400">{currentSong.singer_name}</p>
                        </div>
                    </div>

                    {/* Playback Controls */}
                    <div className="flex flex-col items-center w-1/2">
                        <div className="flex items-center gap-4 mb-2">
                            <IconPlayerSkipBackFilled stroke={2} className="cursor-pointer text-white size-6" onClick={playBackSong}/>
                            <button className="rounded-full p-2" onClick={togglePlayPause}>
                                {isPlaying ? <IconPlayerPauseFilled className="text-white w-6 h-6" /> : <IconPlayerPlayFilled className="text-white w-6 h-6" />}
                            </button>
                            <IconPlayerSkipForwardFilled className="text-white size-6 cursor-pointer" onClick={playNextSong} />
                        </div>
                        <div className="w-full flex items-center gap-2">
                            <span className="text-xs text-gray-400">{formatTime(currentTime)}</span>
                            <div className="h-1 flex-1 bg-gray-600 rounded-full cursor-pointer" ref={progressRef} onClick={handleProgressClick}>
                                <div className="h-1 bg-white rounded-full" style={{ width: `${progressPercent}%` }}></div>
                            </div>
                            <span className="text-xs text-gray-400">{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Volume Control */}
                    <div className="flex items-center gap-2 w-1/4 justify-end">
                        <IconArticle stroke={2} className="size-6 cursor-pointer text-white" onClick={handleAvailable} />
                        {/* Download */}
                        <Menu shadow="md">
                            <Menu.Target>
                                <Button variant="transparent" color="gray">
                                    <IconDownload size={20} />
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
                            {isMute ? <IconVolume3 stroke={2} className="w-5 h-5 text-gray-400 cursor-pointer" /> : <IconVolume stroke={2} className="w-5 h-5 text-gray-400 cursor-pointer" />}
                        </div>
                        <input type="range" min="0" max="100" value={volume} onChange={handleVolumeChange} className="w-24" />
                    </div>
                </div>
            </div>
        )
    );
};

export default PlayerControls;
