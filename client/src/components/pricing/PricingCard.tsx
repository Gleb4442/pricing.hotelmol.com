import { Check, Info, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BillingMode } from "@/hooks/use-billing-mode";
import { Tooltip } from "./TooltipProvider";
import { useState } from "react";

interface PricingFeature {
  text: string;
  tooltip?: string;
  addonPricing?: {
    usage: string;
    monthly: string;
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
    const basePriceText = pricing[billingMode].current;
    let basePrice;
    
    if (billingMode === "usage") {
      // For usage billing: extract number from "7 центов =0.07$" or "30 центов =0.30$"
      const match = basePriceText.match(/(\d+(?:\.\d+)?)\s*центов/);
      basePrice = match ? parseFloat(match[1]) : 0;
    } else {
      // For monthly billing: extract number from "$399" or "$1,499"
      basePrice = parseFloat(basePriceText.replace(/[$,]/g, ''));
    }
    
    let additionalCost = 0;
    features.forEach((feature, index) => {
      if (feature.addonPricing && addedFeatures.has(index)) {
        if (billingMode === "usage") {
          additionalCost += 0.5; // +0.5 центов per request
        } else {
          // For monthly billing, calculate proportional cost
          // Assuming ~10,000 requests per month for estimation
          additionalCost += 50; // $50 monthly equivalent for 0.5 центов per request
        }
      }
    });

    const totalPrice = basePrice + additionalCost;
    
    if (billingMode === "usage") {
      const dollarEquivalent = (totalPrice / 100).toFixed(2);
      return `${totalPrice} центов =${dollarEquivalent}$`;
    } else {
      // Format with commas for thousands
      return `$${Math.round(totalPrice).toLocaleString()}`;
    }
  };

  const currentPricing = {
    ...pricing[billingMode],
    current: calculatePrice()
  };

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
              <span className="text-2xl text-muted-foreground line-through">
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
            {billingMode === "usage" ? "за запрос" : "в месяц"}
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4 mb-8">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-3 relative">
              <Check className="text-primary w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{feature.text}</span>
              {feature.tooltip && (
                <Tooltip content={feature.tooltip}>
                  <Info
                    className="text-muted-foreground w-4 h-4 cursor-help"
                    data-testid={`tooltip-trigger-${index}`}
                  />
                </Tooltip>
              )}
              {feature.addonPricing && (
                <div className="flex items-center space-x-2">
                  <span
                    className="text-primary text-sm font-medium"
                    data-testid={`addon-pricing-${index}`}
                  >
                    {billingMode === "monthly"
                      ? feature.addonPricing.monthly
                      : feature.addonPricing.usage}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleFeature(index)}
                    className={`w-6 h-6 p-0 rounded-full transition-all duration-200 ${
                      addedFeatures.has(index)
                        ? "bg-primary text-white border-primary"
                        : "bg-background text-muted-foreground border-border hover:border-primary"
                    }`}
                    data-testid={`add-feature-${index}`}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              )}
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
          {isPopular ? "Подписаться сейчас" : "Подписаться сейчас"}
        </Button>
      </div>
    </div>
  );
}
