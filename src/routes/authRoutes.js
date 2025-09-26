// import { Router } from "express";
// import { login, seedSuperAdmin } from "../controllers/authController.js";

// const router = Router();

// router.post("/login", login);
// router.post("/seed-superadmin", seedSuperAdmin);

// export default router;



import { Router } from "express";
import { login, register, refreshTokenHandler,seedSuperAdmin } from "../controllers/authController.js";
import { validateRegister } from "../middlewares/validators/authValidator.js";
import { validateRequest } from "../middlewares/validators/validationErrorHandler.js";
import { check } from "express-validator";

const router = Router();

// router.post("/login", login);

router.post(
  "/login",
  [
    check("email", "Valid email is required").isEmail(),
    check("password", "Password is required").notEmpty(),
    validateRequest,
  ],
  login
);

router.post("/register", validateRegister, validateRequest,register);

router.post("/refresh-token", refreshTokenHandler);

router.post("/seed-superadmin", seedSuperAdmin);

export default router;