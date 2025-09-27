import React from "react";
import { useNavigate } from "react-router-dom";

type Props = { open: boolean };

export default function SignupModal({ open }: Props) {
    const nav = useNavigate();
    if (!open) return null;

    const close = () => nav("/");

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" aria-modal="true" role="dialog">
            {/* Backdrop */}
            <button
                aria-label="Close"
                onClick={close}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            />

            {/* Card */}
            <div className="relative w-[92vw] max-w-xl rounded-[28px] shadow-2xl ring-1 ring-black/10 bg-white/95 animate-modal-in">
                {/* soft border glow */}
                <div
                    className="pointer-events-none absolute -inset-[2px] rounded-[30px]"
                    style={{
                        background: "linear-gradient(180deg,rgba(255,213,0,.45),rgba(255,153,167,.45),transparent)",
                        filter: "blur(6px)",
                    }}
                />

                {/* Close */}
                <button
                    onClick={close}
                    className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow ring-1 ring-black/10 hover:bg-white"
                    aria-label="Close dialog"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M6 6l12 12M18 6L6 18" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </button>

                {/* Content */}
                <div className="relative p-6 sm:p-8">
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                        Welcome to <span className="brand-text">PhotoBucket</span>
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">Let’s Create Your Account!</p>

                    <form
                        className="mt-6 space-y-4"
                        onSubmit={(e) => {
                            e.preventDefault();
                            // TODO: handle submit
                            close();
                        }}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input className="rounded-xl bg-amber-100/70 placeholder-slate-600/70 px-4 py-3 outline-none ring-1 ring-black/10 focus:ring-brand-sky" placeholder="First" />
                            <input className="rounded-xl bg-amber-100/70 placeholder-slate-600/70 px-4 py-3 outline-none ring-1 ring-black/10 focus:ring-brand-sky" placeholder="Last" />
                        </div>

                        <input className="w-full rounded-xl bg-amber-100/70 placeholder-slate-600/70 px-4 py-3 outline-none ring-1 ring-black/10 focus:ring-brand-sky" placeholder="Create Username" />
                        <input type="password" className="w-full rounded-xl bg-amber-100/70 placeholder-slate-600/70 px-4 py-3 outline-none ring-1 ring-black/10 focus:ring-brand-sky" placeholder="Create Password" />

                        <div className="mt-2 flex justify-center">
                            <button type="submit" className="btn btn-sky rounded-full">Sign Up</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
