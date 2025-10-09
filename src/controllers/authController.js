import { ROLES } from "../utils/constant.js";
import * as authService from "../services/authService.js";
import Agent from "../models/agent.js";
import User from "../models/User.js";
import { AppError } from "../utils/errorHandler.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

/**
 * ======================
 * REGISTER CONTROLLER
 * ======================
 * - Only SUPER_ADMIN can create an ADMIN
 * - ADMIN or SUPER_ADMIN can create an AGENT
 */
// export const register = async (req, res, next) => {
//   try {
//     const { firstName, lastName, email, password, role } = req.body;

//     // Prevent anyone from manually assigning SUPER_ADMIN
//     if (role === ROLES.SUPERADMIN) {
//       throw new AppError("Cannot assign SUPERADMIN role manually", 403);
//     }

//     // Determine assigned role
//     const assignedRole = Object.values(ROLES).includes(role)
//       ? role
//       : ROLES.AGENT; // Default to agent-level if role invalid or missing

//     const result = await authService.registerAgent({
//       firstName,
//       lastName,
//       email,
//       password,
//       role: assignedRole,c
//     }, req.user); // pass logged-in user for role check

//     return res.status(201).json({
//       success: true,
//       message: result.message,
//       data: result.agent,
//     });
//   } catch (err) {
//     next(new AppError(err.message || "Registration failed", 400));
//   }
// };

export const register = async (req, res) => {
  try {
    const { first_Name , last_Name, email , password ,  phone_no } = req.body;
    console.log(req.body)
    if (!first_Name || !last_Name || !email || !password  || !phone_no) {
      return res.status(400).json({ message: "All fields are required" });
    }
  //     if (role === ROLES.SUPERADMIN) {
  //      throw new AppError("Cannot assign SUPERADMIN role manually", 403);
  //  }
    const duplicate = await Agent.findOne({ email });
    if (duplicate) {
      return res.status(400).json({ error: "Email is already exists" });
    }
    const hashPass = await bcrypt.hash(password, 10);
    const adminObj = {
      first_Name,
      last_Name,
      email,
      password: hashPass,
      phone_no
    };
    const admin = new Agent(adminObj);
    await admin.save();
    if (admin) {
      return res.status(200).json({ message: "Admin Successfully Created" });
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Server Error" });
  }
};
/**
 * ======================
 * LOGIN CONTROLLER
 * ======================
 */
// export const login = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;
//     const result = await authService.loginAgent(email, password);

//     if (!result.agent.isActive) {
//       throw new AppError("Your account is deactivated. Contact admin.", 403);
//     }

//     // Set refresh token cookie
//     res.cookie("refreshToken", result.refreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });

//     return res.status(200).json({
//       success: true,
//       accessToken: result.accessToken,
//       agent: result.agent,
//     });
//   } catch (error) {
//     next(error);
//   }
// };


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Explicitly include password in query result
    const admin = await Agent.findOne({ email }).select("+password");

    if (!admin) {
      return res.status(400).json({ message: "Invalid details entered" });
    }

    // Log for debugging (can remove later)
    // console.log("Request password:", password);
    // console.log("Agent password (hashed):", admin.password);

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid details entered" });
    }

    const accessToken = jwt.sign(
      { id: admin._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    return res.json({ accessToken });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};



/**
 * ======================
 * REFRESH TOKEN CONTROLLER
 * ======================
 */
// export const refreshTokenHandler = async (req, res, next) => {
//   try {
//     const refreshToken = req.cookies?.refreshToken;
//     if (!refreshToken) {
//       throw new AppError("Refresh token missing", 401);
//     }

//     const { newAccessToken, newRefreshToken } = await authService.refreshAgentTokens(refreshToken);

//     // Set updated refresh token
//     res.cookie("refreshToken", newRefreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });

//     return res.status(200).json({
//       success: true,
//       accessToken: newAccessToken,
//     });
//   } catch (error) {
//     next(new AppError(error.message || "Invalid refresh token", 401));
//   }
// };

/**
 * ======================
 * SEED SUPER ADMIN
 * ======================
 * - One-time setup
 */
// export const seedSuperAdmin = async (req, res, next) => {
//   try {
//     const existingAgentSA = await Agent.findOne({ role: ROLES.SUPERADMIN});

//     const email = (req.body.email || process.env.SUPERADMIN_EMAIL || "").toLowerCase().trim();
//     const password = req.body.password || process.env.SUPERADMIN_PASSWORD;
//     const firstName = req.body.firstName || "Super";
//     const lastName = req.body.lastName || "Admin";

//     if (!email || !password) {
//       throw new AppError("Super Admin email and password are required", 400);
//     }

//     // Check if a SUPERADMIN user already exists
//     const existingUserSA = await User.findOne({ email, role: ROLES.SUPERADMIN });

//     let user = existingUserSA;
//     let agent = existingAgentSA;

//     // Case 1: Both exist → return info
//     if (existingUserSA && existingAgentSA) {
//       return res.status(200).json({
//         message: "Super Admin already exists",
//         email: existingUserSA.email,
//       });
//     }

//     // Case 2: Agent exists, User missing → create User only
//     if (!existingUserSA && existingAgentSA) {
//       user = new User({
//         email: existingAgentSA.email,
//         passwordHash: password,
//         role: ROLES.SUPERADMIN,
//         firstName: existingAgentSA.firstName || firstName,
//         lastName: existingAgentSA.lastName || lastName,
//       });
//       await user.save();

//       const token = jwt.sign(
//         { id: user._id, email: user.email, role: user.role },
//         process.env.ACCESS_TOKEN_SECRET,
//         { expiresIn: "7d" }
//       );

//       return res.status(201).json({
//         message: "Super Admin credentials created for existing profile",
//         email: user.email,
//         token,
//       });
//     }

//     // Case 3: User exists, Agent missing → create Agent profile only
//     if (existingUserSA && !existingAgentSA) {
//       agent = new Agent({
//         firstName: existingUserSA.firstName || firstName,
//         lastName: existingUserSA.lastName || lastName,
//         email: existingUserSA.email,
//         role: ROLES.SUPERADMIN,
//       });
//       await agent.save();

//       return res.status(200).json({
//         message: "Super Admin profile created for existing credentials",
//         email: existingUserSA.email,
//       });
//     }

//     // Case 4: Neither exists → create both
//     user = new User({
//       email,
//       passwordHash: password,
//       role: ROLES.SUPERADMIN,
//       firstName,
//       lastName,
//     });
//     await user.save();

//     agent = new Agent({ firstName, lastName, email, role: ROLES.SUPERADMIN });
//     await agent.save();

//     const token = jwt.sign(
//       { id: user._id, email: user.email, role: user.role },
//       process.env.ACCESS_TOKEN_SECRET,
//       { expiresIn: "7d" }
//     );

//     return res.status(201).json({
//       message: "Super Admin created successfully",
//       email: user.email,
//       token,
//     });
//   } catch (error) {
//     next(new AppError(error.message || "Super Admin seeding failed", 400));
//   }
// };

