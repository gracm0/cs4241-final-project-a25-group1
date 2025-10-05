import { Router } from "express";
import { register, login } from "./service/auth";

const router = Router();

router.post("/signup", async (req, res) => {
  const { first, last, email, password } = req.body;
  console.log("Received signup:", { email, first, last, password });
  try {
    console.log("Attempting to register user:", email);
    const user = await register(email, password);
    return res.status(201).json({ message: "Signup successful", user });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Signup failed";
    const code = message.toLowerCase().includes("exists") ? 409 : 400;
    return res.status(code).json({ message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await login(email, password);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    res.json({ message: "Login successful", user });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    const code =
        message.toLowerCase().includes("not found") || message.toLowerCase().includes("invalid")
            ? 401
            : 500;
    return res.status(code).json({ message });
  }
});

export default router;
