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
        className="bg-gray-200 dark:bg-gray-800 rounded-full p-1.5 grid grid-cols-3 items-center relative shadow-2xl w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Animated background for active button */}
        <motion.div
          className="absolute bg-primary rounded-full shadow-md top-1/2 -translate-y-1/2"
          initial={false}
          animate={{
            left: billingMode === "usage" ? "2.67%" : billingMode === "monthly" ? "36%" : "69.33%",
            width: "28%",
            height: "70%"
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
          className={`relative z-10 px-2 sm:px-6 py-3 rounded-full text-xs sm:text-lg font-semibold transition-colors duration-200 w-full text-center whitespace-nowrap ${billingMode === "usage"
            ? "text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
            }`}
          whileTap={{ scale: 0.98 }}
        >
          {t("billing_usage")}
        </motion.button>

        <motion.button
          data-testid="billing-monthly-button"
          onClick={() => onBillingModeChange("monthly")}
          className={`relative z-10 px-2 sm:px-6 py-3 rounded-full text-xs sm:text-lg font-semibold transition-colors duration-200 w-full text-center whitespace-nowrap ${billingMode === "monthly"
            ? "text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
            }`}
          whileTap={{ scale: 0.98 }}
        >
          {t("billing_monthly")}
        </motion.button>

        <motion.button
          data-testid="billing-yearly-button"
          onClick={() => onBillingModeChange("yearly")}
          className={`relative z-10 px-2 sm:px-6 py-3 rounded-full text-xs sm:text-lg font-semibold transition-colors duration-200 w-full text-center whitespace-nowrap ${billingMode === "yearly"
            ? "text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
            }`}
          whileTap={{ scale: 0.98 }}
        >
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
