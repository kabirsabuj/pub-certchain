import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

/** Camera QR scanner. Extracts the certificate ID from the verification URL printed on the certificate. */
export function QrScanner({ onDetected }: { onDetected: (certId: string) => void }) {
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<{ stop: () => Promise<void> } | null>(null);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    void (async () => {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (cancelled) return;
      const scanner = new Html5Qrcode("qr-reader");
      ref.current = scanner;
      try {
        await scanner.start({ facingMode: "environment" }, { fps: 10, qrbox: 220 }, (text) => {
          let id = text;
          try { id = new URL(text).searchParams.get("id") ?? text; } catch { /* raw id */ }
          void scanner.stop().finally(() => setActive(false));
          onDetected(id);
        }, () => {});
      } catch {
        setError("Camera unavailable. Allow camera access or verify by ID instead.");
        setActive(false);
      }
    })();
    return () => { cancelled = true; void ref.current?.stop().catch(() => {}); };
  }, [active, onDetected]);

  return (
    <div className="space-y-3">
      <div id="qr-reader" className="mx-auto w-full max-w-sm overflow-hidden rounded-sm bg-muted" />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button variant={active ? "outline" : "default"} onClick={() => { setError(null); setActive((a) => !a); }}>
        {active ? "Stop camera" : "Start camera"}
      </Button>
    </div>
  );
}
