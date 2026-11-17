import { useEffect } from "react";
import { initLedger, useLedger } from "@/lib/ledger/store";

/** Boots the simulated chain client-side and gates children until ready. */
export function LedgerBoot({ children }: { children: React.ReactNode }) {
  const ready = useLedger((s) => s.ready);
  useEffect(() => { void initLedger(); }, []);
  if (!ready) return <div className="py-24 text-center font-mono text-sm text-muted-foreground">Connecting to chain…</div>;
  return <>{children}</>;
}
