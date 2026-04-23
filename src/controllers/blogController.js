import { Blog } from "../models/BlogModel.js";
import { AppError } from "../utils/errorHandler.js";

// create new blog by admin
export const createBlog = async (req, res, next) => {
  try {
    const blog = await Blog.create(req.body);
    res.status(201).json({
      success: true,
      data: blog
    });
  } catch (error) {
    next(new AppError("Failed to create blog", 500));
  }
};

export const getAllBlogs = async (req, res, next) => {
  try {
    const { isAdmin } = req.query;
    let query = { isPublished: true };
    
    // Agar admin hai to saare dikhao
    if (isAdmin === 'true') {
      query = {};
    }

    const blogs = await Blog.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: blogs });
  } catch (error) {
    next(new AppError("Failed to fetch blogs", 500));
  }
};

// Single Blog find by slug
export const getBlogBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const blog = await Blog.findOne({ slug });
    if (!blog) return next(new AppError("Blog not found", 404));
    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    next(new AppError("Failed to fetch blog", 500));
  }
};

// get blog by ID (for admin edit)
export const getBlogById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);
    if (!blog) return next(new AppError("Blog not found", 404));
    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    next(new AppError("Failed to fetch blog", 500));
  }
};

// update blog
export const updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByIdAndUpdate(id, req.body, { new: true });
    if (!blog) return next(new AppError("Blog not found", 404));
    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    next(new AppError("Failed to update blog", 500));
  }
};