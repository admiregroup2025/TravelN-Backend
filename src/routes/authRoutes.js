import { Router } from "express";
import { signup, login, seedSuperAdmin } from "../controllers/authController.js";

const router = Router();

router.post("/login", login);
router.post("/signup", signup)
router.post("/seed-superadmin", seedSuperAdmin);

export default router;


