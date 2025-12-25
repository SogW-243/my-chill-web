import React from 'react';
import { motion } from 'framer-motion';

const CandlelightEffect = () => {
  // Mảng các giá trị opacity để tạo hiệu ứng lập lòe tự nhiên (không quá đều)
  const flickerKeyframes = [0.1, 0.25, 0.15, 0.3, 0.12, 0.2, 0.1];

  return (
    <motion.div
      // Lớp phủ màu cam ấm
      // mix-blend-overlay hoặc soft-light giúp màu hòa trộn vào ảnh nền tự nhiên hơn
      className="absolute inset-0 bg-orange-500/40 mix-blend-soft-light z-[2] pointer-events-none"
      
      animate={{ 
        opacity: flickerKeyframes 
      }}
      transition={{
        duration: 3, // Chu kỳ lập lòe chậm rãi trong 3 giây
        ease: "easeInOut",
        repeat: Infinity, // Lặp lại vô tận
        repeatType: "mirror" // Chạy xuôi rồi chạy ngược lại cho mượt
      }}
    />
  );
};

export default CandlelightEffect;