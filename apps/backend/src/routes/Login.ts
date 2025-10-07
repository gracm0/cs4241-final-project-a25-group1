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
    
    // save user info in session
    req.session.userId = user._id.toString();
    console.log("Session after login:", req.session); // DEBUG

    res.json({ message: "Login successful", user: { first: user.first, last: user.last, email: user.email } });
  } catch (err) {
    // If it's an Error instance, get its message
    const message = err instanceof Error ? err.message : "Login failed";
    res.status(500).json({ message });
  }
});

export default router;