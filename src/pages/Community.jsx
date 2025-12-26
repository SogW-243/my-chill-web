// src/pages/Community.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../config/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import { Heart, MessageCircle, Music, Image as ImageIcon, Filter, Home } from 'lucide-react';

const Community = () => {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'image' | 'audio'
  const [loading, setLoading] = useState(true);

  // --- 1. FETCH DATA (REALTIME) ---
  useEffect(() => {
    // Lấy tất cả bài post, mới nhất lên đầu
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- 2. XỬ LÝ FILTER ---
  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    if (filter === 'image') return post.mediaType === 'image';
    if (filter === 'audio') return post.mediaType === 'audio' || post.mediaType === 'music'; // phòng hờ
    return true;
  });

  // --- 3. XỬ LÝ LIKE ---
  const handleLike = async (e, postId, likes) => {
    e.preventDefault(); // Chặn click lan sang thẻ cha
    if (!currentUser) return alert("Đăng nhập để thả tim nhé!");
    
    const postRef = doc(db, "posts", postId);
    const likesArr = Array.isArray(likes) ? likes : [];
    const isLiked = likesArr.includes(currentUser.uid);

    if (isLiked) {
      await updateDoc(postRef, { likes: arrayRemove(currentUser.uid) });
    } else {
      await updateDoc(postRef, { likes: arrayUnion(currentUser.uid) });
    }
  };

  return (
    <Layout>
      {/* HEADER & FILTER BAR */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo / Title */}
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
              <Home size={20} className="text-white" />
            </Link>
            <h1 className="text-xl font-bold text-white hidden sm:block">
              Quảng Trường Chill ✨
            </h1>
          </div>

          {/* Filter Tabs */}
          <div className="flex bg-black/30 p-1 rounded-full border border-white/10">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filter === 'all' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              Tất cả
            </button>
            <button 
              onClick={() => setFilter('image')}
              className={`flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filter === 'image' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              <ImageIcon size={14}/> <span className="hidden sm:inline">Ảnh</span>
            </button>
            <button 
              onClick={() => setFilter('audio')}
              className={`flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filter === 'audio' ? 'bg-pink-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              <Music size={14}/> <span className="hidden sm:inline">Nhạc</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT - MASONRY GRID */}
      <div className="pt-24 pb-10 px-4 max-w-7xl mx-auto min-h-screen overflow-y-auto">
        
        {loading ? (
          <div className="text-center text-white mt-20">Đang tải cảm xúc...</div>
        ) : (
          /* KỸ THUẬT MASONRY LAYOUT DÙNG CSS COLUMNS */
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            
            {filteredPosts.map((post) => {
              const likesArr = Array.isArray(post.likes) ? post.likes : [];
              const isLiked = likesArr.includes(currentUser?.uid);

              return (
                /* Card Item */
                <div key={post.id} className="break-inside-avoid mb-4 relative group">
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:bg-white/15 transition-all duration-300 hover:-translate-y-1 shadow-xl">
                    
                    {/* Header Card: User Info */}
                    <Link to={`/profile/${post.uid}`} className="flex items-center gap-3 p-3 border-b border-white/5 hover:bg-white/5 transition-colors">
                      <img 
                        src={post.authorAvatar || "https://via.placeholder.com/40"} 
                        alt="Avt" 
                        className="w-8 h-8 rounded-full object-cover border border-white/20"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-bold truncate">{post.authorName}</p>
                        <p className="text-gray-400 text-[10px]">
                          {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString('vi-VN') : 'Vừa xong'}
                        </p>
                      </div>
                    </Link>

                    {/* Media Content */}
                    {post.mediaUrl && post.mediaType === 'image' && (
                      <div className="w-full">
                        <img src={post.mediaUrl} alt="Post" className="w-full h-auto object-cover" loading="lazy" />
                      </div>
                    )}

                    {/* Audio Content Placeholder */}
                    {post.mediaUrl && post.mediaType === 'audio' && (
                      <div className="w-full h-32 bg-gradient-to-br from-indigo-900 to-purple-900 flex flex-col items-center justify-center text-white gap-2">
                         <Music size={32} className="animate-bounce" />
                         <span className="text-xs opacity-70">Audio Clip</span>
                      </div>
                    )}

                    {/* Text Content */}
                    {post.content && (
                      <div className="p-4">
                        <p className="text-gray-200 text-sm whitespace-pre-wrap leading-relaxed">
                          {post.content}
                        </p>
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="px-4 py-3 flex items-center justify-between border-t border-white/5 bg-black/20">
                      <button 
                        onClick={(e) => handleLike(e, post.id, likesArr)}
                        className={`flex items-center gap-1.5 text-sm transition-colors ${isLiked ? 'text-pink-500 font-bold' : 'text-gray-400 hover:text-pink-400'}`}
                      >
                        <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                        {likesArr.length}
                      </button>
                      
                      <button className="flex items-center gap-1.5 text-gray-400 hover:text-blue-400 text-sm transition-colors">
                        <MessageCircle size={18} />
                        <span className="text-xs">Bình luận</span>
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filteredPosts.length === 0 && (
          <div className="text-center text-gray-400 mt-20">
            Chưa có bài viết nào thuộc thể loại này. Hãy là người đầu tiên! 🚀
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Community;