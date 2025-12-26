// src/utils/contentSafety.js
import * as nsfwjs from 'nsfwjs';

// Biến lưu model để cache (tránh load lại model mỗi lần check, gây chậm)
let model;

/**
 * Hàm helper chuyển đổi File Object thành HTMLImageElement
 * để TensorFlow có thể đọc được.
 */
const readImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = reader.result;
      img.onload = () => resolve(img);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Hàm kiểm tra ảnh nhạy cảm
 * @param {File} file - File ảnh từ input
 * @returns {Promise<boolean>} - True (An toàn) | False (Nhạy cảm)
 */
export const checkImageSafety = async (file) => {
  try {
    // 1. Load model nếu chưa có (Load lần đầu sẽ mất vài giây)
    if (!model) {
      // Model được tải từ CDN của nsfwjs mặc định
      // Nếu muốn nhanh hơn, bạn có thể tải model về public folder và trỏ path vào load()
      model = await nsfwjs.load(); 
    }

    // 2. Chuyển file thành thẻ <img> để model đọc
    const imgHTML = await readImage(file);

    // 3. Dự đoán (Classify)
    const predictions = await model.classify(imgHTML);
    
    // Debug: Bạn có thể bật log này để xem model chấm điểm thế nào
    console.log("NSFW Predictions:", predictions);

    // 4. Kiểm tra điều kiện (Logic bạn yêu cầu)
    // Các nhóm nhạy cảm: 'Porn', 'Hentai'
    // Ngưỡng: > 60% (0.6)
    const isUnsafe = predictions.some((prediction) => {
      return (
        (prediction.className === 'Porn' || prediction.className === 'Hentai') &&
        prediction.probability > 0.6
      );
    });

    // Clean up memory (Quan trọng)
    imgHTML.remove();

    if (isUnsafe) {
      return false; // KHÔNG AN TOÀN
    }

    return true; // AN TOÀN

  } catch (error) {
    console.error("Lỗi khi kiểm duyệt ảnh:", error);
    // Trường hợp lỗi model, ta có thể cho qua (return true) hoặc chặn (return false) tùy policy.
    // Ở đây mình tạm cho qua để không chặn người dùng oan.
    return true; 
  }
};