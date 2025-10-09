// CollaborationInvite.ts
import { Router } from "express";
import { Bucket } from "../models/bucket";
import User from "../models/user";
import crypto from "crypto";

const router = Router();

// assumes calls include required parameters

/* Generate a shareable invite code for a bucket

  POST /collab/generate-invite

  body:
  {
    bucketId: string
  }

  response:
  {
    success: boolean;
    inviteCode: string;
    inviteUrl: string;
  }
*/
router.post("/generate-invite", async (req, res) => {
  try {
    const { bucketId } = req.body;
    const userId = req.session?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const bucket = await Bucket.findOne({ bucketId });
    if (!bucket) {
      return res.status(404).json({ message: "Bucket not found" });
    }

    // Verify the user owns this bucket
    if (bucket.ownerEmail !== user.email) {
      return res.status(403).json({ message: "Only the owner can generate invites" });
    }

    // Generate a unique invite code (valid for 7 days)
    const inviteCode = crypto.randomBytes(16).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Store invite code in bucket
    bucket.inviteCode = inviteCode;
    bucket.inviteExpiry = expiresAt;
    await bucket.save();

    res.json({ 
      success: true, 
      inviteCode,
      inviteUrl: `${req.protocol}://${req.get("host")}/join-bucket/${inviteCode}`
    });
  } catch (err) {
    console.error("Error generating invite:", err);
    res.status(500).json({ message: "Failed to generate invite" });
  }
});

/* Accept an invite and join a bucket as a collaborator

  POST /collab/accept-invite

  body:
  {
    inviteCode: string
    slotIndex: number
  }

  response:
  {
    success: boolea
    message: string
    bucketId: string
    bucketTitle: string
    owner: string
    slotIndex: slotIndex + 1, // Converted to 1-based
    replaced: boolean
  }
*/
// CollaborationInvite.ts - Update the accept-invite route

router.post("/accept-invite", async (req, res) => {
  try {
    const { inviteCode, slotIndex } = req.body;
    const userId = req.session?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find bucket with this invite code
    const bucket = await Bucket.findOne({ 
      inviteCode,
      inviteExpiry: { $gt: new Date() }
    });

    if (!bucket) {
      return res.status(404).json({ message: "Invalid or expired invite code" });
    }

    // Check if user is already a collaborator
    if (bucket.collaborators.includes(user.email)) {
      const existingIndex = user.bucketOrder.indexOf(bucket.bucketId);
      
      return res.json({ 
        success: true, 
        message: "You're already a collaborator on this bucket",
        bucketId: bucket.bucketId,
        bucketTitle: bucket.bucketTitle,
        slotIndex: existingIndex !== -1 ? existingIndex + 1 : null,
        alreadyCollaborator: true
      });
    }

    // If no slotIndex provided, send bucket info for selection
    if (slotIndex === undefined || slotIndex === null) {
      // Fetch titles for existing buckets
      const bucketTitles = await Promise.all(
        user.bucketOrder.map(async (bid, idx) => {
          if (!bid || bid.trim() === "") {
            return { index: idx, title: `Empty Slot ${idx + 1}`, isEmpty: true };
          }
          const b = await Bucket.findOne({ bucketId: bid });
          return { 
            index: idx, 
            title: b?.bucketTitle || `Bucket ${idx + 1}`, 
            isEmpty: false,
            isOwner: b?.ownerEmail === user.email
          };
        })
      );

      return res.json({
        success: false,
        requiresSelection: true,
        message: "Please choose which bucket slot to use",
        bucketId: bucket.bucketId,
        bucketTitle: bucket.bucketTitle,
        owner: bucket.ownerEmail,
        currentBuckets: bucketTitles
      });
    }

    // Validate slotIndex
    if (typeof slotIndex !== "number" || slotIndex < 0 || slotIndex > 3) {
      return res.status(400).json({ message: "Invalid slot index. Must be 0-3." });
    }

    // Add user as collaborator
    bucket.collaborators.push(user.email);
    await bucket.save();

    // Store old bucket ID if replacing
    const oldBucketId = user.bucketOrder[slotIndex];

    // Assign to chosen slot
    user.bucketOrder[slotIndex] = bucket.bucketId;
    await user.save();

    // If we replaced a bucket where user was owner, remove their email from collaborators
    if (oldBucketId && oldBucketId.trim() !== "") {
      const oldBucket = await Bucket.findOne({ bucketId: oldBucketId });
      if (oldBucket && oldBucket.ownerEmail !== user.email) {
        // User was just a collaborator, remove them
        oldBucket.collaborators = oldBucket.collaborators.filter(e => e !== user.email);
        await oldBucket.save();
      }
    }

    res.json({ 
      success: true,
      message: "Successfully joined bucket",
      bucketId: bucket.bucketId,
      bucketTitle: bucket.bucketTitle,
      owner: bucket.ownerEmail,
      slotIndex: slotIndex + 1, // Convert to 1-based
      replaced: oldBucketId ? true : false
    });
  } catch (err) {
    console.error("Error accepting invite:", err);
    res.status(500).json({ message: "Failed to accept invite" });
  }
});

