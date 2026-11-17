import { useState, type ReactNode } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Demo staff sign-in. Replace with real authentication when a backend is connected. */
export function RoleGate({ role, hint, children }: { role: string; hint: string; children: ReactNode }) {
  const [ok, setOk] = useState(false);
  if (ok) return <>{children}</>;
  return (
    <Card className="mx-auto mt-12 max-w-md shadow-[var(--shadow-paper)]">
      <CardHeader><CardTitle className="flex items-center gap-2 font-display"><Lock className="h-5 w-5" />{role} sign-in</CardTitle></CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setOk(true); }}>
          <div className="space-y-1.5"><Label>University email</Label><Input type="email" defaultValue={hint} required /></div>
          <div className="space-y-1.5"><Label>Password</Label><Input type="password" defaultValue="demo-password" required /></div>
          <Button className="w-full" type="submit">Sign in</Button>
          <p className="text-xs text-muted-foreground">Demo mode: any password works.</p>
        </form>
      </CardContent>
    </Card>
  );
}
