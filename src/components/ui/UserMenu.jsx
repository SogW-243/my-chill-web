// src/components/ui/UserMenu.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, LogIn } from 'lucide-react';

const UserMenu = () => {
  const { currentUser, loginGoogle, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // 1. CHƯA ĐĂNG NHẬP -> Hiện nút Login
  if (!currentUser) {
    return (
      <button 
        onClick={loginGoogle}
        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-full text-white font-bold transition-all hover:scale-105 shadow-lg"
      >
        <LogIn size={18} /> Đăng nhập
      </button>
    );
  }

  // 2. ĐÃ ĐĂNG NHẬP -> Hiện Avatar & Menu Dropdown
  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Avatar của tôi */}
      <div className="flex items-center gap-3 cursor-pointer py-2 px-2 rounded-full hover:bg-black/20 transition-colors">
        <img 
          src={currentUser.photoURL} 
          alt="Me" 
          className="w-10 h-10 rounded-full border-2 border-white/20"
        />
        <div className="hidden sm:block text-left mr-2">
          <p className="text-white text-sm font-bold leading-none">{currentUser.displayName}</p>
          <p className="text-gray-400 text-[10px]">Đang chill</p>
        </div>
      </div>

      {/* Dropdown Menu (Hiện khi hover) */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fade-in-up">
          
          {/* Link tới trang Profile của mình */}
          <Link 
            to={`/profile/${currentUser.uid}`}
            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-white/10 hover:text-white transition-colors"
          >
            <User size={16} /> Hồ sơ của tôi
          </Link>

          <div className="h-px bg-white/10 mx-2"></div>

          {/* Nút Đăng xuất */}
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-left"
          >
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;