"use client";

import {
  Button,
  Column,
  Dialog,
  Heading,
  IconButton,
  Input,
  Row,
  Text,
  ToggleButton,
  useTheme,
} from "@once-ui-system/core";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./DrawingPanel.module.scss";
import StarBorder from "./StarBorder";

// Base types for drawing data
interface LineData {
  points: { x: number; y: number }[];
}

interface RectangleData {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CircleData {
  x: number;
  y: number;
  radius: number;
}

interface TextData {
  x: number;
  y: number;
  text: string;
  fontSize?: number;
}

interface ImageData {
  x: number;
  y: number;
  width: number;
  height: number;
  image: HTMLImageElement;
}

// Discriminated union for type-safe drawing objects
type DrawingObject =
  | {
      id: string;
      type: "line";
      data: LineData;
      color: string;
      lineWidth: number;
    }
  | {
      id: string;
      type: "rectangle";
      data: RectangleData;
      color: string;
      lineWidth: number;
    }
  | {
      id: string;
      type: "circle";
      data: CircleData;
      color: string;
      lineWidth: number;
    }
  | {
      id: string;
      type: "text";
      data: TextData;
      color: string;
    }
  | {
      id: string;
      type: "image";
      data: ImageData;
    };

type Tool = "select" | "pen" | "eraser" | "rectangle" | "circle" | "text" | "image";

type BackgroundType = "white" | "dark" | "transparent" | "custom" | "gradient";

interface GradientConfig {
  type: "linear" | "radial";
  colors: string[];
  angle?: number;
}

interface SelectionState {
  objectId: string | null;
  isDragging: boolean;
  isResizing: boolean;
  isRotating: boolean;
  dragStart: { x: number; y: number } | null;
  resizeHandle: string | null;
}
export default function DrawingPanel() {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isTextDialogOpen, setIsTextDialogOpen] = useState(false);
  const [currentTool, setCurrentTool] = useState<Tool>("pen");
  const [currentColor, setCurrentColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(2);
  const [objects, setObjects] = useState<DrawingObject[]>([]);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [textInput, setTextInput] = useState("");
  const [textPosition, setTextPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);

  const [currentMousePos, setCurrentMousePos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [hoverHandle, setHoverHandle] = useState<string | null>(null);
  const [history, setHistory] = useState<DrawingObject[][]>([[]]);
  const [historyStep, setHistoryStep] = useState(0);

  const [selection, setSelection] = useState<SelectionState>({
    objectId: null,
    isDragging: false,
    isResizing: false,
    isRotating: false,
    dragStart: null,
    resizeHandle: null,
  });

  // Background settings
  const [backgroundType, setBackgroundType] = useState<BackgroundType>("white");
  // Defaults to white
  const [customBackground, setCustomBackground] = useState("#ffffff");
  const [showBackgroundMenu, setShowBackgroundMenu] = useState(false);
  const [gradientConfig, setGradientConfig] = useState<GradientConfig>({
    type: "linear",
    colors: ["#ffffff", "#000000"],
    angle: 45,
  });

  const getCanvasBackground = useCallback(() => {
    switch (backgroundType) {
      case "white":
        return "#ffffff";
      case "dark":
        return "#2d2d2d";
      case "transparent":
        return "transparent";
      case "custom":
        return customBackground;
      case "gradient":
        if (gradientConfig.type === "linear") {
          return `linear-gradient(${gradientConfig.angle}deg, ${gradientConfig.colors.join(", ")})`;
        } else {
          return `radial-gradient(circle, ${gradientConfig.colors.join(", ")})`;
        }
      default:
        return "#ffffff";
    }
  }, [backgroundType, customBackground, gradientConfig, theme]);

  const getObjectBounds = useCallback((obj: DrawingObject) => {
    switch (obj.type) {
      case "line": {
        const xs = obj.data.points.map((p) => p.x);
        const ys = obj.data.points.map((p) => p.y);
        return {
          x: Math.min(...xs),
          y: Math.min(...ys),
          width: Math.max(...xs) - Math.min(...xs),
          height: Math.max(...ys) - Math.min(...ys),
        };
      }
      case "rectangle":
        return {
          x: obj.data.x,
          y: obj.data.y,
          width: obj.data.width,
          height: obj.data.height,
        };
      case "circle":
        return {
          x: obj.data.x - obj.data.radius,
          y: obj.data.y - obj.data.radius,
          width: obj.data.radius * 2,
          height: obj.data.radius * 2,
        };
      case "text": {
        const fontSize = obj.data.fontSize || 20;
        const textWidth = obj.data.text.length * fontSize * 0.6;
        return {
          x: obj.data.x,
          y: obj.data.y - fontSize,
          width: textWidth,
          height: fontSize,
        };
      }
      case "image":
        return {
          x: obj.data.x,
          y: obj.data.y,
          width: obj.data.width,
          height: obj.data.height,
        };
    }
  }, []);

  const isPointInBounds = useCallback(
    (x: number, y: number, bounds: { x: number; y: number; width: number; height: number }) => {
      return (
        x >= bounds.x &&
        x <= bounds.x + bounds.width &&
        y >= bounds.y &&
        y <= bounds.y + bounds.height
      );
    },
    [],
  );

  const getHandleAtPosition = useCallback(
    (x: number, y: number, bounds: { x: number; y: number; width: number; height: number }) => {
      const padding = 8;
      const handleSize = 8;
      const hitboxPadding = 4; // Extra padding for easier clicking

      const handles = [
        {
          name: "nw",
          x: bounds.x - padding,
          y: bounds.y - padding,
          cursor: "nwse-resize",
        },
        {
          name: "n",
          x: bounds.x + bounds.width / 2,
          y: bounds.y - padding,
          cursor: "ns-resize",
        },
        {
          name: "ne",
          x: bounds.x + bounds.width + padding,
          y: bounds.y - padding,
          cursor: "nesw-resize",
        },
        {
          name: "e",
          x: bounds.x + bounds.width + padding,
          y: bounds.y + bounds.height / 2,
          cursor: "ew-resize",
        },
        {
          name: "se",
          x: bounds.x + bounds.width + padding,
          y: bounds.y + bounds.height + padding,
          cursor: "nwse-resize",
        },
        {
          name: "s",
          x: bounds.x + bounds.width / 2,
          y: bounds.y + bounds.height + padding,
          cursor: "ns-resize",
        },
        {
          name: "sw",
          x: bounds.x - padding,
          y: bounds.y + bounds.height + padding,
          cursor: "nesw-resize",
        },
        {
          name: "w",
          x: bounds.x - padding,
          y: bounds.y + bounds.height / 2,
          cursor: "ew-resize",
        },
      ];

      for (const handle of handles) {
        if (
          x >= handle.x - handleSize / 2 - hitboxPadding &&
          x <= handle.x + handleSize / 2 + hitboxPadding &&
          y >= handle.y - handleSize / 2 - hitboxPadding &&
          y <= handle.y + handleSize / 2 + hitboxPadding
        ) {
          return handle;
        }
      }
      return null;
    },
    [],
  );

  const resizeObject = useCallback(
    (obj: DrawingObject, handle: string, dx: number, dy: number): DrawingObject => {
      const bounds = getObjectBounds(obj);

      const newBounds = { ...bounds };

      // Calculate new bounds based on handle
      switch (handle) {
        case "nw":
          newBounds.x += dx;
          newBounds.y += dy;
          newBounds.width -= dx;
          newBounds.height -= dy;
          break;
        case "n":
          newBounds.y += dy;
          newBounds.height -= dy;
          break;
        case "ne":
          newBounds.y += dy;
          newBounds.width += dx;
          newBounds.height -= dy;
          break;
        case "e":
          newBounds.width += dx;
          break;
        case "se":
          newBounds.width += dx;
          newBounds.height += dy;
          break;
        case "s":
          newBounds.height += dy;
          break;
        case "sw":
          newBounds.x += dx;
          newBounds.width -= dx;
          newBounds.height += dy;
          break;
        case "w":
          newBounds.x += dx;
          newBounds.width -= dx;
          break;
      }

      // Prevent negative sizes
      if (newBounds.width < 10) newBounds.width = 10;
      if (newBounds.height < 10) newBounds.height = 10;

      // Apply new bounds to object
      switch (obj.type) {
        case "rectangle":
          return {
            ...obj,
            data: {
              x: newBounds.x,
              y: newBounds.y,
              width: newBounds.width,
              height: newBounds.height,
            },
          };
        case "circle": {
          const radius = Math.max(newBounds.width, newBounds.height) / 2;
          return {
            ...obj,
            data: {
              x: newBounds.x + radius,
              y: newBounds.y + radius,
              radius: radius,
            },
          };
        }
        case "text":
          return {
            ...obj,
            data: {
              ...obj.data,
              x: newBounds.x,
              y: newBounds.y + (obj.data.fontSize || 20),
              fontSize: Math.max(10, newBounds.height),
            },
          };
        case "image":
          return {
            ...obj,
            data: {
              ...obj.data,
              x: newBounds.x,
              y: newBounds.y,
              width: newBounds.width,
              height: newBounds.height,
            },
          };
        case "line": {
          // Scale points proportionally
          const scaleX = newBounds.width / bounds.width;
          const scaleY = newBounds.height / bounds.height;
          return {
            ...obj,
            data: {
              points: obj.data.points.map((p) => ({
                x: newBounds.x + (p.x - bounds.x) * scaleX,
                y: newBounds.y + (p.y - bounds.y) * scaleY,
              })),
            },
          };
        }
        default:
          return obj;
      }
    },
    [getObjectBounds],
  );
  const drawSelection = useCallback(
    (ctx: CanvasRenderingContext2D, obj: DrawingObject) => {
      const bounds = getObjectBounds(obj);
      const padding = 8;

      ctx.strokeStyle = "#0066ff";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        bounds.x - padding,
        bounds.y - padding,
        bounds.width + padding * 2,
        bounds.height + padding * 2,
      );
      ctx.setLineDash([]);

      const handleSize = 8;
      const handles = [
        { x: bounds.x - padding, y: bounds.y - padding },
        { x: bounds.x + bounds.width / 2, y: bounds.y - padding },
        { x: bounds.x + bounds.width + padding, y: bounds.y - padding },
        {
          x: bounds.x + bounds.width + padding,
          y: bounds.y + bounds.height / 2,
        },
        {
          x: bounds.x + bounds.width + padding,
          y: bounds.y + bounds.height + padding,
        },
        {
          x: bounds.x + bounds.width / 2,
          y: bounds.y + bounds.height + padding,
        },
        { x: bounds.x - padding, y: bounds.y + bounds.height + padding },
        { x: bounds.x - padding, y: bounds.y + bounds.height / 2 },
      ];

      ctx.fillStyle = "#0066ff";
      handles.forEach((handle) => {
        ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
      });
    },
    [getObjectBounds],
  );
  const drawObject = useCallback((ctx: CanvasRenderingContext2D, obj: DrawingObject) => {
    // Set styles based on object type
    if (obj.type !== "image") {
      ctx.strokeStyle = obj.color;
      ctx.fillStyle = obj.color;
    }

    if (obj.type !== "image" && obj.type !== "text") {
      ctx.lineWidth = obj.lineWidth;
    }

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    switch (obj.type) {
      case "line":
        ctx.beginPath();
        if (obj.data.points.length > 0) {
          ctx.moveTo(obj.data.points[0].x, obj.data.points[0].y);
          obj.data.points.forEach((point) => {
            ctx.lineTo(point.x, point.y);
          });
          ctx.stroke();
        }
        break;

      case "rectangle":
        ctx.strokeRect(obj.data.x, obj.data.y, obj.data.width, obj.data.height);
        break;

      case "circle":
        ctx.beginPath();
        ctx.arc(obj.data.x, obj.data.y, obj.data.radius, 0, Math.PI * 2);
        ctx.stroke();
        break;

      case "text":
        ctx.font = `${obj.data.fontSize || 20}px Arial`;
        ctx.fillText(obj.data.text, obj.data.x, obj.data.y);
        break;

      case "image":
        if (obj.data.image?.complete) {
          ctx.drawImage(obj.data.image, obj.data.x, obj.data.y, obj.data.width, obj.data.height);
        }
        break;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set background
    const bg = getCanvasBackground();
    if (backgroundType === "gradient") {
      // For gradients, we need to use a different approach
      const grad =
        gradientConfig.type === "linear"
          ? ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
          : ctx.createRadialGradient(
              canvas.width / 2,
              canvas.height / 2,
              0,
              canvas.width / 2,
              canvas.height / 2,
              canvas.width / 2,
            );

      gradientConfig.colors.forEach((color, index) => {
        grad.addColorStop(index / (gradientConfig.colors.length - 1), color);
      });
      ctx.fillStyle = grad;
    } else if (backgroundType !== "transparent") {
      ctx.fillStyle = bg;
    }

    if (backgroundType !== "transparent") {
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    objects.forEach((obj) => {
      drawObject(ctx, obj);
    });

    if (isDrawing && startPos && currentMousePos) {
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (currentTool === "pen") {
        ctx.beginPath();
        ctx.moveTo(currentPath[0].x, currentPath[0].y);
        for (let i = 1; i < currentPath.length; i++) {
          ctx.lineTo(currentPath[i].x, currentPath[i].y);
        }
        ctx.stroke();
      } else if (currentTool === "rectangle") {
        const width = currentMousePos.x - startPos.x;
        const height = currentMousePos.y - startPos.y;
        ctx.strokeRect(startPos.x, startPos.y, width, height);
      } else if (currentTool === "circle") {
        const radius = Math.sqrt(
          (currentMousePos.x - startPos.x) ** 2 + (currentMousePos.y - startPos.y) ** 2,
        );
        ctx.beginPath();
        ctx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Draw selection
    if (selection.objectId) {
      const selectedObj = objects.find((obj) => obj.id === selection.objectId);
      if (selectedObj) {
        drawSelection(ctx, selectedObj);
      }
    }
  }, [
    objects,
    currentPath,
    isDrawing,
    currentColor,
    lineWidth,
    currentTool,
    startPos,
    currentMousePos,
    drawObject,
    backgroundType,
    customBackground,
    gradientConfig,
    getCanvasBackground,
    selection,
    drawSelection,
  ]);

  const resetSelection = () => {
    setSelection({
      objectId: null,
      isDragging: false,
      isResizing: false,
      isRotating: false,
      dragStart: null,
      resizeHandle: null,
    });
  };

  const getMousePos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const getTouchPos = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const pos = getMousePos(e);
      setIsDrawing(true);

      if (currentTool === "select") {
        let selected = false;

        // First, check if clicking on a selected object's resize handle
        if (selection.objectId) {
          const selectedObj = objects.find((obj) => obj.id === selection.objectId);
          if (selectedObj) {
            const bounds = getObjectBounds(selectedObj);
            const handle = getHandleAtPosition(pos.x, pos.y, bounds);

            if (handle) {
              // Clicked on a resize handle
              setSelection({
                objectId: selectedObj.id,
                isDragging: false,
                isResizing: true,
                isRotating: false,
                dragStart: pos,
                resizeHandle: handle.name,
              });
              selected = true;
              return;
            }
          }
        }

        // Check if clicking on an object
        for (let i = objects.length - 1; i >= 0; i--) {
          const bounds = getObjectBounds(objects[i]);
          if (isPointInBounds(pos.x, pos.y, bounds)) {
            setSelection({
              objectId: objects[i].id,
              isDragging: true,
              isResizing: false,
              isRotating: false,
              dragStart: pos,
              resizeHandle: null,
            });
            selected = true;
            break;
          }
        }

        if (!selected || currentTool !== "select") {
          resetSelection();
        }
      } else if (currentTool === "pen") {
        setStartPos(pos);
        setCurrentPath([pos]);
      } else if (currentTool === "rectangle" || currentTool === "circle") {
        setStartPos(pos);
        setCurrentMousePos(pos);
      } else if (currentTool === "text") {
        setTextPosition(pos);
        setIsTextDialogOpen(true);
      } else if (currentTool === "eraser") {
        setCurrentPath([pos]);
      }
    },
    [
      currentTool,
      getMousePos,
      objects,
      getObjectBounds,
      isPointInBounds,
      selection.objectId,
      getHandleAtPosition,
    ],
  );
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const pos = getTouchPos(e);
      setIsDrawing(true);

      if (currentTool === "pen") {
        setCurrentPath([pos]);
      } else if (currentTool === "rectangle" || currentTool === "circle") {
        setStartPos(pos);
      } else if (currentTool === "text") {
        setTextPosition(pos);
      } else if (currentTool === "eraser") {
        setCurrentPath([pos]);
      }
    },
    [currentTool, getTouchPos],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const pos = getMousePos(e);
      setCurrentMousePos(pos);

      // Update cursor for hover states when in select mode
      if (currentTool === "select" && !isDrawing && selection.objectId) {
        const selectedObj = objects.find((obj) => obj.id === selection.objectId);
        if (selectedObj) {
          const bounds = getObjectBounds(selectedObj);
          const handle = getHandleAtPosition(pos.x, pos.y, bounds);

          if (handle) {
            setHoverHandle(handle.name);
            // Cursor will be set in the canvas style based on hoverHandle
          } else if (isPointInBounds(pos.x, pos.y, bounds)) {
            setHoverHandle("move");
          } else {
            setHoverHandle(null);
          }
        }
      } else if (currentTool !== "select") {
        setHoverHandle(null);
      }

      if (!isDrawing) return;

      if (currentTool === "select" && selection.objectId && selection.dragStart) {
        const dx = pos.x - selection.dragStart.x;
        const dy = pos.y - selection.dragStart.y;

        if (selection.isResizing && selection.resizeHandle) {
          // Perform resize
          setObjects((prev) =>
            prev.map((obj) => {
              if (obj.id === selection.objectId && selection.resizeHandle) {
                return resizeObject(obj, selection.resizeHandle, dx, dy);
              }
              return obj;
            }),
          );
          setSelection((prev) => ({ ...prev, dragStart: pos }));
        } else if (selection.isDragging) {
          // Perform move
          setObjects((prev) =>
            prev.map((obj) => {
              if (obj.id === selection.objectId) {
                switch (obj.type) {
                  case "line":
                    return {
                      ...obj,
                      data: {
                        points: obj.data.points.map((p) => ({
                          x: p.x + dx,
                          y: p.y + dy,
                        })),
                      },
                    };
                  case "rectangle":
                    return {
                      ...obj,
                      data: {
                        ...obj.data,
                        x: obj.data.x + dx,
                        y: obj.data.y + dy,
                      },
                    };
                  case "circle":
                    return {
                      ...obj,
                      data: {
                        ...obj.data,
                        x: obj.data.x + dx,
                        y: obj.data.y + dy,
                      },
                    };
                  case "text":
                    return {
                      ...obj,
                      data: {
                        ...obj.data,
                        x: obj.data.x + dx,
                        y: obj.data.y + dy,
                      },
                    };
                  case "image":
                    return {
                      ...obj,
                      data: {
                        ...obj.data,
                        x: obj.data.x + dx,
                        y: obj.data.y + dy,
                      },
                    };
                }
              }
              return obj;
            }),
          );
          setSelection((prev) => ({ ...prev, dragStart: pos }));
        }
      } else if (currentTool === "pen") {
        setCurrentPath((prev) => [...prev, pos]);
      } else if (currentTool === "rectangle" || currentTool === "circle") {
        setCurrentMousePos(pos);
      } else if (currentTool === "eraser") {
        const eraserRadius = lineWidth * 1.5;
        setObjects((prev) =>
          prev.filter((obj) => {
            const bounds = getObjectBounds(obj);
            return !(
              pos.x >= bounds.x - eraserRadius &&
              pos.x <= bounds.x + bounds.width + eraserRadius &&
              pos.y >= bounds.y - eraserRadius &&
              pos.y <= bounds.y + bounds.height + eraserRadius
            );
          }),
        );
        setCurrentPath((prev) => [...prev, pos]);
      }
    },
    [
      isDrawing,
      currentTool,
      getMousePos,
      selection,
      lineWidth,
      getObjectBounds,
      objects,
      getHandleAtPosition,
      isPointInBounds,
      resizeObject,
    ],
  );
  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      if (!isDrawing) return;

