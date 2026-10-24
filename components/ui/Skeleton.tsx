import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  circle?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = "20px",
  borderRadius = "var(--radius-sm)",
  circle = false,
  style,
  className = "",
  ...props
}) => {
  return (
    <div
      {...props}
      aria-hidden="true"
      style={{
        width: circle ? height : width,
        height,
        borderRadius: circle ? "50%" : borderRadius,
        ...style,
      }}
      className={`shimmer-placeholder ${className}`}
    />
  );
};
