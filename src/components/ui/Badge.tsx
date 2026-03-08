import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error";
  className?: string;
}

const variants = {
  default: "bg-[var(--blue-pale)] text-[var(--blue-accent)]",
  success: "bg-green-50 text-[var(--green)]",
  warning: "bg-amber-50 text-[var(--amber)]",
  error: "bg-red-50 text-[var(--red)]",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
