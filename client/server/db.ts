import mongoose from "mongoose";

async function connectDB() {
    const { DB_USER, DB_PASS, MONGO_HOST, MONGO_PORT, MONGO_DB } = process.env;

    if (!DB_USER || !DB_PASS || !MONGO_HOST || !MONGO_PORT || !MONGO_DB) {
        throw new Error("Missing required environment variables");
    }

    const uri = `mongodb+srv://${DB_USER}:${DB_PASS}@${MONGO_HOST}/?retryWrites=true&w=majority&appName=Cluster0`;
    
  try {
    await mongoose.connect(uri, { dbName: MONGO_DB });
    console.log("Connected to users collection");
  } catch (err) {
    console.error("Failed to connect to users collection", err);
    process.exit(1);
  }
}

export default connectDB;