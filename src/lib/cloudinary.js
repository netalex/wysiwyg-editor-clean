// src/lib/cloudinary.js
import { v2 as cloudinary } from "cloudinary";

// Configurazione di base - Solo per SSR, non per client
if (typeof window === "undefined") {
  cloudinary.config({
    cloud_name: import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: import.meta.env.PUBLIC_CLOUDINARY_API_KEY,
    api_secret: import.meta.env.CLOUDINARY_API_SECRET,
  });
}

// Le funzioni per il browser non devono accedere alla secret key
export const getOptimizedImageUrl = (publicId, options = {}) => {
  const {
    width = 800,
    height = 600,
    crop = "fill",
    quality = "auto",
  } = options;
  const cloudName = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || "demo";

  return `https://res.cloudinary.com/${cloudName}/image/upload/c_${crop},w_${width},h_${height},q_${quality}/${publicId}`;
};

export default cloudinary;
