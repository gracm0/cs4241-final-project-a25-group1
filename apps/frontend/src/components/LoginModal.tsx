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
        return () => {
            document.body.style.overflow = prev || "auto"; // return void (TS-safe)
        };
    }, [open]);

    if (!open) return null;

    const close = () => nav("/"); // backdrop/✕ goes home
    const goToApp = () => nav("/bucketlist"); // login success → bucketlist

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: handle real auth logic
        goToApp();
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

            {/* Overlay matches SignUpModal positioning */}
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
                {/* Card */}
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
                        overflow: "hidden",
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
                            zIndex: 0,
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
                            background: "rgba(255,255,255,.95)",
                            border: "1px solid rgba(0,0,0,.10)",
                            boxShadow: "0 4px 12px rgba(0,0,0,.12)",
                            zIndex: 2,
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
                            position: "relative",
                            zIndex: 1,
                        }}
                    >
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight animate-fade-in">
                            <span className="brand-text">Welcome back!</span>
                        </h2>
                        <p
                            className="mt-2 text-sm text-slate-600 font-medium"
                            style={{ fontFamily: "'Roboto', sans-serif" }}
                        >
                            Keep making memories!
                        </p>
                    </div>

                    {/* Form */}
                    <form
                        onSubmit={onSubmit}
                        style={{
                            position: "absolute",
                            top: "52%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "16px",
                            alignItems: "center",
                            zIndex: 1,
                        }}
                    >
                        <input
                            placeholder="Username"
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
                            placeholder="Password"
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
                    </form>

                    {/* Button at bottom center */}
                    <div
                        style={{
                            position: "absolute",
                            bottom: "20px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            zIndex: 1,
                        }}
                    >
                        <button
                            type="button"
                            onClick={(e) => onSubmit(e as unknown as React.FormEvent)}
                            className="btn btn-sky rounded-full text-base font-medium"
                            style={{ padding: "10px 32px", fontSize: "16px" }}
                        >
                            Login
                        </button>
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
}
