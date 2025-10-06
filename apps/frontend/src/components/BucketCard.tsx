import React from "react";

export type Priority = "" | "high" | "med" | "low";
export type BucketItem = {
  id: string;
  title: string;
  desc: string;
  location: string;
  priority: Priority;
  done: boolean;
};

export const PRIORITY_OPTS: Array<{ key: "high" | "med" | "low"; color: string; title: string }> = [
  { key: "high", color: "#ff91a3", title: "High (Pink)" },
  { key: "med", color: "#ffd93d", title: "Medium (Yellow)" },
  { key: "low", color: "#00b050", title: "Low (Green)" },
];

const tint = (p: Priority) =>
  p === "high" ? "bg-[#ffd2dc]" : p === "med" ? "bg-[#ffe28f]" : p === "low" ? "bg-[#56c98d]" : "bg-[#ffe0ea]";

export default function BucketCard({
  item,
  onDelete,
  onEdit,
  onOpenComplete,
}: {
  item: BucketItem;
  onDelete: () => void;
  onEdit: (patch: Partial<BucketItem>) => void;
  onOpenComplete: () => void;
}) {
  return (
    <section className={["flex items-stretch justify-between rounded-2xl p-4 max-w-[780px] shadow-lg", tint(item.priority)].join(" ")}>
      {/* LEFT */}
      <div className="flex items-center gap-3.5">
        <button
          aria-label={item.done ? "Completed" : "Complete with photo"}
          onClick={onOpenComplete}
          title={item.done ? "Completed" : "Complete with photo"}
          className={[
            "h-[34px] rounded-full px-3 font-extrabold",
            item.done ? "cursor-default bg-emerald-500 text-white opacity-90" : "cursor-pointer bg-[#ff4f9a] text-white shadow-[0_6px_16px_rgba(255,79,154,0.35)]",
          ].join(" ")}
        >
          {item.done ? "Completed" : "Complete"}
        </button>

        <div>
          <input
            value={item.title}
            onChange={(e) => onEdit({ title: e.target.value })}
            className="min-w-[260px] bg-transparent text-[18px] font-extrabold text-neutral-900 outline-none"
          />
          <input
            value={item.desc}
            onChange={(e) => onEdit({ desc: e.target.value })}
            className="mt-0.5 min-w-[220px] bg-transparent text-[13px] text-neutral-700/85 outline-none"
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-start gap-2.5">
        <button title="Delete" onClick={onDelete} className="grid h-[26px] w-[26px] place-items-center rounded-full bg-black/15 text-white">
          ✕
        </button>

        <div className="rounded-[14px] bg-white/55 px-3 py-2.5">
          <div className="mt-1 flex items-center gap-2.5">
            <span className="min-w-[64px] text-[12px] text-black/70">Location:</span>
            <input
              placeholder="—"
              value={item.location}
              onChange={(e) => onEdit({ location: e.target.value })}
              className="min-w-[140px] rounded-[10px] bg-white px-2 py-1.5 text-[12px] outline-none"
            />
          </div>

          <div className="mt-2.5 flex items-center gap-2.5">
            <span className="min-w-[64px] text-[12px] text-black/70">Priority:</span>
            <div className="flex gap-2.5">
              {PRIORITY_OPTS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => onEdit({ priority: opt.key })}
                  title={opt.title}
                  aria-label={`Set priority ${opt.title}`}
                  className={["h-[22px] w-[22px] rounded-full border", item.priority === opt.key ? "border-[3px] border-gray-800" : "border-[2px] border-gray-300"].join(" ")}
                  style={{ backgroundColor: opt.color }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
