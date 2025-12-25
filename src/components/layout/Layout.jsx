import React, { useState } from 'react'; // Import useState
import { motion, AnimatePresence } from 'framer-motion';
import RainEffect from '../scene/RainEffect';
import CandlelightEffect from '../scene/CandlelightEffect';
import LightningEffect from '../scene/LightningEffect';
// 1. Import Component mới
import WorryDrawerModal from '../ui/WorryDrawerModal';

const Layout = ({ bgImage, isRaining = false, enableCandle = true, isLightsOn = true, children }) => {
  // 2. State quản lý việc mở Hộc tủ
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <main className="relative w-full h-screen overflow-hidden bg-slate-900">
      
      {/* LAYER 0-6: Background & Effects (Giữ nguyên) */}
      <AnimatePresence mode='popLayout'>
        <motion.img
          key={bgImage} src={bgImage} alt="Bg"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-slate-900 z-[-1]" />
      {enableCandle && isLightsOn && <CandlelightEffect />}
      <AnimatePresence>
        {isRaining && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[5] pointer-events-none">
            <RainEffect intensity={1.2} />
          </motion.div>
        )}
      </AnimatePresence>
      <LightningEffect isEnabled={isRaining} />
      <img src="/images/room-transparent.png" alt="Room" className="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none" />
      <motion.div
        animate={{ opacity: isLightsOn ? 0 : 0.6 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 bg-blue-950 mix-blend-multiply z-[15] pointer-events-none"
      />


      {/* --- TÍNH NĂNG MỚI: VÙNG KÍCH HOẠT HỘC TỦ (TRIGGER ZONE) --- */}
      {/* Đây là cái nút tàng hình. 
          Bạn cần điều chỉnh vị trí (bottom/left/right/top) và kích thước (w/h)
          cho khớp với hình ảnh cái ngăn kéo hoặc cuốn sổ trong ảnh nền của bạn.
      */}
      <button
        onClick={() => setIsDrawerOpen(true)}
        className="absolute z-[25] cursor-pointer 
                   bottom-[15%] left-[25%] w-32 h-20 
                   /* Bỏ comment dòng dưới để thấy vùng click khi đang căn chỉnh vị trí */
                   /* border-2 border-red-500 bg-red-500/20 */
                   outline-none"
        aria-label="Open Worry Drawer"
        title="Mở hộc tủ nỗi buồn"
      />


      {/* --- LAYER 20: UI CONTROLS (Giữ nguyên) --- */}
      <motion.div 
        animate={{ opacity: isLightsOn ? 1 : 0.3 }}
        transition={{ duration: 0.5 }}
        className="relative z-20 w-full h-full"
      >
        {children}
      </motion.div>

      {/* --- MODAL COMPONENT (Nằm trên cùng) --- */}
      <WorryDrawerModal 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />

    </main>
  );
};

export default Layout;