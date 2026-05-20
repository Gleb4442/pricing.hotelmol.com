import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ArrowRight, Calculator, Info, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";

interface SavingsCalculatorProps {
  className?: string;
}

interface PremiumBackgroundProps {
  children: ReactNode;
  className?: string;
  showGrid?: boolean;
  showGlows?: boolean;
  showLines?: boolean;
}

function PremiumBackground({
  children,
  className = "",
  showGrid = true,
  showGlows = true,
  showLines = true,
}: PremiumBackgroundProps) {
  return (
    <div className={`section-render-gate relative overflow-hidden bg-background ${className}`}>
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          maskImage: "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)",
        }}
      >
        {showGrid && (
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage:
                "linear-gradient(#0752A0 1px, transparent 1px), linear-gradient(90deg, #0752A0 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        )}

        {showGlows && (
          <div className="absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_8%_16%,rgba(56,189,248,0.05),transparent_34%),radial-gradient(circle_at_92%_84%,rgba(14,165,233,0.04),transparent_32%)]" />
        )}

        {showLines && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-[1px] h-full bg-slate-200/20 hidden lg:block" />
            <div className="absolute top-0 right-1/4 w-[1px] h-full bg-slate-200/20 hidden lg:block" />
          </div>
        )}
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}

function Counter({
  value,
  decimal = 0,
  prefix = "",
  suffix = "",
}: {
  value: number;
  decimal?: number;
  prefix?: string;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      previousValue.current = value;
      setDisplayValue(value);
      return;
    }

    const startValue = previousValue.current;
    const delta = value - startValue;
    const duration = 500;
    let frame = 0;
    let startTime: number | null = null;

    const animate = (time: number) => {
      if (startTime === null) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(startValue + delta * eased);

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        previousValue.current = value;
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString(undefined, {
        minimumFractionDigits: decimal,
        maximumFractionDigits: decimal,
      })}
      {suffix}
    </span>
  );
}

function DonutChart({ data }: { data: Array<{ value: number; color: string }> }) {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  let cursor = 0;
  const segments = data.map((item) => {
    const start = cursor;
    const end = cursor + (item.value / total) * 360;
    cursor = end;
    return `${item.color} ${start.toFixed(2)}deg ${end.toFixed(2)}deg`;
  });

  return (
    <div
      className="absolute inset-7 rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.8)]"
      style={{ background: `conic-gradient(${segments.join(", ")})` }}
      aria-hidden
    >
      <div className="absolute inset-[34px] rounded-full bg-[#F6F6F4] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]" />
    </div>
  );
}

