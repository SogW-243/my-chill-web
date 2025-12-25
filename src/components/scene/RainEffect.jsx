import React, { useRef, useEffect } from 'react';

const RainEffect = ({ intensity = 1 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Biến quản lý animation
    let animationFrameId;
    let drops = [];
    
    // Cấu hình mưa
    const config = {
      color: 'rgba(174, 194, 224, 0.5)', // Màu xanh xám nhạt, bán trong suốt
      speedBase: 15,    // Tốc độ rơi cơ bản
      speedVar: 5,      // Độ lệch tốc độ (để hạt rơi nhanh chậm khác nhau)
      wind: 1,          // Độ nghiêng (gió thổi nhẹ sang phải)
      length: 15        // Chiều dài hạt mưa
    };

    // Hàm khởi tạo kích thước Canvas full màn hình
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initDrops(); // Tạo lại hạt mưa khi đổi kích thước
    };

    // Hàm tạo hạt mưa (Số lượng hạt phụ thuộc vào intensity)
    const initDrops = () => {
      drops = [];
      // Mật độ: Ví dụ width = 1920px -> khoảng 1000 hạt nếu intensity = 1
      const dropCount = Math.floor(window.innerWidth * 0.5 * intensity);
      
      for (let i = 0; i < dropCount; i++) {
        drops.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          speed: config.speedBase + Math.random() * config.speedVar,
          length: config.length + Math.random() * 5
        });
      }
    };

    // Vòng lặp Animation (Render loop)
    const animate = () => {
      // 1. Xóa canvas cũ
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 2. Vẽ và cập nhật vị trí từng hạt mưa
      ctx.strokeStyle = config.color;
      ctx.lineWidth = 1;
      ctx.lineCap = 'round';

      ctx.beginPath();
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];

        // Vẽ hạt mưa
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + config.wind, d.y + d.length);

        // Cập nhật vị trí (Rơi xuống)
        d.y += d.speed;
        d.x += config.wind;

        // Nếu hạt mưa rơi hết màn hình -> Reset lên trên đỉnh
        if (d.y > canvas.height) {
          d.y = -d.length; // Đưa về vị trí âm để rơi xuống tự nhiên
          d.x = Math.random() * canvas.width;
        }
      }
      ctx.stroke();

      // 3. Đệ quy gọi frame tiếp theo
      animationFrameId = requestAnimationFrame(animate);
    };

    // Setup ban đầu
    handleResize();
    window.addEventListener('resize', handleResize);
    animate();

    // Cleanup khi component bị hủy (Unmount)
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity]); // Re-run effect nếu intensity thay đổi

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-[5] pointer-events-none"
    />
  );
};

export default RainEffect;