import { StatusBadge } from "@/components/common/StatusBadge";
import { useLedger } from "@/lib/ledger/store";

export function ShareLinksList({ certIds }: { certIds: string[] }) {
  const shares = useLedger((s) => s.shares).filter((l) => certIds.includes(l.certId));
  if (!shares.length) return <p className="text-sm text-muted-foreground">No links shared yet.</p>;
  return (
    <ul className="divide-y rounded-sm border bg-card text-sm">
      {shares.map((l) => (
        <li key={l.token} className="flex items-center justify-between gap-2 p-3">
          <span className="font-mono text-xs">{l.certId} · {l.token}</span>
          <span className="flex items-center gap-2 text-xs text-muted-foreground">expires {new Date(l.expiresAt).toLocaleString()} <StatusBadge status={l.expiresAt > Date.now() ? "active" : "expired"} /></span>
        </li>
      ))}
    </ul>
  );
}
