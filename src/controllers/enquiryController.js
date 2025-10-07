import { Enquiry } from "../models/enquiry.js";
import { AppError } from "../utils/errorHandler.js";

/**
 * @desc Create a new enquiry (Public/User)
 * @route POST /api/enquiries
 * @access Public
 */
export const createEnquiry = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.create(req.body);
    return res.status(201).json({
      success: true,
      message: "Enquiry submitted successfully!",
      data: enquiry,
    });
  } catch (error) {
    console.error("Error creating enquiry:", error);
    next(new AppError("Failed to submit enquiry", 500));
  }
};


export const getAllEnquiries = async (req, res, next) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      total: enquiries.length,
      data: enquiries,
    });
  } catch (error) {
    console.error("Error fetching enquiries:", error);
    next(new AppError("Failed to fetch enquiries", 500));
  }
};
