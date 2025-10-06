
import React from "react";

export default function Avatar({
  children,
  bg,
  onRemove,
}: React.PropsWithChildren<{ bg: string; onRemove?: () => void }>) {
  return (
    <span className="relative">
      <span className="grid h-[34px] w-[34px] place-items-center rounded-full text-[14px] font-bold text-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]" style={{ background: bg }}>
        {children}
      </span>
      {onRemove && (
        <button
          onClick={onRemove}
          title="Remove collaborator"
          className="absolute -right-1.5 -top-1.5 grid h-[18px] w-[18px] place-items-center rounded-full border border-transparent bg-white text-[12px] text-black shadow-[0_2px_6px_rgba(0,0,0,0.15)]"
        >
          ×
        </button>
      )}
    </span>
  );
}
