import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Trash2, Send, MoreHorizontal, X } from 'lucide-react';
import { db } from '../../config/firebase';
import { 
  doc, updateDoc, deleteDoc, arrayUnion, arrayRemove, 
  collection, addDoc, onSnapshot, query, orderBy, serverTimestamp 
} from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const PostItem = ({ post, currentUser }) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLikeLoading, setIsLikeLoading] = useState(false);

  // Kiểm tra xem user hiện tại đã like bài này chưa (dựa vào mảng likesList trong DB)
  const isLiked = post.likesList?.includes(currentUser?.uid);

  // --- 1. LOGIC LIKE (NÂNG CAO) ---
  const handleToggleLike = async () => {
    if (!currentUser || isLikeLoading) return;
    setIsLikeLoading(true);
    
    const postRef = doc(db, "posts", post.id);
    try {
      if (isLiked) {
        // Nếu đã like -> Xóa UID khỏi mảng, giảm count
        await updateDoc(postRef, {
          likesList: arrayRemove(currentUser.uid)
        });
      } else {
        // Chưa like -> Thêm UID vào mảng
        await updateDoc(postRef, {
          likesList: arrayUnion(currentUser.uid)
        });
      }
    } catch (error) {
      console.error("Lỗi like:", error);
    } finally {
      setIsLikeLoading(false);
    }
  };

  // --- 2. LOGIC XÓA BÀI VIẾT ---
  const handleDeletePost = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa bài viết này?")) return;
    try {
      await deleteDoc(doc(db, "posts", post.id));
    } catch (error) {
      console.error("Lỗi xóa bài:", error);
      alert("Không thể xóa bài viết.");
    }
  };

  // --- 3. LOGIC COMMENT ---
  // Lắng nghe comment realtime khi mở Accordion
  useEffect(() => {
    if (!showComments) return;

    const commentsRef = collection(db, "posts", post.id, "comments");
    const q = query(commentsRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComments(fetchedComments);
    });

    return () => unsubscribe();
  }, [showComments, post.id]);

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    try {
      await addDoc(collection(db, "posts", post.id, "comments"), {
        uid: currentUser.uid,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
        text: newComment,
        createdAt: serverTimestamp()
      });
      setNewComment('');
    } catch (error) {
      console.error("Lỗi comment:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Xóa bình luận này?")) return;
    try {
      await deleteDoc(doc(db, "posts", post.id, "comments", commentId));
    } catch (error) {
      console.error("Lỗi xóa comment:", error);
    }
  };

  // Format thời gian an toàn
  const timeAgo = post.createdAt?.toDate 
    ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true, locale: vi }) 
    : 'Vừa xong';

  return (
    <div className="bg-white/5 p-4 rounded-xl border border-white/5 mb-4 animate-fade-in group">
      {/* --- Header Bài Viết --- */}
      <div className="flex items-start gap-3">
        <img src={post.photoURL} alt="Avt" className="w-10 h-10 rounded-full border border-white/10" />
        <div className="flex-1 overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-sm font-bold text-gray-200 block">{post.displayName}</span>
              <span className="text-[10px] text-gray-500">{timeAgo}</span>
            </div>
            
            {/* Nút Xóa Bài (Chỉ hiện nếu là chính chủ) */}
            {currentUser?.uid === post.uid && (
              <button 
                onClick={handleDeletePost}
                className="text-gray-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Xóa bài viết"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          {/* Nội dung */}
          {post.text && <p className="text-sm text-gray-300 mt-2 mb-2 whitespace-pre-wrap">{post.text}</p>}
          
          {/* Media */}
          {post.type === 'image' && post.mediaUrl && (
            <img src={post.mediaUrl} alt="Post media" className="w-full rounded-lg border border-white/10 mb-2 mt-2" loading="lazy" />
          )}
          {post.type === 'audio' && post.mediaUrl && (
            <audio controls src={post.mediaUrl} className="w-full h-8 mt-2 mb-2" />
          )}

          {/* --- Actions Bar --- */}
          <div className="flex gap-6 mt-3 pt-2 border-t border-white/5">
            {/* Nút Like */}
            <button 
              onClick={handleToggleLike}
              disabled={!currentUser}
              className={`flex items-center gap-1.5 text-xs transition-colors ${
                isLiked ? 'text-pink-500' : 'text-gray-400 hover:text-pink-400'
              }`}
            >
              <Heart size={16} fill={isLiked ? "currentColor" : "none"} /> 
              {post.likesList?.length || 0}
            </button>

            {/* Nút Comment */}
            <button 
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-indigo-400 transition-colors"
            >
              <MessageCircle size={16} /> 
              {showComments ? 'Ẩn bình luận' : 'Bình luận'}
            </button>
          </div>
        </div>
      </div>

      {/* --- COMMENT SECTION (Accordion) --- */}
      {showComments && (
        <div className="mt-3 pl-4 border-l-2 border-white/10 ml-2">
          {/* List Comments */}
          <div className="space-y-3 mb-3 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 pr-2">
            {comments.length === 0 && <p className="text-xs text-gray-500 italic">Chưa có bình luận nào.</p>}
            
            {comments.map(comment => (
              <div key={comment.id} className="flex gap-2 group/comment">
                <img src={comment.photoURL} className="w-6 h-6 rounded-full mt-1" alt="avt" />
                <div className="flex-1 bg-white/5 rounded-lg p-2 rounded-tl-none">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold text-gray-300">{comment.displayName}</span>
                    {/* Xóa comment (Chủ bài viết HOẶC Chủ comment đều xóa được) */}
                    {(currentUser?.uid === comment.uid || currentUser?.uid === post.uid) && (
                      <button 
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-gray-600 hover:text-red-400 opacity-0 group-hover/comment:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Comment */}
          {currentUser && (
            <form onSubmit={handleSendComment} className="flex gap-2 items-center">
              <img src={currentUser.photoURL} className="w-6 h-6 rounded-full" alt="me" />
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Viết bình luận..."
                  className="w-full bg-white/5 border border-white/10 rounded-full py-1.5 pl-3 pr-8 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <button 
                  type="submit" 
                  disabled={!newComment.trim()}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-indigo-400 hover:text-white disabled:opacity-0 transition-all"
                >
                  <Send size={12} />
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default PostItem;