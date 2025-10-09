// BucketGalleryPanel.tsx
import React, { useEffect, useMemo, useState } from "react";
import * as api from "../api";

/* ---------- types ---------- */
export type Photo = {
  id: string;
  title: string;
  desc?: string;
  date: string;
  src: string;
  createdAt: string;
  extra?: Record<string, string | number | boolean | null>;
};

/* ---------- helpers ---------- */
function formatKey(k: string) {
  return k
    .replace(/[_\-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (s) => s.toUpperCase());
}

// Transform bucket item to photo format
function transformBucketItemToPhoto(item: any): Photo | null {
  // Only include items that have images and are completed
  if (!item.image || !item.done) {
    return null;
  }

  return {
    id: item.id || item._id,
    title: item.title || "Untitled",
    desc: item.desc || undefined,
    src: item.image,
    date: item.completedAt
      ? new Date(item.completedAt).toISOString().slice(0, 10)
      : new Date(item.createdAt).toISOString().slice(0, 10),
    createdAt: item.createdAt || new Date().toISOString(),
    extra: {
      location: item.location || "",
      priority: item.priority || "",
      bucketTitle: item.bucketTitle || "",
    },
  };
}

export default function BucketGalleryPanel({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
  title?: string;
}) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Get current user and their photos
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        console.log("Fetching current user...");
        // Get current user
        const response = (await api.getCurrentUser()) as {
          user: { email: string; first: string; last: string };
        };
        console.log("Current user response:", response);
        setUserEmail(response.user.email);

        console.log("Fetching gallery images for:", response.user.email);
        // Get gallery images
        const imagesRes = await fetch("/api/gallery-image", {
          credentials: "include"
        });

        if (!imagesRes.ok) {
          throw new Error(`Failed to fetch images: ${imagesRes.status}`);
        }
        const images = await imagesRes.json();
        console.log("Gallery images response:", images);

        // Transform gallery images to photos
        const transformedPhotos = images.map((img: any) => ({
          id: img._id,
          title: img.title || "Untitled",
          desc: img.desc || "",
          src: img.image,
          date: img.completedAt
            ? new Date(img.completedAt).toISOString().slice(0, 10)
            : new Date(img.createdAt).toISOString().slice(0, 10),
          createdAt: img.createdAt || new Date().toISOString(),
          extra: {
            bucketTitle: img.bucketTitle || "",
          },
        }));

        setPhotos(transformedPhotos);
      } catch (err) {
        console.error("Failed to fetch photos:", err);
        setError(err instanceof Error ? err.message : "Failed to load photos");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Listen for gallery changes
  useEffect(() => {
    async function onBucketUpdate() {
      if (!userEmail) return;
      try {
        const imagesRes = await fetch("/api/gallery-image", {
          credentials: "include"
        });

        if (!imagesRes.ok) {
          throw new Error(`Failed to fetch images: ${imagesRes.status}`);
        }

        const images = await imagesRes.json();
        const transformedPhotos = images.map((img: any) => ({
          id: img._id,
          title: img.title || "Untitled",
          src: img.image,
          date: img.completedAt
            ? new Date(img.completedAt).toISOString().slice(0, 10)
            : new Date(img.createdAt).toISOString().slice(0, 10),
          createdAt: img.createdAt || new Date().toISOString(),
        }));
        setPhotos(transformedPhotos);
      } catch (err) {
        console.error("Failed to refresh gallery photos:", err);
      }
    }
    window.addEventListener("gallery:changed", onBucketUpdate as EventListener);
    return () =>
      window.removeEventListener(
        "gallery:changed",
        onBucketUpdate as EventListener
      );
  }, [userEmail]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setActive(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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

  const tiles: Photo[] = useMemo(() => {
    return filtered;
  }, [filtered]);

  function onDelete(id: string) {
    if (!confirm("Delete this photo?")) return;

    // Optimistically update UI
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    if (active?.id === id) setActive(null);

    // Delete from backend
    fetch(`/api/gallery-image/${id}`, {
      method: "DELETE",
      credentials: "include"
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete");
        return res.json();
      })
      .then(() => {
        // Notify other components that the gallery changed
        window.dispatchEvent(new Event("gallery:changed"));
      })
      .catch((err) => {
        console.error("Failed to delete photo:", err);
        alert("Failed to delete photo. Please try again.");
        // Refresh to restore correct state
        window.location.reload();
      });
  }

  return (
    <section className={className} style={style}>
      <header className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-sm text-black/60">
            {loading
              ? "Loading photos..."
              : `${filtered.length} photo${
                  filtered.length !== 1 ? "s" : ""
                } • sorted by completion date • hover tiles for details`}
          </p>
          {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </div>
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search photos…"
            aria-label="Search photos"
            disabled={loading}
            className="min-w-[240px] rounded-xl border border-gray-200 bg-[#fafafa] px-3 py-2 outline-none disabled:opacity-50"
          />
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading your photos...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-2">Failed to load photos</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      ) : tiles.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-600 mb-2">No photos found</p>
            <p className="text-sm text-gray-500">
              Complete bucket list items with photos to see them here!
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 justify-items-center">
          {tiles.map((p) => (
            <div
              key={p.id}
              className="card group relative w-[220px] h-[220px] cursor-pointer overflow-hidden rounded-2xl bg-[#ffdce6] shadow-[0_8px_24px_rgba(0,0,0,.06)]"
              aria-label={`${p.title}, ${p.date}`}
            >
              <img
                src={p.src}
                alt={p.title}
                className="h-full w-full object-cover"
                onClick={() => setActive(p)}
                loading="lazy"
              />
              <div className="overlay absolute inset-0 grid place-items-center bg-black/60 p-4 opacity-0 transition-opacity duration-200 ease-linear group-hover:opacity-100">
                <div className="max-h-[80%] max-w-[90%] overflow-auto pr-1 text-left text-white">
                  <strong className="block text-[16px]">{p.title}</strong>
                  {p.desc ? (
                    <div className="mt-1 text-[13px] opacity-95">{p.desc}</div>
                  ) : null}
                  <div className="mt-1 text-[12px] opacity-90">
                    Completed:{" "}
                    {(() => {
                      if (
                        typeof p.date === "string" &&
                        p.date.length === 10 &&
                        p.date.match(/^\d{4}-\d{2}-\d{2}$/)
                      ) {
                        const [year, month, day] = p.date
                          .split("-")
                          .map(Number);
                        return new Date(
                          year,
                          month - 1,
                          day
                        ).toLocaleDateString();
                      }
                      return new Date(
                        p.date || p.createdAt
                      ).toLocaleDateString();
                    })()}
                  </div>
                  {p.extra && (
                    <dl className="mt-2">
                      {Object.entries(p.extra).map(([k, v]) => (
                        <div
                          key={k}
                          className="grid grid-cols-[auto_1fr] items-start gap-2"
                        >
                          <dt className="text-[12px] font-semibold opacity-90">
                            {formatKey(k)}
                          </dt>
                          <dd className="text-[12px] opacity-95 break-words">
                            {String(v)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onDelete(p.id)}
                  title="Delete"
                  className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full border border-white/30 bg-white/20 text-white"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {active && (
        <div
          className="fixed inset-0 z-[9999] grid place-items-center bg-black/70 p-4"
          onClick={() => setActive(null)}
        >
          <div
            className="relative max-h-[88vh] max-w-[92vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={active.src}
              alt={active.title}
              className="max-h-[70vh] max-w-[92vw] rounded-lg"
            />
            <div className="mt-2 text-center text-white">
              <div className="font-semibold">{active.title}</div>
              {active.desc ? (
                <div className="opacity-85">{active.desc}</div>
              ) : null}
              <div className="mt-1 text-[12px] opacity-70">
                {new Date(active.date || active.createdAt).toLocaleString()}
              </div>
              {active.extra?.bucketTitle && (
                <div className="mt-1 text-[12px] opacity-80">
                  Bucket: {active.extra.bucketTitle}
                </div>
              )}
              {active.extra && (
                <dl className="mt-2">
                  {Object.entries(active.extra).map(([k, v]) => (
                    <div
                      key={k}
                      className="grid grid-cols-[auto_1fr] items-start gap-2"
                    >
                      <dt className="text-[12px] font-semibold opacity-90">
                        {formatKey(k)}
                      </dt>
                      <dd className="text-[12px] opacity-95 break-words">
                        {String(v)}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
            <button
              type="button"
              title="Close"
              onClick={() => setActive(null)}
              className="absolute -right-3 -top-3 grid h-9 w-9 place-items-center rounded-full border border-[#333] bg-[#111] text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
