import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { canonicalize, parseCanonical } from "./hash";
import type { CertificateRecord } from "./types";

const MARK = "CERTCHAIN:";

export const verifyUrl = (certId: string) =>
  `${typeof window !== "undefined" ? window.location.origin : ""}/?id=${encodeURIComponent(certId)}`;

/** Generates the certificate PDF. The canonical payload is embedded (base64) so the hash can be recomputed on upload. */
export async function generateCertificatePdf(r: CertificateRecord, issuerName: string): Promise<Blob> {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = 297;
  doc.setDrawColor(30, 70, 60); doc.setLineWidth(1.2); doc.rect(10, 10, W - 20, 190);
  doc.setLineWidth(0.3); doc.rect(14, 14, W - 28, 182);
  doc.setFont("times", "bold"); doc.setFontSize(26); doc.text("Premier University", W / 2, 38, { align: "center" });
  doc.setFont("times", "normal"); doc.setFontSize(12); doc.text("Chittagong, Bangladesh", W / 2, 46, { align: "center" });
  doc.setFontSize(20); doc.setFont("times", "italic"); doc.text(r.type, W / 2, 64, { align: "center" });
  doc.setFont("times", "normal"); doc.setFontSize(13);
  doc.text("This is to certify that", W / 2, 82, { align: "center" });
  doc.setFont("times", "bold"); doc.setFontSize(24); doc.text(r.studentName, W / 2, 96, { align: "center" });
  doc.setFont("times", "normal"); doc.setFontSize(13);
  doc.text(`Student ID ${r.studentId}, session ${r.session}, has fulfilled the requirements of`, W / 2, 110, { align: "center" });
  doc.setFont("times", "bold"); doc.text(r.program, W / 2, 120, { align: "center" });
  doc.setFont("times", "normal"); doc.text(`with a CGPA of ${r.cgpa} on a scale of 4.00`, W / 2, 130, { align: "center" });
  doc.setFontSize(10);
  doc.text(`Certificate ID: ${r.certId}`, 24, 170);
  doc.text(`Issue date: ${r.issueDate}`, 24, 176);
  doc.line(110, 172, 180, 172); doc.text(`${issuerName}, Registrar`, 145, 178, { align: "center" });
  const qr: string = await QRCode.toDataURL(verifyUrl(r.certId), { margin: 0, width: 240 });
  doc.addImage(qr, "PNG", W - 58, 148, 34, 34);
  doc.setFontSize(7); doc.text("Scan to verify", W - 41, 186, { align: "center" });
  const b64 = btoa(unescape(encodeURIComponent(canonicalize(r))));
  doc.setProperties({ title: `${r.type} ${r.certId}`, subject: r.certId, keywords: MARK + b64, creator: "PUB CertChain" });
  return doc.output("blob");
}

/** Extracts the embedded payload from an uploaded certificate PDF. */
export async function readCertificatePdf(file: File): Promise<CertificateRecord | null> {
  const text = new TextDecoder("latin1").decode(await file.arrayBuffer());
  const m = text.match(/CERTCHAIN:([A-Za-z0-9+/=]+)/);
  if (!m) return null;
  try { return parseCanonical(decodeURIComponent(escape(atob(m[1] ?? "")))); } catch { return null; }
}

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
