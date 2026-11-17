import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { AuditEvent } from "@/lib/ledger/types";

export function AuditTable({ events, onSelectTx }: { events: AuditEvent[]; onSelectTx: (e: AuditEvent) => void }) {
  return (
    <Table>
      <TableHeader><TableRow><TableHead>Time</TableHead><TableHead>Event</TableHead><TableHead>Certificate</TableHead><TableHead>Actor</TableHead><TableHead>Detail</TableHead><TableHead>Transaction</TableHead></TableRow></TableHeader>
      <TableBody>{events.map((e) => (
        <TableRow key={e.id}>
          <TableCell className="whitespace-nowrap text-xs">{new Date(e.at).toLocaleString()}</TableCell>
          <TableCell><Badge variant="outline" className="font-mono text-[10px]">{e.action}</Badge></TableCell>
          <TableCell className="font-mono text-xs">{e.certId ?? "—"}</TableCell>
          <TableCell className="text-sm">{e.actor}</TableCell>
          <TableCell className="text-sm text-muted-foreground">{e.detail}</TableCell>
          <TableCell>{e.txHash ? <button className="font-mono text-xs text-primary underline-offset-2 hover:underline" onClick={() => onSelectTx(e)}>{e.txHash.slice(0, 12)}…</button> : <span className="text-xs text-muted-foreground">off-chain</span>}</TableCell>
        </TableRow>
      ))}</TableBody>
    </Table>
  );
}

