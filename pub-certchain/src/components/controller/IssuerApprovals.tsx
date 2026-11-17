import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HashText } from "@/components/common/HashText";
import { StatusBadge } from "@/components/common/StatusBadge";
import { approveIssuer, registerIssuer, useLedger } from "@/lib/ledger/store";

export function IssuerApprovals() {
  const issuers = useLedger((s) => s.issuers);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("Assistant Registrar");
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader><TableRow><TableHead>Staff</TableHead><TableHead>Wallet</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
        <TableBody>{issuers.map((i) => (
          <TableRow key={i.id}>
            <TableCell>{i.name}<p className="text-xs text-muted-foreground">{i.title}</p></TableCell>
            <TableCell><HashText value={i.wallet} /></TableCell>
            <TableCell><StatusBadge status={i.approved ? "approved" : "pending"} /></TableCell>
            <TableCell className="text-right">{!i.approved && <Button size="sm" onClick={() => { approveIssuer(i.id); toast.success(`${i.name} registered in contract`); }}>Approve</Button>}</TableCell>
          </TableRow>
        ))}</TableBody>
      </Table>
      <form className="flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); if (name.trim()) { registerIssuer(name.trim(), title); setName(""); } }}>
        <Input className="max-w-xs" placeholder="New staff name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input className="max-w-xs" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Button variant="outline" type="submit">Add applicant</Button>
      </form>
    </div>
  );
}
