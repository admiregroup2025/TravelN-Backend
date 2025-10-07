import { Itinerary } from "../models/Itinerary.js";
import {
  ITINERARY_TYPES,
  PUBLIC_CARD_FIELDS,
  ROLES,
} from "../utils/constant.js";

export async function createItinerary(req, res) {
  try {
    const {
      title,
      slug,
      type,
      country,
      city,
      shortDescription,
      coverImageUrl,
      gallery,
      priceFrom,
      durationDays,
      inclusions,
      exclusions,
      dayPlans,
    } = req.body;
    if (!title || !slug || !type)
      return res
        .status(400)
        .json({ message: "title, slug, type are required" });
    const exists = await Itinerary.findOne({ slug });
    if (exists) return res.status(409).json({ message: "Slug already exists" });
    const doc = new Itinerary({
      title,
      slug,
      type,
      country,
      city,
      shortDescription,
      coverImageUrl,
      gallery,
      priceFrom,
      durationDays,
      inclusions,
      exclusions,
      dayPlans,
      createdBy: req.user?.id,
      ownerRole: req.user?.role,
    });
    await doc.save();
    return res.status(201).json(doc);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function listCards(req, res) {
  try {
    const { type } = req.query;
    const filter = {};
    if (type) filter.type = type;
    const docs = await Itinerary.find(filter)
      .select(PUBLIC_CARD_FIELDS.join(" "))
      .sort({ createdAt: -1 })
      .limit(100);
    return res.json(docs);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getByCountry(req, res) {
  try {
    const { country } = req.params;
    const normalized = country.replace(/\s+/g, "-").toLowerCase();
    const docs = await Itinerary.find({
      country: new RegExp(`^${normalized}$`, "i"),
      type: ITINERARY_TYPES.INTERNATIONAL,
      isPublished: true,
    }).sort({ createdAt: -1 });
    return res.json(docs);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getBySlug(req, res) {
  try {
    const { slug } = req.params;
    const doc = await Itinerary.findOne({ slug });
    if (!doc) return res.status(404).json({ message: "Not found" });
    return res.json(doc);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}


export async function updateItinerary(req, res) {
  try {
    const { slug } = req.params;
    const updated = await Itinerary.findOneAndUpdate({ slug }, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Not found" });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

// Delete itinerary
export async function deleteItinerary(req, res) {
  try {
    const { slug } = req.params;
    const deleted = await Itinerary.findOneAndDelete({ slug });
    if (!deleted) return res.status(404).json({ message: "Not found" });
    return res.json({ message: "Itinerary deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

