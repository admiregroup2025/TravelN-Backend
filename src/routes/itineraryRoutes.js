import { Router } from "express";
import { 
  createItinerary, 
  listCards, 
  getByCountry, 
  getBySlug,
  getAllItinerary,
  getItineraryById,
  updateItinerary,
  deleteItinerary,
  togglePublic
} from "../controllers/itineraryController.js";
import { requireAuth, requireRoles } from "../middlewares/auth.js";
import { ROLES } from "../utils/constant.js";

const router = Router();

// Public endpoints for cards
router.get("/cards", listCards); // ?type=domestic|international
router.get("/international/:country", getByCountry);
router.get("/:slug", getBySlug);

// Protected admin endpoints
router.get("/", requireAuth, requireRoles(ROLES.ADMIN, ROLES.SUPERADMIN), getAllItinerary);
router.get("/admin/:id", requireAuth, requireRoles(ROLES.ADMIN, ROLES.SUPERADMIN), getItineraryById);
router.post("/", requireAuth, requireRoles(ROLES.ADMIN, ROLES.SUPERADMIN), createItinerary);
router.put("/:id", requireAuth, requireRoles(ROLES.ADMIN, ROLES.SUPERADMIN), updateItinerary);
router.delete("/:id", requireAuth, requireRoles(ROLES.ADMIN, ROLES.SUPERADMIN), deleteItinerary);
router.patch("/:id/toggle-public", requireAuth, requireRoles(ROLES.ADMIN, ROLES.SUPERADMIN), togglePublic);

export default router;


