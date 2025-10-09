import { Bucket } from "../models/bucket";
import { getUserBucketTitles } from "../service/bucketService";

// get bucket title for a specific bucket
export async function getBucketTitle(bucketId: string) {
  const item = await Bucket.findOne({ bucketId }).select("bucketTitle");
  return item?.bucketTitle ?? "";
}

// get all bucket titles for a user in order
export async function getAllBucketTitles(email: string) {
  const titles = await getUserBucketTitles(email);
  return titles;
}

// update new bucket title
export async function updateBucketTitle( bucketId: string, bucketTitle: string ) {
  const modified = await Bucket.findOneAndUpdate(
    { bucketId },
    { $set: { bucketTitle } },
    { new: true }
  );
  return modified;
}