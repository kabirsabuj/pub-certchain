import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { RoleGate } from "@/components/layout/RoleGate";
import { StudentCertificateCard } from "@/components/student/StudentCertificateCard";
import { ShareLinksList } from "@/components/student/ShareLinksList";
import { useLedger } from "@/lib/ledger/store";

const STUDENT_ID = "1902010";

export const Route = createFileRoute("/student")({
  head: () => ({
    meta: [
      { title: "Student Portal — PUB CertChain" },
      { name: "description", content: "View, download and share your verified Premier University certificates." },
      { property: "og:title", content: "Student Portal — PUB CertChain" },
      { property: "og:description", content: "Share time-limited verification links with employers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StudentPage,
});

function StudentPage() {
  const records = useLedger((s) => s.records);
  const chain = useLedger((s) => s.chain);
  const mine = Object.values(records).filter((r) => r.studentId === STUDENT_ID);
  return (
    <RoleGate role="Student" hint="1902010@puc.ac.bd">
      <PageHeader eyebrow={`Student · ${STUDENT_ID}`} title="My certificates" description="Download your certificates or send an employer a link that expires automatically." />
      <div className="grid gap-6 md:grid-cols-2">{mine.map((r) => chain[r.certId] && <StudentCertificateCard key={r.certId} record={r} entry={chain[r.certId]!} />)}</div>
      <h2 className="mb-3 mt-10 text-2xl font-semibold">Shared links</h2>
      <ShareLinksList certIds={mine.map((r) => r.certId)} />
    </RoleGate>
  );
}
