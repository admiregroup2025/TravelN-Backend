import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { ROLES } from "../utils/constant.js";



const addressSchema = new mongoose.Schema(
  {
    house: { type: String, default: "" },
    street: { type: String, default: "" },
    area: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    zip: { type: String, default: "" },
    country: { type: String, default: "" },
  },
  { _id: false }
)


const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,

    },
    last_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    phone_no: {
      type: String,
      required: true,
      match: [/^\+?[0-9]{10,15}$/, "Please enter a valid phone number"], // optional validation
    },

	company: { type: String, trim: true, default: "" },
    secondaryEmails: { type: [String], default: [] },

	 companyAddress: { type: addressSchema, default: () => ({}) },
    branchAddresses: { type: [addressSchema], default: [] },
    photo: { type: String, default: "" },          // Cloudinary URL
    photoPublicId: { type: String, default: "" }, // to delete old image when updating



    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
      index: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = async function (password) {
  const saltRounds = parseInt(process.env.SALT_ROUNDS, 10);
  return bcrypt.hash(password, saltRounds);
};

export const User = mongoose.model("User", userSchema);
