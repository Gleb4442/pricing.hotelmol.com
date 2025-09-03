import { BillingMode } from "@/hooks/use-billing-mode";

interface BillingToggleProps {
  billingMode: BillingMode;
  onBillingModeChange: (mode: BillingMode) => void;
}

export function BillingToggle({ billingMode, onBillingModeChange }: BillingToggleProps) {
  return (
    <div className="flex items-center justify-center mb-12">
      <div className="bg-muted rounded-full p-1 flex items-center">
        <button
          data-testid="billing-usage-button"
          onClick={() => onBillingModeChange("usage")}
          className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 billing-toggle ${
            billingMode === "usage" ? "active" : ""
          }`}
        >
          Оплата за использование
        </button>
        <button
          data-testid="billing-monthly-button"
          onClick={() => onBillingModeChange("monthly")}
          className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 billing-toggle ${
            billingMode === "monthly" ? "active" : ""
          }`}
        >
          Фиксированная помесячно
        </button>
      </div>
    </div>
  );
}
