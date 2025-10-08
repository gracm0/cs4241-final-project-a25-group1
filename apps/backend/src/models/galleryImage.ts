import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGalleryImage extends Document {
  userEmail: string;
  bucketTitle?: string;
  title: string;
  desc?: string;
  image: string;
  completedAt: Date;
}

const galleryImageSchema = new Schema<IGalleryImage>(
  {
    userEmail: { type: String, required: true },
    bucketTitle: { type: String },
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
