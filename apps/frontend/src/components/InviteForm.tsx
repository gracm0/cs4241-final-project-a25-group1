import React, { useState } from "react";

export default function InviteForm({
  disabled,
  onAdd,
}: {
  disabled: boolean;
  onAdd: (name: string) => void;
}) {
  const [name, setName] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!disabled) {
          onAdd(name);
          setName("");
        }
      }}
      className="flex gap-2"
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={
          disabled ? "Max collaborators reached" : "Add by name (e.g., Grace)"
        }
        disabled={disabled}
        className="h-[42px] flex-1 rounded-lg border border-gray-200 bg-[#fafafa] px-3 text-[14px] outline-none disabled:opacity-70"
      />
      <button
        type="submit"
        disabled={disabled}
        className="h-[42px] rounded-lg bg-emerald-500 px-4 text-white disabled:opacity-50"
      >
        Add
      </button>
    </form>
  );
}
