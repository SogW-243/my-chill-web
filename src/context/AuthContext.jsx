import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../config/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

// 1. Tạo Context
const AuthContext = createContext();

// 2. Tạo Provider
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hàm đăng nhập Google
  const loginGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  // Hàm đăng xuất
  const logout = () => signOut(auth);

  // Lắng nghe thay đổi trạng thái user (Magic của Firebase)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false); // Đã tải xong thông tin user
      console.log("Current User:", user); // Log để check
    });

    return unsubscribe; // Cleanup khi unmount
  }, []);

  const value = {
    currentUser,
    loginGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 3. Custom Hook để dùng nhanh ở các component khác
export const useAuth = () => {
  return useContext(AuthContext);
};