import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

const NAV = [
  { to: "/", label: "Verify" },
  { to: "/issuer", label: "Registrar" },
  { to: "/controller", label: "Controller" },
  { to: "/student", label: "Student" },
  { to: "/audit", label: "Audit trail" },
] as const;

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-card/70 shadow-[0_1px_12px_-6px_oklch(0.36_0.07_165/0.25)] backdrop-blur">
      <div className="h-0.5 w-full bg-gradient-to-r from-primary via-accent to-primary" />
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-sm bg-primary text-primary-foreground"><ShieldCheck className="h-5 w-5" /></span>
          <span className="leading-tight">
            <span className="block font-display text-lg font-semibold">PUB CertChain</span>
            <span className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Premier University · Sepolia testnet</span>
          </span>
        </Link>
        <nav className="flex flex-wrap gap-1">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/", includeSearch: false }}
              className="rounded-sm px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground data-[status=active]:bg-primary data-[status=active]:text-primary-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
