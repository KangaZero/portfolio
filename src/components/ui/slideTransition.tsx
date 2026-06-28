"use client";

import { ViewTransition } from "react";
import { cn } from "@/lib/utils";

export function SlideTransition({
  name,
  children,
  direction = "horizontal",
  distance = 1000,
  duration = 2000,
}: {
  name: string;
  children: React.ReactNode;
  direction?: "horizontal" | "vertical";
  distance?: number;
  duration?: number;
}) {
  const isHorizontal = direction === "horizontal";
  const startName = isHorizontal ? "left" : "up";
  const endName = isHorizontal ? "right" : "down";
  const startPosition = isHorizontal ? `-${distance}px 0` : `0 ${distance}px`;
  const endPosition = isHorizontal ? `${distance}px 0` : `0 100%`;

  return (
    <>
      <style>
        {`
          @keyframes ${name}-enter-slide-${startName} {
            0% {
              opacity: 0;
              translate: ${startPosition};
            }
            100% {
              opacity: 1;
              translate: 0 0;
            }
          }

          @keyframes ${name}-exit-slide-${endName} {
            0% {
              opacity: 1;
              translate: 0 0;
            }
            100% {
              opacity: 0;
              translate: ${endPosition};
            }
          }

          ::view-transition-new(.${name}-enter-slide-${startName}) {
            animation: ${name}-enter-slide-${startName} ease-in ${duration}ms;
          }
          ::view-transition-old(.${name}-exit-slide-${endName}) {
            animation: ${name}-exit-slide-${endName} ease-out ${duration}ms;
          }
        `}
      </style>
      <ViewTransition name={name}>
        <div
          style={{
            margin: 0,
            padding: 0,
            width: "100%",
            height: "100%",
            boxSizing: "border-box",
            background: "none",
            border: "none",
          }}
          className={cn(`${name}-enter-slide-${startName}`, `${name}-exit-slide-${endName}`)}
        >
          {children}
        </div>
      </ViewTransition>
    </>
  );
}
