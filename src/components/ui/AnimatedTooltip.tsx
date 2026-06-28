"use client";

import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useRef, useState } from "react";
import "./AnimatedTooltip.css";

export const AnimatedTooltip = ({
  title,
  description,
  children,
  direction = "top",
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  direction?: "top" | "bottom" | "left" | "right";
}) => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const springConfig = { stiffness: 100, damping: 15 };
  const x = useMotionValue(0);
  const animationFrameRef = useRef<number | null>(null);

  const rotate = useSpring(useTransform(x, [-100, 100], [-45, 45]), springConfig);
  const translateX = useSpring(useTransform(x, [-100, 100], [-50, 50]), springConfig);

  const handleShowAnimatedTooltip = (event: React.PointerEvent<HTMLDivElement>) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      const halfWidth = event.clientX / 2;
      x.set(event.nativeEvent.offsetX - halfWidth);
    });
  };

  return (
    <div
      className="animated-tooltip"
      onPointerEnter={() => setIsActive(true)}
      onPointerMove={(event) => handleShowAnimatedTooltip(event)}
      onPointerDown={(event) => {
        handleShowAnimatedTooltip(event);
        setIsActive(isActive);
      }}
      onPointerLeave={() => setIsActive(false)}
    >
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.4 }}
            animate={{
              animationDuration: "1s",
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 260,
                damping: 10,
              },
            }}
            exit={{ opacity: 0, y: 20, scale: 0.6 }}
            style={{
              translateX: translateX,
              rotate: rotate,
              whiteSpace: "nowrap",
            }}
            className={`animated-tooltip-tooltip ${direction}`}
          >
            <div className="gradient1" />
            <div className="gradient2" />
            <div className="title">{title}</div>
            <div className="description">{description}</div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  );
};
