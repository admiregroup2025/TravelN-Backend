import { Router } from "express";
import {
  getAllAgents,
  getAgentById,
  createAgent,
  updateAgent,
  deleteAgent,
  changeAgentPassword,
  toggleAgentStatus,
  // getAgentStats,
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
} from "../controllers/agentController.js";
import { requireAuth, requireRoles } from "../middlewares/auth.js";
import { ROLES } from "../utils/constant.js";
import { check, body } from "express-validator";
import { validateRequest } from "../middlewares/validators/validationErrorHandler.js";

const router = Router();

// Validation middleware for agent creation
const validateAgentCreation = [
  check("firstName", "First name is required").notEmpty().trim(),
  check("lastName", "Last name must be a string").optional().isString().trim(),
  check("email", "Valid email is required").isEmail().normalizeEmail(),
  check("password", "Password must be at least 6 characters").isLength({
    min: 6,
  }),
  check("phone", "Valid phone number is required")
    .optional()
    .matches(/^\+?[0-9]{7,15}$/),
  check("role", "Invalid role").optional().isIn(Object.values(ROLES)),
  validateRequest,
];

// Validation middleware for agent update
const validateAgentUpdate = [
  check("firstName", "First name is required").optional().notEmpty().trim(),
  check("lastName", "Last name must be a string").optional().isString().trim(),
  check("phone", "Valid phone number is required")
    .optional()
    .matches(/^\+?[0-9]{7,15}$/),
  check("role", "Invalid role").optional().isIn(Object.values(ROLES)),
  check("isActive", "isActive must be boolean").optional().isBoolean(),
  validateRequest,
];

// Validation middleware for password change
const validatePasswordChange = [
  body("newPassword", "New password must be at least 6 characters").isLength({
    min: 6,
  }),
  validateRequest,
];

// Validation middleware for my password change
const validateMyPasswordChange = [
  body("currentPassword", "Current password is required").notEmpty(),
  body("newPassword", "New password must be at least 6 characters").isLength({
    min: 6,
  }),
  validateRequest,
];

// ==================== AGENT ROUTES ====================

// Get all agents
router.get(
  "/",
  requireAuth,
  requireRoles(ROLES.ADMIN, ROLES.SUPERADMIN),
  getAllAgents
);

// Get agent statistics
// router.get(
//   "/stats",
//   requireAuth,
//   requireRoles(ROLES.ADMIN, ROLES.SUPERADMIN),
//   getAgentStats
// );

// Get agent by ID
router.get(
  "/:agentId",
  requireAuth,
  requireRoles(ROLES.ADMIN, ROLES.SUPERADMIN),
  getAgentById
);

// Create new agent
router.post(
  "/",
  requireAuth,
  requireRoles(ROLES.ADMIN, ROLES.SUPERADMIN),
  validateAgentCreation,
  createAgent
);

// Update agent
router.put(
  "/:agentId",
  requireAuth,
  requireRoles(ROLES.ADMIN, ROLES.SUPERADMIN),
  validateAgentUpdate,
  updateAgent
);

// Delete agent
router.delete(
  "/:agentId",
  requireAuth,
  requireRoles(ROLES.ADMIN, ROLES.SUPERADMIN),
  deleteAgent
);

// Change agent password
router.patch(
  "/:agentId/password",
  requireAuth,
  requireRoles(ROLES.ADMIN, ROLES.SUPERADMIN),
  validatePasswordChange,
  changeAgentPassword
);

// Toggle agent active status
router.patch(
  "/:agentId/status",
  requireAuth,
  requireRoles(ROLES.ADMIN, ROLES.SUPERADMIN),
  toggleAgentStatus
);

// ==================== SUPERADMIN ONLY ROUTES ====================

// Create admin agent (SUPERADMIN only)
router.post(
  "/admin",
  requireAuth,
  requireRoles(ROLES.SUPERADMIN),
  [
    check("firstName", "First name is required").notEmpty().trim(),
    check("lastName", "Last name must be a string").optional().isString().trim(),
    check("email", "Valid email is required").isEmail().normalizeEmail(),
    check("password", "Password must be at least 6 characters").isLength({
      min: 6,
    }),
    check("phone", "Valid phone number is required")
      .optional()
      .matches(/^\+?[0-9]{7,15}$/),
    validateRequest,
  ],
  async (req, res, next) => {
    req.body.role = ROLES.ADMIN;
    next();
  },
  createAgent
);

// ==================== AGENT PROFILE ROUTES ====================

// Get my profile
router.get("/profile/me", requireAuth, getMyProfile);

// Update my profile
router.put(
  "/profile/me",
  requireAuth,
  [
    check("firstName", "First name is required").optional().notEmpty().trim(),
    check("lastName", "Last name is required").optional().notEmpty().trim(),
    check("phone", "Valid phone number is required")
      .optional()
      .matches(/^\+?[0-9]{7,15}$/),
    validateRequest,
  ],
  updateMyProfile
);

// Change my password
router.patch(
  "/profile/password",
  requireAuth,
  validateMyPasswordChange,
  changeMyPassword
);

export default router;
