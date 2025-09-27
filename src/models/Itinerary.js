// models/Itinerary.js
import mongoose from "mongoose";
import slugify from "slugify";

const DaySchema = new mongoose.Schema({
  dayNumber: { type: Number, required: true },
  title: { type: String, default: "" },
  details: { type: String, default: "" },
  activities: { type: String, default: "" },
  meals: { type: String, default: "" },
  stay: { type: String, default: "" }
});

const ItinerarySchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // title
    destinationName: { type: String, default: "" }, // e.g. "Dubai, UAE"
    // slug: { type: String, required: true, unique: true, index: true },
    type: { type: String, enum: ["domestic", "international"], default: "domestic" },
    destinations: [{ type: String }], // simple list of strings
    days: [DaySchema],
    numberOfDays: { type: Number, default: 0 },

    description: { type: String, default: "" },
    inclusions: { type: String, default: "" },
    additionalInclusions: { type: String, default: "" },
    exclusions: { type: String, default: "" },
    terms: { type: String, default: "" },
    paymentPolicy: { type: String, default: "" },

    price: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    finalPrice: { type: Number, default: 0 },

    images: [{ type: String }], // URLs (served from /uploads)
    agentNotes: { type: String, default: "" },

    published: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Before saving, make a slug and compute finalPrice and numberOfDays
ItinerarySchema.pre("validate", function (next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  this.numberOfDays = Array.isArray(this.days) ? this.days.length : 0;

  const p = Number(this.price || 0);
  const d = Number(this.discount || 0);
  this.finalPrice = d > 0 && d <= 100 ? Math.max(0, p - (p * d) / 100) : Math.max(0, p - d);

  next();
});

const ItineraryModel = mongoose.models?.Itinerary || mongoose.model("Itinerary", ItinerarySchema);

export default ItineraryModel;
