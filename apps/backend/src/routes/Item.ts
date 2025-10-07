import { Router } from "express";
import { getItems, getAllDoneItems, saveItem, deleteItem, updateManyItems, getBucketTitle, getAllBucketTitles } from "../controllers/bucketController";

const router = Router();

// assumes calls include required parameters

// GET /item-action?email={...}&bucketNumber={...}
// GET /item-action?email={...}&done=true (for completed items)
router.get("/", async (req, res) => {
  try {
    const { email, bucketNumber, done } = req.query;
    
    if (done === 'true') {
      // Fetch all completed items for the user
      const items = await getAllDoneItems(email as string);
      
      console.log("Fetched completed items:", items); // <-- debug

      if (!Array.isArray(items)) {
        console.error("getAllDoneItems did not return an array");
        return res.status(500).json({ error: "Invalid return from getAllDoneItems" });
      }

      const itemsWithId = items.map((item: any) => ({
        ...item.toObject(),
        id: item._id.toString(),
      }));
      return res.json(itemsWithId);
    } else {
      // Fetch items for specific bucket
      const items = await getItems(email as string, Number(bucketNumber));
      // Ensure each item has an 'id' property for React key
      const itemsWithId = items.map((item: any) => ({
        ...item.toObject(),
        id: item._id.toString(),
      }));
      return res.json(itemsWithId);
    }
  } catch (err) {
    console.error("Error fetching items:", err);
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

// GET /item-action/get-bucket-title?email={...}&bucketNumber={...}
router.get("/get-bucket-title", async (req, res) => {
  try {
    const { email, bucketNumber } = req.query;
    const bucketTitle = await getBucketTitle(email as string, Number(bucketNumber));
    res.json({ bucketTitle });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bucket title" });
  }
});

// GET /item-action/get-all-bucket-titles?email={...}
router.get("/get-all-bucket-titles", async (req, res) => {
  try {
    const { email } = req.query;
    const bucketTitles = await getAllBucketTitles(email as string);
    res.json({ bucketTitles });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bucket titles" });
  }
});

export default router;
