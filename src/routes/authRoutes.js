import { Router } from "express";
import { login, seedSuperAdmin } from "../controllers/authController.js";

const router = Router();

router.post("/login", login);
router.post("/seed-superadmin", seedSuperAdmin);

export default router;


