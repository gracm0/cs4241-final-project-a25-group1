// src/pages/BucketGallery.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";

type Photo = {
  id: string;
  title: string;
  desc?: string;
  date: string; // ISO yyyy-mm-dd
  src: string;  // data URL (persisted)
  createdAt: string; // ISO
};

const LS_KEY = (listId: string) => `gallery:${listId}`;

export default function BucketGallery() {
  const { listId } = useParams(); // /lists/:listId/gallery
  const activeListId = listId ?? "demo";

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Photo | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load from localStorage on mount / list change
  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY(activeListId));
    if (raw) {
      try {
        const parsed: Photo[] = JSON.parse(raw);
        setPhotos(parsed);
        return;
      } catch {}
    }
    // seed demo data (once) if empty
    if (!raw && activeListId === "demo") {
      const demo: Photo[] = [
        mkPhoto("Pumpkin Patch", "Picked pumpkins!", "2025-09-01"),
        mkPhoto("Wedding Crash", "At the beach wedding", "2025-09-10"),
        mkPhoto("Volleyball", "Learned to serve", "2025-09-20"),
      ];
      setPhotos(demo);
      localStorage.setItem(LS_KEY(activeListId), JSON.stringify(demo));
    } else {
      setPhotos([]);
    }
  }, [activeListId]);

  // Save to localStorage whenever photos change
  useEffect(() => {
    localStorage.setItem(LS_KEY(activeListId), JSON.stringify(photos));
  }, [photos, activeListId]);

  // Sort (newest first) + filter
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...photos].sort(
        (a, b) => Date.parse(b.date || b.createdAt) - Date.parse(a.date || a.createdAt)
    );
    if (!q) return sorted;
    return sorted.filter((p) =>
        [p.title, p.desc].filter(Boolean).join(" ").toLowerCase().includes(q)
    );
  }, [photos, query]);

  // Keyboard nav for lightbox
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!active) return;
      if (e.key === "Escape") setActive(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  async function onUploadFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const file = fd.get("file") as File | null;
    const title = (fd.get("title") as string) || "Untitled";
    const desc = (fd.get("desc") as string) || "";
    const date = (fd.get("date") as string) || new Date().toISOString().slice(0, 10);

    if (!file) return;

    const dataUrl = await fileToDataURL(file);
    const newPhoto: Photo = {
      id: crypto.randomUUID(),
      title,
      desc,
      date,
      src: dataUrl,
      createdAt: new Date().toISOString(),
    };
    setPhotos((prev) => [newPhoto, ...prev]);

    form.reset();
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function onDelete(id: string) {
    if (!confirm("Delete this photo?")) return;
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    if (active?.id === id) setActive(null);
  }

  return (
      <div style={S.page}>
        <header style={S.header}>
          <div>
            <h1 style={S.h1}>
              Bucket Gallery {listId ? <span style={S.subtle}>· list {listId}</span> : null}
            </h1>
            <p style={S.muted}>Front-end only • localStorage • uploads persist as Data URLs</p>
          </div>
          <div style={S.tools}>
            <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search photos…"
                style={S.search}
            />
          </div>
        </header>

        {/* Upload card (front-end only) */}
        <form onSubmit={onUploadFormSubmit} style={S.uploadCard}>
          <div style={S.uploadTitle}>Add a photo</div>
          <div style={S.uploadGrid}>
            <input
                ref={fileInputRef}
                name="file"
                type="file"
                accept="image/*"
                required
                style={S.input}
            />
            <input name="title" placeholder="Title" required style={S.input} />
            <input name="desc" placeholder="Description (optional)" style={S.input} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <label style={S.label}>Completed</label>
              <input name="date" type="date" style={S.input} />
            </div>
            <button style={S.btn}>Upload</button>
          </div>
        </form>

        {/* Grid */}
        <div className="gallery-grid" style={S.grid}>
          {filtered.map((p) => (
              <div key={p.id} className="card" style={S.card} aria-label={`${p.title}, ${p.date}`}>
                {/* Image */}
                <img
                    src={p.src}
                    alt={p.title}
                    style={S.img}
                    onClick={() => setActive(p)}
                />

                {/* Hover overlay */}
                <div className="overlay" style={S.overlay}>
                  <div style={{ textAlign: "center" }}>
                    <strong style={{ display: "block", fontSize: 16 }}>{p.title}</strong>
                    {p.desc ? <p style={{ fontSize: 13, margin: "6px 0" }}>{p.desc}</p> : null}
                    <small style={{ opacity: 0.9 }}>
                      {new Date(p.date || p.createdAt).toLocaleDateString()}
                    </small>
                  </div>

                  {/* delete button (top-right) */}
                  <button type="button" onClick={() => onDelete(p.id)} style={S.deleteBtn} title="Delete">
                    ✕
                  </button>
                </div>
              </div>
          ))}
        </div>

        {/* Lightbox */}
        {active && (
            <div style={S.lbBackdrop} onClick={() => setActive(null)}>
              <div style={S.lbInner} onClick={(e) => e.stopPropagation()}>
                <img src={active.src} alt={active.title} style={S.lbImg} />
                <div style={S.lbCaption}>
                  <div style={{ fontWeight: 600 }}>{active.title}</div>
                  {active.desc ? <div style={{ opacity: 0.85 }}>{active.desc}</div> : null}
                  <div style={{ opacity: 0.7, fontSize: 12, marginTop: 4 }}>
                    {new Date(active.date || active.createdAt).toLocaleString()}
                  </div>
                </div>
                <button type="button" onClick={() => setActive(null)} style={S.lbClose} title="Close">
                  ✕
                </button>
              </div>
            </div>
        )}

        {/* Hover CSS */}
        <style>{`
        .overlay { opacity: 0; transition: opacity .25s ease; }
        .card:hover .overlay, .card:focus-within .overlay { opacity: 1; }
      `}</style>
      </div>
  );
}

