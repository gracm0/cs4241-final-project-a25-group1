// src/components/CompleteItemModal.tsx
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * CompleteItemModal
 * Opens when the user clicks a dot to complete a bucket item.
 * - Shows item title/desc/location (passed via props).
 * - Lets user set "date completed".
 * - "Upload Image" triggers native file picker.
 * - "Take A Picture" opens camera capture modal.
 * - Returns chosen image + date via onSubmit.
 */
export type BucketItem = {
  id: string;
  title: string;
  subtitle?: string;
  locationName?: string;
  address1?: string;
  cityStateZip?: string;
};

type Props = {
  open: boolean;
  item: BucketItem | null;
  onClose: () => void;
  onSubmit: (args: {
    itemId: string;
    dateCompleted?: string;
    uploadedUrl: string;
    photoKind: "upload" | "camera" | null;
  }) => void;
};

export default function CompleteItemModal({
  open,
  item,
  onClose,
  onSubmit,
}: Props) {
  const [dateCompleted, setDateCompleted] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [photoKind, setPhotoKind] = useState<"upload" | "camera" | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "auto";
    };
  }, [open]);

  // Reset modal state on open
  useEffect(() => {
    if (open) {
      setDateCompleted("");
      setUploadedUrl(null);
      setPhotoKind(null);
      setShowCamera(false);
      setLoading(false);
    }
  }, [open, item?.id]);

  const handleUploadClick = () => {
    setPhotoKind("upload");
    fileRef.current?.click();
  };

  const uploadFile = async (file: File | Blob) => {
    setLoading(true);

    // Show a temporary preview immediately
    const tempUrl = URL.createObjectURL(file);
    setUploadedUrl(tempUrl);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (data.success && data.url) {
        setUploadedUrl(data.url); 
      } else {
        console.error("Upload failed", data);
        alert("Upload failed. Please try again.");
        setUploadedUrl(null);
      }
    } catch (err) {
      console.error("Upload error", err);
      alert("Upload failed. Please try again.");
      setUploadedUrl(null);
  } finally {
    setLoading(false);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) uploadFile(f);
  };

  const handleTakePicture = () => {
    setPhotoKind("camera");
    setShowCamera(true);
  };

  const handleCapture = (blob: Blob) => {
    setShowCamera(false);
    uploadFile(blob);
  };

  const handleSubmit = () => {
    console.log("Submitting:", { dateCompleted, uploadedUrl, photoKind });
    if (!uploadedUrl) return alert("You need to upload an image!"); 
    onSubmit({ itemId: item!.id, dateCompleted: dateCompleted || undefined, uploadedUrl, photoKind });
    onClose();
  };

  if (!open || !item) return null;

  const cardStyle: React.CSSProperties = {
    width: 460,
    maxWidth: "90vw",
    background: "#fff",
    borderRadius: 24,
    padding: 24,
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    border: "6px solid rgba(255,207,134,0.6)",
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
          zIndex: 9998,
        }}
      />

      {/* Modal Card */}
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "grid",
          placeItems: "center",
          padding: 16,
        }}
      >
        <div style={cardStyle}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.15 }}>
              Ready to Complete <br /> Your <span style={{ color: "#FF5C73" }}>Bucket List</span> Item?
            </div>
          </div>
          <hr style={{ border: 0, borderTop: "2px solid #fad6d9", margin: "10px 0 16px" }} />

          {/* Item info */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{item.title}</div>
            {item.subtitle && <div style={{ fontSize: 14, color: "#444" }}>{item.subtitle}</div>}
          </div>
          {(item.locationName || item.address1 || item.cityStateZip) && (
            <div style={{ fontSize: 12, color: "#666", marginBottom: 12, textAlign: "left" }}>
              {item.locationName && <div>{item.locationName}</div>}
              {item.address1 && <div>{item.address1}</div>}
              {item.cityStateZip && <div>{item.cityStateZip}</div>}
            </div>
          )}

          {/* Date completed */}
          <label style={{ fontSize: 11, color: "#7a7a7a" }}>date completed</label>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
            <input
              placeholder="MM/DD/YYYY"
              value={dateCompleted}
              onChange={(e) => setDateCompleted(e.target.value)}
              style={{ flex: 1, height: 40, borderRadius: 10, border: "1px solid #f5b7be", background: "#ffe1e5", padding: "0 12px", fontWeight: 600 }}
            />
            <span role="img" aria-label="calendar">📅</span>
          </div>

          {/* Upload / Camera buttons */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 12 }}>
            <button onClick={handleUploadClick} style={{ height: 44, padding: "0 16px", borderRadius: 999, border: 0, background: "#e6f0ff", fontWeight: 700, cursor: "pointer" }}>
              Upload Image
            </button>
            <button onClick={handleTakePicture} style={{ height: 44, padding: "0 16px", borderRadius: 999, border: 0, background: "#dff5ff", fontWeight: 700, cursor: "pointer" }}>
              Take A Picture
            </button>
          </div>

          {/* Uploaded image preview (moved below buttons) */}
          {uploadedUrl && (
            <div style={{ marginBottom: 12, textAlign: "center" }}>
              <p style={{ fontSize: 12, color: "#666" }}>Uploaded Image:</p>
              <a href={uploadedUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#007bff", wordBreak: "break-all" }}>
                {uploadedUrl}
              </a>
              <img 
                src={uploadedUrl} 
                alt="Uploaded" 
                style={{ marginTop: 6, maxHeight: 120, objectFit: "contain", borderRadius: 8, display: "block", marginLeft: "auto", marginRight: "auto" }} />
            </div>
          )}


          {/* Confirm / Cancel */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
            <button onClick={onClose} style={{ background: "transparent", border: 0, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={!dateCompleted || !uploadedUrl || loading}
              style={{ height: 40, padding: "0 16px", borderRadius: 10, border: 0, background: "#7ED957", fontWeight: 800, cursor: "pointer", opacity: (!dateCompleted || !uploadedUrl || loading) ? 0.6 : 1 }}
            >
              {loading ? "Uploading..." : "Mark Complete"}
            </button>
          </div>

          {/* Hidden file input */}
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
        </div>
      </div>

      {/* Camera modal */}
      <CameraModal open={showCamera} onClose={() => setShowCamera(false)} onCapture={handleCapture} />
    </>,
    document.body
  );
}

/* ---------------- Camera Modal ---------------- */
function CameraModal({
  open,
  onClose,
  onCapture,
}: {
  open: boolean;
  onClose: () => void;
  onCapture: (blob: Blob) => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    (async () => {
      try {
        const constraints: MediaStreamConstraints = { video: { facingMode: { ideal: "environment" } }, audio: false };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
      } catch (err) {
        console.error("Camera error:", err);
        alert("Could not access camera. Please allow camera permissions or upload instead.");
        onClose();
      }
    })();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [open, onClose]);

  if (!open) return null;

  const snap = async () => {
    const video = videoRef.current!;
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0, w, h);
    const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), "image/jpeg", 0.92));
    onCapture(blob);
  };

  return createPortal(
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 10000 }} />
      <div style={{ position: "fixed", inset: 0, display: "grid", placeItems: "center", zIndex: 10001, padding: 16 }}>
        <div style={{ width: 520, maxWidth: "95vw", background: "#0b0b0b", borderRadius: 16, overflow: "hidden", boxShadow: "0 16px 48px rgba(0,0,0,0.4)" }}>
          <video ref={videoRef} playsInline style={{ width: "100%", display: "block", background: "#000" }} />
          <div style={{ display: "flex", gap: 12, justifyContent: "space-between", padding: 12 }}>
            <button onClick={onClose} style={{ border: 0, background: "#fff", borderRadius: 8, padding: "10px 16px", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
            <button onClick={snap} style={{ border: 0, background: "#7ED957", borderRadius: 999, padding: "10px 18px", fontWeight: 800, cursor: "pointer" }}>Capture</button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}