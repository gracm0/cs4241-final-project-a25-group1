import { Router } from "express";
import { getCurrentUser } from "../service/authMiddleware";

const router = Router();

router.get("/", getCurrentUser, async (req, res) => {
  const user = (req as any).currentUser;
  res.json({ user });
});

export default router;