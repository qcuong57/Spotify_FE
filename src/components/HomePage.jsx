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

const Banner = ({ onClose }) => {
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
        className={`relative bg-gradient-to-br from-black via-gray-900 to-green-600 shadow-2xl rounded-2xl transform transition-all duration-300 ease-out ${
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
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-green-600 bg-opacity-20 hover:bg-opacity-30 transition-all duration-200 group"
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
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-3xl animate-pulse">
                  <img src="https://i.pinimg.com/736x/48/eb/2a/48eb2a522aba3081d8258babe67a3473.jpg" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-white font-bold text-2xl sm:text-3xl leading-tight">
                Thông báo
              </h3>

              {/* Description */}
              <p className="text-white text-sm sm:text-base opacity-90 leading-relaxed max-w-xs mx-auto">
                Nếu website trong trạng thái loading nhạc. Vui lòng đợi tải lại
                trang sau 1-2 phút.
              </p>
              <p className="text-white text-sm sm:text-base opacity-90 leading-relaxed max-w-xs mx-auto">
                UIA Cường. Xin cám ơn!
              </p>
            </div>
          </div>

          {/* Animated border */}
          <div className="absolute inset-0 rounded-2xl border-2 border-green-400 opacity-50 animate-pulse"></div>

          {/* Animated corner accents */}
          <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-green-400 to-transparent opacity-30 rounded-tl-2xl"></div>
          <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-green-400 to-transparent opacity-30 rounded-br-2xl"></div>
        </div>
      </div>
    </div>
  );
};

const HomePage = () => {
  const [currentView, setCurrentView] = useState("main");
  const [listSongsDetail, setListSongsDetail] = useState([]);
  const [showLibraries, setShowLibraries] = useState(false); // Changed to false by default
  const [showBanner, setShowBanner] = useState(true);
  const [showPlayerControls, setShowPlayerControls] = useState(true); // New state for PlayerControls visibility
  const { currentSong, songDescriptionAvailable } = useAudio();

  const handleCloseBanner = () => {
    setShowBanner(false);
  };

  const togglePlayerControls = () => {
    setShowPlayerControls(!showPlayerControls);
  };

  return (
    <div className="flex flex-1 flex-col h-screen bg-black">
      {/* Banner */}
      {showBanner && <Banner onClose={handleCloseBanner} />}

      <Header
        setCurrentView={setCurrentView}
        setListSongsDetail={setListSongsDetail}
      />
      <div className="flex flex-row flex-1 overflow-hidden">
        {/* Show Libraries button when hidden */}
        {!showLibraries && (
          <button
            onClick={() => setShowLibraries(true)}
            className="fixed top-1/2 left-4 -translate-y-1/2 z-20 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-white rounded-full p-2 sm:p-3 shadow-lg transition-colors"
            title="Mở thư viện"
          >
            <IconMenu2 stroke={2} className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}

        {showLibraries && (
          <Libraries
            setCurrentView={setCurrentView}
            currentView={currentView}
            onClose={() => setShowLibraries(false)}
          />
        )}

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

      {/* PlayerControls with integrated toggle button */}
      {currentSong && (
        <PlayerControls
          isVisible={showPlayerControls}
          onToggleVisibility={togglePlayerControls}
        />
      )}
      {/* <ChatManager className="fixed bottom-4 right-4 w-[320px] max-w-xs z-30" /> */}
    </div>
  );
};

export default HomePage;
