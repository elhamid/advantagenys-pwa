"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface DocumentScannerProps {
  onCapture: (file: File) => void;
  onClose: () => void;
  label?: string;
}

type ScannerState = "initializing" | "live" | "preview" | "denied" | "fallback";

const GUIDE_ASPECT = 85.6 / 53.98; // ISO/IEC 7810 ID-1 (passport/card) width:height

export default function DocumentScanner({
  onCapture,
  onClose,
  label = "Scan Document",
}: DocumentScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<ScannerState>("initializing");
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [processedFile, setProcessedFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [shutterFlash, setShutterFlash] = useState(false);

  // Detect iOS
  const isIOS =
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

  // Mount animation
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Escape key handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Delayed hint text
  useEffect(() => {
    if (state !== "live") {
      setHintVisible(false);
      return;
    }
    const t = setTimeout(() => setHintVisible(true), 1000);
    return () => clearTimeout(t);
  }, [state]);

  // Stop all tracks and clear video srcObject
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Start rear camera stream
  const startCamera = useCallback(async () => {
    // Guard: check mediaDevices API exists
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setState("fallback");
      setErrorMsg(
        "Camera is not available on this device. Please upload a photo instead."
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setState("live");
    } catch (err: unknown) {
      const error = err as { name?: string };
      if (
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError"
      ) {
        setState("denied");
        setErrorMsg(
          "Camera access was denied. Please allow camera access in your browser settings."
        );
      } else {
        setState("fallback");
        setErrorMsg(
          "Camera is unavailable on this device. Please upload a photo instead."
        );
      }
    }
  }, []);

  // Start camera on mount, cleanup on unmount
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  // Process canvas: auto-crop to guide rect, contrast boost, output JPEG
  const processImage = useCallback((rawCanvas: HTMLCanvasElement): File | null => {
    try {
      const srcW = rawCanvas.width;
      const srcH = rawCanvas.height;

      const shortSide = Math.min(srcW, srcH);
      const guideW = shortSide * 0.8;
      const guideH = guideW / GUIDE_ASPECT;
      const guideX = (srcW - guideW) / 2;
      const guideY = (srcH - guideH) / 2;

      const cropCanvas = document.createElement("canvas");
      const outW = Math.round(guideW);
      const outH = Math.round(guideH);
      cropCanvas.width = outW;
      cropCanvas.height = outH;
      const cropCtx = cropCanvas.getContext("2d");
      if (!cropCtx) return null;

      cropCtx.drawImage(rawCanvas, guideX, guideY, guideW, guideH, 0, 0, outW, outH);

      const imageData = cropCtx.getImageData(0, 0, outW, outH);
      const data = imageData.data;
      const contrast = 1.15;
      const intercept = 128 * (1 - contrast);
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, Math.max(0, data[i] * contrast + intercept));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * contrast + intercept));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * contrast + intercept));
      }
      cropCtx.putImageData(imageData, 0, 0);

      const dataUrl = cropCanvas.toDataURL("image/jpeg", 0.85);
      const byteString = atob(dataUrl.split(",")[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: "image/jpeg" });
      return new File([blob], `document-scan-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
    } catch {
      return null;
    }
  }, []);

  const handleCapture = useCallback(() => {
    if (capturing) return; // Guard against double-tap

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0) return;

    setCapturing(true);

    // Shutter flash effect
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 200);

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setCapturing(false);
      return;
    }
    ctx.drawImage(video, 0, 0);

    const previewUrl = canvas.toDataURL("image/jpeg", 0.9);
    const file = processImage(canvas);

    if (!file) {
      // Canvas processing failed — stay on live, show transient error
      setErrorMsg("Failed to process image. Please try again.");
      setCapturing(false);
      return;
    }

    setCapturedDataUrl(previewUrl);
    setProcessedFile(file);

    // Stop camera after successful capture
    stopCamera();
    setState("preview");
    setCapturing(false);
  }, [capturing, processImage, stopCamera]);

  const handleRetake = useCallback(async () => {
    if (restarting) return; // Prevent double-clicks

    setRestarting(true);
    setCapturing(false);
    setCapturedDataUrl(null);
    setProcessedFile(null);
    setHintVisible(false);
    setErrorMsg("");

    // Stop any remaining tracks and clear srcObject
    stopCamera();

    // Transition to initializing immediately so user sees spinner
    setState("initializing");

    // Small delay to let browser release the camera device
    await new Promise((resolve) => setTimeout(resolve, 150));

    await startCamera();
    setRestarting(false);
  }, [startCamera, stopCamera, restarting]);

  const handleAccept = useCallback(() => {
    if (processedFile) {
      onCapture(processedFile);
    }
  }, [processedFile, onCapture]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          ctx.drawImage(img, 0, 0);
          const processed = processImage(canvas);
          if (processed) onCapture(processed);
        };
        img.src = ev.target?.result as string;
      };
      reader.readAsDataURL(file);
    },
    [processImage, onCapture]
  );

  const handleTryAgain = useCallback(async () => {
    stopCamera();
    setErrorMsg("");
    setState("initializing");
    await startCamera();
  }, [startCamera, stopCamera]);

  const handleClose = useCallback(() => {
    stopCamera();
    onClose();
  }, [stopCamera, onClose]);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 z-50 flex flex-col bg-[#0F1B2D]"
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? "scale(1)" : "scale(0.97)",
        transition: "opacity 300ms ease-out, transform 300ms ease-out",
      }}
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      {/* Header — always visible on every state */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0 bg-[#0F1B2D]/95 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {/* Camera icon */}
          <div className="w-9 h-9 rounded-xl bg-[#4F56E8]/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#818CF8]" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">{label}</span>
        </div>
        <button
          onClick={handleClose}
          className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl text-white/50 hover:text-white hover:bg-white/10 active:scale-[0.95] transition-all duration-150"
          aria-label="Close scanner"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col items-center justify-center overflow-hidden relative">

        {/* INITIALIZING */}
        {state === "initializing" && (
          <div className="flex flex-col items-center gap-4 text-white/60">
            <div className="w-12 h-12 rounded-full border-2 border-[#4F56E8] border-t-transparent animate-spin" />
            <p className="text-sm font-medium tracking-wide">Starting camera&hellip;</p>
          </div>
        )}

        {/* LIVE */}
        {state === "live" && (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            {/* Shutter flash overlay */}
            <div
              className="absolute inset-0 bg-white pointer-events-none z-10"
              style={{
                opacity: shutterFlash ? 0.5 : 0,
                transition: shutterFlash ? "opacity 50ms ease-in" : "opacity 150ms ease-out",
              }}
            />
            {/* Guide cutout with box-shadow dimmed surround */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
                  style={{ width: "80%", aspectRatio: `${GUIDE_ASPECT}`, borderRadius: 8 }}
                >
                  {/* Animated corner brackets */}
                  {(["tl", "tr", "bl", "br"] as const).map((corner) => (
                    <span
                      key={corner}
                      className="absolute w-8 h-8 animate-pulse"
                      style={{
                        top: corner.startsWith("t") ? -2 : "auto",
                        bottom: corner.startsWith("b") ? -2 : "auto",
                        left: corner.endsWith("l") ? -2 : "auto",
                        right: corner.endsWith("r") ? -2 : "auto",
                        borderTop: corner.startsWith("t") ? "3px solid #4F56E8" : "none",
                        borderBottom: corner.startsWith("b") ? "3px solid #4F56E8" : "none",
                        borderLeft: corner.endsWith("l") ? "3px solid #4F56E8" : "none",
                        borderRight: corner.endsWith("r") ? "3px solid #4F56E8" : "none",
                        borderRadius: corner === "tl" ? "4px 0 0 0" : corner === "tr" ? "0 4px 0 0" : corner === "bl" ? "0 0 0 4px" : "0 0 4px 0",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Hint text — delayed fade-in */}
            <div
              className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none"
              style={{
                opacity: hintVisible ? 1 : 0,
                transform: hintVisible ? "translateY(0)" : "translateY(6px)",
                transition: "opacity 500ms ease, transform 500ms ease",
              }}
            >
              <span className="text-white/90 text-sm font-medium bg-black/60 backdrop-blur-sm rounded-full px-5 py-2 tracking-wide">
                Position your document within the frame
              </span>
            </div>
          </div>
        )}

        {/* PREVIEW */}
        {state === "preview" && capturedDataUrl && (
          <div className="relative w-full h-full flex items-center justify-center bg-[#060E18] p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={capturedDataUrl}
              alt="Captured document"
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
            />
            {/* Green checkmark badge */}
            <div className="absolute top-5 right-5 w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <div className="absolute bottom-5 left-0 right-0 px-6 text-center">
              <p className="text-white/50 text-xs font-medium tracking-wide">
                Image will be cropped and enhanced before saving
              </p>
            </div>
          </div>
        )}

        {/* DENIED */}
        {state === "denied" && (
          <div className="flex flex-col items-center gap-5 px-8 text-center max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-xl mb-2">Camera Access Denied</p>
              {isIOS ? (
                <p className="text-white/50 text-sm leading-relaxed">
                  To enable camera, go to Settings &rsaquo; Safari &rsaquo; Camera and allow access for this site.
                </p>
              ) : (
                <p className="text-white/50 text-sm leading-relaxed">{errorMsg}</p>
              )}
            </div>
            {!isIOS && (
              <button
                onClick={handleTryAgain}
                className="min-h-[52px] w-full px-8 bg-white/10 hover:bg-white/15 active:scale-[0.95] text-white font-semibold rounded-full transition-all duration-150 text-base border border-white/15"
                aria-label="Try requesting camera permission again"
              >
                Try Again
              </button>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="min-h-[52px] w-full px-8 bg-[#4F56E8] hover:bg-[#5B63F0] active:scale-[0.95] text-white font-semibold rounded-full transition-all duration-150 text-base shadow-lg shadow-[#4F56E8]/30"
              aria-label="Upload a photo from your device"
            >
              Upload a Photo Instead
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* FALLBACK */}
        {state === "fallback" && (
          <div className="flex flex-col items-center gap-5 px-8 text-center max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-xl mb-2">Upload a Photo</p>
              <p className="text-white/50 text-sm leading-relaxed">
                {errorMsg || "Camera is not available. Please upload a photo of your document."}
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="min-h-[52px] w-full px-8 bg-[#4F56E8] hover:bg-[#5B63F0] active:scale-[0.95] text-white font-semibold rounded-full transition-all duration-150 text-base shadow-lg shadow-[#4F56E8]/30"
              aria-label="Choose a photo from your device"
            >
              Choose Photo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}
      </div>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Footer actions */}
      {(state === "live" || state === "preview") && (
        <div className="shrink-0 px-6 py-5 border-t border-white/10 flex items-center justify-center gap-4 bg-[#0F1B2D]/95 backdrop-blur-sm">
          {state === "live" && (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleCapture}
                disabled={capturing}
                className="w-20 h-20 rounded-full bg-white border-[4px] border-[#4F56E8] hover:bg-blue-50 active:scale-[0.95] transition-all duration-150 flex items-center justify-center shadow-xl shadow-[#4F56E8]/20 disabled:opacity-60 disabled:pointer-events-none"
                aria-label="Capture photo"
              >
                <span className="w-[52px] h-[52px] rounded-full bg-[#4F56E8] block" />
              </button>
            </div>
          )}

          {state === "preview" && (
            <>
              <button
                onClick={handleRetake}
                disabled={restarting}
                className="flex-1 min-h-[52px] px-4 bg-white/10 hover:bg-white/15 active:scale-[0.95] text-white font-semibold rounded-full transition-all duration-150 border border-white/15 text-base disabled:opacity-50 disabled:pointer-events-none"
                aria-label="Retake photo"
              >
                {restarting ? "Restarting…" : "Retake"}
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 min-h-[52px] px-4 bg-[#4F56E8] hover:bg-[#5B63F0] active:scale-[0.95] text-white font-semibold rounded-full transition-all duration-150 text-base shadow-lg shadow-[#4F56E8]/30"
                aria-label="Use this photo"
              >
                Use Photo
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
