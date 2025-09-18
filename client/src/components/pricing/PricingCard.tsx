import { Check, Info, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BillingMode } from "@/hooks/use-billing-mode";
import { Tooltip } from "./TooltipProvider";
import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";

interface PricingFeature {
  text: string;
  tooltip?: string;
  addonPricing?: {
    usage: string;
    monthly: string;
    yearly?: string;
  };
}

interface PricingCardProps {
  plan: "pro" | "premium";
  title: string;
  description: string;
  pricing: {
    usage: {
      current: string;
      original?: string;
    };
    monthly: {
      current: string;
      original?: string;
    };
    yearly?: {
      current: string;
      original?: string;
    };
  };
  features: PricingFeature[];
  billingMode: BillingMode;
  isPopular?: boolean;
  onSubscribe: () => void;
}

export function PricingCard({
  plan,
  title,
  description,
  pricing,
  features,
  billingMode,
  isPopular = false,
  onSubscribe,
}: PricingCardProps) {
  const { t } = useLanguage();
  const [addedFeatures, setAddedFeatures] = useState<Set<number>>(new Set());
  
  const toggleFeature = (index: number) => {
    const newAddedFeatures = new Set(addedFeatures);
    if (newAddedFeatures.has(index)) {
      newAddedFeatures.delete(index);
    } else {
      newAddedFeatures.add(index);
    }
    setAddedFeatures(newAddedFeatures);
  };

  const calculatePrice = () => {
    const currentPricing = pricing[billingMode];
    if (!currentPricing) return ""; // Fallback if pricing is not available
    const basePriceText = currentPricing.current;
    let basePrice;
    
    if (billingMode === "usage") {
      // For usage billing: extract number from "7 центов =0.07$" or "7 центів =0.07$"
      const match = basePriceText.match(/(\d+(?:\.\d+)?)\s*цент(?:ов|ів)/);
      basePrice = match ? parseFloat(match[1]) : 0;
    } else {
      // For monthly/yearly billing: extract number from "$399" or "$1,499"
      basePrice = parseFloat(basePriceText.replace(/[$,]/g, ''));
    }
    
    let additionalCost = 0;
    features.forEach((feature, index) => {
      if (feature.addonPricing && addedFeatures.has(index)) {
        if (billingMode === "usage") {
          additionalCost += 0.5; // +0.5 центов per request
        }
        // For monthly billing, additional features are included for free (no cost)
      }
    });

    const totalPrice = basePrice + additionalCost;
    
    if (billingMode === "usage") {
      const dollarEquivalent = (totalPrice / 100).toFixed(2);
      // Use the correct word based on the original text language
      const centWord = basePriceText.includes('центів') ? 'центів' : 'центов';
      return `${totalPrice} ${centWord} =${dollarEquivalent}$`;
    } else {
      // Format with commas for thousands
      return `$${Math.round(totalPrice).toLocaleString()}`;
    }
  };

  const pricingData = pricing[billingMode];
  const currentPricing = pricingData ? {
    ...pricingData,
    current: calculatePrice()
  } : { current: calculatePrice() };

  return (
    <div className="relative pt-6">
      {/* Most Popular Badge */}
      {isPopular && (
        <div className="most-popular-badge" data-testid="most-popular-badge">
          MOST POPULAR
        </div>
      )}

      {/* Crown Icon */}
      {isPopular && (
        <div className="crown-icon" data-testid="crown-icon">
          <span className="text-accent-foreground text-lg">👑</span>
        </div>
      )}

      <div
        className={`bg-card border rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 h-full ${
          isPopular ? "pricing-card-pro" : "border-border"
        }`}
        data-testid={`pricing-card-${plan}`}
      >
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-foreground mb-2">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>

        {/* Pricing Display */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-2">
            {currentPricing.original && (
              <span className="text-sm text-muted-foreground/60 line-through opacity-75">
                {currentPricing.original}
              </span>
            )}
            <span
              className={`text-4xl font-bold ${
                isPopular ? "text-primary" : "text-foreground"
              }`}
              data-testid={`${plan}-price-${billingMode}`}
            >
              {currentPricing.current}
            </span>
          </div>
          <p className="text-muted-foreground">
            {billingMode === "usage" ? t('per_request') : billingMode === "monthly" ? t('per_month') : t('per_month_yearly')}
          </p>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-8 px-2">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start space-x-2 relative">
              <Check className="text-primary w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1 flex-wrap">
                  <span className="text-sm leading-tight">{feature.text}</span>
                  {feature.tooltip && (
                    <Tooltip content={feature.tooltip}>
                      <Info
                        className="text-muted-foreground w-3 h-3 cursor-help flex-shrink-0"
                        data-testid={`tooltip-trigger-${index}`}
                      />
                    </Tooltip>
                  )}
                </div>
                {feature.addonPricing && (
                  <div className="flex items-center space-x-1 mt-1">
                    {billingMode === "yearly" || billingMode === "monthly" ? (
                      <span
                        className="text-green-600 text-xs font-medium bg-green-50 px-2 py-0.5 rounded-md"
                        data-testid={`addon-included-${index}`}
                      >
                        {t('included')}
                      </span>
                    ) : (
                      <>
                        <span
                          className="text-primary text-xs font-medium"
                          data-testid={`addon-pricing-${index}`}
                        >
                          {feature.addonPricing.usage}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleFeature(index)}
                          className={`w-4 h-4 p-0 rounded-full transition-all duration-200 flex-shrink-0 ${
                            addedFeatures.has(index)
                              ? "bg-primary text-white border-primary"
                              : "bg-background text-muted-foreground border-border hover:border-primary"
                          }`}
                          data-testid={`add-feature-${index}`}
                        >
                          <Plus className="w-2 h-2" />
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={onSubscribe}
          className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${
            isPopular
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-2xl py-6 text-lg font-bold hover:shadow-blue-500/25 hover:shadow-2xl"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border"
          }`}
          data-testid={`subscribe-button-${plan}`}
        >
          {t('subscribe_now')}
        </Button>
      </div>
    </div>
  );
}
