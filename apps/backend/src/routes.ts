import { Router } from "express";
import { register, login } from "./service/auth";

const router = Router();

router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await register(email, password);
    return res.status(201).json({ message: "Signup successful", user });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Signup failed";
    const code = message.toLowerCase().includes("exists") ? 409 : 400;
    return res.status(code).json({ message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await login(email, password);
    return res.json({ message: "Login successful", user });
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
