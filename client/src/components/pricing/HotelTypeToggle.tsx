
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";

interface HotelTypeToggleProps {
    hotelType: "single" | "network";
    toggleHotelType: () => void;
}

export function HotelTypeToggle({ hotelType, toggleHotelType }: HotelTypeToggleProps) {
    const { t } = useLanguage();

    return (
        <div className="flex items-center bg-[#254d7a]/30 rounded-lg p-1 relative">
            {/* Animated highlighter */}
            <motion.div
                className="absolute bg-[#306BA1] rounded-md h-[calc(100%-8px)] shadow-md z-0"
                animate={{
                    x: hotelType === "single" ? 0 : "100%",
                    width: "calc(50% - 4px)"
                }}
                initial={false}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30
                }}
                style={{ left: "4px" }}
            />

            <button
                onClick={() => hotelType === "network" && toggleHotelType()}
                className={`relative z-10 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex-1 text-center ${hotelType === "single"
                        ? "text-white"
                        : "text-[#a8c5e0] hover:text-white"
                    }`}
            >
                {t("hotel_type_single")}
            </button>

            <button
                onClick={() => hotelType === "single" && toggleHotelType()}
                className={`relative z-10 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex-1 text-center ${hotelType === "network"
                        ? "text-white"
                        : "text-[#a8c5e0] hover:text-white"
                    }`}
            >
                {t("hotel_type_network")}
            </button>
        </div>
    );
}
