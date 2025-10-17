import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useBillingMode } from "@/hooks/use-billing-mode";
import { useLanguage } from "@/hooks/use-language";
import { useHotelType } from "@/hooks/use-hotel-type";
import { BillingToggle } from "@/components/pricing/BillingToggle";
import { PricingCard } from "@/components/pricing/PricingCard";
import { SavingsCalculator } from "@/components/pricing/SavingsCalculator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function PricingPage() {
  const { billingMode, setBillingMode } = useBillingMode();
  const { language, setLanguage, t, tArray } = useLanguage();
  const { hotelType, toggleHotelType } = useHotelType();
  const [mobileInfoOpen, setMobileInfoOpen] = useState(false);

  const languages = [
    { code: "ru" as const, flag: "🇷🇺", label: "RU" },
    { code: "ua" as const, flag: "🇺🇦", label: "UA" },
    { code: "en" as const, flag: "🇺🇸", label: "EN" }
  ];

  const handleLanguageSwitch = () => {
    const currentIndex = languages.findIndex(lang => lang.code === language);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex].code);
  };

  const currentLanguage = languages.find(lang => lang.code === language);

  const handleSubscribe = (plan: string) => {
    // Redirect to Telegram for subscription
    window.open('https://t.me/hotelmindmanager', '_blank');
  };

  // Calculate price with network discount (10% off for PRO and PREMIUM)
  const getNetworkPrice = (basePrice: string): string => {
    if (hotelType === "single") return basePrice;
    
    // Remove $ and commas, calculate 10% discount
    const numericPrice = parseFloat(basePrice.replace(/[$,]/g, ''));
    const discountedPrice = Math.round(numericPrice * 0.9);
    
    // Format with $ and commas if needed
    return discountedPrice >= 1000 
      ? `$${discountedPrice.toLocaleString()}` 
      : `$${discountedPrice}`;
  };

  const basicFeatures = [
    { text: t("feature_ai_help") },
    { text: t("feature_booking_automation") },
    { text: t("feature_multilang") },
    { text: t("feature_standard_support") },
    { text: t("feature_online_chat") },
    { text: t("feature_pms_integration") },
  ];

  const proFeatures = [
    { text: t("feature_ai_help") },
    { text: t("feature_booking_automation") },
    { text: t("feature_multilang") },
    { text: t("feature_analytics") },
    { text: t("feature_priority_support") },
    { text: t("feature_pms_integration") },
    {
      text: t("feature_telegram_bot"),
      tooltip: t("tooltip_telegram_bot"),
      addonPricing: { usage: t("addon_pricing_usage"), monthly: t("addon_pricing_included") },
    },
    {
      text: t("feature_remove_logo"),
      tooltip: t("tooltip_remove_logo"),
      addonPricing: { usage: t("addon_pricing_usage"), monthly: t("addon_pricing_included") },
    },
  ];

  const premiumFeatures: { text: string; tooltip?: string; addonPricing?: { usage: string; monthly: string; } }[] = [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
      {/* Header */}
      <header className="border-b border-blue-200 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 backdrop-blur-sm sticky top-0 z-50 shadow-lg shadow-blue-500/25">
        <div className="container mx-auto px-4 py-4">
          {/* Desktop: Logo left, Hotel Type & Language right */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center">
              <div>
                <h1 className="text-xl font-bold text-white">{t("company_name")}</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Hotel Type Toggle */}
              <div className="flex items-center bg-blue-800/30 rounded-lg p-1">
                <button
                  onClick={() => hotelType === "network" && toggleHotelType()}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    hotelType === "single"
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-blue-200 hover:text-white"
                  }`}
                  data-testid="hotel-type-single"
                >
                  {t("hotel_type_single")}
                </button>
                <button
                  onClick={() => hotelType === "single" && toggleHotelType()}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    hotelType === "network"
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-blue-200 hover:text-white"
                  }`}
                  data-testid="hotel-type-network"
                >
                  {t("hotel_type_network")}
                </button>
              </div>
              
              {/* Language Switcher */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLanguageSwitch}
                className="h-9 px-3 text-sm border-2 border-blue-300 bg-transparent hover:bg-blue-500/20 text-white hover:text-blue-100"
                data-testid="language-switcher"
              >
                <span className="flex items-center space-x-1">
                  <span>{currentLanguage?.flag}</span>
                  <span>{currentLanguage?.label}</span>
                </span>
              </Button>
            </div>
          </div>

          {/* Mobile: Centered Roomie only */}
          <div className="md:hidden flex items-center justify-center">
            <h1 className="text-xl font-bold text-white">{t("company_name")}</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            {t("hero_title")} <span className="text-primary">{t("hero_title_highlight")}</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t("hero_description")}
          </p>

          <BillingToggle billingMode={billingMode} onBillingModeChange={setBillingMode} />
        </div>

        {/* Pricing Section */}
        <div className="max-w-7xl mx-auto">
          <div className={`grid gap-8 ${billingMode === "usage" ? "lg:grid-cols-2" : "lg:grid-cols-3"}`}>
            {/* BASIC Plan - только для monthly и yearly */}
            {billingMode !== "usage" && (
              <PricingCard
                key={`basic-${hotelType}`}
                plan="basic"
                title={t("plan_basic_title")}
                description={t("plan_basic_description")}
                pricing={{
                  usage: { current: t("price_basic") },
                  monthly: { current: t("price_basic") },
                  yearly: { current: t("price_basic") },
                }}
                features={basicFeatures}
                usageLimits={tArray("plan_basic_limits_array")}
                billingMode={billingMode}
                onSubscribe={() => handleSubscribe("basic")}
              />
            )}

            {/* PRO Plan */}
            <PricingCard
              key={`pro-${hotelType}`}
              plan="pro"
              title={t("plan_pro_title")}
              description={t("plan_pro_description")}
              pricing={{
                usage: { current: t("price_7_cents") },
                monthly: { 
                  current: getNetworkPrice("$299"), 
                  original: hotelType === "network" ? "$299" : undefined 
                },
                yearly: { 
                  current: getNetworkPrice("$239"), 
                  original: hotelType === "network" ? "$239" : undefined 
                },
              }}
              features={proFeatures}
              usageLimits={billingMode !== "usage" ? [t("plan_pro_limits")] : undefined}
              billingMode={billingMode}
              isPopular={true}
              onSubscribe={() => handleSubscribe("pro")}
            />

            {/* PREMIUM Plan */}
            <PricingCard
              key={`premium-${hotelType}`}
              plan="premium"
              title={t("plan_premium_title")}
              description={t("plan_premium_description")}
              pricing={{
                usage: { current: t("price_35_cents") },
                monthly: { 
                  current: "$1,099"
                },
                yearly: { 
                  current: "$879"
                },
              }}
              features={premiumFeatures}
              usageLimits={billingMode !== "usage" ? tArray("plan_premium_limits_array") : undefined}
              billingMode={billingMode}
              onSubscribe={() => handleSubscribe("premium")}
            />

          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 shadow-lg" data-testid="benefits-block">
            <h5 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-6 text-center">{t('your_benefits')}</h5>
            <Accordion type="multiple" className="w-full space-y-3">
              {[
                { title: t('benefit_free_connection'), desc: t('benefit_free_connection_desc') },
                { title: t('benefit_no_cancellation_fee'), desc: t('benefit_no_cancellation_fee_desc') },
                { title: t('benefit_personal_manager'), desc: t('benefit_personal_manager_desc') },
                { title: t('benefit_free_updates'), desc: t('benefit_free_updates_desc') },
                { title: t('benefit_24_7_support'), desc: t('benefit_24_7_support_desc') },
                { title: t('benefit_no_hidden_fees'), desc: t('benefit_no_hidden_fees_desc') }
              ].map((benefit, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="border-0 bg-white dark:bg-blue-800/20 rounded-xl px-4"
                  data-testid={`benefit-item-${index}`}
                >
                  <AccordionTrigger className="flex items-start space-x-3 py-4 px-0 hover:no-underline text-left">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200 flex-1">{benefit.title}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 pt-0">
                    <p className="text-sm text-blue-700 dark:text-blue-300 ml-5">{benefit.desc}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* Savings Calculator */}
        <div className="mt-16 max-w-4xl mx-auto">
          <SavingsCalculator />
        </div>

        {/* Mobile Responsive Accordion */}
        <div className="lg:hidden mt-12">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
            <Collapsible open={mobileInfoOpen} onOpenChange={setMobileInfoOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center justify-between w-full text-left p-0"
                  data-testid="mobile-info-toggle"
                >
                  <h4 className="text-lg font-semibold text-foreground">{t("mobile_info_title")}</h4>
                  <ChevronDown
                    className={`text-muted-foreground transition-transform duration-300 ${
                      mobileInfoOpen ? "rotate-180" : ""
                    }`}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 space-y-4">
                <div
                  className={`${billingMode === "usage" ? "block" : "hidden"}`}
                  data-testid="mobile-usage-info"
                >
                  <h5 className="font-medium text-foreground mb-2">{t("mobile_usage_info")}</h5>
                  <p className="text-muted-foreground text-sm mb-2">
                    {t("info_usage_description")}
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {tArray("info_usage_benefits").map((benefit, index) => (
                      <li key={index}>• {benefit}</li>
                    ))}
                  </ul>
                </div>
                <div
                  className={`${billingMode === "monthly" ? "block" : "hidden"}`}
                  data-testid="mobile-monthly-info"
                >
                  <h5 className="font-medium text-foreground mb-2">{t("mobile_monthly_info")}</h5>
                  <p className="text-muted-foreground text-sm mb-2">
                    {t("info_monthly_description")}
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {tArray("info_monthly_benefits").map((benefit, index) => (
                      <li key={index}>• {benefit}</li>
                    ))}
                  </ul>
                </div>
                <div
                  className={`${billingMode === "yearly" ? "block" : "hidden"}`}
                  data-testid="mobile-yearly-info"
                >
                  <h5 className="font-medium text-foreground mb-2">{t("mobile_yearly_info")}</h5>
                  <p className="text-muted-foreground text-sm mb-2">
                    {t("info_yearly_description")}
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {tArray("info_yearly_benefits").map((benefit, index) => (
                      <li key={index}>• {benefit}</li>
                    ))}
                  </ul>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            {t("faq_title")}
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              <h4 className="text-lg font-semibold text-foreground mb-2">
                {t("faq_integration_question")}
              </h4>
              <p className="text-muted-foreground">
                {t("faq_integration_answer")}
              </p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              <h4 className="text-lg font-semibold text-foreground mb-2">
                {t("faq_billing_question")}
              </h4>
              <p className="text-muted-foreground">
                {t("faq_billing_answer")}
              </p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              <h4 className="text-lg font-semibold text-foreground mb-2">
                {t("faq_security_question")}
              </h4>
              <p className="text-muted-foreground">
                {t("faq_security_answer")}
              </p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              <h4 className="text-lg font-semibold text-foreground mb-2">
                {t("faq_plans_question")}
              </h4>
              <p className="text-muted-foreground">
                {t("faq_plans_answer")}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Demo Buttons */}
      <div className="py-16 text-center">
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
          {/* Demo Button */}
          <Button 
            asChild
            size="lg"
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-10 py-7 text-lg font-medium shadow-md rounded-lg flex-1 sm:flex-initial w-full sm:w-auto"
            data-testid="button-demo"
          >
            <a 
              href="https://demo.hotelmind.xyz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center -space-y-2"
            >
              <span className="whitespace-nowrap">{t("try_demo")}</span>
              <span className="text-xs font-normal opacity-80 whitespace-nowrap">{t("no_registration")}</span>
            </a>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-blue-200 bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 mt-20 shadow-2xl shadow-blue-500/20">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <span className="font-bold text-white text-xl">{t("company_name")}</span>
            </div>
            <p className="text-blue-100 text-sm max-w-md mx-auto">
              {t("footer_description")}
            </p>
          </div>
          <div className="border-t border-blue-600 mt-12 pt-8 text-center">
            <p className="text-blue-200 text-sm">
              {t("footer_copyright")}
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Language Switcher */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleLanguageSwitch}
        className="md:hidden fixed bottom-4 right-4 z-50 h-10 px-4 text-sm border-2 border-blue-400 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 text-foreground shadow-lg"
        data-testid="mobile-language-switcher"
      >
        <span className="flex items-center space-x-1">
          <span>{currentLanguage?.flag}</span>
          <span className="font-medium">{currentLanguage?.label}</span>
        </span>
      </Button>
    </div>
  );
}
