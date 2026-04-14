import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import pkg from 'multer-storage-cloudinary';
const { CloudinaryStorage } = pkg;

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: 'Travelnworld/banner_ads/home_top_banner',
    resource_type: 'image',
    public_id: `banner_${Date.now()}`,
  }),
});

const uploadMedia = multer({ storage });

export default uploadMedia;
