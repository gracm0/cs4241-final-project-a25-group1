import { Router } from "express";
import { GalleryImage } from "../models/galleryImage";

const router = Router();

// POST /gallery-image: Save a completed item image to the gallery
router.post("/", async (req, res) => {
  try {
    const { userEmail, bucketTitle, title, desc, image, completedAt } =
      req.body;
    if (!userEmail || !title || !image || !completedAt) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const galleryImage = new GalleryImage({
      userEmail,
      bucketTitle,
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

// GET /gallery-image?userEmail=...: Fetch all gallery images for a user
router.get("/", async (req, res) => {
  try {
    const { userEmail } = req.query;
    if (!userEmail) {
      return res.status(400).json({ error: "Missing userEmail" });
    }
    const images = await GalleryImage.find({ userEmail }).sort({
      completedAt: -1,
    });
    res.json(images);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch gallery images", details: err });
  }
});

export default router;
