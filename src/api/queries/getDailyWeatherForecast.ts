//https://open-meteo.com/en/docs/jma-api?latitude=35&longitude=139&timezone=Asia%2FTokyo&forecast_days=1&hourly=temperature_2m,weather_code&daily=weather_code&current=temperature_2m,is_day,weather_code

import { useQuery } from "@tanstack/react-query";
import type { IANATimeZone, WMOCodes } from "@/types";

export type DailyWeatherForecast = {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: IANATimeZone;
  timezone_abbreviation: string;
  elevation: number;
  current_units: {
    time: string;
    interval: string;
    temperature_2m: string;
    is_day: string;
    weather_code: string;
  };
  current: {
    time: string;
    interval: number;
    temperature_2m: number;
    is_day: number;
    weather_code: WMOCodes;
  };
  hourly_units: {
    time: string;
    temperature_2m: string;
    weather_code: string;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
  };
  daily_units: {
    time: string;
    weather_code: string;
  };
  daily: {
    time: string[];
    weather_code: number[];
  };
};

type GetWeatherParams = {
  latitude: number;
  longitude: number;
  timezone: IANATimeZone;
  forecastDays: 1 | 3 | 5 | 7 | 10 | 11;
};

async function getWeather(props: GetWeatherParams): Promise<DailyWeatherForecast> {
  const { latitude, longitude, timezone, forecastDays } = props;
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code&hourly=temperature_2m,weather_code&models=jma_seamless&current=temperature_2m,is_day,weather_code&timezone=${timezone}&forecast_days=${forecastDays}`,
  );
  if (!res.ok) throw new Error("Failed to fetch weather data");
  return res.json();
}

export function getDailyWeatherForecast(props: GetWeatherParams) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useQuery({
    queryKey: ["dailyWeatherForecast", props],
    enabled: Boolean(props),
    refetchInterval: 1000 * 60 * 60 * 24, // Refetch once a day
    refetchOnMount: false,
    queryFn: () => getWeather(props),
  });
}
