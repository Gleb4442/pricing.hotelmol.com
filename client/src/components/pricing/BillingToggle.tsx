import { BillingMode } from "@/hooks/use-billing-mode";
import { motion, AnimatePresence } from "framer-motion";

interface BillingToggleProps {
  billingMode: BillingMode;
  onBillingModeChange: (mode: BillingMode) => void;
}

export function BillingToggle({ billingMode, onBillingModeChange }: BillingToggleProps) {
  return (
    <div className="flex flex-col items-center justify-center mb-12 space-y-3">
      <motion.div 
        className="bg-muted rounded-full p-1 flex items-center relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Анимированный фон для активной кнопки */}
        <motion.div
          className="absolute bg-primary rounded-full h-[calc(100%-8px)] z-0"
          animate={{
            x: billingMode === "usage" ? 4 : billingMode === "monthly" ? "calc(100% + 4px)" : 4,
            width: billingMode === "usage" ? "calc(50% - 6px)" : billingMode === "monthly" ? "calc(50% - 6px)" : "calc(50% - 6px)"
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
          className={`relative z-10 px-8 py-4 rounded-full text-base font-semibold transition-colors duration-200 ${
            billingMode === "usage" 
              ? "text-primary-foreground" 
              : "text-muted-foreground hover:text-foreground"
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          Оплата за использование
        </motion.button>
        
        <motion.button
          data-testid="billing-monthly-button"
          onClick={() => onBillingModeChange("monthly")}
          className={`relative z-10 px-8 py-4 rounded-full text-base font-semibold transition-colors duration-200 ${
            billingMode === "monthly" 
              ? "text-primary-foreground" 
              : "text-muted-foreground hover:text-foreground"
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          Ежемесячно
        </motion.button>
      </motion.div>
      
      <motion.button
        data-testid="billing-yearly-button"
        onClick={() => onBillingModeChange("yearly")}
        className={`px-8 py-4 rounded-full text-base font-semibold transition-all duration-300 ${
          billingMode === "yearly" 
            ? "bg-primary text-primary-foreground shadow-lg" 
            : "bg-muted text-muted-foreground hover:bg-muted/80"
        }`}
        style={{
          boxShadow: billingMode === "yearly" 
            ? "0 4px 12px rgba(0,0,0,0.1)" 
            : "0 0px 0px rgba(0,0,0,0)"
        }}
        whileHover={{ 
          scale: 1.05,
          boxShadow: billingMode === "yearly" 
            ? "0 10px 25px rgba(0,0,0,0.15)" 
            : "0 4px 12px rgba(0,0,0,0.1)"
        }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.4, 
          delay: 0.2,
          type: "spring",
          stiffness: 300
        }}
      >
        Ежегодно
      </motion.button>
      
      <AnimatePresence>
        {billingMode === "yearly" && (
          <motion.div 
            className="text-sm text-green-600 font-medium"
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ 
              type: "spring",
              stiffness: 400,
              damping: 25
            }}
          >
            Экономия до 20% при годовой оплате
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
