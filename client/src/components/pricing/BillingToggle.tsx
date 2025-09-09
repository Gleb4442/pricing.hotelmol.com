import { BillingMode } from "@/hooks/use-billing-mode";
import { motion, AnimatePresence } from "framer-motion";

interface BillingToggleProps {
  billingMode: BillingMode;
  onBillingModeChange: (mode: BillingMode) => void;
}

export function BillingToggle({ billingMode, onBillingModeChange }: BillingToggleProps) {
  return (
    <div className="flex flex-col items-center justify-center mb-12 space-y-5">
      <motion.div 
        className="bg-gradient-to-r from-muted/50 to-muted rounded-full p-2 flex items-center relative shadow-xl border border-border/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Анимированный фон для активной кнопки */}
        <motion.div
          className="absolute bg-gradient-to-r from-primary to-blue-600 rounded-full h-[calc(100%-16px)] z-0 shadow-lg"
          animate={{
            x: billingMode === "usage" ? 8 : billingMode === "monthly" ? "calc(100% + 8px)" : 8,
            width: billingMode === "usage" ? "calc(50% - 12px)" : billingMode === "monthly" ? "calc(50% - 12px)" : "calc(50% - 12px)"
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
        />
        
        <motion.button
          data-testid="billing-usage-button"
          onClick={() => onBillingModeChange("usage")}
          className={`relative z-10 px-8 py-4 rounded-full text-base font-semibold transition-all duration-300 ${
            billingMode === "usage" 
              ? "text-white shadow-inner" 
              : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
          }`}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          Оплата за использование
        </motion.button>
        
        <motion.button
          data-testid="billing-monthly-button"
          onClick={() => onBillingModeChange("monthly")}
          className={`relative z-10 px-8 py-4 rounded-full text-base font-semibold transition-all duration-300 ${
            billingMode === "monthly" 
              ? "text-white shadow-inner" 
              : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
          }`}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          Ежемесячно
        </motion.button>
      </motion.div>
      
      <motion.button
        data-testid="billing-yearly-button"
        onClick={() => onBillingModeChange("yearly")}
        className={`px-10 py-4 rounded-full text-lg font-bold transition-all duration-300 border-2 ${
          billingMode === "yearly" 
            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-2xl border-green-400" 
            : "bg-gradient-to-r from-muted to-muted/80 text-muted-foreground hover:from-muted/60 hover:to-muted/40 hover:text-foreground border-border hover:border-primary/30"
        }`}
        whileHover={{ 
          scale: 1.08,
          boxShadow: billingMode === "yearly" 
            ? "0 20px 40px rgba(34, 197, 94, 0.3)" 
            : "0 8px 25px rgba(0,0,0,0.12)"
        }}
        whileTap={{ scale: 0.92 }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.5, 
          delay: 0.3,
          type: "spring",
          stiffness: 300
        }}
      >
        🎯 Ежегодно
      </motion.button>
      
      <AnimatePresence>
        {billingMode === "yearly" && (
          <motion.div 
            className="text-base font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -15, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.8 }}
            transition={{ 
              type: "spring",
              stiffness: 500,
              damping: 25
            }}
          >
            💰 Экономия до 20% при годовой оплате
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
