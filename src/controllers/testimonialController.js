import { Testimonial } from "../models/Testimonial.js";

// Get all testimonials
export const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: testimonials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create testimonial
export const createTestimonial = async (req, res) => {
  try {
    let { name, role, content, rating, image, type, location, videoUrl, visibility } = req.body;
    
    // If a file was uploaded via multer-storage-cloudinary
    if (req.file) {
      if (req.file.mimetype.startsWith('video')) {
        videoUrl = req.file.path;
        type = 'video';
      } else {
        image = req.file.path;
        type = 'text';
      }
    }

    const testimonial = await Testimonial.create({
      name,
      role,
      content,
      rating,
      image,
      type: type || 'text',
      location,
      videoUrl,
      visibility: visibility || 'Public'
    });
    res.status(201).json({ success: true, data: testimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update testimonial
export const updateTestimonial = async (req, res) => {
  try {
    let updateData = { ...req.body };
    
    if (req.file) {
      if (req.file.mimetype.startsWith('video')) {
        updateData.videoUrl = req.file.path;
        updateData.type = 'video';
      } else {
        updateData.image = req.file.path;
        updateData.type = 'text';
      }
    }

    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!testimonial) return res.status(404).json({ success: false, message: "Testimonial not found" });
    res.status(200).json({ success: true, data: testimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete testimonial
export const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) return res.status(404).json({ success: false, message: "Testimonial not found" });
    res.status(200).json({ success: true, message: "Testimonial deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
