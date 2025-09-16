import { useState, useEffect, useCallback } from "react";
import { Calculator, ChevronDown, X, Info, Copy, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

type Currency = 'UAH' | 'USD' | 'EUR';

interface CalculatorInputs {
  dailyRequests: number;
  avgBookingRevenue: number;
  lostRequestsPercent: number;
  conversionRate: number;
  otaCommission: number;
  adminSalary: number;
  roomieCost: number;
  workingDays: number;
  currency: Currency;
  // Новые поля для расчёта дополнительного заработка
  currentBookingsPerMonth: number;
  bookingIncreasePercent: number;
  additionalServiceRevenuePerBooking: number;
}

export function SavingsCalculator({ className = "" }: SavingsCalculatorProps) {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
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
    workingDays: 22,
    currency: 'USD',
    // Новые поля для расчёта дополнительного заработка
    currentBookingsPerMonth: 0, // Сначала пустое, требует заполнения
    bookingIncreasePercent: 4, // Дефолт 4%
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

  const saveToLocalStorage = useCallback((data: CalculatorInputs & { mode: string }, showToast = false) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      if (showToast) {
        toast({
          title: "Данные сохранены на этом устройстве",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, [toast]);

  const loadFromLocalStorage = useCallback((): Partial<CalculatorInputs & { mode: string }> => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return {};
    }
  }, []);

  const parseUrlParams = useCallback((): Partial<CalculatorInputs & { mode: string }> => {
    const urlParams = new URLSearchParams(window.location.search);
    const params: any = {};
    
    // Parse numeric values
    const numericFields = ['dailyRequests', 'avgBookingRevenue', 'lostRequestsPercent', 'conversionRate', 'otaCommission', 'adminSalary', 'roomieCost', 'workingDays', 'currentBookingsPerMonth', 'bookingIncreasePercent', 'additionalServiceRevenuePerBooking'];
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

    // Parse mode
    const modeParam = urlParams.get('mode');
    if (modeParam && ['replace', 'assist'].includes(modeParam)) {
      params.mode = modeParam;
    }

    return params;
  }, []);

  const generateSharableUrl = useCallback(() => {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    
    Object.entries(inputs).forEach(([key, value]) => {
      params.set(key, value.toString());
    });
    params.set('mode', mode);
    
    return `${baseUrl}?${params.toString()}`;
  }, [inputs, mode]);

  const handleSaveCalculation = useCallback(async () => {
    const url = generateSharableUrl();
    const saveData = { ...inputs, mode };
    
    // Save to localStorage with toast notification
    saveToLocalStorage(saveData, true);
    
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Ссылка скопирована",
        description: "Поделитесь расчётом с коллегами",
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast({
        title: "Не удалось скопировать ссылку — сделайте это вручную",
        description: url,
        duration: 5000,
        variant: "destructive"
      });
    }
  }, [generateSharableUrl, toast, inputs, mode, saveToLocalStorage]);

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
        if (key === 'mode') {
          if (value !== mode) {
            setMode(value as 'replace' | 'assist');
          }
        } else if (key in newInputs && value !== newInputs[key as keyof CalculatorInputs]) {
          (newInputs as any)[key] = value;
          hasChanges = true;
        }
      });

      if (hasChanges) {
        setInputs(newInputs);
      }
    }
  }, []); // Run only once on mount

  // Auto-save to localStorage when inputs or mode change (silently)
  useEffect(() => {
    const saveData = { ...inputs, mode };
    saveToLocalStorage(saveData, false); // false = no toast notification
  }, [inputs, mode, saveToLocalStorage]);

  const handleTryRoomie = () => {
    window.open('https://t.me/hotelmindmanager', '_blank');
  };

  const handleHowWeCalculate = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleMobileModal = () => {
    setShowMobileModal(!showMobileModal);
  };

  const closeMobileModal = () => {
    setShowMobileModal(false);
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
      avgBookingRevenue, 
      lostRequestsPercent, 
      conversionRate, 
      otaCommission, 
      adminSalary, 
      roomieCost, 
      workingDays,
      currentBookingsPerMonth,
      bookingIncreasePercent,
      additionalServiceRevenuePerBooking
    } = inputs;
    
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
    
    // Расчёт дополнительного заработка
    const additionalBookingsPerMonth = currentBookingsPerMonth > 0 ? 
      Math.round(currentBookingsPerMonth * (bookingIncreasePercent / 100)) : 0;
    
    const additionalRoomRevenue = additionalBookingsPerMonth * avgBookingRevenue;
    const additionalServiceRevenue = additionalBookingsPerMonth * additionalServiceRevenuePerBooking;
    const totalAdditionalEarnings = additionalRoomRevenue + additionalServiceRevenue;
    
    const totalSavings = revenueFromSavedRequests + otaSavings + timeSavings + salarySavings - roomieCost;
    const roi = totalSavings > 0 ? (totalSavings / roomieCost) * 100 : 0;
    
    // Дополнительные показатели
    const savedRequestsPerMonth = savedRequests * workingDays;
    const additionalDirectBookingsPerMonth = directBookingIncrease * workingDays;
    const totalEffect = totalSavings + totalAdditionalEarnings;
    const paybackDays = totalEffect > 0 ? Math.ceil((roomieCost / (totalEffect / 30))) : 0;
    
    return {
      revenueFromSavedRequests,
      otaSavings,
      timeSavings,
      salarySavings,
      totalSavings,
      roi,
      savedRequestsPerMonth,
      additionalDirectBookingsPerMonth,
      paybackDays,
      // Новые поля для дополнительного заработка
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
                <div className="flex justify-center">
                  <Button 
                    variant="default"
                    onClick={toggleCalculator}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 justify-between min-w-[280px]"
                    data-testid="button-toggle-calculator"
                  >
                    <span>Рассчитать мою экономию</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showCalculator ? 'rotate-180' : ''}`} />
                  </Button>
                </div>
                
                <Collapsible open={showCalculator} onOpenChange={setShowCalculator}>
                  <CollapsibleContent>
                    <CalculatorForm 
                      inputs={inputs}
                      mode={mode}
                      onInputChange={updateInput}
                      onModeChange={setMode}
                      savings={savings}
                      currencySymbols={currencySymbols}
                      currencyLocales={currencyLocales}
                      onShareCalculation={handleSaveCalculation}
                    />
                  </CollapsibleContent>
                </Collapsible>
                
                {/* Currency Switcher & Save Button */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-foreground">Валюта</Label>
                    <div className="flex bg-muted rounded-md p-1" data-testid="currency-switcher">
                      {(['UAH', 'USD', 'EUR'] as Currency[]).map((currency) => (
                        <button
                          key={currency}
                          onClick={() => updateInput('currency', currency as any)}
                          className={`flex-1 px-2 py-1 text-xs rounded-sm transition-colors ${
                            inputs.currency === currency
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted-foreground/10'
                          }`}
                          data-testid={`currency-${currency.toLowerCase()}`}
                        >
                          {currency}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-foreground">Поделиться</Label>
                    <Button
                      onClick={handleSaveCalculation}
                      variant="outline"
                      size="sm"
                      className="w-full h-8 px-3 border-primary/30 text-primary hover:bg-primary/5"
                      data-testid="button-save-calculation"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      <span className="text-xs">Скопировать</span>
                    </Button>
                  </div>
                </div>
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
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={closeMobileModal}
            data-testid="mobile-modal-backdrop"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              className="w-full h-full bg-card shadow-xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              data-testid="mobile-modal-content"
            >
              <div className="flex-1 flex flex-col h-full">
                {/* Swipe indicator */}
                <div className="flex justify-center py-2">
                  <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
                </div>
                
                <div className="flex-1 p-6 overflow-y-auto">
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
                    onClick={closeMobileModal}
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
                  {/* Currency Switcher & Save Button Mobile */}
                  <div className="space-y-3 mb-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-foreground">Валюта</Label>
                      <div className="flex bg-muted rounded-md p-1" data-testid="mobile-currency-switcher">
                        {(['UAH', 'USD', 'EUR'] as Currency[]).map((currency) => (
                          <button
                            key={currency}
                            onClick={() => updateInput('currency', currency as any)}
                            className={`flex-1 px-2 py-1 text-xs rounded-sm transition-colors ${
                              inputs.currency === currency
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-muted-foreground/10'
                            }`}
                            data-testid={`mobile-currency-${currency.toLowerCase()}`}
                          >
                            {currency}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-foreground">Поделиться</Label>
                      <Button
                        onClick={handleSaveCalculation}
                        variant="outline"
                        size="sm"
                        className="w-full h-8 px-3 border-primary/30 text-primary hover:bg-primary/5"
                        data-testid="button-mobile-save-calculation"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        <span className="text-xs">Скопировать</span>
                      </Button>
                    </div>
                  </div>

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
                        currencySymbols={currencySymbols}
                        currencyLocales={currencyLocales}
                        onShareCalculation={handleSaveCalculation}
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
                      onClick={closeMobileModal}
                      className="w-full"
                      data-testid="button-mobile-close"
                    >
                      Закрыть
                    </Button>
                  </div>
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
  onInputChange: (field: keyof CalculatorInputs, value: number | Currency) => void;
  onModeChange: (mode: 'replace' | 'assist') => void;
  currencySymbols: Record<Currency, string>;
  currencyLocales: Record<Currency, string>;
  onShareCalculation: () => void;
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
    // Новые поля для дополнительного заработка
    additionalBookingsPerMonth: number;
    additionalRoomRevenue: number;
    additionalServiceRevenue: number;
    totalAdditionalEarnings: number;
    totalEffect: number;
    inputs: CalculatorInputs;
  };
}

function CalculatorForm({ inputs, mode, onInputChange, onModeChange, savings, currencySymbols, currencyLocales, onShareCalculation }: CalculatorFormProps) {
  const formatNumber = (num: number) => {
    const symbol = currencySymbols[inputs.currency];
    const rounded = Math.round(num);
    const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return `${formatted} ${symbol}`;
  };

  const inputFields = [
    {
      key: 'currentBookingsPerMonth' as keyof CalculatorInputs,
      label: 'Брони в месяц (сейчас)',
      tooltip: 'Сколько бронирований вы получаете в месяц сейчас? Это базовое число для расчёта дополнительного заработка',
      suffix: 'брони',
      placeholder: 'например, 200',
      required: true
    },
    {
      key: 'dailyRequests' as keyof CalculatorInputs,
      label: 'Обращений в день',
      tooltip: 'Сколько в среднем обращений приходит в день из сайта, мессенджеров и телефона? Если не уверены — оставьте 30',
      suffix: 'обращений'
    },
    {
      key: 'avgBookingRevenue' as keyof CalculatorInputs,
      label: 'Средняя выручка с брони (ADR×ночи)',
      tooltip: 'Какую среднюю сумму отель получает с одного бронирования? Считайте полную стоимость проживания',
      prefix: currencySymbols[inputs.currency]
    },
    {
      key: 'bookingIncreasePercent' as keyof CalculatorInputs,
      label: 'Увеличение бронирований с Roomie, %',
      tooltip: 'Рост за счёт ответов ночью/в нерабочее время и более быстрой реакции. Наш базовый сценарий для отелей — 4%',
      suffix: '%'
    },
    {
      key: 'additionalServiceRevenuePerBooking' as keyof CalculatorInputs,
      label: 'Доп. доход от услуг на одну доп. бронь',
      tooltip: 'Дополнительные услуги (трансферы, экскурсии, питание), которые вы продаёте дополнительным гостям. Если таких услуг нет — оставьте 0',
      prefix: currencySymbols[inputs.currency],
      advanced: true
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
      prefix: currencySymbols[inputs.currency],
      suffix: '/мес'
    },
    {
      key: 'roomieCost' as keyof CalculatorInputs,
      label: 'Стоимость Roomie',
      tooltip: 'Выберите подходящий тариф Roomie из представленных выше планов',
      prefix: currencySymbols[inputs.currency],
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
          {inputFields.filter((field) => !(field as any).advanced).map((field) => (
            <div key={field.key} className="space-y-1">
              <div className="flex items-center space-x-1">
                <Label className={`text-xs text-foreground ${(field as any).required ? 'font-semibold' : ''}`}>
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
                  <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                    {field.prefix}
                  </span>
                )}
                <Input
                  type="number"
                  value={inputs[field.key]}
                  onChange={(e) => onInputChange(field.key, parseFloat(e.target.value) || 0)}
                  className={`text-xs h-8 ${field.prefix ? 'pl-6' : ''} ${field.suffix ? 'pr-16' : ''} ${(field as any).required && inputs[field.key] === 0 ? 'border-red-300' : ''}`}
                  placeholder={(field as any).placeholder}
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

          {/* Раскрываемое дополнительное поле */}
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full text-xs justify-start p-0 h-auto">
                <span className="text-muted-foreground">+ Дополнительные параметры</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-3 space-y-4">
                {inputFields.filter((field) => (field as any).advanced).map((field) => (
                  <div key={field.key} className="space-y-1">
                    <div className="flex items-center space-x-1">
                      <Label className="text-xs text-foreground">{field.label}</Label>
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
                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                          {field.prefix}
                        </span>
                      )}
                      <Input
                        type="number"
                        value={inputs[field.key]}
                        onChange={(e) => onInputChange(field.key, parseFloat(e.target.value) || 0)}
                        className={`text-xs h-8 ${field.prefix ? 'pl-6' : ''} ${field.suffix ? 'pr-16' : ''}`}
                        placeholder={(field as any).placeholder}
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
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Новая итоговая панель */}
        <div className="space-y-4 pt-4 border-t border-primary/20">
          {/* Проверка заполнения обязательного поля */}
          {inputs.currentBookingsPerMonth === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4 text-center" data-testid="empty-bookings-hint">
              <p className="text-sm text-muted-foreground">
                Введите ваши брони, чтобы увидеть точные цифры
              </p>
            </div>
          ) : (
            <>
              {/* Основные крупные цифры */}
              <div className="grid grid-cols-2 gap-4">
                {/* Экономия/мес */}
                <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30 rounded-lg p-4 text-center" data-testid="main-savings-monthly">
                  <div className="text-xs text-muted-foreground mb-1">Экономия/мес</div>
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">{formatNumber(savings.totalSavings)}</div>
                </div>

                {/* Дополнительный заработок/мес */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 rounded-lg p-4 text-center" data-testid="main-additional-earnings">
                  <div className="text-xs text-muted-foreground mb-1">Дополнительный заработок/мес</div>
                  {inputs.bookingIncreasePercent === 0 ? (
                    <div className="text-xl font-bold text-gray-500">0 {currencySymbols[inputs.currency]}</div>
                  ) : (
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatNumber(savings.totalAdditionalEarnings)}</div>
                  )}
                  
                  {/* Пояснительный текст под цифрой */}
                  {inputs.bookingIncreasePercent === 0 ? (
                    <div className="text-xs text-muted-foreground mt-2">
                      Наш базовый сценарий — 4% для отелей, где часть обращений уходит ночью
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground mt-2">
                      +{inputs.bookingIncreasePercent}% к вашим бронированиям за счёт ответов ночью и без очередей в пике
                      <br />
                      <span className="font-medium">Доп. брони/мес: {savings.additionalBookingsPerMonth}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Итого эффект */}
              <div className="bg-gradient-to-r from-primary/10 to-orange-100 dark:from-primary/20 dark:to-orange-900/30 rounded-lg p-4 text-center border-2 border-primary/20" data-testid="total-effect">
                <div className="text-sm text-muted-foreground mb-1">Итого эффект/мес</div>
                <div className="text-2xl font-bold text-primary">
                  {formatNumber(savings.totalEffect)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Экономия + Дополнительный заработок - Стоимость Roomie
                </div>
              </div>

              {/* Окупаемость и ROI */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-primary/10 rounded-lg p-3 text-center" data-testid="main-payback">
                  <div className="text-xs text-muted-foreground mb-1">Окупаемость</div>
                  <div className="text-lg font-bold text-primary">{savings.paybackDays} дн.</div>
                </div>
                <div className="bg-primary/10 rounded-lg p-3 text-center" data-testid="main-roi">
                  <div className="text-xs text-muted-foreground mb-1">ROI</div>
                  <div className="text-lg font-bold text-primary">{((savings.totalEffect / inputs.roomieCost) * 100).toFixed(0)}%</div>
                </div>
              </div>

              {/* Детализация */}
              <details className="space-y-2">
                <summary className="text-xs font-medium text-foreground cursor-pointer hover:text-primary">Детализация расчётов</summary>
                <div className="space-y-2 text-xs mt-2" data-testid="calculation-details">
                  <div className="font-medium text-foreground border-b pb-1 mb-2">Экономия:</div>
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
                  
                  <div className="font-medium text-foreground border-b pb-1 mb-2 mt-3">Дополнительный заработок:</div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Доп. брони в месяц:</span>
                    <span className="font-medium text-blue-600">{savings.additionalBookingsPerMonth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Доп. оборот (номера):</span>
                    <span className="font-medium text-blue-600">{formatNumber(savings.additionalRoomRevenue)}</span>
                  </div>
                  {savings.additionalServiceRevenue > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Доп. оборот (услуги):</span>
                      <span className="font-medium text-blue-600">{formatNumber(savings.additionalServiceRevenue)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between border-t pt-1 mt-2">
                    <span className="text-muted-foreground">Стоимость Roomie:</span>
                    <span className="font-medium text-red-500">-{formatNumber(inputs.roomieCost)}</span>
                  </div>
                </div>
              </details>
            </>
          )}
        </div>

        {/* Блок доверия и конверсии */}
        <TrustAndConversionBlock 
          savings={savings}
          currency={inputs.currency}
          mode={mode}
          onShareCalculation={onShareCalculation}
        />
      </div>
    </TooltipProvider>
  );
}

interface TrustAndConversionBlockProps {
  savings: any;
  currency: Currency;
  mode: 'replace' | 'assist';
  onShareCalculation: () => void;
}

function TrustAndConversionBlock({ savings, currency, mode, onShareCalculation }: TrustAndConversionBlockProps) {
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
  const humanCosts = mode === 'replace' ? [
    { label: 'Зарплата в месяц', value: savings.inputs?.adminSalary || 45000 },
    { label: 'Пропущенные брони', value: savings.revenueFromSavedRequests || 0 },
    { label: 'Комиссии OTA', value: savings.otaSavings || 0 }
  ] : [
    { label: 'Пропущенные брони', value: savings.revenueFromSavedRequests || 0 },
    { label: 'Комиссии OTA', value: savings.otaSavings || 0 },
    { label: 'Время на ответы', value: savings.timeSavings || 0 }
  ];

  const roomieCosts = [
    { label: 'Стоимость Roomie', value: savings.inputs?.roomieCost || 35910 }
  ];

  const totalHumanCosts = humanCosts.reduce((sum, item) => sum + item.value, 0);
  const totalRoomieCosts = roomieCosts.reduce((sum, item) => sum + item.value, 0);

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
            <h4 className="text-sm font-medium text-foreground">Как мы считаем?</h4>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isHowWeCountExpanded ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-4" data-testid="how-we-count-content">
          <div className="bg-primary/5 rounded-lg p-4 space-y-3">
            <p className="text-sm text-foreground leading-relaxed">
              <strong>Простыми словами:</strong> Мы берём ваши обращения в месяц, вычитаем долю пропусков у человека и у ИИ, 
              умножаем на конверсию в бронирование и средний чек. Разница — это дополнительная выручка.
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              Плюс экономия на комиссионных OTA и рост допродаж. {mode === 'replace' ? 'Плюс экономия на зарплате администратора. ' : ''}
              Минус — стоимость Roomie.
            </p>
            
            {/* Формула по-человечески */}
            <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg p-3 space-y-2">
              <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Формула расчёта</h5>
              <div className="text-sm space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-green-600">+ Дополнительная выручка</span>
                  <span className="text-xs text-muted-foreground">(спасённые заявки × конверсия × средний чек)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-green-600">+ Экономия на OTA</span>
                  <span className="text-xs text-muted-foreground">(прямые брони × комиссия)</span>
                </div>
                {mode === 'replace' && (
                  <div className="flex items-center justify-between">
                    <span className="text-green-600">+ Экономия на зарплате</span>
                    <span className="text-xs text-muted-foreground">(частичная замена администратора)</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t pt-1 mt-2">
                  <span className="text-red-500">- Стоимость Roomie</span>
                  <span className="text-xs text-muted-foreground">(ежемесячная подписка)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Текст о честности */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-amber-800 dark:text-amber-200">О честности расчётов</h5>
                <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                  Если ваши цифры покажут нулевой эффект — это тоже результат. Мы не продаём чудеса, мы считаем.
                  Наша задача — показать реальную картину, а не завлечь красивыми обещаниями.
                </p>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Простые визуализации сравнения */}
      {savings.totalSavings > 0 && (
        <div className="space-y-4">
          <h5 className="text-sm font-medium text-foreground">Сравнение расходов</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Расходы без Roomie */}
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4" data-testid="costs-without-roomie">
              <h6 className="text-xs font-medium text-red-700 dark:text-red-300 mb-3">
                {mode === 'replace' ? 'Расходы человека' : 'Потери без ИИ'}
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
                    <span className="text-xs font-medium text-foreground">Итого потерь</span>
                    <span className="text-sm font-bold text-red-600">{formatNumber(totalHumanCosts)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Расходы с Roomie */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4" data-testid="costs-with-roomie">
              <h6 className="text-xs font-medium text-green-700 dark:text-green-300 mb-3">Расходы с Roomie</h6>
              <div className="space-y-2">
                {roomieCosts.map((cost, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{cost.label}</span>
                    <span className="text-sm font-medium text-green-600">{formatNumber(cost.value)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">Экономия</span>
                    <span className="text-sm font-bold text-green-600">{formatNumber(totalHumanCosts - totalRoomieCosts)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Чек-лист советов */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-3" data-testid="tips-checklist">
        <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200">Как повысить выгоду от Roomie:</h5>
        <div className="space-y-2">
          {[
            "Настройте быстрые ответы на частые вопросы — снизите время реакции",
            "Обучите Roomie предлагать доп.услуги (трансфер, экскурсии) — увеличите средний чек",
            "Используйте ночной режим — не теряйте заявки в нерабочие часы",
            "Ведите статистику пропусков — оптимизируйте настройки под свой отель",
            "Настройте переход к прямой броне — снижайте комиссии OTA"
          ].map((tip, index) => (
            <div key={index} className="flex items-start space-x-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              <span className="text-xs text-blue-700 dark:text-blue-300">{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA блок */}
      <div className="space-y-4 pt-2">
        {/* Основная CTA кнопка */}
        <Button 
          asChild
          size="lg" 
          className="w-full h-12 text-base font-medium"
          data-testid="cta-try-roomie"
        >
          <a 
            href="https://t.me/hotelmindmanager" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2"
          >
            <span>Попробовать Roomie</span>
            <DollarSign className="h-5 w-5" />
          </a>
        </Button>

        {/* Вторичная ссылка */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onShareCalculation}
          className="w-full text-sm h-10"
          data-testid="cta-share-with-manager"
        >
          <Copy className="h-4 w-4 mr-2" />
          Показать расчёт руководителю
        </Button>

        {/* Дополнительный текст */}
        <p className="text-xs text-center text-muted-foreground leading-relaxed">
          Нажмите "Попробовать Roomie" для связи с нашим менеджером. 
          Или поделитесь этим расчётом с руководителем для принятия решения.
        </p>
      </div>
    </div>
  );
}