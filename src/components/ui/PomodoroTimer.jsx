import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion'; // Dùng để làm tính năng kéo thả
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';
import { Howl } from 'howler';

const PomodoroTimer = () => {
  // --- CONFIG ---
  const FOCUS_TIME = 25 * 60; // 25 phút
  const BREAK_TIME = 5 * 60;  // 5 phút

  // --- STATE ---
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('focus'); // 'focus' | 'break'

  // --- AUDIO REF ---
  // Bạn nhớ tải file ding.mp3 bỏ vào public/audio/ nhé
  const soundRef = useRef(null);

  useEffect(() => {
    soundRef.current = new Howl({
      src: ['/audio/ding.mp3'], // Âm báo hết giờ
      volume: 0.5,
    });
  }, []);

  // --- TIMER LOGIC ---
  useEffect(() => {
    let interval = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Hết giờ
      setIsActive(false);
      if (soundRef.current) soundRef.current.play(); // Kêu "Ding"
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // --- HANDLERS ---
  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? FOCUS_TIME : BREAK_TIME);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === 'focus' ? FOCUS_TIME : BREAK_TIME);
  };

  // Helper format giây thành MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    // motion.div + drag: Biến thẻ div thành draggable widget
    <motion.div 
      drag 
      dragMomentum={false} // Tắt quán tính để kéo đâu nằm đó chính xác
      className="fixed top-8 right-8 z-50 w-64 cursor-move"
      // Style Glassmorphism
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
        
        {/* HEADER: MODE SWITCHER */}
        <div className="flex justify-center gap-2 mb-6">
          <button
            onClick={() => switchMode('focus')}
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all ${
              mode === 'focus' ? 'bg-indigo-500/80 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'
            }`}
          >
            <Brain size={12} /> Focus
          </button>
          <button
            onClick={() => switchMode('break')}
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all ${
              mode === 'break' ? 'bg-emerald-500/80 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'
            }`}
          >
            <Coffee size={12} /> Break
          </button>
        </div>

        {/* TIMER DISPLAY */}
        <div className="text-center mb-6">
          <span className="text-6xl font-mono font-light text-white tracking-widest tabular-nums drop-shadow-lg">
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* CONTROLS */}
        <div className="flex justify-center items-center gap-4">
          
          {/* Nút Reset */}
          <button 
            onClick={resetTimer}
            className="p-3 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all"
            title="Reset"
          >
            <RotateCcw size={20} />
          </button>

          {/* Nút Play/Pause (Lớn nhất) */}
          <button 
            onClick={toggleTimer}
            className="p-4 bg-white text-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/10"
          >
            {isActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
          </button>

        </div>
      </div>
    </motion.div>
  );
};

export default PomodoroTimer;