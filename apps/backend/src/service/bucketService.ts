import User from "../models/User";
import { Bucket } from "../models/bucket";

export async function getUserBucketTitles(email: string): Promise<string[]> {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const titles: string[] = [];

  for (const bucketId of user.bucketOrder) {
    if (!bucketId) {
      titles.push(""); // placeholder if bucketId is empty
      continue;
    }

    const bucket = await Bucket.findOne({ bucketId }).select("bucketTitle");
    titles.push(bucket?.bucketTitle || "");
  }

  return titles; // returns an array of 4 strings in user-specific order
}