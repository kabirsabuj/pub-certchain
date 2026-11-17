import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CertificateRecord, CertificateType } from "@/lib/ledger/types";

const TYPES: CertificateType[] = ["Degree Certificate", "Provisional Certificate", "Transcript"];

export function CertificateForm({ value, onChange }: { value: CertificateRecord; onChange: (v: CertificateRecord) => void }) {
  const field = (k: keyof CertificateRecord, label: string, type = "text") => (
    <div className="space-y-1.5">
      <Label htmlFor={k}>{label}</Label>
      <Input id={k} type={type} value={value[k]} onChange={(e) => onChange({ ...value, [k]: e.target.value })} required />
    </div>
  );
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1.5 sm:col-span-2">
        <Label>Certificate type</Label>
        <Select value={value.type} onValueChange={(t) => onChange({ ...value, type: t as CertificateType })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      {field("studentName", "Student name")}
      {field("studentId", "Student ID")}
      <div className="sm:col-span-2">{field("program", "Program")}</div>
      {field("cgpa", "CGPA")}
      {field("session", "Session")}
      {field("issueDate", "Issue date", "date")}
      {field("certId", "Certificate ID")}
    </div>
  );
}
