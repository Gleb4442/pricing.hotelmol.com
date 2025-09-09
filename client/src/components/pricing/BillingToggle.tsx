import { BillingMode } from "@/hooks/use-billing-mode";

interface BillingToggleProps {
  billingMode: BillingMode;
  onBillingModeChange: (mode: BillingMode) => void;
}

export function BillingToggle({ billingMode, onBillingModeChange }: BillingToggleProps) {
  return (
    <div className="flex flex-col items-center justify-center mb-12">
      <div className="bg-muted rounded-full p-1 flex items-center mb-3">
        <button
          data-testid="billing-usage-button"
          onClick={() => onBillingModeChange("usage")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 billing-toggle ${
            billingMode === "usage" ? "active" : ""
          }`}
        >
          Оплата за использование
        </button>
        <button
          data-testid="billing-monthly-button"
          onClick={() => onBillingModeChange("monthly")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 billing-toggle ${
            billingMode === "monthly" ? "active" : ""
          }`}
        >
          Ежемесячно
        </button>
        <button
          data-testid="billing-yearly-button"
          onClick={() => onBillingModeChange("yearly")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 billing-toggle ${
            billingMode === "yearly" ? "active" : ""
          }`}
        >
          Ежегодно
        </button>
      </div>
      {billingMode === "yearly" && (
        <div className="text-sm text-green-600 font-medium">
          Экономия до 20% при годовой оплате
        </div>
      )}
    </div>
  );
}
