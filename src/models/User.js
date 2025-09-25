import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { ROLES } from "../constant.js";

const userSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		email: { type: String, required: true, unique: true, lowercase: true, trim: true },
		passwordHash: { type: String, required: true },
		role: { type: String, enum: Object.values(ROLES), default: ROLES.USER, index: true },
		isActive: { type: Boolean, default: true },
	},
	{ timestamps: true }
);

userSchema.methods.verifyPassword = async function (passwordPlain) {
	return bcrypt.compare(passwordPlain, this.passwordHash);
};

userSchema.statics.hashPassword = async function (passwordPlain) {
	const saltRounds = 10;
	return bcrypt.hash(passwordPlain, saltRounds);
};

export const User = mongoose.model("User", userSchema);


