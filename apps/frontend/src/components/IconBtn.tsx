import React from "react";
import { Link } from "react-router-dom";

type Props = React.PropsWithChildren<{
  title?: string;
  style?: React.CSSProperties;
  onClick?: React.ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  to?: string; // ✅ optional link target
}>;

/**
 * Small rounded square icon button used in the sidebar.
 * Can act as a button (with onClick) or a Link (with `to`).
 */
export default function IconBtn({ children, title, style, onClick, to }: Props) {
  // If `to` is passed, render as a Link
  if (to) {
    return (
        <Link
            to={to}
            title={title}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 12,
              width: 40,
              height: 40,
              ...style,
            }}
        >
          {children}
        </Link>
    );
  }

  // Otherwise, render as a button
  return (
      <button
          type="button"
          title={title}
          onClick={onClick}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 12,
            width: 40,
            height: 40,
            ...style,
          }}
      >
        {children}
      </button>
  );
}
