import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { RoleGate } from "@/components/layout/RoleGate";
import { IssuerApprovals } from "@/components/controller/IssuerApprovals";
import { RevocationReview } from "@/components/controller/RevocationReview";

export const Route = createFileRoute("/controller")({
  head: () => ({
    meta: [
      { title: "Controller of Examinations — PUB CertChain" },
      { name: "description", content: "Approve issuer accounts and co-sign certificate revocations." },
      { property: "og:title", content: "Controller of Examinations — PUB CertChain" },
      { property: "og:description", content: "Oversight of issuers and revocations on the CertChain contract." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RoleGate role="Controller of Examinations" hint="coe@puc.ac.bd">
      <PageHeader eyebrow="Controller of Examinations" title="Oversight" description="Only approved issuers can write to the contract. Revocations need your co-signature." />
      <div className="grid gap-10 lg:grid-cols-2">
        <section><h2 className="mb-4 text-2xl font-semibold">Issuer accounts</h2><IssuerApprovals /></section>
        <section><h2 className="mb-4 text-2xl font-semibold">Revocation requests</h2><RevocationReview /></section>
      </div>
    </RoleGate>
  ),
});