/* Helpers */
function mkPhoto(title: string, desc: string, dateISO: string): Photo {
  // tiny 1x1 data URL placeholder (pink) so the layout looks consistent in demo
  const pinkDot =
      "data:image/svg+xml;utf8," +
      encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><rect width='100%' height='100%' fill='#fbb6ce'/></svg>`);
  return {
    id: crypto.randomUUID(),
    title,
    desc,
    date: dateISO,
    src: pinkDot,
    createdAt: new Date().toISOString(),
  };
}

function fileToDataURL(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(String(reader.result));
    reader.onerror = (e) => rej(e);
    reader.readAsDataURL(file);
  });
}

/* Styles */
const S: Record<string, React.CSSProperties> = {
  page: { padding: "42px 48px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 },
  h1: { fontSize: 42, marginBottom: 4 },
  subtle: { fontSize: 18, color: "#888", marginLeft: 8 },
  muted: { color: "#666", fontSize: 13 },
  tools: { display: "flex", gap: 8, alignItems: "center" },
  search: {
    borderRadius: 12, border: "1px solid #ddd", padding: "8px 12px", outline: "none", minWidth: 240,
  },

  uploadCard: {
    border: "1px solid #eee",
    borderRadius: 16,
    padding: 16,
    margin: "12px 0 20px",
    background: "#fff",
    boxShadow: "0 6px 18px rgba(0,0,0,.04)",
  },
  uploadTitle: { fontWeight: 600, marginBottom: 10 },
  uploadGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, alignItems: "center" },
  input: {
    borderRadius: 12, border: "1px solid #e5e5e5", padding: "8px 10px", outline: "none",
    background: "#fafafa",
  },
  label: { fontSize: 12, color: "#666" },
  btn: {
    gridColumn: "1 / -1",
    borderRadius: 12, border: "1px solid #111", background: "#111", color: "#fff", padding: "8px 12px",
    cursor: "pointer",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: 20,
  },
  card: {
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
    height: 180,
    background: "#ffe0ea",
    boxShadow: "0 6px 18px rgba(0,0,0,.08)",
    cursor: "pointer",
  },
  img: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  overlay: {
    position: "absolute", inset: 0, background: "rgba(0,0,0,.55)", color: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center", padding: 14,
  },
  deleteBtn: {
    position: "absolute", top: 8, right: 8,
    width: 28, height: 28, borderRadius: 9999, background: "rgba(255,255,255,.15)",
    border: "1px solid rgba(255,255,255,.35)", color: "#fff", cursor: "pointer",
  },

  lbBackdrop: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", display: "flex",
    alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16,
  },
  lbInner: { position: "relative", maxWidth: "92vw", maxHeight: "88vh" },
  lbImg: { maxWidth: "92vw", maxHeight: "70vh", display: "block", borderRadius: 12 },
  lbCaption: { color: "#fff", marginTop: 10, textAlign: "center" },
  lbClose: {
    position: "absolute", top: -12, right: -12, width: 36, height: 36,
    borderRadius: 9999, background: "#111", color: "#fff", border: "1px solid #333", cursor: "pointer",
  },
};
