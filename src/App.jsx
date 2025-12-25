import React, { useState } from 'react';
import Layout from './components/layout/Layout';
import ControlBar from './components/ui/ControlBar';
import VolumeControl from './components/ui/VolumeControl';
import PomodoroTimer from './components/ui/PomodoroTimer';
import useAudioMixer from './hooks/useAudioMixer';

import { useAuth } from './context/AuthContext'; // 1. Import hook
import { LogIn, LogOut } from 'lucide-react';  // Import icon

const SCENES = [
  { name: "City Rain", bg: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=1920&auto=format&fit=crop" },
  { name: "Cozy Sunset", bg: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1920&auto=format&fit=crop" },
  { name: "Night Window", bg: "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?q=80&w=1920&auto=format&fit=crop" }
];

export default function App() {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  
  // 1. Thêm State tắt đèn (Mặc định là bật)
  const [isLightsOn, setIsLightsOn] = useState(true);

  const { state, actions } = useAudioMixer();

  const handleToggleScene = () => {
    setCurrentSceneIndex((prevIndex) => (prevIndex + 1) % SCENES.length);
  };

  const { currentUser, loginGoogle, logout } = useAuth();

  return (
    <Layout 
      bgImage={SCENES[currentSceneIndex].bg}
      isRaining={state.volumes.rain > 0}
      
      // 2. Truyền state đèn xuống Layout để xử lý Overlay
      isLightsOn={isLightsOn}
    >

      {/* --- USER PROFILE SECTION (Góc trên trái) --- */}
      <div className="absolute top-8 left-8 z-50 flex items-center gap-4">
        {currentUser ? (
          // A. Giao diện ĐÃ ĐĂNG NHẬP
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md p-2 pr-4 rounded-full border border-white/10 animate-fade-in">
            <img 
              src={currentUser.photoURL} 
              alt="Avatar" 
              className="w-10 h-10 rounded-full border-2 border-green-400"
            />
            <div className="flex flex-col">
              <span className="text-white text-xs font-bold">{currentUser.displayName}</span>
              <button 
                onClick={logout}
                className="text-[10px] text-white/60 hover:text-red-300 text-left flex items-center gap-1"
              >
                 Sign out
              </button>
            </div>
          </div>
        ) : (
          // B. Giao diện CHƯA ĐĂNG NHẬP
          <button
            onClick={loginGoogle}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-black font-bold rounded-full 
                       hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-white/20"
          >
            <LogIn size={18} />
            Login with Google
          </button>
        )}
      </div>
      
      <PomodoroTimer />

      <div className="absolute bottom-8 right-8 z-40">
        <VolumeControl 
          volumes={state.volumes}
          onVolumeChange={actions.changeVolume}
          isMuted={state.isMuted}
          onToggleMute={actions.toggleMuteAll}
        />
      </div>
      
      <ControlBar 
        isPlaying={state.isPlaying}
        onTogglePlay={actions.togglePlayMusic}
        rainVolume={state.volumes.rain}
        onRainVolumeChange={(val) => actions.changeVolume('rain', val)}
        onToggleBg={handleToggleScene}
        
        // 3. Truyền props cho nút đèn
        isLightsOn={isLightsOn}
        onToggleLights={() => setIsLightsOn(!isLightsOn)}
      />

    </Layout>
  );
}