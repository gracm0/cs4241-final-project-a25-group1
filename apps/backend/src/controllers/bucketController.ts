// get bucket title for a user and bucket number
export async function getBucketTitle(email: string, bucketNumber: number) {
  // Find one item for the user and bucketNumber
  const item = await BucketItem.findOne({ email, bucketNumber });
  return item?.bucketTitle || "";
}
import { BucketItem } from "../models/bucketItem";

// get all bucket items for a user, bucket number, and done status
export async function getItems(email: string, bucketNumber: number, done: boolean) {
  const items = await BucketItem.find({ email, bucketNumber, done }).sort({ createdAt: -1 });
  return items;
}

// save or update a bucket item
export async function saveItem(data: any) {
  if (data._id) {
    const item = await BucketItem.findOneAndUpdate(
      { _id: data._id },
      { $set: data },
      { new: true }
    );
    return item;
  } else {
    const item = new BucketItem(data);
    await item.save();
    return item;
  }
}

// delete a bucket item by email, bucket ID, and title
export async function deleteItem(email: string, bucketNumber: number, _id: string) {
  const deleted = await BucketItem.findOneAndDelete({ _id, email, bucketNumber });
  if (!deleted) return { success: false, message: "Item not found" };
  return { success: true };
}

// update all related items with new bucket title 
export async function updateManyItems(email: string, bucketNumber: number, bucketTitle: string) {
  const modified = await BucketItem.updateMany(
    { email, bucketNumber },
    { $set: { bucketTitle } }
  );
  return modified;
}