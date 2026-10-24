import React from "react";
import { CheckCircle2, AlertCircle, BookOpen, Sparkles, Eye } from "lucide-react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "verified" | "observed" | "reported" | "learning" | "intent" | "ai" | "neutral" | "danger" | "pink" | "mint" | "lavender" | "yellow" | "blue";
  size?: "sm" | "md";
  showIcon?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  size = "md",
  showIcon = true,
  style,
  className = "",
  ...props
}) => {
  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontWeight: 700,
    fontFamily: "var(--dp-typography-face)",
    borderRadius: "var(--dp-radius-control)",
    whiteSpace: "nowrap",
    userSelect: "none",
    border: "none",
    lineHeight: 1.2,
    letterSpacing: "-0.01em",
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: "4px 10px", fontSize: "var(--dp-typography-caption)",  minHeight: "24px" },
    md: { padding: "5px 14px", fontSize: "var(--dp-typography-metadata)", minHeight: "28px" },
  };

  const variantStyles: Record<string, { style: React.CSSProperties; icon?: React.ReactNode }> = {
    verified: {
      style: {
        backgroundColor: "var(--dp-color-surface-support)", // mint
        color: "var(--dp-color-ink)",
        boxShadow: "var(--clay-shadow-mint)",
      },
      icon: <CheckCircle2 size={13} strokeWidth={2.5} color="#1d5c2c" />,
    },
    observed: {
      style: {
        backgroundColor: "var(--dp-color-surface-cool)", // pale-blue
        color: "var(--dp-color-ink)",
        boxShadow: "var(--clay-shadow-blue)",
      },
      icon: <Eye size={13} strokeWidth={2.5} color="#1c4873" />,
    },
    reported: {
      style: {
        backgroundColor: "var(--dp-color-surface-warm)", // butter-yellow
        color: "var(--dp-color-ink)",
        boxShadow: "var(--clay-shadow-yellow)",
      },
      icon: <AlertCircle size={13} strokeWidth={2.5} color="#7a5210" />,
    },
    learning: {
      style: {
        backgroundColor: "var(--dp-color-surface-cool)", // pale-blue
        color: "var(--dp-color-ink)",
        boxShadow: "var(--clay-shadow-blue)",
      },
      icon: <BookOpen size={13} strokeWidth={2.5} color="#1c4873" />,
    },
    ai: {
      style: {
        backgroundColor: "var(--dp-color-surface-compare)", // lavender
        color: "var(--dp-color-ink)",
        boxShadow: "var(--clay-shadow-lavender)",
      },
      icon: <Sparkles size={13} strokeWidth={2.5} color="#5b3b82" />,
    },
    intent: {
      style: {
        backgroundColor: "var(--dp-color-surface-warm)", // warm butter-yellow
        color: "var(--dp-color-ink)",
        boxShadow: "var(--clay-shadow-yellow)",
      },
    },
    pink: {
      style: {
        backgroundColor: "var(--dp-color-accent)", // pink
        color: "var(--dp-color-ink)",
        boxShadow: "var(--clay-shadow-pill-pink)",
      },
    },
    mint: {
      style: {
        backgroundColor: "var(--dp-color-surface-support)",
        color: "var(--dp-color-ink)",
        boxShadow: "var(--clay-shadow-mint)",
      },
    },
    lavender: {
      style: {
        backgroundColor: "var(--dp-color-surface-compare)",
        color: "var(--dp-color-ink)",
        boxShadow: "var(--clay-shadow-lavender)",
      },
    },
    yellow: {
      style: {
        backgroundColor: "var(--dp-color-surface-warm)",
        color: "var(--dp-color-ink)",
        boxShadow: "var(--clay-shadow-yellow)",
      },
    },
    blue: {
      style: {
        backgroundColor: "var(--dp-color-surface-cool)",
        color: "var(--dp-color-ink)",
        boxShadow: "var(--clay-shadow-blue)",
      },
    },
    danger: {
      style: {
        backgroundColor: "#ffd5dc",
        color: "#921f3a",
        boxShadow: "2px 4px 10px rgba(180, 50, 70, 0.15), inset 1px 1px 3px rgba(255, 255, 255, 0.8)",
      },
    },
    neutral: {
      style: {
        backgroundColor: "var(--dp-color-surface)", // cream
        color: "var(--dp-color-ink)",
        boxShadow: "var(--clay-shadow-pill)",
      },
    },
  };

  const current = variantStyles[variant] || variantStyles.neutral;

  return (
    <span
      {...props}
      style={{
        ...baseStyle,
        ...sizeStyles[size],
        ...current.style,
        ...style,
      }}
      className={`clay-badge clay-badge-${variant} ${className}`}
    >
      {showIcon && current.icon}
      <span>{children}</span>
    </span>
  );
};
