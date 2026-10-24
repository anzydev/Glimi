import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline" | "mint" | "lavender";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  style,
  ...props
}) => {
  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontWeight: 700,
    fontFamily: "var(--dp-typography-face)",
    borderRadius: "var(--dp-radius-control)",
    cursor: disabled || isLoading ? "not-allowed" : "pointer",
    transition: `transform var(--dp-motion-interaction) ease, box-shadow var(--dp-motion-interaction) ease, opacity var(--dp-motion-interaction) ease`,
    border: "none",
    outline: "none",
    position: "relative",
    userSelect: "none",
    opacity: disabled ? 0.5 : 1,
    textDecoration: "none",
    letterSpacing: "-0.01em",
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: "8px 18px",  fontSize: "var(--dp-typography-small)",    minHeight: "36px" },
    md: { padding: "12px 24px", fontSize: "var(--dp-typography-body)",     minHeight: "46px" },
    lg: { padding: "14px 32px", fontSize: "1.1rem",                       minHeight: "52px" },
  };

  // Clay 3D inflated pill styling with light from upper-left
  const variantInlineMap: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: "var(--dp-color-accent)", // pink cushion
      color: "var(--dp-color-ink)",
      boxShadow: "var(--clay-shadow-pill-pink)",
    },
    secondary: {
      backgroundColor: "var(--dp-color-surface)", // cream cushion
      color: "var(--dp-color-ink)",
      boxShadow: "var(--clay-shadow-pill)",
    },
    mint: {
      backgroundColor: "var(--dp-color-surface-support)", // pastel mint
      color: "var(--dp-color-ink)",
      boxShadow: "var(--clay-shadow-mint)",
    },
    lavender: {
      backgroundColor: "var(--dp-color-surface-compare)", // pastel lavender
      color: "var(--dp-color-ink)",
      boxShadow: "var(--clay-shadow-lavender)",
    },
    outline: {
      backgroundColor: "transparent",
      color: "var(--dp-color-ink)",
      border: "2px solid rgba(56, 49, 57, 0.15)",
      boxShadow: "inset 2px 2px 4px rgba(255, 255, 255, 0.9), inset -2px -2px 4px rgba(56, 49, 57, 0.05)",
    },
    ghost: {
      backgroundColor: "transparent",
      color: "var(--dp-color-ink-secondary)",
      border: "none",
      boxShadow: "none",
    },
    danger: {
      backgroundColor: "#ffd5dc",
      color: "#921f3a",
      boxShadow: "3px 6px 14px rgba(180, 50, 70, 0.18), inset 2px 2px 4px rgba(255, 255, 255, 0.8), inset -2px -2px 5px rgba(180, 50, 70, 0.15)",
    },
  };

  const currentVariant = variantInlineMap[variant] || variantInlineMap.secondary;

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      style={{
        ...baseStyle,
        ...sizeStyles[size],
        ...currentVariant,
        ...style,
      }}
      className={`clay-btn clay-btn-${variant} ${className}`}
    >
      {isLoading ? (
        <span
          style={{
            display: "inline-block",
            width: "16px",
            height: "16px",
            border: "2.5px solid currentColor",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
