import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import pkg from 'multer-storage-cloudinary';
const { CloudinaryStorage } = pkg;

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'Travelnworld/destinations',
    resource_type: 'image',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    public_id: (req, file) => `dest_${Date.now()}_${file.originalname.split('.')[0]}`,
  },
});

const uploadDestinationMedia = multer({ storage });

export default uploadDestinationMedia;
