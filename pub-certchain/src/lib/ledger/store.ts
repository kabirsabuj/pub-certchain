import { useSyncExternalStore } from "react";
import { hashRecord, randomHex } from "./hash";
import type {
  AuditEvent, CertificateRecord, ChainEntry, Issuer, RevocationRequest, ShareLink,
  VerificationResult,
} from "./types";

export interface LedgerState {
  ready: boolean;
  records: Record<string, CertificateRecord>;
  chain: Record<string, ChainEntry>;
  issuers: Issuer[];
  revocations: RevocationRequest[];
  shares: ShareLink[];
  audit: AuditEvent[];
  block: number;
}

const KEY = "pub-certchain-v1";
const empty: LedgerState = {
  ready: false, records: {}, chain: {}, issuers: [], revocations: [], shares: [], audit: [], block: 1_204_330,
};

let state: LedgerState = empty;
const listeners = new Set<() => void>();

function set(next: Partial<LedgerState>) {
  state = { ...state, ...next };
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

export function useLedger<T>(select: (s: LedgerState) => T): T {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => select(state),
    () => select(empty),
  );
}
export const getLedger = () => state;

const uid = () => Math.random().toString(36).slice(2, 10);

function mine(): { txHash: string; block: number } {
  const block = state.block + 1;
  state = { ...state, block };
  return { txHash: randomHex(), block };
}

function log(e: Omit<AuditEvent, "id" | "at">) {
  set({ audit: [{ ...e, id: uid(), at: Date.now() }, ...state.audit] });
}

export function nextCertId(type: CertificateRecord["type"]): string {
  const prefix = type === "Transcript" ? "TR" : type === "Provisional Certificate" ? "PC" : "DC";
  const n = Object.keys(state.records).length + 1;
  return `PUB-${prefix}-${new Date().getFullYear()}-${String(n).padStart(5, "0")}`;
}

export const issuerById = (id: string) => state.issuers.find((i) => i.id === id);

export async function issueCertificate(record: CertificateRecord): Promise<ChainEntry> {
  const issuer = issuerById(record.issuerId);
  if (!issuer?.approved) throw new Error("Issuer is not registered in the smart contract");
  if (state.chain[record.certId]) throw new Error(`Certificate ${record.certId} already exists`);
  const hash = await hashRecord(record);
  const { txHash, block } = mine();
  const entry: ChainEntry = {
    certId: record.certId, hash, issuerId: record.issuerId, issueDate: record.issueDate,
    revoked: false, txHash, block,
  };
  set({
    records: { ...state.records, [record.certId]: record },
    chain: { ...state.chain, [record.certId]: entry },
  });
  log({ action: "ISSUE", certId: record.certId, actor: issuer.name, detail: `${record.type} for ${record.studentId}`, txHash, block });
  return entry;
}

export function requestRevocation(certId: string, reason: string, issuerId: string) {
  const issuer = issuerById(issuerId);
  const req: RevocationRequest = {
    id: uid(), certId, reason, requestedBy: issuer?.name ?? issuerId,
    requestedAt: new Date().toISOString(), status: "pending",
  };
  set({ revocations: [req, ...state.revocations] });
  log({ action: "REVOKE_REQUEST", certId, actor: req.requestedBy, detail: reason });
}

export function decideRevocation(id: string, approve: boolean) {
  const req = state.revocations.find((r) => r.id === id);
  if (!req) return;
  const revocations = state.revocations.map((r) =>
    r.id === id ? { ...r, status: approve ? ("co-signed" as const) : ("rejected" as const) } : r);
  if (!approve) { set({ revocations }); return; }
  const { txHash, block } = mine();
  const entry = state.chain[req.certId];
  if (!entry) return;
  set({
    revocations,
    chain: { ...state.chain, [req.certId]: { ...entry, revoked: true, revokeReason: req.reason } },
  });
  log({ action: "REVOKE", certId: req.certId, actor: "Controller of Examinations", detail: req.reason, txHash, block });
}

