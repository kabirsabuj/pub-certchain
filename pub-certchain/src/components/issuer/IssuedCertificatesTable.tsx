import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HashText } from "@/components/common/HashText";
import { StatusBadge } from "@/components/common/StatusBadge";
import { RevokeDialog } from "./RevokeDialog";
import { useLedger, issuerById } from "@/lib/ledger/store";
import { downloadBlob, generateCertificatePdf } from "@/lib/ledger/pdf";
import type { Issuer } from "@/lib/ledger/types";

export function IssuedCertificatesTable({ issuer }: { issuer: Issuer }) {
  const records = useLedger((s) => s.records);
  const chain = useLedger((s) => s.chain);
  const revocations = useLedger((s) => s.revocations);
  const list = Object.values(records).reverse();
  return (
    <Table>
      <TableHeader><TableRow><TableHead>Certificate</TableHead><TableHead>Holder</TableHead><TableHead>Hash</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
      <TableBody>{list.map((r) => {
        const c = chain[r.certId];
        if (!c) return null;
        const pending = revocations.some((v) => v.certId === r.certId && v.status === "pending");
        return (
          <TableRow key={r.certId}>
            <TableCell><p className="font-mono text-xs">{r.certId}</p><p className="text-xs text-muted-foreground">{r.type}</p></TableCell>
            <TableCell>{r.studentName}<p className="text-xs text-muted-foreground">{r.studentId}</p></TableCell>
            <TableCell><HashText value={c.hash} /></TableCell>
            <TableCell><StatusBadge status={c.revoked ? "revoked" : pending ? "pending" : "active"} /></TableCell>
            <TableCell className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={async () => downloadBlob(await generateCertificatePdf(r, issuerById(r.issuerId)?.name ?? ""), `${r.certId}.pdf`)}><Download className="h-4 w-4" /></Button>
              <RevokeDialog certId={r.certId} issuerId={issuer.id} disabled={c.revoked || pending || !issuer.approved} />
            </TableCell>
          </TableRow>
        );
      })}</TableBody>
    </Table>
  );
}
