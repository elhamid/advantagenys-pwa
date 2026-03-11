import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  rounded?: "sm" | "md" | "lg" | "full";
}

const roundedMap = {
  sm: "rounded",
  md: "rounded-md",
  lg: "rounded-xl",
  full: "rounded-full",
};

export function Skeleton({ className, rounded = "md" }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-[shimmer_1.5s_ease-in-out_infinite]",
        "bg-[length:200%_100%]",
        "bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100",
        roundedMap[rounded],
        className
      )}
      aria-hidden="true"
    />
  );
}
