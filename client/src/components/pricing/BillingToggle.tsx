import { BillingMode } from "@/hooks/use-billing-mode";

interface BillingToggleProps {
  billingMode: BillingMode;
  onBillingModeChange: (mode: BillingMode) => void;
}

export function BillingToggle({ billingMode, onBillingModeChange }: BillingToggleProps) {
  return (
    <div className="flex flex-col items-center justify-center mb-12 space-y-3">
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
          Ежемесячно
        </button>
      </div>
      
      <button
        data-testid="billing-yearly-button"
        onClick={() => onBillingModeChange("yearly")}
        className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
          billingMode === "yearly" 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted text-muted-foreground hover:bg-muted/80"
        }`}
      >
        Ежегодно
      </button>
      
      {billingMode === "yearly" && (
        <div className="text-sm text-green-600 font-medium">
          Экономия до 20% при годовой оплате
        </div>
      )}
    </div>
  );
}
