import { useState } from "react";
import { ChevronDown, Home } from "lucide-react";
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SiTelegram, SiMessenger, SiWhatsapp, SiViber, SiInstagram } from "react-icons/si";
import { motion, AnimatePresence } from "framer-motion";

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

const ContactWidget = ({ hiddenOnMobile }: { hiddenOnMobile?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  const messengers = [
    {
      name: "Telegram",
      icon: BrandIcons.Telegram,
      href: "https://t.me/hotelmolmanager",
      color: "",
    },
    {
      name: "WhatsApp",
      icon: BrandIcons.WhatsApp,
      href: "https://wa.me/380931603830",
      color: "",
    },
    {
      name: "Messenger",
      icon: BrandIcons.Messenger,
      href: "https://m.me/hotelmolmanager",
      color: "",
    },
    {
      name: "Viber",
      icon: BrandIcons.Viber,
      href: "viber://chat?number=%2B380931603830",
      color: "",
    },
  ];

  return (
    <div className={`fixed bottom-2 md:bottom-6 right-6 z-50 flex-col items-end gap-4 ${hiddenOnMobile ? 'hidden md:flex' : 'flex'}`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="flex flex-col gap-3 mb-2"
          >
            {messengers.map((m, i) => (
              <motion.a
                key={m.name}
                href={m.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`${m.color} h-12 w-12 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center overflow-hidden`}
                title={m.name}
              >
                <m.icon />
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 md:w-[54px] md:h-[54px] bg-[#306BA1] hover:bg-[#254d7a] text-white rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center group"
      >
        <div className={`transition-transform duration-500 ${isOpen ? 'rotate-[360deg]' : ''}`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlSpace="preserve"
            className="w-[46px] h-[46px] md:w-[58px] md:h-[58px]"
            version="1.1"
            style={{ shapeRendering: "geometricPrecision", textRendering: "geometricPrecision", imageRendering: "auto", fillRule: "evenodd", clipRule: "evenodd" }}
            viewBox="0 0 203.18 203.18"
          >
            <g id="Слой_x0020_1">
              <metadata id="CorelCorpID_0Corel-Layer" />
              <g id="_2278661208240">
                <circle style={{ fill: "none" }} cx="101.59" cy="101.59" r="101.6" />
                <path style={{ fill: "white" }} d="M106.13 53.03c22.55,2.08 40.65,19.52 43.75,41.75l-96.58 0c3.18,-22.75 22.05,-40.47 45.33,-41.87l0 -4.17 -2.36 0c-2.32,0 -4.23,-1.91 -4.23,-4.23l0 0c0,-2.33 1.91,-4.23 4.23,-4.23l12.4 0c2.33,0 4.23,1.9 4.23,4.23l0 0c0,2.32 -1.9,4.23 -4.23,4.23l-2.54 0 0 4.29zm15.16 63.75c1.5,-1.94 4.29,-2.3 6.23,-0.8 1.94,1.5 2.3,4.29 0.8,6.23 -3.14,4.07 -7.19,7.4 -11.86,9.7 -4.51,2.21 -9.56,3.46 -14.87,3.46 -5.31,0 -10.36,-1.25 -14.87,-3.46 -4.67,-2.3 -8.72,-5.63 -11.86,-9.7 -1.5,-1.94 -1.14,-4.73 0.8,-6.23 1.94,-1.5 4.73,-1.14 6.23,0.8 2.33,3.01 5.31,5.47 8.74,7.15 3.28,1.62 7,2.52 10.96,2.52 3.96,0 7.68,-0.9 10.96,-2.52 3.43,-1.68 6.41,-4.14 8.74,-7.15zm-10.04 39.85c-1.68,1.41 -4.25,2.17 -4.31,-1.17 -0.02,-0.99 -0.04,-1.26 -0.06,-2.26 -0.81,-2.45 -3.2,-2.84 -5.68,-2.84l0 -0.01c-25.76,-0.2 -46.76,-20.38 -48.29,-45.8l97.36 0c-0.71,11.75 -5.05,23.66 -13.15,30.44l-25.87 21.64z" />
              </g>
            </g>
          </svg>
        </div>
      </button>
    </div>
  );
};

export default function PricingPage() {
  const { billingMode, setBillingMode } = useBillingMode();
  const { language, setLanguage, t, tArray } = useLanguage();
  const { hotelType, toggleHotelType } = useHotelType();
  const [mobileInfoOpen, setMobileInfoOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  const languages = [
    { code: "ru" as const, flag: "🇷🇺", label: "RU", name: "Русский" },
    { code: "ua" as const, flag: "🇺🇦", label: "UA", name: "Українська" },
    { code: "en" as const, flag: "🇺🇸", label: "EN", name: "English" },
    { code: "pl" as const, flag: "🇵🇱", label: "PL", name: "Polski" }
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  const handleSubscribe = (plan: string) => {
    // Redirect to Telegram for subscription
    window.open('https://t.me/hotelmolmanager', '_blank');
  };

  // Calculate price with network discount
  const getNetworkPrice = (basePrice: string, discountRate: number): string => {
    if (hotelType === "single") return basePrice;

    // Remove $ and commas, calculate discount
    const numericPrice = parseFloat(basePrice.replace(/[$,]/g, ''));
    const discountedPrice = Math.round(numericPrice * (1 - discountRate));

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
    { text: t("feature_booking_automation") },
    { text: t("feature_analytics") },
    { text: t("feature_priority_support") },
    {
      text: t("feature_remove_logo"),
      tooltip: t("tooltip_remove_logo"),
      addonPricing: { usage: t("addon_pricing_logo_removal"), monthly: "" },
    },
    { text: t("feature_google_reviews") },
    { text: t("feature_guest_reviews") },
    { text: t("feature_extended_kb") },
    {
      text: t("feature_communication_channels"),
      tooltip: t("tooltip_communication_channels"),
      isChannels: true,
    },
  ];

  const premiumFeatures: { text: string; tooltip?: string; addonPricing?: { usage: string; monthly: string; } }[] = [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 w-full">
        <div className="container mx-auto px-4 py-3 rounded-3xl bg-gradient-to-r from-[#306BA1] via-[#254d7a] to-[#1e4473] bg-opacity-70 backdrop-blur-xl shadow-xl shadow-[#306BA1]/30 mt-[10px] md:mt-4">
          {/* Desktop: Logo left, Hotel Type & Language right */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center">
              <a
                href="https://www.hotelmol.com/"
                className="h-9 w-9 flex items-center justify-center rounded-lg border-2 border-[#7ca3c8] bg-transparent hover:bg-[#306BA1]/20 text-white transition-colors"
                aria-label="Home"
              >
                <Home className="h-5 w-5" />
              </a>
              <div className="ml-[15px]">
                <h1 className="text-xl font-bold text-white">{t("company_name")}</h1>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Hotel Type Toggle */}
              {!isCalculatorOpen && (
                <div className="flex items-center bg-[#254d7a]/30 rounded-lg p-1">
                  <button
                    onClick={() => hotelType === "network" && toggleHotelType()}
                    className={`relative px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${hotelType === "single"
                      ? "text-white"
                      : "text-[#a8c5e0] hover:text-white"
                      }`}
                    data-testid="hotel-type-single"
                  >
                    {hotelType === "single" && (
                      <motion.div
                        layoutId="active-hotel-type-desktop"
                        className="absolute inset-0 bg-[#306BA1] rounded-md shadow-md"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10">{t("hotel_type_single")}</span>
                  </button>
                  <button
                    onClick={() => hotelType === "single" && toggleHotelType()}
                    className={`relative px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${hotelType === "network"
                      ? "text-white"
                      : "text-[#a8c5e0] hover:text-white"
                      }`}
                    data-testid="hotel-type-network"
                  >
                    {hotelType === "network" && (
                      <motion.div
                        layoutId="active-hotel-type-desktop"
                        className="absolute inset-0 bg-[#306BA1] rounded-md shadow-md"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10">{t("hotel_type_network")}</span>
                  </button>
                </div>
              )}

              {/* Language Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 text-sm border-2 border-[#7ca3c8] bg-transparent hover:bg-[#306BA1]/20 text-white hover:text-[#d4e5f3]"
                    data-testid="language-switcher"
                  >
                    <span className="flex items-center space-x-1">
                      <span>{currentLanguage?.flag}</span>
                      <span>{currentLanguage?.label}</span>
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`cursor-pointer ${language === lang.code ? 'bg-[#f0f5fa] dark:bg-[#306BA1]/20' : ''}`}
                      data-testid={`language-option-${lang.code}`}
                    >
                      <span className="flex items-center space-x-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mobile: Logo centered + Language switcher absolute right */}
          <div className="md:hidden flex items-center justify-center relative">
            <div className="absolute left-0">
              <a
                href="https://www.hotelmol.com/"
                className="h-9 w-9 flex items-center justify-center rounded-lg border-2 border-[#7ca3c8] bg-transparent hover:bg-[#306BA1]/20 text-white transition-colors"
                aria-label="Home"
              >
                <Home className="h-5 w-5" />
              </a>
            </div>
            <h1 className="text-xl font-bold text-white">{t("company_name")}</h1>
            <div className="absolute right-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 text-sm border-2 border-[#7ca3c8] bg-transparent hover:bg-[#306BA1]/20 text-white hover:text-[#d4e5f3]"
                    data-testid="mobile-header-language-switcher"
                  >
                    <span className="flex items-center space-x-1">
                      <span>{currentLanguage?.flag}</span>
                      <span>{currentLanguage?.label}</span>
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`cursor-pointer ${language === lang.code ? 'bg-[#f0f5fa] dark:bg-[#306BA1]/20' : ''}`}
                      data-testid={`mobile-header-language-option-${lang.code}`}
                    >
                      <span className="flex items-center space-x-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-16 pt-4 mt-32 md:mt-24">
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
        <div className="max-w-[1843px] mx-auto">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 pt-16 items-end">
            {/* CORE AI Plan (formerly BASIC) */}
            <PricingCard
              key={`basic-${hotelType}`}
              plan="basic"
              title={t("plan_basic_title")}
              description={t("plan_basic_description")}
              pricing={{
                monthly: {
                  current: getNetworkPrice("$499", 0.07),
                  original: hotelType === "network" ? "$499" : undefined
                },
                yearly: {
                  current: getNetworkPrice("$349", 0.07),
                  original: "$499"
                },
              }}
              features={basicFeatures}
              usageLimits={tArray("plan_basic_limits_array")}
              billingMode={billingMode}
              onSubscribe={() => handleSubscribe("basic")}
              discountBadgeText={hotelType === "network" ? t("network_discount_7") : undefined}
            />

            {/* PRO Plan */}
            <PricingCard
              key={`pro-${hotelType}`}
              plan="pro"
              title={t("plan_pro_title")}
              description={t("plan_pro_description")}
              pricing={{
                monthly: {
                  current: getNetworkPrice("$599", 0.10),
                  original: hotelType === "network" ? "$599" : undefined
                },
                yearly: {
                  current: getNetworkPrice("$419", 0.10),
                  original: "$599"
                },
              }}
              features={proFeatures}
              usageLimits={[t("plan_pro_limits")]}
              billingMode={billingMode}
              highlight="popular"
              discountBadgeText={hotelType === "network" ? t("network_discount_10") : undefined}
              onSubscribe={() => handleSubscribe("pro")}
            />

            {/* ULTRA Plan */}
            <PricingCard
              key={`misterio-${hotelType}`}
              plan="misterio"
              title={t("plan_misterio_title")}
              description={t("plan_misterio_description")}
              pricing={{
                monthly: {
                  current: getNetworkPrice("$899", 0.15),
                  original: hotelType === "network" ? "$899" : undefined
                },
                yearly: {
                  current: getNetworkPrice("$629", 0.15),
                  original: "$899"
                },
              }}
              features={[
                { text: t("feature_all_pro") },
                { text: t("feature_unique_design") },
                { text: t("feature_ai_training") },
              ]}
              usageLimits={tArray("plan_misterio_limits_array")}
              billingMode={billingMode}
              highlight="best-value"
              discountBadgeText={hotelType === "network" ? t("network_discount_15") : undefined}
              onSubscribe={() => handleSubscribe("misterio")}
            />

            {/* ENTERPRISE Plan (formerly PREMIUM) */}
            <PricingCard
              key={`premium-${hotelType}`}
              plan="premium"
              title={t("plan_premium_title")}
              description={t("plan_premium_description")}
              pricing={{
                monthly: {
                  current: "$1,499"
                },
                yearly: {
                  current: "$1,049",
                  original: "$1,499"
                },
              }}
              features={premiumFeatures}
              usageLimits={tArray("plan_premium_limits_array")}
              billingMode={billingMode}
              onSubscribe={() => handleSubscribe("premium")}
            />
          </div>
        </div>

        {/* Benefits Section */}
        < div className="mt-16 max-w-4xl mx-auto" >
          <div className="bg-[#f0f5fa] dark:bg-[#306BA1]/20 rounded-2xl p-8 shadow-lg" data-testid="benefits-block">
            <h5 className="text-lg font-medium text-[#254d7a] dark:text-[#7ca3c8] mb-6 text-center">{t('your_benefits')}</h5>
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
                  className="border-0 bg-white dark:bg-[#306BA1]/20 rounded-xl px-4"
                  data-testid={`benefit-item-${index}`}
                >
                  <AccordionTrigger className="flex items-start space-x-3 py-4 px-0 hover:no-underline text-left">
                    <div className="h-2 w-2 rounded-full bg-[#306BA1] mt-2 flex-shrink-0" />
                    <span className="text-sm font-medium text-[#254d7a] dark:text-[#7ca3c8] flex-1">{benefit.title}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 pt-0">
                    <p className="text-sm text-[#1e4473] dark:text-[#a8c5e0] ml-5">{benefit.desc}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div >

        {/* Savings Calculator */}
        < div className="mt-16 max-w-4xl mx-auto" >
          <SavingsCalculator onModalToggle={setIsCalculatorOpen} />
        </div >

        {/* Mobile Responsive Accordion */}
        < div className="lg:hidden mt-12" >
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
                    className={`text-muted-foreground transition-transform duration-300 ${mobileInfoOpen ? "rotate-180" : ""
                      }`}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 space-y-4">
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
        </div >

        {/* FAQ Section */}
        < div className="mt-20" >
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            {t("faq_title")}
          </h2>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem value="integration" className="bg-card border border-border rounded-2xl px-6 shadow-sm">
                <AccordionTrigger className="text-lg font-semibold text-foreground hover:no-underline py-6">
                  {t("faq_integration_question")}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 text-base leading-relaxed">
                  {t("faq_integration_answer")}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="billing" className="bg-card border border-border rounded-2xl px-6 shadow-sm">
                <AccordionTrigger className="text-lg font-semibold text-foreground hover:no-underline py-6">
                  {t("faq_billing_question")}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 text-base leading-relaxed">
                  {t("faq_billing_answer")}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="security" className="bg-card border border-border rounded-2xl px-6 shadow-sm">
                <AccordionTrigger className="text-lg font-semibold text-foreground hover:no-underline py-6">
                  {t("faq_security_question")}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 text-base leading-relaxed">
                  {t("faq_security_answer")}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="plans" className="bg-card border border-border rounded-2xl px-6 shadow-sm">
                <AccordionTrigger className="text-lg font-semibold text-foreground hover:no-underline py-6">
                  {t("faq_plans_question")}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 text-base leading-relaxed">
                  {t("faq_plans_answer")}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div >
      </main >

      {/* Demo Buttons */}
      < div className="py-8 px-4 text-center md:py-16" >
        <div className="flex justify-center">
          {/* Demo Button */}
          <a
            href="https://demo.hotelmol.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white font-bold shadow-lg hover:shadow-2xl rounded-3xl px-10 py-6 sm:px-16 sm:py-9 inline-flex flex-col items-center justify-center transition-all"
            data-testid="button-demo"
          >
            <span className="text-xl sm:text-2xl whitespace-nowrap leading-tight">{t("try_demo")}</span>
            <span className="text-base sm:text-lg font-semibold opacity-90 whitespace-nowrap mt-1">{t("no_registration")}</span>
          </a>
        </div>
      </div >

      {/* Footer */}
      < footer className="border-t border-[#7ca3c8] bg-gradient-to-br from-[#254d7a] via-[#1e4473] to-[#152a42] mt-20 shadow-2xl shadow-[#306BA1]/20" >
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <span className="font-bold text-white text-xl">{t("company_name")}</span>
            </div>
            <p className="text-[#a8c5e0] text-sm max-w-md mx-auto">
              {t("footer_description")}
            </p>
          </div>
          <div className="border-t border-[#306BA1] mt-12 pt-8 text-center">
            <p className="text-[#7ca3c8] text-sm">
              {t("footer_copyright")}
            </p>
          </div>
        </div>
      </footer >

      {/* Mobile Hotel Type Toggle */}
      {
        !isCalculatorOpen && (
          <div className="md:hidden fixed bottom-[5px] left-4 right-4 z-50 flex items-center bg-[#254d7a]/30 rounded-lg p-1 shadow-lg max-w-fit">
            <button
              onClick={() => hotelType === "network" && toggleHotelType()}
              className={`relative px-3 py-2.5 min-h-[44px] rounded-md text-sm font-medium transition-colors whitespace-nowrap ${hotelType === "single"
                ? "text-white"
                : "text-[#a8c5e0] hover:text-white"
                }`}
              data-testid="mobile-hotel-type-single"
            >
              {hotelType === "single" && (
                <motion.div
                  layoutId="active-hotel-type-mobile"
                  className="absolute inset-0 bg-[#306BA1] rounded-md shadow-md"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{t("hotel_type_single")}</span>
            </button>
            <button
              onClick={() => hotelType === "single" && toggleHotelType()}
              className={`relative px-3 py-2.5 min-h-[44px] rounded-md text-sm font-medium transition-colors whitespace-nowrap ${hotelType === "network"
                ? "text-white"
                : "text-[#a8c5e0] hover:text-white"
                }`}
              data-testid="mobile-hotel-type-network"
            >
              {hotelType === "network" && (
                <motion.div
                  layoutId="active-hotel-type-mobile"
                  className="absolute inset-0 bg-[#306BA1] rounded-md shadow-md"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{t("hotel_type_network")}</span>
            </button>
          </div>
        )
      }

      <ContactWidget hiddenOnMobile={isCalculatorOpen} />
    </div >
  );
}
