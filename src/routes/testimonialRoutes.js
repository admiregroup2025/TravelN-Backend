import { Router } from "express";
import { 
  getTestimonials, 
  createTestimonial, 
  updateTestimonial, 
  deleteTestimonial 
} from "../controllers/testimonialController.js";
import { requireAuth, requireRoles } from "../middlewares/auth.js";
import { ROLES } from "../utils/constant.js";
import uploadTestimonialMedia from "../middlewares/testimonialMediaMiddleware.js";

const router = Router();

// Public routes
router.get("/", getTestimonials);

// Admin routes
router.post("/", requireAuth, requireRoles(ROLES.ADMIN, ROLES.SUPERADMIN), uploadTestimonialMedia.single('file'), createTestimonial);
router.put("/:id", requireAuth, requireRoles(ROLES.ADMIN, ROLES.SUPERADMIN), uploadTestimonialMedia.single('file'), updateTestimonial);
router.delete("/:id", requireAuth, requireRoles(ROLES.ADMIN, ROLES.SUPERADMIN), deleteTestimonial);

export default router;

