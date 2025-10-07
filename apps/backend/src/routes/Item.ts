import { Router } from "express";
import { getItems, getAllDoneItems, saveItem, deleteItem, updateManyItems } from "../controllers/bucketController";

const router = Router();

// assumes calls include required parameters

// GET /item-action?email={...}&bucketNumber={...}&doneQuery={...}
// parameters: email, bucketNumber, doneQuery (true/false)
router.get("/", async (req, res) => {
  try {
    const { email, bucketNumber} = req.query;
    const items = await getItems(email as string, Number(bucketNumber));
    // Ensure each item has an 'id' property for React key
    const itemsWithId = items.map((item: any) => ({
      ...item.toObject(),
      id: item._id.toString(),
    }));
    res.json(itemsWithId);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

// GET /item-action?email={...}
// parameters: email
// done: true
router.get("/", async (req, res) => {
  try {
    const { email } = req.query;
    const items = await getAllDoneItems(email as string);

    console.log("Fetched items:", items); // <-- debug

    if (!Array.isArray(items)) {
      console.error("getAllDoneItems did not return an array");
      return res.status(500).json({ error: "Invalid return from getAllDoneItems" });
    }

    const itemsWithId = items.map((item: any) => ({
      ...item.toObject(),
      id: item._id.toString(),
    }));
    res.json(itemsWithId);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch completed items" });
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
  const { email, bucketNumber, id } = req.query;
  const result = await deleteItem(email as string, Number(bucketNumber), id as string);
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