/* Get all collaborators for a bucket

  GET /collab/collaborators/:bucketId

  response:
  {
    success: boolean;
    collaborators: [
      {
        email: string;
        name: string;
        isOwner: boolean;
      }
    ]
  }
*/
router.get("/collaborators/:bucketId", async (req, res) => {
  try {
    const { bucketId } = req.params;
    const userId = req.session?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const bucket = await Bucket.findOne({ bucketId });
    if (!bucket) {
      return res.status(404).json({ message: "Bucket not found" });
    }

    // Verify user has access to this bucket
    if (!bucket.collaborators.includes(user.email)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Fetch collaborator details
    const collaboratorDetails = await User.find(
      { email: { $in: bucket.collaborators } },
      { first: 1, last: 1, email: 1 }
    );

    res.json({ 
      success: true,
      collaborators: collaboratorDetails.map(c => ({
        email: c.email,
        name: `${c.first} ${c.last}`,
        isOwner: c.email === bucket.ownerEmail
      }))
    });
  } catch (err) {
    console.error("Error fetching collaborators:", err);
    res.status(500).json({ message: "Failed to fetch collaborators" });
  }
});

/* Remove a collaborator from a bucket (owner only)

  DELETE /collab/remove-collaborator

  body:
  {
    bucketId: string;
    collaboratorEmail: string;
  }

  response:
  {
    success: boolean;
    message: string;
  }
*/
router.delete("/remove-collaborator", async (req, res) => {
  try {
    const { bucketId, collaboratorEmail } = req.body;
    const userId = req.session?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const bucket = await Bucket.findOne({ bucketId });
    if (!bucket) {
      return res.status(404).json({ message: "Bucket not found" });
    }

    // Only owner can remove collaborators
    if (bucket.ownerEmail !== user.email) {
      return res.status(403).json({ message: "Only the owner can remove collaborators" });
    }

    // Can't remove the owner
    if (collaboratorEmail === bucket.ownerEmail) {
      return res.status(400).json({ message: "Cannot remove the bucket owner" });
    }

    // Remove collaborator
    bucket.collaborators = bucket.collaborators.filter(e => e !== collaboratorEmail);
    await bucket.save();

    // Remove bucket from the collaborator's bucketOrder
    const collaborator = await User.findOne({ email: collaboratorEmail });
    if (collaborator) {
      const index = collaborator.bucketOrder.indexOf(bucketId);
      if (index !== -1) {
        collaborator.bucketOrder[index] = ""; // Clear the slot
        await collaborator.save();
      }
    }

    res.json({ success: true, message: "Collaborator removed" });
  } catch (err) {
    console.error("Error removing collaborator:", err);
    res.status(500).json({ message: "Failed to remove collaborator" });
  }
});

export default router;