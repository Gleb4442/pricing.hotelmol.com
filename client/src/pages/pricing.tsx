import { useState } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { useBillingMode } from "@/hooks/use-billing-mode";
import { BillingToggle } from "@/components/pricing/BillingToggle";
import { PricingCard } from "@/components/pricing/PricingCard";
import { InfoSidebar } from "@/components/pricing/InfoSidebar";
import { SavingsCalculator } from "@/components/pricing/SavingsCalculator";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PricingPage() {
  const { billingMode, setBillingMode } = useBillingMode();
  const [mobileInfoOpen, setMobileInfoOpen] = useState(false);
  const [language, setLanguage] = useState("ru");

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
            
            {/* Language Selector */}
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-20 h-9 text-sm border-0 bg-transparent hover:bg-muted/50" data-testid="language-selector">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ru" data-testid="language-ru">🇷🇺 RU</SelectItem>
                  <SelectItem value="ua" data-testid="language-ua">🇺🇦 UA</SelectItem>
                  <SelectItem value="en" data-testid="language-en">🇺🇸 EN</SelectItem>
                </SelectContent>
              </Select>
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

        {/* Pricing Section */}
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* PRO Plan */}
            <PricingCard
              plan="pro"
              title="PRO"
              description="Идеально для растущих отелей"
              pricing={{
                usage: { current: "7 центов =0.07$", original: "8 центов =0.08$" },
                monthly: { current: "$399", original: "$459" },
                yearly: { current: "$319", original: "$399" },
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
                usage: { current: "35 центов =0.35$" },
                monthly: { current: "$1,899" },
                yearly: { current: "$1,519", original: "$1,899" },
              }}
              features={premiumFeatures}
              billingMode={billingMode}
              onSubscribe={() => handleSubscribe("premium")}
            />

            {/* Information Sidebar */}
            <InfoSidebar billingMode={billingMode} />
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
                <div
                  className={`${billingMode === "yearly" ? "block" : "hidden"}`}
                  data-testid="mobile-yearly-info"
                >
                  <h5 className="font-medium text-foreground mb-2">Годовая оплата со скидкой</h5>
                  <p className="text-muted-foreground text-sm mb-2">
                    Максимальная экономия до 20% при оплате за год вперед.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Скидка до 20%</li>
                    <li>• Приоритетная поддержка</li>
                    <li>• Неограниченные запросы</li>
                    <li>• Стабильность цен на год</li>
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
                Что с безопасностью и персональными данными?
              </h4>
              <p className="text-muted-foreground">
                Соблюдаем GDPR. Данные шифруются. По запросу заключаем DPA и размещаем данные в нужном регионе (EU/EMEA/US). Ваши данные не используются для обучения общих моделей без вашего согласия.
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
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <span className="font-bold text-foreground text-xl">Roomie</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Revolutionizing hospitality with intelligent automation and personalized guest
              experiences.
            </p>
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
