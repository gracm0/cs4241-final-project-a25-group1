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
      className="relative flex items-stretch justify-between rounded-2xl p-4 max-w-[780px] shadow-md"
      style={{ backgroundColor: cardTint(item.priority) }}
    >
      {/* DELETE */}
      <button
        title="Delete"
        onClick={onDelete}
        className="absolute right-2 top-2 grid h-6 w-6 place-items-center font-bold text-[#302F4D]/65"
      >
        ✕
      </button>

      {/* LEFT: toggle + text */}
      <div className="flex items-center gap-3.5">
        {/* Circular complete toggle */}
        <button
          onClick={handleMarkComplete}
          disabled={item.done} // once done, disable forever
          className={[
            "mt-1 h-8 w-10 mr-2 rounded-full grid place-items-center border-2 justify-center transition",
            item.done
              ? " bg-emerald-600 text-white cursor-not-allowed"
              : " border-[#302F4D]/65 bg-white/75 hover:bg-white"
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
              "min-w-[350px] bg-transparent text-[24px] font-bold text-[#302F4D] font-roboto outline-none",
              item.done ? "line-through opacity-60" : ""
            ].join(" ")}
          />
          <input
            placeholder="Add Your Description"
            value={item.desc}
            onChange={(e) => onEdit({ desc: e.target.value })}
            className={[
              "mt-0.5 min-w-[220px] bg-transparent text-[13px] text-[#302F4D] outline-none",
              item.done ? "line-through opacity-60" : ""
            ].join(" ")}
          />
        </div>
      </div>

      {/* RIGHT: location + priority */}
      <div className="flex items-start gap-2.5">
        <div className=" px-5 py-3">
          <div className="mt-1 flex items-center gap-2.5">
            <span className="min-w-[64px] font-medium text-[12px] text-[#302F4D]">Location:</span>
            <input
              placeholder="—"
              value={item.location}
              onChange={(e) => onEdit({ location: e.target.value })}
              className="min-w-[140px] rounded-[10px] bg-white px-2 py-1.5 text-[12px] outline-none"
            />
          </div>

          <div className="mt-2.5 flex items-center gap-2.5">
            <span className="min-w-[64px] font-medium text-[12px] text-[#302F4D]">Priority:</span>
            <div className="flex gap-2.5">
              {PRIORITY_OPTS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => onEdit({ priority: opt.key })}
                  title={opt.title}
                  className={[
                    "h-[22px] w-[22px] rounded-full border transition",
                    priorityEffective === opt.key ? "border-[2px] border-[#302F4D]" : "border-[1px] border-white"
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
