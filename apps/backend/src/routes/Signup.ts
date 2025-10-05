import { Router } from "express";
import { register, login } from "../service/auth";

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

export default router;
