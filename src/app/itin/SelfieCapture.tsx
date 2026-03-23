"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface SelfieCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

type CaptureState = "requesting" | "preview" | "captured" | "denied" | "unavailable";

export default function SelfieCapture({ onCapture, onClose }: SelfieCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<CaptureState>("requesting");
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Mount animation
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const startCamera = useCallback(async () => {
    setState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setState("preview");
    } catch (err) {
      const error = err as Error;
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        setState("denied");
      } else {
        setState("unavailable");
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setState("unavailable");
      return;
    }
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const takePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const vw = video.videoWidth;
    const vh = video.videoHeight;

    // Crop to portrait 3:4 ratio centered on frame (like a passport photo)
    const cropW = Math.min(vw, (vh * 3) / 4);
    const cropH = Math.min(vh, (vw * 4) / 3);
    const sx = (vw - cropW) / 2;
    const sy = (vh - cropH) / 2;

    canvas.width = cropW;
    canvas.height = cropH;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Un-mirror: front camera captures mirrored, flip horizontally for document use
    ctx.save();
    ctx.translate(cropW, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, cropW, cropH, 0, 0, cropW, cropH);
    ctx.restore();

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedDataUrl(dataUrl);
    stopCamera();
    setState("captured");
  }, [stopCamera]);

  const retake = useCallback(() => {
    setCapturedDataUrl(null);
    startCamera();
  }, [startCamera]);

  const acceptPhoto = useCallback(() => {
    if (!capturedDataUrl) return;
    const byteString = atob(capturedDataUrl.split(",")[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    const blob = new Blob([ab], { type: "image/jpeg" });
    const file = new File([blob], `selfie-${Date.now()}.jpg`, { type: "image/jpeg" });
    onCapture(file);
  }, [capturedDataUrl, onCapture]);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onCapture(file);
    },
    [onCapture]
  );

  const handleClose = useCallback(() => {
    stopCamera();
    onClose();
  }, [stopCamera, onClose]);

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
      aria-label="Take Selfie"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0 bg-[#0F1B2D]/95 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#4F56E8]/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#818CF8]" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">Take Selfie</span>
        </div>
        <button
          onClick={handleClose}
          className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl text-white/50 hover:text-white hover:bg-white/10 active:scale-[0.95] transition-all duration-150"
          aria-label="Close selfie capture"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full px-6 py-6 gap-6 overflow-hidden">

        {/* Camera preview + face guide */}
        {(state === "preview" || state === "requesting") && (
          <div className="relative flex items-center justify-center w-full max-w-sm">
            {state === "requesting" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl z-10">
                <div className="flex flex-col items-center gap-3 text-white/60">
                  <div className="w-10 h-10 rounded-full border-2 border-[#4F56E8] border-t-transparent animate-spin" />
                  <p className="text-sm font-medium tracking-wide">Starting camera&hellip;</p>
                </div>
              </div>
            )}
            <video
              ref={videoRef}
              className="w-full rounded-2xl object-cover bg-[#060E18]"
              style={{ aspectRatio: "3/4", transform: "scaleX(-1)" }}
              playsInline
              muted
              aria-hidden="true"
            />
            {/* Face oval guide overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
              <svg
                viewBox="0 0 300 400"
                className="w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <mask id="selfie-face-mask">
                    <rect width="300" height="400" fill="white" />
                    <ellipse cx="150" cy="185" rx="90" ry="115" fill="black" />
                  </mask>
                  <filter id="selfie-glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                {/* Dimmed surround */}
                <rect
                  width="300"
                  height="400"
                  fill="rgba(0,0,0,0.5)"
                  mask="url(#selfie-face-mask)"
                />
                {/* Dashed oval with glow */}
                <ellipse
                  cx="150"
                  cy="185"
                  rx="90"
                  ry="115"
                  fill="none"
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth="2"
                  strokeDasharray="10 5"
                  filter="url(#selfie-glow)"
                />
              </svg>
            </div>
            {/* Instruction hint */}
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-white/90 text-sm font-medium bg-black/60 backdrop-blur-sm rounded-full px-5 py-2">
              Center your face in the oval
            </p>
          </div>
        )}

        {/* Captured preview */}
        {state === "captured" && capturedDataUrl && (
          <div className="relative flex items-center justify-center w-full max-w-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={capturedDataUrl}
              alt="Captured photo preview"
              className="w-full rounded-2xl object-cover shadow-2xl"
              style={{ aspectRatio: "3/4" }}
            />
            {/* Green checkmark badge */}
            <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
          </div>
        )}

        {/* Permission denied */}
        {state === "denied" && (
          <div className="flex flex-col items-center gap-5 px-8 text-center max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-xl mb-2">Camera Access Denied</p>
              <p className="text-white/50 text-sm leading-relaxed">
                Please allow camera access in your browser settings and try again, or upload a photo directly.
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="min-h-[52px] px-8 bg-[#4F56E8] hover:bg-[#5B63F0] active:scale-[0.98] text-white font-semibold rounded-full transition-all duration-150 text-base shadow-lg shadow-[#4F56E8]/30"
              aria-label="Upload a photo from your device"
            >
              Upload Photo Instead
            </button>
            <p className="text-white/30 text-xs">You can also upload from your device</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={handleFileInput}
            />
          </div>
        )}

        {/* Camera unavailable */}
        {state === "unavailable" && (
          <div className="flex flex-col items-center gap-5 px-8 text-center max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-xl mb-2">Camera Not Available</p>
              <p className="text-white/50 text-sm leading-relaxed">
                Your browser does not support direct camera access. Please upload a photo.
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="min-h-[52px] px-8 bg-[#4F56E8] hover:bg-[#5B63F0] active:scale-[0.98] text-white font-semibold rounded-full transition-all duration-150 text-base shadow-lg shadow-[#4F56E8]/30"
              aria-label="Upload a photo from your device"
            >
              Upload Photo
            </button>
            <p className="text-white/30 text-xs">You can also upload from your device</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={handleFileInput}
            />
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="shrink-0 w-full px-6 pb-6 pt-4 border-t border-white/10 flex gap-4 bg-[#0F1B2D]/95 backdrop-blur-sm">
        {state === "preview" && (
          <button
            onClick={takePhoto}
            className="flex-1 min-h-[52px] bg-[#4F56E8] hover:bg-[#5B63F0] active:scale-[0.98] text-white rounded-full text-base font-bold tracking-wide transition-all duration-150 shadow-lg shadow-[#4F56E8]/30"
            aria-label="Take photo"
          >
            Take Photo
          </button>
        )}

        {state === "captured" && (
          <>
            <button
              onClick={retake}
              className="flex-1 min-h-[52px] bg-white/8 hover:bg-white/14 active:scale-[0.98] text-white rounded-full text-base font-semibold transition-all duration-150 border border-white/15"
              aria-label="Retake photo"
            >
              Retake
            </button>
            <button
              onClick={acceptPhoto}
              className="flex-1 min-h-[52px] bg-[#4F56E8] hover:bg-[#5B63F0] active:scale-[0.98] text-white rounded-full text-base font-bold tracking-wide transition-all duration-150 shadow-lg shadow-[#4F56E8]/30"
              aria-label="Use this photo"
            >
              Use Photo
            </button>
          </>
        )}
      </div>

      {/* Hidden canvas for capture processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
