import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { decideRevocation, useLedger } from "@/lib/ledger/store";

export function RevocationReview() {
  const reqs = useLedger((s) => s.revocations);
  const records = useLedger((s) => s.records);
  if (!reqs.length) return <p className="text-sm text-muted-foreground">No revocation requests.</p>;
  return (
    <ul className="divide-y rounded-sm border bg-card">
      {reqs.map((r) => (
        <li key={r.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div>
            <p className="font-mono text-sm">{r.certId} <span className="font-sans text-muted-foreground">· {records[r.certId]?.studentName}</span></p>
            <p className="mt-1 text-sm">“{r.reason}”</p>
            <p className="text-xs text-muted-foreground">Requested by {r.requestedBy} · {new Date(r.requestedAt).toLocaleString()}</p>
          </div>
          {r.status === "pending" ? (
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => decideRevocation(r.id, false)}>Reject</Button>
              <Button size="sm" variant="destructive" onClick={() => { decideRevocation(r.id, true); toast.success("Co-signed and revoked on chain"); }}>Co-sign revocation</Button>
            </div>
          ) : <StatusBadge status={r.status} />}
        </li>
      ))}
    </ul>
  );
}
