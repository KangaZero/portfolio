"use client";
import "./terminal.css";
import "@/components/HeaderDock.css";
import { Dialog } from "@once-ui-system/core";
import { gsap } from "gsap";
import { type MotionProps, motion, useInView } from "motion/react";
import {
  Children,
  createContext,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import { terminalCommand } from "@/resources";
import { LocaleToggle } from "../LocaleToggle";
import { ThemeToggle } from "../ThemeToggle";
import { useUserInfo } from "../UserInfoProvider";

interface SequenceContextValue {
  completeItem: (index: number) => void;
  activeIndex: number;
  sequenceStarted: boolean;
}

const SequenceContext = createContext<SequenceContextValue | null>(null);

const useSequence = () => useContext(SequenceContext);

const ItemIndexContext = createContext<number | null>(null);
const useItemIndex = () => useContext(ItemIndexContext);

interface AnimatedSpanProps extends MotionProps {
  id?: string;
  children: React.ReactNode;
  delay?: number;
  className?: string;
  startOnView?: boolean;
  ref?: React.Ref<HTMLDivElement>;
}

export const AnimatedSpan = ({
  id,
  children,
  delay = 0,
  className,
  startOnView = false,
  ...props
}: AnimatedSpanProps) => {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(elementRef as React.RefObject<Element>, {
    amount: 0.3,
    once: true,
  });

  const sequence = useSequence();
  const itemIndex = useItemIndex();
  const [hasStarted, setHasStarted] = useState(false);
  useEffect(() => {
    if (!sequence || itemIndex === null) return;
    if (!sequence.sequenceStarted) return;
    if (hasStarted) return;
    if (sequence.activeIndex === itemIndex) {
      setHasStarted(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sequence?.activeIndex, sequence?.sequenceStarted, hasStarted, itemIndex]);

  const shouldAnimate = sequence ? hasStarted : startOnView ? isInView : true;

  return (
    <motion.div
      id={id}
      ref={elementRef}
      initial={{ opacity: 0, y: -5 }}
      animate={shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: -5 }}
      transition={{ duration: 0.3, delay: sequence ? 0 : delay / 1000 }}
      className={cn("animated-span grid text-sm font-normal tracking-tight", className)}
      onAnimationComplete={() => {
        if (!sequence) return;
        if (itemIndex === null) return;
        sequence.completeItem(itemIndex);
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

interface TypingAnimationProps extends MotionProps {
  children: string;
  className?: string;
  duration?: number;
  delay?: number;
  as?: React.ElementType;
  startOnView?: boolean;
}

export const TypingAnimation = ({
  children,
  className,
  duration = 60,
  delay = 0,
  as: Component = "span",
  startOnView = true,
  ...props
}: TypingAnimationProps) => {
  if (typeof children !== "string") {
    throw new Error("TypingAnimation: children must be a string. Received:");
  }

  const MotionComponent = useMemo(
    () =>
      motion.create(Component, {
        forwardMotionProps: true,
      }),
    [Component],
  );

  const [displayedText, setDisplayedText] = useState<string>("");
  const [started, setStarted] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(elementRef as React.RefObject<Element>, {
    amount: 0.3,
    once: true,
  });

  const sequence = useSequence();
  const itemIndex = useItemIndex();

  useEffect(() => {
    if (sequence && itemIndex !== null) {
      if (!sequence.sequenceStarted) return;
      if (started) return;
      if (sequence.activeIndex === itemIndex) {
        setStarted(true);
      }
      return;
    }

    if (!startOnView) {
      const startTimeout = setTimeout(() => setStarted(true), delay);
      return () => clearTimeout(startTimeout);
    }

    if (!isInView) return;

    const startTimeout = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    delay,
    startOnView,
    isInView,
    started,
    sequence?.activeIndex,
    sequence?.sequenceStarted,
    itemIndex,
  ]);

  useEffect(() => {
    if (!started) return;

    let i = 0;
    const typingEffect = setInterval(() => {
      if (i < children.length) {
        setDisplayedText(children.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typingEffect);
        if (sequence && itemIndex !== null) {
          sequence.completeItem(itemIndex);
        }
      }
    }, duration);

    return () => {
      clearInterval(typingEffect);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children, duration, started]);

  return (
    <MotionComponent
      ref={elementRef}
      className={cn("animated-span text-sm font-normal tracking-tight", className)}
      {...props}
    >
      {displayedText}
    </MotionComponent>
  );
};

export interface TerminalProps {
  children: React.ReactNode;
  enableDialog?: boolean;
  className?: string;
  sequence?: boolean;
  startOnView?: boolean;
  ref?: RefObject<{ minimizeTerminal: () => void } | null>;
}

export const Terminal = ({
  ref,
  enableDialog = false,
  children,
  className,
  sequence = true,
  startOnView = true,
}: TerminalProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const terminalDialogRef = useRef<HTMLDivElement | null>(null);
  const [isMaximizedDialog, setIsMaximizedDialog] = useState(false);
  const isInView = useInView(containerRef as React.RefObject<Element>, {
    amount: 0.3,
    once: true,
  });

  const { isTerminalOpen, setIsTerminalOpen, setIsStartInitializedStateAndCookie } = useUserInfo();
  const [activeIndex, setActiveIndex] = useState(0);
  const sequenceHasStarted = sequence ? !startOnView || isInView : false;

  const contextValue = useMemo<SequenceContextValue | null>(() => {
    if (!sequence) return null;
    return {
      completeItem: (index: number) => {
        setActiveIndex((current) => (index === current ? current + 1 : current));
        //NOTE: Active Index 5 is "Just before 'Added Wallpaper'"
        if (activeIndex === 5 && containerRef.current) {
          containerRef.current.classList.add("bg-fade-in");
        }
      },
      activeIndex,
      sequenceStarted: sequenceHasStarted,
    };
  }, [sequence, activeIndex, sequenceHasStarted]);

  const wrappedChildren = useMemo(() => {
    if (!sequence) return children;
    const array = Children.toArray(children);
    return array.map((child, index) => (
      <ItemIndexContext.Provider key={index} value={index}>
        {child as React.ReactNode}
      </ItemIndexContext.Provider>
    ));
  }, [children, sequence]);
  const toggleTerminalSize = () => {
    if (!containerRef.current) return;
    if (terminalDialogRef.current) {
      setIsMaximizedDialog(!isMaximizedDialog);
    }
    containerRef.current.classList.toggle("terminal-container-maximized");
    containerRef.current.classList.toggle("terminal-code-area-maximized");
    containerRef.current.scrollIntoView();
  };
  const minimizeTerminal = useCallback(() => {
    if (!containerRef.current) return;
    gsap.fromTo(
      containerRef.current,
      {
        scale: 1,
        x: 0,
        y: 0,
      },
      {
        scale: 0,
        duration: 0.5,
        ease: "power2.inOut",
        x: 0,
        y: -500,
        onComplete: () => {
          if (enableDialog) {
            setIsTerminalOpen(false);
          }
        },
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.shiftKey && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "p") {
      //NOTE: Have to track via styles as a useState seems to result being not updated within the useEffect
      if (enableDialog) setIsTerminalOpen(!isTerminalOpen);
      if (
        containerRef.current &&
        containerRef.current.style.transform === "translate(0px, -500px) scale(0, 0)"
      ) {
        gsap.fromTo(
          containerRef.current,
          {
            scale: 0,
            x: 0,
            y: -500,
          },
          {
            scale: 1,
            duration: 0.5,
            ease: "power2.inOut",
            y: 0,
            onComplete: () => {
              if (!containerRef.current) return;
              containerRef.current.scrollIntoView();
            },
          },
        );
      } else {
        minimizeTerminal();
      }
    }
  };
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useImperativeHandle(ref, () => {
    return {
      minimizeTerminal,
    };
  }, [minimizeTerminal]);

  const content = (
    <div
      ref={containerRef}
      className={cn(`${enableDialog ? "bg-fade-in" : ""} terminal-container`, className)}
    >
      <div className="terminal-header">
        <div className="terminal-dot-group">
          <div
            role="button"
            aria-label="Close"
            className="terminal-dot bg-red-500"
            onPointerDown={() => {
              terminalCommand.start(setIsStartInitializedStateAndCookie);
            }}
          >
            X
          </div>
          <div
            role="button"
            aria-label="Minimize"
            className="terminal-dot bg-yellow-500"
            onPointerDown={minimizeTerminal}
          >
            -
          </div>
          <div
            role="button"
            aria-label="Maximize"
            className="terminal-dot bg-green-500"
            onPointerDown={toggleTerminalSize}
          >
            ■
          </div>
        </div>
        <div className="terminal-header-end">
          <ThemeToggle className="menuIconManual" />
          <LocaleToggle className="menuIconManual" />
        </div>
      </div>
      <pre className="terminal-code-area">
        <code className="terminal-code">{wrappedChildren}</code>
      </pre>
    </div>
  );

  const contentFormat = enableDialog ? (
    <Dialog
      ref={terminalDialogRef}
      className={isMaximizedDialog ? "terminal-container-maximized" : ""}
      title=""
      isOpen={isTerminalOpen}
      onClose={() => setIsTerminalOpen(false)}
    >
      {content}
    </Dialog>
  ) : (
    content
  );

  if (!sequence) return contentFormat;

  return <SequenceContext.Provider value={contextValue}>{contentFormat}</SequenceContext.Provider>;
};
