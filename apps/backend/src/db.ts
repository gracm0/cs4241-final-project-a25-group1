import mongoose from "mongoose";

async function connectDB() {
    const { MONGO_URI, MONGO_DB } = process.env;

    if (!MONGO_URI) {
        throw new Error("Missing MONGO_URI in environment");
    }

    try {
        await mongoose.connect(MONGO_URI, { dbName: MONGO_DB || undefined });
        console.log("✅ MongoDB connected");
    } catch (err) {
        console.error("❌ Failed to connect to MongoDB", err);
        process.exit(1);
    }
}

export default connectDB;
