import { TrendingUp, Calendar, BarChart3, Clock } from "lucide-react";
import { BillingMode } from "@/hooks/use-billing-mode";
import aiAutomationImage from "@assets/freepik__a-digital-piece-of-art-showing-cyborg-chatbot-hand__73253_1756866266252.jpg";

interface InfoSidebarProps {
  billingMode: BillingMode;
}

export function InfoSidebar({ billingMode }: InfoSidebarProps) {
  return (
    <div className="lg:row-span-1 space-y-6">
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
              Оплата за использование
            </h4>
            <p className="text-muted-foreground text-sm mb-3">
              Платите только за то, что используете. Идеально для сезонных объектов или тестирования ИИ.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Без месячных обязательств</li>
              <li>• Масштабирование по потребности</li>
              <li>• Прозрачное ценообразование</li>
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
              Фиксированная помесячная оплата
            </h4>
            <p className="text-muted-foreground text-sm mb-3">
              Предсказуемые расходы с неограниченным использованием. Лучше всего для объектов с высокой нагрузкой.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Неограниченные запросы</li>
              <li>• Предсказуемость бюджета</li>
              <li>• Максимальная экономия при масштабе</li>
            </ul>
          </div>
        </div>
      </div>

      {/* AI Features Showcase */}
      <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-border rounded-2xl p-6 shadow-lg">
        <img
          src={aiAutomationImage}
          alt="AI-powered automation interface"
          className="w-full h-32 object-cover rounded-xl mb-4"
          data-testid="ai-showcase-image"
        />
        <h4 className="text-lg font-semibold text-foreground mb-2">
          Автоматизация на основе ИИ
        </h4>
        <p className="text-muted-foreground text-sm">
          Трансформируйте опыт ваших гостей с помощью передовых технологий искусственного интеллекта.
        </p>
      </div>

      {/* Trust Indicators */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center" data-testid="uptime-indicator">
            <div className="text-2xl font-bold text-primary">86%</div>
            <div className="text-sm text-muted-foreground">запросов обработанных без участия ресепшн</div>
          </div>
          <div className="text-center" data-testid="support-indicator">
            <div className="text-2xl font-bold text-primary">24/7</div>
            <div className="text-sm text-muted-foreground">Поддержка</div>
          </div>
        </div>
      </div>
    </div>
  );
}
