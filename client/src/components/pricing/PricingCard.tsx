import { Check, Info, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BillingMode } from "@/hooks/use-billing-mode";
import { Tooltip } from "./TooltipProvider";
import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { SiTelegram, SiFacebook, SiWhatsapp, SiInstagram } from "react-icons/si";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PricingFeature {
  text: string;
  tooltip?: string;
  addonPricing?: {
    usage: string;
    monthly: string;
    yearly?: string;
  };
  isChannels?: boolean;
}

interface PricingCardProps {
  plan: "basic" | "pro" | "premium";
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
  usageLimits?: string[];
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
  usageLimits,
  billingMode,
  isPopular = false,
  onSubscribe,
}: PricingCardProps) {
  const { t } = useLanguage();
  const [addedFeatures, setAddedFeatures] = useState<Set<number | string>>(new Set());
  
  const toggleFeature = (id: number | string) => {
    const newAddedFeatures = new Set(addedFeatures);
    if (newAddedFeatures.has(id)) {
      newAddedFeatures.delete(id);
    } else {
      newAddedFeatures.add(id);
    }
    setAddedFeatures(newAddedFeatures);
  };

  const calculatePrice = () => {
    const currentPricing = pricing[billingMode];
    if (!currentPricing) return ""; // Fallback if pricing is not available
    const basePriceText = currentPricing.current;
    let basePrice;
    
    if (billingMode === "usage") {
      // For usage billing: extract number from "6 центов =0.06$" or "6 центів =0.06$" or "6 cents =0.06$"
      const match = basePriceText.match(/(\d+(?:\.\d+)?)\s*(?:цент(?:ов|ів|а)?|cents?)/i);
      basePrice = match ? parseFloat(match[1]) : 0;
    } else {
      // For monthly/yearly billing: extract number from "$399" or "$1,499"
      basePrice = parseFloat(basePriceText.replace(/[$,]/g, ''));
    }
    
    let additionalCost = 0;
    features.forEach((feature, index) => {
      if (feature.addonPricing && addedFeatures.has(index)) {
        if (billingMode === "usage") {
          // Extract cost from addonPricing text (e.g., "+1 цент/запрос" or "+0.5 центов/запрос" or "+1 cent/request")
          const usagePricing = feature.addonPricing.usage;
          const costMatch = usagePricing.match(/\+?(\d+(?:\.\d+)?)/);
          const cost = costMatch ? parseFloat(costMatch[1]) : 0;
          additionalCost += cost;
        }
        // For monthly billing, additional features are included for free (no cost)
      }
      if (feature.isChannels && billingMode === "usage") {
        ["usage-tg", "usage-fb", "usage-wa", "usage-ig"].forEach(id => {
          if (addedFeatures.has(`${index}-${id}`)) {
            additionalCost += 1; // 1 cent per channel
          }
        });
      }
    });

    const totalPrice = basePrice + additionalCost;
    
    if (billingMode === "usage") {
      const dollarEquivalent = (totalPrice / 100).toFixed(2);
      // Determine the correct word based on the original text language
      let centWord = 'центов'; // default Russian
      if (basePriceText.includes('центів')) {
        centWord = 'центів'; // Ukrainian
      } else if (basePriceText.match(/cents?/i)) {
        centWord = totalPrice === 1 ? 'cent' : 'cents'; // English (singular/plural)
      }
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
      {isPopular && billingMode !== "usage" && (
        <div className="most-popular-badge" data-testid="most-popular-badge">
          MOST POPULAR
        </div>
      )}

      <div
        className={`bg-card border rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col ${
          isPopular ? "pricing-card-pro" : "border-border"
        }`}
        data-testid={`pricing-card-${plan}`}
      >
        <div className="flex-1 flex flex-col">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <h3 className="text-2xl font-bold text-foreground">{title}</h3>
              {currentPricing.original && (
                <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md" data-testid="network-discount-badge">
                  {t("network_discount_badge")}
                </span>
              )}
            </div>
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

          {/* Usage Limits */}
          {usageLimits && usageLimits.length > 0 && (
            <div className="mb-6 px-2">
              {usageLimits.map((limit, index) => (
                <div key={index} className="text-sm text-muted-foreground mb-1">
                  {limit}
                </div>
              ))}
            </div>
          )}

          {/* Features */}
          <div className="space-y-3 mb-8 px-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-2 relative">
                <Check className="text-primary w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
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

                      {/* Plus/Check Button for non-channel addons in usage mode */}
                      {feature.addonPricing && !feature.isChannels && billingMode === "usage" && (
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleFeature(index)}
                            className={`w-5 h-5 p-0 rounded-full transition-all duration-200 flex-shrink-0 flex items-center justify-center ${
                              addedFeatures.has(index)
                                ? "bg-green-500 text-white border-green-500 shadow-md"
                                : "bg-background text-muted-foreground border-border hover:border-primary"
                            }`}
                            data-testid={`add-feature-${index}`}
                          >
                            {addedFeatures.has(index) ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <Plus className="w-3 h-3" />
                            )}
                          </Button>
                          
                          {feature.tooltip && (
                            <Tooltip content={feature.tooltip}>
                              <Info
                                className="text-muted-foreground w-3 h-3 cursor-help flex-shrink-0"
                                data-testid={`tooltip-trigger-${index}`}
                              />
                            </Tooltip>
                          )}
                        </div>
                      )}
                    </div>
                  {feature.isChannels && (billingMode === "monthly" || billingMode === "yearly") && (
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240.1 240.1" className="w-8 h-8">
                          <linearGradient id="Oval_1_fixed" gradientUnits="userSpaceOnUse" x1="-838.041" y1="660.581" x2="-838.041" y2="660.3427" gradientTransform="matrix(1000 0 0 -1000 838161 660581)">
                            <stop offset="0" style={{stopColor: "#2AABEE"}}/>
                            <stop offset="1" style={{stopColor: "#229ED9"}}/>
                          </linearGradient>
                          <circle fillRule="evenodd" clipRule="evenodd" fill="url(#Oval_1_fixed)" cx="120.1" cy="120.1" r="120.1"/>
                          <path fillRule="evenodd" clipRule="evenodd" fill="#FFFFFF" d="M54.3,118.8c35-15.2,58.3-25.3,70-30.2 c33.3-13.9,40.3-16.3,44.8-16.4c1,0,3.2,0.2,4.7,1.4c1.2,1,1.5,2.3,1.7,3.3s0.4,3.1,0.2,4.7c-1.8,19-9.6,65.1-13.6,86.3 c-1.7,9-5,12-8.2,12.3c-7,0.6-12.3-4.6-19-9c-10.6-6.9-16.5-11.2-26.8-18c-11.9-7.8-4.2-12.1,2.6-19.1c1.8-1.8,32.5-29.8,33.1-32.3 c0.1-0.3,0.1-1.5-0.6-2.1c-0.7-0.6-1.7-0.4-2.5-0.2c-1.1,0.2-17.9,11.4-50.6,33.5c-4.8,3.3-9.1,4.9-13,4.8 c-4.3-0.1-12.5-2.4-18.7-4.4c-7.5-2.4-13.5-3.7-13-7.9C45.7,123.3,48.7,121.1,54.3,118.8z"/>
                        </svg>
                      </div>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <svg viewBox="48.61 50.201 402.77399999999994 402.77399999999994" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                          <linearGradient id="ms_fixed" x1="50%" x2="50%" y1="0%" y2="100.001%">
                            <stop offset="0" stopColor="#00b2ff"/>
                            <stop offset="1" stopColor="#006aff"/>
                          </linearGradient>
                          <g fill="none" fillRule="evenodd">
                            <path d="M250 50.201c-112.676 0-200 82.452-200 193.81 0 58.25 23.903 108.582 62.817 143.356 3.26 2.935 5.231 6.995 5.392 11.377l1.087 35.537c.362 11.337 12.072 18.694 22.455 14.151l39.678-17.487a15.974 15.974 0 0 1 10.664-.804c18.229 5.025 37.666 7.678 57.907 7.678 112.676 0 200-82.452 200-193.809S362.676 50.201 250 50.201z" fill="url(#ms_fixed)"/>
                            <path d="M129.92 300.693l58.752-93.105c9.336-14.794 29.376-18.493 43.38-8l46.72 35.015a12.022 12.022 0 0 0 14.447-.04l63.099-47.84c8.41-6.391 19.437 3.7 13.762 12.624l-58.712 93.065c-9.336 14.794-29.376 18.493-43.38 8l-46.72-35.015a12.022 12.022 0 0 0-14.447.04l-63.139 47.88c-8.41 6.392-19.437-3.699-13.762-12.624z" fill="#ffffff"/>
                          </g>
                        </svg>
                      </div>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 175.216 175.552" className="w-8 h-8">
                          <defs>
                            <linearGradient id="b_fixed" x1="85.915" x2="86.535" y1="32.567" y2="137.092" gradientUnits="userSpaceOnUse">
                              <stop offset="0" stopColor="#57d163"/>
                              <stop offset="1" stopColor="#23b33a"/>
                            </linearGradient>
                          </defs>
                          <path fill="#fff" d="m12.966 161.238 10.439-38.114a73.42 73.42 0 0 1-9.821-36.772c.017-40.556 33.021-73.55 73.578-73.55 19.681.01 38.154 7.669 52.047 21.572s21.537 32.383 21.53 52.037c-.018 40.553-33.027 73.553-73.578 73.553h-.032c-12.313-.005-24.412-3.094-35.159-8.954z"/>
                          <path fill="url(#b_fixed)" d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.313-6.179 22.558 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.517 31.126 8.523h.023c33.707 0 61.14-27.426 61.153-61.135a60.75 60.75 0 0 0-17.895-43.251 60.75 60.75 0 0 0-43.235-17.928z"/>
                          <path fill="#fff" fillRule="evenodd" d="M68.772 55.603c-1.378-3.061-2.828-3.123-4.137-3.176l-3.524-.043c-1.309-.016-3.441.31-5.241 2.269-1.8 1.959-6.864 6.708-6.864 16.353s7.016 18.988 8.003 20.306c.987 1.318 13.524 21.169 33.242 29.155 19.718 7.986 19.718 5.324 23.243 5.016s11.375-4.653 12.984-9.157 1.609-8.35.34-11.413c-1.269-3.061-4.706-4.887-9.872-7.472-5.166-2.585-3.061-3.864-2.235-5.166 1.318-1.959 5.86-7.398 7.238-9.387 1.378-1.989 2.508-3.324 2.508-6.023s-1.378-5.324-2.828-6.864c-1.45-1.54-13.313-13.844-18.257-14.868z"/>
                        </svg>
                      </div>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 264.5833 264.5833" className="w-8 h-8">
                          <defs>
                            <radialGradient id="ig_f_fixed" cx="158.429" cy="578.088" r="52.3515" gradientUnits="userSpaceOnUse" gradientTransform="matrix(0 -4.03418 4.28018 0 -2332.2273 942.2356)">
                              <stop offset="0" stopColor="#fc0"/><stop offset=".1242" stopColor="#fc0"/><stop offset=".5672" stopColor="#fe4a05"/><stop offset=".6942" stopColor="#ff0f3f"/><stop offset="1" stopColor="#fe0657" stopOpacity="0"/>
                            </radialGradient>
                          </defs>
                          <circle cx="132.29" cy="132.29" r="132.29" fill="url(#ig_f_fixed)"/>
                          <path d="M132.29 70c-16.97 0-19.09.07-25.75.37-6.65.3-11.19 1.36-15.17 2.91a30.65 30.65 0 0 0-11.09 7.22 30.65 30.65 0 0 0-7.22 11.09c-1.55 3.98-2.61 8.52-2.91 15.17-.3 6.66-.37 8.78-.37 25.75s.07 19.09.37 25.75c.3 6.65 1.36 11.19 2.91 15.17a30.65 30.65 0 0 0 7.22 11.09 30.65 30.65 0 0 0 11.09 7.22c3.98 1.55 8.52 2.61 15.17 2.91 6.66.3 8.78.37 25.75.37s19.09-.07 25.75-.37c6.65-.3 11.19-1.36 15.17-2.91a30.65 30.65 0 0 0 11.09-7.22 30.65 30.65 0 0 0 7.22-11.09c1.55-3.98 2.61-8.52 2.91-15.17.3-6.66.37-8.78.37-25.75s-.07-19.09-.37-25.75c-.3-6.65-1.36-11.19-2.91-15.17a30.65 30.65 0 0 0-7.22-11.09 30.65 30.65 0 0 0-11.09-7.22c-3.98-1.55-8.52-2.61-15.17-2.91-6.66-.3-8.78-.37-25.75-.37zm0 11.23c16.69 0 18.67.06 25.26.36 6.1.28 9.42 1.3 11.62 2.16a19.42 19.42 0 0 1 7.2 4.68 19.42 19.42 0 0 1 4.68 7.2c.86 2.2 1.88 5.52 2.16 11.62.3 6.59.36 8.57.36 25.26s-.06 18.67-.36 25.26c-.28 6.1-1.3 9.42-2.16 11.62a19.42 19.42 0 0 1-4.68 7.2 19.42 19.42 0 0 1-7.2 4.68c-2.2.86-5.52 1.88-11.62 2.16-6.59.3-8.57.36-25.26.36s-18.67-.06-25.26-.36c-6.1-.28-9.42-1.3-11.62-2.16a19.42 19.42 0 0 1-7.2-4.68 19.42 19.42 0 0 1-4.68-7.2c-.86-2.2-1.88-5.52-2.16-11.62-.3-6.59-.36-8.57-.36-25.26s.06-18.67.36-25.26c.28-6.1 1.3-9.42 2.16-11.62a19.42 19.42 0 0 1 4.68-7.2 19.42 19.42 0 0 1 7.2-4.68c2.2-.86 5.52-1.88 11.62-2.16 6.59-.3 8.57-.36 25.26-.36zM132.29 100.27a32.02 32.02 0 1 0 0 64.04 32.02 32.02 0 0 0 0-64.04zm0 52.81a20.79 20.79 0 1 1 0-41.58 20.79 20.79 0 0 1 0 41.58zm33.36-50.64a7.49 7.49 0 1 1-14.98 0 7.49 7.49 0 0 1 14.98 0z" fill="#FFF"/>
                        </svg>
                      </div>
                    </div>
                  )}
                  {feature.isChannels && billingMode === "usage" && (
                    <div className="flex items-center space-x-2 mt-2">
                      {[
                        { 
                          icon: () => (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240.1 240.1" className="w-8 h-8">
                              <linearGradient id="Oval_1_" gradientUnits="userSpaceOnUse" x1="-838.041" y1="660.581" x2="-838.041" y2="660.3427" gradientTransform="matrix(1000 0 0 -1000 838161 660581)">
                                <stop offset="0" style={{stopColor: "#2AABEE"}}/>
                                <stop offset="1" style={{stopColor: "#229ED9"}}/>
                              </linearGradient>
                              <circle fillRule="evenodd" clipRule="evenodd" fill="url(#Oval_1_)" cx="120.1" cy="120.1" r="120.1"/>
                              <path fillRule="evenodd" clipRule="evenodd" fill="#FFFFFF" d="M54.3,118.8c35-15.2,58.3-25.3,70-30.2 c33.3-13.9,40.3-16.3,44.8-16.4c1,0,3.2,0.2,4.7,1.4c1.2,1,1.5,2.3,1.7,3.3s0.4,3.1,0.2,4.7c-1.8,19-9.6,65.1-13.6,86.3 c-1.7,9-5,12-8.2,12.3c-7,0.6-12.3-4.6-19-9c-10.6-6.9-16.5-11.2-26.8-18c-11.9-7.8-4.2-12.1,2.6-19.1c1.8-1.8,32.5-29.8,33.1-32.3 c0.1-0.3,0.1-1.5-0.6-2.1c-0.7-0.6-1.7-0.4-2.5-0.2c-1.1,0.2-17.9,11.4-50.6,33.5c-4.8,3.3-9.1,4.9-13,4.8 c-4.3-0.1-12.5-2.4-18.7-4.4c-7.5-2.4-13.5-3.7-13-7.9C45.7,123.3,48.7,121.1,54.3,118.8z"/>
                            </svg>
                          ), 
                          color: "transparent", 
                          id: "usage-tg" 
                        },
                        { 
                          icon: () => (
                            <svg viewBox="48.61 50.201 402.77399999999994 402.77399999999994" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                              <linearGradient id="ms_usage" x1="50%" x2="50%" y1="0%" y2="100.001%">
                                <stop offset="0" stopColor="#00b2ff"/>
                                <stop offset="1" stopColor="#006aff"/>
                              </linearGradient>
                              <g fill="none" fillRule="evenodd">
                                <path d="M250 50.201c-112.676 0-200 82.452-200 193.81 0 58.25 23.903 108.582 62.817 143.356 3.26 2.935 5.231 6.995 5.392 11.377l1.087 35.537c.362 11.337 12.072 18.694 22.455 14.151l39.678-17.487a15.974 15.974 0 0 1 10.664-.804c18.229 5.025 37.666 7.678 57.907 7.678 112.676 0 200-82.452 200-193.809S362.676 50.201 250 50.201z" fill="url(#ms_usage)"/>
                                <path d="M129.92 300.693l58.752-93.105c9.336-14.794 29.376-18.493 43.38-8l46.72 35.015a12.022 12.022 0 0 0 14.447-.04l63.099-47.84c8.41-6.391 19.437 3.7 13.762 12.624l-58.712 93.065c-9.336 14.794-29.376 18.493-43.38 8l-46.72-35.015a12.022 12.022 0 0 0-14.447.04l-63.139 47.88c-8.41 6.392-19.437-3.699-13.762-12.624z" fill="#ffffff"/>
                              </g>
                            </svg>
                          ), 
                          color: "transparent", 
                          id: "usage-fb" 
                        },
                        { 
                          icon: () => (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 175.216 175.552" className="w-8 h-8">
                              <defs>
                                <linearGradient id="b_usage" x1="85.915" x2="86.535" y1="32.567" y2="137.092" gradientUnits="userSpaceOnUse">
                                  <stop offset="0" stopColor="#57d163"/>
                                  <stop offset="1" stopColor="#23b33a"/>
                                </linearGradient>
                              </defs>
                              <path fill="#fff" d="m12.966 161.238 10.439-38.114a73.42 73.42 0 0 1-9.821-36.772c.017-40.556 33.021-73.55 73.578-73.55 19.681.01 38.154 7.669 52.047 21.572s21.537 32.383 21.53 52.037c-.018 40.553-33.027 73.553-73.578 73.553h-.032c-12.313-.005-24.412-3.094-35.159-8.954z"/>
                              <path fill="url(#b_usage)" d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.313-6.179 22.558 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.517 31.126 8.523h.023c33.707 0 61.14-27.426 61.153-61.135a60.75 60.75 0 0 0-17.895-43.251 60.75 60.75 0 0 0-43.235-17.928z"/>
                              <path fill="#fff" fillRule="evenodd" d="M68.772 55.603c-1.378-3.061-2.828-3.123-4.137-3.176l-3.524-.043c-1.309-.016-3.441.31-5.241 2.269-1.8 1.959-6.864 6.708-6.864 16.353s7.016 18.988 8.003 20.306c.987 1.318 13.524 21.169 33.242 29.155 19.718 7.986 19.718 5.324 23.243 5.016s11.375-4.653 12.984-9.157 1.609-8.35.34-11.413c-1.269-3.061-4.706-4.887-9.872-7.472-5.166-2.585-3.061-3.864-2.235-5.166 1.318-1.959 5.86-7.398 7.238-9.387 1.378-1.989 2.508-3.324 2.508-6.023s-1.378-5.324-2.828-6.864c-1.45-1.54-13.313-13.844-18.257-14.868z"/>
                            </svg>
                          ),
                          color: "transparent", 
                          id: "usage-wa" 
                        },
                        { 
                          icon: () => (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 264.5833 264.5833" className="w-8 h-8">
                              <defs>
                                <radialGradient id="ig_f_usage" cx="158.429" cy="578.088" r="52.3515" gradientUnits="userSpaceOnUse" gradientTransform="matrix(0 -4.03418 4.28018 0 -2332.2273 942.2356)">
                                  <stop offset="0" stopColor="#fc0"/><stop offset=".1242" stopColor="#fc0"/><stop offset=".5672" stopColor="#fe4a05"/><stop offset=".6942" stopColor="#ff0f3f"/><stop offset="1" stopColor="#fe0657" stopOpacity="0"/>
                                </radialGradient>
                              </defs>
                              <circle cx="132.29" cy="132.29" r="132.29" fill="url(#ig_f_usage)"/>
                              <path d="M132.29 70c-16.97 0-19.09.07-25.75.37-6.65.3-11.19 1.36-15.17 2.91a30.65 30.65 0 0 0-11.09 7.22 30.65 30.65 0 0 0-7.22 11.09c-1.55 3.98-2.61 8.52-2.91 15.17-.3 6.66-.37 8.78-.37 25.75s.07 19.09.37 25.75c.3 6.65 1.36 11.19 2.91 15.17a30.65 30.65 0 0 0 7.22 11.09 30.65 30.65 0 0 0 11.09 7.22c3.98 1.55 8.52 2.61 15.17 2.91 6.66.3 8.78.37 25.75.37s19.09-.07 25.75-.37c6.65-.3 11.19-1.36 15.17-2.91a30.65 30.65 0 0 0 11.09-7.22 30.65 30.65 0 0 0 7.22-11.09c1.55-3.98 2.61-8.52 2.91-15.17.3-6.66.37-8.78.37-25.75s-.07-19.09-.37-25.75c-.3-6.65-1.36-11.19-2.91-15.17a30.65 30.65 0 0 0-7.22-11.09 30.65 30.65 0 0 0-11.09-7.22c-3.98-1.55-8.52-2.61-15.17-2.91-6.66-.3-8.78-.37-25.75-.37zm0 11.23c16.69 0 18.67.06 25.26.36 6.1.28 9.42 1.3 11.62 2.16a19.42 19.42 0 0 1 7.2 4.68 19.42 19.42 0 0 1 4.68 7.2c.86 2.2 1.88 5.52 2.16 11.62.3 6.59.36 8.57.36 25.26s-.06 18.67-.36 25.26c-.28 6.1-1.3 9.42-2.16 11.62a19.42 19.42 0 0 1-4.68 7.2 19.42 19.42 0 0 1-7.2 4.68c-2.2.86-5.52 1.88-11.62 2.16-6.59.3-8.57.36-25.26.36s-18.67-.06-25.26-.36c-6.1-.28-9.42-1.3-11.62-2.16a19.42 19.42 0 0 1-7.2-4.68 19.42 19.42 0 0 1-4.68-7.2c-.86-2.2-1.88-5.52-2.16-11.62-.3-6.59-.36-8.57-.36-25.26s.06-18.67.36-25.26c.28-6.1 1.3-9.42 2.16-11.62a19.42 19.42 0 0 1 4.68-7.2 19.42 19.42 0 0 1 7.2-4.68c2.2-.86 5.52-1.88 11.62-2.16 6.59-.3 8.57-.36 25.26-.36zM132.29 100.27a32.02 32.02 0 1 0 0 64.04 32.02 32.02 0 0 0 0-64.04zm0 52.81a20.79 20.79 0 1 1 0-41.58 20.79 20.79 0 0 1 0 41.58zm33.36-50.64a7.49 7.49 0 1 1-14.98 0 7.49 7.49 0 0 1 14.98 0z" fill="#FFF"/>
                            </svg>
                          ),
                          color: "transparent", 
                          id: "usage-ig" 
                        }
                      ].map((channel) => (
                        <div key={channel.id} className="relative group">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity overflow-hidden"
                            style={{ backgroundColor: channel.color }}
                          >
                            {typeof channel.icon === 'function' ? (
                              (channel.icon as any)()
                            ) : (
                              <div className="w-4 h-4 text-white">
                                {(() => {
                                  const Icon = channel.icon as any;
                                  return <Icon className="w-full h-full" />;
                                })()}
                              </div>
                            )}
                          </div>
                          {/* Desktop Plus/Check Button */}
                          <div className="hidden md:block absolute -bottom-1 -right-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleFeature(`${index}-${channel.id}`)}
                              className={`w-4 h-4 p-0 rounded-full border-none transition-all duration-200 flex items-center justify-center ${
                                addedFeatures.has(`${index}-${channel.id}`)
                                  ? "bg-green-500 text-white shadow-md"
                                  : "bg-gray-200/50 hover:bg-gray-300/80 text-gray-500"
                              }`}
                            >
                              {addedFeatures.has(`${index}-${channel.id}`) ? (
                                <Check className="w-2.5 h-2.5" />
                              ) : (
                                <Plus className="w-2.5 h-2.5" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                      {/* Cost Tooltip */}
                      <Tooltip content={t("tooltip_channel_cost")}>
                        <Info className="text-muted-foreground w-3 h-3 cursor-help flex-shrink-0" />
                      </Tooltip>
                    </div>
                  )}
                  {feature.addonPricing && !feature.isChannels && (
                    <div className="flex items-center space-x-2 mt-1">
                      {billingMode === "yearly" || billingMode === "monthly" ? (
                        feature.addonPricing.monthly && (
                          <span
                            className="text-green-600 text-xs font-medium bg-green-50 px-2 py-0.5 rounded-md"
                            data-testid={`addon-included-${index}`}
                          >
                            {t('included')}
                          </span>
                        )
                      ) : (
                        <div className="flex items-center space-x-2 ml-auto">
                          {feature.addonPricing.usage && !feature.text.toLowerCase().includes(t('feature_remove_logo').toLowerCase()) && (
                            <span
                              className="text-primary text-xs font-medium"
                              data-testid={`addon-pricing-${index}`}
                            >
                              {feature.addonPricing.usage}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={onSubscribe}
          className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${
            isPopular
              ? "bg-[#306BA1] text-white hover:bg-[#254d7a] shadow-2xl py-6 text-lg font-bold hover:shadow-[#306BA1]/25 hover:shadow-2xl"
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
