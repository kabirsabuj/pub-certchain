import { useState } from "react";
import { Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createShareLink } from "@/lib/ledger/store";

export function ShareLinkDialog({ certId }: { certId: string }) {
  const [hours, setHours] = useState("72");
  const [url, setUrl] = useState("");
  return (
    <Dialog onOpenChange={(o) => !o && setUrl("")}>
      <DialogTrigger asChild><Button size="sm"><Link2 className="h-4 w-4" />Share</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Share verification link</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">Employers open this link to see the verification result. It stops working after the chosen time.</p>
        <div className="flex gap-2">
          <Select value={hours} onValueChange={setHours}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="1">1 hour</SelectItem><SelectItem value="24">24 hours</SelectItem><SelectItem value="72">3 days</SelectItem><SelectItem value="168">7 days</SelectItem></SelectContent>
          </Select>
          <Button onClick={() => { const l = createShareLink(certId, Number(hours)); setUrl(`${window.location.origin}/?id=${certId}&token=${l.token}`); }}>Generate</Button>
        </div>
        {url && (
          <div className="flex gap-2">
            <Input readOnly value={url} className="font-mono text-xs" />
            <Button variant="outline" onClick={() => { void navigator.clipboard.writeText(url); toast.success("Link copied"); }}>Copy</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
