import React from "react";
import { useNavigate } from "react-router-dom";

type Props = { open: boolean };

export default function SignupModal({ open }: Props) {
    const nav = useNavigate();
    if (!open) return null;

    const close = () => nav("/");

    return (
        <>
            {/* Backdrop (covers the whole viewport) */}
            <div
                onClick={close}
                style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 1000,
                    background: "rgba(0,0,0,.4)",
                    backdropFilter: "blur(4px)",
                }}
                aria-hidden
            />

            {/* Card (HARD-CENTERED) */}
            <div
                role="dialog"
                aria-modal="true"
                style={{
                    position: "fixed",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 1010, // above backdrop
                    width: "min(92vw, 640px)",
                    borderRadius: "28px",
                    background: "rgba(255,255,255,0.95)",
                    boxShadow: "0 24px 80px rgba(0,0,0,.25)",
                    border: "1px solid rgba(0,0,0,.10)",
                    animation: "modal-in .35s cubic-bezier(.2,.8,.2,1) both",
                }}
            >
                {/* soft border glow */}
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
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ display: "block", margin: "0 auto" }}>
                        <path d="M6 6l12 12M18 6L6 18" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </button>

                {/* Content */}
                <div style={{ position: "relative", padding: "24px 24px 28px 24px" }}>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                        Welcome to <span className="brand-text">PhotoBucket</span>
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">Let’s Create Your Account!</p>

                    <form
                        className="mt-6 space-y-4"
                        onSubmit={(e) => {
                            e.preventDefault();
                            // TODO: submit
                            close();
                        }}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                                className="rounded-xl bg-amber-100/70 placeholder-slate-600/70 px-4 py-3 outline-none
                           ring-1 ring-black/10 focus:ring-brand-sky"
                                placeholder="First"
                            />
                            <input
                                className="rounded-xl bg-amber-100/70 placeholder-slate-600/70 px-4 py-3 outline-none
                           ring-1 ring-black/10 focus:ring-brand-sky"
                                placeholder="Last"
                            />
                        </div>

                        <input
                            className="w-full rounded-xl bg-amber-100/70 placeholder-slate-600/70 px-4 py-3 outline-none
                         ring-1 ring-black/10 focus:ring-brand-sky"
                            placeholder="Create Username"
                        />

                        <input
                            type="password"
                            className="w-full rounded-xl bg-amber-100/70 placeholder-slate-600/70 px-4 py-3 outline-none
                         ring-1 ring-black/10 focus:ring-brand-sky"
                            placeholder="Create Password"
                        />

                        <div className="mt-2 flex justify-center">
                            <button type="submit" className="btn btn-sky rounded-full">Sign Up</button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
