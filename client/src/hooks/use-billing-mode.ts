import { useState, useEffect } from "react";

export type BillingMode = "monthly" | "yearly";

export function useBillingMode() {
  const [billingMode, setBillingMode] = useState<BillingMode>("monthly");

  useEffect(() => {
    // Initialize from localStorage or URL hash
    const saved = localStorage.getItem("billingMode") as BillingMode;
    const hash = window.location.hash.slice(1) as BillingMode;
    const mode = (hash === "monthly" || hash === "yearly") ? hash : (saved === "monthly" || saved === "yearly" ? saved : "monthly");
    setBillingMode(mode);
  }, []);

  const updateBillingMode = (mode: BillingMode) => {
    setBillingMode(mode);
    localStorage.setItem("billingMode", mode);
    window.location.hash = mode;
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) as BillingMode;
      if (hash === "monthly" || hash === "yearly") {
        setBillingMode(hash);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return { billingMode, setBillingMode: updateBillingMode };
}
