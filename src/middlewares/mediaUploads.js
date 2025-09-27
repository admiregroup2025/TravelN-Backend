import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { ENV } from '../config/ENV.js';

cloudinary.config({
  cloud_name: ENV.CLOUDINARY_NAME,
  api_key: ENV.CLOUDINARY_API,
  api_secret: ENV.CLOUDINARY_SECRET,
});


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'media-uploads',
    resource_type: 'auto',
  },
});

const uploadMedia = multer({ storage });

export default uploadMedia;
