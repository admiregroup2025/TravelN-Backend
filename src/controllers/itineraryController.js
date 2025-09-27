import ItineraryModel from "../models/Itinerary.js";


// Create Itinerary - simplified for frontend form
export const createItinerary = async (req, res) => {
  try {
    const {
      title,
      destinationName,
      itineraryType,
      destinations,
	  
      days,
      inclusions,
      additionalInclusions,
      exclusions,
      terms,
      paymentPolicy,
      price,
      discount,
      images,
      agentNotes,
      published = false
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: "Title is required." 
      });
    }

    const payload = {
      name: title.trim(),
      destinationName: destinationName || (destinations && destinations[0]) || "",
      type: itineraryType === "international" ? "international" : "domestic",
      destinations: Array.isArray(destinations) ? destinations.filter(Boolean) : [],
      days: Array.isArray(days) ? days : [],
      numberOfDays: Array.isArray(days) ? days.length : 0,
      inclusions: inclusions || "",
      additionalInclusions: additionalInclusions || "",
      exclusions: exclusions || "",
      terms: terms || "",
      paymentPolicy: paymentPolicy || "",
      price: Number(price) || 0,
      discount: Number(discount) || 0,
      images: Array.isArray(images) ? images.filter(Boolean) : [],
      agentNotes: agentNotes || "",
      published: !!published
    };

    const newItinerary = new ItineraryModel(payload);
    const saved = await newItinerary.save();

    return res.status(201).json({
      success: true,
      message: "Itinerary created successfully.",
      data: saved,
    });
  } catch (err) {
    console.error("Create Itinerary Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create itinerary.",
      error: err.message,
    });
  }
};

export const getAllItinerary = async (req, res) => {
  try {
    const itineraries = await ItineraryModel
      .find()
      .sort({ createdAt: -1 }); //find the itineraries according to the latest created date
    console.log('Fetched Itineraries:', itineraries);
    return res.status(200).json({
      success: true,
      data: itineraries,
    });
  } catch (error) {
    console.error('Get All Itineraries Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch itineraries.',
      error: error.message,
    });
  }
};


export const getItineraryById = async (req, res) => {
  try {
    const { id } = req.params;
    const itinerary = await ItineraryModel.findById(id);

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: itinerary,
    });
  } catch (error) {
    console.error('Get Itinerary By ID Error:', error);
    return res.status(500).json({
      success: false,
      msg: 'Failed to fetch itinerary.',
      error: error.message,
    });
  }
};

export const deleteItinerary = async (req, res) => {
  console.log('Delete Itinerary Request:', req.params);
  try {
    const { id } = req.params;
    const deletedItinerary = await ItineraryModel.findByIdAndDelete(id);

    if (!deletedItinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found.',
      });
    }

    return res.status(200).json({
      success: true,
      msg: 'Itinerary deleted successfully.',
    });
  } catch (error) {
    console.error('Delete Itinerary Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete itinerary.',
      error: error.message,
    });
  }
};


// Updating the itinerary

