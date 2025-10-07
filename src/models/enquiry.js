import mongoose from "mongoose";

const { Schema } = mongoose;

const enquirySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    company_name: {
      type: String,
      required: true,
      trim: true,
    },

    countryCode: {
      type: String,
      required: true,
      default: "+91",
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      match: [/^\d{7,12}$/, "Please enter a valid phone number"],
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, "Invalid email format"],
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    your_requirements: {
      type: String,
      trim: true,
      default: "",
    },

    agree: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

export const Enquiry = mongoose.model("Enquiry", enquirySchema);
