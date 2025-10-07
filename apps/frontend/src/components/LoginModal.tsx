import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { HoverBorderGradient } from "./HoverGradientButton";

type Props = { open: boolean };

export default function LoginModal({ open }: Props) {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "auto";
    };
  }, [open]);

  if (!open) return null;

  const close = () => nav("/");
  const goToApp = () => nav("/bucketlist");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Login failed");
        return;
      }
      // If login is successful, redirect
      goToApp();
    } catch (err) {
      setError("Incorrect email or password");
    }
  };

  return createPortal(
    <>
      <div
        onClick={close}
        className="fixed inset-0 z-[9998] bg-gray-600/30 backdrop-blur-sm"
        aria-hidden
      />

      <div className="fixed inset-0 z-[9999] flex justify-center items-center pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          className="pointer-events-auto w-[560px] min-h-[520px] rounded-[32px] bg-white shadow-2xl relative overflow-hidden"
          style={{
            boxShadow: "0 24px 80px rgba(0,0,0,.25)",
          }}
        >
          <div
            className="absolute inset-0 rounded-[32px] pointer-events-none z-0"
            style={{
              padding: "8px",
              background: "linear-gradient(135deg, #FFD639 10%, #FF99A7 100%) ",
              opacity: 0.7,
            }}
          />
          <div className="absolute inset-[8px] rounded-[28px] bg-white z-10" />
          <div className="relative z-10 flex flex-col h-full px-10 py-10">
            <div className="text-center pt-2 pb-6">
              <h2 className="mt-2 mb-2 text-4xl font-extrabold text-[#302F4D]">
                Welcome Back!
              </h2>
              <p className="mb-2 text-sm text-[#302F4D] font-medium font-body">
                Keep making memories!
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={onSubmit}
              className="flex flex-col gap-7 items-center justify-center flex-1"
            >
              <input
                required
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-16 w-full max-w-[400px] text-left text-lg rounded-2xl bg-yellow-200 text-[#302F4D] px-6 font-roboto font-normal mb-2"
              />
              <input
                required
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-16 w-full max-w-[400px] text-left text-lg rounded-2xl bg-yellow-200 text-[#302F4D] px-6 font-roboto font-normal mb-2"
              />
              <div className="flex justify-center text-center mt-2 mb-2">
                <HoverBorderGradient
                  type="submit"
                  containerClassName="rounded-full"
                  className="flex items-center space-x-2 px-10 py-3 text-lg"
                >
                  Login
                </HoverBorderGradient>
              </div>
              {error && (
                <div className="text-red-500 text-sm font-normal mt-2 mb-2">
                  {error}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
