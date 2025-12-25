import React from 'react';
import { Volume2, VolumeX, Music, CloudRain } from 'lucide-react';

const VolumeControl = ({ volumes, onVolumeChange, isMuted, onToggleMute }) => {
  return (
    <div className="flex flex-col gap-4 p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 w-64">
      
      {/* Header: Nút Mute tổng */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-white/50 font-bold uppercase tracking-widest">Mixer</span>
        <button 
          onClick={onToggleMute}
          className={`p-2 rounded-full transition-colors ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white hover:bg-white/20'}`}
          title="Mute All"
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>

      {/* Slider 1: Music */}
      <div className="space-y-1">
        <div className="flex justify-between text-white/80 text-sm">
          <div className="flex items-center gap-2">
            <Music size={14} className="text-purple-300" />
            <span>Lofi Music</span>
          </div>
          <span>{Math.round(volumes.music * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volumes.music}
          onChange={(e) => onVolumeChange('music', e.target.value)}
          disabled={isMuted}
          className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-400 disabled:opacity-50"
        />
      </div>

      {/* Slider 2: Rain Ambience */}
      <div className="space-y-1">
        <div className="flex justify-between text-white/80 text-sm">
          <div className="flex items-center gap-2">
            <CloudRain size={14} className="text-cyan-300" />
            <span>Rain Sound</span>
          </div>
          <span>{Math.round(volumes.volumes?.rain || volumes.rain * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volumes.rain}
          onChange={(e) => onVolumeChange('rain', e.target.value)}
          disabled={isMuted}
          className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400 disabled:opacity-50"
        />
      </div>

    </div>
  );
};

export default VolumeControl;