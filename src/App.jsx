// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MyRoom from './pages/MyRoom';     // Trang chủ (Phòng mình)
import UserProfile from './pages/UserProfile'; // Trang Profile (Phòng bạn)

import Community from './pages/Community';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Đường dẫn gốc: Vào phòng của chính mình */}
          <Route path="/" element={<MyRoom />} />
          
          {/* Đường dẫn Dynamic: Vào phòng người khác */}
          <Route path="/profile/:userId" element={<UserProfile />} />
          <Route path="/community" element={<Community />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}