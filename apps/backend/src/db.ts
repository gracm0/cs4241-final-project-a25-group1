import mongoose from "mongoose";
import "dotenv/config";

async function connectDB() {
  console.log("Connecting to MongoDB...");
    const { DB_USER, DB_PASS, MONGO_HOST, MONGO_DB } = process.env;

    if (!DB_USER || !DB_PASS || !MONGO_HOST || !MONGO_DB) {
        throw new Error("Missing required environment variables");
    }

    const uri = `mongodb+srv://${DB_USER}:${DB_PASS}@${MONGO_HOST}/?retryWrites=true&w=majority&appName=Cluster0`;
    
  try {
    await mongoose.connect(uri, { dbName: MONGO_DB });
    console.log(`Connected to MongoDB database: ${MONGO_DB}`);
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  }
}

export default connectDB;

// TEMP TEST
// connectDB()
//   .then(() => {
//     console.log("DB connection test completed. Exiting...");
//     process.exit(0);
//   })
//   .catch((err) => {
//     console.error(err);
//     process.exit(1);
//   });