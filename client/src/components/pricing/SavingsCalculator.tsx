import { useState } from "react";
import { Calculator, ChevronDown, X, Info, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";

interface SavingsCalculatorProps {
  className?: string;
}

interface CalculatorInputs {
  dailyRequests: number;
  avgBookingRevenue: number;
  lostRequestsPercent: number;
  conversionRate: number;
  otaCommission: number;
  adminSalary: number;
  roomieCost: number;
  workingDays: number;
}

export function SavingsCalculator({ className = "" }: SavingsCalculatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [mobileCalculatorMode, setMobileCalculatorMode] = useState<'info' | 'calculator'>('info');
  const [mode, setMode] = useState<'replace' | 'assist'>('assist'); // 'replace' = замена администратора, 'assist' = помощь команде
  
  const [inputs, setInputs] = useState<CalculatorInputs>({
    dailyRequests: 30,
    avgBookingRevenue: 8000,
    lostRequestsPercent: 15,
    conversionRate: 20,
    otaCommission: 12,
    adminSalary: 45000,
    roomieCost: 35910, // 399 USD * 90 RUB/USD
    workingDays: 22
  });

  const handleTryRoomie = () => {
    window.open('https://t.me/hotelmindmanager', '_blank');
  };

  const handleHowWeCalculate = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleMobileModal = () => {
    setShowMobileModal(!showMobileModal);
  };

  const toggleCalculator = () => {
    setShowCalculator(!showCalculator);
  };

  const updateInput = (field: keyof CalculatorInputs, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  // Расчёт экономии
  const calculateSavings = () => {
    const { dailyRequests, avgBookingRevenue, lostRequestsPercent, conversionRate, otaCommission, adminSalary, roomieCost, workingDays } = inputs;
    
    // Учитываем конверсию обращений в бронь
    const actualBookings = dailyRequests * (conversionRate / 100);
    
    // Экономия на потерянных заявках (автоматизация 70% запросов)
    const savedRequests = (dailyRequests * lostRequestsPercent / 100) * 0.7;
    const revenueFromSavedRequests = savedRequests * (conversionRate / 100) * avgBookingRevenue * workingDays;
    
    // Экономия на комиссиях OTA (увеличение прямых бронирований на 20%)
    const directBookingIncrease = actualBookings * 0.2;
    const directBookingIncreaseRevenue = directBookingIncrease * avgBookingRevenue * workingDays;
    const otaSavings = directBookingIncreaseRevenue * (otaCommission / 100);
    
    // Экономия времени (2-3 часа в день, стоимость часа администратора)
    const hourlyRate = adminSalary / (workingDays * 8);
    const timeSavings = 2.5 * hourlyRate * workingDays;
    
    // Экономия на зарплате (только в режиме замены)
    const salarySavings = mode === 'replace' ? adminSalary * 0.5 : 0; // 50% экономии при частичной замене
    
    const totalSavings = revenueFromSavedRequests + otaSavings + timeSavings + salarySavings - roomieCost;
    const roi = totalSavings > 0 ? (totalSavings / roomieCost) * 100 : 0;
    
    // Дополнительные показатели
    const savedRequestsPerMonth = savedRequests * workingDays;
    const additionalDirectBookingsPerMonth = directBookingIncrease * workingDays;
    const paybackDays = totalSavings > 0 ? Math.ceil((roomieCost / (totalSavings / 30))) : 0;
    
    return {
      revenueFromSavedRequests,
      otaSavings,
      timeSavings,
      salarySavings,
      totalSavings,
      roi,
      savedRequestsPerMonth,
      additionalDirectBookingsPerMonth,
      paybackDays
    };
  };

  const savings = calculateSavings();

  return (
    <>
      {/* Desktop Sticky Card */}
      <div className={`hidden lg:block ${className}`}>
        <div className="sticky top-24">
          <Card className="bg-gradient-to-br from-primary/5 to-orange-50 dark:from-primary/10 dark:to-orange-900/20 border-primary/20 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2 mb-2">
                <Calculator className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg text-foreground">
                  Сколько вы сэкономите с Roomie?
                </CardTitle>
              </div>
              <CardDescription className="text-sm text-muted-foreground">
                Честный расчёт за 10 секунд: без магии, только формулы
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="space-y-3">
                <Button 
                  variant="ghost"
                  onClick={toggleCalculator}
                  className="w-full text-left justify-between text-primary hover:bg-primary/5"
                  data-testid="button-toggle-calculator"
                >
                  <span>Рассчитать мою экономию</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showCalculator ? 'rotate-180' : ''}`} />
                </Button>
                
                <Collapsible open={showCalculator} onOpenChange={setShowCalculator}>
                  <CollapsibleContent>
                    <CalculatorForm 
                      inputs={inputs}
                      mode={mode}
                      onInputChange={updateInput}
                      onModeChange={setMode}
                      savings={savings}
                    />
                  </CollapsibleContent>
                </Collapsible>
                <Button 
                  onClick={handleTryRoomie}
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                  data-testid="button-try-roomie"
                >
                  Попробовать Roomie
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleHowWeCalculate}
                  className="w-full border-primary/30 text-primary hover:bg-primary/5"
                  data-testid="button-how-calculate"
                >
                  Как мы считаем?
                </Button>
              </div>

              <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                <CollapsibleContent>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 pt-4 border-t border-primary/20"
                  >
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div>
                        <h4 className="font-medium text-foreground mb-1">Наша формула экономии:</h4>
                        <ul className="space-y-1 text-xs">
                          <li>• Экономия времени: 2-4 часа/день × зарплата сотрудника</li>
                          <li>• Увеличение прямых бронирований: +15-25%</li>
                          <li>• Снижение комиссий OTA: экономия 10-15%</li>
                          <li>• Автоматизация рутины: 70% запросов без участия персонала</li>
                        </ul>
                      </div>
                      <div className="text-xs text-primary font-medium">
                        Средняя экономия для отеля на 20 номеров: 108,000-225,000₽/месяц
                      </div>
                    </div>
                  </motion.div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile Banner */}
      <div className="lg:hidden mb-6">
        <div 
          onClick={toggleMobileModal}
          className="bg-gradient-to-r from-primary/10 to-orange-50 dark:from-primary/20 dark:to-orange-900/30 border border-primary/20 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all duration-200"
          data-testid="mobile-savings-banner"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calculator className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Сколько вы сэкономите с Roomie?</p>
                <p className="text-xs text-muted-foreground">Честный расчёт за 10 секунд</p>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-primary" />
          </div>
        </div>
      </div>

      {/* Mobile Modal */}
      <AnimatePresence>
        {showMobileModal && (
          <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-full bg-card rounded-t-2xl shadow-xl"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">
                      Сколько вы сэкономите с Roomie?
                    </h3>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={toggleMobileModal}
                    data-testid="button-close-modal"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  Честный расчёт за 10 секунд: без магии, только формулы
                </p>

                {/* Переключатель режимов */}
                <div className="flex bg-muted rounded-lg p-1 mb-4">
                  <Button
                    variant={mobileCalculatorMode === 'info' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setMobileCalculatorMode('info')}
                    className="flex-1 text-xs h-8"
                    data-testid="mobile-mode-info"
                  >
                    Информация
                  </Button>
                  <Button
                    variant={mobileCalculatorMode === 'calculator' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setMobileCalculatorMode('calculator')}
                    className="flex-1 text-xs h-8"
                    data-testid="mobile-mode-calculator"
                  >
                    Калькулятор
                  </Button>
                </div>

                <div className="space-y-4">
                  {mobileCalculatorMode === 'info' ? (
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Наша формула экономии:</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start">
                            <span className="text-primary mr-2">•</span>
                            <span>Экономия времени: 2-4 часа/день × зарплата сотрудника</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-primary mr-2">•</span>
                            <span>Увеличение прямых бронирований: +15-25%</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-primary mr-2">•</span>
                            <span>Снижение комиссий OTA: экономия 10-15%</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-primary mr-2">•</span>
                            <span>Автоматизация рутины: 70% запросов без участия персонала</span>
                          </li>
                        </ul>
                      </div>
                      <div className="bg-primary/10 rounded-lg p-3 mt-4">
                        <p className="text-sm font-medium text-primary">
                          Средняя экономия для отеля на 20 номеров: 108,000-225,000₽/месяц
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto">
                      <CalculatorForm 
                        inputs={inputs}
                        mode={mode}
                        onInputChange={updateInput}
                        onModeChange={setMode}
                        savings={savings}
                      />
                    </div>
                  )}

                  <div className="space-y-3 pt-4 border-t border-border">
                    <Button 
                      onClick={handleTryRoomie}
                      className="w-full bg-primary hover:bg-primary/90 text-white"
                      data-testid="button-mobile-try-roomie"
                    >
                      Попробовать Roomie
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={toggleMobileModal}
                      className="w-full"
                      data-testid="button-mobile-close"
                    >
                      Закрыть
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// Компонент формы калькулятора с интерактивными полями
interface CalculatorFormProps {
  inputs: CalculatorInputs;
  mode: 'replace' | 'assist';
  onInputChange: (field: keyof CalculatorInputs, value: number) => void;
  onModeChange: (mode: 'replace' | 'assist') => void;
  savings: {
    revenueFromSavedRequests: number;
    otaSavings: number;
    timeSavings: number;
    salarySavings: number;
    totalSavings: number;
    roi: number;
    savedRequestsPerMonth: number;
    additionalDirectBookingsPerMonth: number;
    paybackDays: number;
  };
}

function CalculatorForm({ inputs, mode, onInputChange, onModeChange, savings }: CalculatorFormProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ru-RU', { 
      style: 'currency', 
      currency: 'RUB',
      maximumFractionDigits: 0 
    }).format(num);
  };

  const inputFields = [
    {
      key: 'dailyRequests' as keyof CalculatorInputs,
      label: 'Обращений в день',
      tooltip: 'Сколько в среднем обращений приходит в день из сайта, мессенджеров и телефона? Если не уверены — оставьте 30',
      suffix: 'обращений'
    },
    {
      key: 'avgBookingRevenue' as keyof CalculatorInputs,
      label: 'Средний доход с одной брони',
      tooltip: 'Какую среднюю сумму отель получает с одного бронирования? Считайте полную стоимость проживания',
      prefix: '₽'
    },
    {
      key: 'lostRequestsPercent' as keyof CalculatorInputs,
      label: 'Сколько обращений теряется',
      tooltip: 'Какой процент потенциальных гостей не получает ответ или получает его слишком поздно? В среднем 10-20%',
      suffix: '%'
    },
    {
      key: 'conversionRate' as keyof CalculatorInputs,
      label: 'Конверсия обращений в бронь',
      tooltip: 'Какой процент обращений приводит к фактическому бронированию? Обычно 15-25%, если не уверены - оставьте 20%',
      suffix: '%'
    },
    {
      key: 'otaCommission' as keyof CalculatorInputs,
      label: 'Комиссия OTA',
      tooltip: 'Какую комиссию платите сайтам бронирования (Booking.com, Airbnb)? Обычно 10-15%',
      suffix: '%'
    },
    {
      key: 'adminSalary' as keyof CalculatorInputs,
      label: 'Зарплата администратора',
      tooltip: 'Зарплата сотрудника, который работает с гостями и бронированиями. Учитывайте все выплаты и налоги',
      prefix: '₽',
      suffix: '/мес'
    },
    {
      key: 'roomieCost' as keyof CalculatorInputs,
      label: 'Стоимость Roomie',
      tooltip: 'Выберите подходящий тариф Roomie из представленных выше планов (цена в рублях)',
      prefix: '₽',
      suffix: '/мес'
    }
  ];

  return (
    <TooltipProvider>
      <div className="space-y-6 mt-4 pt-4 border-t border-primary/20">
        {/* Переключатель режима */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Режим работы</Label>
          <div className="flex items-center space-x-3">
            <Button
              variant={mode === 'assist' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onModeChange('assist')}
              className="text-xs"
              data-testid="mode-assist"
            >
              Помощь команде
            </Button>
            <Button
              variant={mode === 'replace' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onModeChange('replace')}
              className="text-xs"
              data-testid="mode-replace"
            >
              Замена администратора
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {mode === 'assist' 
              ? 'Roomie помогает команде, экономия на зарплате не учитывается'
              : 'Roomie частично заменяет администратора, учитывается экономия на зарплате'
            }
          </p>
        </div>

        {/* Поля ввода */}
        <div className="grid gap-4">
          {inputFields.map((field) => (
            <div key={field.key} className="space-y-1">
              <div className="flex items-center space-x-1">
                <Label className="text-xs text-foreground">{field.label}</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">{field.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="relative">
                {field.prefix && (
                  <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                    {field.prefix}
                  </span>
                )}
                <Input
                  type="number"
                  value={inputs[field.key]}
                  onChange={(e) => onInputChange(field.key, parseFloat(e.target.value) || 0)}
                  className={`text-xs h-8 ${field.prefix ? 'pl-6' : ''} ${field.suffix ? 'pr-16' : ''}`}
                  data-testid={`input-${field.key}`}
                />
                {field.suffix && (
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                    {field.suffix}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Результаты расчёта */}
        <div className="space-y-4 pt-4 border-t border-primary/20">
          {savings.totalSavings > 0 ? (
            <>
              {/* Главные показатели */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-foreground">Ваша экономия:</h4>
                
                <div className="grid grid-cols-1 gap-4">
                  {/* Экономия в месяц */}
                  <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30 rounded-lg p-4 text-center" data-testid="main-savings-monthly">
                    <div className="text-xs text-muted-foreground mb-1">Экономия в месяц</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatNumber(savings.totalSavings)}</div>
                  </div>
                  
                  {/* Окупаемость и ROI */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-primary/10 rounded-lg p-3 text-center" data-testid="main-payback">
                      <div className="text-xs text-muted-foreground mb-1">Окупаемость</div>
                      <div className="text-lg font-bold text-primary">{savings.paybackDays} дн.</div>
                    </div>
                    <div className="bg-primary/10 rounded-lg p-3 text-center" data-testid="main-roi">
                      <div className="text-xs text-muted-foreground mb-1">ROI</div>
                      <div className="text-lg font-bold text-primary">{savings.roi.toFixed(0)}%</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Дополнительные показатели */}
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-foreground">Дополнительные показатели:</h5>
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3" data-testid="additional-saved-requests">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Не потеряете обращений в месяц</span>
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{Math.round(savings.savedRequestsPerMonth)}</span>
                    </div>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3" data-testid="additional-direct-bookings">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Дополнительные прямые брони в месяц</span>
                      <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">{Math.round(savings.additionalDirectBookingsPerMonth)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Поясняющий текст */}
              <div className="bg-gradient-to-r from-primary/5 to-orange-50 dark:from-primary/10 dark:to-orange-900/20 rounded-lg p-3" data-testid="explanation-text">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Почему Roomie даёт +к бронированиям:</strong> отвечает быстрее, не теряет запросы, мягко ведёт к прямой броне, предлагает доп.услуги по делу
                </p>
              </div>
              
              {/* Детализация */}
              <details className="space-y-2">
                <summary className="text-xs font-medium text-foreground cursor-pointer hover:text-primary">Детализация расчётов</summary>
                <div className="space-y-2 text-xs mt-2" data-testid="calculation-details">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Доход от спасённых заявок:</span>
                    <span className="font-medium text-green-600">{formatNumber(savings.revenueFromSavedRequests)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Экономия на комиссиях OTA:</span>
                    <span className="font-medium text-green-600">{formatNumber(savings.otaSavings)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Экономия времени:</span>
                    <span className="font-medium text-green-600">{formatNumber(savings.timeSavings)}</span>
                  </div>
                  {mode === 'replace' && savings.salarySavings > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Экономия на зарплате:</span>
                      <span className="font-medium text-green-600">{formatNumber(savings.salarySavings)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Стоимость Roomie:</span>
                    <span className="font-medium text-red-500">-{formatNumber(inputs.roomieCost)}</span>
                  </div>
                </div>
              </details>
            </>
          ) : (
            /* Честный блок для неокупаемости */
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4" data-testid="unprofitable-warning">
              <div className="text-center space-y-2">
                <div className="text-sm font-medium text-red-600 dark:text-red-400" data-testid="text-unprofitable-message">
                  При этих вводных Roomie не окупается
                </div>
                <div className="text-xs text-muted-foreground">
                  Попробуйте снизить стоимость персонала или уточнить проценты пропусков/конверсии.
                </div>
                <div className="text-xs text-red-500 font-medium" data-testid="text-loss-amount">
                  Убыток: {formatNumber(Math.abs(savings.totalSavings))}/мес
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}