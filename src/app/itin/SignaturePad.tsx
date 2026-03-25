"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface SignaturePadProps {
  onSave?: (file: File) => void;
  onSign?: (file: File) => void;
  onClose: () => void;
}

interface Point {
  x: number;
  y: number;
  pressure: number;
  time: number;
}

function canvasToFile(canvas: HTMLCanvasElement, filename: string): File {
  const dataUrl = canvas.toDataURL("image/png", 1.0);
  const byteString = atob(dataUrl.split(",")[1]);
  const mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new File([ab], filename, { type: mimeString });
}

export default function SignaturePad({ onSave, onSign, onClose }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const lastPointRef = useRef<Point | null>(null);
  const pointsBufferRef = useRef<Point[]>([]);
  const isDrawingRef = useRef(false);

  // Keep ref in sync so ResizeObserver callback can read it without stale closure
  useEffect(() => {
    isDrawingRef.current = isDrawing;
  }, [isDrawing]);

  // Mount animation
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Focus management on mount
  useEffect(() => {
    if (mounted) {
      canvasRef.current?.focus();
    }
  }, [mounted]);

  // Escape key to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Resize canvas to fill container while maintaining generous height
  const resizeCanvas = useCallback(() => {
    // Skip resize while actively drawing to avoid interrupting a stroke
    if (isDrawingRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = Math.max(container.clientWidth, 300);
    // Generous height: at least 60% of viewport height
    const minHeight = Math.round(window.innerHeight * 0.6);
    const height = Math.max(minHeight, Math.round(width * 0.55), 300);

    const oldWidth = canvas.width;
    const oldHeight = canvas.height;
    const imageData = canvas.toDataURL();

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // White canvas background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Restore drawing scaled to new dimensions
    if (!isEmpty && oldWidth > 0 && oldHeight > 0) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, oldWidth, oldHeight, 0, 0, width, height);
      img.src = imageData;
    }

    // Gradient baseline
    const gradient = ctx.createLinearGradient(24, 0, width - 24, 0);
    gradient.addColorStop(0, "rgba(226,232,240,0)");
    gradient.addColorStop(0.1, "rgba(203,213,225,0.7)");
    gradient.addColorStop(0.9, "rgba(203,213,225,0.7)");
    gradient.addColorStop(1, "rgba(226,232,240,0)");
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(24, height - 48);
    ctx.lineTo(width - 24, height - 48);
    ctx.stroke();
  }, [isEmpty]);

  useEffect(() => {
    resizeCanvas();
    const observer = new ResizeObserver(resizeCanvas);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [resizeCanvas]);

  const getCanvasPoint = (
    canvas: HTMLCanvasElement,
    clientX: number,
    clientY: number,
    pressure = 0.5
  ): Point => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
      pressure,
      time: Date.now(),
    };
  };

  const getLineWidth = (point: Point, prevPoint: Point | null): number => {
    if (!prevPoint) return 2;
    const dx = point.x - prevPoint.x;
    const dy = point.y - prevPoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const timeDelta = point.time - prevPoint.time || 1;
    const speed = distance / timeDelta;
    // Slower = thicker, faster = thinner; clamp between 1 and 4.5
    const speedFactor = Math.max(0, 1 - speed * 0.08);
    const pressureFactor = point.pressure > 0 ? point.pressure : 0.5;
    return Math.max(1, Math.min(4.5, 1.5 + speedFactor * 2.2 + pressureFactor * 1.5));
  };

  const drawSegment = useCallback((from: Point, to: Point) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#1a1a2e";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = getLineWidth(to, from);

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }, []);

  const startDrawing = useCallback((point: Point) => {
    setIsDrawing(true);
    isDrawingRef.current = true;
    setIsEmpty(false);
    lastPointRef.current = point;
    pointsBufferRef.current = [point];

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#1a1a2e";
    ctx.beginPath();
    ctx.arc(point.x, point.y, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const continueDrawing = useCallback(
    (point: Point) => {
      if (!isDrawing || !lastPointRef.current) return;
      drawSegment(lastPointRef.current, point);
      lastPointRef.current = point;
      pointsBufferRef.current.push(point);
    },
    [isDrawing, drawSegment]
  );

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    isDrawingRef.current = false;
    lastPointRef.current = null;
    pointsBufferRef.current = [];
  }, []);

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    startDrawing(getCanvasPoint(canvas, e.clientX, e.clientY, 0.5));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    continueDrawing(getCanvasPoint(canvas, e.clientX, e.clientY, 0.5));
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    stopDrawing();
  };

  // Touch events — no e.preventDefault(); touchAction: "none" on container handles scroll lock
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const touch = e.touches[0];
    // `force` is a non-standard Apple Pencil / 3D Touch property not in the TS lib types
    const force = (touch as Touch & { force?: number }).force ?? 0;
    // Apple Pencil force ranges 0–6.67; normalize to 0–1
    const pressure = force > 0 ? Math.min(force, 1) : 0.5;
    startDrawing(getCanvasPoint(canvas, touch.clientX, touch.clientY, pressure));
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const touch = e.touches[0];
    const force = (touch as Touch & { force?: number }).force ?? 0;
    // Apple Pencil force ranges 0–6.67; normalize to 0–1
    const pressure = force > 0 ? Math.min(force, 1) : 0.5;
    continueDrawing(getCanvasPoint(canvas, touch.clientX, touch.clientY, pressure));
  };

  const handleTouchEnd = () => {
    stopDrawing();
  };

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Redraw gradient baseline
    const gradient = ctx.createLinearGradient(24, 0, canvas.width - 24, 0);
    gradient.addColorStop(0, "rgba(226,232,240,0)");
    gradient.addColorStop(0.1, "rgba(203,213,225,0.7)");
    gradient.addColorStop(0.9, "rgba(203,213,225,0.7)");
    gradient.addColorStop(1, "rgba(226,232,240,0)");
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(24, canvas.height - 48);
    ctx.lineTo(canvas.width - 24, canvas.height - 48);
    ctx.stroke();

    setIsEmpty(true);
    lastPointRef.current = null;
  }, []);

  const handleDone = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;

    const file = canvasToFile(canvas, "signature.png");
    if (onSign) onSign(file);
    if (onSave) onSave(file);
  }, [isEmpty, onSign, onSave]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[#0F1B2D]"
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? "scale(1)" : "scale(0.97)",
        transition: "opacity 300ms ease-out, transform 300ms ease-out",
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Signature Pad"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0 bg-[#0F1B2D]/95 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#4F56E8]/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#818CF8]" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">Sign Here</span>
        </div>
        <button
          onClick={onClose}
          className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl text-white/50 hover:text-white hover:bg-white/10 active:scale-[0.95] transition-all duration-150"
          aria-label="Close signature pad"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Large instruction */}
      <div className="px-5 pt-4 pb-2 shrink-0">
        <p className="text-xl font-bold text-orange-400 text-center">USE THE ENTIRE PAD TO SIGN</p>
        <p className="text-sm text-orange-400/60 text-center mt-1">Sign big and clear — use your finger or stylus
        </p>
      </div>

      {/* Canvas area — fills available space */}
      <div className="flex-1 flex flex-col px-4 pb-2 min-h-0">
        <div
          ref={containerRef}
          className="relative flex-1 rounded-2xl overflow-hidden border border-white/15 bg-white shadow-2xl"
          style={{ minHeight: 300, touchAction: "none" }}
        >
          <canvas
            ref={canvasRef}
            className="block w-full h-full"
            style={{ touchAction: "none", cursor: "crosshair" }}
            tabIndex={0}
            aria-label="Signature drawing area"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />

          {/* "Sign here" placeholder */}
          {isEmpty && (
            <div
              className="absolute inset-0 flex items-end justify-center pointer-events-none select-none pb-16"
              aria-hidden="true"
            >
              <span className="text-slate-300 text-xl font-light italic tracking-widest">
                Sign here
              </span>
            </div>
          )}

          {/* Pen icon hint — top right */}
          {isEmpty && (
            <div className="absolute top-4 right-4 pointer-events-none" aria-hidden="true">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="shrink-0 px-5 pt-3 pb-6 border-t border-white/10 flex items-center gap-4 bg-[#0F1B2D]/95 backdrop-blur-sm">
        <button
          onClick={handleClear}
          disabled={isEmpty}
          className={`min-h-[52px] px-6 rounded-full text-base font-semibold transition-all duration-150 border ${
            isEmpty
              ? "border-white/10 text-white/25 cursor-not-allowed"
              : "border-white/20 text-white bg-white/10 hover:bg-white/15 active:scale-[0.98]"
          }`}
          aria-label="Clear signature"
        >
          Clear
        </button>
        <button
          onClick={handleDone}
          disabled={isEmpty}
          className={`flex-1 min-h-[52px] rounded-full text-base font-bold tracking-wide transition-all duration-150 ${
            isEmpty
              ? "bg-[#4F56E8]/30 text-white/30 cursor-not-allowed"
              : "bg-[#4F56E8] hover:bg-[#5B63F0] active:scale-[0.98] text-white shadow-lg shadow-[#4F56E8]/30"
          }`}
          aria-label={isEmpty ? "Sign above before saving" : "Save signature"}
        >
          {isEmpty ? "Draw your signature above" : "Save Signature"}
        </button>
      </div>
    </div>
  );
}
