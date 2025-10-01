// src/components/IconBtn.tsx
import React from "react";

type Props = React.PropsWithChildren<{
  title?: string;
  style?: React.CSSProperties;
  onClick?: React.ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
}>;

/**
 * Small rounded square icon button used in the sidebar.
 * Styling still comes from the page's `S.iconBtn` via inline `style` prop.
 */
export default function IconBtn({ children, title, style, onClick }: Props) {
  return (
    <button type="button" title={title} onClick={onClick} style={style}>
      {children}
    </button>
  );
}