export function registerIssuer(name: string, title: string) {
  set({ issuers: [...state.issuers, { id: uid(), name, title, wallet: randomHex(20), approved: false }] });
}

export function approveIssuer(id: string) {
  const { txHash, block } = mine();
  const issuer = issuerById(id);
  set({ issuers: state.issuers.map((i) => (i.id === id ? { ...i, approved: true } : i)) });
  log({ action: "ISSUER_APPROVED", actor: "Controller of Examinations", detail: `${issuer?.name} added to issuer registry`, txHash, block });
}

export function createShareLink(certId: string, hours: number): ShareLink {
  const link: ShareLink = { token: randomHex(8).slice(2), certId, createdAt: Date.now(), expiresAt: Date.now() + hours * 3600_000 };
  set({ shares: [link, ...state.shares] });
  log({ action: "SHARE_LINK", certId, actor: "Student", detail: `Link valid for ${hours}h` });
  return link;
}

/** Recompute the hash of the presented record and compare with the on-chain fingerprint. */
export async function verify(certId: string, presented?: CertificateRecord, source = "ID lookup"): Promise<VerificationResult> {
  const onChain = state.chain[certId];
  let result: VerificationResult;
  if (!onChain) {
    result = { status: "not_found", certId };
  } else {
    const record = presented ?? state.records[certId]!;
    const computedHash = await hashRecord(record);
    const issuer = issuerById(onChain.issuerId);
    const status = onChain.revoked ? "revoked" : computedHash === onChain.hash ? "valid" : "invalid";
    result = { status, certId, computedHash, onChain, record, ...(issuer ? { issuer } : {}) };
  }
  log({ action: "VERIFY", certId, actor: "Public verifier", detail: `${source} → ${result.status.toUpperCase()}` });
  return result;
}

// ---------- bootstrap ----------
const SEED_ISSUERS: Issuer[] = [
  { id: "iss-registrar", name: "Dr. Farhana Rahman", title: "Registrar", wallet: "0x7a3f9c21e0b4d5a6c8e1f2a3b4c5d6e7f8091a2b", approved: true },
  { id: "iss-deputy", name: "Md. Tanvir Hossain", title: "Deputy Registrar", wallet: "0x1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e", approved: false },
];

const SEED_RECORDS: CertificateRecord[] = [
  { certId: "PUB-DC-2026-00001", type: "Degree Certificate", studentId: "1902010", studentName: "Shahnaj Kabir", program: "B.Sc. in Computer Science & Engineering", cgpa: "3.82", session: "2019–2023", issueDate: "2026-01-12", issuerId: "iss-registrar" },
  { certId: "PUB-TR-2026-00002", type: "Transcript", studentId: "1902010", studentName: "Shahnaj Kabir", program: "B.Sc. in Computer Science & Engineering", cgpa: "3.82", session: "2019–2023", issueDate: "2026-01-12", issuerId: "iss-registrar" },
  { certId: "PUB-DC-2026-00003", type: "Degree Certificate", studentId: "1902044", studentName: "Arif Chowdhury", program: "BBA in Finance", cgpa: "3.41", session: "2019–2023", issueDate: "2026-01-12", issuerId: "iss-registrar" },
];

export async function initLedger() {
  if (state.ready || typeof window === "undefined") return;
  const saved = localStorage.getItem(KEY);
  if (saved) {
    try { state = { ...JSON.parse(saved), ready: true }; listeners.forEach((l) => l()); return; } catch { /* reseed */ }
  }
  state = { ...empty, issuers: SEED_ISSUERS };
  for (const r of SEED_RECORDS) await issueCertificate(r);
  requestRevocation("PUB-DC-2026-00003", "Clerical error in program name; re-issue pending", "iss-registrar");
  decideRevocation(state.revocations[0]!.id, true);
  set({ ready: true });
}

export function resetLedger() {
  localStorage.removeItem(KEY);
  state = empty;
  void initLedger();
}
