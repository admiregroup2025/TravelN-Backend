import express from 'express';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    res.status(200).json({
      success: true,
      url: req.file.path, // Cloudinary provides the URL in req.file.path
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Upload failed", error });
  }
});

export default router;
