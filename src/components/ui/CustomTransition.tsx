"use client";
import "./CustomTransition.css";
import { ViewTransition } from "react";
// import { cn } from "@/lib/utils";

export function CustomTransition({
  name,
  children,
  // direction = "horizontal",
  // distance = 1000,
  // duration = 2000,
}: {
  name: string;
  children: React.ReactNode;
  direction?: "horizontal" | "vertical";
  distance?: number;
  duration?: number;
}) {
  // const isHorizontal = direction === "horizontal";
  // const startName = isHorizontal ? "left" : "up";
  // const endName = isHorizontal ? "right" : "down";
  // const startPosition = isHorizontal ? `-${distance}px 0` : `0 ${distance}px`;
  // const endPosition = isHorizontal ? `${distance}px 0` : `0 100%`;

  return (
    <ViewTransition name={name}>
      <div className="panel-wrapper">
        <div className="panel left"></div>
        <div className="panel right"></div>
        {children}
      </div>
    </ViewTransition>
  );
}
