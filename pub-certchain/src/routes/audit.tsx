import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/common/PageHeader";
import { AuditTable } from "@/components/audit/AuditTable";
import { TxExplorer } from "@/components/audit/TxExplorer";
import { resetLedger, useLedger } from "@/lib/ledger/store";
import type { AuditAction, AuditEvent } from "@/lib/ledger/types";

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "Audit Trail — PUB CertChain" },
      { name: "description", content: "Every issue, revocation and verification event with its blockchain transaction." },
      { property: "og:title", content: "Audit Trail — PUB CertChain" },
      { property: "og:description", content: "Transparent event log backed by on-chain transactions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuditPage,
});

const FILTERS: (AuditAction | "ALL")[] = ["ALL", "ISSUE", "REVOKE", "REVOKE_REQUEST", "VERIFY", "ISSUER_APPROVED", "SHARE_LINK"];

function AuditPage() {
  const audit = useLedger((s) => s.audit);
  const block = useLedger((s) => s.block);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<AuditEvent | null>(null);
  const events = useMemo(() => audit.filter((e) => (filter === "ALL" || e.action === filter) && (!q || (e.certId ?? "").includes(q) || (e.txHash ?? "").includes(q))), [audit, filter, q]);
  const stats = { issued: audit.filter((e) => e.action === "ISSUE").length, verified: audit.filter((e) => e.action === "VERIFY").length, revoked: audit.filter((e) => e.action === "REVOKE").length };
  return (
    <>
      <PageHeader eyebrow="Audit trail" title="Event log & explorer" description="Issue, revoke and issuer events carry the transaction hash written to the chain. Verifications are logged off-chain."
        actions={<Button variant="outline" size="sm" onClick={resetLedger}>Reset demo data</Button>} />
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[["Latest block", block], ["Issued", stats.issued], ["Revoked", stats.revoked], ["Verifications", stats.verified]].map(([k, v]) => (
          <div key={k} className="rounded-sm border bg-card p-4"><p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{k}</p><p className="mt-1 font-display text-3xl">{v}</p></div>
        ))}
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)} className="font-mono text-xs">{f}</Button>)}
        <Input className="ml-auto max-w-xs font-mono text-xs" placeholder="Search cert ID or tx hash" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <AuditTable events={events} onSelectTx={setSel} />
      <TxExplorer event={sel} onClose={() => setSel(null)} />
    </>
  );
}
