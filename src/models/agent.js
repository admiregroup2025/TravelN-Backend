// models/Agent.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { ROLES } from "../utils/constant.js";

const { Schema } = mongoose;
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "10", 10);

const addressSchema = new Schema(
  {
    houseNo: String,
    street: String,
    area: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  },
  { _id: false }
);

const agentSchema = new Schema(
  {
    firstName: String,
    lastName: String,
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Keep optional here since credentials will live in User model
    password: { type: String, required: true, select: false },
    phone: String,
    role: { type: String, enum: Object.values(ROLES), default: ROLES.AGENT },
    isActive: { type: Boolean, default: true },
    company: String,
    registeredEmail: String,
    secondaryEmail: String,
    companyAddress: { type: addressSchema },
    branchAddress: { type: addressSchema },
    photo: String,
    profileCompletedAt: Date,
  },
  { timestamps: true }
);

// Virtual for profile completeness
agentSchema.virtual("isProfileComplete").get(function () {
  return !!(
    this.firstName &&
    this.lastName &&
    this.phone &&
    this.company &&
    this.companyAddress?.city &&
    this.companyAddress?.postalCode
  );
});

// Pre-save hook to hash password
agentSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const looksHashed = typeof this.password === "string" && /^\$2[aby]\$\d{2}\$/.test(this.password);
    if (!looksHashed) {
      this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
    }
  }
  if (!this.registeredEmail) this.registeredEmail = this.email;
  if (this.isProfileComplete && !this.profileCompletedAt) this.profileCompletedAt = new Date();
  next();
});

// Instance method to compare password
agentSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Clean JSON output
agentSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

// Provide a static helper to hash passwords to align with service usage
agentSchema.statics.hashPassword = async function (password) {
  return bcrypt.hash(password, SALT_ROUNDS);
};

// Avoid OverwriteModelError in dev/hot-reload by reusing compiled model if available
const Agent = mongoose.models.Agent || mongoose.model("Agent", agentSchema);
export default Agent;
