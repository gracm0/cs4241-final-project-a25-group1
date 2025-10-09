// galleryImage.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGalleryImage extends Document {
  bucketId: string;
  bucketTitle?: string;
  userEmail: string; // who completed item or uploaded image
  title: string;
  desc?: string;
  image: string;
  completedAt: Date;
}

const galleryImageSchema = new Schema<IGalleryImage>(
  {
    bucketId: { type: String, required: true },
    bucketTitle: { type: String },
    userEmail: { type: String, required: true },
    title: { type: String, required: true },
    desc: { type: String },
    image: { type: String, required: true },
    completedAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export const GalleryImage: Model<IGalleryImage> =
  mongoose.models.GalleryImage ||
  mongoose.model<IGalleryImage>("GalleryImage", galleryImageSchema);
