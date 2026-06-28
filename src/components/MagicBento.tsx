"use client";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, rectSortingStrategy, SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { gsap } from "gsap";
//NOTE: gsap/Flip is the actual path, though doesn't seem to be recognized by local machine
import { Flip } from "gsap/all";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import "./MagicBento.css";
import "@/components/ui/header-date.css";
import { Button, Column, Dialog, Feedback, Kbd, Row, Text } from "@once-ui-system/core";
import { GSDevTools } from "gsap/GSDevTools";
import Image from "next/image";
import { useAchievements } from "@/components/AchievementsProvider";
import { projectCardData } from "@/resources";

export interface BentoCardProps {
  correctIndex: number;
  color?: string;
  title?: string;
  description?: string;
  label?: string;
  image?: string;
  alt?: string;
  textAutoHide?: boolean;
  disableAnimations?: boolean;
}

export interface BentoProps {
  textAutoHide?: boolean;
  enableStars?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  disableAnimations?: boolean;
  spotlightRadius?: number;
  particleCount?: number;
  enableTilt?: boolean;
  glowColor?: string;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
}

const DEFAULT_PARTICLE_COUNT = 12;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
const DEFAULT_GLOW_COLOR = "132, 0, 255";
const MOBILE_BREAKPOINT = 768;

const createParticleElement = (
  x: number,
  y: number,
  color: string = DEFAULT_GLOW_COLOR,
): HTMLDivElement => {
  const el = document.createElement("div");
  el.className = "particle";
  el.style.cssText = `
    position: absolute;
    width: 2px;
    height: 2px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `;
  return el;
};

const calculateSpotlightValues = (radius: number) => ({
  proximity: radius * 0.5,
  fadeDistance: radius * 0.75,
});

const updateCardGlowProperties = (
  card: HTMLElement,
  mouseX: number,
  mouseY: number,
  glow: number,
  radius: number,
) => {
  const rect = card.getBoundingClientRect();
  const relativeX = ((mouseX - rect.left) / rect.width) * 100;
  const relativeY = ((mouseY - rect.top) / rect.height) * 100;

  card.style.setProperty("--glow-x", `${relativeX}%`);
  card.style.setProperty("--glow-y", `${relativeY}%`);
  card.style.setProperty("--glow-intensity", glow.toString());
  card.style.setProperty("--glow-radius", `${radius}px`);
};

const ParticleCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  disableAnimations?: boolean;
  style?: React.CSSProperties;
  particleCount?: number;
  glowColor?: string;
  enableTilt?: boolean;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
}> = ({
  children,
  className = "",
  disableAnimations = false,
  style,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
  enableTilt = true,
  clickEffect = true,
  enableMagnetism = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const isHoveredRef = useRef(false);
  const memoizedParticles = useRef<HTMLDivElement[]>([]);
  const particlesInitialized = useRef(false);
  const magnetismAnimationRef = useRef<gsap.core.Tween | null>(null);

  const initializeParticles = useCallback(() => {
    if (particlesInitialized.current || !cardRef.current) return;

    const { width, height } = cardRef.current.getBoundingClientRect();
    memoizedParticles.current = Array.from({ length: particleCount }, () =>
      createParticleElement(Math.random() * width, Math.random() * height, glowColor),
    );
    particlesInitialized.current = true;
  }, [particleCount, glowColor]);

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    magnetismAnimationRef.current?.kill();

    particlesRef.current.forEach((particle) => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: "back.in(1.7)",
        onComplete: () => {
          particle.parentNode?.removeChild(particle);
        },
      });
    });
    particlesRef.current = [];
  }, []);

  const animateParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) return;

    if (!particlesInitialized.current) {
      initializeParticles();
    }

    memoizedParticles.current.forEach((particle, index) => {
      const timeoutId = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;

        const clone = particle.cloneNode(true) as HTMLDivElement;
        cardRef.current.appendChild(clone);
        particlesRef.current.push(clone);

        gsap.fromTo(
          clone,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" },
        );

        gsap.to(clone, {
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          rotation: Math.random() * 360,
          duration: 2 + Math.random() * 2,
          ease: "none",
          repeat: -1,
          yoyo: true,
        });

        gsap.to(clone, {
          opacity: 0.3,
          duration: 1.5,
          ease: "power2.inOut",
          repeat: -1,
          yoyo: true,
        });
      }, index * 100);

      timeoutsRef.current.push(timeoutId);
    });
  }, [initializeParticles]);

  useEffect(() => {
    if (disableAnimations || !cardRef.current) return;

    const element = cardRef.current;

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      animateParticles();

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 5,
          rotateY: 5,
          duration: 0.3,
          ease: "power2.out",
          transformPerspective: 1000,
        });
      }
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      clearAllParticles();

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      }

      if (enableMagnetism) {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!enableTilt && !enableMagnetism) return;

      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      if (enableTilt) {
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        gsap.to(element, {
          rotateX,
          rotateY,
          duration: 0.1,
          ease: "power2.out",
          transformPerspective: 1000,
        });
      }

      if (enableMagnetism) {
        const magnetX = (x - centerX) * 0.05;
        const magnetY = (y - centerY) * 0.05;

        magnetismAnimationRef.current = gsap.to(element, {
          x: magnetX,
          y: magnetY,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!clickEffect) return;

      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height),
      );

      const ripple = document.createElement("div");
      ripple.style.cssText = `
        position: absolute;
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        pointer-events: none;
        z-index: 1000;
      `;

      element.appendChild(ripple);

      gsap.fromTo(
        ripple,
        {
          scale: 0,
          opacity: 1,
        },
        {
          scale: 1,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          onComplete: () => ripple.remove(),
        },
      );
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);
    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("click", handleClick);

    return () => {
      isHoveredRef.current = false;
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("click", handleClick);
      clearAllParticles();
    };
  }, [
    animateParticles,
    clearAllParticles,
    disableAnimations,
    enableTilt,
    enableMagnetism,
    clickEffect,
    glowColor,
  ]);

  return (
    <div
      ref={cardRef}
      className={`${className} particle-container`}
      style={{ ...style, position: "relative", overflow: "hidden" }}
    >
      {children}
    </div>
  );
};

