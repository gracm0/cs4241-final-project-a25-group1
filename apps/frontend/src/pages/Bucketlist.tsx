// src/components/BucketList.tsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import IconBtn from "../components/IconBtn";

/**
 * BucketList (post-login landing)
 * - Sidebar with logo + 4 clickable buckets
 * - Main list of bucket items (cards)
 * - FAB in bottom-right adds a new item card
 */
export default function BucketList() {
    const nav = useNavigate();

    /* ---------------- state ---------------- */
    type Priority = "" | "high" | "med" | "low";
    type Item = {
        id: string;
        title: string;
        desc: string;
        location: string;
        priority: Priority;
        done: boolean;
    };

    const newItem = (): Item => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title: "Start Building Your Bucket",
        desc: "Add Your Description",
        location: "",
        priority: "",
        done: false,
    });

    const [items, setItems] = useState<Item[]>([newItem()]);
    const [activeBucket, setActiveBucket] = useState<number>(1);

    /* ---------------- helpers ---------------- */
    const tint = (p: Priority) =>
        p === "high" ? "#ffb3c0" : p === "med" ? "#ffe089" : p === "low" ? "#c8f1c8" : "#ffe0ea";

    const addItem = () => setItems((xs) => [...xs, newItem()]);
    const deleteItem = (id: string) => setItems((xs) => xs.filter((x) => x.id !== id));
    const editItem = (id: string, patch: Partial<Item>) =>
        setItems((xs) => xs.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    const toggleDone = (id: string) => editItem(id, { done: !items.find((x) => x.id === id)?.done });

    const openBucket = (n: number) => {
        setActiveBucket(n);
        nav(`/bucket/${n}`);
    };

    /* ---------------- render ---------------- */
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
                                src="/assets/bucket.png"
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
                {/* use imported IconBtn and pass styles */}
                <IconBtn style={{ ...S.iconBtn, ...S.plusBtn }} title="Add bucket">＋</IconBtn>
                <div style={{ flex: 1 }} />
                <IconBtn title="Collaborators" style={S.iconBtn}>👥</IconBtn>
                <IconBtn title="Profile" style={{ ...S.iconBtn, fontWeight: 700, background: "transparent" }}>
                    A
                </IconBtn>
            </aside>

            {/* Main */}
            <main style={S.main}>
                <h1 style={S.h1}>New Bucket List</h1>

                {/* Avatars (placeholder) */}
                <div style={S.avatarsRow}>
                    <Avatar bg="#ff6b6b">A</Avatar>
                    <Avatar bg="#2ecc71">G</Avatar>
                    <Avatar bg="#3498db">C</Avatar>
                    <Avatar bg="#9b59b6">N</Avatar>
                    <span style={{ fontSize: 22, marginLeft: 6 }}>🪣📷</span>
                </div>

                {/* Cards */}
                <div style={{ display: "grid", gap: 18, maxWidth: 820 }}>
                    {items.map((it) => (
                        <section key={it.id} style={{ ...S.card, background: tint(it.priority) }}>
                            {/* left: done toggle + title/desc (inline editable) */}
                            <div style={S.cardLeft}>
                                <button
                                    aria-label="Mark complete"
                                    onClick={() => toggleDone(it.id)}
                                    style={{ ...S.doneBtn, opacity: it.done ? 0.7 : 1 }}
                                >
                  <span
                      style={{
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          background: it.done ? "#10b981" : "#fff",
                          display: "block",
                          border: "2px solid rgba(0,0,0,.25)",
                      }}
                  />
                                </button>
                                <div>
                                    <input
                                        value={it.title}
                                        onChange={(e) => editItem(it.id, { title: e.target.value })}
                                        style={S.cardTitle}
                                    />
                                    <input
                                        value={it.desc}
                                        onChange={(e) => editItem(it.id, { desc: e.target.value })}
                                        style={S.cardDesc}
                                    />
                                </div>
                            </div>

                            {/* right: delete + meta (location + priority dots) */}
                            <div style={S.cardRight}>
                                <button title="Delete" onClick={() => deleteItem(it.id)} style={S.closeBtn}>
                                    ✕
                                </button>

                                <div style={S.metaBox}>
                                    <div style={S.metaRow}>
                                        <span style={S.metaLabel}>Location:</span>
                                        <input
                                            placeholder="—"
                                            value={it.location}
                                            onChange={(e) => editItem(it.id, { location: e.target.value })}
                                            style={S.metaInput}
                                        />
                                    </div>

                                    <div style={S.metaRow}>
                                        <span style={S.metaLabel}>Priority:</span>
                                        <div style={{ display: "flex", gap: 10 }}>
                                            {PRIORITY_OPTS.map((opt) => (
                                                <button
                                                    key={opt.key}
                                                    onClick={() => editItem(it.id, { priority: opt.key })}
                                                    title={opt.title}
                                                    aria-label={`Set priority ${opt.title}`}
                                                    style={{
                                                        ...S.priorityDot,
                                                        backgroundColor: opt.color,
                                                        border: it.priority === opt.key ? "3px solid #1f2937" : "2px solid #d1d5db",
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    ))}
                </div>

                {/* Floating add button */}
                <button style={S.fab} title="Add new item" onClick={addItem}>
                    ＋
                </button>
            </main>
        </div>
    );
}

/* ---------- small helpers ---------- */
function Avatar({
                    children,
                    bg,
                }: React.PropsWithChildren<{ bg: string }>) {
    return <span style={{ ...S.avatar, background: bg }}>{children}</span>;
}

/* ---------- constants ---------- */
const PRIORITY_OPTS: Array<{ key: "high" | "med" | "low"; color: string; title: string }> = [
    { key: "high", color: "#ff91a3", title: "High (Pink)" },
    { key: "med", color: "#ffd93d", title: "Medium (Yellow)" },
    { key: "low", color: "#00b050", title: "Low (Green)" },
];

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

    /* main */
    main: { flex: 1, padding: "42px 48px", position: "relative" },
    h1: { margin: "0 0 18px", fontSize: 42, letterSpacing: 0.2 },

    avatarsRow: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 16,
    },
    avatar: {
        width: 34,
        height: 34,
        borderRadius: 999,
        color: "#fff",
        display: "grid",
        placeItems: "center",
        fontWeight: 700,
        fontSize: 14,
        boxShadow: "0 4px 12px rgba(0,0,0,.08)",
    },

    /* cards */
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
    doneBtn: {
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
    metaBox: {
        background: "rgba(255,255,255,.55)",
        padding: "10px 12px",
        borderRadius: 14,
    },
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

    /* FAB */
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
