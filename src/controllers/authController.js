


import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { ROLES } from "../utils/constant.js";
import * as authService from "../services/authService.js";
import { AppError } from "../utils/errorHandler.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";

export const register = async (req, res, next) => {
  try {
    const {first_name,last_name, email, password, phone_no } = req.body;
    console.log(first_name)
   
    const result = await authService.registerUser({
      first_name,
      last_name,
      email,
      password,
      phone_no,
    });
    return res
      .status(201)
      .json({ success: true, message: result.message, data: result.user });
  } catch (err) {
    next(new AppError(err.message || "Registration failed", 400));
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};

export const refreshTokenHandler = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    const { newAccessToken, newRefreshToken } = await authService.refreshTokens(
      refreshToken
    );

    // Set new refresh token in HTTP-only cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return new access token
    return res.json({ accessToken: newAccessToken });
  } catch (error) {
    return res
      .status(401)
      .json({ message: error.message || "Invalid refresh token" });
  }
};



export async function seedSuperAdmin(req, res) {
	// Temporary, protect with a simple shared secret via env
	const seedKey = req.headers["x-seed-key"];
	if ((process.env.SEED_SUPERADMIN_KEY || "") !== seedKey) {
		return res.status(403).json({ message: "Forbidden" });
	}
	const email = process.env.SUPERADMIN_EMAIL || "super@travelnworldz.com";
	const password = process.env.SUPERADMIN_PASSWORD || "superadmin123";
	let user = await User.findOne({ email });
	if (!user) {
		user = new User({
			name: "Super Admin",
			email,
			password: await User.hashPassword(password),
			role: ROLES.SUPERADMIN,
		});
		await user.save();
	}
	
	// Generate tokens for super admin
	const payload = {
		email: user.email,
		role: user.role,
	};
	const accessToken = generateAccessToken(payload);
	const refreshToken = generateRefreshToken(payload);
	
	return res.json({ 
		message: "Super admin ready", 
		email, 
		accessToken,
		refreshToken 
	});
}




export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken });
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    });

    return res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Logout failed" });
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log(userId);
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id; // from auth middleware
    const updatedUser = await authService.updateUserProfile(userId, req.body, req.file);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    next(new AppError(err.message || "Profile update failed", 400));
  }
};