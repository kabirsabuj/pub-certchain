import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { HashText } from "@/components/common/HashText";
import { useLedger } from "@/lib/ledger/store";
import type { AuditEvent } from "@/lib/ledger/types";

const METHOD: Record<string, string> = { ISSUE: "issueCertificate(bytes32 id, bytes32 hash)", REVOKE: "revokeCertificate(bytes32 id, string reason)", ISSUER_APPROVED: "addIssuer(address issuer)" };

export function TxExplorer({ event, onClose }: { event: AuditEvent | null; onClose: () => void }) {
  const chain = useLedger((s) => s.chain);
  const entry = event?.certId ? chain[event.certId] : undefined;
  return (
    <Sheet open={!!event} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader><SheetTitle className="font-display">Transaction details</SheetTitle></SheetHeader>
        {event && (
          <dl className="mt-6 space-y-4 px-4 text-sm">
            <Item k="Tx hash" v={<HashText value={event.txHash!} short={false} />} />
            <Item k="Status" v={<span className="text-success font-medium">Success</span>} />
            <Item k="Block" v={event.block} />
            <Item k="Timestamp" v={new Date(event.at).toUTCString()} />
            <Item k="Network" v="Sepolia testnet (chain id 11155111)" />
            <Item k="Contract method" v={<span className="font-mono text-xs">{METHOD[event.action] ?? event.action}</span>} />
            {entry && <Item k="Stored fingerprint" v={<HashText value={entry.hash} short={false} />} />}
            {entry && <Item k="Current state" v={entry.revoked ? `Revoked — ${entry.revokeReason}` : "Active"} />}
            <p className="rounded-sm bg-muted p-3 text-xs text-muted-foreground">Only the certificate ID, SHA-256 fingerprint, issuer address and date are stored on chain. No names, grades or contact details.</p>
          </dl>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Item({ k, v }: { k: string; v: React.ReactNode }) {
  return <div><dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{k}</dt><dd className="mt-0.5 break-all">{v}</dd></div>;
}