export function SavingsCalculator({ className = "" }: SavingsCalculatorProps) {
  const { t } = useLanguage();
  const [rooms, setRooms] = useState<number>(50);
  const [isEditingRooms, setIsEditingRooms] = useState(false);
  const [roomInput, setRoomInput] = useState(rooms.toString());

  const handleRoomSubmit = () => {
    const value = parseInt(roomInput, 10);
    if (!Number.isNaN(value) && value >= 5 && value <= 500) {
      setRooms(value);
    } else {
      setRoomInput(rooms.toString());
    }
    setIsEditingRooms(false);
  };

  const otaSavingsPerRoom = 53;
  const fbOnlinePerRoom = 80;
  const upsellPerRoom = 50;
  const totalPerRoom = otaSavingsPerRoom + fbOnlinePerRoom + upsellPerRoom;

  const monthlyIncome = rooms * totalPerRoom;
  const annualIncome = monthlyIncome * 12;

  const chartData = useMemo(
    () => [
      { name: t("roi.calculator.source1"), value: otaSavingsPerRoom * rooms, color: "#0752A0" },
      { name: t("roi.calculator.source2"), value: fbOnlinePerRoom * rooms, color: "#4778A8" },
      { name: t("roi.calculator.source3"), value: upsellPerRoom * rooms, color: "#709DC4" },
    ],
    [rooms, t],
  );

  const perRoomValues = [otaSavingsPerRoom, fbOnlinePerRoom, upsellPerRoom];
  const sliderProgress = ((rooms - 5) / (500 - 5)) * 100;

  return (
    <PremiumBackground className={`py-20 lg:py-32 relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(circle_at_10%_10%,rgba(7,82,160,0.08),transparent_34%),radial-gradient(circle_at_90%_90%,rgba(172,202,224,0.18),transparent_32%)]" />

      <div className="container mx-auto px-4 relative z-10 w-full max-w-6xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#F6F6F4] border border-black/10 mb-6 shadow-sm">
            <Calculator className="h-8 w-8 text-[#0752A0]" />
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-[45px] font-bold mb-6 text-[#111111] tracking-tight leading-tight">
            {t("roi.title")}
          </h2>
          <p className="text-lg sm:text-xl text-[#8A8A8A] max-w-2xl mx-auto font-light leading-relaxed">
            {t("roi.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-4">
          <div className="col-span-1 lg:col-span-5 space-y-8">
            <div className="relative group overflow-hidden bg-[#F6F6F4] p-8 rounded-[2rem] border border-black/10 shadow-sm transition-all duration-500 hover:border-black/20">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <label
                    htmlFor="roomsSlider"
                    className="text-sm font-medium text-[#8A8A8A] uppercase tracking-[0.2em] mb-2 block"
                  >
                    {t("roi.calculator.roomsLabel")}
                  </label>
                  <div className="text-5xl font-bold text-[#111111] tabular-nums flex items-baseline gap-2">
                    {isEditingRooms ? (
                      <input
                        type="number"
                        value={roomInput}
                        onChange={(event) => setRoomInput(event.target.value)}
                        onBlur={handleRoomSubmit}
                        onKeyDown={(event) => event.key === "Enter" && handleRoomSubmit()}
                        autoFocus
                        className="w-32 bg-transparent border-b-2 border-[#0752A0] outline-none focus:ring-0 p-0 text-5xl font-bold text-[#111111]"
                        min="5"
                        max="500"
                        aria-label={t("roi.calculator.roomsLabel")}
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setRoomInput(rooms.toString());
                          setIsEditingRooms(true);
                        }}
                        className="cursor-pointer hover:text-[#0752A0] transition-colors decoration-dotted decoration-[#0752A0]/30 hover:underline underline-offset-8"
                        title={t("roi.calculator.editRooms")}
                      >
                        {rooms}
                      </button>
                    )}
                    <span className="text-xl font-light text-[#8A8A8A] lowercase">
                      {t("roi.calculator.roomsUnit")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative h-12 flex items-center mb-4">
                <input
                  id="roomsSlider"
                  type="range"
                  min="5"
                  max="500"
                  step="5"
                  value={rooms}
                  onChange={(event) => setRooms(parseInt(event.target.value, 10))}
                  className="roi-range w-full h-1.5 bg-[#8A8A8A]/20 rounded-lg appearance-none cursor-pointer accent-[#0752A0] group-hover:accent-[#0752A0]/80 transition-all duration-300"
                  style={{
                    background: `linear-gradient(to right, #0752A0 0%, #0752A0 ${sliderProgress}%, rgba(0,0,0,0.05) ${sliderProgress}%, rgba(0,0,0,0.05) 100%)`,
                  }}
                />
              </div>

              <div className="flex justify-between text-[10px] font-bold text-[#8A8A8A]/40 uppercase tracking-widest px-1">
                <span>{t("roi.calculator.roomsMin")}</span>
                <span>{t("roi.calculator.roomsMid")}</span>
                <span>{t("roi.calculator.roomsMax")}</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#0752A0]/10 via-[#0752A0]/5 to-transparent p-10 rounded-[2.5rem] border border-[#0752A0]/10 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <TrendingUp className="w-32 h-32 text-[#0752A0] rotate-12" />
              </div>

              <div className="relative z-10 flex flex-col items-center text-center">
                <span className="text-sm font-medium text-[#0752A0] uppercase tracking-[0.3em] mb-4">
                  {t("roi.calculator.totalImpact")}
                </span>
                <div className="text-6xl lg:text-7xl font-black text-[#111111] mb-6">
                  <Counter value={monthlyIncome} prefix="€" />
                </div>
                <div className="inline-flex items-center gap-2 bg-[#F6F6F4] px-6 py-3 rounded-2xl border border-black/10 mb-2">
                  <span className="text-[#8A8A8A] text-sm font-medium uppercase tracking-wider">
                    {t("roi.calculator.annualIncome")}
                  </span>
                  <span className="text-[#111111] font-bold text-lg">
                    <Counter value={annualIncome} prefix="€" />
                  </span>
                </div>
                <p className="text-[#8A8A8A] text-xs mt-6 uppercase tracking-widest font-bold">
                  {t("roi.calculator.additionalPotentialRevenue")}
                </p>
              </div>
            </div>
          </div>

          <div className="col-span-1 lg:col-span-7 bg-[#F6F6F4] rounded-[2.5rem] border border-black/10 p-8 lg:p-12 shadow-sm flex flex-col">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-bold text-[#111111] mb-2">{t("roi.calculator.breakdownTitle")}</h3>
                <p className="text-[#8A8A8A] text-sm">{t("roi.calculator.breakdownSubtitle")}</p>
              </div>
              <a
                href="/explanation.pdf"
                download
                className="p-3 rounded-2xl bg-white hover:bg-[#F6F6F4] text-[#8A8A8A] hover:text-[#0752A0] border border-black/10 transition-all duration-300 group relative"
                aria-label={t("roi.calculator.downloadExplanation")}
              >
                <Info className="w-5 h-5" />
                <span className="absolute right-0 top-full mt-3 bg-[#111111] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none translate-y-2 group-hover:translate-y-0">
                  {t("roi.calculator.downloadExplanation")}
                </span>
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center flex-1">
              <div className="h-[280px] w-full relative">
                <DonutChart data={chartData} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-[0.2em] mb-1">
                    {t("roi.calculator.estimatedRoi")}
                  </span>
                  <span className="text-2xl font-bold text-[#111111]">
                    +{Math.round((totalPerRoom / 500) * 100)}%
                  </span>
                  <span className="text-[10px] text-[#0752A0] font-bold uppercase mt-1">
                    {t("roi.calculator.growth")}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                {chartData.map((source, index) => (
                  <div
                    key={source.name}
                    className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-black/5 hover:border-[#0752A0]/20 transition-all duration-300 group"
                  >
                    <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: source.color }} />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-[#111111] truncate group-hover:text-[#0752A0] transition-colors">
                        {source.name}
                      </h4>
                      <p className="text-[10px] text-[#8A8A8A] uppercase tracking-widest">
                        {t("roi.calculator.perRoom")}: €{perRoomValues[index]}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-md font-bold text-[#111111]">
                        <Counter value={source.value} prefix="€" />
                      </div>
                      <div className="text-[10px] text-[#8A8A8A] truncate">/ {t("roi.calculator.monthShort")}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 relative p-12 lg:p-16 rounded-[3rem] bg-gradient-to-r from-[#0752A0]/80 to-[#4778A8]/80 border border-white/20 overflow-hidden text-center group shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(255,255,255,0.16),transparent_32%),radial-gradient(circle_at_85%_85%,rgba(172,202,224,0.22),transparent_30%)]" />

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
              {t("roi.calculator.ctaTitle")}
            </h3>
            <p className="text-lg text-white/90 mb-10 font-light max-w-xl">{t("roi.calculator.ctaText")}</p>

            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <Button
                size="lg"
                asChild
                className="h-16 px-12 bg-white text-[#111111] hover:bg-[#F6F6F4] text-lg font-bold shadow-[0_20px_40px_-15px_rgba(255,255,255,0.3)] rounded-2xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <a href="https://cal.com/hotelmol.team" target="_blank" rel="noopener noreferrer" className="flex items-center">
                  {t("roi.calculator.ctaButton")} <ArrowRight className="ml-3 w-6 h-6" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PremiumBackground>
  );
}
