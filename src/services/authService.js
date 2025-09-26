import { User } from "../models/User.js";
import { AppError } from "../utils/errorHandler.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import jwt from "jsonwebtoken";

export const registerUser = async ({ name, email, password, phone_no }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
throw new AppError("User already exists", 400);
  }

  const hashedPassword = await User.hashPassword(password);

  const user = new User({
    name,
    email,
    phone_no,
    password : hashedPassword,
  });

  await user.save();
  return {
    message: "User registered successfully",
    user,
  };
};

export const loginUser = async (email, password) => {
  // Find user and include password
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new AppError("Invalid email or password", 401);

  // Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new AppError("Invalid email or password", 401);

    // Convert to plain object and remove password
  const userData = user.toObject();
  delete userData.password;


  // Payload for tokens
  const payload = {
    email: user.email,
    role: user.role,
  };

  // Generate tokens
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Return tokens and user data
  return {
    accessToken,
    refreshToken,
    user : userData
  };
};

export const refreshTokens = async (oldRefreshToken) => {
  if (!oldRefreshToken) throw new AppError("Refresh token missing", 401);
  let decoded;
  try {
    console.log(process.env.REFRESH_TOKEN_SECRET);
    decoded = jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    console.log(error);
    throw new AppError("Invalid or expired refresh token", 401);
  }

  // Create new tokens
  const payload = {
    id: decoded._id,
    email: decoded.email,
    role: decoded.role,
  };

  const newAccessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);

  return { newAccessToken, newRefreshToken };
}