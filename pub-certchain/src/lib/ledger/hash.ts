import type { CertificateRecord } from "./types";

const FIELDS: (keyof CertificateRecord)[] = [
  "certId", "type", "studentId", "studentName", "program", "cgpa", "session", "issueDate", "issuerId",
];

/** Canonical serialisation: fixed key order so the same record always hashes identically. */
export function canonicalize(r: CertificateRecord): string {
  return JSON.stringify(FIELDS.map((k) => [k, r[k]]));
}

export function parseCanonical(s: string): CertificateRecord | null {
  try {
    const pairs = JSON.parse(s) as [keyof CertificateRecord, string][];
    return Object.fromEntries(pairs) as unknown as CertificateRecord;
  } catch {
    return null;
  }
}

export async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return "0x" + [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const hashRecord = (r: CertificateRecord) => sha256(canonicalize(r));

export function randomHex(bytes = 32): string {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  return "0x" + [...a].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Change exactly one character — used by the tampering demo. */
export function tamperOneChar(r: CertificateRecord): CertificateRecord {
  const name = r.studentName;
  const c = name.charAt(name.length - 1);
  const swapped = c === "a" ? "e" : "a";
  return { ...r, studentName: name.slice(0, -1) + swapped };
}
