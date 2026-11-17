import { describe, expect, it } from "vitest";
import { hashRecord, tamperOneChar } from "./hash";
import type { CertificateRecord } from "./types";

const rec: CertificateRecord = { certId: "PUB-DC-2026-00001", type: "Degree Certificate", studentId: "1", studentName: "Shahnaj Kabir", program: "CSE", cgpa: "3.82", session: "2019–2023", issueDate: "2026-01-12", issuerId: "x" };

describe("certificate fingerprint", () => {
  it("is stable for the same record", async () => {
    expect(await hashRecord({ ...rec })).toBe(await hashRecord(rec));
  });
  it("changes when one character changes", async () => {
    expect(await hashRecord(tamperOneChar(rec))).not.toBe(await hashRecord(rec));
  });
});
