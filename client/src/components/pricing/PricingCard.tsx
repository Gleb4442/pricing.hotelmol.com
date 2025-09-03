import { Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BillingMode } from "@/hooks/use-billing-mode";
import { Tooltip } from "./TooltipProvider";

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
  const currentPricing = pricing[billingMode];

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
            {billingMode === "usage" ? "per request" : "per month"}
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4 mb-8">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-3 relative group">
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
                <span
                  className="text-primary text-sm font-medium"
                  data-testid={`addon-pricing-${index}`}
                >
                  {billingMode === "monthly"
                    ? feature.addonPricing.monthly
                    : feature.addonPricing.usage}
                </span>
              )}
            </div>
          ))}
        </div>

        <Button
          onClick={onSubscribe}
          className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${
            isPopular
              ? "bg-gradient-to-r from-primary to-accent text-white hover:from-primary/90 hover:to-accent/90 shadow-2xl py-6 text-lg font-bold"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border"
          }`}
          data-testid={`subscribe-button-${plan}`}
        >
          {isPopular ? "Подписаться сейчас" : "Subscribe Now"}
        </Button>
      </div>
    </div>
  );
}
