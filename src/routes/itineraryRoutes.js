import { Router } from "express";
import {
  createItinerary,
  listCards,
  getByCountry,
  getBySlug,
  updateItinerary,
  deleteItinerary,
} from "../controllers/itineraryController.js";

import { requireAuth, requireRoles } from "../middlewares/auth.js";
import { ROLES } from "../utils/constant.js";

const router = Router();

router.get("/cards", listCards);
router.get("/international/:country", getByCountry);
router.get("/:slug", getBySlug);

router.post(
  "/",
  requireAuth,
  requireRoles(ROLES.ADMIN, ROLES.SUPERADMIN),
  createItinerary
);

router.put(
  "/:slug",
  requireAuth,
  requireRoles(ROLES.ADMIN, ROLES.SUPERADMIN),
  updateItinerary
);

router.delete(
  "/:slug",
  requireAuth,
  requireRoles(ROLES.ADMIN, ROLES.SUPERADMIN),
  deleteItinerary
);

export default router;
