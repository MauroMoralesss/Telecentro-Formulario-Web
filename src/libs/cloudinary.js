import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploader = async (filePath, options = {}) => {
  return await cloudinary.uploader.upload(filePath, {
    resource_type: "video",
    folder: "formularios",
    eager: [
      {
        width: 640,
        height: 360,
        crop: "limit",
        format: "mp4",
        video_codec: "auto",
      },
    ],
    eager_async: true, // ✅ Compresión asincrónica
    ...options,
  });
};

export { cloudinary };
