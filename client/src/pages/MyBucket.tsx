// src/pages/MyBucket.tsx
import React, { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import IconBtn from "../components/IconBtn";
import CompleteItemModal from "../components/CompleteItemModal";

/**
 * MyBucket
 * Personal bucket view for a single bucket (1..4).
 * Includes a "share/collaborate" (+) button near the header.
 * - Up to 4 collaborators MAX (including the owner).
 * - Invite modal lets you copy a link and add collaborators by name.
 * - NEW: Right-side dot opens a Complete Item modal (upload image / take picture).
 */
export default function MyBucket() {
    const nav = useNavigate();
    const { id } = useParams<{ id?: string }>();
    const [q] = useSearchParams();

    // Which bucket number is open (1..4)
    const activeBucket = useMemo(() => {
        const fromParam = Number(id);
        const fromQuery = Number(q.get("b"));
        const n =
            Number.isFinite(fromParam) && fromParam > 0 ? fromParam : fromQuery || 1;
        return Math.min(Math.max(n, 1), 4);
    }, [id, q]);

    // TODO: replace with real auth user (for now matches your hardcode idea)
    const userName = "Amanda"; // "Grace", "Nia", etc. when you hardcode login mapping.

    /* ------------------- Collaborators ------------------- */
    type Collab = { id: string; name: string; color: string };
    const INITIAL_COLLABS: Collab[] = [
        { id: "me", name: userName, color: "#ff6b6b" }, // owner always present
    ];

    const [collabs, setCollabs] = useState<Collab[]>(INITIAL_COLLABS);
    const [inviteOpen, setInviteOpen] = useState(false);

    const canAddMore = collabs.length < 4; // owner counts towards 4

    const addCollaborator = (raw: string) => {
        const name = raw.trim();
        if (!name) return;
        if (!canAddMore) return;
        // Avoid duplicates by name
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
        const color = palette[Math.floor(Math.random() * palette.length)];
        setCollabs((cs) => [
            ...cs,
            {
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                name,
                color,
            },
        ]);
    };

    const removeCollaborator = (id: string) => {
        // Don't allow removing the owner
        if (id === "me") return;
        setCollabs((cs) => cs.filter((c) => c.id !== id));
    };

    const inviteUrl = `${window.location.origin}/bucket/${activeBucket}?invite=${btoa(
        `${userName}:${activeBucket}`
    )}`;

    /* ------------------- Items (demo) ------------------- */
    type Priority = "high" | "med" | "low";
    type BucketItem = {
        id: string;
        title: string;
        desc: string;
        location: string;
        priority: Priority;
        done: boolean;
    };

    const [items, setItems] = useState<Array<BucketItem>>([
        {
            id: "i1",
            title: "Go to a pumpkin patch",
            desc: "Pick a pumpkin and take photos!",
            location: "Tougas Family Farm, 234 Ball St, Northborough, MA 01532",
            priority: "high",
            done: false,
        },
        {
            id: "i2",
            title: "Crash a wedding",
            desc: "Specifically a really fancy wedding at the beach",
            location: "",
            priority: "med",
            done: false,
        },
        {
            id: "i3",
            title: "Learn how to play volleyball",
            desc: "I want my bf to teach me because he's really good",
            location: "",
            priority: "low",
            done: false,
        },
    ]);

    const deleteItem = (iid: string) =>
        setItems((xs) => xs.filter((x) => x.id !== iid));
    const toggleDone = (iid: string) =>
        setItems((xs) => xs.map((x) => (x.id === iid ? { ...x, done: !x.done } : x)));

    const openBucket = (n: number) => nav(`/bucket/${n}`);

    /* ------------------- Complete Item Modal wiring ------------------- */
    // Local type (aligned with CompleteItemModal props)
    type ModalItem = {
        id: string;
        title: string;
        subtitle?: string;
        locationName?: string;
        address1?: string;
        cityStateZip?: string;
    };

    const [completeItem, setCompleteItem] = useState<ModalItem | null>(null);

    const openCompleteFor = (it: BucketItem) => {
        // Map your item fields to the modal fields
        // (we’ll put desc under subtitle and location in locationName)
        setCompleteItem({
            id: it.id,
            title: it.title,
            subtitle: it.desc || undefined,
            locationName: it.location || undefined,
        });
    };

    const handleCompleteSubmit = async (args: {
        itemId: string;
        dateCompleted?: string;
        photo?: File | Blob;
        photoKind: "upload" | "camera" | null;
    }) => {
        // Example: mark as done locally and (optionally) upload the photo
        setItems((xs) =>
            xs.map((x) => (x.id === args.itemId ? { ...x, done: true } : x))
        );

        // If you have an API, you can send:
        // const form = new FormData();
        // form.append("itemId", args.itemId);
        // if (args.dateCompleted) form.append("dateCompleted", args.dateCompleted);
        // if (args.photo) {
        //   form.append(
        //     "photo",
        //     args.photo,
        //     args.photo instanceof File ? args.photo.name : "camera.jpg"
        //   );
        // }
        // await fetch("/api/bucket/complete", { method: "POST", body: form });
        console.log("Completed:", args);
    };

    return (
        <div style={S.app}>
            {/* Sidebar */}
            <aside style={S.sidebar}>
                <img
                    src="/assets/logo.png"
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
                    const active = n === activeBucket;
                    return (
                        <button
                            key={n}
                            onClick={() => openBucket(n)}
                            title={`Open Bucket ${n}`}
                            style={S.bucketBtn}
                            aria-current={active ? "page" : undefined}
                        >
                            <img
                                src="/assets/bucket.png"
                                alt={`Bucket ${n}`}
                                style={{
                                    width: 42,
                                    height: 42,
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
                {/* IconBtn needs styles — pass S.iconBtn + S.plusBtn */}
                <IconBtn style={{ ...S.iconBtn, ...S.plusBtn }} title="Add bucket">
                    ＋
                </IconBtn>
                <div style={{ flex: 1 }} />
                <IconBtn title="Collaborators" style={S.iconBtn}>
                    👥
                </IconBtn>
                <IconBtn
                    title="Profile"
                    style={{ ...S.iconBtn, fontWeight: 700, background: "transparent" }}
                >
                    A
                </IconBtn>
            </aside>

            {/* Main */}
            <main style={S.main}>
                <header
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <h1 style={S.h1}>{userName}'s Bucket</h1>

                    {/* Right-side: share (+) and the tiny logo */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {/* Share (+) */}
                        <button
                            style={S.shareBtn}
                            title="Invite collaborators (max 4)"
                            onClick={() => setInviteOpen(true)}
                        >
                            +
                        </button>

                        <img
                            src="/assets/logo.png"
                            alt=""
                            style={{ width: 42, height: 42, borderRadius: 12 }}
                        />
                    </div>
                </header>

                {/* Collaborators avatars */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 10,
                    }}
                >
                    {collabs.map((c) => (
                        <Avatar
                            key={c.id}
                            bg={c.color}
                            onRemove={c.id === "me" ? undefined : () => removeCollaborator(c.id)}
                        >
                            {initials(c.name)}
                        </Avatar>
                    ))}
                    {!canAddMore && (
                        <span style={{ fontSize: 12, opacity: 0.7 }}>(Max 4)</span>
                    )}
                </div>

                <div style={{ marginTop: 8 }}>
                    {items.map((it) => (
                        <BucketCard
                            key={it.id}
                            item={it}
                            onDelete={() => deleteItem(it.id)}
                            onToggle={() => toggleDone(it.id)}
                            onOpenComplete={() => openCompleteFor(it)} // ← NEW
                        />
                    ))}

                    {/* 🔥 TEMP TEST BUTTON to open CompleteItemModal manually */}
                    <button
                        style={{
                            marginTop: 20,
                            padding: "10px 16px",
                            borderRadius: 8,
                            border: "none",
                            background: "#10b981",
                            color: "#fff",
                            fontWeight: 700,
                            cursor: "pointer",
                        }}
                        onClick={() =>
                            setCompleteItem({
                                id: "test",
                                title: "Test Bucket Item",
                                subtitle: "Just checking the modal opens",
                                locationName: "Testville",
                            })
                        }
                    >
                        Open CompleteItemModal (test)
                    </button>
                </div>




                {/* Floating add button (add list item) */}
                <button style={S.fab} title="Add item">
                    ＋
                </button>
            </main>

            {/* Invite / Share modal */}
            {inviteOpen && (
                <>
                    <div style={S.backdrop} onClick={() => setInviteOpen(false)} />
                    <div style={S.modal}>
                        <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800 }}>
                            Invite collaborators
                        </h3>
                        <p style={{ margin: "0 0 14px", fontSize: 13, opacity: 0.75 }}>
                            Share this link or add people by name. Max 4 total (including
                            you).
                        </p>

                        {/* Copy link */}
                        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                            <input value={inviteUrl} readOnly style={S.input} />
                            <button
                                style={S.copyBtn}
                                onClick={() => {
                                    navigator.clipboard.writeText(inviteUrl);
                                }}
                            >
                                Copy
                            </button>
                        </div>

                        {/* Add by name */}
                        <InviteForm
                            disabled={!canAddMore}
                            onAdd={(name) => addCollaborator(name)}
                        />

                        {/* Current list */}
                        <div
                            style={{
                                marginTop: 12,
                                display: "flex",
                                gap: 8,
                                flexWrap: "wrap",
                            }}
                        >
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
                                        <button
                                            onClick={() => removeCollaborator(c.id)}
                                            style={S.tagX}
                                            title="Remove"
                                        >
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

            {/* NEW: Complete Item modal */}
            <CompleteItemModal
                open={!!completeItem}
                item={completeItem}
                onClose={() => setCompleteItem(null)}
                onSubmit={handleCompleteSubmit}
            />
        </div>
    );
}

/* ---------------- Components ---------------- */

function BucketCard({
                        item,
                        onDelete,
                        onToggle,
                        onOpenComplete, // ← NEW
                    }: {
    item: BucketItem;
    onDelete: () => void;
    onToggle: () => void;
    onOpenComplete: () => void;
}) {
    const tint = priorityTint(item.priority);
    const dot = priorityDot(item.priority);

    return (
        <section style={{ ...S.card, background: tint }}>
            {/* left: toggle + text */}
            <div style={S.cardLeft}>
                <button
                    aria-label="Mark complete (quick toggle)"
                    onClick={onToggle}
                    style={{ ...S.toggle, opacity: item.done ? 0.5 : 1 }}
                >
          <span
              style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: item.done ? "#10b981" : "#fff",
                  display: "block",
                  border: "2px solid rgba(0,0,0,.25)",
              }}
          />
                </button>
                <div>
                    <div
                        style={{
                            ...S.cardTitle,
                            textDecoration: item.done ? "line-through" : "none",
                        }}
                    >
                        {item.title}
                    </div>
                    <div style={S.cardDesc}>{item.desc}</div>
                </div>
            </div>

            {/* right: meta + right-side "complete" dot + delete */}
            <div style={S.cardRight}>
                <div style={S.metaStack}>
                    {item.location && (
                        <div style={S.metaRow}>
                            <span style={S.metaLabel}>Location:</span>
                            <span style={S.metaText}>{item.location}</span>
                        </div>
                    )}
                    <div style={S.metaRow}>
                        <span style={S.metaLabel}>Priority:</span>
                        <span
                            title={item.priority}
                            style={{
                                width: 12,
                                height: 12,
                                borderRadius: "50%",
                                background: dot,
                                display: "inline-block",
                            }}
                        />
                    </div>
                </div>

                {/* NEW: the right-side "dot" that opens the big completion modal */}
                <button
                    aria-label="Open complete modal"
                    onClick={onOpenComplete}
                    style={S.completeDot}
                    title="Complete with photo"
                >
                    {/* empty inner circle for visual */}
                    <span style={S.completeDotInner} />
                </button>

                <button onClick={onDelete} title="Delete" style={S.closeBtn}>
                    ✕
                </button>
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

/* ---------------- Utils ---------------- */
function initials(name: string): string {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .slice(0, 2)
        .join("");
}

type Priority = "high" | "med" | "low";
type BucketItem = {
    id: string;
    title: string;
    desc: string;
    location: string;
    priority: Priority;
    done: boolean;
};

function priorityTint(p: Priority): string {
    switch (p) {
        case "high":
            return "#ffd2dc"; // pink card
        case "med":
            return "#ffe28f"; // yellow card
        case "low":
            return "#56c98d"; // green card
        default:
            return "#fff";
    }
}
function priorityDot(p: Priority): string {
    switch (p) {
        case "high":
            return "#ff91a3";
        case "med":
            return "#ffd93d";
        case "low":
            return "#00b050";
    }
}

/* ---------------- Styles ---------------- */
const S: Record<string, React.CSSProperties> = {
    app: {
        display: "flex",
        minHeight: "100vh",
        background: "#f6f7fb",
        color: "#1f2430",
        fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
    },

    /* Sidebar */
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

    /* NEW: shared icon button styling for IconBtn */
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

    /* Main header */
    main: { flex: 1, padding: "42px 48px", position: "relative" },
    h1: { margin: "0 0 18px", fontSize: 42, letterSpacing: 0.2 },

    /* Share (+) button */
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

    /* Card */
    card: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "stretch",
        borderRadius: 22,
        padding: "18px 20px",
        maxWidth: 900,
        margin: "16px 0",
        boxShadow: "0 10px 26px rgba(0,0,0,.08)",
    },
    cardLeft: { display: "flex", gap: 14, alignItems: "center" },
    toggle: {
        width: 28,
        height: 28,
        borderRadius: "50%",
        background: "#fff",
        border: "none",
        display: "grid",
        placeItems: "center",
        cursor: "pointer",
        boxShadow: "inset 0 0 0 2px rgba(0,0,0,.15)",
    },
    cardTitle: { fontSize: 20, fontWeight: 800, lineHeight: 1.2 },
    cardDesc: { fontSize: 12.5, marginTop: 4, opacity: 0.9, maxWidth: 520 },

    cardRight: { display: "flex", alignItems: "flex-start", gap: 12 },
    metaStack: {
        background: "rgba(255,255,255,.55)",
        padding: "10px 12px",
        borderRadius: 14,
        minWidth: 210,
    },
    metaRow: { display: "flex", alignItems: "center", gap: 8, marginTop: 6 },
    metaLabel: { fontSize: 12, color: "#111", opacity: 0.7, minWidth: 60 },
    metaText: { fontSize: 11.5, color: "#111", opacity: 0.9 },

    // NEW: right-side completion dot button
    completeDot: {
        width: 28,
        height: 28,
        borderRadius: "50%",
        border: "3px solid #ffd27a",
        background: "#fff",
        cursor: "pointer",
        display: "grid",
        placeItems: "center",
    },
    completeDotInner: {
        width: 12,
        height: 12,
        borderRadius: "50%",
        background: "#ffffff",
        boxShadow: "inset 0 0 0 2px rgba(0,0,0,.15)",
    },

    closeBtn: {
        border: "none",
        background: "#00000022",
        color: "#fff",
        width: 26,
        height: 26,
        borderRadius: 999,
        cursor: "pointer",
        lineHeight: 0,
    },

    /* FAB (add item) */
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

    /* Invite modal */
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
};
