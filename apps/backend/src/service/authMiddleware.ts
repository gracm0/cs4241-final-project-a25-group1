// authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import User from "../models/User";

export async function getCurrentUser(req: Request, res: Response, next: NextFunction) {
  try {
    console.log("Session data:", req.session);
    console.log("Session ID:", req.sessionID);
    console.log("User ID from session:", req.session?.userId);
    
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ message: "Not logged in" });

    const user = await User.findById(userId).select("first last email bucketOrder");
    if (!user) return res.status(404).json({ message: "User not found" });

    (req as any).currentUser = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
}