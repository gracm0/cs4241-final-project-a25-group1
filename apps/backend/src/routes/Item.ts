import { Router } from "express";
import { getItems, saveItem, deleteItem, updateManyItems } from "../controllers/bucketController";

const router = Router();

// assumes calls include required parameters

// GET /item-action?email={...}&bucketNumber={...}&doneQuery={...}
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

/* POST /item-action
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

// DELETE /item-action?bucketNumber={...}&title={...}
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

// POST /item-action/update-bucket-title
router.post("/update-bucket-title", async (req, res) => {
  try {
    const { email, bucketNumber, bucketTitle } = req.body;
    const result = await updateManyItems(email as string, Number(bucketNumber), bucketTitle as string);
    res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: "Failed to update bucket title" });
  }
});

export default router;
