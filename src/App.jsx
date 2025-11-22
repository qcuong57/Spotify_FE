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
import { HelmetProvider, Helmet } from "react-helmet-async"; // [THÊM] Helmet

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
import { AudioProvider, useAudio } from "./utils/audioContext"; // [THÊM] useAudio
import SignUp from "./components/user/SignUp";
import OAuthCallback from "./components/auth/OAuthCallback";
import AuthProvider from "./context/auth/AuthProvider";
import { PlayListProvider } from "./utils/playlistContext";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import ThemeProvider from "./context/ThemeProvider";
import SongDetail from "./components/user/SongDetail";

// --- [COMPONENT MỚI] TỰ ĐỘNG ĐỔI TÊN TAB THEO BÀI HÁT ---
const GlobalSongTitle = () => {
  const { currentSong, isPlaying } = useAudio();

  // Nếu chưa có bài hát, hiển thị tên mặc định
  if (!currentSong) {
    return (
      <Helmet>
        <title>Music App - Nghe nhạc mọi lúc mọi nơi</title>
      </Helmet>
    );
  }

  // Nếu đang phát, hiển thị tên bài hát
  return (
    <Helmet>
      <title>
        {isPlaying ? "" : ""} {currentSong.song_name} -{" "}
        {currentSong.singer_name}
      </title>
    </Helmet>
  );
};
// ---------------------------------------------------------

const HomeLayout = () => {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <HomePage />
      <Outlet />
    </div>
  );
};

const SongDetailWrapper = () => {
  const { songId } = useParams();
  const navigate = useNavigate();

  if (!songId) return null;

  return (
    <SongDetail
      songId={songId}
      onClose={() => {
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
                    {/* [QUAN TRỌNG] Đặt GlobalSongTitle ở đây để nó luôn chạy */}
                    <GlobalSongTitle />

                    <Routes>
                      <Route path="/" element={<HomeLayout />}>
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
