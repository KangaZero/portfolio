"use client";
import "./header-date.css";
import "@/utils/animations/bounceIn.css";
import { Icon, Skeleton } from "@once-ui-system/core";
import { useEffect, useState } from "react";
import { getDailyWeatherForecast } from "@/api/queries/getDailyWeatherForecast";
import { useAchievements } from "@/components/AchievementsProvider";
import { useLocale } from "@/components/LocaleProvider";
import { person, WMOCodeDescriptions } from "@/resources";

const HeaderDate = () => {
  const { unlockAchievement } = useAchievements();
  const { translate } = useLocale();
  const [latitude, longitude] = person.locationCoordinates;
  const { data } = getDailyWeatherForecast({
    latitude,
    longitude,
    timezone: person.location,
    forecastDays: 1,
  });
  const [isHovered, setIsHovered] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
  }, []);

  const day = now ? translate(`headerDate.days.${now.getDay()}` as "headerDate.days.0") : "";
  const allButLastCharDay = day.slice(0, -1);
  const lastDayChar = day.slice(-1);
  const date = now?.getDate() ?? null;
  const hour = now?.getHours() ?? null;
  const isDay = data ? Boolean(data.current.is_day) : hour !== null ? hour >= 6 && hour < 18 : true;
  const month = now
    ? translate(`headerDate.months.${now.getMonth()}` as "headerDate.months.0")
    : "";
  const temperature = data ? Math.round(data.current.temperature_2m) : 0;

  const weatherDescription =
    WMOCodeDescriptions[data?.current.weather_code || 0][isDay ? "day" : "night"].description;
  /*Variable is based on WMO code standards, if the data cannot be retrieved, it will default to Sunny/Clear icon */
  const weatherIcon =
    WMOCodeDescriptions[data?.current.weather_code || 0][isDay ? "day" : "night"].icon;

  function getTemperatureColor(temp: number) {
    switch (true) {
      case temp <= 0:
        return "dodgerblue";
      case temp > 0 && temp <= 15:
        return "deepskyblue";
      case temp > 15 && temp <= 25:
        return "orange";
      case temp > 25:
        return "red";
      default:
        return "gray";
    }
  }
  const gradient = getTemperatureColor(temperature);

  return (
    <div
      className="link-wrapper"
      onTouchStart={() => {
        setIsHovered(!isHovered);
        unlockAchievement("Snoopy Detective");
      }}
      onMouseEnter={() => {
        setIsHovered(true);
        unlockAchievement("Snoopy Detective");
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="fallback">
        {day} {month} {date}
      </div>

      <div className={`shape-wrapper ${isHovered ? "active" : ""}`}>
        <div className="shape cyan-fill jelly">
          <svg width="100%" height="35" viewBox="0 0 200 35" preserveAspectRatio="none">
            <rect width="200" height="35" fill="#00FFFF" />
          </svg>
        </div>
        <div className="shape red-fill jelly">
          <svg width="100%" height="35" viewBox="0 0 200 35" preserveAspectRatio="none">
            <rect width="200" height="35" fill="#FF0000" />
          </svg>
        </div>
      </div>

      <div className="img-wrapper">
        <div className={`p5DateBox ${isHovered ? "hover-active" : ""}`}>
          <div className="p5DateDay">
            <span className="p5Day bounceIn">{allButLastCharDay}</span>
            <span className="p5Day2 bounceIn">{lastDayChar}</span>
            {data ? (
              <Icon
                tooltip={weatherDescription}
                name={weatherIcon}
                className="p5DateWeatherIcon bounceIn"
              />
            ) : (
              <Skeleton shape="circle" className="p5DateWeatherIcon bounceIn" delay="1" />
            )}
          </div>
          <div className="p5DateMonthDay" style={{ margin: data ? 0 : 0 }}>
            <span className="p5Month bounceIn">{month}</span>
            <span className="p5DateMonthDaySeparator bounceIn">/</span>
            <span className="p5Date bounceIn">{date}</span>
            {data && (
              <>
                <span
                  className="p5Temperature bounceIn"
                  style={{
                    WebkitTextFillColor: gradient,
                    textShadow: `0 0 3px ${gradient}`,
                  }}
                >
                  {temperature}
                </span>
                <span
                  className="p5Celsius bounceIn"
                  style={{
                    WebkitTextFillColor: gradient,
                    textShadow: `0 0 3px ${gradient}`,
                  }}
                >
                  °C
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { HeaderDate };
