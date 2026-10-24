import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "glass" | "glass-elevated" | "scrap" | "highlight" | "cream" | "pink" | "mint" | "lavender" | "yellow" | "blue" | "tray" | "recessed";
  isInteractive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "cream",
  isInteractive = false,
  className = "",
  style,
  ...props
}) => {
  const isTray = variant === "tray";
  const isRecessed = variant === "recessed";

  const baseStyle: React.CSSProperties = {
    borderRadius: isTray
      ? "var(--dp-radius-tray)"
      : isRecessed
      ? "24px"
      : "var(--dp-radius-surface)",
    transition: "transform var(--dp-motion-interaction) ease, box-shadow var(--dp-motion-interaction) ease",
    position: "relative",
    cursor: isInteractive ? "pointer" : "default",
    border: "none",
    color: "var(--dp-color-ink)",
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      backgroundColor: "var(--dp-color-surface)",
      boxShadow: "var(--clay-shadow-cream)",
    },
    cream: {
      backgroundColor: "var(--dp-color-surface)",
      boxShadow: "var(--clay-shadow-cream)",
    },
    elevated: {
      backgroundColor: "var(--dp-color-surface)",
      boxShadow: "var(--clay-shadow-cream)",
    },
    glass: {
      backgroundColor: "var(--dp-color-surface)",
      boxShadow: "var(--clay-shadow-cream)",
    },
    "glass-elevated": {
      backgroundColor: "var(--dp-color-surface)",
      boxShadow: "var(--clay-shadow-cream)",
    },
    scrap: {
      backgroundColor: "var(--dp-color-surface)",
      boxShadow: "var(--clay-shadow-cream)",
    },
    highlight: {
      backgroundColor: "var(--dp-color-surface-warm)",
      boxShadow: "var(--clay-shadow-yellow)",
    },
    pink: {
      backgroundColor: "var(--dp-color-accent)",
      boxShadow: "var(--clay-shadow-pink)",
    },
    mint: {
      backgroundColor: "var(--dp-color-surface-support)",
      boxShadow: "var(--clay-shadow-mint)",
    },
    lavender: {
      backgroundColor: "var(--dp-color-surface-compare)",
      boxShadow: "var(--clay-shadow-lavender)",
    },
    yellow: {
      backgroundColor: "var(--dp-color-surface-warm)",
      boxShadow: "var(--clay-shadow-yellow)",
    },
    blue: {
      backgroundColor: "var(--dp-color-surface-cool)",
      boxShadow: "var(--clay-shadow-blue)",
    },
    tray: {
      backgroundColor: "var(--dp-color-surface)",
      boxShadow: "var(--clay-shadow-cream)",
    },
    recessed: {
      backgroundColor: "#edeef6",
      boxShadow: "var(--clay-shadow-recessed)",
    },
  };

  return (
    <div
      {...props}
      style={{
        ...baseStyle,
        ...variantStyles[variant],
        ...style,
      }}
      className={`clay-cushion ${isTray ? "clay-tray" : ""} ${isInteractive ? "clay-interactive" : ""} ${className}`}
    >
      {children}
    </div>
  );
};
