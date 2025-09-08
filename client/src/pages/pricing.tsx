import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useBillingMode } from "@/hooks/use-billing-mode";
import { BillingToggle } from "@/components/pricing/BillingToggle";
import { PricingCard } from "@/components/pricing/PricingCard";
import { InfoSidebar } from "@/components/pricing/InfoSidebar";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function PricingPage() {
  const { billingMode, setBillingMode } = useBillingMode();
  const [mobileInfoOpen, setMobileInfoOpen] = useState(false);

  const handleSubscribe = (plan: string) => {
    // Redirect to Telegram for subscription
    window.open('https://t.me/hotelmindmanager', '_blank');
  };

  const proFeatures = [
    { text: "ИИ помощь гостям" },
    { text: "Автоматизированное управление бронированием" },
    { text: "Поддержка нескольких языков" },
    { text: "Приоритетная поддержка" },
    {
      text: "Персональный Telegram-бот",
      tooltip: "Получите собственного брендированного Telegram-бота для взаимодействия с гостями",
      addonPricing: { usage: "+0,5 центов/запрос", monthly: "Включено" },
    },
    {
      text: "Удаление логотипа",
      tooltip: "Уберите наш брендинг с интерфейсов для гостей",
      addonPricing: { usage: "+0,5 центов/запрос", monthly: "Включено" },
    },
  ];

  const premiumFeatures = [
    { text: "Всё что включено в PRO" },
    { text: "Расширенная аналитика" },
    { text: "Персональное обучение ИИ" },
    { text: "Персональный менеджер аккаунта" },
    { text: "Индивидуальный дизайн виджета с брендингом вашей компании" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div>
                <h1 className="text-xl font-bold text-foreground">Roomie</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Выберите ваш план <span className="text-primary">ИИ Помощника</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Расширьте возможности отеля с помощью интеллектуальной автоматизации. Гибкие тарифы для любого размера собственности.
          </p>

          <BillingToggle billingMode={billingMode} onBillingModeChange={setBillingMode} />
        </div>

        {/* Pricing Grid */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* PRO Plan */}
          <PricingCard
            plan="pro"
            title="PRO"
            description="Идеально для растущих отелей"
            pricing={{
              usage: { current: "7 центов =0.07$", original: "8 центов =0.08$" },
              monthly: { current: "$399", original: "$459" },
            }}
            features={proFeatures}
            billingMode={billingMode}
            isPopular={true}
            onSubscribe={() => handleSubscribe("pro")}
          />

          {/* PREMIUM Plan */}
          <PricingCard
            plan="premium"
            title="PREMIUM"
            description="Корпоративное решение"
            pricing={{
              usage: { current: "30 центов =0.30$" },
              monthly: { current: "$1,499" },
            }}
            features={premiumFeatures}
            billingMode={billingMode}
            onSubscribe={() => handleSubscribe("premium")}
          />

          {/* Information Sidebar */}
          <InfoSidebar billingMode={billingMode} />
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
                  <h4 className="text-lg font-semibold text-foreground">Информация о биллинге</h4>
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
                  <h5 className="font-medium text-foreground mb-2">Оплата за использование</h5>
                  <p className="text-muted-foreground text-sm mb-2">
                    Платите только за то, что используете. Идеально для сезонных объектов.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Без месячных обязательств</li>
                    <li>• Масштабирование по потребности</li>
                    <li>• Прозрачное ценообразование</li>
                  </ul>
                </div>
                <div
                  className={`${billingMode === "monthly" ? "block" : "hidden"}`}
                  data-testid="mobile-monthly-info"
                >
                  <h5 className="font-medium text-foreground mb-2">Фиксированная помесячная оплата</h5>
                  <p className="text-muted-foreground text-sm mb-2">
                    Предсказуемые расходы с неограниченным использованием.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Неограниченные запросы</li>
                    <li>• Предсказуемость бюджета</li>
                    <li>• Максимальная экономия при масштабе</li>
                  </ul>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Часто задаваемые вопросы
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              <h4 className="text-lg font-semibold text-foreground mb-2">
                Как работает интеграция с ИИ?
              </h4>
              <p className="text-muted-foreground">
                Подключаемся к вашему PMS и каналам через API. Базовый запуск занимает 1 рабочий день и не мешает работе ресепшна. Ассистент бережно соблюдает политики тарифов, стоп-сейлы и правила отмен
              </p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              <h4 className="text-lg font-semibold text-foreground mb-2">
                Могу ли я переключаться между режимами оплаты?
              </h4>
              <p className="text-muted-foreground">
                Да, вы можете изменить предпочтения по оплате в любое время. Изменения вступают в силу
                с начала следующего расчетного периода.
              </p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              <h4 className="text-lg font-semibold text-foreground mb-2">
                Какие языки поддерживаются?
              </h4>
              <p className="text-muted-foreground">
                Наш ИИ поддерживает более 40 языков, обеспечивая международным гостям помощь
                на их предпочитаемом языке.
              </p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              <h4 className="text-lg font-semibold text-foreground mb-2">
                Чем PRO отличается от PREMIUM в двух словах?
              </h4>
              <p className="text-muted-foreground">
                PRO — «всё необходимое чтобы аввтоматизировать коммуникацию с гостями с помощью ИИ». 
                PREMIUM — «всё из PRO» + Собственная админ панель, расширенная аналитика, персональное 
                обучение ИИ на ваших данных, white-label и менеджер аккаунта.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <span className="font-bold text-foreground text-xl">Roomie</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Revolutionizing hospitality with intelligent automation and personalized guest
                experiences.
              </p>
            </div>
            <div>
              <h5 className="font-semibold text-foreground mb-4">Product</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    API
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Integration
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-foreground mb-4">Support</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Status
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-foreground mb-4">Company</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-12 pt-8 text-center">
            <p className="text-muted-foreground text-sm">
              &copy; 2024 Roomie. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
