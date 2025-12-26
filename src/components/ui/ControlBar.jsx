import React from 'react';
import { Play, Pause, CloudRain, Image as ImageIcon, Lightbulb, LightbulbOff, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ControlBar = ({ 
  isPlaying, 
  onTogglePlay, 
  rainVolume, 
  onRainVolumeChange, 
  onToggleBg, 
  isLightsOn, 
  onToggleLights,
  // onOpenCommunity -> Không cần prop này nữa vì ta dùng navigate trực tiếp
}) => {
  const navigate = useNavigate();
  
  const handleRainChange = (e) => {
    if (onRainVolumeChange) {
      onRainVolumeChange(parseFloat(e.target.value));
    }
  };

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
      <div className="flex items-center gap-4 px-6 py-3 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl">
        
        {/* --- 1. NÚT PLAY / PAUSE --- */}
        <button 
          onClick={onTogglePlay}
          className="w-12 h-12 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 hover:bg-gray-200 transition-all shadow-lg shadow-white/10"
        >
          {isPlaying ? (
            <Pause size={24} fill="currentColor" />
          ) : (
            <Play size={24} fill="currentColor" className="ml-1" />
          )}
        </button>

        <div className="w-px h-8 bg-white/10 mx-2"></div>

        {/* --- 2. SLIDER MƯA --- */}
        <div className="relative group flex items-center justify-center">
          <button 
            className={`p-3 rounded-full transition-all duration-300 ${
              rainVolume > 0 ? 'text-blue-400 bg-blue-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <CloudRain size={24} />
          </button>
          
          {/* Container Slider: Hiện ra khi Hover vào icon Cloud */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 hidden group-hover:flex flex-col items-center justify-center w-12 h-32 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl animate-fade-in-up">
            <div className="relative w-full h-full flex items-center justify-center py-4">
              {/* Input Range Xoay Dọc */}
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01"
                value={rainVolume || 0}
                onChange={handleRainChange}
                className="w-24 h-2 -rotate-90 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 origin-center"
              />
            </div>
            {/* Hiển thị số % nhỏ ở dưới */}
            <span className="text-[10px] text-gray-400 font-mono mb-2">
              {Math.round((rainVolume || 0) * 100)}%
            </span>
          </div>
        </div>

        {/* --- 3. CÁC NÚT CHỨC NĂNG KHÁC --- */}
        {/* Đổi Cảnh */}
        <button 
          onClick={onToggleBg}
          className="p-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-all"
          title="Đổi không gian"
        >
          <ImageIcon size={24} />
        </button>

        {/* Bật/Tắt đèn */}
        <button 
          onClick={onToggleLights}
          className={`p-3 rounded-full transition-all ${isLightsOn ? 'text-yellow-300 hover:bg-yellow-500/10' : 'text-gray-500 hover:text-gray-300'}`}
        >
          {isLightsOn ? <Lightbulb size={24} /> : <LightbulbOff size={24} />}
        </button>
        
        {/* NÚT CỘNG ĐỒNG (Sửa lại Logic ở đây) */}
        <button 
          onClick={() => navigate('/community')} // <--- SỬA: Chuyển hướng sang trang Community
          className="p-3 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-full transition-all"
          title="Quảng trường Chill"
        >
          <MessageCircle size={24} />
        </button>

      </div>
    </div>
  );
};

export default ControlBar;