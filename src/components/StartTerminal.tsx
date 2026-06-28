"use client";
import { AnimatedSpan, Terminal, TypingAnimation } from "@/components/ui/terminal";
import "@/components/ui/terminal.css";
import { Icon, IconButton, Line } from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useUserInfo } from "@/components/UserInfoProvider";
import { terminalCommand } from "@/resources";
import type { TerminalCommandTypeKeyType } from "@/types";

const StartTerminal = ({ enableDialog }: { enableDialog: boolean }) => {
  const pathname = usePathname();
  const terminalContainerRef = useRef<{ minimizeTerminal: () => void }>(null);
  const { typeSafeUserInfo, isStartInitialized, setIsStartInitializedStateAndCookie } =
    useUserInfo();
  const terminalInputRef = useRef<HTMLInputElement | null>(null);
  const terminalSendBtnRef = useRef<HTMLButtonElement | null>(null);
  const [allUserCommands, setAllUserCommands] = useState<(string | TerminalCommandTypeKeyType)[]>(
    [],
  );
  const [terminalInput, setTerminalInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [caretPos, setCaretPos] = useState(0);

  const handleSendTerminalCommand = () => {
    if (terminalInput.trim() === "" || !terminalInputRef.current || typeof document === "undefined")
      return;

    const allAnimatedSpanElements = document.querySelectorAll(".animated-span");
    const terminalInputDisplayAreaElement = document.getElementById("terminal-input-display-area");
    if (!terminalInputDisplayAreaElement || !allAnimatedSpanElements) return;
    const normalizedTerminalInputCommand = terminalInput
      .toLowerCase()
      .split(" ")[0] as TerminalCommandTypeKeyType;

    setAllUserCommands([...allUserCommands, terminalInput]);
    const terminalInputArguments = terminalInput.split(" ").slice(1).join(" ");

    //NOTE: The last 2 elements are the current input area and the input wrapper, so we exclude them from removal
    const elementsToRemove = Array.from(allAnimatedSpanElements).slice(0, -2);

    switch (normalizedTerminalInputCommand) {
      case "y":
        if (typeof window === "undefined") return;
        if (allUserCommands.length < 1) {
          terminalInputDisplayAreaElement.textContent += `\nCommand not recognized: ${terminalInput}`;
        } else {
          terminalCommand.y(
            allUserCommands[allUserCommands.length - 1],
            terminalInputDisplayAreaElement,
            window,
          );
        }
        break;
      case "n":
        if (typeof window === "undefined") return;
        if (allUserCommands.length < 1) {
          terminalInputDisplayAreaElement.textContent += `\nCommand not recognized: ${terminalInput}`;
        } else {
          terminalCommand.n(
            allUserCommands[allUserCommands.length - 1],
            terminalInputDisplayAreaElement,
          );
        }
        break;
      case "start":
        if (isStartInitialized) {
          terminalInputDisplayAreaElement.textContent += `\nCommand is already initialized`;
        } else {
          terminalCommand.start(setIsStartInitializedStateAndCookie);
        }
        break;
      case "clear":
        terminalCommand.clear(elementsToRemove, terminalInputDisplayAreaElement);
        break;
      case "echo":
        terminalCommand.echo(terminalInputArguments, terminalInputDisplayAreaElement);
        break;
      case "exit":
        if (!terminalContainerRef.current && typeof window === "undefined") return;
        terminalCommand.exit(window, terminalInputDisplayAreaElement, terminalInputArguments);
        break;
      case "fastfetch":
        terminalCommand.fastfetch(terminalInputDisplayAreaElement);
        break;
      case "history":
        terminalCommand.history(
          terminalInputDisplayAreaElement,
          allUserCommands,
          terminalInputArguments,
        );
        break;
      case "help":
        terminalCommand.help(terminalInputDisplayAreaElement);
        break;
      case "ls":
        terminalCommand.ls(pathname, terminalInputDisplayAreaElement);
        break;
      default:
        terminalInputDisplayAreaElement.textContent += `\nCommand not recognized: ${terminalInput}`;
        break;
    }
    setTerminalInput("");
  };

  //WARNING: Cannot derivatively put the AppendArea directly between AnimatedSpans as it will cause elements after it to not render in
  useEffect(() => {
    if (!terminalInputRef.current) return;
    terminalInputRef.current.focus();
  }, [terminalInputRef]);

  const inputBar = (
    <div
      onPointerDown={() => {
        terminalInputRef.current?.focus();
      }}
      onFocus={() => terminalInputRef.current?.focus()}
      className="terminal-input-container"
    >
      <input
        ref={terminalInputRef}
        id="terminal-input"
        value={terminalInput}
        onChange={(e) => {
          // terminalInputRef?.current?.scrollIntoView();
          setTerminalInput(e.target.value);
          setCaretPos(e.target.selectionStart ?? e.target.value.length);
        }}
        onPointerDown={(e) => {
          const target = e.target as HTMLInputElement;
          setCaretPos(target.selectionStart ?? terminalInput.length);
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoComplete="off"
        spellCheck={false}
        className="terminal-input-native"
        style={{
          position: "absolute",
          opacity: 0,
          pointerEvents: "none",
          width: "100%",
          left: 0,
          top: 0,
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            setCaretPos(terminalInputRef.current?.selectionStart ?? terminalInput.length);
          }
          if (e.key === "ArrowRight" && e.ctrlKey) {
            e.preventDefault();
            const words = terminalInput
              .slice(caretPos)
              .split(/(\s+)/)
              .filter((word) => word.length > 0);
            if (words.length === 0) return;
            const firstWord = words[0];
            const newCaretPos = caretPos + firstWord.length;
            setCaretPos(newCaretPos);
            setTimeout(() => {
              terminalInputRef.current?.setSelectionRange(newCaretPos, newCaretPos);
            }, 0);
          }
          if (e.key === "ArrowLeft" && e.ctrlKey) {
            e.preventDefault();
            const words = terminalInput
              .slice(0, caretPos)
              .split(/(\s+)/)
              .filter((word) => word.length > 0);
            if (words.length === 0) return;
            const lastWord = words[words.length - 1];
            const newCaretPos = caretPos - lastWord.length;
            setCaretPos(newCaretPos);
            setTimeout(() => {
              terminalInputRef.current?.setSelectionRange(newCaretPos, newCaretPos);
            }, 0);
          }

          if (e.key === "Enter") {
            e.preventDefault();
            handleSendTerminalCommand();
          }
        }}
      />
      {typeSafeUserInfo && (
        <div id="terminal-user-info-icons">
          <Icon name={typeSafeUserInfo.platform} size="s" />
          <Line vert height="32" marginX="4" />
          <Icon
            name={typeSafeUserInfo.bluetoothSupported ? "bluetooth" : "bluetoothDisabled"}
            size="s"
          />
          <Line vert height="32" marginX="4" />
          {typeSafeUserInfo.batteryIcon !== "batteryUnknown" && typeSafeUserInfo.batteryLevel && (
            <IconButton
              variant="secondary"
              style={{ pointerEvents: "none" }}
              tooltip={`${String(typeSafeUserInfo.batteryLevel)}%`}
              icon={typeSafeUserInfo.batteryIcon}
              size="s"
            />
          )}
          <Line vert height="32" marginX="4" />
        </div>
      )}
      <pre className="terminal-input-display">
        {terminalInput.slice(0, caretPos)}
        <span className={`custom-caret${isFocused ? " blink" : ""}`} />
        {terminalInput.slice(caretPos)}
      </pre>
      <IconButton
        ref={terminalSendBtnRef}
        id="terminal-send-btn"
        tooltip="Send Command (Enter)"
        icon="send"
        size="m"
        onPointerDown={handleSendTerminalCommand}
      />
    </div>
  );

  const terminalToShow = enableDialog ? (
    <Terminal ref={terminalContainerRef} enableDialog={enableDialog}>
      <span id="terminal-input-display-area" className="animated-span">
        {""}
      </span>
      <span className="terminal-input-wrapper animated-span">{inputBar}</span>
    </Terminal>
  ) : (
    <Terminal ref={terminalContainerRef} enableDialog={enableDialog}>
      <TypingAnimation>&gt; bunx samuel-yong/portfolio@latest init</TypingAnimation>

      <AnimatedSpan className="text-green-500">✔ Preflight checks.</AnimatedSpan>

      <AnimatedSpan className="text-green-500">✔ Added content</AnimatedSpan>

      <AnimatedSpan className="text-green-500">✔ Added styles</AnimatedSpan>

      <AnimatedSpan className="text-green-500">✔ Added scripts</AnimatedSpan>

      <AnimatedSpan className="text-green-500">✔ Added dependencies</AnimatedSpan>

      <AnimatedSpan className="text-green-500">✔ Added wallpaper</AnimatedSpan>

      <AnimatedSpan className="text-blue-500">
        <span>ℹ Found 1 project:</span>
        <span className="pl-2">- portfolio/me.exe</span>
      </AnimatedSpan>

      <AnimatedSpan className="text-muted">Success! Project initialization completed.</AnimatedSpan>

      <AnimatedSpan className="text-muted">exit code: 0</AnimatedSpan>
      <AnimatedSpan id="terminal-input-display-area">{""}</AnimatedSpan>
      <AnimatedSpan className="terminal-input-wrapper">{inputBar}</AnimatedSpan>
    </Terminal>
  );
  return terminalToShow;
};

export default StartTerminal;
