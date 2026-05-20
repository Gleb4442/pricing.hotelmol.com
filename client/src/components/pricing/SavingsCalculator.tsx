import { useCallback, useEffect, useState } from "react";
import { BedDouble, Calculator, ChevronDown, Copy, Info, TrendingUp, Utensils, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { motion, AnimatePresence } from "framer-motion";

interface SavingsCalculatorProps {
  className?: string;
  onModalToggle?: (isOpen: boolean) => void;
}

interface CalculatorInputs {
  rooms: number;
}

interface RoiSource {
  id: "ota" | "fb" | "upsell";
  label: string;
  perRoom: number;
  value: number;
  icon: LucideIcon;
}

interface RoiResults {
  rooms: number;
  monthlyIncome: number;
  annualIncome: number;
  sources: RoiSource[];
}

const ROI_PER_ROOM = {
  ota: 53,
  fb: 80,
  upsell: 50,
};

const STORAGE_KEY = "roomie-calculator-data";

export function SavingsCalculator({ className = "", onModalToggle }: SavingsCalculatorProps) {
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [inputs, setInputs] = useState<CalculatorInputs>({ rooms: 50 });

  const formatCurrency = useCallback(
    (value: number) => {
      return new Intl.NumberFormat(language === "en" ? "en-US" : "ru-RU", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }).format(value);
    },
    [language],
  );

  const calculateRoi = useCallback((): RoiResults => {
    const rooms = Number.isFinite(inputs.rooms) && inputs.rooms > 0 ? inputs.rooms : 0;
    const sources: RoiSource[] = [
      {
        id: "ota",
        label: t("roi.calculator.source1"),
        perRoom: ROI_PER_ROOM.ota,
        value: ROI_PER_ROOM.ota * rooms,
        icon: TrendingUp,
      },
      {
        id: "fb",
        label: t("roi.calculator.source2"),
        perRoom: ROI_PER_ROOM.fb,
        value: ROI_PER_ROOM.fb * rooms,
        icon: Utensils,
      },
      {
        id: "upsell",
        label: t("roi.calculator.source3"),
        perRoom: ROI_PER_ROOM.upsell,
        value: ROI_PER_ROOM.upsell * rooms,
        icon: BedDouble,
      },
    ];
    const monthlyIncome = sources.reduce((sum, source) => sum + source.value, 0);

    return {
      rooms,
      monthlyIncome,
      annualIncome: monthlyIncome * 12,
      sources,
    };
  }, [inputs.rooms, t]);

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
      console.error("Failed to save to localStorage:", error);
    }
  }, [toast, t]);

  const loadFromLocalStorage = useCallback((): Partial<CalculatorInputs> => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return {};

      const data = JSON.parse(saved);
      return typeof data.rooms === "number" ? { rooms: data.rooms } : {};
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
      return {};
    }
  }, []);

  const parseUrlParams = useCallback((): Partial<CalculatorInputs> => {
    const urlParams = new URLSearchParams(window.location.search);
    const rooms = Number(urlParams.get("rooms"));
    return Number.isFinite(rooms) && rooms >= 0 ? { rooms } : {};
  }, []);

  const generateSharableUrl = useCallback(() => {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    params.set("rooms", inputs.rooms.toString());
    return `${baseUrl}?${params.toString()}`;
  }, [inputs.rooms]);

  const handleSaveCalculation = useCallback(async () => {
    const url = generateSharableUrl();

    saveToLocalStorage(inputs, true);

    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: t("copy_link_success_title"),
        description: t("copy_link_success_desc"),
        duration: 3000,
      });
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast({
        title: t("copy_link_error_title"),
        description: url,
        duration: 5000,
        variant: "destructive",
      });
    }
  }, [generateSharableUrl, inputs, saveToLocalStorage, toast, t]);

  useEffect(() => {
    const urlParams = parseUrlParams();
    const savedData = loadFromLocalStorage();
    const mergedData = { ...savedData, ...urlParams };

    if (typeof mergedData.rooms === "number") {
      setInputs({ rooms: mergedData.rooms });
    }
  }, [loadFromLocalStorage, parseUrlParams]);

  useEffect(() => {
    saveToLocalStorage(inputs, false);
  }, [inputs, saveToLocalStorage]);

  const toggleMobileModal = () => {
    const newState = !showMobileModal;
    setShowMobileModal(newState);
    onModalToggle?.(newState);
  };

  const closeMobileModal = () => {
    setShowMobileModal(false);
    onModalToggle?.(false);
  };

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showMobileModal) {
        closeMobileModal();
      }
    };

    if (showMobileModal) {
      document.addEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "unset";
    };
  }, [showMobileModal]);

  const handleTouchStart = (event: React.TouchEvent) => {
    setTouchStartY(event.touches[0].clientY);
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (!touchStartY) return;

    const touchY = event.touches[0].clientY;
    const deltaY = touchY - touchStartY;

    if (deltaY > 100 && touchStartY < 100) {
      closeMobileModal();
      setTouchStartY(null);
    }
  };

  const handleTouchEnd = () => {
    setTouchStartY(null);
  };

  const updateInput = (field: keyof CalculatorInputs, value: number) => {
    setInputs((previous) => ({ ...previous, [field]: value }));
  };

  const roi = calculateRoi();

  return (
    <>
      <div className={`hidden lg:block ${className}`}>
        <div className="sticky top-24">
          <div className="flex justify-center">
            <Button
              variant="default"
              onClick={toggleMobileModal}
              className="bg-gradient-to-r from-[#306BA1] via-[#254d7a] to-[#1e4473] hover:from-[#254d7a] hover:via-[#1e4473] hover:to-[#152a42] text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              data-testid="button-open-fullscreen-calculator"
            >
              {t("calculator_title")}
            </Button>
          </div>
        </div>
      </div>

      <div className="lg:hidden mb-6 flex justify-center">
        <Button
          onClick={toggleMobileModal}
          className="bg-gradient-to-r from-[#306BA1] via-[#254d7a] to-[#1e4473] hover:from-[#254d7a] hover:via-[#1e4473] hover:to-[#152a42] text-white font-semibold px-6 py-4 text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          data-testid="mobile-savings-banner"
        >
          {t("calculator_title")}
        </Button>
      </div>

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
              style={{ backgroundColor: "white" }}
              onClick={(event) => event.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              data-testid="mobile-modal-content"
            >
              <div className="flex-1 flex flex-col h-full bg-white">
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

                  <CalculatorForm
                    inputs={inputs}
                    onInputChange={updateInput}
                    roi={roi}
                    formatCurrency={formatCurrency}
                    onShareCalculation={handleSaveCalculation}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

interface CalculatorFormProps {
  inputs: CalculatorInputs;
  onInputChange: (field: keyof CalculatorInputs, value: number) => void;
  roi: RoiResults;
  formatCurrency: (value: number) => string;
  onShareCalculation: () => void;
}

function CalculatorForm({ inputs, onInputChange, roi, formatCurrency, onShareCalculation }: CalculatorFormProps) {
  const { t } = useLanguage();
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [isHowWeCountExpanded, setIsHowWeCountExpanded] = useState(false);

  return (
    <TooltipProvider>
      <div className="space-y-6 mt-4 pt-4 border-t border-primary/20">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Label className="text-sm font-medium text-foreground">
              {t("roi.calculator.roomsLabel")}
            </Label>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3 w-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-700 dark:border-gray-300 shadow-lg">
                <p className="text-xs font-medium">{t("roi.calculator.roomsTooltip")}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="relative">
            <Input
              type="number"
              min="0"
              step="1"
              value={inputs.rooms === 0 ? "" : inputs.rooms}
              onChange={(event) => {
                const value = event.target.value;
                onInputChange("rooms", value === "" ? 0 : Math.max(0, Math.round(parseFloat(value))));
              }}
              onFocus={(event) => event.target.select()}
              onWheel={(event) => (event.target as HTMLInputElement).blur()}
              className="text-base h-12 pr-24"
              placeholder="50"
              data-testid="input-rooms"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
              {t("roi.calculator.roomsUnit")}
            </span>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-primary/20">
          <div className="bg-white border-2 border-[#a8c5e0] rounded-xl p-6 text-center" data-testid="roi-monthly-income">
            <div className="text-sm text-muted-foreground mb-2 font-medium">
              {t("roi.calculator.monthlyIncome")}
            </div>
            <div className="text-4xl font-bold text-[#306BA1]">
              {formatCurrency(roi.monthlyIncome)}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 text-center border-2 border-primary/30" data-testid="roi-annual-income">
            <div className="text-base text-muted-foreground mb-2 font-semibold">
              {t("roi.calculator.annualIncome")}
            </div>
            <div className="text-3xl font-bold text-primary">
              {formatCurrency(roi.annualIncome)}
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => setShowBreakdown((current) => !current)}
            className="w-full h-12 border-[#7ca3c8] text-[#306BA1] hover:bg-[#f0f5fa]"
            data-testid="toggle-roi-breakdown"
          >
            <span>{showBreakdown ? t("roi.calculator.hideDetails") : t("roi.calculator.showDetails")}</span>
            <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showBreakdown ? "rotate-180" : ""}`} />
          </Button>

          <AnimatePresence initial={false}>
            {showBreakdown && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-4 overflow-hidden"
                data-testid="roi-breakdown"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-foreground">
                    {t("roi.calculator.breakdownTitle")}
                  </h4>
                  <a
                    href="/explanation.pdf"
                    download
                    className="inline-flex items-center gap-2 text-sm font-medium text-[#306BA1] hover:text-[#254d7a]"
                  >
                    <Info className="h-4 w-4" />
                    {t("roi.calculator.downloadExplanation")}
                  </a>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {roi.sources.map((source) => {
                    const Icon = source.icon;
                    return (
                      <div
                        key={source.id}
                        className="bg-[#f0f5fa] rounded-xl p-5 border border-[#d4e5f3] flex items-center gap-4"
                      >
                        <div className="bg-[#306BA1]/10 p-3 rounded-xl">
                          <Icon className="w-6 h-6 text-[#306BA1]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-semibold text-foreground">{source.label}</h5>
                          <p className="text-xs text-muted-foreground">
                            {t("roi.calculator.perRoom")}: €{source.perRoom}
                          </p>
                        </div>
                        <div className="text-right text-lg font-bold text-[#306BA1]">
                          {formatCurrency(source.value)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Collapsible open={isHowWeCountExpanded} onOpenChange={setIsHowWeCountExpanded}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between p-0 h-auto text-left"
              data-testid="toggle-how-we-count"
            >
              <h4 className="text-lg font-medium text-foreground">{t("how_we_calculate")}</h4>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isHowWeCountExpanded ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4" data-testid="how-we-count-content">
            <div className="bg-primary/5 rounded-2xl p-4 space-y-3">
              <p className="text-sm text-foreground leading-relaxed">
                <strong>{t("simple_words")}</strong> {t("formula_explanation_main")}
              </p>
              <p className="text-sm text-foreground leading-relaxed">
                {t("formula_explanation_additional")}
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="space-y-4 pt-2">
          <Button
            asChild
            size="lg"
            className="w-full h-14 text-lg font-semibold bg-[#306BA1] hover:bg-[#254d7a] text-white border-0"
            data-testid="cta-try-roomie"
          >
            <a
              href="https://t.me/hotelmolmanager"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center"
            >
              <span>{t("try_roomie")}</span>
            </a>
          </Button>

          <Button
            onClick={onShareCalculation}
            variant="outline"
            size="lg"
            className="w-full h-12 border-[#7ca3c8] text-[#306BA1] hover:bg-[#f0f5fa] dark:border-[#306BA1] dark:text-[#7ca3c8] dark:hover:bg-[#306BA1]/20"
            data-testid="cta-share-calculation"
          >
            <Copy className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">{t("share_calculation")}</span>
          </Button>

          <p className="text-xs text-center text-muted-foreground leading-relaxed">
            {t("contact_manager_text")}
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}