      const pos = getTouchPos(e);

      if (currentTool === "pen") {
        setCurrentPath((prev) => [...prev, pos]);
      } else if (currentTool === "eraser") {
        setCurrentPath((prev) => [...prev, pos]);
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (ctx) {
          const bgColor = getCanvasBackground();
          ctx.strokeStyle = backgroundType === "transparent" ? "rgba(255,255,255,1)" : bgColor;
          ctx.lineWidth = lineWidth * 3;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";

          if (currentPath.length > 0) {
            ctx.beginPath();
            ctx.moveTo(
              currentPath[currentPath.length - 1].x,
              currentPath[currentPath.length - 1].y,
            );
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
          }
        }
      }
    },
    [
      isDrawing,
      currentTool,
      getTouchPos,
      currentPath,
      lineWidth,
      backgroundType,
      getCanvasBackground,
    ],
  );

  const addObject = useCallback(
    (obj: DrawingObject) => {
      const newObjects = [...objects, obj];
      setObjects(newObjects);

      // Update history
      const newHistory = history.slice(0, historyStep + 1);
      newHistory.push(newObjects);
      setHistory(newHistory);
      setHistoryStep(newHistory.length - 1);
    },
    [objects, history, historyStep],
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;

      const pos = getMousePos(e);
      setIsDrawing(false);

      if (currentTool === "select" && (selection.isDragging || selection.isResizing)) {
        setSelection((prev) => ({
          ...prev,
          isDragging: false,
          isResizing: false,
          dragStart: null,
          resizeStart: null,
        }));
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push([...objects]);
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
        return;
      }

      if (currentTool === "pen" && currentPath.length > 0) {
        const newObject: DrawingObject = {
          id: Date.now().toString(),
          type: "line",
          data: { points: currentPath },
          color: currentColor,
          lineWidth: lineWidth,
        };
        addObject(newObject);
        setCurrentPath([]);
      } else if (currentTool === "rectangle" && startPos) {
        const newObject: DrawingObject = {
          id: Date.now().toString(),
          type: "rectangle",
          data: {
            x: startPos.x,
            y: startPos.y,
            width: pos.x - startPos.x,
            height: pos.y - startPos.y,
          },
          color: currentColor,
          lineWidth: lineWidth,
        };
        addObject(newObject);
        setStartPos(null);
      } else if (currentTool === "circle" && startPos) {
        const radius = Math.sqrt((pos.x - startPos.x) ** 2 + (pos.y - startPos.y) ** 2);
        const newObject: DrawingObject = {
          id: Date.now().toString(),
          type: "circle",
          data: {
            x: startPos.x,
            y: startPos.y,
            radius: radius,
          },
          color: currentColor,
          lineWidth: lineWidth,
        };
        addObject(newObject);
        setStartPos(null);
      } else if (currentTool === "eraser") {
        setCurrentPath([]);
      }
    },
    [
      isDrawing,
      getMousePos,
      currentTool,
      selection.isDragging,
      selection.isResizing,
      currentPath,
      startPos,
      history,
      historyStep,
      objects,
      currentColor,
      lineWidth,
      addObject,
    ],
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      if (!isDrawing) return;

      setIsDrawing(false);

      if (currentTool === "pen" && currentPath.length > 0) {
        const newObject: DrawingObject = {
          id: Date.now().toString(),
          type: "line",
          data: { points: currentPath },
          color: currentColor,
          lineWidth: lineWidth,
        };
        addObject(newObject);
        setCurrentPath([]);
      } else if (currentTool === "eraser") {
        setCurrentPath([]);
      }
    },
    [isDrawing, currentTool, currentPath, currentColor, lineWidth, addObject],
  );

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          if (!canvas) return;

          const maxWidth = canvas.width * 0.5;
          const maxHeight = canvas.height * 0.5;
          let width = img.width;
          let height = img.height;

          // Scale image to fit canvas
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }

          const newObject: DrawingObject = {
            id: Date.now().toString(),
            type: "image",
            data: {
              image: img,
              x: 50,
              y: 50,
              width: width,
              height: height,
            },
          };
          addObject(newObject);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    },
    [addObject],
  );

  const handleAddText = useCallback(() => {
    if (!textInput || !textPosition) return;

    const newObject: DrawingObject = {
      id: Date.now().toString(),
      type: "text",
      data: {
        text: textInput,
        x: textPosition.x,
        y: textPosition.y,
        fontSize: 20,
      },
      color: currentColor,
    };
    addObject(newObject);
    setTextInput("");
    setTextPosition(null);
  }, [textInput, textPosition, currentColor, addObject]);

  const handleClear = useCallback(() => {
    setObjects([]);
    setHistory([[]]);
    setHistoryStep(0);
  }, []);

  const handleUndo = useCallback(() => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1);
      setObjects(history[historyStep - 1]);
    }
  }, [historyStep, history]);

  const handleRedo = useCallback(() => {
    if (historyStep < history.length - 1) {
      setHistoryStep(historyStep + 1);
      setObjects(history[historyStep + 1]);
    }
  }, [historyStep, history]);

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "drawing.png";
    link.href = canvas.toDataURL();
    link.click();
  }, []);

  const handleDeleteLayer = useCallback(
    (id: string) => {
      const newObjects = objects.filter((o) => o.id !== id);
      setObjects(newObjects);
      const newHistory = history.slice(0, historyStep + 1);
      newHistory.push(newObjects);
      setHistory(newHistory);
      setHistoryStep(newHistory.length - 1);
    },
    [objects, history, historyStep],
  );

  const handleCopySelected = useCallback(() => {
    if (!selection.objectId) return;
    const selectedObj = objects.find((obj) => obj.id === selection.objectId);
    if (!selectedObj) return;

    const newObject: DrawingObject = {
      ...selectedObj,
      id: Date.now().toString(),
    } as DrawingObject;

    switch (newObject.type) {
      case "line":
        newObject.data = {
          points: newObject.data.points.map((p) => ({
            x: p.x + 10,
            y: p.y + 10,
          })),
        };
        break;
      case "rectangle":
        newObject.data = {
          ...newObject.data,
          x: newObject.data.x + 10,
          y: newObject.data.y + 10,
        };
        break;
      case "circle":
        newObject.data = {
          ...newObject.data,
          x: newObject.data.x + 10,
          y: newObject.data.y + 10,
        };
        break;
      case "text":
        newObject.data = {
          ...newObject.data,
          x: newObject.data.x + 10,
          y: newObject.data.y + 10,
        };
        break;
      case "image":
        newObject.data = {
          ...newObject.data,
          x: newObject.data.x + 10,
          y: newObject.data.y + 10,
        };
        break;
    }

    addObject(newObject);
    setSelection({ ...selection, objectId: newObject.id });
  }, [selection, objects, addObject]);

  const handleDeleteSelected = useCallback(() => {
    if (selection.objectId) {
      handleDeleteLayer(selection.objectId);
    }
  }, [selection, handleDeleteLayer]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y for redo
      if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "z") ||
        ((e.ctrlKey || e.metaKey) && e.key === "y")
      ) {
        e.preventDefault();
        handleRedo();
      }
      // Ctrl/Cmd + S for download
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleDownload();
      }
      // Delete key for clear
      if (e.key === "Delete" && e.shiftKey) {
        e.preventDefault();
        handleClear();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "c" && selection.objectId) {
        e.preventDefault();
        handleCopySelected();
      }
      if (e.key === "Delete") {
        if (e.shiftKey) {
          e.preventDefault();
          handleClear();
        } else if (selection.objectId) {
          e.preventDefault();
          handleDeleteSelected();
        }
      }
      // Tool shortcuts
      if (e.key === "p") {
        setCurrentTool("pen");
      } else {
        resetSelection();
      }

      if (e.key === "e") {
        setCurrentTool("eraser");
      } else if (e.key === "r") {
        setCurrentTool("rectangle");
      } else if (e.key === "c") {
        setCurrentTool("circle");
      } else if (e.key === "t") {
        setCurrentTool("text");
      } else if (e.key === "v") {
        setCurrentTool("select");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    handleUndo,
    handleRedo,
    handleDownload,
    handleClear,
    handleCopySelected,
    handleDeleteSelected,
    selection,
  ]);

  return (
    <Column fillWidth gap="m" role="application" aria-label="Drawing Panel Application">
      {/* Header */}
      <Row fillWidth horizontal="between" vertical="center" className={styles.header}>
        <Heading variant="display-strong-s" as="h2">
          Drawing Panel
        </Heading>
        <Row gap="s" className={styles.headerActions}>
          <Button
            variant="secondary"
            size="s"
            onClick={handleUndo}
            disabled={historyStep === 0}
            aria-label="Undo last action"
            aria-keyshortcuts="Control+Z"
          >
            Undo
          </Button>
          <Button
            variant="secondary"
            size="s"
            onClick={handleRedo}
            disabled={historyStep === history.length - 1}
            aria-label="Redo last undone action"
            aria-keyshortcuts="Control+Shift+Z"
          >
            Redo
          </Button>
          {selection.objectId && (
            <>
              <Button
                variant="secondary"
                size="s"
                onClick={handleCopySelected}
                aria-label="Copy selected object"
                aria-keyshortcuts="Control+C"
              >
                Copy
              </Button>
              <Button
                variant="danger"
                size="s"
                onClick={handleDeleteSelected}
                aria-label="Delete selected object"
                aria-keyshortcuts="Delete"
              >
                Delete
              </Button>
            </>
          )}
          <Button
            variant="secondary"
            size="s"
            onClick={handleClear}
            aria-label="Clear entire canvas"
            aria-keyshortcuts="Shift+Delete"
          >
            Clear
          </Button>
          <Button
            variant="primary"
            size="s"
            onClick={handleDownload}
            aria-label="Download canvas as PNG image"
            aria-keyshortcuts="Control+S"
          >
            Download
          </Button>
        </Row>
      </Row>

      <Row fillWidth gap="m" className={styles.mainContainer}>
        {/* Toolbar */}
        <Column
          gap="s"
          padding="m"
          className={styles.toolbar}
          role="toolbar"
          aria-label="Drawing tools"
        >
          <Text variant="label-default-s" as="h3" style={{ marginBottom: "8px" }}>
            Tools
          </Text>

          <ToggleButton
            selected={currentTool === "select"}
            onClick={() => {
              resetSelection();
              setCurrentTool("select");
            }}
            size="m"
            fillWidth
            aria-label="Select tool"
            aria-pressed={currentTool === "select"}
            aria-keyshortcuts="v"
          >
            Select (V)
          </ToggleButton>

          <ToggleButton
            selected={currentTool === "pen"}
            onClick={() => {
              resetSelection();
              setCurrentTool("pen");
            }}
            size="m"
            fillWidth
            aria-label="Pen tool for freehand drawing"
            aria-pressed={currentTool === "pen"}
            aria-keyshortcuts="p"
          >
            Pen (P)
          </ToggleButton>

          <ToggleButton
            selected={currentTool === "eraser"}
            onClick={() => {
              resetSelection();
              setCurrentTool("eraser");
            }}
            size="m"
            fillWidth
            aria-label="Eraser tool"
            aria-pressed={currentTool === "eraser"}
            aria-keyshortcuts="e"
          >
            Eraser (E)
          </ToggleButton>

          <ToggleButton
            selected={currentTool === "rectangle"}
            onClick={() => {
              resetSelection();
              setCurrentTool("rectangle");
            }}
            size="m"
            fillWidth
            aria-label="Rectangle shape tool"
            aria-pressed={currentTool === "rectangle"}
            aria-keyshortcuts="r"
          >
            Rectangle (R)
          </ToggleButton>

          <ToggleButton
            selected={currentTool === "circle"}
            onClick={() => {
              resetSelection();
              setCurrentTool("circle");
            }}
            size="m"
            fillWidth
            aria-label="Circle shape tool"
            aria-pressed={currentTool === "circle"}
            aria-keyshortcuts="c"
          >
            Circle (C)
          </ToggleButton>

          <ToggleButton
            selected={currentTool === "text"}
            onClick={() => {
              resetSelection();
              setCurrentTool("text");
            }}
            size="m"
            fillWidth
            aria-label="Text tool"
            aria-pressed={currentTool === "text"}
            aria-keyshortcuts="t"
          >
            Text (T)
          </ToggleButton>

          <div className={styles.toolSection}>
            <Text variant="label-default-s" as="h3" style={{ marginBottom: "8px" }}>
              Color
            </Text>
            <label htmlFor="color-picker" className="visually-hidden">
              Choose drawing color
            </label>
            <input
              id="color-picker"
              type="color"
              value={currentColor}
              onChange={(e) => {
                setCurrentColor(e.target.value);
                if (currentTool === "select" && selection.objectId) {
                  setObjects((prev) =>
                    prev.map((obj) => {
                      if (obj.id === selection.objectId) {
                        return { ...obj, color: e.target.value };
                      }
                      return obj;
                    }),
                  );
                }
              }}
              className={styles.colorPicker}
              aria-label="Color picker for drawing"
            />
          </div>

          <div className={styles.toolSection}>
            <Text variant="label-default-s" as="h3" style={{ marginBottom: "8px" }}>
              Line Width: {lineWidth}px
            </Text>
            <label htmlFor="line-width-slider" className="visually-hidden">
              Adjust line width from 1 to 20 pixels
            </label>
            <input
              id="line-width-slider"
              type="range"
              min="1"
              max="20"
              value={lineWidth}
              onChange={(e) => {
                setLineWidth(Number(e.target.value));
                if (currentTool === "select" && selection.objectId) {
                  setObjects((prev) =>
                    prev.map((obj) => {
                      if (obj.id === selection.objectId) {
                        return { ...obj, lineWidth: Number(e.target.value) };
                      }
                      return obj;
                    }),
                  );
                }
              }}
              className={styles.slider}
              aria-valuemin={1}
              aria-valuemax={20}
              aria-valuenow={lineWidth}
              aria-label={`Line width: ${lineWidth} pixels`}
            />
          </div>

          <div className={styles.toolSection}>
            <Text variant="label-default-s" as="h3" style={{ marginBottom: "8px" }}>
              Background
            </Text>
            <Column gap="xs">
              <Button
                variant={backgroundType === "white" ? "primary" : "secondary"}
                size="s"
                fillWidth
                onClick={() => setBackgroundType("white")}
                aria-label="Set white background with theme switching"
                aria-pressed={backgroundType === "white"}
              >
                White
              </Button>
              <Button
                variant={backgroundType === "dark" ? "primary" : "secondary"}
                size="s"
                fillWidth
                onClick={() => setBackgroundType("dark")}
                aria-label="Set dark grey background"
                aria-pressed={backgroundType === "dark"}
              >
                Dark Grey
              </Button>
              <Button
                variant={backgroundType === "transparent" ? "primary" : "secondary"}
                size="s"
                fillWidth
                onClick={() => setBackgroundType("transparent")}
                aria-label="Set transparent background"
                aria-pressed={backgroundType === "transparent"}
              >
                Transparent
              </Button>
              <Button
                variant="secondary"
                size="s"
                fillWidth
                onClick={() => setShowBackgroundMenu(!showBackgroundMenu)}
                aria-label="Show custom background options"
                aria-expanded={showBackgroundMenu}
              >
                {showBackgroundMenu ? "Hide" : "Custom"}
              </Button>
            </Column>

            {showBackgroundMenu && (
              <Column gap="xs" paddingTop="s" role="region" aria-label="Custom background settings">
                <Text variant="label-default-xs" style={{ marginTop: "8px" }}>
                  Custom Color
                </Text>
                <Row gap="xs" vertical="center">
                  <label htmlFor="custom-bg-color" className="visually-hidden">
                    Custom background color picker
                  </label>
                  <input
                    id="custom-bg-color"
                    type="color"
                    value={customBackground}
                    onChange={(e) => {
                      setCustomBackground(e.target.value);
                      setBackgroundType("custom");
                    }}
                    className={styles.colorPicker}
                    style={{ height: "32px" }}
                    aria-label="Custom background color"
                  />
                  <label htmlFor="custom-bg-hex" className="visually-hidden">
                    Custom background hex/rgba value
                  </label>
                  <Input
                    id="custom-bg-hex"
                    value={customBackground}
                    onChange={(e) => {
                      setCustomBackground(e.target.value);
                      setBackgroundType("custom");
                    }}
                    placeholder="#ffffff"
                    style={{ fontSize: "12px" }}
                    aria-label="Enter hex or rgba color value"
                  />
                </Row>

                <Text variant="label-default-xs" style={{ marginTop: "8px" }}>
                  Gradient
                </Text>
                <Column gap="xs">
                  <Row gap="xs">
                    <Button
                      variant={gradientConfig.type === "linear" ? "primary" : "secondary"}
                      size="s"
                      fillWidth
                      onClick={() => {
                        setGradientConfig({
                          ...gradientConfig,
                          type: "linear",
                        });
                        setBackgroundType("gradient");
                      }}
                      aria-label="Linear gradient"
                      aria-pressed={gradientConfig.type === "linear"}
                    >
                      Linear
                    </Button>
                    <Button
                      variant={gradientConfig.type === "radial" ? "primary" : "secondary"}
                      size="s"
                      fillWidth
                      onClick={() => {
                        setGradientConfig({
                          ...gradientConfig,
                          type: "radial",
                        });
                        setBackgroundType("gradient");
                      }}
                      aria-label="Radial gradient"
                      aria-pressed={gradientConfig.type === "radial"}
                    >
                      Radial
                    </Button>
                  </Row>
                  <Row gap="xs">
                    <label htmlFor="gradient-color-1" className="visually-hidden">
                      Gradient first color
                    </label>
                    <input
                      id="gradient-color-1"
                      type="color"
                      value={gradientConfig.colors[0] || "#ffffff"}
                      onChange={(e) => {
                        const newColors = [...gradientConfig.colors];
                        newColors[0] = e.target.value;
                        setGradientConfig({
                          ...gradientConfig,
                          colors: newColors,
                        });
                        setBackgroundType("gradient");
                      }}
                      className={styles.colorPicker}
                      style={{ height: "32px", flex: 1 }}
                      aria-label="First gradient color"
                    />
                    <label htmlFor="gradient-color-2" className="visually-hidden">
                      Gradient second color
                    </label>
                    <input
                      id="gradient-color-2"
                      type="color"
                      value={gradientConfig.colors[1] || "#000000"}
                      onChange={(e) => {
                        const newColors = [...gradientConfig.colors];
                        newColors[1] = e.target.value;
                        setGradientConfig({
                          ...gradientConfig,
                          colors: newColors,
                        });
                        setBackgroundType("gradient");
                      }}
                      className={styles.colorPicker}
                      style={{ height: "32px", flex: 1 }}
                      aria-label="Second gradient color"
                    />
                  </Row>
                  {gradientConfig.type === "linear" && (
                    <>
                      <Text variant="label-default-xs">Angle: {gradientConfig.angle}°</Text>
                      <label htmlFor="gradient-angle" className="visually-hidden">
                        Gradient angle slider
                      </label>
                      <input
                        id="gradient-angle"
                        type="range"
                        min="0"
                        max="360"
                        value={gradientConfig.angle || 45}
                        onChange={(e) => {
                          setGradientConfig({
                            ...gradientConfig,
                            angle: Number(e.target.value),
                          });
                          setBackgroundType("gradient");
                        }}
                        className={styles.slider}
                        aria-valuemin={0}
                        aria-valuemax={360}
                        aria-valuenow={gradientConfig.angle || 45}
                        aria-label={`Gradient angle: ${gradientConfig.angle || 45} degrees`}
                      />
                    </>
                  )}
                </Column>
              </Column>
            )}
          </div>

          <div className={styles.toolSection}>
            <Text variant="label-default-s" as="h3" style={{ marginBottom: "8px" }}>
              Upload Image
            </Text>
            <label htmlFor="image-upload" className="visually-hidden">
              Upload image file to canvas
            </label>
            <input
              id="image-upload"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className={styles.fileInput}
              aria-label="Upload image to canvas"
            />
          </div>
        </Column>
        {/* Canvas */}
        <Column
          fillWidth
          className={styles.canvasContainer}
          style={{
            flex: 1,
            background:
              backgroundType === "transparent"
                ? 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><rect width="10" height="10" fill="%23ccc"/><rect x="10" y="10" width="10" height="10" fill="%23ccc"/></svg>\')'
                : "var(--neutral-alpha-weak)",
          }}
          role="img"
          aria-label="Drawing canvas"
        >
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
              setIsDrawing(false);
              setHoverHandle(null);
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={styles.canvas}
            style={{
              width: "100%",
              height: "100%",
              touchAction: "none",
              cursor:
                currentTool === "pen"
                  ? "crosshair"
                  : currentTool === "eraser"
                    ? "pointer"
                    : currentTool === "text"
                      ? "text"
                      : currentTool === "select"
                        ? hoverHandle === "move"
                          ? "move"
                          : hoverHandle === "nw" || hoverHandle === "se"
                            ? "nwse-resize"
                            : hoverHandle === "ne" || hoverHandle === "sw"
                              ? "nesw-resize"
                              : hoverHandle === "n" || hoverHandle === "s"
                                ? "ns-resize"
                                : hoverHandle === "e" || hoverHandle === "w"
                                  ? "ew-resize"
                                  : "default"
                        : currentTool === "rectangle" || currentTool === "circle"
                          ? "crosshair"
                          : "default",
            }}
            aria-label="Interactive drawing canvas. Use mouse or touch to draw."
            tabIndex={0}
          />
        </Column>

        {/* Layers Panel */}
        <Column
          gap="s"
          padding="m"
          className={styles.layersPanel}
          role="region"
          aria-label="Layers panel"
        >
          <Text variant="label-default-s" as="h3" style={{ marginBottom: "8px" }}>
            Layers ({objects.length})
          </Text>

          <div role="list" aria-label="Canvas layers">
            {objects.map((obj, index) => (
              <Row
                key={obj.id}
                gap="s"
                padding="s"
                className={styles.layerItem}
                role="listitem"
                aria-label={`Layer ${index + 1}: ${obj.type}`}
                style={{
                  background:
                    selection.objectId === obj.id ? "var(--accent-alpha-weak)" : "var(--surface)",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setCurrentTool("select");
                  setSelection({
                    objectId: obj.id,
                    isDragging: false,
                    isResizing: false,
                    isRotating: false,
                    dragStart: null,
                    resizeHandle: null,
                  });
                }}
              >
                <Text variant="body-default-xs" style={{ flex: 1 }}>
                  {obj.type} {index + 1}
                </Text>
                <IconButton
                  icon="trash"
                  size="s"
                  variant="ghost"
                  onClick={() => handleDeleteLayer(obj.id)}
                  tooltip="Delete layer"
                  aria-label={`Delete ${obj.type} layer ${index + 1}`}
                />
              </Row>
            ))}
          </div>

          {objects.length === 0 && (
            <Text
              variant="body-default-xs"
              style={{ color: "var(--neutral-alpha-medium)" }}
              className={styles.emptyLayers}
              role="status"
              aria-live="polite"
            >
              No layers yet
            </Text>
          )}
        </Column>
      </Row>

      {/* Keyboard shortcuts info */}
      <Column gap="xs" paddingTop="s" style={{ fontSize: "12px", opacity: 0.7 }}>
        <Text variant="label-default-xs" as="p">
          <strong>Keyboard Shortcuts:</strong> Ctrl+Z (Undo), Ctrl+Shift+Z (Redo), Ctrl+S
          (Download), P (Pen), E (Eraser), R (Rectangle), C (Circle), T (Text), V (Select)
        </Text>
      </Column>
      <Dialog
        isOpen={isTextDialogOpen}
        onClose={() => setIsTextDialogOpen(false)}
        title="Add Text"
        maxWidth={48}
        footer={
          <Row gap="s">
            <Button
              onClick={() => {
                handleAddText();
                setIsTextDialogOpen(false);
              }}
              size="s"
              fillWidth
              aria-label="Add text to canvas"
            >
              Add Text
            </Button>
            <Button
              onClick={() => {
                setTextInput("");
                setTextPosition(null);
                setIsTextDialogOpen(false);
              }}
              size="s"
              fillWidth
              variant="secondary"
              aria-label="Cancel text input"
            >
              Cancel
            </Button>
          </Row>
        }
      >
        <Row>
          <div className={styles.toolSection}>
            <Text variant="label-default-s" as="h3" style={{ marginBottom: "8px" }}>
              Color
            </Text>
            <label htmlFor="color-picker" className="visually-hidden">
              Choose drawing color
            </label>
            <input
              id="color-picker"
              type="color"
              value={currentColor}
              onChange={(e) => setCurrentColor(e.target.value)}
              className={styles.colorPicker}
              aria-label="Color picker for drawing"
            />
          </div>
        </Row>
        <label htmlFor="text-input" className="visually-hidden">
          Enter text to add to canvas
        </label>
        <StarBorder as="button" color="orange" speed="3s" thickness={1}>
          <Input
            id="text-input"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Enter text"
            style={{ marginBottom: "8px" }}
            aria-label="Text input for canvas"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddText();
              } else if (e.key === "Escape") {
                setTextInput("");
                setTextPosition(null);
                setIsTextDialogOpen(false);
              }
            }}
          />
        </StarBorder>
      </Dialog>
    </Column>
  );
}
