// tests/bucketController.test.ts
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { BucketItem } from "../src/models/bucketItem";
import { getItems, saveItem, deleteItem } from "../src/controllers/bucketController";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await BucketItem.deleteMany({});
});

describe("bucketController", () => {
  it("should save and retrieve an item", async () => {
    const data = { email: "test@example.com", bucketNumber: 1, title: "Test Item", done: false };
    const saved = await saveItem(data);

    expect(saved._id).toBeDefined();

    const items = await getItems("test@example.com", 1, false);
    expect(items.length).toBe(1);
    expect(items[0].title).toBe("Test Item");
  });

  it("should delete an item by bucketNumber and title", async () => {
    await BucketItem.create({ email: "test@example.com", bucketNumber: 1, title: "Delete Me", done: false });

    const result = await deleteItem(1, "Delete Me");
    expect(result.success).toBe(true);

    const exists = await BucketItem.findOne({ bucketNumber: 1, title: "Delete Me" });
    expect(exists).toBeNull();
  });
});
