import { Router } from "express";
import { createItinerary, listCards, getByCountry, getBySlug } from "../controllers/itineraryController.js";
import { requireAuth, requireRoles } from "../middlewares/auth.js";
import { ROLES } from "../utils/constant.js";

const router = Router();

// Public endpoints for cards
router.get("/cards", listCards); // ?type=domestic|international
router.get("/international/:country", getByCountry);
router.get("/:slug", getBySlug);

// Protected create (admin + superadmin)
router.post("/", requireAuth, requireRoles(ROLES.ADMIN, ROLES.SUPERADMIN), createItinerary);

export default router;


