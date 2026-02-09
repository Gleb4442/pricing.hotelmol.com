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
    <div className="flex flex-col items-center justify-center mb-6 space-y-3">
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
            {t("yearly_savings")}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
