// src/components/BucketList.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import CompleteItemModal from "../components/CompleteItemModal";
import biglogo from "../assets/biglogo.png";
import gallerylogo from "../assets/bucketlisticon.png";
import { Sidebar, SidebarBody, SidebarLink, useSidebar } from "../components/SideNav";
import BucketCard, { Priority, BucketItem } from "../components/BucketCard";
import InviteForm from "../components/InviteForm";
import Avatar from "../components/Avatar";
import BucketGallery from "../components/BucketGalleryPanel";

/* ---------- main component ---------- */
export default function BucketList() {
  const nav = useNavigate();
  const location = useLocation();

  const { id } = useParams<{ id?: string }>();
  const [q] = useSearchParams();

  /* ---------------- bucket id ---------------- */
  const activeBucket = useMemo(() => {
    const fromParam = Number(id);
    const fromQuery = Number(q.get("b"));
    const n = Number.isFinite(fromParam) && fromParam > 0 ? fromParam : fromQuery || 1;
    return Math.min(Math.max(n, 1), 4);
  }, [id, q]);

  /* ---------------- auth / profile menu ---------------- */
  const userEmail =
      localStorage.getItem("email") || sessionStorage.getItem("email") || "User";

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
      localStorage.removeItem("email");
      localStorage.removeItem("token");
      sessionStorage.removeItem("email");
      sessionStorage.removeItem("token");
    } catch {}
    fetch("/logout", { method: "POST", credentials: "include" }).catch(() => {});
    nav("/");
  }

  /* ---------------- per-bucket title (persisted) ---------------- */
  const titleKey = (n: number) => `bucket:title:${n}`;
  const [listTitle, setListTitle] = useState<string>("");

  useEffect(() => {
    const stored = localStorage.getItem(titleKey(activeBucket));
    setListTitle(stored ?? "New Bucket List");
  }, [activeBucket]);

  useEffect(() => {
    try {
      localStorage.setItem(titleKey(activeBucket), listTitle);
    } catch {}
  }, [listTitle, activeBucket]);

  // Titles for sidebar labels (Bucket 1..4)
  const [sidebarTitles, setSidebarTitles] = useState<string[]>(["", "", "", ""]);
  useEffect(() => {
    const titles = [1, 2, 3, 4].map((n) => {
      return localStorage.getItem(titleKey(n)) ?? `Bucket ${n}`;
    });
    setSidebarTitles(titles);
  }, [listTitle, activeBucket]);

  /* ---------------- collaborators + invite modal ---------------- */
  type Collab = { id: string; name: string; color: string };
  const [collabs, setCollabs] = useState<Collab[]>([
    { id: "me", name: userEmail, color: "#ff6b6b" },
  ]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const canAddMore = collabs.length < 4;

  const addCollaborator = (raw: string) => {
    const name = raw.trim();
    if (!name || !canAddMore) return;
    if (collabs.some((c) => c.name.toLowerCase() === name.toLowerCase())) return;
    const palette = ["#2ecc71", "#3498db", "#9b59b6", "#f39c12", "#e67e22", "#e84393"];
    setCollabs((cs) => [
      ...cs,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name,
        color: palette[Math.floor(Math.random() * palette.length)],
      },
    ]);
  };
  const removeCollaborator = (cid: string) =>
      cid !== "me" && setCollabs((cs) => cs.filter((c) => c.id !== cid));

  const collabKey = (n: number) => `bucket:${n}:collabs`;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(collabKey(activeBucket));
      const fallback: Collab[] = [{ id: "me", name: userEmail, color: "#ff6b6b" }];
      setCollabs(raw ? (JSON.parse(raw) as Collab[]) : fallback);
    } catch {
      setCollabs([{ id: "me", name: userEmail, color: "#ff6b6b" }]);
    }
  }, [activeBucket, userEmail]);

  useEffect(() => {
    try {
      localStorage.setItem(collabKey(activeBucket), JSON.stringify(collabs));
    } catch {}
  }, [collabs, activeBucket]);

  const inviteUrl = `${window.location.origin}/bucket/${activeBucket}?invite=${btoa(
      `${userEmail}:${activeBucket}`
  )}`;

  /* ---------------- per-bucket items (persisted) ---------------- */
  const itemsKey = (n: number) => `bucket:${n}:items`;
  const [items, setItems] = useState<BucketItem[]>([]);

  const makeDefaultItem = (): BucketItem => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: "Start Building Your Bucket",
    desc: "Add Your Description",
    location: "",
    priority: "",
    done: false,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(itemsKey(activeBucket));
      const parsed: BucketItem[] = raw ? JSON.parse(raw) : [];
      if (!parsed || parsed.length === 0) {
        const seeded = [makeDefaultItem()];
        setItems(seeded);
        localStorage.setItem(itemsKey(activeBucket), JSON.stringify(seeded));
      } else {
        setItems(parsed);
      }
    } catch {
      const seeded = [makeDefaultItem()];
      setItems(seeded);
      try {
        localStorage.setItem(itemsKey(activeBucket), JSON.stringify(seeded));
      } catch {}
    }
  }, [activeBucket]);

  useEffect(() => {
    try {
      localStorage.setItem(itemsKey(activeBucket), JSON.stringify(items));
    } catch {}
  }, [items, activeBucket]);

  const addItem = () => setItems((xs) => [...xs, makeDefaultItem()]);
  const deleteItem = (iid: string) =>
      setItems((xs) => (xs.length <= 1 ? [makeDefaultItem()] : xs.filter((x) => x.id !== iid)));
  const editItem = (iid: string, patch: Partial<BucketItem>) =>
      setItems((xs) => xs.map((x) => (x.id === iid ? { ...x, ...patch } : x)));

  /* ---------------- Complete modal wiring ---------------- */
  type ModalItem = {
    id: string;
    title: string;
    subtitle?: string;
    locationName?: string;
    address1?: string;
    cityStateZip?: string;
  };
  const [completeItem, setCompleteItem] = useState<ModalItem | null>(null);

  const openCompleteFor = (it: BucketItem) =>
      setCompleteItem({
        id: it.id,
        title: it.title,
        subtitle: it.desc || undefined,
        locationName: it.location || undefined,
      });

  const handleCompleteSubmit = async (args: {
    itemId: string;
    dateCompleted?: string;
    photo?: File | Blob;
    photoKind: "upload" | "camera" | null;
  }) => {
    setItems((xs) => xs.map((x) => (x.id === args.itemId ? { ...x, done: true } : x)));
    setCompleteItem(null);
  };

  /* ---------------- actions ---------------- */
  const openBucket = (n: number) => {
    nav(`/bucket/${n}`); // always go to bucket route
  };

  // route-driven gallery mode
  const galleryOpen = location.pathname.endsWith("/bucket/gallery");
  const goGallery = () => nav("/bucket/gallery");
  const goList = () => nav(`/bucket/${activeBucket}`);

  /* ---------------- brand (collapses with sidebar) ---------------- */
  function Brand() {
    const { open, animate } = useSidebar();
    return (
        <div className="mb-10 mt-3 ml-3 flex items-center gap-3 overflow-hidden">
          <img
              src={biglogo}
              alt="Photobucket logo"
              className="w-[50px] h-[50px] rounded-[14px] bg-[#FF99A7]"
          />
          <motion.span
              initial={false}
              animate={{ opacity: open ? 1 : 0, x: open ? 0 : -8 }}
              transition={animate ? { duration: 0.18 } : { duration: 0 }}
              className="font-roboto text-[#302F4D] text-2xl font-bold leading-none whitespace-nowrap"
              style={{ display: open ? "inline-block" : "none" }}
          >
            Photobucket
          </motion.span>
        </div>
    );
  }

  /* ---------------- render ---------------- */
  return (
      <div className="min-h-screen font-sans bg-[#FF99A7]">
        <Sidebar>
          <SidebarBody
              className="fixed left-0 top-0 z-40 h-screen !px-3 !py-4 hidden md:flex md:flex-col
                     bg-gradient-to-r from-[#FFD639]/75 to-[#FF99A7]/75"
          >
            <Brand />

            {/* Buckets */}
            <nav className="flex flex-col gap-4">
              {[1, 2, 3, 4].map((n) => (
                  <SidebarLink
                      key={n}
                      link={{
                        href: "#",
                        label: sidebarTitles[n - 1] || `New Bucket List`,
                        icon: (
                            <img
                                src={gallerylogo}
                                alt={`New Bucket List`}
                                className="h-[55px] w-[55px] rounded-[10px]"
                            />
                        ),
                      }}
                      className="mb-6 overflow-hidden whitespace-nowrap px-2 font-roboto font-medium text-[#302F4D]"
                      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                        e.preventDefault();
                        openBucket(n);
                      }}
                  />
              ))}
            </nav>

            <div className="flex-1" />

            <SidebarLink
                link={{
                  href: "#",
                  label: "Bucket Gallery",
                  icon: (
                      <img
                          src={biglogo}
                          alt={`Bucket Gallery`}
                          className="h-[55px] w-[55px] rounded-[10px]"
                      />
                  ),
                }}
                className="mb-6 overflow-hidden whitespace-nowrap px-2 font-roboto font-medium text-[#302F4D]"
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.preventDefault();
                  if (!galleryOpen) goGallery();
                }}
            />

            {/* Profile + Logout */}
            <div ref={profileRef} className="relative mt-2">
              <button
                  onClick={() => setShowProfile((s) => !s)}
                  title="Profile"
                  aria-haspopup="menu"
                  aria-expanded={showProfile ? true : false}
                  className="grid h-12 w-12 place-items-center rounded-[14px] bg-transparent font-bold"
              >
                {userEmail.charAt(0).toUpperCase()}
              </button>


              {showProfile && (
                  <div
                      role="menu"
                      className="absolute top-1/2 left-[75px] -translate-y-1/2 z-50 w-44 rounded-xl bg-white p-3 shadow-[0_8px_22px_rgba(0,0,0,0.12)]"

                  >




                  <div className="mb-2 text-center text-sm font-semibold text-neutral-800">
                      {userEmail}
                    </div>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full rounded-lg bg-[#ff4f9a] px-3 py-2 text-sm text-white"
                    >
                      Log Out
                    </button>
                  </div>
              )}
            </div>
          </SidebarBody>

          {/* Animated main that condenses/expands with the sidebar */}
          <AnimatedMain>
            {/* Header: title left, collab controls right */}
            {galleryOpen ? (
                <div className="mb-6 flex items-center justify-between">
                  <h1 className="text-[42px] font-bold font-roboto leading-none text-[#302F4D]">
                    All Buckets Gallery
                  </h1>
                </div>
            ) : (
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <input
                      value={listTitle}
                      onChange={(e) => setListTitle(e.target.value)}
                      placeholder="New Bucket List"
                      aria-label="Bucket list title"
                      className="flex-1 bg-transparent text-[42px] font-bold font-roboto text-[#302F4D] leading-none outline-none min-w-[240px]"
                  />
                  <div className="flex items-center gap-2 shrink-0">
                    {collabs.map((c) => (
                        <Avatar
                            key={c.id}
                            bg={c.color}
                            onRemove={c.id === "me" ? undefined : () => removeCollaborator(c.id)}
                        >
                          {initials(c.name)}
                        </Avatar>
                    ))}
                    {!canAddMore && <span className="text-xs opacity-70">(Max 4)</span>}
                    <button
                        title="Invite collaborators (max 4)"
                        onClick={() => setInviteOpen(true)}
                        className="ml-2 grid h-10 w-10 place-items-center rounded-full bg-[#ff4f9a] text-2xl text-white shadow-[0_10px_24px_rgba(255,79,154,0.35)]"
                    >
                      +
                    </button>
                  </div>
                </div>
            )}

            {galleryOpen ? (
                <BucketGallery />
            ) : (
                <>
                  {/* Cards */}
                  <div className="grid max-w-[820px] gap-[18px]">
                    {items.map((it) => (
                        <BucketCard
                            key={it.id}
                            item={it}
                            onDelete={() => deleteItem(it.id)}
                            onEdit={(patch) => editItem(it.id, patch)}
                            onOpenComplete={() => openCompleteFor(it)}
                        />
                    ))}
                  </div>

                  {/* Floating add button */}
                  <button
                      title="Add new item"
                      onClick={addItem}
                      className="fixed bottom-[38px] right-[46px] grid h-[60px] w-[60px] place-items-center rounded-full bg-[#ff4f9a] text-[36px] text-white shadow-[0_14px_28px_rgba(255,79,154,0.35)]"
                  >
                    ＋
                  </button>
                </>
            )}
          </AnimatedMain>
        </Sidebar>

        {/* Invite friends modal */}
        {inviteOpen && (
            <>
              <div
                  className="fixed inset-0 z-[9998] bg-[rgba(0,0,0,0.4)] backdrop-blur-[3px]"
                  onClick={() => setInviteOpen(false)}
              />
              <div className="fixed left-1/2 top-1/2 z-[9999] w-[min(92vw,560px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-black/10 bg-white p-5 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
                <h3 className="mb-2 text-[20px] font-extrabold">Invite collaborators</h3>
                <p className="mb-3 text-[13px] opacity-75">
                  Share this link or add people by name. Max 4 total (including you).
                </p>

                <div className="mb-3 flex gap-2">
                  <input
                      value={inviteUrl}
                      readOnly
                      className="h-[42px] flex-1 rounded-lg border border-gray-200 bg-[#fafafa] px-3 text-[14px] outline-none"
                  />
                  <button
                      className="h-[42px] rounded-lg bg-[#111827] px-4 text-white"
                      onClick={() => navigator.clipboard.writeText(inviteUrl)}
                  >
                    Copy
                  </button>
                </div>

                <InviteForm disabled={!canAddMore} onAdd={addCollaborator} />

                <div className="mt-3 flex flex-wrap gap-2">
                  {collabs.map((c) => (
                      <span
                          key={c.id}
                          className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1.5 text-[12px]"
                      >
                  <span
                      className="grid h-[18px] w-[18px] place-items-center rounded-full text-[11px] font-bold text-white"
                      style={{ background: c.color }}
                  >
                    {initials(c.name)}
                  </span>
                        {c.name}
                        {c.id !== "me" && (
                            <button
                                onClick={() => removeCollaborator(c.id)}
                                title="Remove"
                                className="ml-1 text-xs"
                            >
                              ✕
                            </button>
                        )}
                </span>
                  ))}
                </div>

                <div className="mt-4 text-right">
                  <button
                      className="rounded-lg bg-[#111827] px-3.5 py-2 text-white"
                      onClick={() => setInviteOpen(false)}
                  >
                    Done
                  </button>
                </div>
              </div>
            </>
        )}

        {/* Complete Item modal */}
        <CompleteItemModal
            open={!!completeItem}
            item={completeItem}
            onClose={() => setCompleteItem(null)}
            onSubmit={handleCompleteSubmit}
        />
      </div>
  );
}

