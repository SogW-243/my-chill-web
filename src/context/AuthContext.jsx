import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { auth, db } from "../config/firebase"; // Nhớ import db
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"; // <-- Import thêm mấy cái này

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hàm đăng nhập Google (ĐÃ NÂNG CẤP)
  const loginGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // --- LOGIC MỚI: LƯU USER VÀO FIRESTORE ---
      // 1. Tham chiếu đến document của user này
      const userRef = doc(db, "users", user.uid);
      
      // 2. Kiểm tra xem đã tồn tại chưa
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // 3. Nếu chưa có -> Tạo mới
        await setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          followers: [],
          following: [],
          // Tạo sẵn cài đặt phòng mặc định
          roomSettings: {
            isLightsOn: true,
            currentSceneIndex: 0
          }
        });
        console.log("Đã tạo user mới trong Firestore!");
      } else {
        console.log("User cũ đã quay lại!");
      }
      // ------------------------------------------

    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
    }
  };

  const logout = () => signOut(auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loginGoogle, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};