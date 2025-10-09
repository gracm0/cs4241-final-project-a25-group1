// JoinBucket.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface BucketSlot {
  index: number;
  title: string;
  isEmpty: boolean;
  isOwner?: boolean;
  oldBucketId?: string;
}

async function deleteBucketAndItems(bucketId: string) {
  try {
    const res = await fetch(`/api/bucket-action/delete?bucketId=${encodeURIComponent(bucketId)}`, {
      method: "DELETE",
      credentials: "include",
    });
    
    const result = await res.json();
    if (!result.success) {
      console.error("Failed to delete bucket:", result.message);
    }
  } catch (err) {
    console.error("Error deleting bucket:", err);
  }
}

export default function JoinBucket() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const nav = useNavigate();
  const [status, setStatus] = useState<"loading" | "select" | "joining" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [bucketInfo, setBucketInfo] = useState<any>(null);
  const [currentBuckets, setCurrentBuckets] = useState<BucketSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  useEffect(() => {
    const checkInvite = async () => {
      try {
        const res = await fetch("/api/collab/accept-invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ inviteCode }), // No slotIndex yet
        });
        const data = await res.json();

        if (data.alreadyCollaborator) {
          // Already a collaborator
          setStatus("success");
          setMessage(data.message);
          setBucketInfo(data);
          
          setTimeout(() => {
            nav(`/bucket/${data.slotIndex || 1}`);
          }, 2000);
        } else if (data.requiresSelection) {
          // Need to choose slot
          setStatus("select");
          setMessage(data.message);
          setBucketInfo(data);
          setCurrentBuckets(data.currentBuckets);
          
          // Auto-select first empty slot if available
          const firstEmpty = data.currentBuckets.findIndex((b: BucketSlot) => b.isEmpty);
          if (firstEmpty !== -1) {
            setSelectedSlot(firstEmpty);
          }
        } else if (data.success) {
          // Shouldn't happen, but handle it
          setStatus("success");
          setMessage(data.message);
          setBucketInfo(data);
          
          setTimeout(() => {
            nav(`/bucket/${data.slotIndex || 1}`);
          }, 2000);
        } else {
          setStatus("error");
          setMessage(data.message || "Failed to process invite");
        }
      } catch (err) {
        setStatus("error");
        setMessage("An error occurred while processing the invite");
      }
    };

    if (inviteCode) checkInvite();
  }, [inviteCode, nav]);

  const handleJoinBucket = async () => {
    if (selectedSlot === null) return;

    setStatus("joining");

    try {
      // If replacing a non-empty bucket, delete it first
      const bucketToReplace = currentBuckets[selectedSlot];
      if (!bucketToReplace.isEmpty && bucketToReplace.oldBucketId) { // CHANGED
        await deleteBucketAndItems(bucketToReplace.oldBucketId); // CHANGED
      }

      // Then proceed with joining
      const res = await fetch("/api/collab/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          inviteCode,
          slotIndex: selectedSlot
        }),
      });
      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setMessage(data.replaced 
          ? "Successfully joined bucket and replaced old bucket!" 
          : "Successfully joined bucket!");
        
        setTimeout(() => {
          nav(`/bucket/${selectedSlot + 1}`);
        }, 2000);
      } else {
        setStatus("error");
        setMessage(data.message || "Failed to join bucket");
      }
    } catch (err) {
      setStatus("error");
      setMessage("An error occurred while joining the bucket");
    }
  };

  return (
    <div className="min-h-screen bg-[#FF99A7] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full">
        {status === "loading" && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF99A7] mx-auto mb-4" />
            <p className="text-lg">Loading invite...</p>
          </div>
        )}
        
        {status === "select" && (
          <>
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-2">Join Bucket List</h2>
              <p className="text-gray-600 mb-2">
                You've been invited to collaborate on:
              </p>
              <p className="text-xl font-semibold text-[#FF99A7]">
                {bucketInfo?.bucketTitle || "Shared Bucket"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                by {bucketInfo?.owner}
              </p>
            </div>

            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Choose which bucket slot you want to use. You have 4 slots total.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {currentBuckets.map((bucket) => (
                <button
                  key={bucket.index}
                  onClick={() => setSelectedSlot(bucket.index)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedSlot === bucket.index
                      ? "border-[#FF99A7] bg-pink-50 shadow-md transform scale-[1.02]"
                      : "border-gray-200 hover:border-gray-300 hover:shadow"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-bold text-lg">Slot {bucket.index + 1}</div>
                    {selectedSlot === bucket.index && (
                      <span className="text-[#FF99A7] text-xl">✓</span>
                    )}
                  </div>
                  
                  {bucket.isEmpty ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="text-green-500">✓</span>
                      <span>Empty - Ready to use</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-sm font-medium text-gray-700 mb-1">
                        {bucket.title}
                      </div>
                      <div className="flex items-center gap-2">
                        {bucket.isOwner ? (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            You own this
                          </span>
                        ) : (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            Shared with you
                          </span>
                        )}
                        <span className="text-xs text-red-600">
                          ⚠️ Will be replaced
                        </span>
                      </div>
                    </>
                  )}
                </button>
              ))}
            </div>

            {selectedSlot !== null && !currentBuckets[selectedSlot]?.isEmpty && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Warning:</strong> This will replace your existing bucket. 
                  The items in that bucket will no longer be accessible from this slot.
                </p>
              </div>
            )}

            <button
              onClick={handleJoinBucket}
              disabled={selectedSlot === null}
              className={`w-full py-4 rounded-xl font-bold text-lg transition ${
                selectedSlot !== null
                  ? "bg-[#FF99A7] text-white hover:opacity-90 shadow-lg"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {selectedSlot !== null 
                ? `Join Bucket in Slot ${selectedSlot + 1}`
                : "Select a Slot to Continue"
              }
            </button>
          </>
        )}

        {status === "joining" && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF99A7] mx-auto mb-4" />
            <p className="text-lg">Joining bucket...</p>
          </div>
        )}
        
        {status === "success" && (
          <div className="text-center">
            <div className="text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold mb-2">Success!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            {bucketInfo && (
              <p className="text-sm text-gray-500">
                Redirecting to {bucketInfo.bucketTitle || "your bucket"}...
              </p>
            )}
          </div>
        )}
        
        {status === "error" && (
          <div className="text-center">
            <div className="text-6xl mb-4 text-red-500">✕</div>
            <h2 className="text-2xl font-bold mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => nav("/")}
              className="bg-[#FF99A7] text-white px-6 py-3 rounded-lg hover:opacity-90"
            >
              Go Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}