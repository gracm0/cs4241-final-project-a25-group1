import { Router } from "express";
import { register, login } from "./service/auth";

const router = Router();

router.post("/signup", async (req, res) => {
  const { first, last, username, password } = req.body;
  console.log("Received signup:", { username, first, last, password });
  try {
    console.log("Attempting to register user:", username);
    const user = await register(username, password);
    res.status(201).json({ message: "Signup successful", user });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Signup failed";
    res.status(400).json({ message });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await login(username, password);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    res.json({ message: "Login successful", user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
export default router;
