import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBucketItem extends Document {
  bucketId: string;
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
    bucketId: { type: String, required: true }, // parent bucket
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