"use client";

import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import type { ClientInfo, TypeSafeClientInfo } from "@/types";
import { whoAmI } from "@/utils/getUserFingerprint";

type UserInfoContextType = {
  userInfo: null | ClientInfo;
  typeSafeUserInfo: null | TypeSafeClientInfo;
  isStartInitialized: boolean;
  setIsStartInitializedStateAndCookie: (state: boolean) => void;
  isTerminalOpen: boolean;
  setIsTerminalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};
const UserInfoContext = createContext<UserInfoContextType | undefined>(undefined);

export const UserInfoProvider = ({
  children,
  initialIsStartInitialized,
}: {
  children: ReactNode;
  initialIsStartInitialized: boolean;
}) => {
  const [userInfo, setUserInfo] = useState<null | ClientInfo>(null);
  const [isStartInitialized, setIsStartInitialized] = useState(initialIsStartInitialized);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [typeSafeUserInfo, setTypeSafeUserInfo] = useState<null | TypeSafeClientInfo>(null);

  const setStartInitializedCookie = (state: boolean) => {
    if (typeof document === "undefined") return;
    document.cookie = `START=${state ? "1" : "0"}; path=/; max-age=31536000`; // 1 year
  };

  const setIsStartInitializedStateAndCookie = (state: boolean) => {
    setIsStartInitialized(state);
    setStartInitializedCookie(state);
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        if (typeof window === "undefined")
          return console.warn("no document detected for UserInfoContext");
        const userFingerprint = await whoAmI();
        if (userFingerprint) {
          setUserInfo(userFingerprint);
        } else {
          console.warn("User fingerprint data is unavailable.");
        }
      } catch (error) {
        console.error("Error fetching user fingerprint:", error);
      }
    };
    fetchUserInfo();
    const interval = setInterval(fetchUserInfo, 60 * 1000); // Run every 1 minute
    return () => clearInterval(interval);
  }, []);

  //TODO just move this inside of whoAmI to reduce useStates running
  useEffect(() => {
    if (!userInfo) return;
    const platform = /Win|Windows/i.test(userInfo.platform)
      ? "windows"
      : /Mac|Macintosh|Mac OS X/i.test(userInfo.platform)
        ? "macos"
        : /Linux/i.test(userInfo.platform)
          ? "linux"
          : /Android/i.test(userInfo.platform)
            ? "android"
            : /iPhone|iPad|iPod/i.test(userInfo.platform)
              ? "ios"
              : "other";
    /**
     * Get battery icon based on battery level
     * @param batteryLevel @type number | unknown
     * @returns
     */
    const getBatteryIcon = (
      batteryLevel: number | null,
      isCharging: boolean | null,
    ): TypeSafeClientInfo["batteryIcon"] => {
      if (typeof batteryLevel !== "number" || typeof isCharging !== "boolean")
        return "batteryUnknown";
      if (isCharging) return "batteryCharging";
      if (batteryLevel >= 80) return "batteryFull";
      if (batteryLevel >= 70) return "batteryThreeQuarters";
      if (batteryLevel >= 40) return "batteryHalf";
      if (batteryLevel > 15) return "batteryQuarter";
      return "batteryEmpty";
    };

    setTypeSafeUserInfo({
      ...userInfo,
      platform,
      batteryIcon: getBatteryIcon(userInfo.batteryLevel, userInfo.batteryCharging),
    });
  }, [userInfo]);

  return (
    <UserInfoContext.Provider
      value={{
        userInfo,
        typeSafeUserInfo,
        isStartInitialized,
        setIsStartInitializedStateAndCookie,
        isTerminalOpen,
        setIsTerminalOpen,
      }}
    >
      {children}
    </UserInfoContext.Provider>
  );
};

export const useUserInfo = () => {
  const context = useContext(UserInfoContext);
  if (!context) throw new Error("useUserInfo must be used within a UserInfoContext");
  return context;
};
