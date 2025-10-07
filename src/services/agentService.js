
import Agent from "../models/Agent.js";
import { ROLES } from "../utils/constant.js";
import { AppError } from "../utils/errorHandler.js";
import bcrypt from "bcrypt";

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "10", 10);

export const getAllAgents = async (page = 1, limit = 10, role, search = "") => {
  const query = {};
  if (role && Object.values(ROLES).includes(role.toUpperCase())) query.role = role.toUpperCase();
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
    ];
  }
  const total = await Agent.countDocuments(query);
  const agents = await Agent.find(query)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  return { agents, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

export const getAgentById = async (id) => {
  const agent = await Agent.findById(id);
  if (!agent) throw new AppError("Agent not found", 404);
  return agent;
};

export const createAgent = async (data, loggedInUser) => {
  const existing = await Agent.findOne({ email: data.email });
  if (existing) throw new AppError("Email already exists", 400);

  if (data.role === ROLES.ADMIN && loggedInUser.role !== ROLES.SUPERADMIN) {
    throw new AppError("Only SUPERADMIN can create ADMIN", 403);
  }

  const agent = new Agent({ ...data, role: data.role || ROLES.AGENT });
  await agent.save();
  return { agent, message: "Agent created successfully" };
};

export const updateAgent = async (id, updateData, loggedInUser) => {
  const agent = await Agent.findById(id);
  if (!agent) throw new AppError("Agent not found", 404);
  if (agent.role === ROLES.ADMIN && loggedInUser.role !== ROLES.SUPERADMIN) {
    throw new AppError("Cannot update ADMIN", 403);
  }
  Object.assign(agent, updateData);
  await agent.save();
  return { agent, message: "Agent updated successfully" };
};

export const deleteAgent = async (id, loggedInUser) => {
  const agent = await Agent.findById(id);
  if (!agent) throw new AppError("Agent not found", 404);
  if (agent.role === ROLES.ADMIN && loggedInUser.role !== ROLES.SUPERADMIN) {
    throw new AppError("Cannot delete ADMIN", 403);
  }
  await agent.remove();
  return { message: "Agent deleted successfully" };
};

export const toggleAgentStatus = async (id, isActive, loggedInUser) => {
  const agent = await Agent.findById(id);
  if (!agent) throw new AppError("Agent not found", 404);
  if (agent.role === ROLES.ADMIN && loggedInUser.role !== ROLES.SUPERADMIN) {
    throw new AppError("Cannot toggle ADMIN status", 403);
  }
  agent.isActive = isActive;
  await agent.save();
  return { agent, message: `Agent is now ${isActive ? "active" : "inactive"}` };
};

export const changeAgentPassword = async (id, newPassword, loggedInUser) => {
  const agent = await Agent.findById(id).select("+password");
  if (!agent) throw new AppError("Agent not found", 404);
  agent.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await agent.save();
  return { message: "Password updated successfully" };
};

export const changeOwnPassword = async (id, currentPassword, newPassword) => {
  const agent = await Agent.findById(id).select("+password");
  if (!agent) throw new AppError("Agent not found", 404);
  const match = await agent.comparePassword(currentPassword);
  if (!match) throw new AppError("Current password is incorrect", 400);
  agent.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await agent.save();
  return { message: "Password updated successfully" };
};
