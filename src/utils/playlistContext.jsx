import { createContext, useContext, useState, useEffect } from "react";
import { getUserPlaylistByIdService } from "../services/playlistService"; // <-- THÊM IMPORT

// Tạo Context với tên đúng
const PlayListContext = createContext();

// Provider Component
export const PlayListProvider = ({ children }) => {
  const [playlists, setPlaylists] = useState([]);
  const [refreshKeyPlayLists, setRefreshKeyPlayLists] = useState(0); // Đổi thành số cho dễ
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [user, setUser] = useState(null);

  // useEffect này sẽ chạy khi app tải, hoặc khi key refresh
  // để kiểm tra xem user đã đăng nhập chưa
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const accessToken = localStorage.getItem("access_token");
    if (storedUser && accessToken) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
      setPlaylists([]); // Nếu logout thì xóa sạch playlist
    }
  }, [refreshKeyPlayLists]); // Chạy lại khi có yêu cầu refresh (ví dụ: sau khi login/logout)

  // useEffect này TỰ ĐỘNG TẢI playlist khi có user
  useEffect(() => {
    const fetchUserPlaylists = async () => {
      // Nếu không có user, reset state và không làm gì cả
      if (!user || !user.id) {
        setPlaylists([]);
        setLoadingPlaylists(false);
        return;
      }

      // Bắt đầu tải
      try {
        setLoadingPlaylists(true);
        const response = await getUserPlaylistByIdService(user.id);

        if (response && response.data && response.data.playlists) {
          setPlaylists(response.data.playlists);
        } else {
          setPlaylists([]);
        }
      } catch (error) {
        console.error("PlayListContext - Lỗi khi tải playlist:", error);
        setPlaylists([]);
      } finally {
        setLoadingPlaylists(false);
      }
    };

    fetchUserPlaylists();
  }, [user, refreshKeyPlayLists]); // Tải lại khi user thay đổi (login) hoặc khi có key refresh

  return (
    <PlayListContext.Provider // <-- SỬA TÊN CONTEXT
      value={{
        playlists,
        setPlaylists,
        refreshKeyPlayLists,
        setRefreshKeyPlayLists,
        loadingPlaylists, // <-- Thêm state loading
      }}
    >
      {children}
    </PlayListContext.Provider>
  );
};

// Custom Hook để sử dụng Context
export const usePlayList = () => {
  const context = useContext(PlayListContext); // <-- SỬA TÊN CONTEXT
  if (!context) {
    // Sửa lại thông báo lỗi cho đúng
    throw new Error("usePlayList must be used within a PlayListProvider");
  }
  return context;
};