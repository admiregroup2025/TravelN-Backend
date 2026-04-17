import { ROLES } from "../utils/constant.js";
import * as authService from "../services/authService.js";
import Agent from "../models/agent.js";
import User from "../models/User.js";
import { AppError } from "../utils/errorHandler.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import OTP from "../models/otpModel.js";
import sendOTPEmail from "../utils/sendEmail.js";
import { generateAccessToken } from "../utils/jwt.js";


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
    const {
      first_Name,
      last_Name,
      firstName,
      lastName,
      email,
      password,
      phone_no,
      phone,
    } = req.body;

    const firstNameValue = (first_Name || firstName || "").trim();
    const lastNameValue = (last_Name || lastName || "").trim();
    const phoneValue = (phone_no || phone || "").trim();
    const emailValue = (email || "").toLowerCase().trim();

    if (!firstNameValue || !lastNameValue || !emailValue || !password || !phoneValue) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const duplicate = await Agent.findOne({ email: emailValue });
    if (duplicate) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashPass = await bcrypt.hash(password, 10);
    const adminObj = {
      firstName: firstNameValue,
      lastName: lastNameValue,
      email: emailValue,
      password: hashPass,
      phone: phoneValue,
    };
    const admin = new Agent(adminObj);
    await admin.save();
    if (admin) {
      return res.status(200).json({ message: "Admin Successfully Created" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
/**
 * ======================
 * LOGIN CONTROLLER
 * wha
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
  console.log("Response sent to frontend")
  try {
    const { email, password, rememberMe, loginMode } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const admin = await Agent.findOne({ email: normalizedEmail }).select("+password");
    if (!admin) {
      return res.status(400).json({ message: "Invalid details entered" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid details entered" });
    }

    if (loginMode === "superadmin") {
      if (admin.role !== ROLES.SUPERADMIN) {
        return res.status(403).json({ message: "Not a SuperAdmin account" });
      }

    
    const accessToken = generateAccessToken({
          id: admin._id,email: admin.email,role: admin.role,},
        rememberMe
      );

      return res.json({
        success: true,
        accessToken,
        user: {_id: admin._id, email: admin.email,role: admin.role, isProfileComplete: true, },
      });
    }
    // 1. Generate a 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Save OTP to MongoDB (will auto-delete if you set 'expires' in model)
    await OTP.create({ email: admin.email, otp: generatedOtp });

    // 3. LOG THE OTP (In production, use Nodemailer to send this via email)
    sendOTPEmail(admin.email, generatedOtp); // Send OTP email

    // 4. Tell Frontend to switch to OTP UI
    return res.json({ otpSent: true, message: "OTP sent to your email" });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// --- LOGIN STEP 2: VERIFY OTP ---
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp, rememberMe } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();

    // 1. Find the OTP in MongoDB
    const otpRecord = await OTP.findOne({ email: normalizedEmail, otp });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // 2. Get User for Token
    const admin = await Agent.findOne({ email: normalizedEmail });

    if (!admin) return res.status(404).json({ message: "User no longer exists" });
    // 3. Generate the actual Access Token
        const accessToken = generateAccessToken(
        {
          id: admin._id,
          email: admin.email,
          role: admin.role,
        },
        rememberMe 
      );

    // 4. Clean up: Delete OTP after use
    await OTP.deleteOne({ _id: otpRecord._id });

    return res.json({
      accessToken,
      success: true,
      user: {
        _id: admin._id,
        email: admin.email,
        role: admin.role,
        isProfileComplete: admin.isProfileComplete ?? false, // key field
      },
    });

  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const agent = await Agent.findById(req.user.id).select("-password");
    if (!agent) {
      return res.status(404).json({ message: "Profile not found" });
    }
    return res.status(200).json({ user: agent });
  } catch (error) {
    console.error("getProfile error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      photo,
      secondaryEmails,
      companyAddress,
      branchAddresses,
    } = req.body;

    const updates = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (phone) updates.phone = phone;
    if (company) updates.company = company;
    if (photo) updates.photo = photo;
    if (email) updates.email = email.toLowerCase().trim();
    if (Array.isArray(secondaryEmails) && secondaryEmails.length > 0) {
      updates.secondaryEmail = secondaryEmails[0];
    }
    if (companyAddress) updates.companyAddress = companyAddress;
    if (Array.isArray(branchAddresses) && branchAddresses.length > 0) {
      updates.branchAddress = branchAddresses[0];
    }

    const agent = await Agent.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!agent) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.status(200).json({ message: "Profile updated", user: agent });
  } catch (error) {
    console.error("updateProfile error:", error);
    return res.status(500).json({ message: "Server Error" });
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
 * superadmin seeding is a one-time operation to create a default super admin account.
 * This endpoint should be protected and removed or disabled after use to prevent unauthorized access.
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

