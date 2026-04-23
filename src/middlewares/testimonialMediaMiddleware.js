import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine if it's a video or image
    const isVideo = file.mimetype.startsWith('video');
    return {
      folder: 'travelnworld_testimonials',
      resource_type: isVideo ? 'video' : 'image',
      allowed_formats: isVideo ? ['mp4', 'webm', 'mov'] : ['jpg', 'png', 'jpeg', 'webp'],
      public_id: `test_${Date.now()}`
    };
  },
});

const uploadTestimonialMedia = multer({ storage: storage });

export default uploadTestimonialMedia;
