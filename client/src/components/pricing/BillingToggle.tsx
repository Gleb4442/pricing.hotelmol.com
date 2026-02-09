import { BillingMode } from "@/hooks/use-billing-mode";
import { useLanguage } from "@/hooks/use-language";
import { motion, AnimatePresence } from "framer-motion";

interface BillingToggleProps {
  billingMode: BillingMode;
  onBillingModeChange: (mode: BillingMode) => void;
}

export function BillingToggle({ billingMode, onBillingModeChange }: BillingToggleProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center mb-6">
      <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center relative">
        <motion.div
          className="bg-gray-100/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-full p-1.5 flex items-center justify-center relative shadow-xl border border-gray-200/50 dark:border-gray-700/50 w-fit mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.button
            data-testid="billing-monthly-button"
            onClick={() => onBillingModeChange("monthly")}
            className={`relative z-10 px-4 sm:px-8 py-3 rounded-full text-xs sm:text-lg font-bold transition-colors duration-200 whitespace-nowrap ${billingMode === "monthly"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
              }`}
            whileTap={{ scale: 0.98 }}
          >
            {billingMode === "monthly" && (
              <motion.div
                layoutId="active-billing-indicator"
                className="absolute inset-0 bg-white dark:bg-gray-700 rounded-full shadow-md -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            {t("billing_monthly")}
          </motion.button>

          <motion.button
            data-testid="billing-yearly-button"
            onClick={() => onBillingModeChange("yearly")}
            className={`relative z-10 px-4 sm:px-8 py-3 rounded-full text-xs sm:text-lg font-bold transition-colors duration-200 whitespace-nowrap ${billingMode === "yearly"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
              }`}
            whileTap={{ scale: 0.98 }}
          >
            {billingMode === "yearly" && (
              <motion.div
                layoutId="active-billing-indicator"
                className="absolute inset-0 bg-white dark:bg-gray-700 rounded-full shadow-md -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            {t("billing_yearly")}
          </motion.button>
        </motion.div>

        <motion.div
          className="relative px-3 py-1.5 rounded-full shadow-lg border overflow-hidden"
          initial={false}
          animate={{
            opacity: billingMode === "yearly" ? 1 : 0.4,
            scale: billingMode === "yearly" ? 1.05 : 1,
            backgroundColor: billingMode === "yearly"
              ? "rgb(34, 197, 94)"
              : "rgba(34, 197, 94, 0.1)",
            borderColor: billingMode === "yearly"
              ? "rgb(22, 163, 74)"
              : "rgba(34, 197, 94, 0.2)",
            filter: billingMode === "yearly" ? "saturate(1.2) brightness(1.1)" : "saturate(0.5) brightness(0.9)",
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25
          }}
        >
          {/* Shine effect for active state */}
          {billingMode === "yearly" && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full"
              animate={{ translateX: ["100%", "-100%"] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            />
          )}

          <span className={`text-[10px] sm:text-xs font-black uppercase tracking-tight whitespace-nowrap flex items-center gap-1 ${billingMode === "yearly" ? "text-white" : "text-green-700/70"
            }`}>
            30% OFF
          </span>
        </motion.div>
      </div>
    </div>
  );
}
