import { Router } from "express";
import { login } from "../service/auth";

const router = Router();

router.post("/", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await login(email, password);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // save user info in session and force session creation
    req.session.userId = user._id.toString();
    
    // Explicitly force session initialization by marking it as modified
    req.session.isLoggedIn = true;
    
    console.log("Session after login:", req.session); // DEBUG
    console.log("Session ID:", req.sessionID); // DEBUG

    // Ensure session is saved before responding
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ message: "Session save failed" });
      }
      console.log("Session successfully saved, ID:", req.sessionID);
      
      // Add debugging for response headers
      console.log("Response headers being set:", res.getHeaders());
      
      // Force set the cookie header explicitly for debugging
      res.setHeader('Set-Cookie', [
        `connect.sid=${req.sessionID}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=604800`
      ]);
      
      res.json({
        message: "Login successful",
        user: { first: user.first, last: user.last, email: user.email },
        sessionId: req.sessionID, // Include session ID in response for debugging
      });
    });
  } catch (err) {
    // If it's an Error instance, get its message
    const message = err instanceof Error ? err.message : "Login failed";
    res.status(500).json({ message });
  }
});

export default router;
