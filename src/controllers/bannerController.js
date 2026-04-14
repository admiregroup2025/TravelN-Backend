import Banner from "../models/banner.js";
import cloudinary from "../config/cloudinary.js";



//TOGGLE 
export const toggleBannerStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    banner.isActive = !banner.isActive;
    await banner.save();

    res.json(banner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// CREATE
export const createBanner = async (req, res) => {
  try {
    console.log("createBanner body:", req.body);
    console.log("createBanner file:", req.file);
    const { title, desc, startDate, endDate, link, position, order } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image required" });
    }

    const banner = await Banner.create({
      title,
      desc,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      link,
      position,
      order,
      imageUrl: req.file.path,
      imagePublicId: req.file.filename || req.file.public_id,
    });

    res.status(201).json(banner);
  } catch (err) {
    console.error("createBanner error:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET
export const getBanners = async (req, res) => {
  try {

    
  
    const { position, admin } = req.query;

    let filter = {};

    if (!admin) {
      filter.isActive = true; // public only sees active
    }

    if (position) filter.position = position;

    const banners = await Banner.find(filter).sort({ order: 1 });

    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    if (req.file) {
      await cloudinary.uploader.destroy(banner.imagePublicId);

      banner.imageUrl = req.file.path;
      banner.imagePublicId = req.file.filename || req.file.public_id;
    }

    const { title, desc, startDate, endDate, link, position, order, isActive } = req.body;

    banner.title = title || banner.title;
    banner.desc = desc || banner.desc;
    banner.startDate = startDate ? new Date(startDate) : banner.startDate;
    banner.endDate = endDate ? new Date(endDate) : banner.endDate;
    banner.link = link || banner.link;
    banner.position = position || banner.position;
    banner.order = order || banner.order;
    banner.isActive = isActive ?? banner.isActive;

    await banner.save();

    res.json(banner);
  } catch (err) {
    console.error("updateBanner error:", err);
    res.status(500).json({ message: err.message });
  }
};

// DELETE
export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    await cloudinary.uploader.destroy(banner.imagePublicId);
    await banner.deleteOne();

    res.json({ message: "Banner deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};