import React, { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

/**
 * MyBucket
 * --------
 * Personal bucket view for a single bucket (1..4).
 * Reads bucket id from route param `/bucket/:id` (preferred),
 * and falls back to query `?b=1`.
 *
 * Demo data is local for now; wire to your API/store later.
 */
export default function MyBucket() {
    const nav = useNavigate();
    const { id } = useParams<{ id?: string }>();
    const [q] = useSearchParams();

    // figure out which bucket is open
    const activeBucket = useMemo(() => {
        const fromParam = Number(id);
        const fromQuery = Number(q.get("b"));
        const n = Number.isFinite(fromParam) && fromParam > 0 ? fromParam : fromQuery || 1;
        return Math.min(Math.max(n, 1), 4); // clamp to [1,4]
    }, [id, q]);

    // (stub) current user name; replace from auth profile later
    const userName = "Amanda";

    // sample list items for this bucket (replace with real data)
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

    const deleteItem = (iid: string) => setItems((xs) => xs.filter((x) => x.id !== iid));
    const toggleDone = (iid: string) =>
        setItems((xs) => xs.map((x) => (x.id === iid ? { ...x, done: !x.done } : x)));

    const openBucket = (n: number) => nav(`/bucket/${n}`);

    return (
        <div style={S.app}>
            {/* Sidebar */}
            <aside style={S.sidebar}>
                <img
                    src="/assets/logo.png"
                    alt="Photobucket logo"
                    style={{ width: 50, height: 50, marginBottom: 20, borderRadius: 14, boxShadow: "0 6px 18px rgba(0,0,0,.08)" }}
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
                <IconBtn style={S.plusBtn} title="Add bucket">＋</IconBtn>
                <div style={{ flex: 1 }} />
                <IconBtn title="Collaborators">👥</IconBtn>
                <IconBtn style={{ fontWeight: 700, background: "transparent" }} title="Profile">
                    A
                </IconBtn>
            </aside>

            {/* Main */}
            <main style={S.main}>
                <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h1 style={S.h1}>{userName}'s Bucket</h1>
                    {/* little logo on the right like your mock */}
                    <img src="/assets/logo.png" alt="" style={{ width: 42, height: 42, borderRadius: 12 }} />
                </header>

                <div style={{ marginTop: 8 }}>
                    {items.map((it) => (
                        <BucketCard
                            key={it.id}
                            item={it}
                            onDelete={() => deleteItem(it.id)}
                            onToggle={() => toggleDone(it.id)}
                        />
                    ))}
                </div>

                {/* Floating add button */}
                <button style={S.fab} title="Add item">＋</button>
            </main>
        </div>
    );
}

/* ---------- types ---------- */
type Priority = "high" | "med" | "low";
type BucketItem = {
    id: string;
    title: string;
    desc: string;
    location: string;
    priority: Priority;
    done: boolean;
};

/* ---------- components ---------- */
function BucketCard({
                        item,
                        onDelete,
                        onToggle,
                    }: {
    item: BucketItem;
    onDelete: () => void;
    onToggle: () => void;
}) {
    const tint = priorityTint(item.priority);
    const dot = priorityDot(item.priority);

    return (
        <section style={{ ...S.card, background: tint }}>
            {/* left: toggle + text */}
            <div style={S.cardLeft}>
                <button aria-label="Mark complete" onClick={onToggle} style={{ ...S.toggle, opacity: item.done ? 0.5 : 1 }}>
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
                    <div style={{ ...S.cardTitle, textDecoration: item.done ? "line-through" : "none" }}>{item.title}</div>
                    <div style={S.cardDesc}>{item.desc}</div>
                </div>
            </div>

            {/* right: meta + delete */}
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

                <button onClick={onDelete} title="Delete" style={S.closeBtn}>✕</button>
            </div>
        </section>
    );
}

/* ---------- helpers ---------- */
function IconBtn({
                     children,
                     style,
                     title,
                 }: React.PropsWithChildren<{ style?: React.CSSProperties; title?: string }>) {
    return (
        <button style={{ ...S.iconBtn, ...style }} type="button" title={title}>
            {children}
        </button>
    );
}

function priorityTint(p: Priority): string {
    switch (p) {
        case "high": return "#ffd2dc"; // pink card
        case "med":  return "#ffe28f"; // yellow card
        case "low":  return "#56c98d"; // green card (darker, like mock)
        default:     return "#fff";
    }
}
function priorityDot(p: Priority): string {
    switch (p) {
        case "high": return "#ff91a3";
        case "med":  return "#ffd93d";
        case "low":  return "#00b050";
    }
}

/* ---------- styles ---------- */
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

    /* main */
    main: { flex: 1, padding: "42px 48px", position: "relative" },
    h1: { margin: "0 0 18px", fontSize: 42, letterSpacing: 0.2 },

    /* card */
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
};
