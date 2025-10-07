import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBucketItem extends Document {
  email: string;
  bucketNumber: number;
  bucketTitle?: string;
  title: string;
  desc: string;
  location: string;
  priority: "high" | "med" | "low" | "";
  done: boolean;
  completedAt?: Date;
  image?: string;
}

const bucketItemSchema = new Schema<IBucketItem>( 
{
    email: { type: String, required: true }, // owner or collaborator email
    bucketNumber: { type: Number, required: true, min: 1, max: 4 }, // which bucket (1–4)
    bucketTitle: { type: String }, // optional title for the bucket
    title: { type: String, required: true },
    desc: { type: String, default: "" },
    location: { type: String, default: "" },
    priority: {
      type: String,
      enum: ["high", "med", "low", ""],
      default: "",
    },
    done: { type: Boolean, default: false },
    completedAt: { type: Date },
    image: { type: String },
  },
  { timestamps: true }
);

// Prevent model overwrite on hot reload
export const BucketItem: Model<IBucketItem> =
  mongoose.models.BucketItem || mongoose.model<IBucketItem>("BucketItem", bucketItemSchema);