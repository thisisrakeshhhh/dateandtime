import React from "react";
import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Moon,
  CloudMoon,
} from "lucide-react";

interface WeatherIconProps {
  icon: string;
  isDay?: boolean;
  className?: string;
}

export default function WeatherIcon({ icon, isDay = true, className = "w-4 h-4" }: WeatherIconProps) {
  const norm = (icon || "").toLowerCase();

  if (!isDay && (norm === "sun" || norm === "clear")) {
    return <Moon className={className} />;
  }

  if (!isDay && (norm === "cloud-sun" || norm === "sun-cloud")) {
    return <CloudMoon className={className} />;
  }

  switch (norm) {
    case "sun":
    case "clear":
      return <Sun className={className} />;
    case "cloud-sun":
    case "sun-cloud":
      return <CloudSun className={className} />;
    case "cloud":
    case "overcast":
      return <Cloud className={className} />;
    case "fog":
      return <CloudFog className={className} />;
    case "drizzle":
    case "rain":
      return <CloudRain className={className} />;
    case "snow":
      return <CloudSnow className={className} />;
    case "thunderstorm":
      return <CloudLightning className={className} />;
    default:
      return isDay ? <CloudSun className={className} /> : <CloudMoon className={className} />;
  }
}
