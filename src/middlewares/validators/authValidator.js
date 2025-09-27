import { body } from "express-validator";

export const validateRegister = [
  body("first_name").notEmpty().withMessage("firstName is required"),
  body("last_name").notEmpty().withMessage("lastName is required"),
  body("email").isEmail().withMessage("Please provide a valid email"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("phone_no")
    .isMobilePhone()
    .withMessage("Please provide a valid phone number"),
];
