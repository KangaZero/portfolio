"use client";
import "./SkillsContainer.css";
import { Icon, Row } from "@once-ui-system/core";
import React, { useState } from "react";
import { skills } from "@/resources";

const SkillsContainer = () => {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <>
      {skills
        .filter((item) => item.essential)
        .map((item) => {
          const isFlipped =
            hovered === item.name && (item.name === "Typescript" || item.name === "Javascript");

          // Determine swap values
          const frontName = item.name;
          const frontIcon = item.icon;
          const backName =
            item.name === "Typescript"
              ? "Javascript"
              : item.name === "Javascript"
                ? "Typescript"
                : item.name;
          const backIcon =
            item.name === "Typescript"
              ? "javascript"
              : item.name === "Javascript"
                ? "typescript"
                : item.icon;

          return (
            <React.Fragment key={item.name}>
              <Row s={{ horizontal: "center" }}>
                <div
                  aria-label={`${item.name} - ${item.level}`}
                  className={`flip-card${isFlipped ? " flipped" : ""}`}
                  onPointerDown={() => {
                    if (item.name === "Typescript" || item.name === "Javascript") {
                      setHovered(isFlipped ? null : item.name);
                    }
                  }}
                >
                  <div className="flip-card-inner">
                    <div className="flip-card-front">
                      <Icon
                        decorative
                        name={frontIcon}
                        tooltip={`${frontName} - ${item.level}`}
                        size="m"
                        className={
                          frontName === "Javascript"
                            ? "javascript"
                            : frontName === "Typescript"
                              ? "typescript"
                              : ""
                        }
                        style={{ color: item.color }}
                        cursor={
                          frontName === "Javascript" || frontName === "Typescript"
                            ? "pointer"
                            : "default"
                        }
                      />
                    </div>
                    <div className="flip-card-back">
                      <Icon
                        decorative
                        name={backIcon}
                        tooltip={`${backName} - ${item.level}`}
                        size="m"
                        style={{ color: "hsla(52, 94%, 54%, 1)" }}
                        cursor={
                          backName === "Javascript" || backName === "Typescript"
                            ? "pointer"
                            : "default"
                        }
                      />
                    </div>
                  </div>
                </div>
              </Row>
            </React.Fragment>
          );
        })}
    </>
  );
};

export { SkillsContainer };
