import { useState, useEffect } from "react";
import {
  searchSongs,
} from "../../../services/SongsService";
import {
  getSongsFromPlaylistService,
  deleteSongFromPlaylistService,
  addSongToPlaylistService,
} from "../../../services/SongPlaylistService";
import {
  IconChevronRight,
  IconMusic,
  IconPlayerPlayFilled,
  IconList,
  IconDotsVertical,
  IconClockHour3,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import Song from "./_Song";
import SearchedSong from "./_SearchedSong";
import EditPlaylistForm from "./_EditPlaylistForm";
import { usePlayList } from "../../../utils/playlistContext";
import { IconTrash } from "@tabler/icons-react";
import { deletePlaylistService } from "../../../services/playlistService";
import { useAudio } from "../../../utils/audioContext";

const MyLibrary = ({ playlist, setCurrentView }) => {
  const [available, setAvailable] = useState(false);
  const [songs, setSongs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [referesh, setRefresh] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const { playlists, setPlaylists, refreshKeyPlayLists, setRefreshKeyPlayLists } = usePlayList();
  const [user, setUser] = useState(null);
  const { setNewPlaylist } = useAudio();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const fetchSongs = async () => {
      if (!playlist || !playlist.id) return;
      try {
        const formData = {
          token: localStorage.getItem("access_token"),
        };
        const response = await getSongsFromPlaylistService(playlist.id, formData);
        setSongs(response.data.songs);
      } catch (error) {
        console.error("Error fetching songs:", error);
      }
    };

    fetchSongs();
  }, [playlist, referesh]);

  const handleSearch = async (e) => {
    if (e.key === "Enter") {
      try {
        const response = await searchSongs(searchQuery);
        setSearchResults(response.data.results || []);
      } catch (error) {
        console.error("Error searching songs:", error);
        setSearchResults([]);
      }
    }
  };

  const deleteSong = async (songId) => {
    try {
      await deleteSongFromPlaylistService(playlist.id, songId);
      setRefreshKeyPlayLists(Date.now());
      setRefresh(Date.now());
    } catch (error) {
      console.error("Lỗi khi xóa bài hát:", error);
    }
  };

  const addSongToPlaylist = async (songId) => {
    try {
      const formData = {
        playlist_id: playlist.id,
        song_id: songId,
        token: localStorage.getItem("access_token"),
      };
      await addSongToPlaylistService(formData);
      alert("Thêm bài hát vào playlist thành công!");
      setRefresh(Date.now());
      setRefreshKeyPlayLists(Date.now());
    } catch (error) {
      console.error("Error adding song to playlist:", error);
    }
  };

  const removeSearch = () => {
    setSearchResults([]);
    setSearchQuery("");
  };

  const playSongFromThisList = () => {
    setNewPlaylist(songs, 0);
  };

  const handleRemove = async () => {
    try {
      const isConfirmed = confirm("Bạn có chắc chắn xóa danh sách này không?");
      if (isConfirmed) {
        await deletePlaylistService(playlist.id);
        alert("Xóa thành công");
        setRefreshKeyPlayLists(Date.now());
        setCurrentView("main");
      }
    } catch (error) {
      console.error("Error deleting playlist:", error);
      alert("Đã xảy ra lỗi khi xóa danh sách");
    }
  };

  return (
    <div className="bg-[#131313] text-white flex-1 mr-0 sm:mr-2 rounded-lg overflow-y-auto">
      <div className="flex flex-col">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-2 sm:gap-4 p-4 pb-4 sm:pb-6 bg-gradient-to-b from-[#666666] to-[#595959]">
          <div className="w-[150px] h-[150px] sm:w-[232px] sm:h-[232px] bg-gradient-to-br from-[#333333] to-[#121212] flex items-center justify-center">
            {playlist.image ? (
              <img src={playlist.image} alt={playlist.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#333333] to-[#121212] flex items-center justify-center">
                <IconMusic stroke={2} className="w-16 h-16 sm:w-24 sm:h-24 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:gap-4 cursor-pointer" onClick={() => !playlist.is_liked_song && setIsEditing(true)}>
            <div>
              <h1 className="text-3xl sm:text-5xl font-bold mt-2 cursor-pointer">{playlist.title}</h1>
            </div>
            <h3 className="text-xs sm:text-sm text-gray-400">{playlist.description}</h3>
            {user && (
              <div className="flex items-center gap-2">
                <img src={user.avatar} alt="User Avatar" className="w-5 h-5 sm:w-6 sm:h-6 rounded-full" />
                <span className="text-xs sm:text-sm font-semibold">{user.first_name}</span>
              </div>
            )}
          </div>
          <div className="flex flex-1 justify-end">
            <IconTrash stroke={2} className="cursor-pointer size-5 sm:size-6" onClick={handleRemove} />
          </div>
        </div>
        <div className="flex flex-row justify-between items-center mx-4 sm:mx-6">
          <div className="flex flex-row items-center">
            {songs.length > 0 ? (
              <div
                onClick={playSongFromThisList}
                className="mr-2 sm:mr-4 bg-green-500 cursor-pointer rounded-full group-hover:block transition-all duration-300 hover:scale-110 hover:bg-green-400"
              >
                <IconPlayerPlayFilled className="size-8 sm:size-12 p-2 sm:p-3 text-black" />
              </div>
            ) : (
              <IconDotsVertical stroke={2} className="size-6 sm:size-8" />
            )}
          </div>
          <div className="flex flex-row items-center py-4 sm:py-8">
            <h3 className="text-sm sm:text-md text-gray-300 mr-2">Danh sách</h3>
            <IconList stroke={2} className="size-4 sm:size-5" />
          </div>
        </div>
        <div className="mx-4 sm:mx-12 mb-4">
          <div className="grid grid-cols-[16px_4fr_2fr_1fr] sm:grid-cols-[16px_4fr_2fr_1fr] gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400 border-b border-gray-700/50 pb-2">
            <div>#</div>
            <div>Tiêu đề</div>
            <div>Album</div>
            <div className="flex justify-end">
              <IconClockHour3 stroke={2} className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>

          {songs.length > 0 ? (
            songs.map((song, index) => (
              <Song
                key={song.id}
                song={song}
                playlist={playlist}
                deleteSong={deleteSong}
                songs={songs}
                index={index}
              />
            ))
          ) : (
            <div className="text-gray-400 mt-4 text-xs sm:text-sm">
              Chưa có bài hát nào trong playlist này
            </div>
          )}
        </div>
        <div className="mx-4 sm:mx-6 border-t border-t-gray-700/50 pt-4 sm:pt-5">
          <h3 className="text-xl sm:text-2xl font-bold">
            Hãy cùng tìm nội dung cho danh sách phát của bạn
          </h3>
          <div className="flex flex-row justify-between items-center">
            <div className="w-full max-w-[300px] sm:max-w-[364px] relative mt-4">
              <input
                type="text"
                placeholder="Tìm bài hát và tập podcast"
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                value={searchQuery}
                className="w-full bg-[#242424] px-8 sm:px-10 py-2 rounded-full text-xs sm:text-sm placeholder:text-gray-400"
              />
              <IconSearch
                className="w-4 h-4 sm:w-5 sm:h-5 absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
            <IconX
              className="size-5 sm:size-6 text-gray-400 cursor-pointer"
              onClick={removeSearch}
            />
          </div>
        </div>
        <div className="pb-6 mx-4">
          {searchResults.length > 0 &&
            searchResults.map((song, index) => (
              <SearchedSong
                key={index}
                song={song}
                playlist={playlist}
                addSongToPlaylist={addSongToPlaylist}
              />
            ))}
        </div>
      </div>
      {isEditing && (
        <EditPlaylistForm
          playlist={playlist}
          onClose={() => setIsEditing(false)}
          setCurrentView={setCurrentView}
        />
      )}
    </div>
  );
};

export default MyLibrary;