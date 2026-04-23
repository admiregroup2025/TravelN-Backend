# Backend Destination API Documentation

## Overview
This API handles CRUD operations for destinations that appear on the TravelNWorld website. Destinations can be either Domestic or International and are managed through the Super Admin dashboard.

## Base URL
```
http://localhost:5000/api/destinations
```

## Models & Fields

### Destination Schema
```javascript
{
  _id: ObjectId,
  name: String (required, unique),
  slug: String (required, unique),
  type: String (enum: ["domestic", "international"]),
  description: String,
  shortDescription: String,
  coverImageUrl: String,
  gallery: [String],
  categories: {
    trending: Boolean,
    exclusive: Boolean,
    weekend: Boolean,
    home: Boolean,
    honeymoon: Boolean
  },
  priceFrom: Number,
  discountedPrice: Number,
  durationDays: Number,
  durationNights: Number,
  cities: [String],
  itinerary: [{ day, title, description, image }],
  inclusions: [String],
  exclusions: [String],
  rating: Number (0-5),
  reviews: Number,
  isPublished: Boolean,
  createdBy: ObjectId (ref: User),
  ownerRole: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Endpoints

### 1. Get All Destinations (with filtering)
**GET** `/api/destinations`

**Query Parameters:**
- `type` (optional): "domestic" or "international"
- `category` (optional): "trending", "exclusive", "weekend", "home", "honeymoon"
- `isPublished` (optional): "true" or "false"
- `limit` (optional, default: 10): Number of results per page
- `skip` (optional, default: 0): Number of results to skip

**Response:**
```json
{
  "message": "Destinations retrieved successfully",
  "data": [
    {
      "_id": "...",
      "name": "Dubai",
      "slug": "dubai",
      "type": "international",
      "shortDescription": "...",
      "coverImageUrl": "...",
      "priceFrom": 55000,
      "discountedPrice": 45000,
      "durationDays": 7,
      "durationNights": 6,
      "rating": 4.5,
      "reviews": 512,
      "categories": { "trending": true, "exclusive": false, ... }
    }
  ],
  "pagination": {
    "total": 50,
    "limit": 10,
    "skip": 0
  }
}
```

---

### 2. Get Destination Cards (for Frontend Display)
**GET** `/api/destinations/cards`

**Query Parameters:**
- `type` (optional): "domestic" or "international"
- `category` (optional): "trending", "exclusive", etc.
- `limit` (optional, default: 8): Number of cards to return

**Response:**
```json
{
  "message": "Destination cards retrieved successfully",
  "data": [
    {
      "_id": "...",
      "name": "Goa",
      "slug": "goa",
      "type": "domestic",
      "shortDescription": "Sun, sand, and nightlife...",
      "coverImageUrl": "...",
      "priceFrom": 21800,
      "durationDays": 5
    }
  ]
}
```

---

### 3. Get Destinations by Type
**GET** `/api/destinations/type/:type`

**Parameters:**
- `type` (required): "domestic" or "international"

**Response:** Same as Get Destination Cards

---

### 4. Get Destination by Slug
**GET** `/api/destinations/slug/:slug`

**Parameters:**
- `slug` (required): URL-friendly slug of destination

**Response:**
```json
{
  "message": "Destination retrieved successfully",
  "data": {
    "_id": "...",
    "name": "Dubai",
    "slug": "dubai",
    "type": "international",
    "description": "Full description...",
    "shortDescription": "Short description...",
    "coverImageUrl": "...",
    "gallery": ["url1", "url2", "..."],
    "categories": { "trending": true, "exclusive": true, ... },
    "priceFrom": 55000,
    "discountedPrice": 45000,
    "durationDays": 7,
    "durationNights": 6,
    "cities": ["Dubai", "Abu Dhabi"],
    "itinerary": [
      {
        "day": 1,
        "title": "Arrival",
        "description": "...",
        "image": "..."
      }
    ],
    "inclusions": ["Flight", "Hotel", "..."],
    "exclusions": ["Visa", "..."],
    "rating": 4.5,
    "reviews": 512,
    "isPublished": true,
    "createdBy": { "_id": "...", "name": "Admin Name", "email": "..." },
    "createdAt": "2024-01-15T...",
    "updatedAt": "2024-01-15T..."
  }
}
```

---

### 5. Get Destination by ID
**GET** `/api/destinations/:id`

**Parameters:**
- `id` (required): MongoDB ObjectId

**Response:** Same as Get by Slug

---

### 6. Create Destination (Admin Only)
**POST** `/api/destinations`

**Authentication:** Required (Bearer Token)

**Authorization:** ADMIN, SUPERADMIN roles only

**Request Body:**
```json
{
  "name": "Bali",
  "type": "international",
  "description": "Full description...",
  "shortDescription": "Short description...",
  "coverImageUrl": "https://...",
  "gallery": ["https://...", "https://..."],
  "categories": {
    "trending": true,
    "exclusive": false,
    "weekend": false,
    "home": false,
    "honeymoon": true
  },
  "priceFrom": 55000,
  "discountedPrice": 45000,
  "durationDays": 7,
  "durationNights": 6,
  "cities": ["Denpasar", "Ubud", "Kuta"],
  "itinerary": [
    {
      "day": 1,
      "title": "Arrival in Bali",
      "description": "...",
      "image": "https://..."
    }
  ],
  "inclusions": ["Flight", "Accommodation", "..."],
  "exclusions": ["Visa", "..."],
  "rating": 0,
  "reviews": 0
}
```

**Response:**
```json
{
  "message": "Destination created successfully",
  "data": { "...full destination object..." }
}
```

---

### 7. Update Destination (Admin Only)
**PUT** `/api/destinations/:id`

**Authentication:** Required (Bearer Token)

**Authorization:** ADMIN, SUPERADMIN roles only

**Request Body:** (All fields optional)
```json
{
  "name": "Updated Name",
  "categories": { "trending": false, "exclusive": true },
  "priceFrom": 60000,
  "isPublished": true,
  "...any other field..."
}
```

**Response:**
```json
{
  "message": "Destination updated successfully",
  "data": { "...updated destination object..." }
}
```

---

### 8. Delete Destination (Admin Only)
**DELETE** `/api/destinations/:id`

**Authentication:** Required (Bearer Token)

**Authorization:** ADMIN, SUPERADMIN roles only

**Response:**
```json
{
  "message": "Destination deleted successfully",
  "data": { "...deleted destination object..." }
}
```

---

## Example Usage

### Frontend: Fetch Domestic Destinations
```javascript
import { getJson } from "../utils/api";

