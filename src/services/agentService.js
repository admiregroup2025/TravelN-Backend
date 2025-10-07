
import Agent from "../models/agent.js";
import User from "../models/User.js";
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
  const normalizedEmail = typeof data.email === "string" ? data.email.toLowerCase().trim() : data.email;
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) throw new AppError("Email already exists", 400);

  const requestedRole = data.role || ROLES.AGENT;
  if (requestedRole === ROLES.ADMIN && loggedInUser.role !== ROLES.SUPERADMIN) {
    throw new AppError("Only SUPERADMIN can create ADMIN", 403);
  }

  // Create credentials user
  const user = new User({
    email: normalizedEmail,
    passwordHash: data.password,
    role: requestedRole,
    firstName: data.firstName,
    lastName: data.lastName,
  });
  await user.save();

  // Create agent profile
  const agent = new Agent({
    firstName: data.firstName,
    lastName: data.lastName,
    email: normalizedEmail,
    phone: data.phone,
    role: requestedRole,
    company: data.company,
    registeredEmail: data.registeredEmail,
    secondaryEmail: data.secondaryEmail,
    companyAddress: data.companyAddress,
    branchAddress: data.branchAddress,
    photo: data.photo,
    isActive: data.isActive !== undefined ? data.isActive : true,
  });
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
  // keep User in sync for key fields
  const userUpdate = {};
  if (typeof updateData.isActive === "boolean") userUpdate.isActive = updateData.isActive;
  if (updateData.role && Object.values(ROLES).includes(updateData.role)) userUpdate.role = updateData.role;
  if (Object.keys(userUpdate).length) {
    await User.updateOne({ email: agent.email }, { $set: userUpdate });
  }
  return { agent, message: "Agent updated successfully" };
};

export const deleteAgent = async (id, loggedInUser) => {
  const agent = await Agent.findById(id);
  if (!agent) throw new AppError("Agent not found", 404);
  if (agent.role === ROLES.ADMIN && loggedInUser.role !== ROLES.SUPERADMIN) {
    throw new AppError("Cannot delete ADMIN", 403);
  }
  await User.deleteOne({ email: agent.email });
  await Agent.deleteOne({ _id: agent._id });
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
  await User.updateOne({ email: agent.email }, { $set: { isActive } });
  return { agent, message: `Agent is now ${isActive ? "active" : "inactive"}` };
};

export const changeAgentPassword = async (id, newPassword, loggedInUser) => {
  const agent = await Agent.findById(id);
  if (!agent) throw new AppError("Agent not found", 404);
  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await User.updateOne({ email: agent.email }, { $set: { passwordHash } });
  return { message: "Password updated successfully" };
};

export const changeOwnPassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select("+passwordHash");
  if (!user) throw new AppError("User not found", 404);
  const match = await bcrypt.compare(currentPassword, user.passwordHash || "");
  if (!match) throw new AppError("Current password is incorrect", 400);
  user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await user.save();
  return { message: "Password updated successfully" };
};

export const getAgentByEmail = async (email) => {
  const agent = await Agent.findOne({ email });
  if (!agent) throw new AppError("Agent not found", 404);
  return agent;
};
