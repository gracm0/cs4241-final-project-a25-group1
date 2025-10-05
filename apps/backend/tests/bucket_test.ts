import fetch from "node-fetch";

interface BucketItem {
  _id: string;
  email: string;
  bucketNumber: number;
  title: string;
  desc: string;
  location: string;
  priority: "high" | "med" | "low" | "";
  done: boolean;
  completedAt?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

async function testCRUD() {
  const email = "gymahoney@wpi.edu";

  const item1 = {
    email,
    bucketNumber: 1,
    title: "Visit Japan",
    desc: "Kyoto & Tokyo",
    location: "Japan",
    priority: "high",
    done: false,
  };

  const item2 = {
    email,
    bucketNumber: 2,
    title: "Climb Mount Everest",
    desc: "Reach the summit",
    location: "Nepal",
    priority: "high",
    done: false,
  };

  // CREATE item1
  const createRes1 = await fetch("http://localhost:5050/api/bucket-items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item1),
  });
  const created1 = (await createRes1.json()) as BucketItem;
  console.log("Created item1:", created1);

  // CREATE item2
  const createRes2 = await fetch("http://localhost:5050/api/bucket-items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item2),
  });
  const created2 = (await createRes2.json()) as BucketItem;
  console.log("Created item2:", created2);

  // READ all items
  const getRes = await fetch(`http://localhost:5050/api/bucket-items?email=${email}`);
  const items = (await getRes.json()) as BucketItem[];
  console.log("All items:", items);

  // DELETE only item1
  const deleteRes = await fetch(`http://localhost:5050/api/bucket-items/${created1._id}`, {
    method: "DELETE",
  });
  const deleted = await deleteRes.json();
  console.log("Deleted item1:", deleted);

  // READ again
  const getResAfter = await fetch(`http://localhost:5050/api/bucket-items?email=${email}`);
  const itemsAfter = (await getResAfter.json()) as BucketItem[];
  console.log("Items after deletion:", itemsAfter);
}

testCRUD();

// To run: `npm run test-bucket-collection`from the backend directory