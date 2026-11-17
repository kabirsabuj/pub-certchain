import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CertificatePreview } from "@/components/certificate/CertificatePreview";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ShareLinkDialog } from "./ShareLinkDialog";
import { issuerById } from "@/lib/ledger/store";
import { downloadBlob, generateCertificatePdf } from "@/lib/ledger/pdf";
import type { CertificateRecord, ChainEntry } from "@/lib/ledger/types";

export function StudentCertificateCard({ record, entry }: { record: CertificateRecord; entry: ChainEntry }) {
  const issuer = issuerById(record.issuerId);
  return (
    <div className="space-y-3 rounded-sm border bg-card p-4">
      <CertificatePreview record={record} issuerName={issuer?.name} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div><p className="font-medium">{record.type}</p><p className="font-mono text-xs text-muted-foreground">{record.certId}</p></div>
        <div className="flex items-center gap-2">
          <StatusBadge status={entry.revoked ? "revoked" : "valid"} />
          <Button size="sm" variant="outline" onClick={async () => downloadBlob(await generateCertificatePdf(record, issuer?.name ?? ""), `${record.certId}.pdf`)}><Download className="h-4 w-4" />PDF</Button>
          {!entry.revoked && <ShareLinkDialog certId={record.certId} />}
        </div>
      </div>
    </div>
  );
}
