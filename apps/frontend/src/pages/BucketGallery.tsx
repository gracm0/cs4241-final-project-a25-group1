// src/pages/BucketGallery.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import biglogo from "../assets/biglogo.png";
import gallerylogo from "../assets/bucketlisticon.png";

/* ---------- types ---------- */
type Photo = {
  id: string;
  title: string;
  desc?: string;
  date: string;       // YYYY-MM-DD (completion date)
  src: string;        // image URL or DataURL
  createdAt: string;  // ISO
  extra?: Record<string, string | number | boolean | null>;
};

const PRESET_COUNT = 12;
const LS_KEY = "gallery:all";

/* ---------- helpers ---------- */
function stripKnownKeys(row: any) {
  const omit = new Set([
    "id",
    "_id",
    "title",
    "description",
    "desc",
    "completedDate",
    "date",
    "createdAt",
    "updatedAt",
    "imageUrl",
    "src",
    "__v",
  ]);
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(row ?? {})) if (!omit.has(k)) out[k] = v;
  return out;
}

function formatKey(k: string) {
  return k
      .replace(/[_\-]+/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/\b\w/g, (s) => s.toUpperCase());
}

function fileToDataURL(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(String(reader.result));
    reader.onerror = (e) => rej(e);
    reader.readAsDataURL(file);
  });
}

function mkPhoto(title: string, desc: string, dateISO: string): Photo {
  const pinkTile =
      "data:image/svg+xml;utf8," +
      encodeURIComponent(
          "<svg xmlns='http://www.w3.org/2000/svg' width='500' height='500'><rect width='100%' height='100%' rx='36' ry='36' fill='#ffd6e1'/></svg>"
      );
  return {
    id: (crypto?.randomUUID?.() ??
        `${Date.now()}-${Math.random().toString(36).slice(2)}`),
    title,
    desc,
    date: dateISO,
    src: pinkTile,
    createdAt: new Date().toISOString(),
  };
}

