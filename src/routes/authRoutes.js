import { Router } from "express";
// import { login, register, refreshTokenHandler, seedSuperAdmin,} from "../controllers/authController.js";
import {login , register} from "../controllers/authController.js"
import { validateRegister } from "../middlewares/validators/authValidator.js";
import { validateRequest } from "../middlewares/validators/validationErrorHandler.js";
import { check } from "express-validator";
import { requireAuth, requireRoles } from "../middlewares/auth.js";
import { ROLES } from "../utils/constant.js";

const router = Router();
router.post("/login", login)
router.post("/register",register)

// router.post(
//   "/login",
//   [
//     check("email", "Valid email is required").isEmail(),
//     check("password", "Password is required").notEmpty(),
//     validateRequest,
//   ],
//   login
// );
// router.post("/register",requireAuth, requireRoles(ROLES.ADMIN, ROLES.SUPERADMIN),
//   validateRegister,
//   validateRequest,
//   register
// );

// Refresh token
// router.post("/refresh-token", refreshTokenHandler);

// Seed super admin (one-time setup - only works if no superadmin exists)
// router.post("/seed-superadmin", seedSuperAdmin);


// Get logged-in user info
router.get("/me", requireAuth, async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

// Logout
router.post("/logout", requireAuth, (req, res) => {
  res.clearCookie("refreshToken", { httpOnly: true, sameSite: "strict" });
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

// Example route: ADMIN and SUPERADMIN only
router.get(
  "/admin-dashboard",
  requireAuth,
  requireRoles(ROLES.ADMIN, ROLES.SUPERADMIN),
  async (req, res) => {
    res
      .status(200)
      .json({ success: true, message: "Welcome to admin dashboard" });
  }
);

// Example route: SUPERADMIN only
router.get(
  "/superadmin-only",
  requireAuth,
  requireRoles(ROLES.SUPERADMIN),
  async (req, res) => {
    res.status(200).json({ success: true, message: "Welcome Super Admin" });
  }
);

export default router;
