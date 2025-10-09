// user.ts
import { Schema, model, Model, Document } from 'mongoose';
import { compare, hash } from 'bcrypt';
import { randomUUID } from "crypto";
import { Bucket } from "./bucket";

const SALT = 10;

export interface IUser {
  first: string;
  last: string;
  email: string;
  password: string;

  bucketOrder: string[]; // length 4, contains bucketIds in order
}

export interface UserMethods {
  validatePass(password: string): Promise<boolean>;
}

export type UserDocument = Document<unknown, {}, IUser> & IUser & UserMethods;

interface UserModel extends Model<IUser, {}, UserMethods> {}

const userSchema = new Schema<IUser, UserModel>(
  {
    first: { type: String, required: true },
    last: { type: String, required: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    bucketOrder: { 
      type: [String], 
      required: true,
      default: ["", "", "", ""],
      validate: {
        validator: (arr: string[]) => arr.length === 4,
        message: "bucketOrder must contain exactly 4 bucketIds"
      },
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Auto-generate missing bucket IDs before saving
userSchema.pre<UserDocument>("save", async function (next) {
  // Handle password hashing
  if (this.isModified("password")) {
    this.password = await hash(this.password, SALT);
  }

  // Ensure 4 unique bucket IDs
  if (!Array.isArray(this.bucketOrder)) this.bucketOrder = [];
  while (this.bucketOrder.length < 4) this.bucketOrder.push("");

  this.bucketOrder = this.bucketOrder.map((id) =>
    id && id.trim() !== "" ? id : `bucket-${randomUUID()}`
  );

  // Ensure a Bucket document exists for each bucketId
  try {
    await Promise.all(
      this.bucketOrder.map((bucketId) =>
        Bucket.findOneAndUpdate(
          { bucketId },
          {
            $setOnInsert: {
              bucketId,
              ownerEmail: this.email,
              collaborators: [this.email],
              bucketTitle: "",
            },
          },
          { upsert: true, new: true }
        )
      )
    );
  } catch (err) {
    return next(err as any);
  }

  next();
});

userSchema.methods.validatePass = async function (candidatePassword: string) {
  return compare(candidatePassword, this.password);
};

const User = model<IUser, UserModel>('User', userSchema);
export default User;
