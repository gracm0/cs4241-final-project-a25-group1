import React from "react";

/**
 * HeroHighlight (Aceternity-style)
 * - Soft radial spotlight that follows the mouse
 * - Subtle fade-in on mount
 * - Wrap any headline/slogan inside this
 *
 * Usage:
 *   <HeroHighlight className="mt-3">
 *     <span className="highlight-pill">
 *       <span className="highlight-sheen">A Photo Finish.</span>
 *     </span>
 *   </HeroHighlight>
 */
export default function HeroHighlight({
  children,
  className = "",
}: React.PropsWithChildren<{ className?: string }>) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      el.style.setProperty("--hx", `${x}px`);
      el.style.setProperty("--hy", `${y}px`);
    };

    const center = () => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--hx", `${rect.width / 2}px`);
      el.style.setProperty("--hy", `${rect.height / 2}px`);
    };

    center();
    window.addEventListener("resize", center);
    el.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("resize", center);
      el.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`relative isolate overflow-visible animate-hero-fade-in ${className}`}
      style={
        {
          ["--hx" as any]: "50%",
          ["--hy" as any]: "50%",
        } as React.CSSProperties
      }
    >
      {/* Spotlight layer */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-20"
        style={{
          background:
            "radial-gradient(320px 320px at var(--hx) var(--hy), rgba(125,211,252,0.28), rgba(167,139,250,0.2), rgba(251,146,60,0.10), transparent 70%)",
          filter: "blur(18px)",
          transition: "background-position 120ms linear",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
