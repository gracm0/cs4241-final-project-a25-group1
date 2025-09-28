import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

type Props = { open: boolean };

export default function SignupModal({ open }: Props) {
    const nav = useNavigate();

    // Lock background scroll when open
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev || "auto";
        };
    }, [open]);

    if (!open) return null;

    const close = () => nav("/"); // backdrop/✕ goes home
    const goToApp = () => nav("/bucketlist"); // signup success → bucketlist

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

            {/* Overlay */}
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 9999,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    paddingTop: "12vh",
                    pointerEvents: "none",
                }}
            >
                <div
                    role="dialog"
                    aria-modal="true"
                    style={{
                        pointerEvents: "auto",
                        width: "min(92vw, 640px)",
                        minHeight: "420px",
                        maxHeight: "90vh",
                        borderRadius: "28px",
                        background: "#FAFAFA",
                        boxShadow: "0 24px 80px rgba(0,0,0,.25)",
                        border: "1px solid rgba(0,0,0,.10)",
                        position: "relative",
                    }}
                >
                    {/* Glow */}
                    <div
                        style={{
                            position: "absolute",
                            inset: "-2px",
                            borderRadius: "30px",
                            pointerEvents: "none",
                            background:
                                "linear-gradient(180deg,rgba(255,213,0,.45),rgba(255,153,167,.45),transparent)",
                            filter: "blur(6px)",
                        }}
                    />

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
                            background: "rgba(255,255,255,.85)",
                            border: "1px solid rgba(0,0,0,.10)",
                            boxShadow: "0 4px 12px rgba(0,0,0,.12)",
                        }}
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            style={{ display: "block", margin: "0 auto" }}
                        >
                            <path
                                d="M6 6l12 12M18 6L6 18"
                                stroke="#334155"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>

                    {/* Title */}
                    <div
                        style={{
                            textAlign: "center",
                            paddingTop: "20px",
                        }}
                    >
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                            Welcome to <span className="brand-text">PhotoBucket</span>
                        </h2>
                        <p
                            className="mt-2 mb-8 text-base text-slate-600 font-medium"
                            style={{ fontFamily: "'Roboto', sans-serif" }}
                        >
                            Let’s Create Your Account!
                        </p>
                    </div>

                    {/* Form */}
                    <div
                        style={{
                            position: "absolute",
                            top: "52%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "16px",
                            alignItems: "center",
                        }}
                    >
                        <div style={{ display: "flex", gap: "16px" }}>
                            <input
                                placeholder="First"
                                style={{
                                    height: "56px",
                                    width: "160px",
                                    textAlign: "center",
                                    fontSize: "18px",
                                    borderRadius: "12px",
                                    backgroundColor: "#FDE68A",
                                    color: "#374151",
                                    padding: "0 20px",
                                    outline: "none",
                                    border: "none",
                                }}
                            />
                            <input
                                placeholder="Last"
                                style={{
                                    height: "56px",
                                    width: "160px",
                                    textAlign: "center",
                                    fontSize: "18px",
                                    borderRadius: "12px",
                                    backgroundColor: "#FDE68A",
                                    color: "#374151",
                                    padding: "0 20px",
                                    outline: "none",
                                    border: "none",
                                }}
                            />
                        </div>

                        <input
                            placeholder="Create Username"
                            style={{
                                height: "56px",
                                width: "320px",
                                textAlign: "center",
                                fontSize: "18px",
                                borderRadius: "12px",
                                backgroundColor: "#FDE68A",
                                color: "#374151",
                                padding: "0 20px",
                                outline: "none",
                                border: "none",
                            }}
                        />

                        <input
                            type="password"
                            placeholder="Create Password"
                            style={{
                                height: "56px",
                                width: "320px",
                                textAlign: "center",
                                fontSize: "18px",
                                borderRadius: "12px",
                                backgroundColor: "#FDE68A",
                                color: "#374151",
                                padding: "0 20px",
                                outline: "none",
                                border: "none",
                            }}
                        />
                    </div>

                    {/* Button at bottom */}
                    <div
                        style={{
                            position: "absolute",
                            bottom: "20px",
                            left: "50%",
                            transform: "translateX(-50%)",
                        }}
                    >
                        <button
                            type="button"
                            onClick={goToApp} // ← signup success
                            className="btn btn-sky rounded-full text-base font-medium"
                            style={{ padding: "10px 32px", fontSize: "16px" }}
                        >
                            Sign Up
                        </button>
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
}
