import React from 'react';
import { Play, Pause, CloudRain, Image as ImageIcon, Lightbulb } from 'lucide-react'; // 1. Import Lightbulb

const ControlBar = ({ 
  isPlaying = false, 
  onTogglePlay, 
  rainVolume = 0.5, 
  onRainVolumeChange, 
  onToggleBg,
  // 2. Thêm props mới
  isLightsOn = true,
  onToggleLights
}) => {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-6 px-8 py-4 
                      bg-black/30 backdrop-blur-md 
                      border border-white/10 rounded-full 
                      shadow-[0_8px_32px_rgba(0,0,0,0.3)]
                      transition-all duration-300 hover:bg-black/40">

        {/* --- Music Controls --- */}
        <button 
          onClick={onTogglePlay}
          className="group relative flex items-center justify-center w-12 h-12 
                     bg-white/10 rounded-full hover:bg-white/20 transition-all 
                     active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/30"
        >
          {isPlaying ? <Pause size={24} className="text-white fill-current" /> : <Play size={24} className="text-white fill-current ml-1" />}
        </button>

        <div className="w-px h-8 bg-white/10"></div>

        {/* --- Rain Volume --- */}
        <div className="flex items-center gap-3 group">
          <CloudRain size={20} className="text-cyan-300" />
          <div className="flex flex-col">
            <label className="text-[10px] text-white/60 uppercase tracking-wider mb-1">Rain</label>
            <input
              type="range" min="0" max="1" step="0.01" value={rainVolume}
              onChange={(e) => onRainVolumeChange(parseFloat(e.target.value))}
              className="w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300"
            />
          </div>
        </div>

        <div className="w-px h-8 bg-white/10"></div>

        {/* --- Scene Switcher --- */}
        <button onClick={onToggleBg} className="flex flex-col items-center gap-1 group opacity-70 hover:opacity-100 transition-opacity">
          <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
            <ImageIcon size={20} className="text-orange-300" />
          </div>
          <span className="text-[10px] text-white/80">Scene</span>
        </button>

        <div className="w-px h-8 bg-white/10"></div>

        {/* --- 3. LIGHT TOGGLE (Nút tắt đèn mới) --- */}
        <button 
          onClick={onToggleLights}
          className="flex flex-col items-center gap-1 group transition-opacity"
        >
          <div className={`p-2 rounded-lg transition-colors ${isLightsOn ? 'bg-yellow-500/20' : 'bg-white/5'}`}>
            {/* Nếu bật đèn: màu vàng, Tắt đèn: màu xám */}
            <Lightbulb size={20} className={`transition-colors ${isLightsOn ? 'text-yellow-300' : 'text-gray-400'}`} />
          </div>
          <span className="text-[10px] text-white/80">{isLightsOn ? 'Lights On' : 'Sleep Mode'}</span>
        </button>

      </div>
    </div>
  );
};

export default ControlBar;