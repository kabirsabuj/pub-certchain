import { useState } from "react";
import { FileUp } from "lucide-react";
import { readCertificatePdf } from "@/lib/ledger/pdf";
import type { CertificateRecord } from "@/lib/ledger/types";

export function PdfUpload({ onParsed }: { onParsed: (r: CertificateRecord | null, fileName: string) => void }) {
  const [drag, setDrag] = useState(false);
  const handle = async (f?: File) => { if (f) onParsed(await readCertificatePdf(f), f.name); };
  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); void handle(e.dataTransfer.files[0]); }}
      className={`flex cursor-pointer flex-col items-center gap-2 rounded-sm border-2 border-dashed p-10 text-center ${drag ? "border-primary bg-primary/5" : "border-border"}`}
    >
      <FileUp className="h-8 w-8 text-primary" />
      <span className="font-medium">Drop the certificate PDF or click to choose</span>
      <span className="text-xs text-muted-foreground">The SHA-256 fingerprint is computed in your browser. The file is never uploaded.</span>
      <input type="file" accept="application/pdf" className="hidden" onChange={(e) => void handle(e.target.files?.[0])} />
    </label>
  );
}
