import { cn } from "@/lib/utils";

type Tone = "default" | "success" | "warning" | "danger" | "info" | "muted";

interface StatusBadgeProps {
  label: string;
  tone?: Tone;
  className?: string;
}

const toneClass: Record<Tone, string> = {
  default: "bg-secondary text-secondary-foreground",
  success: "bg-success/15 text-success border border-success/30",
  warning: "bg-warning/15 text-warning-foreground border border-warning/30",
  danger: "bg-destructive/10 text-destructive border border-destructive/30",
  info: "bg-info/15 text-info border border-info/30",
  muted: "bg-muted text-muted-foreground",
};

export function StatusBadge({ label, tone = "default", className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap",
        toneClass[tone],
        className,
      )}
    >
      <span
        className={cn("size-1.5 rounded-full", {
          "bg-success": tone === "success",
          "bg-warning": tone === "warning",
          "bg-destructive": tone === "danger",
          "bg-info": tone === "info",
          "bg-muted-foreground": tone === "muted" || tone === "default",
        })}
      />
      {label}
    </span>
  );
}
