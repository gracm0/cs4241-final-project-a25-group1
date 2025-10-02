"use client";

import React from "react";
import { cn } from "../lib/utils";
import { motion, useMotionTemplate, useMotionValue } from "motion/react";

type HeroHighlightProps = {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  radius?: number;
};

export const HeroHighlight: React.FC<HeroHighlightProps> = ({
  children,
  className,
  containerClassName,
  radius = 200,
}) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const mask = useMotionTemplate`
    radial-gradient(
      ${radius}px circle at ${mouseX}px ${mouseY}px,
      black 0%,
      transparent 100%
    )
  `;

  return (
    <div
      onMouseMove={handleMouseMove}
      className={cn(
        "group relative flex w-full items-center justify-center",
        containerClassName
      )}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100 dark:hidden"
        style={{
          WebkitMaskImage: mask,
          maskImage: mask,
        }}
      />

      <motion.div
        className="pointer-events-none absolute inset-0 hidden opacity-0 transition duration-300 group-hover:opacity-100 dark:block"
        style={{
          WebkitMaskImage: mask,
          maskImage: mask,
        }}
      />

      <div className={cn("relative z-20", className)}>{children}</div>
    </div>
  );
};

type HighlightProps = {
  children: React.ReactNode;
  className?: string;
  noBackground?: boolean;
};

export const Highlight: React.FC<HighlightProps> = ({
  children,
  className,
  noBackground = false,
}) => {
  return (
    <motion.span
      initial={{ backgroundSize: "0% 100%" }}
      animate={{ backgroundSize: "100% 100%" }}
      transition={{ duration: 2, ease: "linear", delay: 0.5 }}
      style={{
        backgroundRepeat: "no-repeat",
        backgroundPosition: "left center",
        display: "inline",
      }}
      className={cn(
        noBackground
          ? "relative inline-block"
          : "relative inline-block bg-gradient-to-r from-[#FFD639] to-[#FF99A7] px-6 pb-2 pt-2 rounded-2xl",
        className
      )}
    >
      {children}
    </motion.span>
  );
};

export default HeroHighlight;
