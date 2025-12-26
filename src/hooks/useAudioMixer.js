import { useState, useEffect, useRef } from 'react';

// Link nhạc (Bạn có thể đổi link khác nếu link này chết)
const LOFI_URL = "https://stream.zeno.fm/0r0xa792kwzuv"; 
const RAIN_URL = "/sounds/rain.mp3"; 

const useAudioMixer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [rainVolume, setRainVolume] = useState(0);

  const musicRef = useRef(new Audio(LOFI_URL));
  const rainRef = useRef(new Audio(RAIN_URL));

  // 1. Khởi tạo (Chạy 1 lần)
  useEffect(() => {
    // Cấu hình Music
    musicRef.current.loop = true;
    musicRef.current.preload = "auto";
    musicRef.current.crossOrigin = "anonymous"; // Tránh lỗi CORS nếu có

    // Cấu hình Rain
    rainRef.current.loop = true;
    rainRef.current.preload = "auto";

    // Cleanup khi thoát
    return () => {
      musicRef.current.pause();
      rainRef.current.pause();
    };
  }, []);

  // 2. Xử lý Play/Pause Music (SỬA LỖI ABORT ERROR TẠI ĐÂY)
  useEffect(() => {
    const audio = musicRef.current;

    const playAudio = async () => {
      try {
        if (isPlaying) {
          await audio.play();
        } else {
          audio.pause();
        }
      } catch (error) {
        // Nếu lỗi là AbortError (do bấm nhanh quá), ta chỉ log nhẹ và bỏ qua
        if (error.name === 'AbortError') {
          console.log("Audio play interrupted by pause (Safe to ignore)");
        } else {
          console.error("Lỗi phát nhạc:", error);
          setIsPlaying(false); // Reset nút về trạng thái Pause nếu lỗi thật
        }
      }
    };

    playAudio();

  }, [isPlaying]);

  // 3. Xử lý Tiếng Mưa (Đồng bộ với Music)
  useEffect(() => {
    const rain = rainRef.current;
    rain.volume = rainVolume;

    const handleRain = async () => {
      try {
        if (rainVolume > 0 && isPlaying) {
          await rain.play();
        } else {
          rain.pause();
        }
      } catch (error) {
        if (error.name !== 'AbortError') console.error("Lỗi tiếng mưa:", error);
      }
    };

    handleRain();
  }, [rainVolume, isPlaying]);

  // 4. Volume Nhạc
  useEffect(() => {
    musicRef.current.volume = musicVolume;
  }, [musicVolume]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  return {
    isPlaying,
    togglePlay,
    musicVolume,
    setMusicVolume,
    rainVolume,
    setRainVolume
  };
};

export default useAudioMixer;