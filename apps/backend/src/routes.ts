import { Router } from "express";
import { register, login } from "./service/auth";

const router = Router();

router.post("/api/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await register(email, password);
    res.status(201).json({ message: "Signup successful", user });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Signup failed";
    res.status(400).json({ message });
  }
});

router.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await login(email, password);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    // You can add JWT/token logic here if needed
    res.json({ message: "Login successful", user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
export default router;
