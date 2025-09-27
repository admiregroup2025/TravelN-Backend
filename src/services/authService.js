import RefreshToken from "../models/RefreshToken.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/errorHandler.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import jwt from "jsonwebtoken";

export const registerUser = async ({ first_name,last_name, email, phone_no, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
throw new AppError("User already exists", 400);
  }

  const hashedPassword = await User.hashPassword(password);

  const user = new User({
    first_name,
    last_name,
    email,
    phone_no,
    password : hashedPassword,
  });

  await user.save();
  const userData = user.toObject();
  delete userData.password;

  return {
    message: "User registered successfully",
    user:userData,
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
    id:user._id,
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

// export const refreshTokens = async (oldRefreshToken) => {
//   if (!oldRefreshToken) throw new AppError("Refresh token missing", 401);
//   let decoded;
//   try {
//     decoded = jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET);
//   } catch (error) {
//     console.log(error);
//     throw new AppError("Invalid or expired refresh token", 401);
//   }

//   // Create new tokens
//   const payload = {
//     email: decoded.email,
//     role: decoded.role,
//   };

//   const newAccessToken = generateAccessToken(payload);
//   const newRefreshToken = generateRefreshToken(payload);

//   return { newAccessToken, newRefreshToken };
// }





export const refreshTokens = async (oldRefreshToken) => {
  if (!oldRefreshToken) throw new AppError("Refresh token missing", 401);

  const existingToken = await RefreshToken.findOne({ token: oldRefreshToken });
  if (!existingToken) throw new AppError("Invalid refresh token", 401);

  // Verify JWT
  let decoded;
  try {
    decoded = jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    await RefreshToken.deleteOne({ token: oldRefreshToken }); // cleanup expired
    throw new AppError("Invalid or expired refresh token", 401);
  }

  // Rotate: delete old token
  await RefreshToken.deleteOne({ token: oldRefreshToken });

  // Create new tokens
  const payload = { id: decoded.id, email: decoded.email, role: decoded.role };
  const newAccessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);

  await RefreshToken.create({
    token: newRefreshToken,
    userId: decoded.id,
    expiresAt: new Date(Date.now() + 7*24*60*60*1000)
  });

  return { newAccessToken, newRefreshToken };
};

export const updateUserProfile = async (userId, data, file) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found"); // throw new App Error
  Object.assign(user, data);
  await user.save();

  return user;
};