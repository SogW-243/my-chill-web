import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Send, MessageCircle, Image as ImageIcon, Loader2, Trash2 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase'; 
import { 
  collection, addDoc, query, orderBy, onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import PostItem from './PostItem'; // <-- Import component mới

import { checkImageSafety } from '../../utils/contentSafety'; // <-- Import file vừa tạo



// Cấu hình Cloudinary (Giữ nguyên như cũ)
const CLOUD_NAME = "dodmj8v9f"; 
const UPLOAD_PRESET = "chill_preset"; 

const CommunityDrawer = ({ isOpen, onClose }) => {
    const { currentUser, loginGoogle } = useAuth();
    
    const [posts, setPosts] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isCheckingContent, setIsCheckingContent] = useState(false); // State mới
    
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // 1. Lắng nghe Realtime
  useEffect(() => {
    if (!isOpen) return;
    // Sắp xếp bài mới nhất lên đầu
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(fetchedPosts);
    });
    return () => unsubscribe();
  }, [isOpen]);

  // Upload Cloudinary (Giữ nguyên logic cũ - copy lại hàm uploadToCloudinary của bạn vào đây)
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET); 
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, { method: "POST", body: formData });
      const data = await res.json();
      return data.secure_url;
    } catch (error) {
      console.error("Lỗi upload:", error);
      return null;
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !currentUser) return;
    setIsUploading(true);

    try {
      let fileUrl = null;
      let postType = 'text';

      if (selectedFile) {
        fileUrl = await uploadToCloudinary(selectedFile);
        if (!fileUrl) { setIsUploading(false); return; }
        postType = selectedFile.type.startsWith('image/') ? 'image' : 'audio';
      }

      await addDoc(collection(db, "posts"), {
        uid: currentUser.uid,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
        text: newMessage,
        type: postType,
        mediaUrl: fileUrl,
        createdAt: serverTimestamp(),
        likesList: [] // <-- QUAN TRỌNG: Khởi tạo mảng rỗng để chứa UID người like
      });

      setNewMessage('');
      setSelectedFile(null);
    } catch (error) {
      console.error("Lỗi gửi bài:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Hàm chọn file (Giữ nguyên)
  // --- Code cũ ---
/*
const handleFileSelect = (e) => {
  const file = e.target.files[0];
  if (file && (file.type.startsWith('image/') || file.type.startsWith('audio/'))) {
    setSelectedFile(file);
  }
};
*/

// --- Code MỚI (Có tích hợp AI Check) ---
const handleFileSelect = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // 1. Nếu là Audio -> Cho qua luôn
  if (file.type.startsWith('audio/')) {
    setSelectedFile(file);
    return;
  }

  // 2. Nếu là Ảnh -> Check NSFW
  if (file.type.startsWith('image/')) {
    setIsCheckingContent(true); // Bật loading
    try {
      const isSafe = await checkImageSafety(file);

      if (isSafe) {
        setSelectedFile(file);
      } else {
        alert("⚠️ Ảnh của bạn bị hệ thống phát hiện có nội dung nhạy cảm và không được phép đăng tải.");
        setSelectedFile(null); // Xóa file đã chọn

        // Reset input file để user có thể chọn lại file khác (nếu cần)
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error("Lỗi check ảnh", error);
    } finally {
      setIsCheckingContent(false); // Tắt loading
    }
  } else {
    alert("Định dạng file không hỗ trợ!");
  }
};

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]" onClick={onClose} />}

      <div className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[450px] 
        bg-slate-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <MessageCircle size={20} className="text-indigo-400"/> Cộng đồng Chill
          </h2>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={24} /></button>
        </div>

        {/* List Posts - Bây giờ chỉ cần map ra PostItem */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-white/10">
          {posts.map(post => (
            <PostItem 
              key={post.id} 
              post={post} 
              currentUser={currentUser} 
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area (Giữ nguyên giao diện nhập liệu cũ) */}
        <div className="shrink-0 p-4 bg-slate-900 border-t border-white/10">
          {currentUser ? (
            <div className="flex flex-col gap-2">
              {selectedFile && (
                <div className="flex items-center justify-between bg-white/10 px-3 py-2 rounded-lg">
                  <span className="text-xs text-white truncate max-w-[200px]">{selectedFile.name}</span>
                  <button onClick={() => setSelectedFile(null)} className="text-red-400 hover:text-red-300"><Trash2 size={16} /></button>
                </div>
              )}
              <form onSubmit={handleSend} className="flex gap-2 items-end">
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,audio/*"/>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-white/5 rounded-full transition-colors">
                  <ImageIcon size={20} />
                </button>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Chia sẻ cảm xúc..."
                  className="flex-1 bg-white/10 border-none rounded-2xl px-4 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none resize-none h-10 min-h-[40px] max-h-24 py-2.5"
                  rows={1}
                />
                <button 
  type="submit"
  // Thêm điều kiện isCheckingContent vào disabled
  disabled={isUploading || isCheckingContent || (!newMessage.trim() && !selectedFile)}
  className="..."
>
  {/* Hiển thị icon loading nếu đang upload HOẶC đang check nội dung */}
  {(isUploading || isCheckingContent) ? (
    <Loader2 size={18} className="animate-spin" /> 
  ) : (
    <Send size={18} />
  )}
</button>
              </form>
            </div>
          ) : (
            <button onClick={loginGoogle} className="w-full py-2 bg-white text-black font-bold rounded-full text-sm hover:scale-105 transition-transform">
              Đăng nhập để tham gia
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default CommunityDrawer;