import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = "", style, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const helperId = `${inputId}-description`;
    const errorId = `${inputId}-error`;
    const describedBy =
      [
        error ? errorId : helperText ? helperId : null,
        props["aria-describedby"],
      ]
        .filter(Boolean)
        .join(" ") || undefined;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              fontSize: "var(--dp-typography-small)",
              fontWeight: 700,
              color: "var(--dp-color-ink)",
              fontFamily: "var(--dp-typography-face)",
              marginLeft: "12px",
            }}
          >
            {label}
          </label>
        )}
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          {leftIcon && (
            <div
              style={{
                position: "absolute",
                left: "16px",
                display: "flex",
                alignItems: "center",
                pointerEvents: "none",
                color: "var(--dp-color-ink-secondary)",
              }}
            >
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            {...props}
            aria-invalid={error ? true : props["aria-invalid"]}
            aria-describedby={describedBy}
            style={{
              width: "100%",
              height: "46px",
              padding: leftIcon ? "8px 20px 8px 44px" : "8px 20px",
              paddingRight: rightIcon ? "44px" : "20px",
              backgroundColor: "#edeef6",
              border: "none",
              borderRadius: "var(--dp-radius-control)",
              boxShadow: "var(--clay-shadow-recessed)",
              color: "var(--dp-color-ink)",
              fontFamily: "var(--dp-typography-face)",
              fontSize: "var(--dp-typography-body)",
              outline: "none",
              transition: "box-shadow var(--dp-motion-interaction) ease",
              ...style,
            }}
            className={`clay-input ${className}`}
          />
          {rightIcon && (
            <div
              style={{
                position: "absolute",
                right: "16px",
                display: "flex",
                alignItems: "center",
                color: "var(--dp-color-ink-secondary)",
              }}
            >
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <span
            id={errorId}
            role="alert"
            style={{
              fontSize: "var(--dp-typography-caption)",
              color: "var(--status-danger)",
              fontWeight: 600,
              marginLeft: "12px",
            }}
          >
            {error}
          </span>
        ) : helperText ? (
          <span
            id={helperId}
            style={{
              fontSize: "var(--dp-typography-caption)",
              color: "var(--dp-color-ink-secondary)",
              marginLeft: "12px",
            }}
          >
            {helperText}
          </span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
