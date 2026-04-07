/**
 * useBackendStatus — checks if Go backend is reachable.
 * Returns { online, checking } and re-checks every 30s.
 */
import { useState, useEffect } from "react";
import { checkHealth } from "../api/foodApi";

export function useBackendStatus() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      setChecking(true);
      const ok = await checkHealth();
      if (!cancelled) {
        setOnline(ok);
        setChecking(false);
      }
    };

    check();
    const interval = setInterval(check, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { online, checking };
}
