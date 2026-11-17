import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function VerifyByIdForm({ initial = "", onSubmit }: { initial?: string; onSubmit: (id: string) => void }) {
  const [id, setId] = useState(initial);
  return (
    <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (id.trim()) onSubmit(id.trim()); }}>
      <Input value={id} onChange={(e) => setId(e.target.value)} placeholder="e.g. PUB-DC-2026-00001" className="font-mono" />
      <Button type="submit"><Search className="h-4 w-4" />Verify</Button>
    </form>
  );
}
