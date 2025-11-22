import { useState } from "react";
import Header from "./user/Header.jsx";
import Libraries from "./user/library/Libraries.jsx";
import MainContent from "./user/MainContent.jsx";
import PlayerControls from "./user/PlayerControls.jsx";
import MyLibrary from "./user/library/MyLibrary.jsx";
import SongDescription from "./user/SongDescription.jsx";
import { useAudio } from "../utils/audioContext.jsx";
import ListSongs from "./user/ListSongs.jsx";
import { IconMenu2 } from "@tabler/icons-react";
import { useTheme } from "../context/themeContext.js";
import ThemeSelector from "../components/user/ThemeSelector.jsx";
import { ThemeParticles } from "../components/user/ThemeParticles.jsx";

// Import SongDetail
import SongDetail from "./user/SongDetail.jsx";

const HomePage = () => {
  const [currentView, setCurrentView] = useState("main");
  const [listSongsDetail, setListSongsDetail] = useState([]);
  const [showLibraries, setShowLibraries] = useState(false);
  const [showPlayerControls, setShowPlayerControls] = useState(true);
  const { currentSong, songDescriptionAvailable } = useAudio();
  const { theme } = useTheme();

  // State quản lý SongDetail Modal
  const [songDetailModal, setSongDetailModal] = useState({
    isVisible: false,
    songId: null,
  });

  const togglePlayerControls = () => {
    setShowPlayerControls(!showPlayerControls);
  };

  const toggleLibraries = () => {
    setShowLibraries(!showLibraries);
  };

  const handleCloseLibraries = () => {
    setShowLibraries(false);
  };

  // Hàm mở/đóng SongDetail Modal
  const handleOpenSongDetail = (songId) => {
    setSongDetailModal({ isVisible: true, songId: songId });
  };

  const handleCloseSongDetail = () => {
    setSongDetailModal({ isVisible: false, songId: null });
  };

  return (
    <div
      className="flex flex-1 flex-col h-screen relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${theme.backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Theme Particles Effect */}
      <ThemeParticles />

      <Header
        setCurrentView={setCurrentView}
        setListSongsDetail={setListSongsDetail}
      />

      <div className="flex flex-row flex-1 overflow-hidden relative">
        {/* Show Libraries button when hidden with theme colors */}
        {!showLibraries && (
          <button
            onClick={() => setShowLibraries(true)}
            className={`fixed top-1/2 left-4 -translate-y-1/2 z-20 bg-gradient-to-br ${theme.colors.background} hover:bg-gradient-to-br hover:${theme.colors.backgroundOverlay} text-${theme.colors.text} hover:text-white rounded-full p-2 sm:p-3 shadow-lg transition-all duration-300 hover:scale-110 backdrop-blur-sm`}
            title="Mở thư viện"
          >
            <IconMenu2
              stroke={2}
              className={`w-5 h-5 sm:w-6 sm:h-6 text-${theme.colors.text} hover:text-white transition-colors duration-200`}
            />
          </button>
        )}

        {showLibraries && (
          <Libraries
            setCurrentView={setCurrentView}
            currentView={currentView}
            onClose={() => setShowLibraries(false)}
          />
        )}

        {/* Main content area */}
        <div className="flex-1 flex flex-row overflow-hidden">
          {currentView === "main" ? (
            <MainContent
              setCurrentView={setCurrentView}
              setListSongsDetail={setListSongsDetail}
            />
          ) : currentView === "listSongs" ? (
            <ListSongs listSongs={listSongsDetail} />
          ) : (
            <MyLibrary playlist={currentView} setCurrentView={setCurrentView} />
          )}

          {/* SongDescription */}
          {songDescriptionAvailable && (
            <SongDescription onOpenDetail={handleOpenSongDetail} />
          )}
        </div>
      </div>

      {/* PlayerControls with integrated toggle button */}
      {currentSong && (
        <PlayerControls
          isVisible={showPlayerControls}
          onToggleVisibility={togglePlayerControls}
        />
      )}

      {/* Theme Selector Modal */}
      <ThemeSelector />

      {/* Render SongDetail Modal */}
      {songDetailModal.isVisible && (
        <SongDetail
          songId={songDetailModal.songId}
          onClose={handleCloseSongDetail}
        />
      )}
    </div>
  );
};

export default HomePage;
