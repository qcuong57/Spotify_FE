import {
  BrowserRouter,
  Routes,
  Route,
  useParams,
  useNavigate,
  Outlet,
} from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { HelmetProvider } from "react-helmet-async"; // [QUAN TRỌNG] Thêm thư viện này

import HomePage from "./components/HomePage";
import Login from "./components/user/Login";
import Admin from "./components/admin/Admin";
import User from "./components/admin/User/User";
import CreateUserForm from "./components/admin/User/Create/CreateUserForm";
import UpdateUserForm from "./components/admin/User/Update/UpdateUserForm";
import Song from "./components/admin/Song/Song";
import CreateSongForm from "./components/admin/Song/Create/CreateSongForm";
import UpdateSongForm from "./components/admin/Song/Update/UpdateSongForm";
import Genre from "./components/admin/Genre/Genre";
import CreateGenreForm from "./components/admin/Genre/Create/CreateGenreForm";
import UpdateGenreForm from "./components/admin/Genre/Update/UpdateGenreForm";
import Playlist from "./components/admin/Playlists/Playlists";
import CreatePlaylistForm from "./components/admin/Playlists/Create/CreatePlaylistForm";
import UpdatePlaylistForm from "./components/admin/Playlists/Update/UpdatePlaylistForm";
import { AudioProvider } from "./utils/audioContext";
import SignUp from "./components/user/SignUp";
import OAuthCallback from "./components/auth/OAuthCallback";
import AuthProvider from "./context/auth/AuthProvider";
import { PlayListProvider } from "./utils/playlistContext";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import ThemeProvider from "./context/ThemeProvider";
import SongDetail from "./components/user/SongDetail";

// [LAYOUT] Giữ HomePage luôn hiển thị làm nền, SongDetail sẽ hiện đè lên (Outlet)
const HomeLayout = () => {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <HomePage />
      {/* Outlet là nơi SongDetailWrapper sẽ được render vào */}
      <Outlet />
    </div>
  );
};

// [WRAPPER] Xử lý logic lấy ID và đóng Modal
const SongDetailWrapper = () => {
  const { songId } = useParams();
  const navigate = useNavigate();

  // Nếu không có ID thì không render gì cả
  if (!songId) return null;

  return (
    <SongDetail
      songId={songId}
      onClose={() => {
        // Khi đóng modal, quay về trang chủ ('/')
        // Nhờ Nested Route, HomePage sẽ KHÔNG bị reload
        navigate("/");
      }}
    />
  );
};

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <PlayListProvider>
          <MantineProvider>
            <ModalsProvider>
              <Notifications />
              <AuthProvider>
                <BrowserRouter>
                  <AudioProvider>
                    <Routes>
                      {/* [USER ROUTES] Cấu hình lồng nhau để giữ trạng thái HomePage */}
                      <Route path="/" element={<HomeLayout />}>
                        {/* Khi vào /song/123, component này sẽ hiện đè lên HomePage */}
                        <Route
                          path="song/:songId"
                          element={<SongDetailWrapper />}
                        />
                      </Route>

                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<SignUp />} />
                      <Route
                        path="/auth/callback"
                        element={<OAuthCallback />}
                      />

                      {/* [ADMIN ROUTES] */}
                      <Route element={<ProtectedAdminRoute />}>
                        <Route path="admin" element={<Admin />}>
                          <Route path="users" element={<User />} />
                          <Route
                            path="users/create"
                            element={<CreateUserForm />}
                          />
                          <Route
                            path="users/update/:userId"
                            element={<UpdateUserForm />}
                          />

                          <Route path="songs" element={<Song />} />
                          <Route
                            path="songs/create"
                            element={<CreateSongForm />}
                          />
                          <Route
                            path="songs/update/:id"
                            element={<UpdateSongForm />}
                          />

                          <Route path="genres" element={<Genre />} />
                          <Route
                            path="genres/create"
                            element={<CreateGenreForm />}
                          />
                          <Route
                            path="genres/update/:id"
                            element={<UpdateGenreForm />}
                          />

                          <Route path="playlists" element={<Playlist />} />
                          <Route
                            path="playlists/create"
                            element={<CreatePlaylistForm />}
                          />
                          <Route
                            path="playlists/update/:id"
                            element={<UpdatePlaylistForm />}
                          />
                        </Route>
                      </Route>
                    </Routes>
                  </AudioProvider>
                </BrowserRouter>
              </AuthProvider>
            </ModalsProvider>
          </MantineProvider>
        </PlayListProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
