import { useState, useEffect } from "react";
import { createPlaylistService, getUserPlaylistByIdService, searchPlaylistsService, getPlaylistByIdService } from "../../../services/playlistService";
import { IconPlus, IconWorld, IconArrowRight, IconArrowLeft, IconSearch } from "@tabler/icons-react";
import { IconMusic } from "@tabler/icons-react";
import { usePlayList } from "../../../utils/playlistContext.jsx";

const Library = ({ setCurrentView, playlist }) => {
  return (
    <div className={`flex items-center cursor-pointer h-16 w-full rounded-lg px-4 ${playlist.is_liked_song ? 'bg-gradient-to-br from-[#450af5] to-[#8e8ee5]' : 'bg-gradient-to-br from-[#2c2c2c] to-[#1a1a1a]'}`}>
      <div className="flex items-center gap-4">
        {playlist.is_liked_song ? (
          <div className="flex items-center justify-center bg-[#450af5] p-2 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
            </svg>
          </div>
        ) : playlist.image ? (
          <img src={playlist.image} alt={playlist.title} className="w-10 h-10 rounded-full" />
        ) : (
          <div className="p-2 rounded bg-gradient-to-br from-[#333333] to-[#121212] flex items-center justify-center">
            <IconMusic stroke={2} className="w-6 h-6 text-gray-400" />
          </div>
        )}
        <div>
          <h3 className="text-sm font-bold cursor-pointer" onClick={() => setCurrentView(playlist)}>
            {playlist.title}
          </h3>
          <p className="text-xs text-gray-300">{playlist.song_count} bài hát</p>
        </div>
      </div>
    </div>
  );
};
const Libraries = ({ setCurrentView, currentView }) => {
  const [loading, setLoading] = useState(false);
  const [currentPlayList, setCurrentPlayList] = useState([]);
  const [widthContainer, setWidthContainer] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const [user, setUser] = useState(null);
  const { setPlaylists, refreshKeyPlayLists } = usePlayList();

  useEffect(() => {
    // Lấy thông tin người dùng từ localStorage khi component mount
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
          const response = await searchPlaylistsService(searchValue, 1, currentPlayList.length);
          console.log(response.data.playlists.reverse());
          
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
  }, [searchValue]);

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
    <div className={`flex ${widthContainer ? "w-[820px]" : "w-[420px]"} flex-col bg-[#131313] px-2 mx-2 text-white rounded-lg`}>
      <div className="flex flex-row justify-between items-center pt-4 pb-8 px-2">
        <span className="text-md font-bold">Thư viện</span>
        <div className="flex items-center">
          <button className="bg-[#272727] flex items-center justify-center h-[36px] px-4 rounded-3xl cursor-pointer hover:bg-[#242424]" onClick={() => handleCreatePlaylist()}>
            <IconPlus stroke={2} className="size-5 mr-1" />
            <h3 className="text-md font-bold text-gray-300">Tạo</h3>
          </button>
          <button className="flex ml-1 cursor-pointer w-[36px] h-[36px] justify-center items-center rounded-full  text-gray-400 hover:bg-[#242424]">
            {!widthContainer ? (
              <IconArrowRight stroke={2} className="size-7" onClick={() => setWidthContainer(!widthContainer)} />
            ) : (
              <IconArrowLeft stroke={2} className="size-7" onClick={() => setWidthContainer(!widthContainer)} />
            )}
          </button>
        </div>
      </div>
      <div>
        {widthContainer ? (
          <div className="flex flex-1 flex-row bg-[#272727] mb-3 px-4 py-2 items-center rounded-full">
            <IconSearch stroke={2} className="size-7 " />
            <input onChange={(e) => setSearchValue(e.target.value)} type="text" className="flex-1 mx-2 bg-[#272727]  border-r border-white" />
          </div>
        ) : (
          <IconSearch stroke={2} className="size-7 mt-2 mb-5 cursor-pointer" onClick={() => setWidthContainer(!widthContainer)} />
        )}
      </div>
      <div className="h-[calc(100vh-410px)] overflow-y-auto space-y-4 pr-1 hover:scrollbar-thin hover:scrollbar-thumb-gray-600 hover:scrollbar-track-transparent scrollbar-none">
        {currentPlayList.length == 0 ? (
          <>
            <div className="bg-[#272727] h-36 w-full p-5 rounded-lg">
              <h3 className="font-bold">Tạo danh sách phát đầu tiên của bạn</h3>
              <h3 className="text-sm font-semibold">Rất dễ! chúng tôi sẽ giúp bạn</h3>
              <button className="mt-4 text-sm font-bold bg-white text-black rounded-full py-1.5 px-4" onClick={() => handleCreatePlaylist()}>Tạo danh sách phát</button>
            </div>
            
          </>
        ) : (
          currentPlayList.map((playlist) => <Library key={playlist.id} playlist={playlist} setCurrentView={setCurrentView} />)
        )}
      </div>
      <div className="flex flex-col px-4">
        <div className="flex flex-wrap">
          <span className="text-xs mb-2 mr-7 font-semibold cursor-pointer text-gray-400">Pháp lý</span>
          <span className="text-xs mb-2 mr-7 font-semibold cursor-pointer text-gray-400">Trung tâm an toàn và quyền riêng tư</span>
          <span className="text-xs mb-2 mr-7 font-semibold cursor-pointer text-gray-400">Chính sách quyền riêng tư</span>
          <span className="text-xs mb-2 mr-7 font-semibold cursor-pointer text-gray-400">Cookie</span>
          <span className="text-xs mb-2 mr-7 font-semibold cursor-pointer text-gray-400">Giới thiệu</span>
          <span className="text-xs mb-2 mr-7 font-semibold cursor-pointer text-gray-400">Quảng cáo</span>
          <span className="text-xs mb-2 mr-7 font-semibold cursor-pointer text-gray-400">Hổ trợ tiếp cận</span>
        </div>
        <span className="text-sm font-bold w-fit cursor-pointer">Cookie</span>
        <div className="flex items-center my-6 border py-2 px-4 cursor-pointer w-fit rounded-full">
          <IconWorld stroke={2} className="size-5 mr-2" />
          <span>Tiếng Việt</span>
        </div>
      </div>
    </div>
  );
};
export default Libraries;
