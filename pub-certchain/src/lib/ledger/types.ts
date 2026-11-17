export type CertificateType = "Degree Certificate" | "Provisional Certificate" | "Transcript";

/** Off-chain record (university database). Never written to the chain. */
export interface CertificateRecord {
  certId: string;
  type: CertificateType;
  studentId: string;
  studentName: string;
  program: string;
  cgpa: string;
  session: string;
  issueDate: string; // YYYY-MM-DD
  issuerId: string;
}

/** On-chain entry: only hashes and references. */
export interface ChainEntry {
  certId: string;
  hash: string;
  issuerId: string;
  issueDate: string;
  revoked: boolean;
  revokeReason?: string | undefined;
  txHash: string;
  block: number;
}

export interface Issuer {
  id: string;
  name: string;
  title: string;
  wallet: string;
  approved: boolean;
}

export interface RevocationRequest {
  id: string;
  certId: string;
  reason: string;
  requestedBy: string;
  requestedAt: string;
  status: "pending" | "co-signed" | "rejected";
}

export interface ShareLink {
  token: string;
  certId: string;
  expiresAt: number;
  createdAt: number;
}

export type AuditAction =
  | "ISSUE"
  | "REVOKE_REQUEST"
  | "REVOKE"
  | "VERIFY"
  | "ISSUER_APPROVED"
  | "SHARE_LINK";

export interface AuditEvent {
  id: string;
  action: AuditAction;
  certId?: string;
  actor: string;
  detail: string;
  txHash?: string;
  block?: number;
  at: number;
}

export type VerificationStatus = "valid" | "invalid" | "not_found" | "revoked";

export interface VerificationResult {
  status: VerificationStatus;
  certId: string;
  computedHash?: string;
  onChain?: ChainEntry;
  record?: CertificateRecord | undefined;
  issuer?: Issuer | undefined;
}
