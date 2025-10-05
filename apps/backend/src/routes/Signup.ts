import { Router } from "express";
import { register, login } from "../service/auth";

const router = Router();

router.post("/", async (req, res) => {
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

export default router;
