import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/common/PageHeader";
import { RoleGate } from "@/components/layout/RoleGate";
import { IssueCertificatePanel } from "@/components/issuer/IssueCertificatePanel";
import { BatchUpload } from "@/components/issuer/BatchUpload";
import { IssuedCertificatesTable } from "@/components/issuer/IssuedCertificatesTable";
import { useLedger } from "@/lib/ledger/store";

export const Route = createFileRoute("/issuer")({
  head: () => ({
    meta: [
      { title: "Registrar Portal — PUB CertChain" },
      { name: "description", content: "Issue, batch-upload and revoke Premier University certificates on chain." },
      { property: "og:title", content: "Registrar Portal — PUB CertChain" },
      { property: "og:description", content: "Issue and manage blockchain-backed academic certificates." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: IssuerPage,
});

function IssuerPage() {
  const issuers = useLedger((s) => s.issuers);
  const [issuerId, setIssuerId] = useState(issuers[0]?.id);
  const issuer = issuers.find((i) => i.id === issuerId) ?? issuers[0];
  if (!issuer) return null;
  return (
    <RoleGate role="Registrar" hint="registrar@puc.ac.bd">
      <PageHeader eyebrow="Registrar / Issuer" title="Issue certificates" description="Every certificate is fingerprinted with SHA-256 and recorded in the CertChain contract."
        actions={
          <Select value={issuer.id} onValueChange={setIssuerId}>
            <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
            <SelectContent>{issuers.map((i) => <SelectItem key={i.id} value={i.id}>{i.name}{i.approved ? "" : " (pending)"}</SelectItem>)}</SelectContent>
          </Select>
        } />
      <Tabs defaultValue="single">
        <TabsList><TabsTrigger value="single">New certificate</TabsTrigger><TabsTrigger value="batch">Batch CSV</TabsTrigger><TabsTrigger value="issued">Issued & revocation</TabsTrigger></TabsList>
        <TabsContent value="single" className="pt-6"><IssueCertificatePanel key={issuer.id} issuer={issuer} /></TabsContent>
        <TabsContent value="batch" className="pt-6"><BatchUpload issuer={issuer} /></TabsContent>
        <TabsContent value="issued" className="pt-6"><IssuedCertificatesTable issuer={issuer} /></TabsContent>
      </Tabs>
    </RoleGate>
  );
}
