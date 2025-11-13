import { useState, useEffect, useCallback } from "react";
import { Calculator, ChevronDown, X, Info, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";

interface SavingsCalculatorProps {
  className?: string;
  onModalToggle?: (isOpen: boolean) => void;
}

type Currency = 'UAH' | 'USD' | 'EUR';

interface CalculatorInputs {
  dailyRequests: number;
  adr: number; // Средняя цена за номер в сутки (ADR)
  los: number; // Средняя длительность проживания (LOS)
  otaCommission: number;
  processingCost: number; // Издержки прямого платежа (эквайринг)
  baseDirectShare: number; // Базовая доля прямых бронирований (до Roomie), %
  directShareGrowth: number; // Относительный прирост доли direct, %
  conversionGrowth: number; // Относительный прирост конверсии, %
  currency: Currency;
  // Поля для расчёта дополнительного заработка
  currentBookingsPerMonth: number;
  additionalServiceRevenuePerBooking: number;
}

export function SavingsCalculator({ className = "", onModalToggle }: SavingsCalculatorProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [mobileCalculatorMode, setMobileCalculatorMode] = useState<'info' | 'calculator'>('info');
  const [clickedCurrency, setClickedCurrency] = useState<Currency | null>(null);
  
  const [inputs, setInputs] = useState<CalculatorInputs>({
    dailyRequests: 30,
    adr: 4000, // Средняя цена за номер в сутки
    los: 2, // Средняя длительность проживания в ночах
    otaCommission: 12,
    processingCost: 2.5, // Эквайринг 2.5%
    baseDirectShare: 15, // 15% базовая доля прямых бронирований (фиксировано)
    directShareGrowth: 20, // +20% к доле direct
    conversionGrowth: 0, // Пока 0% прирост конверсии
    currency: 'USD',
    // Поля для расчёта дополнительного заработка
    currentBookingsPerMonth: 0, // Сначала пустое, требует заполнения
    additionalServiceRevenuePerBooking: 0 // Дефолт 0
  });

  // Currency utilities
  const currencySymbols: Record<Currency, string> = {
    UAH: '₴',
    USD: '$',
    EUR: '€'
  };

  const currencyLocales: Record<Currency, string> = {
    UAH: 'uk-UA',
    USD: 'en-US',
    EUR: 'de-DE'
  };

  // Utility functions
  const STORAGE_KEY = 'roomie-calculator-data';

  const saveToLocalStorage = useCallback((data: CalculatorInputs, showToast = false) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      if (showToast) {
        toast({
          title: t("data_saved"),
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, [toast]);

  const loadFromLocalStorage = useCallback((): Partial<CalculatorInputs> => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return {};
    }
  }, []);

  const parseUrlParams = useCallback((): Partial<CalculatorInputs> => {
    const urlParams = new URLSearchParams(window.location.search);
    const params: any = {};
    
    // Parse numeric values
    const numericFields = ['dailyRequests', 'adr', 'los', 'otaCommission', 'processingCost', 'baseDirectShare', 'directShareGrowth', 'conversionGrowth', 'currentBookingsPerMonth', 'additionalServiceRevenuePerBooking'];
    numericFields.forEach(field => {
      const value = urlParams.get(field);
      if (value && !isNaN(Number(value))) {
        params[field] = Number(value);
      }
    });

    // Parse currency
    const currency = urlParams.get('currency') as Currency;
    if (currency && ['UAH', 'USD', 'EUR'].includes(currency)) {
      params.currency = currency;
    }


    return params;
  }, []);

  const generateSharableUrl = useCallback(() => {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    
    Object.entries(inputs).forEach(([key, value]) => {
      params.set(key, value.toString());
    });
    
    return `${baseUrl}?${params.toString()}`;
  }, [inputs]);

  const handleSaveCalculation = useCallback(async () => {
    const url = generateSharableUrl();
    const saveData = { ...inputs };
    
    // Save to localStorage with toast notification
    saveToLocalStorage(saveData, true);
    
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: t("copy_link_success_title"),
        description: t("copy_link_success_desc"),
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast({
        title: t("copy_link_error_title"),
        description: url,
        duration: 5000,
        variant: "destructive"
      });
    }
  }, [generateSharableUrl, toast, inputs, saveToLocalStorage]);

  // Initialize data from URL params or localStorage on component mount
  useEffect(() => {
    const urlParams = parseUrlParams();
    const savedData = loadFromLocalStorage();
    
    // Priority: URL params > localStorage > defaults
    const mergedData = { ...savedData, ...urlParams };
    
    if (Object.keys(mergedData).length > 0) {
      const newInputs = { ...inputs };
      let hasChanges = false;

      // Update inputs
      Object.entries(mergedData).forEach(([key, value]) => {
        if (key in newInputs && value !== newInputs[key as keyof CalculatorInputs]) {
          (newInputs as any)[key] = value;
          hasChanges = true;
        }
      });

      if (hasChanges) {
        setInputs(newInputs);
      }
    }
  }, []); // Run only once on mount

  // Auto-save to localStorage when inputs change (silently)
  useEffect(() => {
    const saveData = { ...inputs };
    saveToLocalStorage(saveData, false); // false = no toast notification
  }, [inputs, saveToLocalStorage]);

  const handleTryRoomie = () => {
    window.open('https://t.me/hotelmolmanager', '_blank');
  };

  const handleHowWeCalculate = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleMobileModal = () => {
    const newState = !showMobileModal;
    setShowMobileModal(newState);
    onModalToggle?.(newState);
  };

  const closeMobileModal = () => {
    setShowMobileModal(false);
    onModalToggle?.(false);
  };

  // Handle Escape key press
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showMobileModal) {
        closeMobileModal();
      }
    };

    if (showMobileModal) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent scrolling on body when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [showMobileModal]);

  // Handle touch gestures for swipe-to-close
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartY) return;
    
    const touchY = e.touches[0].clientY;
    const deltaY = touchY - touchStartY;
    
    // Only allow swipe down from the top area of the modal
    if (deltaY > 100 && touchStartY < 100) {
      closeMobileModal();
      setTouchStartY(null);
    }
  };

  const handleTouchEnd = () => {
    setTouchStartY(null);
  };

  const toggleCalculator = () => {
    setShowCalculator(!showCalculator);
  };

  const updateInput = (field: keyof CalculatorInputs, value: number | Currency) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  // Расчёт экономии
  const calculateSavings = () => {
    const { 
      dailyRequests, 
      adr,
      los,
      otaCommission, 
      processingCost,
      baseDirectShare,
      directShareGrowth,
      conversionGrowth,
      currentBookingsPerMonth,
      additionalServiceRevenuePerBooking
    } = inputs;
    
    // Константы
    const baseConversionRate = 35; // Фиксированная конверсия 35%
    const daysInPeriod = 30; // Полные дни месяца
    const avgBookingRevenue = adr * los; // R = ADR × LOS
    
    // Базовые расчёты
    const B0 = dailyRequests * (baseConversionRate / 100); // Бронирования/день до Roomie
    const B1 = B0 * (1 + conversionGrowth / 100); // Бронирования/день после Roomie
    const s0 = baseDirectShare / 100; // Базовая доля direct
    const s1 = Math.min(1, s0 * (1 + directShareGrowth / 100)); // Новая доля direct
    
    // Экономия на комиссии (только переток OTA → Direct)
    const directOnlyConv = B1 * s0; // Direct если бы только конверсия выросла
    const direct1 = B1 * s1; // Реальный direct после Roomie
    const deltaDirectShift = Math.max(0, direct1 - directOnlyConv); // Переток из OTA
    
    // Экономия комиссии/месяц
    const commissionSavings = deltaDirectShift * avgBookingRevenue * (otaCommission - processingCost) / 100 * daysInPeriod;
    
    // Дополнительная прибыль от прироста бронирований
    const deltaB = B1 - B0; // Прирост бронирований
    const additionalDirectRevenue = deltaB * s1 * avgBookingRevenue * (1 - processingCost / 100) * daysInPeriod;
    const additionalOtaRevenue = deltaB * (1 - s1) * avgBookingRevenue * (1 - otaCommission / 100) * daysInPeriod;
    const additionalRevenueFromConversion = additionalDirectRevenue + additionalOtaRevenue;
    
    // Расчёт дополнительного заработка (фиксированно 8% рост)
    const additionalBookingsPerMonth = currentBookingsPerMonth > 0 ? 
      Math.round(currentBookingsPerMonth * (8 / 100)) : 0;
    
    const additionalRoomRevenue = additionalBookingsPerMonth * avgBookingRevenue;
    const additionalServiceRevenue = additionalBookingsPerMonth * additionalServiceRevenuePerBooking;
    const totalAdditionalEarnings = additionalRoomRevenue + additionalServiceRevenue;
    
    // Общие показатели
    const totalSavings = commissionSavings + additionalRevenueFromConversion;
    
    // Дополнительные показатели
    const additionalDirectBookingsPerMonth = deltaDirectShift * daysInPeriod;
    const totalEffect = totalSavings + totalAdditionalEarnings;
    
    return {
      // Новая структура результатов
      commissionSavings,
      additionalRevenueFromConversion,
      totalSavings,
      additionalDirectBookingsPerMonth,
      // Совместимость со старым интерфейсом (для отображения)
      revenueFromSavedRequests: additionalRevenueFromConversion, // Заменяем на новую логику
      otaSavings: commissionSavings, // Экономия комиссии
      savedRequestsPerMonth: additionalDirectBookingsPerMonth, // Дополнительные direct бронирования
      // Поля для дополнительного заработка
      additionalBookingsPerMonth,
      additionalRoomRevenue,
      additionalServiceRevenue,
      totalAdditionalEarnings,
      totalEffect,
      inputs
    };
  };

  const savings = calculateSavings();

  return (
    <>
      {/* Desktop Sticky Card */}
      <div className={`hidden lg:block ${className}`}>
        <div className="sticky top-24">
          <div className="flex justify-center">
            <Button 
              variant="default"
              onClick={toggleMobileModal}
              className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              data-testid="button-open-fullscreen-calculator"
            >
              {t("calculator_title")}
            </Button>
          </div>
          <Card className="bg-white dark:bg-white border-primary/20 shadow-lg mt-6" style={{ display: 'none' }}>
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2 mb-2">
                <Calculator className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg text-foreground">
                  {t("calculator_title")}
                </CardTitle>
              </div>
              <CardDescription className="text-sm text-muted-foreground">
                {t("calculator_description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-center">
                  <Button 
                    variant="default"
                    onClick={toggleCalculator}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 justify-between min-w-[280px]"
                    data-testid="button-toggle-calculator"
                  >
                    <span>{t("calculate_savings")}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showCalculator ? 'rotate-180' : ''}`} />
                  </Button>
                </div>
                
                <Collapsible open={showCalculator} onOpenChange={setShowCalculator}>
                  <CollapsibleContent>
                    <CalculatorForm 
                      inputs={inputs}
                      onInputChange={updateInput}
                      savings={savings}
                      currencySymbols={currencySymbols}
                      currencyLocales={currencyLocales}
                      onShareCalculation={handleSaveCalculation}
                    />
                  </CollapsibleContent>
                </Collapsible>
                <Button
                  onClick={handleSaveCalculation}
                  variant="outline"
                  size="sm"
                  className="w-full h-10 border-primary/30 text-primary hover:bg-primary/5"
                  data-testid="share-calculation-button"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  <span className="text-sm">{t("share_calculation")}</span>
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
                        <h4 className="font-medium text-foreground mb-1">{t("our_formula")}</h4>
                        <ul className="space-y-1 text-xs">
                          <li>• {t("time_savings_formula")}</li>
                          <li>• {t("direct_bookings_formula")}</li>
                          <li>• {t("ota_commission_formula")}</li>
                          <li>• {t("automation_formula")}</li>
                        </ul>
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
      <div className="lg:hidden mb-6 flex justify-center">
        <Button 
          onClick={toggleMobileModal}
          className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white font-semibold px-6 py-4 text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          data-testid="mobile-savings-banner"
        >
          {t("calculator_title")}
        </Button>
      </div>

      {/* Mobile Modal */}
      <AnimatePresence>
        {showMobileModal && (
          <div 
            className="fixed inset-0 bg-white z-50 flex items-center justify-center"
            data-testid="mobile-modal-backdrop"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              className="w-full h-full bg-white shadow-xl flex flex-col"
              style={{ backgroundColor: 'white' }}
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              data-testid="mobile-modal-content"
            >
              <div className="flex-1 flex flex-col h-full bg-white">
                {/* Swipe indicator */}
                <div className="flex justify-center py-2">
                  <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
                </div>
                
                <div className="flex-1 p-8 overflow-y-auto bg-white max-w-6xl mx-auto w-full">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-3xl font-bold text-foreground">
                    {t("calculator_title_mobile")}
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="lg" 
                    onClick={closeMobileModal}
                    className="hover:bg-gray-100 rounded-full p-2"
                    data-testid="button-close-modal"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>
                

                <div className="space-y-6">
                  <CalculatorForm 
                    inputs={inputs}
                    onInputChange={updateInput}
                    savings={savings}
                    currencySymbols={currencySymbols}
                    currencyLocales={currencyLocales}
                    onShareCalculation={handleSaveCalculation}
                  />
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
  onInputChange: (field: keyof CalculatorInputs, value: number | Currency) => void;
  currencySymbols: Record<Currency, string>;
  currencyLocales: Record<Currency, string>;
  onShareCalculation: () => void;
  savings: {
    // Новая структура результатов
    commissionSavings: number;
    additionalRevenueFromConversion: number;
    totalSavings: number;
    additionalDirectBookingsPerMonth: number;
    // Совместимость со старым интерфейсом
    revenueFromSavedRequests: number;
    otaSavings: number;
    savedRequestsPerMonth: number;
    // Поля для дополнительного заработка
    additionalBookingsPerMonth: number;
    additionalRoomRevenue: number;
    additionalServiceRevenue: number;
    totalAdditionalEarnings: number;
    totalEffect: number;
    inputs: CalculatorInputs;
  };
}

function CalculatorForm({ inputs, onInputChange, savings, currencySymbols, currencyLocales, onShareCalculation }: CalculatorFormProps) {
  const { t } = useLanguage();
  const formatNumber = (num: number) => {
    const symbol = currencySymbols[inputs.currency];
    const rounded = Math.round(num);
    const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return `${formatted} ${symbol}`;
  };

  const inputFields = [
    {
      key: 'currentBookingsPerMonth' as keyof CalculatorInputs,
      label: t('bookings_per_month_current'),
      tooltip: 'Сколько бронирований вы получаете в месяц сейчас? Это базовое число для расчёта дополнительного заработка',
      suffix: t('bookings_suffix'),
      placeholder: 'например, 200',
      required: true
    },
    {
      key: 'dailyRequests' as keyof CalculatorInputs,
      label: t('daily_requests_label'),
      tooltip: 'Сколько в среднем обращений приходит в день из сайта, мессенджеров и телефона? Если не уверены — оставьте 30',
      suffix: t('requests_suffix')
    },
    {
      key: 'adr' as keyof CalculatorInputs,
      label: t('adr_label'),
      tooltip: 'Средняя цена за номер в сутки без учёта налогов и допуслуг. Это база для расчёта комиссий OTA',
      prefix: currencySymbols[inputs.currency]
    },
    {
      key: 'los' as keyof CalculatorInputs,
      label: t('average_stay_duration'),
      tooltip: 'Сколько ночей в среднем проводят ваши гости? Обычно 1-3 ночи для городских отелей, 3-7 для курортных',
      suffix: t('nights_suffix')
    },
    {
      key: 'directShareGrowth' as keyof CalculatorInputs,
      label: t('direct_share_growth_label'),
      tooltip: 'На сколько процентов Roomie увеличит долю прямых бронирований за счёт качественного сервиса? Обычно +15-25%',
      suffix: '%',
      advanced: true
    },
    {
      key: 'processingCost' as keyof CalculatorInputs,
      label: t('processing_cost_label'),
      tooltip: 'Комиссия банка за обработку платежей на вашем сайте. Обычно 2-3%',
      suffix: '%',
      advanced: true
    },
    {
      key: 'additionalServiceRevenuePerBooking' as keyof CalculatorInputs,
      label: t('additional_service_revenue_label'),
      tooltip: 'Дополнительные услуги (трансферы, экскурсии, питание), которые вы продаёте дополнительным гостям. Если таких услуг нет — оставьте 0',
      prefix: currencySymbols[inputs.currency],
      advanced: true
    },
    {
      key: 'otaCommission' as keyof CalculatorInputs,
      label: t('ota_commission_label'),
      tooltip: 'Какую комиссию платите сайтам бронирования (Booking.com, Airbnb)? Обычно 10-15%',
      suffix: '%'
    }
  ];

  return (
    <TooltipProvider>
      <div className="space-y-6 mt-4 pt-4 border-t border-primary/20">
        {/* Выбор валюты */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">{t("currency_label")}</Label>
          <div className="flex bg-muted rounded-md p-1" data-testid="currency-switcher">
            {(['UAH', 'USD', 'EUR'] as Currency[]).map((currency) => (
              <motion.button
                key={currency}
                onClick={() => {
                  onInputChange('currency', currency as any);
                }}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-sm transition-all duration-300 ${
                  inputs.currency === currency
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 border-2 border-blue-400'
                    : 'bg-muted hover:bg-muted-foreground/10 border-2 border-transparent'
                }`}
                data-testid={`currency-${currency.toLowerCase()}`}
                whileTap={{ scale: 0.95 }}
              >
                {currency}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Поля ввода */}
        <div className="grid gap-6">
          {inputFields.filter((field) => !(field as any).advanced).map((field) => (
            <div key={field.key} className="space-y-3">
              <div className="flex items-center space-x-2">
                <Label className={`text-sm font-medium text-foreground ${(field as any).required ? 'font-semibold' : ''}`}>
                  {field.label}
                  {(field as any).required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-700 dark:border-gray-300 shadow-lg">
                    <p className="text-xs font-medium">{field.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="relative">
                {field.prefix && (
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                    {field.prefix}
                  </span>
                )}
                <Input
                  type="number"
                  min="0"
                  value={inputs[field.key]}
                  onChange={(e) => onInputChange(field.key, Math.max(0, parseFloat(e.target.value) || 0))}
                  className={`text-base h-12 ${field.prefix ? 'pl-8' : ''} ${field.suffix ? 'pr-20' : ''} ${(field as any).required && inputs[field.key] === 0 ? 'border-red-300' : ''}`}
                  placeholder={(field as any).placeholder}
                  data-testid={`input-${field.key}`}
                />
                {field.suffix && (
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                    {field.suffix}
                  </span>
                )}
              </div>
            </div>
          ))}

        </div>

        {/* Новая итоговая панель */}
        <div className="space-y-4 pt-4 border-t border-primary/20">
          {/* Проверка заполнения обязательного поля */}
          {inputs.currentBookingsPerMonth === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center border border-gray-200" data-testid="empty-bookings-hint">
              <p className="text-base text-muted-foreground leading-relaxed">
                {t('enter_bookings_message')}
              </p>
            </div>
          ) : (
            <>
              {/* Основные крупные цифры */}
              <div className="grid grid-cols-2 gap-6">
                {/* Экономия/мес */}
                <div className="bg-white border-2 border-green-200 rounded-xl p-6 text-center" data-testid="main-savings-monthly">
                  <div className="text-sm text-muted-foreground mb-2 font-medium">{t('savings_per_month')}</div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatNumber(savings.totalSavings)}</div>
                </div>

                {/* Дополнительный заработок/мес */}
                <div className="bg-white border-2 border-blue-200 rounded-xl p-6 text-center" data-testid="main-additional-earnings">
                  <div className="text-sm text-muted-foreground mb-2 font-medium">{t('additional_earnings_per_month')}</div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatNumber(savings.totalAdditionalEarnings)}</div>
                  
                  {/* Пояснительный текст под цифрой */}
                  <div className="text-sm text-muted-foreground mt-3 leading-relaxed">
                    {t('additional_earnings_explanation')}
                    <br />
                    <span className="font-semibold">{t('additional_bookings_per_month')}: {savings.additionalBookingsPerMonth}</span>
                  </div>
                </div>
              </div>

              {/* Итого эффект */}
              <div className="bg-white rounded-xl p-6 text-center border-2 border-primary/30" data-testid="total-effect">
                <div className="text-base text-muted-foreground mb-2 font-semibold">{t('total_effect_per_month')}</div>
                <div className="text-3xl font-bold text-primary">
                  {formatNumber(savings.totalEffect)}
                </div>
                <div className="text-sm text-muted-foreground mt-3 leading-relaxed">
                  {t('savings_plus_additional_earnings')}
                </div>
              </div>


            </>
          )}
        </div>

        {/* Блок доверия и конверсии */}
        <TrustAndConversionBlock 
          savings={savings}
          currency={inputs.currency}
          onShareCalculation={onShareCalculation}
        />
      </div>
    </TooltipProvider>
  );
}

