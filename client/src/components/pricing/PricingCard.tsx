import { Check, Info, Plus, Calendar } from "lucide-react";
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
  plan: "basic" | "pro" | "misterio" | "premium" | "enterprise";
  title: string;
  description: string;
  pricing: {

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
  highlight?: "popular" | "best-value";
  discountBadgeText?: string;
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
  highlight,
  discountBadgeText,
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
    if (!currentPricing) return "";
    const basePriceText = currentPricing.current;

    // For monthly/yearly billing: extract number from "$399" or "$1,499"
    const basePrice = parseFloat(basePriceText.replace(/[$,]/g, ''));

    // For monthly/yearly billing, additional features are included for free (no cost)
    const totalPrice = basePrice;

    // Format with commas for thousands
    return `$${Math.round(totalPrice).toLocaleString()}`;
  };

  const pricingData = pricing[billingMode];
  const currentPricing = pricingData ? {
    ...pricingData,
    current: calculatePrice()
  } : { current: calculatePrice() };

  return (
    <div
      className={`group relative h-full flex flex-col border-4 rounded-[2.5rem] transition-all duration-300 shadow-xl hover:shadow-2xl ${highlight === "popular"
        ? "border-[#BEF264] bg-[#0A1A0A]"
        : highlight === "best-value"
          ? "border-[#FFD700] bg-card"
          : "border-border bg-card"
        }`}
      data-testid={`pricing-card-${plan}`}
    >
      {/* Integrated Header for Highlighted Plans */}
      {highlight && (
        <div
          className={`absolute -top-9 left-1/2 -translate-x-1/2 z-20 py-1.5 px-6 flex items-center gap-3 rounded-t-2xl rounded-b-none shadow-sm whitespace-nowrap border-x-4 border-t-4 border-b-0 ${highlight === "popular"
            ? "bg-[#BEF264] border-[#BEF264] text-slate-900"
            : "bg-[#FFD700] border-[#FFD700] text-[#8B7500]"
            }`}
        >
          <div className="flex items-center gap-2">
            {highlight === "popular" && <div className="w-2 h-2 rounded-full bg-slate-900 animate-pulse" />}
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.15em]">
              {highlight === "popular" ? t("label_most_popular") : t("label_best_value")}
            </span>
          </div>
          {highlight === "popular" && (
            <div className="bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full border border-black/10 shadow-sm flex items-center">
              <span className="text-[8px] font-black text-slate-800 uppercase tracking-tight">AI Powered</span>
            </div>
          )}
        </div>
      )}

      <div className={`p-6 sm:p-8 flex-1 flex flex-col ${highlight === "popular" ? "text-white" : ""}`}>
        <div className="flex-1 flex flex-col">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
              <h3 className="text-2xl font-bold text-foreground">{title}</h3>
              {currentPricing.original && discountBadgeText && (
                <span className="bg-green-500 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-sm" data-testid="network-discount-badge">
                  {discountBadgeText}
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
                className={`text-4xl font-bold ${highlight === "popular" ? "text-primary" : "text-foreground"
                  }`}
                data-testid={`${plan}-price-${billingMode}`}
              >
                {currentPricing.current}
              </span>
            </div>
            <p className="text-muted-foreground">
              {billingMode === "monthly" ? t('per_month') : t('per_month_yearly')}
            </p>
          </div>

          {/* First Month Free Promo */}
          {plan !== "premium" && (
            <div className="flex flex-col gap-3 mb-6 mx-2">

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`relative overflow-hidden rounded-xl border-2 p-4 ${plan === "misterio"
                    ? "border-[#FFD700]/30 bg-gradient-to-br from-[#FFD700]/10 to-[#FDB931]/10"
                    : "border-[#306BA1]/20 bg-gradient-to-br from-[#306BA1]/5 to-transparent"
                    }`}
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
                    className={`absolute inset-0 opacity-10 bg-[length:200%_100%] ${plan === "misterio"
                      ? "bg-gradient-to-r from-transparent via-[#FFD700] to-transparent"
                      : "bg-gradient-to-r from-transparent via-[#306BA1] to-transparent"
                      }`}
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
                      <h4 className={`font-bold text-sm leading-tight uppercase tracking-wide ${plan === "misterio" ? "text-[#8B7500] dark:text-[#FFD700]" : "text-[#306BA1]"
                        }`}>
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

              {/* Online Meeting Promo for Misterio Plan */}
              {plan === "misterio" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                  className="relative overflow-hidden rounded-xl border border-[#FFD700]/30 bg-gradient-to-r from-[#FFD700]/10 to-[#FDB931]/10 p-3 mt-3"
                >
                  {/* Pulse Animation Background */}
                  <motion.div
                    className="absolute inset-0 bg-[#FFD700]/5"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />

                  <div className="relative flex items-center gap-3">
                    <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-b from-slate-900 to-[#FFD700]/40 shadow-lg ring-1 ring-white/20 overflow-hidden">
                      {/* Calendar Animation Container */}
                      <motion.div
                        className="p-1.5"
                        animate={{
                          rotateY: [0, 180, 360],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Calendar className="w-6 h-6 text-[#FFD700]" strokeWidth={2.5} />
                      </motion.div>

                      {/* Floating Particles/Pages */}
                      <motion.div
                        className="absolute w-full h-0.5 bg-[#FFD700]/40"
                        animate={{
                          top: ["20%", "80%", "20%"],
                          opacity: [0, 1, 0]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      />
                    </div>

                    <div className="flex-1">
                      <h4 className="font-bold text-[#8B7500] dark:text-[#FFD700] text-sm leading-tight">
                        {t('online_meeting_available')}
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
                <Check className={`${highlight === "popular" ? "text-[#BEF264]" : "text-primary"} w-4 h-4 flex-shrink-0 mt-0.5`} />
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
                  </div>
                  {feature.isChannels && (
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

                  {feature.addonPricing && !feature.isChannels && (
                    <div className="flex items-center space-x-2 mt-1">
                      {feature.addonPricing.monthly && (
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-md ${highlight === "popular"
                            ? "text-[#BEF264] bg-[#BEF264]/10"
                            : "text-green-600 bg-green-50"
                            }`}
                          data-testid={`addon-included-${index}`}
                        >
                          {t('included')}
                        </span>
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
          className={`w-full py-4 rounded-3xl font-black uppercase tracking-normal transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg ${highlight === "popular"
            ? "bg-[#BEF264] text-slate-900 hover:bg-[#a6d94f] shadow-[#BEF264]/20 py-6 text-base"
            : highlight === "best-value"
              ? "bg-gradient-to-r from-[#FFD700] to-[#FDB931] text-white hover:from-[#E6C200] hover:to-[#E5A82D] shadow-[#FFD700]/25 py-6 text-base"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border py-6"
            }`}
          data-testid={`subscribe-button-${plan}`}
        >
          {t('subscribe_now')}
        </Button>
      </div>
    </div >
  );
}
