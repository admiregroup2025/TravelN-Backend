import { Router } from "express";
import { createEnquiry, getAllEnquiries } from "../controllers/enquiryController.js";
import { requireAuth, requireRoles } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/validators/validationErrorHandler.js";
import { validateCreateEnquiry } from "../middlewares/validators/enquiryValidator.js";
import { ROLES } from "../utils/constant.js";

const router = Router();


router.post("/", validateCreateEnquiry, validateRequest, createEnquiry);


router.get("/", requireAuth, requireRoles(ROLES.SUPERADMIN), getAllEnquiries);

export default router;