interface TrustAndConversionBlockProps {
  savings: any;
  currency: Currency;
  onShareCalculation: () => void;
}

function TrustAndConversionBlock({ savings, currency, onShareCalculation }: TrustAndConversionBlockProps) {
  const { t } = useLanguage();
  const [isHowWeCountExpanded, setIsHowWeCountExpanded] = useState(false);

  const currencySymbols: Record<Currency, string> = {
    UAH: '₴', 
    USD: '$',
    EUR: '€'
  };

  const formatNumber = (num: number) => {
    const symbol = currencySymbols[currency];
    const rounded = Math.round(num);
    const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return `${formatted} ${symbol}`;
  };

  // Простые визуализации сравнения
  const humanCosts = [
    { label: t('ota_commissions'), value: savings.otaSavings || 0 },
    { label: t('additional_earnings_per_month'), value: savings.totalAdditionalEarnings || 0 }
  ];

  const totalHumanCosts = humanCosts.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6 pt-6 border-t border-primary/20" data-testid="trust-conversion-block">
      {/* Раскрывающийся блок "Как мы считаем?" */}
      <Collapsible open={isHowWeCountExpanded} onOpenChange={setIsHowWeCountExpanded}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-between p-0 h-auto text-left"
            data-testid="toggle-how-we-count"
          >
            <h4 className="text-lg font-medium text-foreground">{t("how_we_calculate")}</h4>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isHowWeCountExpanded ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-4" data-testid="how-we-count-content">
          <div className="bg-primary/5 rounded-lg p-4 space-y-3">
            <p className="text-sm text-foreground leading-relaxed">
              <strong>{t('simple_words')}</strong> {t('formula_explanation_main')}
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              {t('formula_explanation_additional')}
            </p>
          </div>

          {/* Текст о честности */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-amber-800 dark:text-amber-200">{t('trust_title')}</h5>
                <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                  {t('trust_description')}
                </p>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Простые визуализации сравнения */}
      {savings.totalSavings > 0 && (
        <div className="space-y-4">
          <h5 className="text-sm font-medium text-foreground">{t('costs_comparison')}</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Расходы без Roomie */}
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4" data-testid="costs-without-roomie">
              <h6 className="text-xs font-medium text-red-700 dark:text-red-300 mb-3">
                {t('losses_without_ai')}
              </h6>
              <div className="space-y-2">
                {humanCosts.map((cost, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{cost.label}</span>
                    <span className="text-sm font-medium text-red-600">{formatNumber(cost.value)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">{t('total_losses')}</span>
                    <span className="text-sm font-bold text-red-600">{formatNumber(totalHumanCosts)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Общая экономия */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4" data-testid="total-savings">
              <h6 className="text-xs font-medium text-green-700 dark:text-green-300 mb-3">{t('total_savings_and_additional_earnings')}</h6>
              <div className="border-t pt-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">{t('savings_plus_additional_earnings_short')}</span>
                  <span className="text-sm font-bold text-green-600">{formatNumber(totalHumanCosts)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* CTA блок */}
      <div className="space-y-4 pt-2">
        {/* Основная CTA кнопка */}
        <Button 
          asChild
          size="lg" 
          className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white border-0"
          data-testid="cta-try-roomie"
        >
          <a 
            href="https://t.me/hotelmolmanager" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center"
          >
            <span>{t('try_roomie')}</span>
          </a>
        </Button>

        {/* Кнопка поделиться расчетом */}
        <Button
          onClick={onShareCalculation}
          variant="outline"
          size="lg"
          className="w-full h-12 border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/20"
          data-testid="cta-share-calculation"
        >
          <Copy className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">{t('share_calculation')}</span>
        </Button>

        {/* Дополнительный текст */}
        <p className="text-xs text-center text-muted-foreground leading-relaxed">
          {t('contact_manager_text')}
        </p>
      </div>
    </div>
  );
}