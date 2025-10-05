import { Router, Request, Response } from "express";
import { getItems, saveItem, deleteItem } from "../controllers/bucketController";

const router = Router();

// assumes calls include required parameters

// GET /complete-item
// parameters: email, bucketNumber, doneQuery (true/false)
router.get("/", async (req, res) => {
  try {
    const { email, bucketNumber, doneQuery } = req.query;
    const done = doneQuery === "true" ? true : false; // convert to boolean
    const items = await getItems(email as string, Number(bucketNumber), done);

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

/* POST /complete-item
  parameters: 
  email: string;
  bucketNumber: number;
  bucketTitle?: string;
  title: string;
  desc: string;
  location: string;
  priority: "high" | "med" | "low" | "";
  done: boolean;
  completedAt?: Date; // if done is true
  image?: string; // if done is true
}
*/
router.post("/", async (req, res) => {
  try {
    const item = await saveItem(req.body);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to save item" });
  }
});

// DELETE /complete-item
// parameters: bucketNumber, title
router.delete("/", async (req, res) => {
  try {
    const { bucketNumber, title } = req.query
    const result = await deleteItem(Number(bucketNumber), title as string);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to delete item" });
  }
});

export default router;