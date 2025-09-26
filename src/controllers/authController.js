// import jwt from "jsonwebtoken";
// import { User } from "../models/User.js";
// import { ROLES } from "../utils/constant.js";

// function signToken(user) {
// 	const payload = { id: user._id.toString(), role: user.role, email: user.email };
// 	const secret = process.env.JWT_SECRET || "dev_secret";
// 	const expiresIn = "7d";
// 	return jwt.sign(payload, secret, { expiresIn });
// }

// export async function login(req, res) {
// 	const { email, password } = req.body;
// 	if (!email || !password) return res.status(400).json({ message: "Email and password required" });
// 	const user = await User.findOne({ email });
// 	if (!user) return res.status(401).json({ message: "Invalid credentials" });
// 	const ok = await user.verifyPassword(password);
// 	if (!ok) return res.status(401).json({ message: "Invalid credentials" });
// 	return res.json({ token: signToken(user), role: user.role, name: user.name });
// }

// export async function seedSuperAdmin(req, res) {
//   const seedKey = req.headers["x-seed-key"];
//   if ((process.env.SEED_SUPERADMIN_KEY || "") !== seedKey) {
//     return res.status(403).json({ message: "Forbidden" });
//   }
//   const email = process.env.SUPERADMIN_EMAIL || "super@travelnworldz.com";
//   const password = process.env.SUPERADMIN_PASSWORD || "superadmin123";
//   let user = await User.findOne({email});
//   if (!user) {
//     user = new User({
//       name: "Super Admin",
//       email,
//       passwordHash: await User.hashPassword(password),
//       role: ROLES.SUPERADMIN,
//     });
//     await user.save();
//   }
//   return res.json({
//     message: "Super admin ready",
//     email,
//     token: signToken(user),
//   });
// }



import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { ROLES } from "../utils/constant.js";
import * as authService from "../services/authService.js";
import { AppError } from "../utils/errorHandler.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone_no } = req.body;
    console.log(email,"nawlesh")
    const result = await authService.registerUser({
      name,
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

// function signToken(user) {
// 	const payload = { id: user._id.toString(), role: user.role, email: user.email };
// 	const secret = process.env.JWT_SECRET || "dev_secret";
// 	const expiresIn = "7d";
// 	return jwt.sign(payload, secret, { expiresIn });
// }

// export async function login(req, res) {
// 	const { email, password } = req.body;
// 	if (!email || !password) return res.status(400).json({ message: "Email and password required" });
// 	const user = await User.findOne({ email });
// 	if (!user) return res.status(401).json({ message: "Invalid credentials" });
// 	const ok = await user.verifyPassword(password);
// 	if (!ok) return res.status(401).json({ message: "Invalid credentials" });
// 	return res.json({ token: signToken(user), role: user.role, name: user.name });
// }

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
			passwordHash: await User.hashPassword(password),
			role: ROLES.SUPERADMIN,
		});
		await user.save();
	}
	return res.json({ message: "Super admin ready", email, token: signToken(user) });
}

