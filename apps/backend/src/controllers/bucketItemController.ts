import { BucketItem } from "../models/bucketItem";

// get all bucket items for a user, bucket number, and done status
export async function getAllItems(bucketId: string) {
  const items = await BucketItem.find({ bucketId }).sort({
    createdAt: -1,
  });
  return items;
}

// get all completed bucket items for a user
export async function getAllDoneItems(bucketId: string) {
  const items = await BucketItem.find({ bucketId, done: true }).sort({
    createdAt: -1,
  });
  return items;
}

// save or update a bucket item
export async function saveItem(data: any) {
  if (data._id) {
    const { _id, bucketId, ...updateData } = data;

    const allowedFields = ['title', 'desc', 'location', 'priority', 'done', 'completedAt', 'image'];
    const sanitizedData: any = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) sanitizedData[field] = updateData[field];
    });

    const item = await BucketItem.findByIdAndUpdate(
      _id,
      sanitizedData,
      { new: true }
    );
    return item;
  } else {
    const item = new BucketItem(data);
    await item.save();
    return item;
  }
}

// delete a bucket item by bucket ID
export async function deleteItem(
  bucketId: string,
  _id: string
) {
  const deleted = await BucketItem.findOneAndDelete({
    _id,
    bucketId,
  });
  if (!deleted) return { success: false, message: "Item not found" };
  return { success: true };
}

// delete all items in a bucket
export async function deleteAllItemsInBucket( bucketId: string ) {
  const result = await BucketItem.deleteMany({ bucketId });

  if (result.deletedCount === 0) {
    return { success: false, message: "No items found in this bucket" };
  }
  return { success: true, deletedCount: result.deletedCount };
}