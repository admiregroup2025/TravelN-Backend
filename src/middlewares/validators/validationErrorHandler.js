import { AppError } from "../../utils/errorHandler.js";
import { validationResult } from "express-validator";

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Combine all validation messages
    const message = errors.array().map(err => err.msg).join(", ");
    // Throw AppError so it goes to global error handler
    return next(new AppError(message, 400));
  }
  next();
};