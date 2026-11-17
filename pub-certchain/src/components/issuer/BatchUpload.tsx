import { useState } from "react";
import Papa from "papaparse";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { issueCertificate, nextCertId } from "@/lib/ledger/store";
import type { CertificateRecord, CertificateType, Issuer } from "@/lib/ledger/types";

const SAMPLE = "studentId,studentName,program,cgpa,session,type\n2002101,Nusrat Jahan,B.Sc. in EEE,3.67,2020–2024,Degree Certificate\n2002102,Rakib Hasan,B.Sc. in EEE,3.21,2020–2024,Degree Certificate\n";

type Row = { studentId: string; studentName: string; program: string; cgpa: string; session: string; type?: string | undefined; result?: string | undefined };

export function BatchUpload({ issuer }: { issuer: Issuer }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);

  const load = (text: string) => {
    const parsed = Papa.parse<Row>(text.trim(), { header: true, skipEmptyLines: true });
    setRows(parsed.data.filter((r) => r.studentId && r.studentName));
    setProgress(0);
  };

  const run = async () => {
    setRunning(true);
    const out = [...rows];
    for (let i = 0; i < out.length; i++) {
      const r = out[i]!;
      const type = (r.type as CertificateType) || "Degree Certificate";
      const rec: CertificateRecord = {
        certId: nextCertId(type), type, studentId: r.studentId, studentName: r.studentName, program: r.program,
        cgpa: r.cgpa, session: r.session, issueDate: new Date().toISOString().slice(0, 10), issuerId: issuer.id,
      };
      try { await issueCertificate(rec); out[i] = { ...r, result: rec.certId }; }
      catch (e) { out[i] = { ...r, result: `Error: ${(e as Error).message}` }; }
      setRows([...out]); setProgress(((i + 1) / out.length) * 100);
    }
    setRunning(false);
    toast.success(`Batch complete: ${out.length} certificates`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" asChild>
          <label className="cursor-pointer"><Upload className="h-4 w-4" />Choose CSV
            <input type="file" accept=".csv,text/csv" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) load(await f.text()); }} />
          </label>
        </Button>
        <Button variant="ghost" onClick={() => load(SAMPLE)}>Load sample batch</Button>
        <Button disabled={!rows.length || running || !issuer.approved} onClick={run}>Issue {rows.length || ""} certificates</Button>
      </div>
      <p className="text-xs text-muted-foreground font-mono">Columns: studentId, studentName, program, cgpa, session, type</p>
      {rows.length > 0 && (
        <>
          <Progress value={progress} />
          <Table>
            <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Name</TableHead><TableHead>Program</TableHead><TableHead>CGPA</TableHead><TableHead>Result</TableHead></TableRow></TableHeader>
            <TableBody>{rows.map((r, i) => (
              <TableRow key={i}><TableCell>{r.studentId}</TableCell><TableCell>{r.studentName}</TableCell><TableCell>{r.program}</TableCell><TableCell>{r.cgpa}</TableCell><TableCell className="font-mono text-xs">{r.result ?? "queued"}</TableCell></TableRow>
            ))}</TableBody>
          </Table>
        </>
      )}
    </div>
  );
}
