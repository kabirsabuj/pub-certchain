import { Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function HashText({ value, short = true, className }: { value: string; short?: boolean; className?: string }) {
  const shown = short && value.length > 20 ? `${value.slice(0, 10)}…${value.slice(-8)}` : value;
  return (
    <button
      type="button"
      title={value}
      onClick={() => { void navigator.clipboard.writeText(value); toast.success("Copied"); }}
      className={cn("inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-foreground break-all text-left", className)}
    >
      {shown}<Copy className="h-3 w-3 shrink-0" />
    </button>
  );
}
