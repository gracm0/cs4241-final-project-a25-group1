import { Router } from "express";
import { register, login } from "../service/auth";

const router = Router();

router.post("/complete-item", async (req, res) => {
  const { itemId } = req.body; 
});

export default router;