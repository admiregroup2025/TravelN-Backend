import mongoose from "mongoose";

export async function connectToDatabase() {
	const mongoUri = process.env.MONGO_URI ;
	console.log(mongoUri)
	try {
		await mongoose.connect(mongoUri, {
			serverSelectionTimeoutMS: 8000,
		});
		console.log("✅ Connected to MongoDB");
		return mongoose.connection;
	} catch (error) {
		console.error("❌ MongoDB connection error:", error.message);
		throw error;
	}
}


