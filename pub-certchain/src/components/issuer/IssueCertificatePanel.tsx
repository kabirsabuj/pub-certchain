import { useState } from "react";
import { Download, Stamp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CertificateForm } from "@/components/certificate/CertificateForm";
import { CertificatePreview } from "@/components/certificate/CertificatePreview";
import { HashText } from "@/components/common/HashText";
import { issueCertificate, nextCertId } from "@/lib/ledger/store";
import { downloadBlob, generateCertificatePdf } from "@/lib/ledger/pdf";
import type { CertificateRecord, ChainEntry, Issuer } from "@/lib/ledger/types";

const blank = (issuerId: string): CertificateRecord => ({
  certId: nextCertId("Degree Certificate"), type: "Degree Certificate", studentId: "", studentName: "",
  program: "B.Sc. in Computer Science & Engineering", cgpa: "", session: "2020–2024",
  issueDate: new Date().toISOString().slice(0, 10), issuerId,
});

export function IssueCertificatePanel({ issuer }: { issuer: Issuer }) {
  const [rec, setRec] = useState(() => blank(issuer.id));
  const [issued, setIssued] = useState<{ rec: CertificateRecord; entry: ChainEntry } | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const entry = await issueCertificate({ ...rec, issuerId: issuer.id });
      setIssued({ rec, entry });
      toast.success(`Recorded ${rec.certId} in block ${entry.block}`);
      setRec(blank(issuer.id));
    } catch (err) { toast.error((err as Error).message); } finally { setBusy(false); }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
      <form onSubmit={submit} className="space-y-6">
        <CertificateForm value={rec} onChange={setRec} />
        <Button type="submit" disabled={busy || !issuer.approved}><Stamp className="h-4 w-4" />{busy ? "Signing transaction…" : "Issue & record on chain"}</Button>
        {!issuer.approved && <p className="text-sm text-destructive">Your issuer account awaits approval by the Controller of Examinations.</p>}
      </form>
      <div className="space-y-4">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Live preview</p>
        <CertificatePreview record={rec} issuerName={issuer.name} />
        {issued && (
          <div className="rounded-sm border bg-card p-4 text-sm">
            <p className="font-medium">Issued {issued.rec.certId}</p>
            <p className="mt-1">Hash <HashText value={issued.entry.hash} /> · Tx <HashText value={issued.entry.txHash} /></p>
            <Button size="sm" variant="outline" className="mt-3" onClick={async () => downloadBlob(await generateCertificatePdf(issued.rec, issuer.name), `${issued.rec.certId}.pdf`)}>
              <Download className="h-4 w-4" />Download PDF
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
