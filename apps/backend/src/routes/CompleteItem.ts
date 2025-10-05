import { Router } from "express";
import { getItems, saveItem, deleteItem } from "../controllers/bucketController";

const router = Router();

router.get("/", getItems);
router.post("/", saveItem);
router.delete("/:id", deleteItem);

export default router;