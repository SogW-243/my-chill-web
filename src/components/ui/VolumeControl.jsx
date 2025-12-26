import React from 'react';
import { Volume2, Volume1, VolumeX } from 'lucide-react';

const VolumeControl = ({ musicVolume, onMusicChange }) => {
  // Đảm bảo giá trị luôn là số
  const currentVolume = typeof musicVolume === 'number' ? musicVolume : 0.5;

  const handleChange = (e) => {
    onMusicChange(parseFloat(e.target.value));
  };

  const getIcon = () => {
    if (currentVolume === 0) return <VolumeX size={20} className="text-white/70" />;
    if (currentVolume < 0.5) return <Volume1 size={20} className="text-white/90" />;
    return <Volume2 size={20} className="text-white" />;
  };

  return (
    <div className="group flex items-center gap-3 bg-black/20 hover:bg-black/40 backdrop-blur-md px-4 py-2 rounded-full transition-all duration-300 border border-white/5 hover:border-white/10">
      <button 
        onClick={() => onMusicChange(currentVolume === 0 ? 0.5 : 0)}
        className="hover:scale-110 transition-transform text-white"
      >
        {getIcon()}
      </button>
      
      <div className="w-0 overflow-hidden group-hover:w-24 transition-all duration-300 ease-out flex items-center">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={currentVolume}
          onChange={handleChange}
          className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
      </div>
    </div>
  );
};

export default VolumeControl;