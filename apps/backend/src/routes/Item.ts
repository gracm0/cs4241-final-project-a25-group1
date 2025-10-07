import { Router } from "express";
import {
  getItems,
  saveItem,
  deleteItem,
  updateManyItems,
} from "../controllers/bucketController";
import { BucketItem } from "../models/bucketItem";

const router = Router();

/**
 * GET /item-action?email=...&bucketNumber=...[&doneQuery=true|false]
 * - If doneQuery is omitted, return BOTH done + not-done items (what your UI needs).
 * - If doneQuery is provided, filter accordingly.
 */
router.get("/", async (req, res) => {
  try {
    const { email, bucketNumber, doneQuery } = req.query as {
      email?: string;
      bucketNumber?: string;
      doneQuery?: string;
    };

    if (!email || !bucketNumber) {
      return res.status(400).json({ error: "email and bucketNumber required" });
    }

    let items: any[] = [];

    if (doneQuery === "true" || doneQuery === "false") {
      const done = doneQuery === "true";
      items = await getItems(email, Number(bucketNumber), done);
    } else {
      // No filter provided → return BOTH sets, not just one.
      const [notDone, done] = await Promise.all([
        getItems(email, Number(bucketNumber), false),
        getItems(email, Number(bucketNumber), true),
      ]);
      items = [...notDone, ...done];
    }

    // Ensure each item has an `id` (string) for React keys, keep _id too
    const itemsWithId = items.map((item: any) => {
      const obj = typeof item.toObject === "function" ? item.toObject() : item;
      return {
        ...obj,
        id: (obj._id ?? item._id)?.toString(),
      };
    });

    res.json(itemsWithId);
  } catch (err) {
    console.error("GET /item-action failed:", err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

/**
 * POST /item-action
 * Body: {_id?, email, bucketNumber, bucketTitle?, title, desc, location, priority, done, completedAt?, image?}
 * - Persists `done`
 * - If transitioning to done (or done is true and no stamp), set `completedAt`
 */
router.post("/", async (req, res) => {
  try {
    const body = { ...req.body };

    // If client marks item done and doesn't send completedAt, stamp it
    if (body && body.done === true && !body.completedAt) {
      body.completedAt = new Date();
    }

    const item = await saveItem(body);
    res.json(item);
  } catch (err) {
    console.error("POST /item-action failed:", err);
    res.status(500).json({ error: "Failed to save item" });
  }
});

/**
 * DELETE /item-action?email=...&bucketNumber=...&id=...
 * (You already had this wired — leaving as-is.)
 */
router.delete("/", async (req, res) => {
  try {
    const { email, bucketNumber, id } = req.query as {
      email?: string;
      bucketNumber?: string;
      id?: string;
    };
    const result = await deleteItem(
        email as string,
        Number(bucketNumber),
        id as string
    );
    res.json(result);
  } catch (err) {
    console.error("DELETE /item-action failed:", err);
    res.status(500).json({ error: "Failed to delete item" });
  }
});

/**
 * POST /item-action/update-bucket-title
 * Body: { email, bucketNumber, bucketTitle }
 */
router.post("/update-bucket-title", async (req, res) => {
  try {
    const { email, bucketNumber, bucketTitle } = req.body;
    const result = await updateManyItems(
        email as string,
        Number(bucketNumber),
        bucketTitle as string
    );
    res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (err) {
    console.error("POST /update-bucket-title failed:", err);
    res.status(500).json({ error: "Failed to update bucket title" });
  }
});

/**
 * GET /item-action/get-bucket-title?email=...&bucketNumber=...
 * (Used by your frontend on load)
 */
router.get("/get-bucket-title", async (req, res) => {
  try {
    const { email, bucketNumber } = req.query as {
      email?: string;
      bucketNumber?: string;
    };
    if (!email || !bucketNumber) {
      return res.status(400).json({ error: "email and bucketNumber required" });
    }

    const doc = await BucketItem
        .findOne({ email, bucketNumber: Number(bucketNumber) })
        .select({ bucketTitle: 1 })
        .lean();

    res.json({ bucketTitle: doc?.bucketTitle ?? "" });
  } catch (err) {
    console.error("GET /get-bucket-title failed:", err);
    res.status(500).json({ error: "Failed to get bucket title" });
  }
});

/**
 * POST /item-action/reset-bucket
 * Accepts body or query: { email, bucketNumber }
 * (Matches your frontend resetWholeList() call)
 */
router.post("/reset-bucket", async (req, res) => {
  try {
    const email =
        (req.body?.email as string | undefined) ??
        (req.query?.email as string | undefined);
    const bucketNumberRaw =
        (req.body?.bucketNumber as number | string | undefined) ??
        (req.query?.bucketNumber as number | string | undefined);

    if (!email || bucketNumberRaw === undefined) {
      return res.status(400).json({ error: "email and bucketNumber required" });
    }

    await BucketItem.deleteMany({
      email,
      bucketNumber: Number(bucketNumberRaw),
    });

    res.json({ success: true });
  } catch (err) {
    console.error("POST /reset-bucket failed:", err);
    res.status(500).json({ error: "Failed to reset bucket" });
  }
});

export default router;
