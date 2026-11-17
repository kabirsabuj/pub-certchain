import { FlaskConical } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function TamperToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-sm border border-dashed bg-muted/50 p-4">
      <div className="flex items-start gap-3">
        <FlaskConical className="mt-0.5 h-5 w-5 text-accent-foreground" />
        <div>
          <Label htmlFor="tamper" className="font-medium">Tampering demo</Label>
          <p className="text-xs text-muted-foreground">Changes one character of the holder's name before hashing, to show verification fail.</p>
        </div>
      </div>
      <Switch id="tamper" checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
