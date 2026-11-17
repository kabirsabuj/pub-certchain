import { QRCodeSVG } from "qrcode.react";
import { verifyUrl } from "@/lib/ledger/pdf";
import type { CertificateRecord } from "@/lib/ledger/types";

export function CertificatePreview({ record, issuerName }: { record: CertificateRecord; issuerName?: string | undefined }) {
  return (
    <div className="aspect-[297/210] w-full rounded-sm border-4 border-double border-primary bg-card p-[4%] text-center text-card-foreground shadow-[var(--shadow-paper)] [container-type:inline-size]">
      <div className="flex h-full flex-col justify-between">
        <div>
          <p className="font-display text-[5cqw] font-semibold leading-none">Premier University</p>
          <p className="text-[1.8cqw] text-muted-foreground">Chittagong, Bangladesh</p>
          <p className="mt-[2cqw] font-display text-[3cqw] italic text-primary">{record.type}</p>
        </div>
        <div className="space-y-[0.8cqw]">
          <p className="text-[1.8cqw]">This is to certify that</p>
          <p className="font-display text-[4cqw] font-semibold">{record.studentName || "Student name"}</p>
          <p className="text-[1.8cqw]">Student ID {record.studentId || "—"}, session {record.session || "—"}, has fulfilled the requirements of</p>
          <p className="text-[2.2cqw] font-semibold">{record.program || "Program"}</p>
          <p className="text-[1.8cqw]">with a CGPA of {record.cgpa || "—"} on a scale of 4.00</p>
        </div>
        <div className="flex items-end justify-between text-left">
          <div className="font-mono text-[1.4cqw] text-muted-foreground"><p>ID {record.certId}</p><p>Issued {record.issueDate}</p></div>
          <div className="border-t border-foreground px-[3cqw] pt-[0.5cqw] text-[1.5cqw]">{issuerName ?? "Registrar"}</div>
          <div className="w-[11cqw]"><QRCodeSVG value={verifyUrl(record.certId)} className="h-auto w-full" bgColor="transparent" /></div>
        </div>
      </div>
    </div>
  );
}
