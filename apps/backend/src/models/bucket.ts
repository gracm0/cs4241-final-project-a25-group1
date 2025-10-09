// bucket.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBucket extends Document {
  bucketId: string; // unique per bucket
  bucketTitle?: string;
  ownerEmail: string;
  collaborators: string[]; // must include ownerEmail
}

const bucketSchema = new Schema<IBucket>( 
{
    bucketId: { type: String, required: true, unique: true },
    bucketTitle: { type: String },
    ownerEmail: { type: String, required: true },
    collaborators: { type: [String], required: true }, // array of emails
  },
  { timestamps: true }
);

// Ensure ownerEmail is always in collaborators
bucketSchema.pre("save", function (next) {
  if (!this.collaborators.includes(this.ownerEmail)) {
    this.collaborators.push(this.ownerEmail);
  }
  next();
});

// Prevent model overwrite on hot reload
export const Bucket: Model<IBucket> =
  mongoose.models.Bucket || mongoose.model<IBucket>("Bucket", bucketSchema);