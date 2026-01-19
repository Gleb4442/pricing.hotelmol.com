import { Check, Info, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BillingMode } from "@/hooks/use-billing-mode";
import { Tooltip } from "./TooltipProvider";
import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/use-language";
import { SiTelegram, SiMessenger, SiWhatsapp, SiInstagram, SiViber } from "react-icons/si";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

const BrandIcons = {
  Telegram: () => (
    <div className="w-full h-full bg-[#2AABEE] rounded-full flex items-center justify-center text-white">
      <SiTelegram className="w-1/2 h-1/2" />
    </div>
  ),
  Messenger: () => (
    <div className="w-full h-full bg-[#0084FF] rounded-full flex items-center justify-center text-white">
      <SiMessenger className="w-1/2 h-1/2" />
    </div>
  ),
  Instagram: () => (
    <div className="w-full h-full bg-gradient-to-tr from-[#fdf497] via-[#fd5949] to-[#d6249f] rounded-xl flex items-center justify-center text-white">
      <SiInstagram className="w-1/2 h-1/2" />
    </div>
  ),
  WhatsApp: () => (
    <div className="w-full h-full bg-[#25D366] rounded-full flex items-center justify-center text-white">
      <SiWhatsapp className="w-1/2 h-1/2" />
    </div>
  ),
  Viber: () => (
    <div className="w-full h-full bg-[#7360f2] rounded-full flex items-center justify-center text-white">
      <SiViber className="w-1/2 h-1/2" />
    </div>
  )
};

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

        className={`bg-card border rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col ${isPopular ? "pricing-card-pro" : "border-border"
          }`}
        data-testid={`pricing-card-${plan}`}
      >
        <div className="flex-1 flex flex-col">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
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
            <div className="flex items-center justify-center space-x-2 mb-2 flex-wrap">
              {currentPricing.original && (
                <span className="text-sm text-muted-foreground/60 line-through opacity-75">
                  {currentPricing.original}
                </span>
              )}
              <span
                className={`text-4xl font-bold ${isPopular ? "text-primary" : "text-foreground"
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

          {/* First Month Free Promo */}
          {/* First Month Free Promo */}
          {plan !== "premium" && billingMode !== "usage" && (
            <div className="flex flex-col gap-3 mb-6 mx-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="relative overflow-hidden rounded-xl border-2 border-[#306BA1]/20 bg-gradient-to-br from-[#306BA1]/5 to-transparent p-4"
                >
                  <motion.div
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0 opacity-10 bg-gradient-to-r from-transparent via-[#306BA1] to-transparent bg-[length:200%_100%]"
                  />
                  <div className="relative flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3
                      }}
                      className="text-2xl filter drop-shadow-sm"
                    >
                      🎁
                    </motion.div>
                    <div className="flex-1 text-left">
                      <h4 className="font-bold text-[#306BA1] text-sm leading-tight uppercase tracking-wide">
                        {t('first_month_free_title')}
                      </h4>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Voice Agent Promo for Pro Plan (Monthly/Yearly) */}
              {plan === "pro" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                  className="relative overflow-hidden rounded-xl border border-[#306BA1]/20 bg-gradient-to-r from-[#306BA1]/10 to-cyan-500/10 p-3"
                >
                  {/* Pulse Animation Background */}
                  <motion.div
                    className="absolute inset-0 bg-[#306BA1]/5"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />

                  <div className="relative flex items-center gap-3">
                    <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-b from-slate-900 to-[#306BA1]/40 shadow-lg ring-1 ring-white/20 overflow-hidden">
                      {/* Talking State Animation */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-t from-[#306BA1]/40 via-cyan-400/20 to-transparent rounded-full"
                        animate={{ opacity: [0.3, 0.7, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      />
                      {/* Ripple Effect */}
                      <motion.div
                        className="absolute w-full h-full rounded-full border border-cyan-400/30"
                        animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                      />
                      {/* Core Speaking Orb */}
                      <motion.div
                        className="w-4 h-4 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                        animate={{
                          scale: [1, 1.2, 0.9, 1.1, 1],
                          opacity: [0.9, 1, 0.9],
                          boxShadow: [
                            "0 0 10px rgba(255,255,255,0.5)",
                            "0 0 25px rgba(255,255,255,0.9)",
                            "0 0 10px rgba(255,255,255,0.5)"
                          ]
                        }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          times: [0, 0.25, 0.5, 0.75, 1]
                        }}
                      />
                    </div>

                    <div className="flex-1">
                      <h4 className="font-bold text-[#306BA1] dark:text-cyan-300 text-sm leading-tight">
                        {t('voice_agent_available')}
                      </h4>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Usage Limits */}
          {usageLimits && usageLimits.length > 0 && (
            <div className="mb-6 px-2">
              {usageLimits.map((limit, index) => (
                <div key={index} className={`text-sm text-muted-foreground ${limit.trim() === "" ? "h-[20px]" : "mb-1"}`}>
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
                          className={`w-5 h-5 p-0 rounded-full transition-all duration-200 flex-shrink-0 flex items-center justify-center ${addedFeatures.has(index)
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


                      </div>
                    )}
                  </div>
                  {feature.isChannels && (billingMode === "monthly" || billingMode === "yearly") && (
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <BrandIcons.Telegram />
                      </div>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <BrandIcons.Messenger />
                      </div>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <BrandIcons.WhatsApp />
                      </div>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <BrandIcons.Instagram />
                      </div>
                    </div>
                  )}
                  {feature.isChannels && billingMode === "usage" && (
                    <div className="flex items-center space-x-2 mt-2">
                      {[
                        {
                          icon: BrandIcons.Telegram,
                          id: "usage-tg"
                        },
                        {
                          icon: BrandIcons.Messenger,
                          id: "usage-fb"
                        },
                        {
                          icon: BrandIcons.WhatsApp,
                          id: "usage-wa"
                        },
                        {
                          icon: BrandIcons.Instagram,
                          id: "usage-ig"
                        }
                      ].map((channel) => (
                        <div key={channel.id} className="relative group">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity overflow-hidden"
                          >
                            <channel.icon />
                          </div>
                          {/* Desktop Plus/Check Button */}
                          <div className="hidden md:block absolute -bottom-1 -right-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleFeature(`${index}-${channel.id}`)}
                              className={`w-4 h-4 p-0 rounded-full border-none transition-all duration-200 flex items-center justify-center ${addedFeatures.has(`${index}-${channel.id}`)
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
          className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${isPopular
            ? "bg-[#306BA1] text-white hover:bg-[#254d7a] shadow-2xl py-6 text-lg font-bold hover:shadow-[#306BA1]/25 hover:shadow-2xl"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border"
            }`}
          data-testid={`subscribe-button-${plan}`}
        >
          {t('subscribe_now')}
        </Button>
      </div>
    </div >
  );
}
