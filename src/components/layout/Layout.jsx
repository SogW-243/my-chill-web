import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RainEffect from '../scene/RainEffect';
import CandlelightEffect from '../scene/CandlelightEffect';
import LightningEffect from '../scene/LightningEffect';
import WorryDrawerModal from '../ui/WorryDrawerModal';
import CommunityDrawer from '../ui/CommunityDrawer';

const Layout = ({ bgImage, isRaining = false, enableCandle = true, isLightsOn = true, children }) => {
  // 1. State quản lý các Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);

  // 2. Kỹ thuật "tiêm" props xuống children
  // Giúp các component con (như ControlBar) nhận được hàm mở Community mà không cần sửa App.jsx
  const childrenWithProps = React.Children.map(children, child => {
    // Chỉ thêm props cho các React Component (loại bỏ thẻ HTML thường như div, span để tránh lỗi)
    if (React.isValidElement(child) && typeof child.type !== 'string') {
      return React.cloneElement(child, {
        onOpenCommunity: () => setIsCommunityOpen(true)
      });
    }
    return child;
  });

  return (
    <main className="relative w-full h-screen overflow-hidden bg-slate-900">
      
      {/* LAYER 0-6: Background & Effects */}
      <AnimatePresence mode='popLayout'>
        <motion.img
          key={bgImage} src={bgImage} alt="Bg"
          loading="eager"  // <--- THÊM DÒNG NÀY (Bắt buộc tải ngay)
  fetchPriority="high" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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

      {/* TRIGGER ZONE: Hộc tủ nỗi buồn */}
      <button
        onClick={() => setIsDrawerOpen(true)}
        className="absolute z-[25] cursor-pointer 
                   bottom-[15%] left-[25%] w-32 h-20 outline-none"
        aria-label="Open Worry Drawer"
        title="Mở hộc tủ nỗi buồn"
      />

      {/* LAYER 20: UI CONTROLS */}
      <motion.div 
        animate={{ opacity: isLightsOn ? 1 : 0.3 }}
        transition={{ duration: 0.5 }}
        className="relative z-20 w-full h-full"
      >
        {/* Render children đã được tiêm props */}
        {childrenWithProps}
      </motion.div>

      {/* --- MODALS --- */}
      <WorryDrawerModal 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />

      <CommunityDrawer 
        isOpen={isCommunityOpen} 
        onClose={() => setIsCommunityOpen(false)} 
      />

    </main>
  );
};

export default Layout;