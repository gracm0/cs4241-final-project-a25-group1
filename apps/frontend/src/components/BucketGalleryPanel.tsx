import React, { useEffect, useMemo, useState } from "react";

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

export const GALLERY_LS_KEY = "gallery:all";
const PRESET_COUNT = 12;

/* ---------- helpers ---------- */
function formatKey(k: string) {
  return k
    .replace(/[_\-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (s) => s.toUpperCase());
}

function readGallery(): Photo[] {
  try {
    const raw = localStorage.getItem(GALLERY_LS_KEY);
    const arr = raw ? (JSON.parse(raw) as any[]) : [];
    return arr.map((p) => ({
      id: p.id ?? crypto.randomUUID(),
      title: p.title ?? "",
      desc: p.desc ?? undefined,
      src: p.src ?? p.uploadedUrl ?? "",
      date:
        p.date ??
        p.dateCompleted ??
        new Date(p.createdAt ?? Date.now()).toISOString().slice(0, 10),
      createdAt: p.createdAt ?? new Date().toISOString(),
      extra: p.extra ?? (p.photokind ? { photokind: p.photokind } : undefined),
    })) as Photo[];
  } catch {
    return [];
  }
}

function writeGallery(next: Photo[]) {
  try {
    localStorage.setItem(GALLERY_LS_KEY, JSON.stringify(next));
  } catch {}
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

  useEffect(() => {
    setPhotos(readGallery());
  }, []);

  // Debugging
  useEffect(() => {
    console.log("BucketGalleryPanel photos:", photos);
  }, [photos]);

  useEffect(() => {
    function reload() {
      setPhotos(readGallery());
    }
    window.addEventListener("focus", reload);
    return () => window.removeEventListener("focus", reload);
  }, []);

  // Cross-tab sync
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === GALLERY_LS_KEY) {
        setPhotos(readGallery());
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Same-tab sync (BucketList dispatches this after saving)
  useEffect(() => {
    function onSameTabChange() {
      setPhotos(readGallery());
    }
    window.addEventListener(
      "gallery:changed",
      onSameTabChange as EventListener
    );
    return () =>
      window.removeEventListener(
        "gallery:changed",
        onSameTabChange as EventListener
      );
  }, []);

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

  const tiles: (Photo | null)[] = useMemo(() => {
    const used = filtered.slice(0, PRESET_COUNT);
    const placeholdersNeeded = Math.max(0, PRESET_COUNT - used.length);
    return [...used, ...Array(placeholdersNeeded).fill(null)];
  }, [filtered]);

  function onDelete(id: string) {
    if (!confirm("Delete this photo?")) return;
    setPhotos((prev) => {
      const next = prev.filter((p) => p.id !== id);
      writeGallery(next); // persist only here
      window.dispatchEvent(new Event("gallery:changed")); // notify others
      return next;
    });
    if (active?.id === id) setActive(null);
  }

  return (
    <section className={className} style={style}>
      <header className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-sm text-black/60">
            Sorted by completion date • hover tiles for details
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search photos…"
            aria-label="Search photos"
            className="min-w-[240px] rounded-xl border border-gray-200 bg-[#fafafa] px-3 py-2 outline-none"
          />
        </div>
      </header>

      {/* 4x3 fixed grid */}
      <div
        className="grid max-w-[920px] gap-7"
        style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
      >
        {tiles.map((p, i) =>
          p ? (
            <div
              key={p.id}
              className="card group relative aspect-square w-full cursor-pointer overflow-hidden rounded-2xl bg-[#ffdce6] shadow-[0_8px_24px_rgba(0,0,0,.06)]"
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
                    {new Date(p.date || p.createdAt).toLocaleDateString()}
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
          ) : (
            <div
              key={`ph-${i}`}
              aria-hidden
              className="aspect-square w-full rounded-2xl bg-[#ffdce6] shadow-[inset_0_0_0_2px_rgba(0,0,0,.04)]"
            />
          )
        )}
      </div>

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
