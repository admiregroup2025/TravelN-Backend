import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { ROLES } from "../utils/constant.js";

const userSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		email: { type: String, required: true, unique: true, lowercase: true, trim: true },
		password: { type: String, required: true, select: false },
		role: { type: String, enum: Object.values(ROLES), default: ROLES.USER, index: true },
		isActive: { type: Boolean, default: true },
	},
	{ timestamps: true }
);

userSchema.methods.comparePassword = async function (password) {
	return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = async function (password) {
	const saltRounds = parseInt(process.env.SALT_ROUNDS, 10)
	return bcrypt.hash(password, saltRounds);
};

export const User = mongoose.model("User", userSchema);