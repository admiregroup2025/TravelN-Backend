import { body } from "express-validator";

export const validateRegister = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email"),
  body("name")
    .notEmpty()
    .withMessage("Name is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("phone_no")
    .isMobilePhone()
    .withMessage("Please provide a valid phone number"),
];
