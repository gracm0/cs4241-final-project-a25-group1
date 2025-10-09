import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import session from "express-session";
import MongoStore from "connect-mongo";
import routes from "./routes";
import uploadRoutes from "./routes/Upload";
import connectDB from "./db";

const app = express();

// Fix CORS: allow frontend origin and handle preflight requests
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // allow cookies
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.MONGO_HOST}/?retryWrites=true&w=majority&appName=Cluster0`,
      collectionName: "sessions",
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

// API routes
app.use("/api", routes);
app.use("/api/upload", uploadRoutes);

// Serve frontend build (apps/frontend/dist)
const clientDistPath = path.resolve(__dirname, "../../frontend/dist");
console.log("Serving static from:", clientDistPath);

app.use(express.static(clientDistPath));

// Catch-all: send index.html for non-API routes
app.get(/^\/(?!api).*/, (_req, res) => {
  res.sendFile(path.join(clientDistPath, "index.html"));
});

async function startServer() {
  try {
    await connectDB();
    const port = process.env.PORT ? Number(process.env.PORT) : 5050; // Use 5050 for dev
    app.listen(port, () =>
      console.log(`Server running on http://localhost:${port}`)
    );
  } catch (err) {
    console.error("Failed to start server", err);
  }
}

startServer();
