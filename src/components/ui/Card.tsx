import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)] border border-[var(--border)]",
        hover && "transition-all duration-[var(--transition)] hover:shadow-[var(--shadow-md)] hover:-translate-y-1",
        className
      )}
    >
      {children}
    </div>
  );
}
