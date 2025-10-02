import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { HoverBorderGradient } from "./hovergradientbutton";

type Props = { open: boolean };

export default function SignupModal({ open }: Props) {
  const nav = useNavigate();
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [username, setUsername] = useState("");
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
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first,
          last,
          email: username,
          password,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Signup failed");
        return;
      }
      goToApp();
    } catch (err) {
      setError("Signup failed");
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
          <div className="relative z-10 flex flex-col h-full px-8 py-8">
            <div className="text-center pt-4 pb-6">
              <h2 className="mt-2 text-4xl font-extrabold text-[#302F4D]">
                Create Your Account
              </h2>
              <p className="mt-4 text-sm text-[#302F4D] font-medium font-body">
                Let’s get started!
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={onSubmit}
              className="flex flex-col gap-6 items-center justify-center flex-1"
            >
              <div className="flex gap-6">
                <input
                  required
                  placeholder="First"
                  value={first}
                  onChange={(e) => setFirst(e.target.value)}
                  className="h-16 w-48 text-left text-lg rounded-2xl bg-yellow-200 text-[#302F4D] px-6 font-roboto font-normal"
                />
                <input
                  required
                  placeholder="Last"
                  value={last}
                  onChange={(e) => setLast(e.target.value)}
                  className="h-16 w-48 text-left text-lg rounded-2xl bg-yellow-200 text-[#302F4D] px-6 font-roboto font-normal"
                />
              </div>
              <input
                required
                placeholder="Create Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-16 w-full max-w-[400px] text-left text-lg rounded-2xl bg-yellow-200 text-[#302F4D] px-6 font-roboto font-normal"
              />
              <input
                required
                type="password"
                placeholder="Create Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-16 w-full max-w-[400px] text-left text-lg rounded-2xl bg-yellow-200 text-[#302F4D] px-6 font-roboto font-normal"
              />
              <div className="flex justify-center text-center mt-2">
                <HoverBorderGradient
                  type="submit"
                  containerClassName="rounded-full"
                  className="flex items-center space-x-2 px-10 py-3 text-lg"
                >
                  Sign Up
                </HoverBorderGradient>
              </div>
              {error && (
                <div className="text-red-500 text-sm font-normal mt-2">{error}</div>
              )}
            </form>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}