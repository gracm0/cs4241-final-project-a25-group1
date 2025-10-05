import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";
import type { LinkProps } from "react-router-dom";

type Direction = "TOP" | "LEFT" | "BOTTOM" | "RIGHT";

type HoverBorderGradientProps = React.PropsWithChildren<
    {
      as?: React.ElementType;
      containerClassName?: string;
      className?: string;
      duration?: number;   // seconds
      clockwise?: boolean;
    } & React.HTMLAttributes<HTMLElement> &
    Partial<LinkProps>
>;

export function HoverBorderGradient({
                                      children,
                                      containerClassName,
                                      className,
                                      as: Tag = "button",
                                      duration = 1,
                                      clockwise = true,
                                      ...props
                                    }: HoverBorderGradientProps) {
  const [hovered, setHovered] = useState(false);
  const [direction, setDirection] = useState<Direction>("TOP");

  const rotateDirection = (d: Direction): Direction => {
    const dirs: Direction[] = ["TOP", "LEFT", "BOTTOM", "RIGHT"];
    const i = dirs.indexOf(d);
    const next = clockwise
        ? (i - 1 + dirs.length) % dirs.length
        : (i + 1) % dirs.length;
    return dirs[next];
  };

  const movingMap: Record<Direction, string> = {
    TOP: "radial-gradient(40% 80% at 50% 0%, #FF99A7 80%, #FFD639 100%, rgba(255, 214, 57, 0.7) 100%)",
    LEFT: "radial-gradient(32% 86% at 0% 50%, #FFD639 80%, #FF99A7 100%, rgba(255, 153, 167, 0.7) 100%)",
    BOTTOM: "radial-gradient(40% 80% at 50% 100%, #FF99A7 80%, #FFD639 100%, rgba(255, 214, 57, 0.7) 100%)",
    RIGHT: "radial-gradient(32% 86% at 100% 50%, #FFD639 80%, #FF99A7 100%, rgba(255, 153, 167, 0.7) 100%)",
  };

  const highlight =
      "radial-gradient(90% 200% at 50% 50%, #FF99A7 70%, #FFD639 100%, rgba(255,255,255,0.2) 100%)";

  useEffect(() => {
    if (hovered) return;
    const id = setInterval(() => {
      setDirection((prev) => rotateDirection(prev));
    }, duration * 1000);
    return () => clearInterval(id);
  }, [hovered, duration, clockwise]);

  return (
      <Tag
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={cn(
              // container: relative for layers, p-px for the animated border ring
              "relative inline-flex rounded-full p-px overflow-visible",
              "transition duration-500",
              containerClassName
          )}
          {...props}
      >
        {/* Animated border layer (behind content) */}
        <motion.div
            className="absolute inset-0 rounded-[inherit] z-0"
            style={{ filter: "blur(2px)" }}
            initial={{ background: movingMap[direction] }}
            animate={{
              background: hovered ? [movingMap[direction], highlight] : movingMap[direction],
            }}
            transition={{ ease: "linear", duration: duration ?? 1 }}
            aria-hidden
        />

        {/* Solid inner panel */}
        <div
            className={cn(
                "relative z-[2] rounded-[inherit] bg-[#0092E0] hover:bg-[#0092E0]/70",
                "text-white font-medium px-14 py-3",
                className
            )}
        >
          {children}
        </div>

        {/* Optional extra inner mask to tighten the glow (kept behind content, above animated bg) */}
        <div className="absolute inset-[6px] rounded-[inherit] bg-[#0092E0] z-[1]" aria-hidden />
      </Tag>
  );
}
