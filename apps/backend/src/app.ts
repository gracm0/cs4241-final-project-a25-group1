//app.ts
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

const allowedOrigins = process.env.NODE_ENV === "production" 
  ? [process.env.FRONTEND_URL || "https://photobucket.onrender.com"]
  : ["http://localhost:5173", "http://localhost:3000"];

console.log("CORS allowed origins:", allowedOrigins);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("FRONTEND_URL:", process.env.FRONTEND_URL);

app.use(
  cors({
    origin: true, // Temporarily allow all origins for debugging
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie']
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log("Headers:", req.headers.cookie ? { cookie: req.headers.cookie } : "No cookies");
  next();
});

// Session middleware
console.log("Session config:", {
  nodeEnv: process.env.NODE_ENV,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
});

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

// Debug session route
app.get("/api/debug-session", (req, res) => {
  res.json({
    sessionID: req.sessionID,
    session: req.session,
    cookies: req.headers.cookie,
    userId: req.session?.userId
  });
});

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
