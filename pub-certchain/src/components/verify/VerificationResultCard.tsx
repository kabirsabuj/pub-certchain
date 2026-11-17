import { AlertOctagon, Ban, CheckCircle2, SearchX } from "lucide-react";
import { HashText } from "@/components/common/HashText";
import { cn } from "@/lib/utils";
import type { VerificationResult } from "@/lib/ledger/types";

const META = {
  valid: { icon: CheckCircle2, title: "Valid certificate", tone: "border-success bg-success/10 text-success", note: "The recomputed fingerprint matches the on-chain record." },
  invalid: { icon: AlertOctagon, title: "Invalid — modified", tone: "border-destructive bg-destructive/10 text-destructive", note: "The fingerprint does not match. This document has been altered." },
  not_found: { icon: SearchX, title: "Invalid — not found", tone: "border-destructive bg-destructive/10 text-destructive", note: "No certificate with this ID was ever recorded on the chain." },
  revoked: { icon: Ban, title: "Revoked", tone: "border-warning bg-warning/15 text-warning-foreground", note: "This certificate was issued but has since been revoked by the university." },
} as const;

export function VerificationResultCard({ result }: { result: VerificationResult }) {
  const m = META[result.status];
  const Icon = m.icon;
  const r = result.record;
  return (
    <div className={cn("rounded-sm border-2 p-6", m.tone)}>
      <div className="flex items-start gap-4">
        <Icon className="h-10 w-10 shrink-0" />
        <div>
          <h2 className="text-3xl font-semibold">{m.title}</h2>
          <p className="mt-1 text-sm text-foreground/80">{m.note}</p>
        </div>
      </div>
      <dl className="mt-6 grid gap-x-8 gap-y-3 text-sm text-foreground sm:grid-cols-2">
        <Row k="Certificate ID" v={<span className="font-mono">{result.certId}</span>} />
        {r && <Row k="Holder" v={`${r.studentName} (${r.studentId})`} />}
        {r && <Row k="Award" v={`${r.type} · ${r.program}`} />}
        {result.issuer && <Row k="Issuing authority" v={`${result.issuer.name}, ${result.issuer.title}, Premier University`} />}
        {result.onChain && <Row k="Issue date" v={result.onChain.issueDate} />}
        {result.onChain?.revoked && <Row k="Revocation reason" v={result.onChain.revokeReason} />}
        {result.computedHash && <Row k="Recomputed SHA-256" v={<HashText value={result.computedHash} short={false} />} />}
        {result.onChain && <Row k="On-chain SHA-256" v={<HashText value={result.onChain.hash} short={false} />} />}
        {result.onChain && <Row k="Transaction" v={<span><HashText value={result.onChain.txHash} /> · block {result.onChain.block}</span>} />}
      </dl>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{k}</dt>
      <dd className="mt-0.5">{v}</dd>
    </div>
  );
}
