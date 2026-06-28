"use client";

import { Button, Column, Flex, Heading, PasswordInput, Row, Spinner } from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import NotFound from "@/app/[lang]/not-found";
import { useAchievements } from "@/components/AchievementsProvider";
import { useUserInfo } from "@/components/UserInfoProvider";
import { protectedRoutes, routes } from "@/resources";
import StartTerminal from "./StartTerminal";

// import { AnimatePresence, motion } from "motion/react";

interface RouteGuardProps {
  children: React.ReactNode;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const pathname = usePathname();
  const { isStartInitialized } = useUserInfo();
  const { unlockAchievement } = useAchievements();
  const [isRouteEnabled, setIsRouteEnabled] = useState(true);
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const performChecks = async () => {
      setLoading(true);
      setIsRouteEnabled(false);
      setIsPasswordRequired(false);
      setIsAuthenticated(false);

      const checkRouteEnabled = () => {
        if (!pathname) return false;

        let extractedOutLocalePathname = pathname.match("(en|ja)") ? pathname.split("/") : pathname;
        // ? This is the home page
        if (extractedOutLocalePathname.length === 2 && extractedOutLocalePathname[0] === "") {
          extractedOutLocalePathname = "/";
          // ? These are static page routes
        } else if (extractedOutLocalePathname.length === 3) {
          extractedOutLocalePathname = `/${extractedOutLocalePathname[2]}`;
        }
        // console.trace(extractedOutLocalePathname, "extractedOutLocalePathname");
        if (
          typeof extractedOutLocalePathname === "string" &&
          extractedOutLocalePathname in routes
        ) {
          return routes[extractedOutLocalePathname as keyof typeof routes];
        }

        return false;

        // const dynamicRoutes = ["/blog", "/work"] as const;
        // for (const route of dynamicRoutes) {
        //   if (pathname?.startsWith(route) && routes[route]) {
        //     return true;
        //   }
        // }

        // return false;
      };

      const routeEnabled = checkRouteEnabled();
      if (!routeEnabled) unlockAchievement("Out of Bounds");
      setIsRouteEnabled(routeEnabled);

      if (protectedRoutes[pathname as keyof typeof protectedRoutes]) {
        setIsPasswordRequired(true);

        const response = await fetch("/api/check-auth");
        if (response.ok) {
          setIsAuthenticated(true);
        }
      }

      setLoading(false);
    };

    performChecks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handlePasswordSubmit = async () => {
    const response = await fetch("/api/authenticate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (response.ok) {
      setIsAuthenticated(true);
      setError(undefined);
    } else {
      setError("Incorrect password");
    }
  };

  if (loading) {
    return (
      <Flex fillWidth style={{ minHeight: "90dvh" }} horizontal="center">
        <Spinner />
      </Flex>
    );
  }

  if (!isStartInitialized) {
    return (
      <Column fillWidth>
        <Row style={{ minHeight: "90dvh" }} center fill>
          <StartTerminal enableDialog={false} />
        </Row>
      </Column>
    );
  }

  if (!isRouteEnabled) {
    return <NotFound />;
  }

  if (isPasswordRequired && !isAuthenticated) {
    return (
      <Column paddingY="128" maxWidth={24} gap="24" center>
        <Heading align="center" wrap="balance">
          This page is password protected
        </Heading>
        <Column fillWidth gap="8" horizontal="center">
          <PasswordInput
            id="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            errorMessage={error}
          />
          <Button onClick={handlePasswordSubmit}>Submit</Button>
        </Column>
      </Column>
    );
  }

  return (
    <>
      {/*<motion.section
        style={{
          margin: 0,
          padding: 0,
          width: "100%",
          height: "100%",
          boxSizing: "border-box",
          background: "none",
          border: "none",
        }}
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, x: -1000 }}
      >*/}
      {children}
      {/*</motion.section>*/}
      <StartTerminal enableDialog />
    </>
  );
};

export { RouteGuard };
