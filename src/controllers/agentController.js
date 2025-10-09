import * as agentService from "../services/agentService.js";
import { AppError } from "../utils/errorHandler.js";
import { ROLES } from "../utils/constant.js";
import Agent from "../models/agent.js";

/**
 * ======================
 * GET ALL AGENTS / ADMINS
 * ======================
 * Supports pagination, search, and role filter.
 */
// export const getAllAgents = async (req, res, next) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const role = req.query.role; // optional (admin / agent)
//     const search = req.query.search || "";

//     const result = await agentService.getAllAgents(page, limit, role, search);

//     res.status(200).json({
//       success: true,
//       data: result.agents,
//       pagination: result.pagination,
//     });
//   } catch (error) {
//     next(error);
//   }
// };


export const getAllAgents = async (req, res) => {
  try {
    const agent = await Agent.find({});
    if (!agent.length) {
      return res.status(400).json({ message: "No Student found" });
    }
    res.json(agent);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

/**
 * ======================
 * GET AGENT / ADMIN BY ID
 * ======================
 */
export const getAgentById = async (req, res, next) => {
  try {
    const { agentId } = req.params;
    const agent = await agentService.getAgentById(agentId);
    res.status(200).json({
      success: true,
      data: agent,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ======================
 * CREATE NEW AGENT / ADMIN
 * ======================
 * - SUPER_ADMIN can create both ADMIN and AGENT
 * - ADMIN can create AGENT only
 */
export const createAgent = async (req, res, next) => {
  try {
    const { role } = req.body;

    // Restrict role creation based on logged-in user
    if (role === ROLES.SUPERADMIN) {
      throw new AppError("Cannot create SUPER_ADMIN manually", 403);
    }

    if (req.user.role === ROLES.ADMIN && role === ROLES.ADMIN) {
      throw new AppError("ADMIN cannot create another ADMIN", 403);
    }

    const result = await agentService.createAgent(req.body, req.user);

    res.status(201).json({
      success: true,
      message: result.message,
      data: result.agent,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ======================
 * UPDATE AGENT / ADMIN
 * ======================
 * - SUPER_ADMIN can update both ADMIN & AGENT
 * - ADMIN can update AGENT only
 */
export const updateAgent = async (req, res, next) => {
  try {
    const { agentId } = req.params;
    const updateData = req.body;

    const result = await agentService.updateAgent(agentId, updateData, req.user);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.agent,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ======================
 * DELETE AGENT / ADMIN
 * ======================
 * - SUPER_ADMIN can delete both ADMIN & AGENT
 * - ADMIN can delete AGENT only
 */
export const deleteAgent = async (req, res, next) => {
  try {
    const { agentId } = req.params;
    const result = await agentService.deleteAgent(agentId, req.user);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ======================
 * TOGGLE ACTIVE STATUS
 * ======================
 * - SUPER_ADMIN and ADMIN can toggle
 */
export const toggleAgentStatus = async (req, res, next) => {
  try {
    const { agentId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      throw new AppError("isActive must be a boolean value", 400);
    }

    const result = await agentService.toggleAgentStatus(agentId, isActive, req.user);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.agent,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ======================
 * CHANGE AGENT PASSWORD
 * ======================
 */
export const changeAgentPassword = async (req, res, next) => {
  try {
    const { agentId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      throw new AppError("Password must be at least 6 characters long", 400);
    }

    const result = await agentService.changeAgentPassword(agentId, newPassword, req.user);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ======================
 * GET CURRENT LOGGED-IN AGENT PROFILE
 * ======================
 */
export const getMyProfile = async (req, res, next) => {
  try {
    const agent = await agentService.getAgentById(req.user.id);

    res.status(200).json({
      success: true,
      data: agent,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ======================
 * UPDATE OWN PROFILE
 * ======================
 */
export const updateMyProfile = async (req, res, next) => {
  try {
    const updateData = req.body;

    // Restrict sensitive fields
    delete updateData.role;
    delete updateData.isActive;

    const result = await agentService.updateAgent(req.user.id, updateData, req.user);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: result.agent,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ======================
 * CHANGE OWN PASSWORD
 * ======================
 */
export const changeMyPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new AppError("Both current and new password are required", 400);
    }

    if (newPassword.length < 6) {
      throw new AppError("New password must be at least 6 characters long", 400);
    }

    const result = await agentService.changeOwnPassword(req.user.id, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};
