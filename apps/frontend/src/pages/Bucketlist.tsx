// src/components/BucketList.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import IconBtn from "../components/IconBtn";
import CompleteItemModal from "../components/CompleteItemModal";
import biglogo from "../assets/biglogo.png";
import gallerylogo from "../assets/bucketlisticon.png";

/* ---------- shared types (fixes TS2304) ---------- */
export type Priority = "" | "high" | "med" | "low";
export type BucketItem = {
    id: string;
    title: string;
    desc: string;
    location: string;
    priority: Priority;
    done: boolean;
};

export default function BucketList() {
    const nav = useNavigate();

    // If your router also points /bucket/:id → BucketList, support both param + ?b=
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
        nav("/"); // back to landing/login
    }

    /* ---------------- per-bucket title (persisted) ---------------- */
    const titleKey = (n: number) => `bucket:title:${n}`;
    const [listTitle, setListTitle] = useState<string>("");

    useEffect(() => {
        const stored = localStorage.getItem(titleKey(activeBucket));
        setListTitle(stored ?? "New Bucket List");
    }, [activeBucket]);

    useEffect(() => {
        if (listTitle !== undefined && listTitle !== null) {
            try {
                localStorage.setItem(titleKey(activeBucket), listTitle);
            } catch {}
        }
    }, [listTitle, activeBucket]);

    /* ---------------- collaborators + invite modal ---------------- */
    type Collab = { id: string; name: string; color: string };
    const [collabs, setCollabs] = useState<Collab[]>([
        { id: "me", name: userName, color: "#ff6b6b" },
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

    // Persist collaborators per bucket
    const collabKey = (n: number) => `bucket:${n}:collabs`;

    // Load collabs whenever the active bucket (or username baseline) changes
    useEffect(() => {
        try {
            const raw = localStorage.getItem(collabKey(activeBucket));
            const fallback: Collab[] = [{ id: "me", name: userName, color: "#ff6b6b" }];
            setCollabs(raw ? (JSON.parse(raw) as Collab[]) : fallback);
        } catch {
            setCollabs([{ id: "me", name: userName, color: "#ff6b6b" }]);
        }
    }, [activeBucket, userName]);

    // Save collabs whenever they change
    useEffect(() => {
        try {
            localStorage.setItem(collabKey(activeBucket), JSON.stringify(collabs));
        } catch {}
    }, [collabs, activeBucket]);

    const inviteUrl = `${window.location.origin}/bucket/${activeBucket}?invite=${btoa(
        `${userName}:${activeBucket}`,
    )}`;

    /* ---------------- per-bucket items (persisted) ---------------- */
    const itemsKey = (n: number) => `bucket:${n}:items`;
    const [items, setItems] = useState<BucketItem[]>([]);

    // Helper: default starter card (used to ensure there's always one)
    const makeDefaultItem = (): BucketItem => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: "Start Building Your Bucket",
        desc: "Add Your Description",
        location: "",
        priority: "",
        done: false,
    });

    // Load items; if none, seed with a default item
    useEffect(() => {
        try {
            const raw = localStorage.getItem(itemsKey(activeBucket));
            const parsed: BucketItem[] = raw ? JSON.parse(raw) : [];
            if (!parsed || parsed.length === 0) {
                const seeded = [makeDefaultItem()];
                setItems(seeded);
                // Persist immediately so refresh still shows it
                try { localStorage.setItem(itemsKey(activeBucket), JSON.stringify(seeded)); } catch {}
            } else {
                setItems(parsed);
            }
        } catch {
            const seeded = [makeDefaultItem()];
            setItems(seeded);
            try { localStorage.setItem(itemsKey(activeBucket), JSON.stringify(seeded)); } catch {}
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeBucket]);

    // Persist on change
    useEffect(() => {
        try {
            localStorage.setItem(itemsKey(activeBucket), JSON.stringify(items));
        } catch {}
    }, [items, activeBucket]);

    const addItem = () => setItems((xs) => [...xs, makeDefaultItem()]);

    // Never allow zero cards: if deleting last, reset it to a fresh default instead
    const deleteItem = (iid: string) =>
        setItems((xs) => {
            if (xs.length <= 1) {
                return [makeDefaultItem()];
            }
            return xs.filter((x) => x.id !== iid);
        });

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
        // (Optional) send photo/date to gallery here
    };

    /* ---------------- actions ---------------- */
    const openBucket = (n: number) => {
        // update URL if you're also supporting /bucket/:id
        nav(`/bucket/${n}`);
    };

    /* ---------------- render ---------------- */
    return (
        <div style={S.app}>
            {/* Sidebar */}
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

                {Array.from({ length: 4 }).map((_, i) => {
                    const n = i + 1;
                    const active = activeBucket === n;
                    return (
                        <button
                            key={n}
                            onClick={() => openBucket(n)}
                            title={`Open Bucket ${n}`}
                            aria-current={active ? "page" : undefined}
                            style={S.bucketBtn}
                        >
                            <img
                                src={gallerylogo}
                                alt={`Bucket ${n}`}
                                style={{
                                    ...S.bucketIcon,
                                    filter: active
                                        ? "drop-shadow(0 0 0 6px rgba(255,255,255,.35)) drop-shadow(0 8px 16px rgba(0,0,0,.18))"
                                        : "drop-shadow(0 6px 12px rgba(0,0,0,.08))",
                                    transform: active ? "scale(1.04)" : "scale(1.0)",
                                }}
                            />
                        </button>
                    );
                })}

                <div style={{ flex: 1 }} />

                {/* Gallery */}
                <button
                    onClick={() => nav("/bucket-gallery")}
                    title="Bucket Gallery"
                    aria-label="Bucket Gallery"
                    style={S.iconBtn}
                >
                    🖼️
                </button>

                <div style={{ height: 12 }} />

                {/* Add bucket (placeholder) */}
                <IconBtn style={{ ...S.iconBtn, ...S.plusBtn }} title="Add bucket">
                    ＋
                </IconBtn>

                <div style={{ flex: 1 }} />

                <IconBtn title="Collaborators" style={S.iconBtn}>
                    👥
                </IconBtn>

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
                {/* Editable h1-like input (persisted) */}
                <input
                    value={listTitle}
                    onChange={(e) => setListTitle(e.target.value)}
                    placeholder="New Bucket List"
                    aria-label="Bucket list title"
                    style={S.h1Input}
                />

                {/* Collaborators row */}
                <div style={S.avatarsRow}>
                    {collabs.map((c) => (
                        <Avatar
                            key={c.id}
                            bg={c.color}
                            onRemove={c.id === "me" ? undefined : () => removeCollaborator(c.id)}
                        >
                            {initials(c.name)}
                        </Avatar>
                    ))}
                    {!canAddMore && <span style={{ fontSize: 12, opacity: 0.7 }}>(Max 4)</span>}
                    <button
                        style={S.shareBtn}
                        title="Invite collaborators (max 4)"
                        onClick={() => setInviteOpen(true)}
                    >
                        +
                    </button>
                </div>

                {/* Cards (full features) */}
                <div style={{ display: "grid", gap: 18, maxWidth: 820 }}>
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
                <button style={S.fab} title="Add new item" onClick={addItem}>
                    ＋
                </button>
            </main>

            {/* Invite friends modal */}
            {inviteOpen && (
                <>
                    <div style={S.backdrop} onClick={() => setInviteOpen(false)} />
                    <div style={S.modal}>
                        <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800 }}>
                            Invite collaborators
                        </h3>
                        <p style={{ margin: "0 0 14px", fontSize: 13, opacity: 0.75 }}>
                            Share this link or add people by name. Max 4 total (including you).
                        </p>

                        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                            <input value={inviteUrl} readOnly style={S.input} />
                            <button
                                style={S.copyBtn}
                                onClick={() => navigator.clipboard.writeText(inviteUrl)}
                            >
                                Copy
                            </button>
                        </div>

                        <InviteForm disabled={!canAddMore} onAdd={addCollaborator} />

                        <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {collabs.map((c) => (
                                <span
                                    key={c.id}
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 6,
                                        padding: "6px 10px",
                                        borderRadius: 999,
                                        background: "#f3f4f6",
                                        fontSize: 12,
                                    }}
                                >
                  <span
                      style={{
                          width: 18,
                          height: 18,
                          borderRadius: 999,
                          background: c.color,
                          color: "#fff",
                          display: "grid",
                          placeItems: "center",
                          fontSize: 11,
                          fontWeight: 700,
                      }}
                  >
                    {initials(c.name)}
                  </span>
                                    {c.name}
                                    {c.id !== "me" && (
                                        <button onClick={() => removeCollaborator(c.id)} style={S.tagX} title="Remove">
                                            ✕
                                        </button>
                                    )}
                </span>
                            ))}
                        </div>

                        <div style={{ marginTop: 16, textAlign: "right" }}>
                            <button style={S.closePrimary} onClick={() => setInviteOpen(false)}>
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

