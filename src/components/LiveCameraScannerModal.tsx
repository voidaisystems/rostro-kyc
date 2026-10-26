import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Camera,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FlipHorizontal,
  Sparkles,
  X,
  Upload,
  Zap,
  Sun,
  Maximize2,
  RotateCw,
  ArrowRight,
} from 'lucide-react';
import {
  evaluateCameraFrameHeadless,
  type CameraFrameTelemetry,
} from '../utils/rostroHeadlessSdk';
import type { Language } from '../utils/kycEngine';

interface LiveCameraScannerModalProps {
  isOpen: boolean;
  lang: Language;
  slotLabelEn: string;
  slotLabelAr: string;
  /**
   * When true, after auto-snapping the Front side, the scanner automatically prompts
   * the user to flip the card and waits to auto-snap the Back side!
   */
  requiresBackSide?: boolean;
  initialStep?: 'FRONT' | 'BACK';
  expectedDocLabelEn?: string;
  expectedDocLabelAr?: string;
  onClose: () => void;
  onCaptureDataUrl: (
    frontDataUrl: string,
    fileName: string,
    backDataUrl?: string,
    backFileName?: string
  ) => void;
}

export const LiveCameraScannerModal: React.FC<LiveCameraScannerModalProps> = ({
  isOpen,
  lang,
  slotLabelEn,
  slotLabelAr,
  requiresBackSide = false,
  initialStep = 'FRONT',
  expectedDocLabelEn,
  expectedDocLabelAr,
  onClose,
  onCaptureDataUrl,
}) => {
  const isAr = lang === 'ar';
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const analysisCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [mirrorPreview, setMirrorPreview] = useState(false);
  // Auto-Snap is ON by default so it automatically captures when a real card is held steady inside the frame
  const [autoSnapEnabled, setAutoSnapEnabled] = useState(true);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [flashEffect, setFlashEffect] = useState(false);

  // Dual-side & review step state: FRONT -> FLIP_PROMPT -> BACK -> REVIEW_FINAL
  const [scanStage, setScanStage] = useState<'FRONT' | 'FLIP_PROMPT' | 'BACK' | 'REVIEW_FINAL'>(
    initialStep
  );
  const [capturedFrontDataUrl, setCapturedFrontDataUrl] = useState<string | null>(null);
  const [capturedFrontName, setCapturedFrontName] = useState<string>('front_camera_scan.png');
  const [capturedBackDataUrl, setCapturedBackDataUrl] = useState<string | null>(null);
  const [capturedBackName, setCapturedBackName] = useState<string>('back_camera_scan.png');
  const [lastCaptureHadCard, setLastCaptureHadCard] = useState<boolean>(true);
  const [warmupSecondsLeft, setWarmupSecondsLeft] = useState<number>(4);

  const [telemetry, setTelemetry] = useState<CameraFrameTelemetry>({
    status: 'INITIALIZING',
    readyToSnap: false,
    autoSnapProgressPct: 0,
    sharpnessVariance: 0,
    glarePercent: 0,
    meanLuminance: 120,
    moireRatio: 0,
    cornersDetected: 0,
    estimatedTiltDegrees: 0,
    glareHotspotBox: null,
    feedbackEn: 'Opening camera sensor...',
    feedbackAr: 'جاري تشغيل مستشعر الكاميرا...',
    actionHintEn: 'Place your document inside the guide frame',
    actionHintAr: 'ضع الوثيقة داخل الإطار الإرشادي',
    steadyFramesCount: 0,
    diagnostics: [],
  });

  const steadyCountRef = useRef(0);
  const warmupUntilRef = useRef<number>(0);
  const prevLumaBufferRef = useRef<Uint8Array | null>(null);
  const latestTelemetryRef = useRef<CameraFrameTelemetry>(telemetry);
  latestTelemetryRef.current = telemetry;

  const triggerPlacementWarmup = useCallback((durationMs = 3500) => {
    warmupUntilRef.current = Date.now() + durationMs;
    steadyCountRef.current = 0;
    prevLumaBufferRef.current = null;
    setWarmupSecondsLeft(Math.ceil(durationMs / 1000));
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const startCamera = useCallback(
    async (deviceIdToUse?: string) => {
      stopCamera();
      setCameraError(null);
      triggerPlacementWarmup(3500);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError(
          isAr
            ? 'المتصفح لا يدعم الوصول المباشر للكاميرا في هذه النافذة.'
            : 'Browser camera API (getUserMedia) is not available in this context.'
        );
        return;
      }

      try {
        let stream: MediaStream;
        try {
          const constraints: MediaStreamConstraints = {
            video: deviceIdToUse
              ? {
                  deviceId: { exact: deviceIdToUse },
                  width: { ideal: 1920 },
                  height: { ideal: 1080 },
                }
              : {
                  facingMode: { ideal: 'environment' },
                  width: { ideal: 1920 },
                  height: { ideal: 1080 },
                },
            audio: false,
          };
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch {
          // Fallback for laptop webcams or mobile browsers that reject specific resolution constraints
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setCameraActive(true);
        triggerPlacementWarmup(3500);

        const devices = await navigator.mediaDevices.enumerateDevices().catch(() => []);
        const cams = devices.filter((d) => d.kind === 'videoinput');
        setVideoDevices(cams);
      } catch (err: any) {
        setCameraError(
          isAr
            ? `تعذر فتح الكاميرا (${err?.message || 'تم رفض الإذن'}). يرجى السماح للكاميرا في المتصفح أو اختيار صورة.`
            : `Could not access camera (${err?.message || 'Permission denied'}). Please allow camera access in your browser bar or select a photo.`
        );
      }
    },
    [isAr, stopCamera, triggerPlacementWarmup]
  );

  // Reset stage when modal opens
  useEffect(() => {
    if (isOpen) {
      setScanStage(initialStep);
      setCapturedFrontDataUrl(null);
      setCapturedBackDataUrl(null);
      setLastCaptureHadCard(true);
      triggerPlacementWarmup(3500);
      startCamera(selectedDeviceId || undefined);
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, initialStep, selectedDeviceId, startCamera, stopCamera, triggerPlacementWarmup]);

  const captureCurrentFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) return;

    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 220);

    const outCanvas = document.createElement('canvas');
    outCanvas.width = video.videoWidth;
    outCanvas.height = video.videoHeight;
    const ctx = outCanvas.getContext('2d');
    if (!ctx) return;

    // Always capture un-mirrored pixels so Arabic/English text & MRZ on the card are never backwards
    ctx.drawImage(video, 0, 0, outCanvas.width, outCanvas.height);
    const dataUrl = outCanvas.toDataURL('image/png', 0.95);
    const timestamp = Date.now();

    const docPresenceDiag = latestTelemetryRef.current.diagnostics.find(
      (d) => d.id === 'DOCUMENT_PRESENCE'
    );
    const cardWasDetected = docPresenceDiag ? docPresenceDiag.passed : true;
    setLastCaptureHadCard(cardWasDetected);

    if (scanStage === 'FRONT' && requiresBackSide) {
      // Save Front side, pause on FLIP_PROMPT so user can inspect Front and flip the card when ready!
      const frontFile = `front_scan_${timestamp}.png`;
      setCapturedFrontDataUrl(dataUrl);
      setCapturedFrontName(frontFile);
      steadyCountRef.current = 0;
      setScanStage('FLIP_PROMPT');
      return;
    }

    if (scanStage === 'BACK') {
      const backFile = `back_scan_${timestamp}.png`;
      setCapturedBackDataUrl(dataUrl);
      setCapturedBackName(backFile);
      steadyCountRef.current = 0;
      setScanStage('REVIEW_FINAL');
      return;
    }

    // Single-side scan -> show REVIEW_FINAL so user can confirm or retake
    setCapturedFrontDataUrl(dataUrl);
    setCapturedFrontName(`camera_scan_${timestamp}.png`);
    steadyCountRef.current = 0;
    setScanStage('REVIEW_FINAL');
  }, [scanStage, requiresBackSide]);

  const confirmAndSubmitCaptures = useCallback(() => {
    stopCamera();
    if (capturedFrontDataUrl && capturedBackDataUrl) {
      onCaptureDataUrl(
        capturedFrontDataUrl,
        capturedFrontName,
        capturedBackDataUrl,
        capturedBackName
      );
    } else if (capturedFrontDataUrl) {
      onCaptureDataUrl(capturedFrontDataUrl, capturedFrontName);
    }
  }, [
    stopCamera,
    capturedFrontDataUrl,
    capturedFrontName,
    capturedBackDataUrl,
    capturedBackName,
    onCaptureDataUrl,
  ]);

  // Run headless frame evaluation loop (every 180ms) while camera is active on FRONT or BACK
  useEffect(() => {
    if (
      !isOpen ||
      !cameraActive ||
      scanStage === 'FLIP_PROMPT' ||
      scanStage === 'REVIEW_FINAL'
    ) {
      return;
    }

    const interval = window.setInterval(() => {
      const video = videoRef.current;
      const canvas = analysisCanvasRef.current;
      if (!video || !canvas || video.readyState < 2 || video.videoWidth === 0) return;

      const sampleW = 160;
      const sampleH = 100;
      canvas.width = sampleW;
      canvas.height = sampleH;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, sampleW, sampleH);
      const imgData = ctx.getImageData(0, 0, sampleW, sampleH);
      const rgba = imgData.data;

      // Compute frame-to-frame luminance motion diff inside the guide box
      const curLuma = new Uint8Array(sampleW * sampleH);
      let diffSum = 0;
      let diffCount = 0;
      const prevLuma = prevLumaBufferRef.current;

      for (let i = 0, p = 0; i < curLuma.length; i++, p += 4) {
        const yVal = Math.round(0.299 * rgba[p] + 0.587 * rgba[p + 1] + 0.114 * rgba[p + 2]);
        curLuma[i] = yVal;
        if (prevLuma && prevLuma.length === curLuma.length) {
          diffSum += Math.abs(yVal - prevLuma[i]);
          diffCount++;
        }
      }
      prevLumaBufferRef.current = curLuma;
      const motionDiff = diffCount > 0 ? diffSum / diffCount : 0;

      // Check if we are still in the initial 3.5-second placement warm-up grace period
      const remainingWarmupMs = Math.max(0, warmupUntilRef.current - Date.now());
      const inWarmup = remainingWarmupMs > 0;
      setWarmupSecondsLeft(inWarmup ? Math.ceil(remainingWarmupMs / 1000) : 0);

      const nextTelemetry = evaluateCameraFrameHeadless(
        rgba,
        sampleW,
        sampleH,
        inWarmup ? 0 : steadyCountRef.current,
        true,
        video.videoWidth,
        video.videoHeight,
        motionDiff
      );

      if (inWarmup) {
        steadyCountRef.current = 0;
        const secLeft = Math.ceil(remainingWarmupMs / 1000);
        setTelemetry({
          ...nextTelemetry,
          status: 'WARMING_UP',
          readyToSnap: false,
          autoSnapProgressPct: 0,
          steadyFramesCount: 0,
          feedbackEn: `Get Ready — Place Card in Box (${secLeft}s...)`,
          feedbackAr: `استعد — ضع البطاقة داخل الإطار (${secLeft} ثوانٍ...)`,
          actionHintEn:
            'Pick up your document and position it inside the guide frame before auto-scan begins.',
          actionHintAr:
            'أمسك الوثيقة وضعها داخل المربع الإرشادي قبل بدء الالتقاط التلقائي.',
        });
        return;
      }

      steadyCountRef.current = nextTelemetry.steadyFramesCount;
      setTelemetry(nextTelemetry);

      // Auto-Snap ONLY after warm-up finishes, real ID card is present in 3+ quadrants, hand is still, and 10 steady frames complete!
      if (autoSnapEnabled && nextTelemetry.readyToSnap && nextTelemetry.autoSnapProgressPct >= 100) {
        steadyCountRef.current = 0;
        captureCurrentFrame();
      }
    }, 180);

    return () => clearInterval(interval);
  }, [isOpen, cameraActive, scanStage, autoSnapEnabled, captureCurrentFrame]);

  if (!isOpen) return null;

  const handleFileFallback = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const dataUrl = reader.result;
        setLastCaptureHadCard(true);
        if (scanStage === 'FRONT' && requiresBackSide) {
          setCapturedFrontDataUrl(dataUrl);
          setCapturedFrontName(file.name);
          setScanStage('FLIP_PROMPT');
        } else if (scanStage === 'BACK') {
          setCapturedBackDataUrl(dataUrl);
          setCapturedBackName(file.name);
          setScanStage('REVIEW_FINAL');
        } else {
          setCapturedFrontDataUrl(dataUrl);
          setCapturedFrontName(file.name);
          setScanStage('REVIEW_FINAL');
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const currentSideLabelEn =
    scanStage === 'BACK'
      ? 'STEP 2 OF 2: BACK SIDE (MRZ / BARCODE)'
      : requiresBackSide
        ? 'STEP 1 OF 2: FRONT SIDE (PORTRAIT & NAME)'
        : slotLabelEn;

  const currentSideLabelAr =
    scanStage === 'BACK'
      ? 'الخطوة ٢ من ٢: الوجه الخلفي للبطاقة (الظهر / MRZ)'
      : requiresBackSide
        ? 'الخطوة ١ من ٢: الوجه الأمامي للبطاقة (الصورة والاسم الرباعي)'
        : slotLabelAr;

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={isAr ? 'ماسح الكاميرا الذكي للوثائق' : 'Smart Auto-Capture Document Camera'}
    >
      <div className="w-full max-w-3xl rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-100 shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Top Header */}
        <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/90">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Camera className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white flex items-center gap-2 flex-wrap">
                <span className="truncate">{isAr ? currentSideLabelAr : currentSideLabelEn}</span>
                {expectedDocLabelEn && (
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/40 text-blue-300 font-mono text-[10px]">
                    {isAr ? expectedDocLabelAr || expectedDocLabelEn : expectedDocLabelEn}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-zinc-400 truncate">
                {isAr
                  ? 'يرصد وجود البطاقة الفعلية داخل الإطار وينتظر تثبيت يدك قبل الالتقاط'
                  : 'Detects physical ID card inside frame & waits for steady hold before snapping'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            aria-label={isAr ? 'إغلاق الكاميرا' : 'Close camera'}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Bar when Dual-Side (Front + Back) is required */}
        {requiresBackSide && (
          <div className="px-4 py-2 bg-zinc-900/50 border-b border-zinc-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
                  capturedFrontDataUrl
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {capturedFrontDataUrl && <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>{isAr ? '١. الوجه الأمامي' : '1. Front Side'}</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
              <span
                className={`px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
                  capturedBackDataUrl
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : scanStage === 'BACK'
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                }`}
              >
                {capturedBackDataUrl && <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>{isAr ? '٢. الوجه الخلفي (الظهر)' : '2. Back Side (Reverse)'}</span>
              </span>
            </div>

            {capturedFrontDataUrl && (
              <button
                type="button"
                onClick={() => {
                  setCapturedFrontDataUrl(null);
                  setCapturedBackDataUrl(null);
                  setScanStage('FRONT');
                  triggerPlacementWarmup(3500);
                }}
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCw className="w-3 h-3" />
                <span>{isAr ? 'إعادة مسح الوجه الأمامي' : 'Retake Front'}</span>
              </button>
            )}
          </div>
        )}

        {/* Camera Viewport (Responsive on both Mobile Portrait and Laptop Landscape) */}
        <div className="relative bg-black h-[48vh] sm:h-[52vh] max-h-[440px] w-full flex items-center justify-center overflow-hidden">
          <canvas ref={analysisCanvasRef} className="hidden" />

          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className={`w-full h-full object-cover ${mirrorPreview ? 'scale-x-[-1]' : ''}`}
          />

          {/* White shutter flash */}
          {flashEffect && <div className="absolute inset-0 bg-white/90 pointer-events-none z-40" />}

          {/* STEP 1.5: FLIP CARD TRANSITION PROMPT (Pauses until user flips card and clicks button!) */}
          {scanStage === 'FLIP_PROMPT' && (
            <div className="absolute inset-0 z-30 bg-zinc-950/95 backdrop-blur-xs flex flex-col items-center justify-center p-5 text-center space-y-3.5 animate-in fade-in duration-200">
              {capturedFrontDataUrl && (
                <div className="relative">
                  <img
                    src={capturedFrontDataUrl}
                    alt="Captured Front"
                    className="w-48 h-28 sm:w-56 sm:h-32 object-cover rounded-xl border-2 border-emerald-400 shadow-xl"
                  />
                  <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-zinc-950 font-bold text-[10px] flex items-center gap-1 shadow">
                    <CheckCircle2 className="w-3 h-3" />
                    {isAr ? 'الوجه الأمامي' : 'FRONT SAVED'}
                  </span>
                </div>
              )}

              {!lastCaptureHadCard && (
                <div className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs max-w-md">
                  {isAr
                    ? 'تنبيه: لم نرصد بطاقة واضحة في هذه اللقطة. ننصح بالضغط على "إعادة التقاط الوجه الأمامي".'
                    : 'Notice: No clear ID card was detected in this photo. Click "Retake Front" if your document was not in frame.'}
                </div>
              )}

              <div className="space-y-1 max-w-md">
                <div className="text-base sm:text-lg font-bold text-emerald-400">
                  {isAr
                    ? 'الآن اقلب البطاقة على الوجه الخلفي (الظهر)'
                    : 'Now Flip Your Document to the Back Side'}
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {isAr
                    ? 'تأكد من وضوح صورة الوجه الأمامي أعلاه. عندما تقلب البطاقة على الظهر، اضغط الزر الأخضر لبدء مسح الظهر (مع مهلة ٣ ثوانٍ لتجهيز يدك).'
                    : 'Check your Front photo above. Turn your card over to the Back Side, then click the green button when you are ready.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    triggerPlacementWarmup(3500);
                    setScanStage('BACK');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-2 shadow-lg cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>
                    {isAr
                      ? 'قلبت البطاقة — ابدأ مسح الوجه الخلفي'
                      : 'I Flipped the Card — Scan Back Side'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCapturedFrontDataUrl(null);
                    triggerPlacementWarmup(3500);
                    setScanStage('FRONT');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{isAr ? 'إعادة التقاط الوجه الأمامي' : 'Retake Front Photo'}</span>
                </button>

                {capturedFrontDataUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      onCaptureDataUrl(capturedFrontDataUrl, capturedFrontName);
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium cursor-pointer"
                  >
                    {isAr ? 'الاكتفاء بالوجه الأمامي فقط' : 'Use Front Side Only'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 2.5: FINAL CAPTURE REVIEW & RETAKE CONFIRMATION */}
          {scanStage === 'REVIEW_FINAL' && (
            <div className="absolute inset-0 z-30 bg-zinc-950/95 backdrop-blur-xs flex flex-col items-center justify-center p-5 text-center space-y-3.5 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center justify-center gap-4">
                {capturedFrontDataUrl && (
                  <div className="space-y-1">
                    <img
                      src={capturedFrontDataUrl}
                      alt="Captured Front"
                      className="w-44 h-28 object-cover rounded-xl border-2 border-emerald-400 shadow-lg"
                    />
                    <div className="text-[11px] font-bold text-emerald-300">
                      {requiresBackSide
                        ? isAr
                          ? '١. الوجه الأمامي'
                          : '1. Front Side'
                        : isAr
                          ? 'الصورة الملتقطة'
                          : 'Captured Document'}
                    </div>
                  </div>
                )}
                {capturedBackDataUrl && (
                  <div className="space-y-1">
                    <img
                      src={capturedBackDataUrl}
                      alt="Captured Back"
                      className="w-44 h-28 object-cover rounded-xl border-2 border-blue-400 shadow-lg"
                    />
                    <div className="text-[11px] font-bold text-blue-300">
                      {isAr ? '٢. الوجه الخلفي (الظهر)' : '2. Back Side (Reverse)'}
                    </div>
                  </div>
                )}
              </div>

              {!lastCaptureHadCard && (
                <div className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs max-w-md">
                  {isAr
                    ? 'تنبيه: لم يتم رصد بطاقة هوية واضحة داخل الإطار. يرجى الضغط على "إعادة التصوير" وتقريب البطاقة.'
                    : 'Warning: No clear ID card was detected inside the guide box. Please click "Retake" and hold your card close to the camera.'}
                </div>
              )}

              <div className="space-y-1 max-w-md">
                <div className="text-sm sm:text-base font-bold text-white">
                  {isAr
                    ? 'تأكيد جودة الصور الملتقطة قبل الإرسال'
                    : 'Review Captured Document Photo(s)'}
                </div>
                <p className="text-xs text-zinc-400">
                  {isAr
                    ? 'تأكد من أن البطاقة واضحة داخل الصورة قبل المتابعة، أو اضغط إعادة التصوير.'
                    : 'Verify that your document is clear and readable, or click Retake to scan again.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={confirmAndSubmitCaptures}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-2 shadow-lg cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isAr ? 'تأكيد واستخدام الصور الآن' : 'Confirm & Use Photo(s)'}
                  </span>
                </button>

                {capturedBackDataUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setCapturedBackDataUrl(null);
                      triggerPlacementWarmup(3500);
                      setScanStage('BACK');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>{isAr ? 'إعادة تصوير الظهر' : 'Retake Back Side'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setCapturedFrontDataUrl(null);
                    setCapturedBackDataUrl(null);
                    triggerPlacementWarmup(3500);
                    setScanStage('FRONT');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>
                    {requiresBackSide
                      ? isAr
                        ? 'إعادة المسح من البداية'
                        : 'Retake From Front'
                      : isAr
                        ? 'إعادة التصوير'
                        : 'Retake Photo'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Live Card Alignment Frame + Real-Time Issue Coaching + Glare Hotspot Box */}
          {cameraActive && scanStage !== 'FLIP_PROMPT' && scanStage !== 'REVIEW_FINAL' && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4 sm:p-6">
              <div
                className={`w-[86%] sm:w-[76%] max-w-lg aspect-[1.58/1] rounded-2xl border-2 transition-all duration-200 relative ${
                  telemetry.readyToSnap
                    ? 'border-emerald-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.52),0_0_30px_rgba(16,185,129,0.6)]'
                    : telemetry.status === 'WARMING_UP'
                      ? 'border-blue-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.52),0_0_25px_rgba(59,130,246,0.45)]'
                      : telemetry.status === 'LIGHT_SPOT_GLARE' || telemetry.status === 'LOW_LIGHT'
                        ? 'border-rose-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.52),0_0_25px_rgba(244,63,94,0.45)]'
                        : 'border-amber-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.52)]'
                }`}
              >
                {/* 4 Corner Brackets */}
                <span className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-md" />
                <span className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-md" />
                <span className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-md" />
                <span className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-md" />

                {/* LIVE LIGHT SPOT / REFLECTION HIGHLIGHT BOX ON THE CARD */}
                {telemetry.glareHotspotBox && (
                  <div
                    style={{
                      top: `${Math.max(4, telemetry.glareHotspotBox[0])}%`,
                      left: `${Math.max(4, telemetry.glareHotspotBox[1])}%`,
                      height: `${Math.max(14, telemetry.glareHotspotBox[2] - telemetry.glareHotspotBox[0])}%`,
                      width: `${Math.max(14, telemetry.glareHotspotBox[3] - telemetry.glareHotspotBox[1])}%`,
                    }}
                    className="absolute border-2 border-rose-500 bg-rose-500/25 rounded-full animate-pulse flex items-center justify-center"
                  >
                    <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[9px] font-bold whitespace-nowrap shadow">
                      {isAr ? 'بقعة ضوء منعكسة!' : 'LIGHT SPOT!'}
                    </span>
                  </div>
                )}

                {/* Top Status Pill Inside Frame */}
                <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between gap-2 text-[11px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-black/75 text-zinc-100 border border-white/15 truncate">
                    {scanStage === 'BACK'
                      ? isAr
                        ? 'الوجه الخلفي (الظهر)'
                        : 'BACK SIDE'
                      : isAr
                        ? 'الوجه الأمامي'
                        : 'FRONT SIDE'}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded font-bold flex items-center gap-1 shrink-0 ${
                      telemetry.readyToSnap
                        ? 'bg-emerald-500 text-zinc-950'
                        : telemetry.status === 'WARMING_UP'
                          ? 'bg-blue-500 text-white'
                          : telemetry.status === 'LIGHT_SPOT_GLARE' || telemetry.status === 'LOW_LIGHT'
                            ? 'bg-rose-500 text-white'
                            : 'bg-amber-400 text-zinc-950'
                    }`}
                  >
                    {telemetry.readyToSnap ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    )}
                    <span>{isAr ? telemetry.feedbackAr : telemetry.feedbackEn}</span>
                  </span>
                </div>

                {/* Initial Placement Grace Period Banner (First 3.5 seconds) */}
                {warmupSecondsLeft > 0 && (
                  <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 bg-black/85 p-3.5 rounded-xl border border-blue-400/60 space-y-1.5 text-center shadow-xl">
                    <div className="text-xs sm:text-sm font-bold text-blue-300">
                      {isAr
                        ? `ضع الوثيقة داخل المربع الآن (${warmupSecondsLeft} ثوانٍ...)`
                        : `Position Your Document Inside the Frame (${warmupSecondsLeft}s...)`}
                    </div>
                    <div className="text-[11px] text-zinc-300">
                      {isAr
                        ? 'تم إيقاف الالتقاط التلقائي مؤقتاً لمنحك الوقت الكافي لوضع البطاقة أمام الكاميرا.'
                        : 'Auto-capture is paused for a few seconds so you have time to hold up your card.'}
                    </div>
                  </div>
                )}

                {/* Auto-Snap Progress Bar when frame is steady & clear */}
                {warmupSecondsLeft === 0 && telemetry.readyToSnap && autoSnapEnabled && (
                  <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 bg-black/85 p-3 rounded-xl border border-emerald-400/50 space-y-1.5 text-center shadow-xl">
                    <div className="text-xs font-bold text-emerald-400">
                      {isAr
                        ? `الوثيقة ممتازة! اثبت للالتقاط التلقائي (${telemetry.autoSnapProgressPct}%)...`
                        : `Card Detected & Clear! Hold Still (${telemetry.autoSnapProgressPct}%)...`}
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        style={{ width: `${telemetry.autoSnapProgressPct}%` }}
                        className="h-full bg-emerald-400 transition-all duration-150"
                      />
                    </div>
                  </div>
                )}

                {/* Bottom Action Coaching Banner (Specifically tells user how to fix what is wrong) */}
                <div className="absolute bottom-2.5 inset-x-2.5 text-center">
                  <div className="inline-block px-3 py-1.5 rounded-xl bg-black/85 text-white text-[11px] sm:text-xs font-medium border border-white/15 shadow-lg">
                    {isAr ? telemetry.actionHintAr : telemetry.actionHintEn}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Camera Error / Permission Fallback */}
          {cameraError && (
            <div className="absolute inset-0 bg-zinc-950/95 flex flex-col items-center justify-center p-6 text-center space-y-4 z-20">
              <AlertTriangle className="w-10 h-10 text-amber-400" />
              <div className="max-w-md space-y-1">
                <div className="text-sm font-bold text-white">
                  {isAr ? 'تنبيه الوصول إلى الكاميرا' : 'Camera Access Notice'}
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{cameraError}</p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => startCamera(selectedDeviceId || undefined)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{isAr ? 'إعادة محاولة فتح الكاميرا' : 'Retry Camera'}</span>
                </button>
                <label className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>{isAr ? 'أو اختر صورة من جهازك' : 'Or Select Photo From Device'}</span>
                  <input type="file" accept="image/*" onChange={handleFileFallback} className="hidden" />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* 6-Check Live Diagnostic Grid (Tells user every check: Lighting, Light Spot/Glare, Alignment, Sharpness, Document Surface, Resolution) */}
        <div className="px-3.5 py-2.5 bg-zinc-900 border-t border-zinc-800 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
          {telemetry.diagnostics.map((diag) => (
            <div
              key={diag.id}
              className={`px-2.5 py-1.5 rounded-lg border flex items-start gap-2 ${
                diag.passed
                  ? 'bg-zinc-950/90 border-zinc-800 text-zinc-200'
                  : 'bg-rose-950/30 border-rose-500/50 text-rose-200'
              }`}
            >
              {diag.passed ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0">
                <div className="font-bold truncate">{isAr ? diag.labelAr : diag.labelEn}</div>
                <div className="text-[10px] text-zinc-400 truncate">
                  {isAr ? diag.detailAr : diag.detailEn}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Controls Bar */}
        <div className="p-3.5 sm:p-4 bg-zinc-950 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            {/* Auto-Snap Toggle (ON by default) */}
            <button
              type="button"
              onClick={() => setAutoSnapEnabled((p) => !p)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                autoSnapEnabled
                  ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>
                {isAr
                  ? `الالتقاط التلقائي الذكي: ${autoSnapEnabled ? 'مفعّل' : 'يدوي'}`
                  : `Smart Auto-Snap: ${autoSnapEnabled ? 'ON' : 'MANUAL'}`}
              </span>
            </button>

            {/* Mirror Preview Toggle */}
            <button
              type="button"
              onClick={() => setMirrorPreview((p) => !p)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
                mirrorPreview
                  ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <FlipHorizontal className="w-3.5 h-3.5" />
              <span>{isAr ? 'عكس المعاينة' : 'Mirror'}</span>
            </button>

            {/* Camera Device Selector if >1 camera */}
            {videoDevices.length > 1 && (
              <select
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                aria-label={isAr ? 'اختيار الكاميرا' : 'Select camera device'}
                className="px-2.5 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200"
              >
                {videoDevices.map((d, idx) => (
                  <option key={d.deviceId || idx} value={d.deviceId}>
                    {d.label || `Camera ${idx + 1}`}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center gap-2">
            {scanStage === 'REVIEW_FINAL' ? (
              <button
                type="button"
                onClick={confirmAndSubmitCaptures}
                className="px-4 sm:px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isAr ? 'تأكيد واستخدام الصور' : 'Confirm & Use Photo(s)'}</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={!cameraActive || scanStage === 'FLIP_PROMPT'}
                onClick={captureCurrentFrame}
                className="px-4 sm:px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-zinc-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {scanStage === 'BACK'
                    ? isAr
                      ? 'التقاط الوجه الخلفي يدوياً'
                      : 'Snap Back Manually'
                    : isAr
                      ? 'التقاط الوجه الأمامي يدوياً'
                      : 'Snap Front Manually'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
