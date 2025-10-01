// src/pages/BucketGallery.tsx
import React from "react";

export default function BucketGallery() {
  const photos = [
    {
      id: 1,
      title: "Pumpkin Patch",
      desc: "Picked pumpkins!",
      date: "2025-09-01",
    },
    {
      id: 2,
      title: "Wedding Crash",
      desc: "At the beach wedding",
      date: "2025-09-10",
    },
    {
      id: 3,
      title: "Volleyball",
      desc: "Learned to serve",
      date: "2025-09-20",
    },
  ];

  return (
    <div style={S.page}>
      <h1 style={S.h1}>Bucket Gallery</h1>
      <div style={S.grid}>
        {photos.map((p) => (
          <div key={p.id} style={S.card}>
            {/* Image placeholder */}
            <div style={S.imageBox}>
              {/* Overlay details */}
              <div className="overlay" style={S.overlay}>
                <strong style={{ display: "block", fontSize: 16 }}>
                  {p.title}
                </strong>
                <p style={{ fontSize: 13, margin: "6px 0" }}>{p.desc}</p>
                <small style={{ opacity: 0.85 }}>{p.date}</small>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Small inline CSS for hover effect */}
      <style>
        {`
                .overlay {
                    opacity: 0;
                }
                .overlay:hover {
                    opacity: 1 !important;
                }
                .overlay {
                    transition: opacity 0.3s ease-in-out;
                }
                `}
      </style>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: { padding: "42px 48px" },
  h1: { fontSize: 42, marginBottom: 24 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: 20,
    maxWidth: 900,
  },
  card: {
    background: "#ffe0ea",
    borderRadius: 16,
    height: 160,
    overflow: "hidden",
    position: "relative",
    cursor: "pointer",
    boxShadow: "0 6px 18px rgba(0,0,0,.08)",
  },
  imageBox: {
    width: "100%",
    height: "100%",
    background: "#fbb6ce", // replace with real image background later
    position: "relative",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
    color: "#fff",
    padding: 14,
    borderRadius: 16,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
};
