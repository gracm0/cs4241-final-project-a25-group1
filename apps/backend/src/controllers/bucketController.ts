import { BucketItem } from "../models/bucketItem";

// get all bucket items for a user, bucket number, and done status
export async function getItems(email: string, bucketNumber: number, done: boolean) {
  const items = await BucketItem.find({ email, bucketNumber, done }).sort({ createdAt: -1 });
  return items;
}

// save or update a bucket item
export async function saveItem(data: any) {
  const item = await BucketItem.findOneAndUpdate(
    { _id: data._id },
    { $set: data },
    { upsert: true, new: true }
  );
  return item;
}

// delete a bucket item by bucket ID and title
export async function deleteItem(bucketNumber: number, title: string) {
  const deleted = await BucketItem.findOneAndDelete({ bucketNumber, title });
  if (!deleted) return { success: false, message: "Item not found" };
  return { success: true };
}

// update all related items with new bucket title 
export async function updateManyItems(email: string, bucketNumber: number, title: string) {
  const modified = await BucketItem.updateMany(
    { email, bucketNumber },
    { $set: { title } }
  );
  return modified;
}