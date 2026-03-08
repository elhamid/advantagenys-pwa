import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
  children: React.ReactNode;
}

const variants = {
  primary: "text-white hover:opacity-90",
  secondary: "bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--blue-pale)]",
  outline: "bg-transparent border-2 border-[var(--blue-accent)] text-[var(--blue-accent)] hover:bg-[var(--blue-accent)] hover:text-white",
  ghost: "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--blue-bg)] hover:text-[var(--blue-accent)]",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  href,
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center font-semibold rounded-[var(--radius)] transition-all duration-[var(--transition)] cursor-pointer",
    variant === "primary" ? "bg-[var(--blue-accent)]" : "",
    variants[variant],
    sizes[size],
    className
  );

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
