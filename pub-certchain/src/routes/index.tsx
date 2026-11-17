import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/common/PageHeader";
import { VerifyByIdForm } from "@/components/verify/VerifyByIdForm";
import { QrScanner } from "@/components/verify/QrScanner";
import { PdfUpload } from "@/components/verify/PdfUpload";
import { TamperToggle } from "@/components/verify/TamperToggle";
import { VerificationResultCard } from "@/components/verify/VerificationResultCard";
import { getLedger, verify } from "@/lib/ledger/store";
import { tamperOneChar } from "@/lib/ledger/hash";
import type { CertificateRecord, VerificationResult } from "@/lib/ledger/types";

type Search = { id?: string | undefined; token?: string | undefined };

export const Route = createFileRoute("/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    id: typeof s["id"] === "string" ? s["id"] : undefined,
    token: typeof s["token"] === "string" ? s["token"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Verify a Certificate — PUB CertChain" },
      { name: "description", content: "Check any Premier University certificate by ID, QR code or PDF against its blockchain record." },
      { property: "og:title", content: "Verify a Certificate — PUB CertChain" },
      { property: "og:description", content: "Instant, account-free verification of Premier University certificates." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VerifyPage,
});

function VerifyPage() {
  const { id, token } = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [presented, setPresented] = useState<{ certId: string; record?: CertificateRecord; source: string } | null>(null);
  const [tamper, setTamper] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const runId = useRef(0);
  const run = useCallback(async (certId: string, record: CertificateRecord | undefined, source: string, tampered: boolean) => {
    const mine = ++runId.current;
    const base = record ?? getLedger().records[certId];
    const input = tampered && base ? tamperOneChar(base) : record;
    const r = await verify(certId, input, tampered ? `${source} (tampered)` : source);
    if (mine === runId.current) setResult(r);
  }, []);

  useEffect(() => { if (presented) void run(presented.certId, presented.record, presented.source, tamper); }, [presented, tamper, run]);

  useEffect(() => {
    if (!id) return;
    if (token) {
      const link = getLedger().shares.find((l) => l.token === token && l.certId === id);
      if (!link) { setNotice("This share link is not recognised."); return; }
      if (link.expiresAt < Date.now()) { setNotice("This share link has expired. Ask the graduate for a new one."); setResult(null); return; }
      setNotice(`Shared verification link · valid until ${new Date(link.expiresAt).toLocaleString()}`);
    }
    setPresented({ certId: id, source: token ? "Share link" : "ID lookup" });
  }, [id, token]);

  const byId = (certId: string) => { setNotice(null); void navigate({ search: { id: certId, token: undefined } }); };
  const onQr = useCallback((certId: string) => { setNotice(null); setPresented({ certId, source: "QR scan" }); }, []);

  return (
    <>
      <PageHeader eyebrow="Public verification" title="Is this certificate genuine?" description="No account needed. We recompute the certificate's SHA-256 fingerprint and compare it with the record Premier University wrote to the blockchain." />
      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <Tabs defaultValue="id">
                <TabsList className="grid w-full grid-cols-3"><TabsTrigger value="id">Certificate ID</TabsTrigger><TabsTrigger value="qr">Scan QR</TabsTrigger><TabsTrigger value="pdf">Upload PDF</TabsTrigger></TabsList>
                <TabsContent value="id" className="pt-4 space-y-3">
                  <VerifyByIdForm initial={id ?? ""} onSubmit={byId} />
                  <p className="text-xs text-muted-foreground">Try <code className="font-mono">PUB-DC-2026-00001</code> (valid) or <code className="font-mono">PUB-DC-2026-00003</code> (revoked).</p>
                </TabsContent>
                <TabsContent value="qr" className="pt-4"><QrScanner onDetected={onQr} /></TabsContent>
                <TabsContent value="pdf" className="pt-4">
                  <PdfUpload onParsed={(rec, name) => {
                    if (!rec) { setNotice(`${name} is not a CertChain certificate or its embedded data is damaged.`); setResult({ status: "not_found", certId: "—" }); setPresented(null); return; }
                    setNotice(null); setPresented({ certId: rec.certId, record: rec, source: "PDF upload" });
                  }} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          <TamperToggle checked={tamper} onChange={setTamper} />
        </div>
        <div className="space-y-3">
          {notice && <p className="flex items-center gap-2 rounded-sm bg-secondary px-3 py-2 text-sm"><Clock className="h-4 w-4" />{notice}</p>}
          {result ? <VerificationResultCard result={result} /> : (
            <div className="grid h-full min-h-64 place-items-center rounded-sm border border-dashed p-8 text-center text-muted-foreground">Result will appear here.</div>
          )}
        </div>
      </div>
    </>
  );
}
