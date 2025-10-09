import { Router } from "express";
import {
  getAllItems,
  getAllDoneItems,
  saveItem,
  deleteItem,
  deleteAllItemsInBucket,
} from "../controllers/bucketItemController";

const router = Router();

// assumes calls include required parameters

// Get all items from a bucket
// GET /item-action?bucketId={...}
// Optional query: done=true to filter completed items
router.get("/", async (req, res) => {
  try {
    const { bucketId, done } = req.query;

    if (!bucketId || typeof bucketId !== "string") {
      return res.status(400).json({ error: "bucketId is required" });
    }

    let items;
    if (done === "true") {
      items = await getAllDoneItems(bucketId);
    } else {
      items = await getAllItems(bucketId);
    }

    const itemsWithId = items.map((item: any) => ({
      ...item.toObject(),
      id: item._id.toString(),
    }));

    res.json(itemsWithId);
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

/* Creates or updates a bucket item

  POST /item-action

  body: 
  _id
  bucketId: string;
  title: string;
  desc: string;
  location: string;
  priority: "high" | "med" | "low" | "";
  done: boolean;
  completedAt?: Date;
  image?: string;
*/
router.post("/", async (req, res) => {
  try {
    const item = await saveItem(req.body);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to save item" });
  }
});

// Delete a single bucket item by _id and bucketId
// DELETE /item-action?id={...}&bucketId={...}
router.delete("/", async (req, res) => {
  try {
    const { id, bucketId} = req.query;

    if (!id || !bucketId || typeof bucketId !== "string") {
      return res.status(400).json({ error: "id and bucketId are required" });
    }

    const result = await deleteItem(bucketId, id as string);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to delete item" });
  }
});

// Delete all items in a specific bucket
// DELETE /item-action/reset-bucket?bucketId={...}
router.delete("/reset-bucket", async (req, res) => {
  try {
    const { bucketId } = req.query;

    if (!bucketId || typeof bucketId !== "string") {
      return res.status(400).json({ error: "bucketId is required" });
    }

    const result = await deleteAllItemsInBucket(bucketId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to delete all items" });
  }
});

export default router;
