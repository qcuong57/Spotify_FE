import { useState, useEffect } from "react";
import {
  createPlaylistService,
  getUserPlaylistByIdService,
  searchPlaylistsService,
} from "../../../services/playlistService";
import {
  IconPlus,
  IconSearch,
  IconX,
  IconMusic,
  IconWorld,
} from "@tabler/icons-react";
import { usePlayList } from "../../../utils/playlistContext.jsx";

const Library = ({ playlist, setCurrentView }) => {
  return (
    <div
      className={`flex items-center cursor-pointer h-14 md:h-16 w-full rounded-lg px-3 md:px-4 ${
        playlist.is_liked_song
          ? "bg-gradient-to-br from-[#450af5] to-[#8e8ee5]"
          : "bg-gradient-to-br from-[#2c2c2c] to-[#1a1a1a]"
      } hover:bg-gray-700 transition-colors`}
    >
      <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
        {playlist.is_liked_song ? (
          <div className="flex items-center justify-center bg-[#450af5] p-2 rounded flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5 md:w-6 md:h-6"
            >
              <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
            </svg>
          </div>
        ) : playlist.image ? (
          <img
            src={playlist.image}
            alt={playlist.title}
            className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover flex-shrink-0 shadow-md"
          />
        ) : (
          <div className="p-2 rounded bg-gradient-to-br from-[#333333] to-[#121212] flex items-center justify-center flex-shrink-0">
            <IconMusic
              stroke={2}
              className="w-5 h-5 md:w-6 md:h-6 text-gray-400"
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3
            className="text-sm md:text-base font-bold cursor-pointer truncate hover:text-blue-400 transition-colors"
            onClick={() => setCurrentView(playlist)}
          >
            {playlist.title}
          </h3>
          <p className="text-xs md:text-sm text-gray-300 truncate">
            {playlist.song_count} bài hát
          </p>
        </div>
      </div>
    </div>
  );
};

const Libraries = ({ setCurrentView, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [currentPlayList, setCurrentPlayList] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [user, setUser] = useState(null);
  const { setPlaylists, refreshKeyPlayLists } = usePlayList();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [setCurrentView]);

  useEffect(() => {
    const fetchPlaylists = async () => {
      setLoading(true);
      try {
        if (user) {
          const response = await getUserPlaylistByIdService(user.id);
          setCurrentPlayList(response.data.playlists.reverse());
          setPlaylists(response.data.playlists.reverse());
        }
      } catch (error) {
        console.error("Error fetching playlists:", error);
        if (error.response && error.response.status === 401) {
          console.log("User not authenticated. Please log in.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, [user, refreshKeyPlayLists]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchValue) {
        try {
          const response = await searchPlaylistsService(
            searchValue,
            1,
            currentPlayList.length
          );
          setCurrentPlayList(response.data.playlists.reverse());
        } catch (error) {
          console.error("Error fetching search results:", error);
        }
      } else {
        if (user) {
          const response = await getUserPlaylistByIdService(user.id);
          setCurrentPlayList(response.data.playlists.reverse());
        }
      }
    };
    fetchSearchResults();
  }, [searchValue, user]);

  const handleCreatePlaylist = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập để tạo danh sách phát");
      return;
    }
    setLoading(true);

    const formData = {
      title: `Danh sách phát của bạn`,
      description: "Mô tả playlist mới",
      token: localStorage.getItem("access_token"),
    };

    try {
      const response = await createPlaylistService(formData);
      setPlaylists([
        ...currentPlayList,
        {
          id: response.data.id,
          title: response.data.title,
          description: response.data.description,
        },
      ]);
      setCurrentView(response.data);
    } catch (error) {
      console.error("Error in creating playlist:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col bg-[#131313] px-2 md:px-4 mx-0 md:mx-2 text-white rounded-lg relative md:w-[420px]">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 z-10 bg-[#272727] hover:bg-[#3a3a3a] rounded-full p-1.5 transition-colors group"
        title="Đóng thư viện"
      >
        <IconX
          stroke={2}
          className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-white"
        />
      </button>

      <div className="flex flex-row justify-between items-center pt-4 pb-6 px-2 pr-10">
        <span className="text-base md:text-lg font-bold">Thư viện</span>
        <button
          className="bg-[#272727] flex items-center justify-center h-9 md:h-10 px-3 md:px-4 rounded-full cursor-pointer hover:bg-[#242424] transition-colors"
          onClick={() => handleCreatePlaylist()}
        >
          <IconPlus stroke={2} className="w-4 h-4 md:w-5 md:h-5 mr-1" />
          <span className="text-sm md:text-base font-bold text-gray-300 hidden xs:inline">
            Tạo
          </span>
        </button>
      </div>

      {/* Search Section */}
      <div className="mb-4">
        <div className="flex flex-1 flex-row bg-[#272727] mb-3 px-4 py-2 items-center rounded-full">
          <IconSearch
            stroke={2}
            className="w-5 h-5 md:w-6 md:h-6 text-gray-400"
          />
          <input
            onChange={(e) => setSearchValue(e.target.value)}
            type="text"
            placeholder="Tìm kiếm playlist..."
            className="flex-1 mx-2 bg-[#272727] border-none outline-none text-sm text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Playlists List */}
      <div className="flex-1 overflow-y-auto space-y-2 md:space-y-3 pr-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {currentPlayList.length === 0 ? (
          <div className="bg-[#272727] p-4 md:p-6 rounded-lg">
            <h3 className="font-bold text-sm md:text-base mb-2">
              Tạo danh sách phát đầu tiên của bạn
            </h3>
            <p className="text-xs md:text-sm text-gray-300 mb-4">
              Rất dễ! chúng tôi sẽ giúp bạn
            </p>
            <button
              className="text-xs md:text-sm font-bold bg-white text-black rounded-full py-2 px-4 hover:bg-gray-200 transition-colors"
              onClick={() => handleCreatePlaylist()}
            >
              Tạo danh sách phát
            </button>
          </div>
        ) : (
          currentPlayList.map((playlist) => (
            <Library
              key={playlist.id}
              playlist={playlist}
              setCurrentView={setCurrentView}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-col px-2 md:px-4 py-4 mt-4 border-t border-gray-700">
        <div className="flex flex-wrap gap-2 md:gap-4 mb-4">
          {[
            "Pháp lý",
            "Trung tâm an toàn",
            "Chính sách",
            "Cookie",
            "Giới thiệu",
            "Quảng cáo",
          ].map((item) => (
            <span
              key={item}
              className="text-xs text-gray-400 cursor-pointer hover:text-white transition-colors"
            >
              {item}
            </span>
          ))}
        </div>
        <div className="flex items-center border border-gray-600 py-2 px-3 cursor-pointer w-fit rounded-full hover:border-gray-500 transition-colors">
          <IconWorld stroke={2} className="w-4 h-4 mr-2 text-gray-400" />
          <span className="text-xs md:text-sm text-gray-300">Tiếng Việt</span>
        </div>
      </div>
    </div>
  );
};
export default Libraries;