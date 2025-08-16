import { useState, useEffect } from "react";
import { IconX } from "@tabler/icons-react";
import Header from "./user/Header.jsx";
import Libraries from "./user/library/Libraries.jsx";
import MainContent from "./user/MainContent.jsx";
import PlayerControls from "./user/PlayerControls.jsx";
import MyLibrary from "./user/library/MyLibrary.jsx";
import ChatManager from "./chat/ChatManager.jsx";
import SongDescription from "./user/SongDescription.jsx";
import { useAudio } from "../utils/audioContext.jsx";
import ListSongs from "./user/ListSongs.jsx";
import { IconMenu2, IconChevronUp, IconChevronDown } from "@tabler/icons-react";
import { useTheme } from "../context/themeContext.js"; // Import useTheme
import ThemeSelector from "../components/user/ThemeSelector.jsx";
import { ThemeParticles } from "../components/user/ThemeParticles.jsx";

const Banner = ({ onClose, theme }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  const handleImageClick = () => {
    window.open(
      "https://www.canva.com/design/DAGthQ5xU60/iu8Sz4qt-xi-JAs6sRKRKQ/view?utm_content=DAGthQ5xU60&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h94cf7efdc2",
      "_blank"
    );
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ease-out ${
        isVisible && !isClosing ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={handleClose}
      ></div>

      {/* Banner content - Square aspect ratio */}
      <div
        className={`relative bg-gradient-to-br ${
          theme.colors.background
        } shadow-2xl rounded-2xl transform transition-all duration-300 ease-out ${
          isVisible && !isClosing
            ? "scale-100 opacity-100"
            : "scale-95 opacity-0"
        }`}
      >
        {/* Square container with responsive sizing */}
        <div className="w-80 h-80 sm:w-96 sm:h-96 relative overflow-hidden rounded-2xl">
          {/* Overlay gradient for better text contrast */}
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className={`absolute top-4 right-4 z-10 p-2 rounded-full bg-${theme.colors.primary}-600 bg-opacity-20 hover:bg-opacity-30 transition-all duration-200 group`}
            title="Đóng banner"
          >
            <IconX
              className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-200"
              stroke={2}
            />
          </button>

          {/* Content centered in square */}
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="text-center space-y-6">
              {/* Icon */}
              <div className="flex justify-center">
                <div
                  className={`w-16 h-16 bg-${theme.colors.primary}-600 rounded-full flex items-center justify-center text-3xl animate-pulse`}
                >
                  <img src="https://yzfbdwvbybecxhbitkmc.supabase.co/storage/v1/object/sign/image/78ed005b-b0aa-427b-bc0d-6f1efb29e653.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82OTc4ZGU2My0wOWQzLTRhYmYtOWRjZC0wZjY0NTBlN2VlYmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS83OGVkMDA1Yi1iMGFhLTQyN2ItYmMwZC02ZjFlZmIyOWU2NTMucG5nIiwiaWF0IjoxNzU0MTM1Mzk4LCJleHAiOjIwNjk0OTUzOTh9.MxsdoFIdkMKWNqhTMN5PTDT2k_K-ELn-q7OzxBEF9PM" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-white font-bold text-2xl sm:text-3xl leading-tight">
                Thông báo
              </h3>

              {/* Description */}
              <p className="text-white text-sm sm:text-base opacity-90 leading-relaxed max-w-xs mx-auto">
                Nếu website đang trong trạng thái tải nhạc vui lòng đợi từ 1-2 phút.
              </p>
              <p className="text-white text-sm sm:text-base opacity-90 leading-relaxed max-w-xs mx-auto">
                UIA Cường. Xin cám ơn!
              </p>
              <p className="text-white text-xs italic sm:text-sm opacity-90 leading-relaxed max-w-xs mx-auto">
                "Inspired by Spotify®, supported by Claude®."
              </p>
            </div>
          </div>

          {/* Animated border */}
          <div
            className={`absolute inset-0 rounded-2xl border-2 border-${theme.colors.secondary}-400 opacity-50 animate-pulse`}
          ></div>

          {/* Animated corner accents */}
          <div
            className={`absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-${theme.colors.secondary}-400 to-transparent opacity-30 rounded-tl-2xl`}
          ></div>
          <div
            className={`absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-${theme.colors.secondary}-400 to-transparent opacity-30 rounded-br-2xl`}
          ></div>
        </div>
      </div>
    </div>
  );
};

const HomePage = () => {
  const [currentView, setCurrentView] = useState("main");
  const [listSongsDetail, setListSongsDetail] = useState([]);
  const [showLibraries, setShowLibraries] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [showPlayerControls, setShowPlayerControls] = useState(true);
  const { currentSong, songDescriptionAvailable } = useAudio();
  const { theme } = useTheme(); // Use theme context

  const handleCloseBanner = () => {
    setShowBanner(false);
  };

  const togglePlayerControls = () => {
    setShowPlayerControls(!showPlayerControls);
  };

  const toggleLibraries = () => {
    setShowLibraries(!showLibraries);
  };

  const handleCloseLibraries = () => {
    setShowLibraries(false);
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

      {/* Banner */}
      {showBanner && <Banner onClose={handleCloseBanner} theme={theme} />}



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
          {songDescriptionAvailable && <SongDescription />}
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
    </div>
  );
};

export default HomePage;
