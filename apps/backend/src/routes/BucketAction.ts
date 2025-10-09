import { Router } from "express";
import { 
    getBucketTitle,
    getAllBucketTitles,
    updateBucketTitle,
 } from "../controllers/bucketController";

const router = Router();

// get specific bucket title
// GET /bucket-action/single?bucketId={...}
router.get("/single", async (req, res) => {
    try {
        const { bucketId } = req.query;

        if (!bucketId || typeof bucketId !== "string") {
            return res.status(400).json({ error: "bucketId is required" });
        }

        const bucket = await getBucketTitle(bucketId);
        res.json({ bucketTitle: bucket });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch bucket title" });
    }
});

// get all bucket titles
// GET /bucket-action?email={...}
router.get("/", async (req, res) => {
    try {
        const { email } = req.query;

        if (!email || typeof email !== "string") {
            return res.status(400).json({ error: "email is required" });
        }

        const buckets = await getAllBucketTitles(email);
        res.json({ bucketTitles: buckets });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch all bucket titles" });
    }
});

/*  update bucket title
    POST /bucket-action

    body:
    bucketId: string
    bucketTitle: string
*/

router.post("/", async (req, res) => {
    try {
        const { bucketId, bucketTitle } = req.body;

        if (!bucketId || bucketTitle === undefined) {
            return res.status(400).json({ success: false, error: "bucketId and bucketTitle are required" });
        }

        const updated = await updateBucketTitle(bucketId, bucketTitle);

        if (!updated) {
            return res.status(404).json({ success: false, message: "Bucket not found" });
        }

        // Return success + updated title
        res.json({ success: true, bucketTitle: updated.bucketTitle });
    } catch (err) {
        res.status(500).json({ success: false, error: "Failed to save bucket title" });
    }
})

export default router;