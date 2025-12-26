// Thêm chữ useEffect vào trong ngoặc nhọn
import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import ControlBar from '../components/ui/ControlBar';
import VolumeControl from '../components/ui/VolumeControl';

import useAudioMixer from '../hooks/useAudioMixer';
import WorryDrawerModal from '../components/ui/WorryDrawerModal';
import CommunityDrawer from '../components/ui/CommunityDrawer';

import UserMenu from '../components/ui/UserMenu';
import { updateDoc, doc } from 'firebase/firestore'; 
import { db } from '../config/firebase'; // Import db nếu chưa có
import { useAuth } from '../context/AuthContext';


// Danh sách cảnh nền
export const SCENES = [
  { name: "Cozy Bedroom", image: "/images/room-transparent.png", hasRain: true },
  { name: "Chill City", image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=2564&auto=format&fit=crop", hasRain: false },
  { name: "Lofi Cafe", image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2694&auto=format&fit=crop", hasRain: false },
  { name: "Forest Cabin", image: "https://images.unsplash.com/photo-1445964047600-cdbdb873673d?q=80&w=2656&auto=format&fit=crop", hasRain: true },
];

export default function MyRoom() {
  // 1. Logic State
  const [isLightsOn, setIsLightsOn] = useState(true);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);

  // 2. Logic Audio
  const { 
    isPlaying, togglePlay, 
    rainVolume, setRainVolume, 
    musicVolume, setMusicVolume 
  } = useAudioMixer();

  // 3. Logic Hàm
  const handleToggleBg = () => {
    setCurrentSceneIndex((prev) => (prev + 1) % SCENES.length);
  };

  const currentScene = SCENES[currentSceneIndex];

  const { currentUser } = useAuth(); // Lấy user hiện tại

  // --- TÍNH NĂNG MỚI: TỰ ĐỘNG LƯU CẤU HÌNH PHÒNG ---
  useEffect(() => {
    // Chỉ lưu khi đã đăng nhập
    if (!currentUser) return;

    // Tạo hàm lưu (dùng debounce để tránh lưu liên tục nếu bấm nhanh)
    const saveSettings = async () => {
      try {
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, {
          roomSettings: {
            isLightsOn: isLightsOn,
            currentSceneIndex: currentSceneIndex,
            // Bạn có thể lưu thêm volume nếu muốn:
            // musicVolume: musicVolume,
            // rainVolume: rainVolume
          }
        });
        console.log("Đã lưu trạng thái phòng!");
      } catch (error) {
        console.error("Lỗi lưu cấu hình:", error);
      }
    };

    // Đợi 1 giây sau khi người dùng dừng thao tác mới lưu (Debounce)
    const timeoutId = setTimeout(saveSettings, 1000);

    // Cleanup function
    return () => clearTimeout(timeoutId);

  }, [isLightsOn, currentSceneIndex, currentUser]); // Chạy lại khi các biến này thay đổi

  // 4. Giao diện
  return (
    <Layout 
      bgImage={currentScene.image}
      isRaining={currentScene.hasRain && rainVolume > 0} // Chỉ mưa khi cảnh có mưa VÀ volume > 0
      isLightsOn={isLightsOn}
    >

        <div className="absolute top-6 left-6 z-50">
        <UserMenu />
      </div>
      {/* Các Widget nổi */}
      <div className="absolute top-8 right-8 z-30">
        <VolumeControl musicVolume={musicVolume} onMusicChange={setMusicVolume}/>
      </div>

      

      {/* Trigger mở Hộc tủ nỗi buồn (Nút tàng hình trên Layout) */}
      <button
        onClick={() => setIsDrawerOpen(true)}
        className="absolute z-[25] cursor-pointer bottom-[15%] left-[25%] w-32 h-20 outline-none"
        title="Mở hộc tủ nỗi buồn"
      />

      {/* Thanh điều khiển dưới cùng */}
      <ControlBar 
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        rainVolume={rainVolume}
        onRainVolumeChange={setRainVolume}
        onToggleBg={handleToggleBg}
        isLightsOn={isLightsOn}
        onToggleLights={() => setIsLightsOn(!isLightsOn)}
        onOpenCommunity={() => setIsCommunityOpen(true)}
      />

      {/* Các Modal / Drawer */}
      <WorryDrawerModal 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />

      <CommunityDrawer 
        isOpen={isCommunityOpen} 
        onClose={() => setIsCommunityOpen(false)} 
      />
    </Layout>
  );
}