export const updateItinerary = async (req, res) => {
  try {
    const parseJSON = (data) => {
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    };

    const {
      title,
      itinerary_visibility,
      itinerary_type,
      cancellation_policy,
      classification,
      days_information,
      destination_detail,
      destination_images,
      destination_thumbnails,
      duration,
      exclusion,
      hotel_as_per_category,
      inclusion,
      itinerary_theme,
      payment_mode,
      pricing,
      selected_destination_id,
      terms_and_conditions,
    } = req.body;

    // --- Parse inputs the same way as creation ---
    const parsedClassification = parseJSON(classification);
    const parsedDaysInformation = parseJSON(days_information);
    const parsedDestinationDetail = parseJSON(destination_detail);
    const parsedDestinationImages = parseJSON(destination_images);
    const parsedDestinationThumbnails = parseJSON(destination_thumbnails);
    const parsedItineraryTheme = parseJSON(itinerary_theme);
    const parsedPricing = parseJSON(pricing);

    // --- Validate pricing ---
    let finalPricing;
    if (typeof parsedPricing === 'string') {
      if (parsedPricing !== 'As per the destination') {
        return res.status(400).json({
          success: false,
          message: "Invalid pricing format. Must be 'As per the destination' or pricing object.",
        });
      }
      finalPricing = parsedPricing;
    } else if (
      typeof parsedPricing === 'object' &&
      parsedPricing !== null &&
      typeof parsedPricing.standard_price === 'number' &&
      typeof parsedPricing.discounted_price === 'number'
    ) {
      finalPricing = parsedPricing;
    } else {
      return res.status(400).json({
        success: false,
        message:
          'Invalid pricing object. Must contain standard_price and discounted_price as numbers.',
      });
    }

    // --- Handle video update ---
    const videoPath = req.file?.path || undefined; // only update if new file exists

    const updateFields = {
      title,
      itinerary_visibility,
      itinerary_type,
      cancellation_policy,
      classification: parsedClassification,
      days_information: parsedDaysInformation,
      destination_detail: parsedDestinationDetail,
      destination_images: Array.isArray(parsedDestinationImages)
        ? parsedDestinationImages.map((image) => image?.url || image)
        : [],
      destination_thumbnails: Array.isArray(parsedDestinationThumbnails)
        ? parsedDestinationThumbnails.map((image) => image?.url || image)
        : [],
      duration,
      exclusion,
      hotel_as_per_category,
      inclusion,
      itinerary_theme: parsedItineraryTheme,
      payment_mode,
      pricing: finalPricing,
      selected_destination: selected_destination_id,
      terms_and_conditions,
    };

    if (videoPath) {
      updateFields.destination_video = videoPath;
    }

    const updatedItinerary = await ItineraryModel.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
    });

    if (!updatedItinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Itinerary updated successfully.',
      data: updatedItinerary,
    });
  } catch (error) {
    console.error('Update Itinerary Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update itinerary.',
      error: error.message,
    });
  }
};

// Get itinerary cards for public display
export const listCards = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { published: true };
    
    if (type && (type === 'domestic' || type === 'international')) {
      filter.type = type;
    }

    const itineraries = await ItineraryModel
      .find(filter)
      .select('name slug destinationName type images price finalPrice numberOfDays description')
      .sort({ createdAt: -1 })
      .limit(20);

    return res.status(200).json({
      success: true,
      data: itineraries,
    });
  } catch (error) {
    console.error('List Cards Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch itinerary cards.',
      error: error.message,
    });
  }
};

// Get itineraries by country
export const getByCountry = async (req, res) => {
  try {
    const { country } = req.params;
    
    const itineraries = await ItineraryModel
      .find({ 
        published: true,
        type: 'international',
        $or: [
          { destinationName: { $regex: country, $options: 'i' } },
          { destinations: { $regex: country, $options: 'i' } }
        ]
      })
      .select('name slug destinationName type images price finalPrice numberOfDays description')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: itineraries,
    });
  } catch (error) {
    console.error('Get By Country Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch itineraries by country.',
      error: error.message,
    });
  }
};

// Get itinerary by slug
export const getBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const itinerary = await ItineraryModel.findOne({ 
      slug,
      published: true 
    });

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: itinerary,
    });
  } catch (error) {
    console.error('Get By Slug Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch itinerary.',
      error: error.message,
    });
  }
};

// Toggle public/private status
export const togglePublic = async (req, res) => {
  try {
    const { id } = req.params;
    const { published } = req.body;

    const itinerary = await ItineraryModel.findByIdAndUpdate(
      id,
      { published: !!published },
      { new: true }
    );

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Itinerary ${itinerary.published ? 'published' : 'unpublished'} successfully.`,
      data: { published: itinerary.published },
    });
  } catch (error) {
    console.error('Toggle Public Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle itinerary status.',
      error: error.message,
    });
  }
};
