import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

type Props = { open: boolean };

export default function LoginModal({ open }: Props) {
    const nav = useNavigate();

    // Lock background scroll while modal is open
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => (document.body.style.overflow = prev || "auto");
    }, [open]);

    if (!open) return null;

    const close = () => nav("/");
    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: auth
        close();
    };

    return createPortal(
        <>
            {/* Backdrop */}
            <div
                onClick={close}
                style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 9998,
                    background: "rgba(0,0,0,.4)",
                    backdropFilter: "blur(4px)",
                }}
                aria-hidden
            />

            {/* Overlay centers the card */}
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 9999,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "4vh 16px",
                    pointerEvents: "none",
                }}
            >
                {/* Card */}
                <div
                    role="dialog"
                    aria-modal="true"
                    style={{
                        pointerEvents: "auto",
                        width: "min(92vw, 640px)",
                        minHeight: 460,
                        maxHeight: "90vh",
                        borderRadius: 28,
                        background:
                            "linear-gradient(180deg, #fff, #ffe7eb 60%, #ffffff 100%)",
                        boxShadow: "0 24px 80px rgba(0,0,0,.25)",
                        border: "1px solid rgba(0,0,0,.10)",
                        position: "relative",

                        /* NEW: make the card a vertical flex container */
                        display: "flex",
                        flexDirection: "column",
                        padding: 24,
                    }}
                >
                    {/* Close */}
                    <button
                        onClick={close}
                        aria-label="Close dialog"
                        style={{
                            position: "absolute",
                            right: 12,
                            top: 12,
                            width: 36,
                            height: 36,
                            borderRadius: "9999px",
                            background: "rgba(255,255,255,.95)",
                            border: "1px solid rgba(0,0,0,.10)",
                            boxShadow: "0 4px 12px rgba(0,0,0,.12)",
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ display: "block", margin: "0 auto" }}>
                            <path d="M6 6l12 12M18 6L6 18" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>

                    {/* Header */}
                    <div style={{ textAlign: "center", paddingTop: 6 }}>
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Welcome back!</h2>
                        <p className="mt-2 text-sm text-slate-600 font-medium">Keep making memories!</p>
                    </div>

                    {/* Body grows to take available space */}
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <form
                            onSubmit={onSubmit}
                            style={{
                                width: "100%",
                                maxWidth: 520,
                                display: "flex",
                                flexDirection: "column",
                                gap: 16,
                            }}
                        >
                            <label style={{ display: "block" }}>
                                <span className="sr-only">Username</span>
                                <input
                                    placeholder="Username"
                                    style={{
                                        height: 56,
                                        width: "100%",
                                        fontSize: 18,
                                        borderRadius: 16,
                                        backgroundColor: "#FDE68A",
                                        color: "#374151",
                                        padding: "0 20px",
                                        border: "none",
                                        outline: "none",
                                    }}
                                />
                            </label>

                            <label style={{ display: "block" }}>
                                <span className="sr-only">Password</span>
                                <input
                                    type="password"
                                    placeholder="Password"
                                    style={{
                                        height: 56,
                                        width: "100%",
                                        fontSize: 18,
                                        borderRadius: 16,
                                        backgroundColor: "#FDE68A",
                                        color: "#374151",
                                        padding: "0 20px",
                                        border: "none",
                                        outline: "none",
                                    }}
                                />
                            </label>

                            {/* Footer: button centered at the bottom */}
                            <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
                                <button
                                    type="submit"
                                    className="btn btn-sky rounded-full text-base font-medium"
                                    style={{ padding: "10px 32px", fontSize: 16 }}
                                >
                                    Login
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
}
