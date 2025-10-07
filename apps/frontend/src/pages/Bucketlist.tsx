import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  useNavigate,
  useParams,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import { motion } from "motion/react";
import CompleteItemModal from "../components/CompleteItemModal";
import biglogo from "../assets/biglogo.png";
import gallerylogo from "../assets/bucketlisticon.png";
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
  useSidebar,
} from "../components/SideNav";
import BucketCard, { Priority, BucketItem } from "../components/BucketCard";
import InviteForm from "../components/InviteForm";
import Avatar from "../components/Avatar";
import friend from "../assets/icons8-person-64.png";
import BucketGallery, {
  GALLERY_LS_KEY,
} from "../components/BucketGalleryPanel";

interface UserType {
  first: string;
  last: string;
  email: string;
}

interface Collab {
  id: string;
  name: string;
  color: string;
}

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
    const n =
        Number.isFinite(fromParam) && fromParam > 0 ? fromParam : fromQuery || 1;
    return Math.min(Math.max(n, 1), 4);
  }, [id, q]);

  /* ---------------- auth / profile menu ---------------- */
  const [user, setUser] = useState<UserType | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error("Error fetching user:", err);
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, []);

  const displayName = user ? `${user.first} ${user.last}` : "User";

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

  async function handleLogout() {
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" });
    } catch (err) {
      console.error("Logout failed:", err);
    }
    nav("/");
  }

  /* ---------------- per-bucket title ---------------- */
  const titleKey = (n: number) => `bucket:title:${n}`;
  const [listTitle, setListTitle] = useState<string>("");
  const titleDebounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user?.email) return;

    // Try to get cached title from localStorage first
    const cachedTitle = localStorage.getItem(titleKey(activeBucket));
    if (cachedTitle) {
      setListTitle(cachedTitle);
      return; // no need to fetch from server
    }

    // Otherwise fetch from server
    const fetchTitle = async () => {
      try {
        const res = await fetch(
            `/api/item-action/get-bucket-title?bucketNumber=${activeBucket}&email=${user.email}`
        );
        const data: { bucketTitle: string } = await res.json();
        const title = data.bucketTitle ?? "";
        setListTitle(title);
        localStorage.setItem(titleKey(activeBucket), title);
      } catch (err) {
        console.error("Failed to fetch bucket title:", err);
        setListTitle("");
      }
    };

    fetchTitle();
  }, [activeBucket, user?.email]);

  /* ---------------- Sidebar titles ---------------- */
  const [sidebarTitles, setSidebarTitles] = useState<string[]>([
    "",
    "",
    "",
    "",
  ]);
  useEffect(() => {
    const titles = [1, 2, 3, 4].map((n) => {
      return localStorage.getItem(titleKey(n)) ?? `Bucket ${n}`;
    });
    setSidebarTitles(titles);
  }, [listTitle, activeBucket]);

  const handleBucketTitleChange = (newTitle: string) => {
    setListTitle(newTitle);
    localStorage.setItem(titleKey(activeBucket), newTitle);

    if (titleDebounceRef.current) clearTimeout(titleDebounceRef.current);

    titleDebounceRef.current = setTimeout(async () => {
      if (!user?.email) return;

      try {
        const res = await fetch("/api/item-action/update-bucket-title", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            bucketNumber: activeBucket,
            bucketTitle: newTitle,
          }),
        });
        const result = await res.json();

        if (!result.success) console.warn("Bucket title update failed");

        // **Optional:** update local state for all items
        setItems((prevItems) =>
            prevItems.map((item) => ({ ...item, bucketTitle: newTitle }))
        );
      } catch (err) {
        console.error("Failed to update bucket title:", err);
      }
    }, 400);
  };

  /* ---------------- collaborators ---------------- */
  const [collabs, setCollabs] = useState<Collab[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);

  useEffect(() => {
    if (!user?.email) return;
    try {
      const raw = localStorage.getItem(`bucket:${activeBucket}:collabs`);
      const fallback: Collab[] = [
        { id: "me", name: user.email, color: "#ff6b6b" },
      ];
      setCollabs(raw ? (JSON.parse(raw) as Collab[]) : fallback);
    } catch {
      setCollabs([{ id: "me", name: user.email, color: "#ff6b6b" }]);
    }
  }, [activeBucket, user?.email]);

  useEffect(() => {
    try {
      localStorage.setItem(
          `bucket:${activeBucket}:collabs`,
          JSON.stringify(collabs)
      );
    } catch {}
  }, [collabs, activeBucket]);

  const canAddMore = collabs.length < 4;
  const addCollaborator = (raw: string) => {
    const name = raw.trim();
    if (!name || !canAddMore) return;
    if (collabs.some((c) => c.name.toLowerCase() === name.toLowerCase()))
      return;
    const palette = [
      "#2ecc71",
      "#3498db",
      "#9b59b6",
      "#f39c12",
      "#e67e22",
      "#e84393",
    ];
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

  const inviteUrl = user
      ? `${window.location.origin}/bucket/${activeBucket}?invite=${btoa(
          `${user.email}:${activeBucket}`
      )}`
      : "";

  /* ---------------- bucket items ---------------- */
  const [items, setItems] = useState<BucketItem[]>([]);
  const editDebounceRef = useRef<Record<string, NodeJS.Timeout>>({});

  const makeDefaultItem = (): BucketItem => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: "",
    desc: "",
    location: "",
    priority: "",
    done: false,
    _id: undefined, // not set until saved
  });

  // Fetch ALL items (both done + not done) so we can sort and show completed at the bottom.
  useEffect(() => {
    if (!user?.email) return;
    const fetchItems = async () => {
      try {
        // no done filter → return every item for this bucket
        const res = await fetch(
            `/api/item-action?bucketNumber=${activeBucket}&email=${user.email}`
        );
        const data: BucketItem[] = await res.json();
        setItems(data.length ? data : [makeDefaultItem()]);
      } catch (err) {
        console.error("Failed to fetch items:", err);
        setItems([makeDefaultItem()]);
      }
    };
    fetchItems();
  }, [activeBucket, user?.email]);

  const addItem = () => setItems((xs) => [...xs, makeDefaultItem()]);

  const deleteItem = (iid: string) => {
    setItems((xs) => {
      const remaining = xs.filter((x) => x.id !== iid);
      const toDelete = xs.find((x) => x.id === iid);
      if (!toDelete || !user?.email) return xs;

      fetch(
          `/api/item-action?email=${user.email}&bucketNumber=${activeBucket}&id=${toDelete.id}`,
          {
            method: "DELETE",
          }
      )
          .then((res) => res.json())
          .then((result) => {
            if (!result.success) console.warn("Delete failed:", result.message);
          })
          .catch(console.error);

      return remaining.length ? remaining : [makeDefaultItem()];
    });
  };

  const editItem = (iid: string, patch: Partial<BucketItem>) => {
    setItems((xs) => {
      const updatedItems = xs.map((x) =>
          x.id === iid ? { ...x, ...patch } : x
      );
      const updatedItem = updatedItems.find((x) => x.id === iid);
      if (!updatedItem || !user?.email) return xs;

      if (editDebounceRef.current[iid])
        clearTimeout(editDebounceRef.current[iid]);
      editDebounceRef.current[iid] = setTimeout(async () => {

        try {
          const res = await fetch("/api/item-action", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              _id: updatedItem._id, // undefined if new
              email: user.email,
              bucketNumber: activeBucket,
              bucketTitle: listTitle,
              title: updatedItem.title,
              desc: updatedItem.desc,
              location: updatedItem.location,
              priority: updatedItem.priority,
              done: updatedItem.done,
            }),
          });
          const savedItem = await res.json();
          setItems((xs2) =>
              xs2.map((x) => (x.id === iid ? { ...x, _id: savedItem._id } : x))
          );
        } catch (err) {
          console.error("Failed to save item:", err);
        }
      }, 400);

      return updatedItems;
    });
  };

  /* ---------- “complete” flow: mark done, push photo to gallery, keep in list ---------- */
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
    uploadedUrl: string;
    photoKind: "upload" | "camera" | null;
  }) => {
    if (!args.uploadedUrl) {
      alert("Please upload a photo to complete this item.");
      return;
    }
    const imageUrl = args.uploadedUrl;
    if (imageUrl.startsWith("blob:")) {
      alert(
          "Image upload did not complete. Please wait for the upload to finish."
      );
      return;
    }
    if (!completeItem) return;
    const itemToUpdate = items.find((x) => x.id === completeItem.id);
    if (!itemToUpdate || !user?.email) return;

    // 1) Optimistically mark the item done (keeps it in the list)
    setItems((xs) =>
        xs.map((x) => (x.id === completeItem.id ? { ...x, done: true } : x))
    );

    // 2) Add photo to gallery LS
    try {
      const raw = localStorage.getItem(GALLERY_LS_KEY);
      const gallery = raw ? JSON.parse(raw) : [];
      const newPhoto = {
        id: itemToUpdate.id,
        title: itemToUpdate.title,
        desc: itemToUpdate.desc,
        date: args.dateCompleted || new Date().toISOString().slice(0, 10),
        src: imageUrl,
        createdAt: new Date().toISOString(),
        extra: {
          location: itemToUpdate.location,
          priority: itemToUpdate.priority,
        },
      };
      gallery.unshift(newPhoto);
      localStorage.setItem(GALLERY_LS_KEY, JSON.stringify(gallery));
      window.dispatchEvent(new Event("gallery:changed"));
      console.log("Gallery after completion:", gallery);
    } catch (err) {
      console.error("Failed to add to gallery:", err);
    }


    // 3) Persist to backend (done + image), keep item locally (no refetch)
    try {
      const res = await fetch("/api/item-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: itemToUpdate._id,
          email: user.email,
          bucketNumber: activeBucket,
          bucketTitle: listTitle,
          title: itemToUpdate.title,
          desc: itemToUpdate.desc,
          location: itemToUpdate.location,
          priority: itemToUpdate.priority,
          done: true,
          image: imageUrl,
        }),
      });

      // If server returns an _id for a brand-new item, stitch it in
      if (res.ok) {
        const saved = await res.json().catch(() => ({}));
        if (saved && saved._id) {
          setItems((xs) =>
              xs.map((x) =>
                  x.id === itemToUpdate.id ? { ...x, _id: saved._id } : x
              )
          );
        }
      }
    } catch (err) {
      console.error("Failed to complete item:", err);
      alert("Failed to complete item.");
    }




    setCompleteItem(null);
  };


  // Map many possible priority encodings → rank (0 best)
  function priorityRank(v: unknown): number {
    if (v === null || v === undefined) return 3;

    // numeric variants
    if (typeof v === "number") {
      if (v <= 0) return 0;     // 0 = high/pink
      if (v === 1) return 1;    // 1 = med/yellow
      if (v >= 2) return 2;     // 2+ = low/green
    }

    const s = String(v).trim().toLowerCase();

    // common names & aliases
    if (["pink", "p", "high", "hi", "hot", "rose", "red"].includes(s)) return 0;
    if (["yellow", "y", "amber", "med", "medium"].includes(s)) return 1;
    if (["green", "g", "low"].includes(s)) return 2;

    // hex/color-ish fallbacks (optional)
    if (s.includes("#ff") && (s.includes("99a7") || s.includes("a5a5"))) return 0; // pink-ish
    if (s.includes("ffd6") || s.includes("fde68a")) return 1;                       // yellow-ish
    if (s.includes("34d3") || s.includes("86ef") || s.includes("16a3")) return 2;   // green-ish

    return 3; // unknown/unset → bottom
  }


  /* ---------------- computed ordering + reset logic ---------------- */
  const orderedItems = useMemo(() => {
    // stable sort: incomplete first, then by priority (pink→yellow→green), keep original order on ties
    return [...items]
        .map((it, idx) => ({ it, idx }))
        .sort((a, b) => {
          // 1) done status (incomplete on top)
          const doneA = Number(a.it.done);
          const doneB = Number(b.it.done);
          if (doneA !== doneB) return doneA - doneB;

          // 2) priority rank
          const ra = priorityRank((a.it as any).priority);
          const rb = priorityRank((b.it as any).priority);
          if (ra !== rb) return ra - rb;

          // 3) preserve original order for stability
          return a.idx - b.idx;
        })
        .map(({ it }) => it);
  }, [items]);


  const allFinished = items.length > 0 && items.every((i) => i.done);

  async function resetWholeList() {
    if (!confirm("Reset this bucket back to an empty list?")) return;

    // client-side reset
    setItems([makeDefaultItem()]);

    // optional server reset (best-effort; ignore failure)
    try {
      await fetch(
          `/api/item-action/reset-bucket?email=${encodeURIComponent(
              user?.email || ""
          )}&bucketNumber=${activeBucket}`,
          { method: "POST" }
      );
    } catch (e) {
      // ignore
    }
  }

  /* ---------------- actions ---------------- */
  const openBucket = (n: number) => nav(`/bucket/${n}`);
  const galleryOpen = location.pathname.endsWith("/bucket/gallery");
  const goGallery = () => nav("/bucket/gallery");
  const goList = () => nav(`/bucket/${activeBucket}`);

  if (loadingUser) return <div>Loading...</div>;

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
                      className="mb-2 overflow-hidden whitespace-nowrap px-2 font-roboto font-medium text-[#302F4D]"
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

            {/* Profile + Logout as SidebarLink */}
            <SidebarLink
                link={{
                  href: "#",
                  label: displayName,
                  icon: (
                      <span className="flex items-center justify-center h-[38px] w-[38px] min-w-[38px] min-h-[38px] rounded-full bg-[#FF99A7] font-medium text-white text-center text-xl transition-none">
                  {displayName.charAt(0).toUpperCase()}
                </span>
                  ),
                }}
                className="mb-2 overflow-hidden whitespace-nowrap px-2 font-roboto font-medium text-[#302F4D] ml-2"
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.preventDefault();
                  setShowProfile((s) => !s);
                }}
            />
            {showProfile && (
                <div
                    role="menu"
                    className="absolute left-1/4 mb-2 -translate-x-1/5 translate-y-[620px] z-80 min-w-[100px] flex flex-col items-center"
                >
                  <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full rounded-full bg-[#0092E0] px-3 py-2 text-xs font-bold text-white"
                  >
                    Log Out
                  </button>
                </div>
            )}
          </SidebarBody>

          {/* Animated main that condenses/expands with the sidebar */}
          <AnimatedMain>
            {galleryOpen ? (
                <div className="mb-6 flex items-center justify-between">
                  <h1 className="text-[42px] font-extrabold font-roboto leading-none text-[#302F4D]">
                    All Buckets Gallery
                  </h1>
                </div>
            ) : (
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <input
                      value={listTitle}
                      onChange={(e) => handleBucketTitleChange(e.target.value)}
                      placeholder="New Bucket List"
                      aria-label="Bucket list title"
                      className="flex-1 bg-transparent text-[42px] font-bold font-roboto text-[#302F4D] leading-none outline-none min-w-[240px]"
                  />
                  <div className="flex items-center gap-2 shrink-0">
                    {collabs.map((c) => (
                        <Avatar
                            key={c.id}
                            bg={c.color}
                            onRemove={
                              c.id === "me" ? undefined : () => removeCollaborator(c.id)
                            }
                        >
                          {initials(c.name)}
                        </Avatar>
                    ))}
                    {!canAddMore && <span className="opacity-70">(Max 4)</span>}
                    <button
                        title="Invite collaborators (max 4)"
                        onClick={() => setInviteOpen(true)}
                        className="grid h-10 w-10 place-items-center justify-center rounded-full bg-[#FF99A7]"
                    >
                      <img src={friend} alt="Invite" className="h-6 w-6" />
                    </button>

                    <button
                        title="Clear this bucket (delete all items)"
                        aria-label="Clear this bucket"
                        onClick={resetWholeList}
                        className="grid h-10 w-10 place-items-center justify-center rounded-full bg-[#F87171] text-white font-bold hover:opacity-90"
                    >
                      🗑
                    </button>




                  </div>
                </div>
            )}

            {galleryOpen ? (
                <BucketGallery />
            ) : (
                <>
                  {/* Top bar: optional reset when all items are finished */}
                  {allFinished && (
                      <div className="mb-4">
                        <button
                            type="button"
                            onClick={resetWholeList}
                            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 hover:bg-rose-100"
                            title="Reset bucket to empty"
                        >
                          Reset Bucket
                        </button>
                      </div>
                  )}

                  {/* Cards — render ordered so completed sink to the bottom */}
                  <div className="grid max-w-[820px] gap-[18px]">
                    {orderedItems.map((it) => (
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
                      className="fixed bottom-[50px] right-[75px] grid h-[60px] w-[60px] place-items-center rounded-full bg-[#FF99A7] text-[36px] text-white"
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
                <h3 className="mb-2 text-[20px] font-extrabold">
                  Invite collaborators
                </h3>
                <p className="mb-3 text-[13px] opacity-75">
                  Share this link or add people by name. Max 4 total (including
                  you).
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
          className="relative min-h-screen rounded-l-[35px] bg-white p-20 shadow-lg"
          animate={{ marginLeft: gutter }}
          transition={
            animate
                ? { type: "spring", stiffness: 300, damping: 32 }
                : { duration: 0 }
          }
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
