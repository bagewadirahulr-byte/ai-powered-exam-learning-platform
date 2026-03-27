import React from "react";

interface SkeletonProps {
  className?: string;
}

/**
 * A basic shimmering skeleton component for loading states.
 */
const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-white/5 ${className}`}
      style={{
        backgroundImage: "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 2s infinite linear",
      }}
    />
  );
};

export default Skeleton;
