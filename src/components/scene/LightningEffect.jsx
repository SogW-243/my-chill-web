import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Howl } from 'howler'; // Import Howler để thêm tiếng sấm (Tùy chọn)

// (Tùy chọn) Âm thanh sấm sét. Bạn cần tải file thunder.mp3 vào public/audio/
const thunderSound = new Howl({
    src: ['/audio/thunder.mp3'], 
    volume: 0.6,
    html5: false
});

const LightningEffect = ({ isEnabled }) => {
  const [isFlashing, setIsFlashing] = useState(false);
  const timeoutRef = useRef(null);

  // Hàm kích hoạt chớp
  const triggerFlash = () => {
    if (!isEnabled) return;

    setIsFlashing(true);
    // (Tùy chọn) Phát tiếng sấm
    // thunderSound.play();

    // Tắt chớp sau 200ms (chớp rất nhanh)
    setTimeout(() => {
        setIsFlashing(false);
    }, 200); // Thời gian flash sáng

    // Lên lịch cho lần chớp tiếp theo (ngẫu nhiên từ 5s đến 15s)
    const nextFlashTime = Math.random() * 10000 + 5000; 
    timeoutRef.current = setTimeout(triggerFlash, nextFlashTime);
  };

  useEffect(() => {
    if (isEnabled) {
      // Bắt đầu vòng lặp chớp sau 2 giây khi bật mode mưa
      timeoutRef.current = setTimeout(triggerFlash, 2000);
    } else {
      setIsFlashing(false);
    }

    // Cleanup: Xóa timeout khi component unmount hoặc tắt mưa để tránh memory leak
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isEnabled]);

  return (
    // Lớp phủ màu trắng tinh, z-index cao hơn mưa một chút để chớp đè lên cả hạt mưa
    <motion.div
      className="absolute inset-0 bg-white z-[6] pointer-events-none"
      initial={{ opacity: 0 }}
      // Nếu isFlashing = true, opacity nhảy lên 0.8 rồi về 0 ngay lập tức
      animate={{ opacity: isFlashing ? [0, 0.8, 0] : 0 }}
      // Thời gian chuyển đổi cực nhanh cho hiệu ứng chớp giật
      transition={{ duration: 0.2, ease: 'easeOut' }}
    />
  );
};

export default LightningEffect;