/* ---------------- Animated main synced with sidebar ---------------- */
function AnimatedMain({ children }: React.PropsWithChildren) {
  const { open, animate } = useSidebar();

  const [isMdUp, setIsMdUp] = React.useState<boolean>(() =>
      typeof window !== "undefined"
          ? window.matchMedia("(min-width: 768px)").matches
          : true
  );

  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e: MediaQueryListEvent) => setIsMdUp(e.matches);
    if (mq.addEventListener) mq.addEventListener("change", handler);
    else mq.addListener(handler);
    setIsMdUp(mq.matches);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", handler);
      else mq.removeListener(handler);
    };
  }, []);

  // Match Sidebar's widths: 100 (collapsed) ↔ 300 (expanded)
  const gutter = isMdUp ? (open ? 300 : 100) : 0;

  return (
      <motion.main
          className="relative min-h-screen rounded-l-3xl bg-white p-12 shadow-lg"
          animate={{ marginLeft: gutter }}
          transition={animate ? { type: "spring", stiffness: 300, damping: 32 } : { duration: 0 }}
          style={{ marginLeft: gutter }}
      >
        {children}
      </motion.main>
  );
}

/* ---------------- utils ---------------- */
function initials(name: string): string {
  return name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .slice(0, 2)
      .join("");
}