/* ---------------- Card & helpers ---------------- */

function BucketCard({
                        item,
                        onDelete,
                        onEdit,
                        onOpenComplete,
                    }: {
    item: BucketItem;
    onDelete: () => void;
    onEdit: (patch: Partial<BucketItem>) => void;
    onOpenComplete: () => void;
}) {
    const tint = priorityTint(item.priority);
    return (
        <section style={{ ...S.card, background: tint }}>
            {/* LEFT: Complete / Completed pill + editable title/desc */}
            <div style={S.cardLeft}>
                <button
                    aria-label={item.done ? "Completed" : "Complete with photo"}
                    onClick={onOpenComplete}
                    style={item.done ? S.completedPill : S.completePillLeft}
                    title={item.done ? "Completed" : "Complete with photo"}
                >
                    {item.done ? "Completed" : "Complete"}
                </button>

                <div>
                    <input
                        value={item.title}
                        onChange={(e) => onEdit({ title: e.target.value })}
                        style={S.cardTitle}
                    />
                    <input
                        value={item.desc}
                        onChange={(e) => onEdit({ desc: e.target.value })}
                        style={S.cardDesc}
                    />
                </div>
            </div>

            {/* RIGHT: delete + Location input + Priority (3 dots) */}
            <div style={S.cardRight}>
                <button title="Delete" onClick={onDelete} style={S.closeBtn}>
                    ✕
                </button>

                <div style={S.metaBox}>
                    <div style={S.metaRow}>
                        <span style={S.metaLabel}>Location:</span>
                        <input
                            placeholder="—"
                            value={item.location}
                            onChange={(e) => onEdit({ location: e.target.value })}
                            style={S.metaInput}
                        />
                    </div>

                    <div style={S.metaRow}>
                        <span style={S.metaLabel}>Priority:</span>
                        <div style={{ display: "flex", gap: 10 }}>
                            {PRIORITY_OPTS.map((opt) => (
                                <button
                                    key={opt.key}
                                    onClick={() => onEdit({ priority: opt.key })}
                                    title={opt.title}
                                    aria-label={`Set priority ${opt.title}`}
                                    style={{
                                        ...S.priorityDot,
                                        backgroundColor: opt.color,
                                        border:
                                            item.priority === opt.key ? "3px solid #1f2937" : "2px solid #d1d5db",
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function InviteForm({
                        disabled,
                        onAdd,
                    }: {
    disabled: boolean;
    onAdd: (name: string) => void;
}) {
    const [name, setName] = useState("");
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                if (!disabled) {
                    onAdd(name);
                    setName("");
                }
            }}
            style={{ display: "flex", gap: 8 }}
        >
            <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={disabled ? "Max collaborators reached" : "Add by name (e.g., Grace)"}
                disabled={disabled}
                style={S.input}
            />
            <button type="submit" disabled={disabled} style={S.addBtn}>
                Add
            </button>
        </form>
    );
}

function Avatar({
                    children,
                    bg,
                    onRemove,
                }: React.PropsWithChildren<{ bg: string; onRemove?: () => void }>) {
    return (
        <span style={{ position: "relative" }}>
      <span
          style={{
              width: 34,
              height: 34,
              borderRadius: 999,
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontWeight: 700,
              fontSize: 14,
              boxShadow: "0 4px 12px rgba(0,0,0,.08)",
              background: bg,
          }}
      >
        {children}
      </span>
            {onRemove && (
                <button
                    onClick={onRemove}
                    title="Remove collaborator"
                    style={{
                        position: "absolute",
                        right: -6,
                        top: -6,
                        width: 18,
                        height: 18,
                        borderRadius: 999,
                        border: "none",
                        background: "#fff",
                        color: "#111",
                        boxShadow: "0 2px 6px rgba(0,0,0,.15)",
                        fontSize: 12,
                        cursor: "pointer",
                    }}
                >
                    ×
                </button>
            )}
    </span>
    );
}

/* ---------------- utils & constants ---------------- */
function initials(name: string): string {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .slice(0, 2)
        .join("");
}

function priorityTint(p: Priority): string {
    return p === "high" ? "#ffd2dc" : p === "med" ? "#ffe28f" : p === "low" ? "#56c98d" : "#ffe0ea";
}

const PRIORITY_OPTS: Array<{ key: "high" | "med" | "low"; color: string; title: string }> = [
    { key: "high", color: "#ff91a3", title: "High (Pink)" },
    { key: "med", color: "#ffd93d", title: "Medium (Yellow)" },
    { key: "low", color: "#00b050", title: "Low (Green)" },
];

/* ---------------- styles ---------------- */
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

    // H1-looking input
    h1Input: {
        margin: "0 0 18px",
        fontSize: 42,
        letterSpacing: 0.2,
        fontWeight: 800,
        background: "transparent",
        border: "none",
        outline: "none",
        width: "100%",
        color: "#1f2430",
    },

    avatarsRow: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 16,
    },

    card: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "stretch",
        borderRadius: 18,
        padding: 18,
        maxWidth: 780,
        boxShadow: "0 10px 26px rgba(0,0,0,.08)",
    },
    cardLeft: { display: "flex", gap: 14, alignItems: "center" },

    // Editable fields
    cardTitle: {
        background: "transparent",
        border: "none",
        outline: "none",
        fontSize: 18,
        fontWeight: 800,
        color: "#222",
        minWidth: 260,
    },
    cardDesc: {
        background: "transparent",
        border: "none",
        outline: "none",
        fontSize: 13,
        color: "#333",
        opacity: 0.85,
        marginTop: 2,
        minWidth: 220,
    },

    // LEFT pill (Complete)
    completePillLeft: {
        height: 34,
        padding: "0 12px",
        borderRadius: 999,
        border: "none",
        background: "#ff4f9a",
        color: "#fff",
        fontWeight: 800,
        cursor: "pointer",
        boxShadow: "0 6px 16px rgba(255,79,154,.35)",
        marginRight: 12,
    },
    completedPill: {
        height: 34,
        padding: "0 12px",
        borderRadius: 999,
        border: "none",
        background: "#22c55e",
        color: "#fff",
        fontWeight: 800,
        cursor: "default",
        opacity: 0.9,
        marginRight: 12,
    },

    // RIGHT meta
    cardRight: { display: "flex", alignItems: "flex-start", gap: 10 },
    closeBtn: {
        border: "none",
        background: "#00000022",
        color: "#fff",
        width: 26,
        height: 26,
        borderRadius: 999,
        cursor: "pointer",
        lineHeight: 0,
        marginRight: 4,
    },
    metaBox: { background: "rgba(255,255,255,.55)", padding: "10px 12px", borderRadius: 14 },
    metaRow: { display: "flex", alignItems: "center", gap: 10, marginTop: 6 },
    metaLabel: { fontSize: 12, color: "#111", opacity: 0.7, minWidth: 64 },
    metaInput: {
        border: "none",
        background: "#fff",
        borderRadius: 10,
        padding: "6px 8px",
        fontSize: 12,
        minWidth: 140,
    },
    priorityDot: { width: 22, height: 22, borderRadius: "50%", cursor: "pointer" },

    // buttons
    shareBtn: {
        width: 40,
        height: 40,
        borderRadius: 999,
        border: "none",
        cursor: "pointer",
        background: "#ff4f9a",
        color: "#fff",
        fontSize: 24,
        lineHeight: 0,
        display: "grid",
        placeItems: "center",
        boxShadow: "0 10px 24px rgba(255,79,154,.35)",
    },

    fab: {
        position: "absolute",
        right: 46,
        bottom: 38,
        width: 60,
        height: 60,
        borderRadius: 999,
        border: "none",
        cursor: "pointer",
        background: "#ff4f9a",
        color: "#fff",
        fontSize: 36,
        lineHeight: 0,
        boxShadow: "0 14px 28px rgba(255,79,154,.35)",
    },

    /* modal shared styles */
    backdrop: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.4)",
        backdropFilter: "blur(3px)",
        zIndex: 9998,
    },
    modal: {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "min(92vw, 560px)",
        background: "#fff",
        borderRadius: 18,
        boxShadow: "0 24px 80px rgba(0,0,0,.25)",
        border: "1px solid rgba(0,0,0,.08)",
        padding: 20,
        zIndex: 9999,
    },
    input: {
        flex: 1,
        height: 42,
        borderRadius: 10,
        border: "1px solid #e5e7eb",
        padding: "0 12px",
        fontSize: 14,
        outline: "none",
        background: "#fafafa",
    },
    copyBtn: {
        height: 42,
        padding: "0 14px",
        borderRadius: 10,
        border: "none",
        background: "#111827",
        color: "#fff",
        cursor: "pointer",
    },
    addBtn: {
        height: 42,
        padding: "0 16px",
        borderRadius: 10,
        border: "none",
        background: "#10b981",
        color: "#fff",
        cursor: "pointer",
    },
    tagX: {
        border: "none",
        background: "transparent",
        cursor: "pointer",
        fontSize: 12,
        lineHeight: 1,
        padding: 0,
    },
    closePrimary: {
        border: "none",
        background: "#111827",
        color: "#fff",
        borderRadius: 10,
        padding: "8px 14px",
        cursor: "pointer",
    },
};
