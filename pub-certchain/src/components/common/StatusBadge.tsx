import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  valid: "bg-success text-success-foreground",
  active: "bg-success text-success-foreground",
  approved: "bg-success text-success-foreground",
  "co-signed": "bg-success text-success-foreground",
  revoked: "bg-destructive text-destructive-foreground",
  invalid: "bg-destructive text-destructive-foreground",
  rejected: "bg-muted text-muted-foreground",
  pending: "bg-warning text-warning-foreground",
  expired: "bg-muted text-muted-foreground",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge className={cn("uppercase tracking-wide text-[10px] border-0", styles[status] ?? "bg-secondary text-secondary-foreground")}>{status}</Badge>;
}
