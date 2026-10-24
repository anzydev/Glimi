import React from "react";
import { X } from "lucide-react";

export interface ChipProps {
  label: string;
  selected?: boolean;
  onSelect?: () => void;
  onRemove?: () => void;
  icon?: React.ReactNode;
  size?: "sm" | "md";
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onSelect,
  onRemove,
  icon,
  size = "md",
}) => {
  const isClickable = Boolean(onSelect);

  const style: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: size === "sm" ? "5px 14px" : "8px 18px",
    fontSize:
      size === "sm"
        ? "var(--dp-typography-metadata)"
        : "var(--dp-typography-small)",
    fontWeight: 700,
    fontFamily: "var(--dp-typography-face)",
    borderRadius: "var(--dp-radius-control)",
    backgroundColor: selected
      ? "var(--dp-color-accent)"
      : "var(--dp-color-surface)",
    color: "var(--dp-color-ink)",
    boxShadow: selected
      ? "var(--clay-shadow-pill-pink)"
      : "var(--clay-shadow-pill)",
    border: "none",
    cursor: isClickable ? "pointer" : "default",
    userSelect: "none",
    transition:
      "transform var(--dp-motion-interaction) ease, box-shadow var(--dp-motion-interaction) ease",
  };

  const content = (
    <>
      {icon && <span style={{ display: "flex", alignItems: "center" }}>{icon}</span>}
      <span>{label}</span>
      {onRemove && (
        <button
          type="button"
          aria-label={`Remove ${label}`}
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          style={{
            background: "transparent",
            border: "none",
            color: "inherit",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            padding: 0,
            marginLeft: "2px",
            opacity: 0.7,
          }}
        >
          <X size={14} />
        </button>
      )}
    </>
  );

  if (isClickable) {
    return (
      <button
        type="button"
        aria-pressed={selected}
        onClick={onSelect}
        style={style}
        className={`clay-chip ${selected ? "clay-chip-selected" : ""}`}
      >
        {content}
      </button>
    );
  }

  return (
    <span
      style={style}
      className={`clay-chip ${selected ? "clay-chip-selected" : ""}`}
    >
      {content}
    </span>
  );
};
