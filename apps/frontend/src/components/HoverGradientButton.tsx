"use client";
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { LinkProps } from "react-router-dom";

type Direction = "TOP" | "LEFT" | "BOTTOM" | "RIGHT";

export function HoverBorderGradient({
  children,
  containerClassName,
  className,
  as: Tag = "button",
  duration = 1,
  clockwise = true,
  ...props
}: React.PropsWithChildren<
  {
    as?: React.ElementType;
    containerClassName?: string;
    className?: string;
    duration?: number;
    clockwise?: boolean;
  } & React.HTMLAttributes<HTMLElement> & Partial<LinkProps>
>) {
  const [hovered, setHovered] = useState<boolean>(false);
  const [direction, setDirection] = useState<Direction>("TOP");

  const rotateDirection = (currentDirection: Direction): Direction => {
    const directions: Direction[] = ["TOP", "LEFT", "BOTTOM", "RIGHT"];
    const currentIndex = directions.indexOf(currentDirection);
    const nextIndex = clockwise
      ? (currentIndex - 1 + directions.length) % directions.length
      : (currentIndex + 1) % directions.length;
    return directions[nextIndex];
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
    if (!hovered) {
      const interval = setInterval(() => {
        setDirection((prevState) => rotateDirection(prevState));
      }, duration * 1000);
      return () => clearInterval(interval);
    }
  }, [hovered, duration, clockwise]);

  return (
    <Tag
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative flex rounded-full border content-center bg-[#0092E0] hover:bg-[#0092E0]/70 transition duration-500 items-center flex-col flex-nowrap gap-10 h-min justify-center overflow-visible p-px decoration-clone w-fit",
        containerClassName
      )}
      {...props}
    >
      <div
        className={cn(
          "w-auto text-white z-10 bg-[#0092E0] px-14 py-3 rounded-[inherit] font-medium",
          className
        )}
      >
        {children}
      </div>
      <motion.div
        className={cn(
          "flex-none inset-0 overflow-hidden absolute z-0 rounded-[inherit]"
        )}
        style={{
          filter: "blur(2px)",
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
        initial={{ background: movingMap[direction] }}
        animate={{
          background: hovered
            ? [movingMap[direction], highlight]
            : movingMap[direction],
        }}
        transition={{ ease: "linear", duration: duration ?? 1 }}
      />
      <div className="bg-[#0092E0] absolute z-1 flex-none inset-[6px] rounded-[100px]" />
    </Tag>
  );
}