/* ---------- component ---------- */
export default function BucketGallery() {
  const nav = useNavigate();

  /* profile / auth */
  const userName =
      localStorage.getItem("username") ||
      sessionStorage.getItem("username") ||
      "User";
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(e.target as Node)) setShowProfile(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setShowProfile(false);
    }
    document.addEventListener("mousedown", onDocClick);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  function handleLogout() {
    try {
      localStorage.removeItem("username");
      localStorage.removeItem("token");
      sessionStorage.removeItem("username");
      sessionStorage.removeItem("token");
    } catch {}
    fetch("/logout", { method: "POST", credentials: "include" }).catch(() => {});
    nav("/");
  }

  /* data */
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Photo | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load from backend (all-buckets) with localStorage fallback/seed
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/gallery`, {
          headers: { Accept: "application/json" },
          credentials: "include",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const rows = (await res.json()) as Array<any>;
        const mapped: Photo[] = rows.map((r) => ({
          id: String(r.id ?? r._id ?? crypto.randomUUID()),
          title: r.title ?? "Untitled",
          desc: r.description ?? r.desc ?? "",
          date: (r.completedDate || r.date || r.createdAt || new Date().toISOString()).slice(0, 10),
          src: r.imageUrl || r.src || "",
          createdAt: r.createdAt ?? new Date().toISOString(),
          extra: stripKnownKeys(r),
        }));
        if (!cancelled) {
          setPhotos(mapped);
          localStorage.setItem(LS_KEY, JSON.stringify(mapped));
        }
      } catch {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) {
          if (!cancelled) setPhotos(JSON.parse(raw));
        } else {
          // Demo seed once if completely empty
          const demo: Photo[] = [
            mkPhoto("Pumpkin Patch", "Picked pumpkins!", "2025-09-01"),
            mkPhoto("Wedding Crash", "Beach wedding", "2025-09-10"),
            mkPhoto("Volleyball", "Learned to serve", "2025-09-20"),
            mkPhoto("Hike Day", "Blue trail", "2025-09-25"),
            mkPhoto("Cafe Date", "Best latte", "2025-09-27"),
            mkPhoto("Museum", "Modern art wing", "2025-09-30"),
            mkPhoto("Road Trip", "Sunset pull-off", "2025-10-01"),
            mkPhoto("Game Night", "Catan sweep", "2025-10-02"),
          ];
          if (!cancelled) setPhotos(demo);
          localStorage.setItem(LS_KEY, JSON.stringify(demo));
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist local edits
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(photos));
    } catch {}
  }, [photos]);

  // Filter + sort
  const filtered = useMemo(() => {
    const qv = query.trim().toLowerCase();
    const sorted = [...photos].sort(
        (a, b) =>
            Date.parse(b.date || b.createdAt) - Date.parse(a.date || a.createdAt)
    );
    if (!qv) return sorted;
    return sorted.filter((p) =>
        [p.title, p.desc, ...(p.extra ? Object.values(p.extra) : [])]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(qv)
    );
  }, [photos, query]);

  // Build fixed tiles
  const tiles: (Photo | null)[] = useMemo(() => {
    const used = filtered.slice(0, PRESET_COUNT);
    const placeholdersNeeded = Math.max(0, PRESET_COUNT - used.length);
    return [...used, ...Array(placeholdersNeeded).fill(null)];
  }, [filtered]);

  // Esc to close modals
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setActive(null);
        setShowUploader(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function onUploadFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const file = fd.get("file") as File | null;
    const title = (fd.get("title") as string) || "Untitled";
    const desc = (fd.get("desc") as string) || "";
    const date =
        (fd.get("date") as string) || new Date().toISOString().slice(0, 10);
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
    setShowUploader(false);
  }

  function onDelete(id: string) {
    if (!confirm("Delete this photo?")) return;
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    if (active?.id === id) setActive(null);
  }

  /* nav helpers */
  const openBucketList = (n: number) => nav(`/bucket/${n}`);

  /* ---------- render ---------- */
  return (
      <div style={S.app}>
        {/* Sidebar (shared look with BucketList) */}
        <aside style={S.sidebar}>
          <img
              src={biglogo}
              alt="Photobucket logo"
              style={{
                width: 50,
                height: 50,
                marginBottom: 20,
                borderRadius: 14,
                boxShadow: "0 6px 18px rgba(0,0,0,.08)",
              }}
          />

          {/* Bucket buttons jump back to their list pages */}
          {Array.from({ length: 4 }).map((_, i) => {
            const n = i + 1;
            return (
                <button
                    key={n}
                    onClick={() => openBucketList(n)}
                    title={`Open Bucket ${n}`}
                    style={S.bucketBtn}
                >
                  <img
                      src={gallerylogo}
                      alt={`Bucket ${n}`}
                      style={{
                        ...S.bucketIcon,
                        filter:
                            "drop-shadow(0 6px 12px rgba(0,0,0,.08))",
                      }}
                  />
                </button>
            );
          })}

          <div style={{ flex: 1 }} />

          {/* You are on the Gallery already; show a static icon */}
          <button
              title="All Buckets Gallery"
              aria-label="All Buckets Gallery"
              style={S.iconBtn}
          >
            🖼️
          </button>

          <div style={{ height: 12 }} />

          {/* Placeholder for 'add bucket' */}
          <button style={{ ...S.iconBtn, ...S.plusBtn }} title="Add bucket">
            ＋
          </button>

          <div style={{ flex: 1 }} />

          {/* Profile + logout */}
          <div ref={profileRef} style={{ position: "relative" }}>
            <button
                onClick={() => setShowProfile((s) => !s)}
                title="Profile"
                style={{ ...S.iconBtn, fontWeight: 700, background: "transparent" }}
                aria-haspopup="menu"
                aria-expanded={showProfile ? true : false}
            >
              {userName.charAt(0).toUpperCase()}
            </button>
            {showProfile && (
                <div style={S.profileMenu} role="menu">
                  <div style={S.profileName}>{userName}</div>
                  <button type="button" onClick={handleLogout} style={S.logoutBtn}>
                    Log Out
                  </button>
                </div>
            )}
          </div>
        </aside>

        {/* Main */}
        <main style={S.main}>
          <header style={S.header}>
            <div>
              <h1 style={S.h1}>Bucket Gallery (All Buckets)</h1>
              <p style={S.muted}>
                Sorted by completion date • hover tiles for details
              </p>
            </div>
            <div style={S.tools}>
              <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search photos…"
                  style={S.search}
                  aria-label="Search photos"
              />
            </div>
          </header>

          {/* Fixed 12-square grid */}
          <div className="gallery-grid" style={S.grid}>
            {tiles.map((p, i) =>
                p ? (
                    <div
                        key={p.id}
                        className="card"
                        style={S.card}
                        aria-label={`${p.title}, ${p.date}`}
                    >
                      <img
                          src={p.src}
                          alt={p.title}
                          style={S.img}
                          onClick={() => setActive(p)}
                          loading="lazy"
                      />
                      <div className="overlay" style={S.overlay}>
                        <div style={S.metaWrap}>
                          <strong style={{ display: "block", fontSize: 16 }}>
                            {p.title}
                          </strong>
                          {p.desc ? (
                              <div style={{ fontSize: 13, margin: "6px 0" }}>
                                {p.desc}
                              </div>
                          ) : null}
                          <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 6 }}>
                            Completed:{" "}
                            {new Date(p.date || p.createdAt).toLocaleDateString()}
                          </div>
                          {p.extra && (
                              <dl style={S.metaList}>
                                {Object.entries(p.extra).map(([k, v]) => (
                                    <div key={k} style={S.metaRow}>
                                      <dt style={S.metaKey}>{formatKey(k)}</dt>
                                      <dd style={S.metaVal}>{String(v)}</dd>
                                    </div>
                                ))}
                              </dl>
                          )}
                        </div>
                        <button
                            type="button"
                            onClick={() => onDelete(p.id)}
                            style={S.deleteBtn}
                            title="Delete"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                ) : (
                    <div key={`ph-${i}`} style={S.placeholder} aria-hidden />
                )
            )}
          </div>

          {/* Floating add button */}
          <button
              type="button"
              style={S.fab}
              aria-label="Add photo"
              onClick={() => setShowUploader(true)}
              title="Add photo"
          >
            +
          </button>
        </main>

        {/* Uploader modal */}
        {showUploader && (
            <div style={S.lbBackdrop} onClick={() => setShowUploader(false)}>
              <div style={S.modal} onClick={(e) => e.stopPropagation()}>
                <div style={S.modalHeader}>
                  <div style={{ fontWeight: 700 }}>Add a photo</div>
                  <button
                      style={S.modalClose}
                      onClick={() => setShowUploader(false)}
                      aria-label="Close"
                  >
                    ✕
                  </button>
                </div>
                <form onSubmit={onUploadFormSubmit} style={S.uploadForm}>
                  <input
                      ref={fileInputRef}
                      name="file"
                      type="file"
                      accept="image/*"
                      required
                      style={S.input}
                  />
                  <input name="title" placeholder="Title" required style={S.input} />
                  <input
                      name="desc"
                      placeholder="Description (optional)"
                      style={S.input}
                  />
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <label style={S.label}>Completed</label>
                    <input name="date" type="date" style={S.input} />
                  </div>
                  <button style={S.btn}>Upload</button>
                </form>
              </div>
            </div>
        )}

        {/* Lightbox */}
        {active && (
            <div style={S.lbBackdrop} onClick={() => setActive(null)}>
              <div style={S.lbInner} onClick={(e) => e.stopPropagation()}>
                <img src={active.src} alt={active.title} style={S.lbImg} />
                <div style={S.lbCaption}>
                  <div style={{ fontWeight: 600 }}>{active.title}</div>
                  {active.desc ? (
                      <div style={{ opacity: 0.85 }}>{active.desc}</div>
                  ) : null}
                  <div style={{ opacity: 0.7, fontSize: 12, marginTop: 4 }}>
                    {new Date(active.date || active.createdAt).toLocaleString()}
                  </div>
                </div>
                <button
                    type="button"
                    onClick={() => setActive(null)}
                    style={S.lbClose}
                    title="Close"
                >
                  ✕
                </button>
              </div>
            </div>
        )}

        {/* Hover CSS */}
        <style>
          {`.overlay { opacity: 0; transition: opacity .22s ease; }
          .card:hover .overlay, .card:focus-within .overlay { opacity: 1; }`}
        </style>
      </div>
  );
}

/* ---------- styles (matching BucketList look) ---------- */
const S: Record<string, React.CSSProperties> = {
  app: {
    display: "flex",
    minHeight: "100vh",
    background: "#f6f7fb",
    color: "#1f2430",
    fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
  },

  /* sidebar */
  sidebar: {
    width: 76,
    padding: "14px 10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 14,
    background: "linear-gradient(180deg,#ffd19e,#febad6)",
    borderRight: "1px solid #ffd6b7",
    borderTopRightRadius: 22,
    borderBottomRightRadius: 22,
  },
  bucketBtn: {
    background: "transparent",
    border: "none",
    padding: 0,
    marginBottom: 14,
    cursor: "pointer",
  },
  bucketIcon: { width: 42, height: 42 },
  iconBtn: {
    width: 48,
    height: 48,
    border: "none",
    borderRadius: 14,
    cursor: "pointer",
    background: "#fff",
    fontSize: 24,
    display: "grid",
    placeItems: "center",
    boxShadow: "0 6px 18px rgba(0,0,0,.08)",
  },
  plusBtn: {
    background: "#ff4f9a",
    color: "#fff",
    fontSize: 30,
    boxShadow: "0 10px 22px rgba(255,79,154,.35)",
  },

  /* profile menu */
  profileMenu: {
    position: "absolute",
    bottom: 58,
    left: -70,
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 8px 22px rgba(0,0,0,.12)",
    padding: "10px 12px",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    minWidth: 160,
    zIndex: 30,
  },
  profileName: {
    fontWeight: 600,
    fontSize: 14,
    marginBottom: 8,
    textAlign: "center",
    color: "#333",
  },
  logoutBtn: {
    border: "none",
    borderRadius: 10,
    background: "#ff4f9a",
    color: "#fff",
    padding: "8px 10px",
    fontSize: 13,
    cursor: "pointer",
  },

  /* main */
  main: { flex: 1, padding: "42px 48px", position: "relative" },

  /* header/tools */
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 18,
  },
  h1: { fontSize: 44, marginBottom: 4, letterSpacing: -0.5 },
  muted: { color: "#666", fontSize: 13 },
  tools: { display: "flex", gap: 8, alignItems: "center" },
  search: {
    borderRadius: 12,
    border: "1px solid #e7e7e7",
    padding: "10px 12px",
    outline: "none",
    minWidth: 260,
    background: "#fafafa",
  },

  // Fixed 4x3 grid
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 28,
    maxWidth: 920,
  },

  // Real photo tile
  card: {
    position: "relative",
    width: "100%",
    aspectRatio: "1 / 1",
    borderRadius: 22,
    overflow: "hidden",
    background: "#ffdce6",
    boxShadow: "0 8px 24px rgba(0,0,0,.06)",
    cursor: "pointer",
  },
  img: { width: "100%", height: "100%", objectFit: "cover", display: "block" },

  // Hover overlay
  overlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,.58)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
  },

  // Metadata in overlay
  metaWrap: {
    maxWidth: "90%",
    maxHeight: "80%",
    overflow: "auto",
    paddingRight: 6,
    textAlign: "left",
  },
  metaList: { margin: 0, padding: 0 },
  metaRow: {
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    gap: 8,
    alignItems: "start",
    marginTop: 4,
  },
  metaKey: { margin: 0, fontSize: 12, opacity: 0.9, fontWeight: 600 },
  metaVal: { margin: 0, fontSize: 12, opacity: 0.95, wordBreak: "break-word" },
  deleteBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 9999,
    background: "rgba(255,255,255,.18)",
    border: "1px solid rgba(255,255,255,.35)",
    color: "#fff",
    cursor: "pointer",
  },

  // Placeholder
  placeholder: {
    width: "100%",
    aspectRatio: "1 / 1",
    borderRadius: 22,
    background: "#ffdce6",
    boxShadow: "inset 0 0 0 2px rgba(0,0,0,.04)",
  },

  // FAB
  fab: {
    position: "fixed",
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 9999,
    border: "none",
    background: "linear-gradient(135deg,#ff8fb3,#ff5ca8)",
    color: "#fff",
    fontSize: 28,
    lineHeight: "56px",
    boxShadow: "0 10px 24px rgba(255,92,168,.35)",
    cursor: "pointer",
  },

  // Modal / lightbox
  lbBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
    padding: 16,
  },
  modal: {
    width: 520,
    maxWidth: "92vw",
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 14px 40px rgba(0,0,0,.22)",
    padding: 16,
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalClose: {
    border: "1px solid #e5e5e5",
    background: "#fafafa",
    borderRadius: 10,
    width: 32,
    height: 32,
    cursor: "pointer",
  },
  uploadForm: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    alignItems: "center",
  },
  input: {
    borderRadius: 12,
    border: "1px solid #e5e5e5",
    padding: "8px 10px",
    outline: "none",
    background: "#fafafa",
  },
  label: { fontSize: 12, color: "#666" },
  btn: {
    gridColumn: "1 / -1",
    borderRadius: 12,
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    padding: "10px 12px",
    cursor: "pointer",
  },

  // Lightbox photo view
  lbInner: { position: "relative", maxWidth: "92vw", maxHeight: "88vh" },
  lbImg: {
    maxWidth: "92vw",
    maxHeight: "70vh",
    display: "block",
    borderRadius: 12,
  },
  lbCaption: { color: "#fff", marginTop: 10, textAlign: "center" },
  lbClose: {
    position: "absolute",
    top: -12,
    right: -12,
    width: 36,
    height: 36,
    borderRadius: 9999,
    background: "#111",
    color: "#fff",
    border: "1px solid #333",
    cursor: "pointer",
  },
};
