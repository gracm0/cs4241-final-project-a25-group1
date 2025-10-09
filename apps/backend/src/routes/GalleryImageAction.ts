// GalleryImageAction.ts
import { Router } from "express";
import { GalleryImage } from "../models/galleryImage";
import { Bucket } from "../models/bucket";
import { BucketItem } from "../models/bucketItem";
import { getCurrentUser } from "../service/authMiddleware";

const router = Router();

// Save a completed item image to the gallery
// POST /gallery-image
router.post("/", getCurrentUser, async (req, res) => {
  try {
    const { bucketId, bucketTitle, title, desc, image, completedAt } = req.body;
    
    if (!bucketId || !title || !image || !completedAt) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get user from middleware
    const currentUser = (req as any).currentUser;
    const userEmail = currentUser.email;

    // Verify user has access to this bucket (is owner or collaborator)
    const bucket = await Bucket.findOne({ bucketId });
    if (!bucket) {
      return res.status(404).json({ error: "Bucket not found" });
    }

    // collaborators is an array of email strings
    const isCollaborator = bucket.collaborators.includes(userEmail);

    if (!isCollaborator) {
      return res.status(403).json({ error: "Not authorized to add images to this bucket" });
    }

    const galleryImage = new GalleryImage({
      bucketId,
      bucketTitle: bucketTitle || bucket.bucketTitle || "Untitled Bucket",
      userEmail,
      title,
      desc,
      image,
      completedAt,
    });
    await galleryImage.save();
    res.json({ success: true, galleryImage });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to save gallery image", details: err });
  }
});

// Fetch all gallery images for a user
// GET /gallery-image?bucketId=...
router.get("/", getCurrentUser, async (req, res) => {
  try {
    // Get user from middleware
    const currentUser = (req as any).currentUser;
    const userEmail = currentUser.email;

    // Find all buckets where user is a collaborator
    // Find all buckets where user is a collaborator
    const buckets = await Bucket.find({
      collaborators: userEmail
    });

    const bucketIds = buckets.map(b => b.bucketId);

    // Fetch all gallery images for these buckets
    const images = await GalleryImage.find({
      bucketId: { $in: bucketIds }
    }).sort({ completedAt: -1 });

    res.json(images);
  } catch (err) {
    console.error("Failed to fetch gallery images:", err);
    res.status(500).json({ error: "Failed to fetch gallery images", details: err });
  }
});

// Delete a gallery image
// DELETE /gallery-image/:id
router.delete("/:id", getCurrentUser, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get user from middleware
    const currentUser = (req as any).currentUser;
    const userEmail = currentUser.email;
    
    if (!userEmail) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Find the image
    const image = await GalleryImage.findById(id);
    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Check if user has access to the bucket
    const bucket = await Bucket.findOne({ bucketId: image.bucketId });
    if (!bucket) {
      return res.status(404).json({ error: "Bucket not found" });
    }

    // collaborators is an array of email strings
    const isCollaborator = bucket.collaborators.includes(userEmail);

    if (!isCollaborator) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await GalleryImage.findByIdAndDelete(id);

    // Find and update the corresponding bucket item to mark as not done
    await BucketItem.updateOne(
      { 
        bucketId: image.bucketId,
        title: image.title,
        done: true
      },
      { 
        $set: { done: false },
        $unset: { image: "", completedAt: "" }
      }
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Failed to delete gallery image:", err);
    res.status(500).json({ error: "Failed to delete gallery image", details: err });
  }
});

export default router;
