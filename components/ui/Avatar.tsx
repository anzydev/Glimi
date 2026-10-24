import React, { useState } from "react";
import Image from "next/image";

export interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = "md",
  className = "",
}) => {
  const [imageError, setImageError] = useState(false);

  const sizePixels: Record<string, number> = {
    sm: 36,
    md: 46,
    lg: 60,
    xl: 84,
  };

  const px = sizePixels[size] || 46;

  const getInitials = (n?: string | null) => {
    if (!n) return "?";
    const parts = n.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  return (
    <div
      style={{
        width: `${px}px`,
        height: `${px}px`,
        borderRadius: "50%",
        overflow: "hidden",
        backgroundColor: "var(--dp-color-surface-compare)", // lavender tint
        boxShadow: "var(--clay-shadow-pill)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        position: "relative",
      }}
      className={`clay-avatar ${className}`}
    >
      {src && !imageError ? (
        <Image
          src={src}
          alt={name || "Avatar"}
          width={px}
          height={px}
          style={{ objectFit: "cover", width: "100%", height: "100%" }}
          onError={() => setImageError(true)}
          unoptimized
        />
      ) : (
        <span
          style={{
            fontFamily: "var(--dp-typography-face)",
            fontWeight: 700,
            fontSize: `${px * 0.42}px`,
            color: "var(--dp-color-ink)",
            lineHeight: 1,
          }}
        >
          {getInitials(name)}
        </span>
      )}
    </div>
  );
};