useEffect(() => {
  getJson("/api/destinations/type/domestic")
    .then((response) => {
      const destinations = response.data.map((dest) => ({
        title: dest.name,
        description: dest.shortDescription,
        image: dest.coverImageUrl,
        slug: dest.slug,
      }));
      setDestinations(destinations);
    })
    .catch((err) => console.error(err));
}, []);
```

### Frontend: Fetch Trending Destinations
```javascript
getJson("/api/destinations/cards?category=trending&limit=8")
  .then((response) => setTrendingDestinations(response.data));
```

### Super Admin: Create New Destination
```javascript
const createDestination = async (destinationData) => {
  const token = localStorage.getItem("admin_token");
  const response = await fetch("http://localhost:5000/api/destinations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(destinationData),
  });
  return response.json();
};
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "name and type (domestic/international) are required"
}
```

### 409 Conflict
```json
{
  "message": "Destination with this name already exists"
}
```

### 404 Not Found
```json
{
  "message": "Destination not found"
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized access"
}
```

### 500 Internal Server Error
```json
{
  "message": "Error creating destination",
  "error": "error details..."
}
```

---

## Integration Notes

1. **Slug Generation**: Slugs are automatically generated from the destination name using slugify
2. **Image Handling**: Supports both Cloudinary URLs and external image URLs
3. **Categories**: Multiple categories can be selected for each destination
4. **Publishing**: Set `isPublished: false` to hide a destination from frontend
5. **Timestamps**: `createdAt` and `updatedAt` are automatically managed
6. **Creator Info**: `createdBy` and `ownerRole` are automatically set from authenticated user
