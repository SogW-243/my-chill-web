import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Wind } from 'lucide-react';

import { db } from '../../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; 
import { useAuth } from '../../context/AuthContext';

const WorryDrawerModal = ({ isOpen, onClose }) => {
  const [inputText, setInputText] = useState('');
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { currentUser } = useAuth();

  // Hàm xử lý khi bấm "Thả trôi"
  const handleLetGo = async () => {
    if (!inputText.trim()) return; // Không làm gì nếu chưa nhập

    // 1. Bắt đầu hiệu ứng fade out text
    setIsFadingOut(true);

    try {
      // 2. Gửi dữ liệu lên Firestore (Chạy ngầm)
      // Nếu chưa đăng nhập thì lưu là 'Anonymous'
      await addDoc(collection(db, "worries"), {
        text: inputText,
        uid: currentUser ? currentUser.uid : 'anonymous',
        userName: currentUser ? currentUser.displayName : 'Ẩn danh',
        createdAt: serverTimestamp(), // Lấy giờ server chuẩn
      });
      
      console.log("Đã thả trôi nỗi buồn lên mây!");

    } catch (error) {
      console.error("Lỗi khi gửi nỗi buồn:", error);
      // Dù lỗi cũng cứ cho chạy tiếp hiệu ứng để không phá mood người dùng
    }

    // 2. Sau 1.5s (khi text đã mờ), hiện thông báo success
    setTimeout(() => {
      setShowSuccess(true);
      setInputText(''); // Xóa text thật
    }, 1500);

    // 3. Sau 3s, đóng modal và reset trạng thái
    setTimeout(() => {
      onClose();
      // Reset lại các state nội bộ sau khi đóng hẳn modal
      setTimeout(() => {
          setIsFadingOut(false);
          setShowSuccess(false);
      }, 500)
    }, 3500);
  };

  // CSS tạo nền giấy cũ có dòng kẻ
  const paperStyle = {
    backgroundColor: '#f4e4bc', // Màu vàng giấy cũ
    backgroundImage: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)',
    backgroundSize: '100% 1.5rem', // Khoảng cách dòng kẻ
    boxShadow: 'inset 0 0 30px rgba(0,0,0,0.1), 0 10px 30px rgba(0,0,0,0.3)' // Tạo độ sâu và cũ kỹ
  };

  return (
    <AnimatePresence>
      {isOpen && (
        // Backdrop (Lớp nền tối mờ phía sau)
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={isFadingOut ? null : onClose} // Click ra ngoài để đóng (trừ khi đang thả trôi)
        >
          
          {/* Modal Content (Tờ giấy) */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()} // Chặn sự kiện click nổi lên backdrop
            style={paperStyle}
            className="relative w-full max-w-md rounded-lg p-6 text-amber-900/80 overflow-hidden border-2 border-amber-900/20"
          >
            
            {/* Nút đóng (X) */}
            {!isFadingOut && !showSuccess && (
              <button onClick={onClose} className="absolute top-4 right-4 text-amber-900/40 hover:text-amber-900 transition-colors">
                <X size={24} />
              </button>
            )}

            <h2 className="text-xl font-bold text-center mb-6 font-serif tracking-wider text-amber-950">
              Hộc Tủ Nỗi Buồn
            </h2>

            <div className="relative min-h-[150px]">
                <AnimatePresence mode='wait'>
                    {/* Khu vực nhập liệu */}
                    {!showSuccess && (
                        <motion.div
                            key="input-area"
                            // Hiệu ứng bay lên và mờ dần khi bấm nút
                            exit={isFadingOut ? { opacity: 0, y: -50, filter: 'blur(4px)' } : {}}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                        >
                           <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Viết những điều phiền muộn vào đây..."
                                disabled={isFadingOut}
                                className="w-full h-32 bg-transparent resize-none outline-none text-lg font-serif placeholder:text-amber-900/30 leading-[1.5rem]"
                                autoFocus
                            />
                            {/* Nút Thả trôi */}
                            <div className="mt-4 flex justify-center">
                                <button
                                    onClick={handleLetGo}
                                    disabled={isFadingOut || !inputText.trim()}
                                    className={`flex items-center gap-2 px-6 py-2 rounded-full font-serif transition-all ${
                                        isFadingOut || !inputText.trim()
                                            ? 'bg-amber-900/20 text-amber-900/40 cursor-not-allowed'
                                            : 'bg-amber-800 text-[#f4e4bc] hover:bg-amber-900 hover:scale-105 active:scale-95 shadow-md'
                                    }`}
                                >
                                    {isFadingOut ? <Wind className="animate-pulse" size={18}/> : <Send size={18} />}
                                    <span>{isFadingOut ? 'Đang trôi đi...' : 'Thả trôi'}</span>
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Thông báo Success */}
                    {showSuccess && (
                        <motion.div
                            key="success-msg"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 flex flex-col items-center justify-center text-center"
                        >
                            <Wind size={48} className="text-amber-700/50 mb-4 animate-bounce-slow" />
                            <p className="text-lg font-serif text-amber-950">
                                Nỗi buồn đã tan theo mưa...
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WorryDrawerModal;