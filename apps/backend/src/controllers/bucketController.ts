import { BucketItem } from "../models/bucketItem";

export async function getItems(email: string) {
  const items = await BucketItem.find({ email });
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

export async function deleteItem(bucketNumber: Number) {
  await BucketItem.findByIdAndDelete(bucketNumber);
  return { success: true };
}

/*
 frontend - add a fetch

 await fetch("/api/bucket-items", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(item),
});
*/
