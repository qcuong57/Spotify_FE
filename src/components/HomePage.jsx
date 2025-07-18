import { useEffect, useState } from "react";
import Header from "./user/Header.jsx";
import Libraries from "./user/library/Libraries.jsx";
import MainContent from "./user/MainContent.jsx";
import PlayerControls from "./user/PlayerControls.jsx";
import MyLibrary from "./user/library/MyLibrary.jsx";
import ChatManager from "./chat/ChatManager.jsx";
import SongDescription from "./user/SongDescription.jsx";
import { useAudio } from "../utils/audioContext.jsx";
import ListSongs from "./user/ListSongs.jsx";
import { IconMenu2 } from "@tabler/icons-react";

const HomePage = () => {
  const [currentView, setCurrentView] = useState("main");
  const [listSongsDetail, setListSongsDetail] = useState([]);
  const [showLibraries, setShowLibraries] = useState(true);
  const { currentSong, songDescriptionAvailable } = useAudio();

  return (
    <div className="flex flex-1 flex-col h-screen bg-black">
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
      {currentSong && <PlayerControls />}
      <ChatManager className="fixed bottom-4 right-4 w-[320px] max-w-xs z-30" />
    </div>
  );
};

export default HomePage;
