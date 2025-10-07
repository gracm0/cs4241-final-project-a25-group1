import { Router } from "express";

const router = Router();

router.post("/", (req, res) => {
  // Destroy the session on logout
  req.session.destroy((err) => {
    if (err) {
      console.error("Failed to destroy session:", err);
      return res.status(500).json({ message: "Logout failed" });
    }

    // Clear the session cookie
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  });
});

export default router;
