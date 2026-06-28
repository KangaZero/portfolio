"use client";

import { HoloFx, IconButton, Line, ShineFx } from "@once-ui-system/core/components";
import { gsap } from "gsap";
import { Sparkles } from "lucide-react";
import Image from "next/image";
import React, { useEffect } from "react";
import { useAchievements } from "../AchievementsProvider";
import styles from "./achievement-toast.module.scss";
// import StarBorder from "../StarBorder";

export interface AchievementToastProps {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

// Convert kebab-case to camelCase for CSS modules
const positionClassMap = {
  "top-left": styles.topLeft,
  "top-right": styles.topRight,
  "bottom-left": styles.bottomLeft,
  "bottom-right": styles.bottomRight,
};

export const AchievementToast: React.FC<AchievementToastProps> = ({ position }) => {
  const { currentAchievementUnlocked, setCurrentAchievementUnlocked } = useAchievements();
  const toastRef = React.useRef<HTMLDivElement>(null);
  const bounceIn = () => {
    gsap.from(toastRef.current, {
      duration: 1,
      opacity: 0,
      scale: 0,
      y: -200,
      pointerEvents: "none",
    });
    gsap.to(toastRef.current, {
      duration: 1,
      ease: "expo.inOut",
      y: 0,
    });
    gsap.to(toastRef.current, {
      duration: 1,
      ease: "expo.out",
      opacity: 1,
      scale: 1,
      zIndex: 9999,
      pointerEvents: "auto",
    });
  };

  useEffect(() => {
    if (!currentAchievementUnlocked || !toastRef.current) return;
    bounceIn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!currentAchievementUnlocked || !toastRef.current) return;
    //TODO Add back after test is complete
    // return;

    gsap.to(toastRef.current, {
      delay: 8,
      duration: 1,
      opacity: 0,
      y: -200,
      ease: "power3.out",
      onComplete: () => {
        setCurrentAchievementUnlocked(null);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAchievementUnlocked]);
  if (!currentAchievementUnlocked) return null;
  const { title, image, description, rarity, isUnlocked } = currentAchievementUnlocked;

  const unlockedAt =
    isUnlocked && "UnlockedAt" in currentAchievementUnlocked
      ? new Date(currentAchievementUnlocked.unlockedAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;

  const toastClasses = [styles.toast, styles[rarity], positionClassMap[position]].join(" ");

  return (
    <div ref={toastRef} className={styles.toastOverlay}>
      <div className={toastClasses}>
        <div className={styles.cancelButton}>
          <IconButton
            onPointerDownCapture={() => {
              gsap.to(toastRef.current, {
                duration: 1,
                opacity: 0,
                y: -50,
                ease: "power3.out",
                onComplete: () => {
                  setCurrentAchievementUnlocked(null);
                },
              });
            }}
            tooltip="Close"
            icon="outlineCancel"
            variant="primary"
            className={styles.cancelButton}
          />
        </div>
        <HoloFx
          border="brand-alpha-weak"
          aspectRatio={1}
          radius="l"
          shine={{
            opacity: 30,
            blending: "color-dodge",
          }}
          burn={{
            opacity: 30,
            blending: "color-dodge",
          }}
          texture={{
            opacity: 10,
            image: "/images/textures/foil.jpg",
            blending: "color-dodge",
          }}
        >
          {/* Image */}
          {image ? (
            <div className={styles.imageContainer}>
              <Image src={image.src} alt={image.alt} width={64} height={64} />
            </div>
          ) : (
            <div className={styles.placeholder}>
              <Sparkles />
            </div>
          )}
        </HoloFx>
        {/* Content */}
        <div className={styles.content}>
          {/* Header with badge */}
          <div className={styles.header}>
            <h3 className={styles.title}>{title}</h3>
            <ShineFx
              baseOpacity={0.5}
              speed={3.5}
              variant="heading-default-xs"
              className={styles.badge}
            >
              {rarity}
            </ShineFx>
          </div>
          <p className={styles.description}>{description}</p>
          {/* Metadata */}
          {unlockedAt && (
            <div className={styles.metadata}>
              <Line marginY="8" />
              <span>Unlocked at: {unlockedAt}</span>
            </div>
          )}
          {/*<button onClick={bounceIn}>test</button>*/}
        </div>
      </div>
    </div>
  );
};