const GlobalSpotlight: React.FC<{
  gridRef: React.RefObject<HTMLDivElement | null>;
  disableAnimations?: boolean;
  enabled?: boolean;
  spotlightRadius?: number;
  glowColor?: string;
}> = ({
  gridRef,
  disableAnimations = false,
  enabled = true,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  glowColor = DEFAULT_GLOW_COLOR,
}) => {
  const spotlightRef = useRef<HTMLDivElement | null>(null);
  const isInsideSection = useRef(false);

  useEffect(() => {
    if (disableAnimations || !gridRef?.current || !enabled) return;

    const spotlight = document.createElement("div");
    spotlight.className = "global-spotlight";
    spotlight.style.cssText = `
      position: fixed;
      width: 800px;
      height: 800px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.15) 0%,
        rgba(${glowColor}, 0.08) 15%,
        rgba(${glowColor}, 0.04) 25%,
        rgba(${glowColor}, 0.02) 40%,
        rgba(${glowColor}, 0.01) 65%,
        transparent 70%
      );
      z-index: 200;
      opacity: 0;
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
    `;
    document.body.appendChild(spotlight);
    spotlightRef.current = spotlight;

    const handleMouseMove = (e: MouseEvent) => {
      if (!spotlightRef.current || !gridRef.current) return;

      const section = gridRef.current.closest(".bento-section");
      const rect = section?.getBoundingClientRect();
      const mouseInside =
        rect &&
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      isInsideSection.current = mouseInside || false;
      const cards = gridRef.current.querySelectorAll(".magic-bento-card");

      if (!mouseInside) {
        gsap.to(spotlightRef.current, {
          opacity: 0.2,
          duration: 0.3,
          ease: "power2.out",
        });
        cards.forEach((card) => {
          (card as HTMLElement).style.setProperty("--glow-intensity", "0");
        });
        return;
      }

      const { proximity, fadeDistance } = calculateSpotlightValues(spotlightRadius);
      let minDistance = Infinity;

      cards.forEach((card) => {
        const cardElement = card as HTMLElement;
        const cardRect = cardElement.getBoundingClientRect();
        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;
        const distance =
          Math.hypot(e.clientX - centerX, e.clientY - centerY) -
          Math.max(cardRect.width, cardRect.height) / 2;
        const effectiveDistance = Math.max(0, distance);

        minDistance = Math.min(minDistance, effectiveDistance);

        let glowIntensity = 0;
        if (effectiveDistance <= proximity) {
          glowIntensity = 1;
        } else if (effectiveDistance <= fadeDistance) {
          glowIntensity = (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
        }

        updateCardGlowProperties(cardElement, e.clientX, e.clientY, glowIntensity, spotlightRadius);
      });

      gsap.to(spotlightRef.current, {
        left: e.clientX,
        top: e.clientY,
        duration: 0.1,
        ease: "power2.out",
      });

      const targetOpacity =
        minDistance <= proximity
          ? 0.8
          : minDistance <= fadeDistance
            ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8
            : 0;

      gsap.to(spotlightRef.current, {
        opacity: targetOpacity,
        duration: targetOpacity > 0 ? 0.2 : 0.5,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      isInsideSection.current = false;
      gridRef.current?.querySelectorAll(".magic-bento-card").forEach((card) => {
        (card as HTMLElement).style.setProperty("--glow-intensity", "0");
      });
      if (spotlightRef.current) {
        gsap.to(spotlightRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      spotlightRef.current?.parentNode?.removeChild(spotlightRef.current);
    };
  }, [gridRef, disableAnimations, enabled, spotlightRadius, glowColor]);

  return null;
};

const SortableCard: React.FC<{
  id: string;
  card: (typeof projectCardData)[0];
  index: number;
  baseClassName: string;
  cardProps: {
    className: string;
  };
  enableStars: boolean;
  shouldDisableAnimations: boolean;
  particleCount: number;
  glowColor: string;
  enableTilt: boolean;
  clickEffect: boolean;
  enableMagnetism: boolean;
  enableBorderGlow: boolean;
  textAutoHide: boolean;
}> = ({
  id,
  card,
  // index,
  // baseClassName,
  cardProps,
  enableStars,
  shouldDisableAnimations,
  particleCount,
  glowColor,
  enableTilt,
  clickEffect,
  enableMagnetism,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const [isProjectCardOpen, setIsProjectCardOpen] = useState(false);
  const [shouldFlip, setShouldFlip] = useState<boolean | "reverse">(false);
  const cardImageRef = useRef<HTMLDivElement>(null);
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
  };

  useEffect(() => {
    gsap.registerPlugin(Flip);
  }, []);
  useLayoutEffect(() => {
    const flipProjectImage = (retryCount = 0, retries = 5) => {
      if (!shouldFlip) return;

      const projectCardDialog = document.getElementById("project-dialog");
      //NOTE: These 3 elements are related to moving the image
      const projectCardDialogImageDiv = document.getElementById(`project-dialog-image-div-${id}`);
      const originalImageDiv = document.getElementById(`original-project-image-div-${id}`);
      const originalImageElement = document.getElementById(`original-image-${id}`);
      if (!projectCardDialogImageDiv || !projectCardDialog) {
        if (retryCount >= retries) return setIsProjectCardOpen(!isProjectCardOpen);
        return setTimeout(() => flipProjectImage(retryCount + 1), 0);
      }

      //NOTE: These 3 elements are related to moving the title
      const originalTitleElement = document.getElementById(`original-title-placement-${id}`);
      const originalTitleDiv = document.getElementById(`original_text_div-${id}`);
      const dialogTitleElement = document.getElementById("dialog-title");

      //NOTE: These 2 are related to moving the description
      const originalDescriptionElement = document.getElementById(
        `original-description-placement-${id}`,
      );
      const projectCardDialogDescriptionDiv = document.getElementById(
        `project-dialog-description-div`,
      );

      const cardImageState = Flip.getState(originalImageElement);
      const titleState = Flip.getState(originalTitleElement);
      const descriptionState = Flip.getState(originalDescriptionElement);
      if (
        !originalImageElement ||
        !originalImageDiv ||
        !originalTitleElement ||
        !originalTitleDiv ||
        !dialogTitleElement ||
        !originalDescriptionElement ||
        !projectCardDialogDescriptionDiv
      )
        //Default to just closing the dialog if elements not found
        return setIsProjectCardOpen(!isProjectCardOpen);
      if (shouldFlip === "reverse") {
        projectCardDialog.classList.add("project-card-dialog--crumble");
        originalImageElement.classList.toggle("dialog-image");
        originalImageDiv.appendChild(originalImageElement);
        originalTitleElement.classList.remove("dialog-title");
        originalDescriptionElement.classList.remove("p5DateDay", "p5DateMonthDay");
        originalTitleDiv.prepend(originalTitleElement, originalDescriptionElement);
      } else {
        projectCardDialogImageDiv.appendChild(originalImageElement);
        originalImageElement.classList.toggle("dialog-image");
        dialogTitleElement.appendChild(originalTitleElement);
        originalTitleElement.classList.add("dialog-title");
        projectCardDialogDescriptionDiv.appendChild(originalDescriptionElement);
        originalDescriptionElement.classList.add("p5DateDay", "p5DateMonthDay");
      }
      const baseDuration = 0.8;
      Flip.from(titleState, {
        duration: baseDuration,
        scale: true,
        ease: "back.out",
      });
      Flip.from(cardImageState, {
        duration: baseDuration + 0.12,
        scale: true,
        ease: "back.out",
      });
      Flip.from(descriptionState, {
        duration: baseDuration + 0.24,
        scale: true,
        ease: "back.out",
        onComplete: () => {
          if (shouldFlip !== "reverse") return;
          setIsProjectCardOpen(false);
        },
      });
      setShouldFlip(false);
    };
    flipProjectImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldFlip]);

  if (enableStars) {
    return (
      <>
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
          <ParticleCard
            {...cardProps}
            disableAnimations={shouldDisableAnimations}
            particleCount={particleCount}
            glowColor={glowColor}
            enableTilt={enableTilt}
            clickEffect={clickEffect}
            enableMagnetism={enableMagnetism}
          >
            <div className="magic-bento-card__header">
              <div className="magic-bento-card__label">
                <span>
                  <Kbd className="mr-4">{card.correctIndex}</Kbd>
                </span>
                {card.label}
              </div>
              <div
                ref={cardImageRef}
                onPointerDown={() => {
                  if (!cardImageRef.current) return;
                  gsap.registerPlugin(Flip, GSDevTools);
                  setShouldFlip(true);
                  setIsProjectCardOpen(true);
                }}
                className={`magic-bento-card__image`}
                id={`original-project-image-div-${id}`}
              >
                <Image
                  id={`original-image-${id}`}
                  src={card.image || ""}
                  alt={card.title || ""}
                  width={200}
                  height={200}
                />
              </div>
            </div>
            <div className="magic-bento-card__content" id={`original_text_div-${id}`}>
              <h2 className="magic-bento-card__title" id={`original-title-placement-${id}`}>
                {card.title}
              </h2>
              <p
                className="magic-bento-card__description"
                id={`original-description-placement-${id}`}
              >
                {card.description}
              </p>
            </div>
          </ParticleCard>
        </div>
        <Dialog
          isOpen={isProjectCardOpen}
          onClose={() => {
            setShouldFlip("reverse");
          }}
          title=""
          border="info-alpha-weak"
          id="project-dialog"
          className="project-card-dialog"
        >
          <Column fillWidth gap="16">
            <div
              className={`project-card-dialog-image`}
              id={`project-dialog-image-div-${id}`}
            ></div>
            <div role="heading" aria-level={1} id={`dialog-title`}></div>
            <Feedback vertical="center" variant="info" id={`project-dialog-description-div`}>
              {card.description}
            </Feedback>
            <Text>Custom content can be added inside the dialog body.</Text>
            <Button
              variant="primary"
              onPointerDown={() => {
                setShouldFlip("reverse");
              }}
            >
              Close
            </Button>
          </Column>
        </Dialog>
      </>
    );
  }

  // return (
  //   <>
  //     <div
  //       onPointerDown={() => {
  //         setIsProjectCardOpen(true);
  //       }}
  //       ref={setNodeRef}
  //       style={style}
  //       {...attributes}
  //       {...listeners}
  //     >
  //       <div
  //         {...cardProps}
  //         ref={(el) => {
  //           if (!el) return;

  //           // const handleMouseMove = (e: MouseEvent) => {
  //           //   if (shouldDisableAnimations) return;

  //           //   const rect = el.getBoundingClientRect();
  //           //   const x = e.clientX - rect.left;
  //           //   const y = e.clientY - rect.top;
  //           //   const centerX = rect.width / 2;
  //           //   const centerY = rect.height / 2;

  //           //   if (enableTilt) {
  //           //     const rotateX = ((y - centerY) / centerY) * -10;
  //           //     const rotateY = ((x - centerX) / centerX) * 10;
  //           //     gsap.to(el, {
  //           //       rotateX,
  //           //       rotateY,
  //           //       duration: 0.1,
  //           //       ease: "power2.out",
  //           //       transformPerspective: 1000,
  //           //     });
  //           //   }

  //           //   if (enableMagnetism) {
  //           //     const magnetX = (x - centerX) * 0.05;
  //           //     const magnetY = (y - centerY) * 0.05;
  //           //     gsap.to(el, {
  //           //       x: magnetX,
  //           //       y: magnetY,
  //           //       duration: 0.3,
  //           //       ease: "power2.out",
  //           //     });
  //           //   }
  //           // };

  //           const handleMouseLeave = () => {
  //             if (shouldDisableAnimations) return;

  //             if (enableTilt) {
  //               gsap.to(el, {
  //                 rotateX: 0,
  //                 rotateY: 0,
  //                 duration: 0.3,
  //                 ease: "power2.out",
  //               });
  //             }

  //             if (enableMagnetism) {
  //               gsap.to(el, {
  //                 x: 0,
  //                 y: 0,
  //                 duration: 0.3,
  //                 ease: "power2.out",
  //               });
  //             }
  //           };

  //           const handleClick = (e: MouseEvent) => {
  //             if (!clickEffect || shouldDisableAnimations) return;

  //             const rect = el.getBoundingClientRect();
  //             const x = e.clientX - rect.left;
  //             const y = e.clientY - rect.top;

  //             const maxDistance = Math.max(
  //               Math.hypot(x, y),
  //               Math.hypot(x - rect.width, y),
  //               Math.hypot(x, y - rect.height),
  //               Math.hypot(x - rect.width, y - rect.height),
  //             );

  //             const ripple = document.createElement("div");
  //             ripple.style.cssText = `
  //             position: absolute;
  //             width: ${maxDistance * 2}px;
  //             height: ${maxDistance * 2}px;
  //             border-radius: 50%;
  //             background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
  //             left: ${x - maxDistance}px;
  //             top: ${y - maxDistance}px;
  //             pointer-events: none;
  //             z-index: 1000;
  //           `;

  //             el.appendChild(ripple);

  //             gsap.fromTo(
  //               ripple,
  //               {
  //                 scale: 0,
  //                 opacity: 1,
  //               },
  //               {
  //                 scale: 1,
  //                 opacity: 0,
  //                 duration: 0.8,
  //                 ease: "power2.out",
  //                 onComplete: () => ripple.remove(),
  //               },
  //             );
  //           };

  //           el.addEventListener("mouseleave", handleMouseLeave);
  //           el.addEventListener("click", handleClick);
  //         }}
  //       >
  //         <div className="magic-bento-card__header">
  //           <div className="magic-bento-card__label">{card.label}</div>
  //         </div>
  //         <div className="magic-bento-card__content">
  //           <h2 className="magic-bento-card__title">{card.title}</h2>
  //           <p className="magic-bento-card__description">{card.description}</p>
  //         </div>
  //       </div>
  //     </div>
  //     <Dialog
  //       isOpen={isProjectCardOpen}
  //       onClose={() => setIsProjectCardOpen(false)}
  //       title="Customized dialog"
  //       maxWidth={48}
  //       background="danger-weak"
  //       border="danger-medium"
  //     >
  //       <Column fillWidth gap="16">
  //         <Feedback vertical="center" variant="danger">
  //           This dialog has custom styling applied through Flex props. You can
  //           customize the background, border, and other properties.
  //         </Feedback>
  //         <Text onBackground="danger-weak">
  //           Custom content can be added inside the dialog body.
  //         </Text>
  //         <Button variant="danger" onClick={() => setIsProjectCardOpen(false)}>
  //           Close
  //         </Button>
  //       </Column>
  //     </Dialog>
  //   </>
  // );
};

const BentoCardGrid: React.FC<{
  children: React.ReactNode;
  gridRef?: React.RefObject<HTMLDivElement | null>;
}> = ({ children, gridRef }) => (
  <div className="card-grid bento-section" ref={gridRef}>
    {children}
  </div>
);

const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
};

function validateUniqueIds(cards: { id: string }[]) {
  const seen = new Set<string>();
  for (const card of cards) {
    if (seen.has(card.id)) {
      throw new Error(`Duplicate id found: ${card.id}`);
    }
    seen.add(card.id);
  }
  return true;
}

const MagicBento: React.FC<BentoProps> = ({
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  disableAnimations = false,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  particleCount = DEFAULT_PARTICLE_COUNT,
  enableTilt = false,
  glowColor = DEFAULT_GLOW_COLOR,
  clickEffect = true,
  enableMagnetism = true,
}) => {
  const { unlockAchievement } = useAchievements();
  const gridRef = useRef<HTMLDivElement>(null);
  const combinedCardRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const detailContentRef = useRef<HTMLDivElement>(null);
  const detailImageRef = useRef<HTMLImageElement>(null);
  // const cardRefs = useRef<Map<string, HTMLElement>>(new Map());
  const isMobile = useMobileDetection();
  const shouldDisableAnimations = disableAnimations || isMobile;
  const [items, setItems] = useState(() => {
    if (validateUniqueIds(projectCardData)) {
      return projectCardData;
    }
    return [];
  });
  const initialItems = projectCardData;
  const [isCardsCombined, setIsCardsCombined] = useState(false);
  // const [activeCard, setActiveCard] = useState<string | null>(null);

  const appearOneByOneCardAnimation = () => {
    gsap.registerPlugin(ScrollTrigger);
    const grid = gridRef.current;
    if (!grid) return;
    const puzzleCards = grid.querySelectorAll<HTMLElement>(
      ".magic-bento-card:not(.magic-bento-card--combined)",
    );
    puzzleCards.forEach((card, index) => {
      gsap.fromTo(
        card,
        {
          scrollTrigger: {
            trigger: grid,
            start: "top 80%",
            end: "bottom 10%",
            toggleActions: "play none none none",
          },
          opacity: 0.1,
          scale: 0.2,
          rotation: index % 2 === 0 ? -15 : 15,
        },
        {
          scrollTrigger: {
            trigger: grid,
            start: "top 80%",
            end: "bottom 10%",
            toggleActions: "play pause reverse pause",
          },
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.6,
          delay: index * 0.4,
          ease: "power1.out",
        },
      );
    });
  };
  useEffect(() => {
    if (!gridRef.current) return;
    appearOneByOneCardAnimation();
  }, []);

  //NOTE: Only run this in checkIfPuzzleIsSolvedAndExecuteFollowingTransition
  const transitionToSolvedCard = () => {
    if (!gridRef.current) return;
    const grid = gridRef.current as HTMLElement;
    const puzzleCards = grid.querySelectorAll<HTMLElement>(
      ".magic-bento-card:not(.magic-bento-card--combined)",
    );
    const gridRect = grid.getBoundingClientRect();

    // Calculate the center of the grid
    const centerX = gridRect.width / 2;
    const centerY = gridRect.height / 2;

    // Create a GSAP timeline
    const tl = gsap.timeline({
      onComplete: () => {
        setIsCardsCombined(true);
        unlockAchievement("Puzzle Master");
      },
    });

    // Animate each card to the center
    puzzleCards.forEach((card, index) => {
      const cardRect = card.getBoundingClientRect();
      const cardCenterX = cardRect.left - gridRect.left + cardRect.width / 2;
      const cardCenterY = cardRect.top - gridRect.top + cardRect.height / 2;

      // Calculate offset to move card to grid center
      const offsetX = centerX - cardCenterX;
      const offsetY = centerY - cardCenterY;

      tl.to(
        card,
        {
          x: offsetX,
          y: offsetY,
          scale: 0.5,
          opacity: 0.8,
          rotation: (index % 2 === 0 ? 1 : -1) * 10, // Slight rotation for visual interest
          duration: 0.6,
          ease: "power2.inOut",
        },
        0, // Start all at the same time (offset = 0)
      );
    });

    // After cards converge, scale them down and fade out
    tl.to(
      puzzleCards,
      {
        scale: 0,
        opacity: 0,
        duration: 0.4,
        ease: "power2.in",
      },
      0.7, // Start after the initial move
    );

    // Reveal the combined card
    tl.fromTo(
      combinedCardRef.current,
      {
        scale: 0.2,
        opacity: 0,
        rotate: 0,
        x: 0,
        y: -200,
      },
      {
        opacity: 1,
        scale: 1,
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "bounce.out",
      },
      1.4,
    );
    return () => {
      tl.kill();
    };
  };

  //NOTE: Only run this in handleDragEnd
  const checkIfPuzzleIsSolvedAndExecuteFollowingTransition = (
    items: (BentoCardProps & {
      id: string;
    })[],
  ) => {
    const isCorrectIndex = !items.some((item, index) => item.correctIndex !== index);
    if (!isCorrectIndex) return;
    transitionToSolvedCard();
  };

  // Usage (call this once after projectCardData is defined):
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        checkIfPuzzleIsSolvedAndExecuteFollowingTransition(arrayMove(items, oldIndex, newIndex));
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleResetPuzzle = () => {
    const combinedCard = combinedCardRef.current;
    if (!combinedCard) return;
    gsap.to(combinedCard, {
      opacity: 0,
      scale: 0.2,
      duration: 0.5,
      ease: "power2.in",
      y: "-100dvh",
      onComplete: () => {
        appearOneByOneCardAnimation();
        setIsCardsCombined(false);
        setItems(initialItems);
      },
    });
  };

  return (
    <React.Fragment>
      {enableSpotlight && (
        <GlobalSpotlight
          gridRef={gridRef}
          disableAnimations={shouldDisableAnimations}
          enabled={enableSpotlight}
          spotlightRadius={spotlightRadius}
          glowColor={glowColor}
        />
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(e) => {
          handleDragEnd(e);
        }}
      >
        <SortableContext items={items.map((item) => item.id)} strategy={rectSortingStrategy}>
          <BentoCardGrid gridRef={gridRef}>
            <div
              style={{ opacity: isCardsCombined ? 1 : 0 }}
              ref={combinedCardRef}
              className="magic-bento-card magic-bento-card--combined"
            >
              <div className="magic-bento-card__header">
                <span className="magic-bento-card__label">🎉 Puzzle Solved!</span>
              </div>
              <div className="magic-bento-card__content">
                <h3 className="magic-bento-card__title">Congratulations!</h3>
                <p className="magic-bento-card__description">
                  You&apos;ve successfully arranged all the pieces.
                </p>
                <Row center marginTop="12">
                  <Button data-border="rounded" onClick={handleResetPuzzle} size="s">
                    Reset
                  </Button>
                </Row>
              </div>
            </div>
            {!isCardsCombined &&
              items.map((card, index) => {
                const baseClassName = `magic-bento-card ${textAutoHide ? "magic-bento-card--text-autohide" : ""} ${enableBorderGlow ? "magic-bento-card--border-glow" : ""}`;
                const cardProps = {
                  className: baseClassName,
                };

                return (
                  <React.Fragment key={card.id}>
                    <SortableCard
                      key={card.id}
                      id={card.id}
                      card={card}
                      index={index}
                      baseClassName={baseClassName}
                      cardProps={cardProps}
                      enableStars={enableStars}
                      shouldDisableAnimations={shouldDisableAnimations}
                      particleCount={particleCount}
                      glowColor={glowColor}
                      enableTilt={enableTilt}
                      clickEffect={clickEffect}
                      enableMagnetism={enableMagnetism}
                      enableBorderGlow={enableBorderGlow}
                      textAutoHide={textAutoHide}
                    />
                    <div
                      className="detail"
                      ref={detailRef}
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        visibility: "hidden",
                        background: "#fff",
                        borderRadius: "1rem",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                        padding: "2rem",
                        zIndex: 100,
                      }}
                    >
                      <div
                        className="content"
                        ref={detailContentRef}
                        style={{ transform: "translateY(-100%)" }}
                      >
                        <Image
                          src={card.image || ""}
                          alt={card.title || ""}
                          ref={detailImageRef}
                          width={200}
                          height={200}
                        />
                        <div className="title">{card.title}</div>
                        <div className="secondary">{card.label}</div>
                        <div className="description">{card.description}</div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
          </BentoCardGrid>
        </SortableContext>
      </DndContext>
    </React.Fragment>
  );
};

export default MagicBento;
