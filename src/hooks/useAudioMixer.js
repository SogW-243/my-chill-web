import { useState, useEffect, useRef } from 'react';
import { Howl, Howler } from 'howler';

const useAudioMixer = () => {
  // --- STATE QUẢN LÝ UI ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // State volume riêng biệt
  const [volumes, setVolumes] = useState({
    music: 0.5,
    rain: 0.0, // Mặc định tắt mưa, người dùng tự kéo lên
  });

  // --- REFS (Lưu trữ instance Howl) ---
  const musicRef = useRef(null);
  const rainRef = useRef(null);

  // --- 1. KHỞI TẠO ÂM THANH ---
  useEffect(() => {
    // Kênh Nhạc (Music)
    musicRef.current = new Howl({
      src: ['/audio/chill-beat.mp3'], // Link nhạc Lofi demo
      html5: true, // Streaming (tốt cho nhạc dài)
      loop: true,
      volume: volumes.music,
    });

    // Kênh Môi trường (Rain)
    rainRef.current = new Howl({
      src: ['/audio/rain-sound.mp3'], // Link tiếng mưa demo
      html5: false, // Preload vào RAM (loop mượt hơn)
      loop: true,
      volume: volumes.rain,
    });

    // Tự động bật tiếng mưa ngay (nhưng volume theo state)
    rainRef.current.play();

    return () => {
      // Cleanup: Hủy instance khi unmount
      musicRef.current.unload();
      rainRef.current.unload();
    };
  }, []);

  // --- 2. XỬ LÝ THAY ĐỔI VOLUME ---
  
  // Khi user kéo thanh Music
  useEffect(() => {
    if (musicRef.current) musicRef.current.volume(volumes.music);
  }, [volumes.music]);

  // Khi user kéo thanh Rain
  useEffect(() => {
    if (rainRef.current) rainRef.current.volume(volumes.rain);
  }, [volumes.rain]);

  // --- 3. CÁC HÀM ĐIỀU KHIỂN (ACTIONS) ---

  const togglePlayMusic = () => {
    if (!musicRef.current) return;
    if (isPlaying) {
      musicRef.current.pause();
    } else {
      musicRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMuteAll = () => {
    // Howler.mute() tắt tiếng toàn cục nhưng không đổi giá trị volume
    const newMuteState = !isMuted;
    Howler.mute(newMuteState);
    setIsMuted(newMuteState);
  };

  const changeVolume = (type, value) => {
    setVolumes(prev => ({ ...prev, [type]: parseFloat(value) }));
  };

  return {
    state: { isPlaying, isMuted, volumes },
    actions: { togglePlayMusic, toggleMuteAll, changeVolume }
  };
};

export default useAudioMixer;