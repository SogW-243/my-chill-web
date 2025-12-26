import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import { SCENES } from './MyRoom';
import WallFeed from '../components/ui/WallFeed';

// Import các icon từ lucide-react
import {
  UserPlus,
  UserCheck,
  Loader2,
  Home,
  Heart,
  MessageSquare,
  X
} from 'lucide-react';

const UserProfile = () => {
  const { userId } = useParams();
  const { currentUser } = useAuth();

  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isWallOpen, setIsWallOpen] = useState(false); // Trạng thái đóng mở Sổ lưu bút

  // --- 1. FETCH DỮ LIỆU USER TỪ FIREBASE ---
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, "users", userId);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserProfile(data);

          if (currentUser && data.followers?.includes(currentUser.uid)) {
            setIsFollowing(true);
          }
        } else {
          console.log("Không tìm thấy người dùng!");
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchUserData();
  }, [userId, currentUser]);

  // --- 2. XỬ LÝ FOLLOW / UNFOLLOW ---
  const handleFollow = async () => {
    if (!currentUser) return alert("Bạn cần đăng nhập để theo dõi!");
    if (currentUser.uid === userId) return alert("Bạn không thể tự follow chính mình ^^");

    const userRef = doc(db, "users", userId);
    try {
      if (isFollowing) {
        await updateDoc(userRef, { followers: arrayRemove(currentUser.uid) });
        setIsFollowing(false);
      } else {
        await updateDoc(userRef, { followers: arrayUnion(currentUser.uid) });
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Lỗi cập nhật follow:", error);
    }
  };

  // --- 3. UI LOADING & ERROR ---
  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-900 text-white">
      <Loader2 className="animate-spin mr-2" /> Đang gõ cửa...
    </div>
  );

  if (!userProfile) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-900 text-white gap-4">
      <p>Không tìm thấy phòng này :(</p>
      <Link to="/" className="text-indigo-400 hover:underline">Về nhà</Link>
    </div>
  );

  // --- 4. TÁI TẠO CẤU HÌNH PHÒNG ---
  const settings = userProfile.roomSettings || {};
  const sceneIndex = typeof settings.currentSceneIndex === 'number' ? settings.currentSceneIndex : 0;
  const currentScene = SCENES[sceneIndex] || SCENES[0];
  const isLightsOn = settings.isLightsOn ?? true;
  const isRainingVisual = currentScene.hasRain;

  return (
    <Layout
      bgImage={currentScene.image}
      isRaining={isRainingVisual}
      isLightsOn={isLightsOn}
    >
      {/* ==================== CÁC THÀNH PHẦN GIAO DIỆN ==================== */}

      {/* 1. Nút Về Nhà (Góc trên trái) */}
      <div className="absolute top-6 left-6 z-50">
        <Link to="/" className="flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-all border border-white/10">
          <Home size={18} /> <span className="text-sm font-medium">Về phòng tôi</span>
        </Link>
      </div>

      {/* 2. Nút Follow (Góc trên phải) */}
      {currentUser?.uid !== userId && (
        <button
          onClick={handleFollow}
          className={`absolute top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full font-bold shadow-xl border border-white/10 transition-all hover:scale-105 ${
            isFollowing
              ? 'bg-black/40 text-green-400 hover:bg-black/60'
              : 'bg-indigo-600 text-white hover:bg-indigo-500'
          }`}
        >
          {isFollowing ? (
            <>
              <UserCheck size={18} />
              <span className="text-sm">Bạn bè</span>
            </>
          ) : (
            <>
              <UserPlus size={18} />
              <span className="text-sm">Kết bạn</span>
            </>
          )}
        </button>
      )}

      {/* 3. Thẻ Profile (Canh giữa màn hình) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center animate-fade-in-up min-w-[300px]">

          {/* Avatar */}
          <div className="relative mb-4">
            <img
              src={userProfile.photoURL || "https://via.placeholder.com/150"}
              alt="Avatar"
              className="w-24 h-24 rounded-full border-4 border-indigo-500 shadow-lg object-cover"
            />
          </div>

          {/* Tên & Info */}
          <h1 className="text-2xl font-bold text-white mb-1">{userProfile.displayName}</h1>
          <p className="text-indigo-200 text-sm mb-6 flex items-center justify-center gap-1">
            Đang chill tại <span className="font-bold">"{currentScene.name}"</span>
          </p>

          {/* Stats */}
          <div className="flex gap-6 mb-6 text-gray-300 text-sm">
            <div className="flex flex-col items-center">
              <span className="font-bold text-white text-lg">{userProfile.followers?.length || 0}</span>
              <span>Followers</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-white text-lg">0</span>
              <span>Following</span>
            </div>
          </div>

          {currentUser?.uid === userId && (
            <div className="text-gray-400 text-sm italic mt-2">
              (Đây là giao diện phòng của bạn khi người khác nhìn thấy)
            </div>
          )}

        </div>
      </div>

      {/* 4. Nút Mở Sổ Lưu Bút (Góc dưới phải) */}
      {!isWallOpen && (
        <button
          onClick={() => setIsWallOpen(true)}
          className="absolute bottom-8 right-8 z-50 flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold shadow-2xl hover:scale-105 transition-all"
        >
          <MessageSquare size={20} />
          Sổ lưu bút
        </button>
      )}

      {/* 5. PANEL WALL FEED (Trượt từ phải sang) */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[450px] z-[60] transition-transform duration-300 ease-in-out transform ${isWallOpen ? 'translate-x-0' : 'translate-x-full'}`}>
         {/* Nút đóng X */}
         <button
           onClick={() => setIsWallOpen(false)}
           className="absolute top-4 left-[-40px] p-2 bg-slate-900 text-white rounded-l-lg hover:bg-slate-800 transition-colors"
         >
           <X size={20} />
         </button>

         {/* Component WallFeed */}
         <WallFeed targetUserId={userId} />
      </div>

    </Layout>
  );
};

export default UserProfile;