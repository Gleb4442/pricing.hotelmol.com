import { TrendingUp, Calendar, BarChart3, Clock } from "lucide-react";
import { BillingMode } from "@/hooks/use-billing-mode";
import { useLanguage } from "@/hooks/use-language";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import aiAutomationImage from "@assets/freepik__a-digital-piece-of-art-showing-cyborg-chatbot-hand__73253_1756866266252.jpg";

interface InfoSidebarProps {
  billingMode: BillingMode;
}

export function InfoSidebar({ billingMode }: InfoSidebarProps) {
  const { t, tArray } = useLanguage();
  
  return (
    <div className="lg:row-span-1 space-y-6 lg:mt-6">
      {/* Usage Info Card */}
      <div
        className={`bg-card border border-border rounded-2xl p-6 shadow-lg transition-all duration-300 ${
          billingMode === "usage" ? "block" : "hidden"
        }`}
        data-testid="usage-info-card"
      >
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <TrendingUp className="text-primary w-6 h-6" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-2">
              {t("info_usage_title")}
            </h4>
            <p className="text-muted-foreground text-sm mb-3">
              {t("info_usage_description")}
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {tArray("info_usage_benefits").map((benefit, index) => (
                <li key={index}>• {benefit}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div
        className={`bg-card border border-border rounded-2xl p-6 shadow-lg transition-all duration-300 ${
          billingMode === "monthly" ? "block" : "hidden"
        }`}
        data-testid="monthly-info-card"
      >
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Calendar className="text-accent w-6 h-6" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-2">
              {t("info_monthly_title")}
            </h4>
            <p className="text-muted-foreground text-sm mb-3">
              {t("info_monthly_description")}
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {tArray("info_monthly_benefits").map((benefit, index) => (
                <li key={index}>• {benefit}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div
        className={`bg-card border border-border rounded-2xl p-6 shadow-lg transition-all duration-300 ${
          billingMode === "yearly" ? "block" : "hidden"
        }`}
        data-testid="yearly-info-card"
      >
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <BarChart3 className="text-green-600 w-6 h-6" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-2">
              {t("info_yearly_title")}
            </h4>
            <p className="text-muted-foreground text-sm mb-3">
              {t("info_yearly_description")}
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {tArray("info_yearly_benefits").map((benefit, index) => (
                <li key={index}>• {benefit}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>


      {/* Trust Indicators */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center" data-testid="uptime-indicator">
            <div className="text-2xl font-bold text-primary">86%</div>
            <div className="text-sm text-muted-foreground">{t("requests_handled")}</div>
          </div>
          <div className="text-center" data-testid="support-indicator">
            <div className="text-2xl font-bold text-primary">24/7</div>
            <div className="text-sm text-muted-foreground">{t("guest_service")}</div>
          </div>
        </div>
      </div>

    </div>
  );
}
