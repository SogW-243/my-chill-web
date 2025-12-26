import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../config/firebase'; 
import { 
  collection, addDoc, query, where, orderBy, onSnapshot, 
  serverTimestamp, doc, updateDoc, arrayUnion, arrayRemove 
} from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { checkImageSafety } from '../../utils/contentSafety';
import { Heart, MessageCircle, Image as ImageIcon, Send, Loader2, Trash2, X } from 'lucide-react';

// Cấu hình Cloudinary (Dùng lại của bạn)
const CLOUD_NAME = "tên_cloud_của_bạn"; 
const UPLOAD_PRESET = "chill_web_upload"; 

const WallFeed = ({ targetUserId }) => {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState([]);
  
  // State cho Form đăng bài
  const [newContent, setNewContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isChecking, setIsChecking] = useState(false); // Check AI
  const [isUploading, setIsUploading] = useState(false); // Upload Server
  
  const fileInputRef = useRef(null);

  // --- 1. FETCH BÀI ĐĂNG (REALTIME) ---
  useEffect(() => {
    if (!targetUserId) return;

    // Lấy bài đăng của người có uid = targetUserId
    const q = query(
      collection(db, "posts"),
      where("uid", "==", targetUserId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postsData);
    });

    return () => unsubscribe();
  }, [targetUserId]);

  // --- 2. XỬ LÝ CHỌN ẢNH & CHECK AI ---
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Chỉ hỗ trợ file ảnh!");
      return;
    }

    // Tạo preview ngay để user thấy
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setIsChecking(true);

    try {
      // Gọi hàm checkImageSafety (Bạn đã làm ở bước trước)
      const isSafe = await checkImageSafety(file);
      
      if (isSafe) {
        setSelectedFile(file);
      } else {
        alert("⚠️ Ảnh này bị hệ thống AI chặn vì chứa nội dung không phù hợp.");
        setPreviewUrl(null);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error("Lỗi check ảnh:", error);
    } finally {
      setIsChecking(false);
    }
  };

  // --- 3. UPLOAD LÊN CLOUDINARY ---
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    return data.secure_url;
  };

  // --- 4. GỬI BÀI ĐĂNG (SUBMIT) ---
  const handlePost = async (e) => {
    e.preventDefault();
    if (!newContent.trim() && !selectedFile) return;
    if (!currentUser) return alert("Bạn cần đăng nhập để viết lưu bút!");

    setIsUploading(true);
    try {
      let mediaUrl = "";
      
      // Nếu có file -> Upload
      if (selectedFile) {
        mediaUrl = await uploadImage(selectedFile);
      }

      // Lưu vào Firestore
      await addDoc(collection(db, "posts"), {
        uid: targetUserId, // Bài đăng này thuộc về tường nhà của targetUserId
        authorId: currentUser.uid, // Người viết là currentUser
        authorName: currentUser.displayName,
        authorAvatar: currentUser.photoURL,
        content: newContent,
        mediaUrl: mediaUrl,
        mediaType: selectedFile ? 'image' : 'text',
        likes: [], // Mảng chứa uid người like
        createdAt: serverTimestamp()
      });

      // Reset form
      setNewContent('');
      setSelectedFile(null);
      setPreviewUrl(null);

    } catch (error) {
      console.error("Lỗi đăng bài:", error);
      alert("Đăng bài thất bại :(");
    } finally {
      setIsUploading(false);
    }
  };

  // --- 5. XỬ LÝ LIKE ---
  const handleLike = async (postId, likesArray) => {
    if (!currentUser) return;
    const postRef = doc(db, "posts", postId);
    
    const isLiked = likesArray.includes(currentUser.uid);

    if (isLiked) {
      await updateDoc(postRef, { likes: arrayRemove(currentUser.uid) });
    } else {
      await updateDoc(postRef, { likes: arrayUnion(currentUser.uid) });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto h-full flex flex-col bg-slate-900/80 backdrop-blur-xl border-l border-white/10 shadow-2xl">
      
      {/* HEADER */}
      <div className="p-4 border-b border-white/10">
        <h2 className="text-white font-bold text-lg">Sổ Lưu Bút</h2>
      </div>

      {/* DANH SÁCH BÀI ĐĂNG (SCROLL) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
        {posts.length === 0 ? (
           <div className="text-center text-gray-500 mt-10">Chưa có dòng tâm sự nào...</div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white/5 p-4 rounded-xl border border-white/5 animate-fade-in">
              {/* Info người đăng */}
              <div className="flex items-center gap-3 mb-3">
                <img src={post.authorAvatar} alt="Avt" className="w-8 h-8 rounded-full" />
                <div>
                  <p className="text-white text-sm font-semibold">{post.authorName}</p>
                  <p className="text-gray-400 text-[10px]">
                    {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString('vi-VN') : 'Vừa xong'}
                  </p>
                </div>
              </div>

              {/* Nội dung text */}
              {post.content && <p className="text-gray-200 text-sm mb-3 whitespace-pre-wrap">{post.content}</p>}

              {/* Nội dung ảnh */}
              {post.mediaUrl && (
                <div className="rounded-lg overflow-hidden mb-3">
                   <img src={post.mediaUrl} alt="Post media" className="w-full object-cover" loading="lazy" />
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4 text-gray-400">
                <button 
  onClick={() => handleLike(post.id, Array.isArray(post.likes) ? post.likes : [])}
  className={`flex items-center gap-1 text-sm hover:text-pink-500 transition-colors ${Array.isArray(post.likes) && post.likes.includes(currentUser?.uid) ? 'text-pink-500' : ''}`}
>
  <Heart size={16} fill={Array.isArray(post.likes) && post.likes.includes(currentUser?.uid) ? "currentColor" : "none"} />
  {Array.isArray(post.likes) ? post.likes.length : 0}
</button>
                <button className="flex items-center gap-1 text-sm hover:text-blue-400 transition-colors">
                  <MessageCircle size={16} /> Bình luận
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FORM ĐĂNG BÀI (STICKY BOTTOM) */}
      <div className="p-4 bg-black/40 border-t border-white/10">
        
        {/* Preview ảnh đang chọn */}
        {previewUrl && (
          <div className="relative w-20 h-20 mb-2 rounded-lg overflow-hidden border border-white/20 group">
             <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
             {isChecking && <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px] text-white">Checking...</div>}
             <button 
               onClick={() => { setPreviewUrl(null); setSelectedFile(null); }}
               className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-red-500"
             >
               <X size={12}/>
             </button>
          </div>
        )}

        <form onSubmit={handlePost} className="flex gap-2 items-end">
          <div className="flex-1 bg-white/10 rounded-2xl p-2 focus-within:bg-white/20 transition-colors">
             <textarea 
               value={newContent}
               onChange={(e) => setNewContent(e.target.value)}
               placeholder="Viết gì đó vào sổ lưu bút..."
               className="w-full bg-transparent border-none outline-none text-white text-sm resize-none max-h-24 p-1 placeholder-gray-400"
               rows="1"
             />
             <div className="flex justify-between items-center mt-1 px-1">
               <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-gray-400 hover:text-indigo-400 transition-colors"
               >
                 <ImageIcon size={18} />
               </button>
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 onChange={handleFileSelect} 
                 className="hidden" 
                 accept="image/*"
               />
             </div>
          </div>

          <button 
            type="submit" 
            disabled={isUploading || isChecking || (!newContent && !selectedFile)}
            className="p-3 bg-indigo-600 rounded-full text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            {isUploading ? <Loader2 size={18} className="animate-spin"/> : <Send size={18} />}
          </button>
        </form>
      </div>

    </div>
  );
};

export default WallFeed;