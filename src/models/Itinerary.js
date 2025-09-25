import mongoose from "mongoose";
import { ITINERARY_TYPES } from "../constant.js";

const dayPlanSchema = new mongoose.Schema(
	{
		day: { type: Number, required: true },
		title: { type: String },
		description: { type: String },
		images: [{ type: String }],
	},
	{ _id: false }
);

const itinerarySchema = new mongoose.Schema(
	{
		title: { type: String, required: true, trim: true },
		slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
		type: { type: String, enum: Object.values(ITINERARY_TYPES), required: true, index: true },
		country: { type: String, trim: true, index: true },
		city: { type: String, trim: true },
		shortDescription: { type: String, trim: true },
		coverImageUrl: { type: String },
		gallery: [{ type: String }],
		priceFrom: { type: Number, default: 0 },
		durationDays: { type: Number, default: 0 },
		inclusions: [{ type: String }],
		exclusions: [{ type: String }],
		dayPlans: [dayPlanSchema],
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
		ownerRole: { type: String },
		isPublished: { type: Boolean, default: true },
	},
	{ timestamps: true }
);

export const Itinerary = mongoose.model("Itinerary", itinerarySchema);


