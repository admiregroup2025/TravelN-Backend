import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { ROLES } from "../constant.js";

function signToken(user) {
	const payload = { id: user._id.toString(), role: user.role, email: user.email };
	const secret = process.env.JWT_SECRET || "dev_secret";
	const expiresIn = "7d";
	return jwt.sign(payload, secret, { expiresIn });
}

export async function login(req, res) {
	const { email, password } = req.body;
	if (!email || !password) return res.status(400).json({ message: "Email and password required" });
	const user = await User.findOne({ email });
	if (!user) return res.status(401).json({ message: "Invalid credentials" });
	const ok = await user.verifyPassword(password);
	if (!ok) return res.status(401).json({ message: "Invalid credentials" });
	return res.json({ token: signToken(user), role: user.role, name: user.name });
}

export async function seedSuperAdmin(req, res) {
  const seedKey = req.headers["x-seed-key"];
  if ((process.env.SEED_SUPERADMIN_KEY || "") !== seedKey) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const email = process.env.SUPERADMIN_EMAIL || "super@travelnworldz.com";
  const password = process.env.SUPERADMIN_PASSWORD || "superadmin123";
  let user = await User.findOne({email});
  if (!user) {
    user = new User({
      name: "Super Admin",
      email,
      passwordHash: await User.hashPassword(password),
      role: ROLES.SUPERADMIN,
    });
    await user.save();
  }
  return res.json({
    message: "Super admin ready",
    email,
    token: signToken(user),
  });
}


