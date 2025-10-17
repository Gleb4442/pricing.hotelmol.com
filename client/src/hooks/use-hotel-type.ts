import { useState, useEffect } from "react";

export type HotelType = "single" | "network";

export function useHotelType() {
  const [hotelType, setHotelType] = useState<HotelType>("single");

  useEffect(() => {
    // Initialize from localStorage
    const saved = localStorage.getItem("hotelType") as HotelType;
    if (saved === "single" || saved === "network") {
      setHotelType(saved);
    }
  }, []);

  const updateHotelType = (type: HotelType) => {
    setHotelType(type);
    localStorage.setItem("hotelType", type);
  };

  const toggleHotelType = () => {
    const newType = hotelType === "single" ? "network" : "single";
    updateHotelType(newType);
  };

  return { hotelType, setHotelType: updateHotelType, toggleHotelType };
}
