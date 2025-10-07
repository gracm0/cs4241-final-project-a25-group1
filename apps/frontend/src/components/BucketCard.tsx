import React from "react";

export type Priority = "" | "high" | "med" | "low";
export type BucketItem = {
  id: string;
  _id?: string;
  title: string;
  desc: string;
  location: string;
  priority: Priority;
  done: boolean;
};

const COLORS = {
  yellow: "#FFD639",
  pink: "#FF99A7",
  green: "#00AF54",
};

export const PRIORITY_OPTS: Array<{ key: "high" | "med" | "low"; color: string; title: string }> = [
  { key: "med",  color: COLORS.yellow, title: "Medium (Yellow)" },
  { key: "high", color: COLORS.pink,   title: "High (Pink)" },
  { key: "low",  color: COLORS.green,  title: "Low (Green)" },
];

const cardTint = (p: Priority): string => {
  const eff = p === "" ? "med" : p;
  switch (eff) {
    case "high": return "#FFE0E6";
    case "med":  return "#FFF5CC";
    case "low":  return "#CCF3DB";
    default:     return "#FFF5CC";
  }
};

export default function BucketCard({
  item,
  onDelete,
  onEdit,
  onOpenComplete,
}: {
  item: BucketItem;
  onDelete: () => void;
  onEdit: (patch: Partial<BucketItem>) => void;
  onOpenComplete: (onSuccess: () => void) => void;
}) {
  const priorityEffective: Priority = item.priority === "" ? "med" : item.priority;

  const handleMarkComplete = () => {
    if (!item.done) {
      // open modal first, only mark complete after success
      onOpenComplete(() => {
        onEdit({ done: true });
      });
    }
  };

  return (
    <section
      className="relative flex items-stretch justify-between rounded-2xl p-4 max-w-[780px] shadow-lg"
      style={{ backgroundColor: cardTint(item.priority) }}
    >
      {/* DELETE */}
      <button
        title="Delete"
        onClick={onDelete}
        className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-black/20 text-white hover:bg-black/30 transition"
      >
        ✕
      </button>

      {/* LEFT: toggle + text */}
      <div className="flex items-start gap-3.5">
        {/* Circular complete toggle */}
        <button
          onClick={handleMarkComplete}
          disabled={item.done} // once done, disable forever
          className={[
            "mt-1 h-8 w-8 rounded-full border-2 grid place-items-center transition",
            item.done
              ? "border-emerald-600 bg-emerald-600 text-white cursor-not-allowed"
              : "border-black/30 bg-white/60 hover:bg-white"
          ].join(" ")}
        >
          {item.done ? "✓" : ""}
        </button>

        <div>
          <input
            placeholder="Start Building Your Bucket"
            value={item.title}
            onChange={(e) => onEdit({ title: e.target.value })}
            className={[
              "min-w-[260px] bg-transparent text-[18px] font-extrabold text-neutral-900 outline-none",
              item.done ? "line-through opacity-60" : ""
            ].join(" ")}
          />
          <input
            placeholder="Add Your Description"
            value={item.desc}
            onChange={(e) => onEdit({ desc: e.target.value })}
            className={[
              "mt-0.5 min-w-[220px] bg-transparent text-[13px] text-neutral-700/85 outline-none",
              item.done ? "line-through opacity-60" : ""
            ].join(" ")}
          />
        </div>
      </div>

      {/* RIGHT: location + priority */}
      <div className="flex items-start gap-2.5">
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
                  className={[
                    "h-[22px] w-[22px] rounded-full border transition",
                    priorityEffective === opt.key ? "border-[3px] border-gray-800" : "border-[2px] border-gray-300"
                  ].join(" ")}
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
