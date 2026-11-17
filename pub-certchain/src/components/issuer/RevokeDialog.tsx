import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { requestRevocation } from "@/lib/ledger/store";

export function RevokeDialog({ certId, issuerId, disabled }: { certId: string; issuerId: string; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline" disabled={disabled}>Revoke</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Revoke {certId}</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">The record stays on the chain and will always verify as Revoked. The Controller of Examinations must co-sign.</p>
        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for revocation (recorded on chain)" />
        <DialogFooter>
          <Button variant="destructive" disabled={reason.trim().length < 5} onClick={() => { requestRevocation(certId, reason.trim(), issuerId); setOpen(false); setReason(""); toast.success("Sent for co-signature"); }}>
            Request revocation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
