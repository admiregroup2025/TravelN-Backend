import express from "express";
import { createBanner, getBanners, updateBanner, deleteBanner, toggleBannerStatus } from "../controllers/bannerController.js";

import upload from "../middlewares/mediaUploads.js";
import { requireAuth, requireRoles } from "../middlewares/auth.js";
import { ROLES } from "../utils/constant.js";

const router = express.Router();

// PUBLIC
router.get("/", getBanners);

// ADMIN
router.post("/", requireAuth, requireRoles(ROLES.ADMIN), upload.single("image"), createBanner);

router.put("/:id", requireAuth, requireRoles(ROLES.ADMIN), upload.single("image"), updateBanner);

router.delete("/:id", requireAuth, requireRoles(ROLES.ADMIN), deleteBanner);

router.patch("/:id/toggle", requireAuth, requireRoles(ROLES.ADMIN), toggleBannerStatus);

export default router;