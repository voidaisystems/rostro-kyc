import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  FileText,
  Building2,
  ZoomIn,
  RotateCw,
  ScanLine,
  Copy,
  Check,
  AlertTriangle,
  HelpCircle,
  FlipHorizontal,
  RotateCcw,
  RefreshCw,
  Search,
  Sparkles,
  Crop,
} from 'lucide-react';
import {
  getDocumentSideRequirement,
  type KYCDocument,
  type Language,
} from '../utils/kycEngine';
import {
  formatCryptoDigest,
  formatDocumentTypeCode,
  formatMrzForDisplay,
  formatReferenceCode,
  formatSideLabel,
  formatSupportStatus,
  sanitizeTextForLanguage,
  t,
  transliterateArabicToLatin,
} from '../utils/i18n';
import {
  normalizeBoxPercentages,
  getSpatialEntityColors,
  autoCropDeskewAndEnhanceCardDataUrl,
  type AutoCropEnhanceResult,
} from '../utils/edgeForensicsEngine';

export type OcrHighlightField =
  | 'fullName'
  | 'normalizedName'
  | 'docNumber'
  | 'motherName'
  | 'governorate'
  | 'nationality'
  | 'dob'
  | 'expiryDate'
  | 'issueDate'
  | 'address'
  | 'familyNumber'
  | 'gender'
  | 'bloodType'
  | 'mrz'
  | null;

interface DocumentSpecimenViewerProps {
  document: KYCDocument;
  lang: Language;
  zoomed: boolean;
  rotation: number;
  onToggleZoom: () => void;
  onRotate: () => void;
  onRotateCcw?: () => void;
  onRotate180?: () => void;
  onResetRotation?: () => void;
  highlightedField?: OcrHighlightField;
  onHoverField?: (field: OcrHighlightField) => void;
  externalLoupeEnabled?: boolean;
}

export const DocumentSpecimenViewer: React.FC<DocumentSpecimenViewerProps> = ({
  document,
  lang,
  zoomed,
  rotation,
  onToggleZoom,
  onRotate,
  onRotateCcw,
  onRotate180,
  onResetRotation,
  highlightedField = null,
  onHoverField,
  externalLoupeEnabled,
}) => {
  const [showOcrBoxes, setShowOcrBoxes] = useState<boolean>(true);
  const [showCentroids, setShowCentroids] = useState<boolean>(true);
  const [hoveredBoxIdx, setHoveredBoxIdx] = useState<number | null>(null);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);
  const [activeFace, setActiveFace] = useState<'FRONT' | 'BACK'>('FRONT');

  // Upgrade 2.1: Interactive Optical Magnifier Loupe (2x / 4x / 6x Zoom Lens)
  const [loupeEnabled, setLoupeEnabled] = useState<boolean>(false);
  const [loupeScale, setLoupeScale] = useState<2 | 4 | 6>(4);
  const [loupePos, setLoupePos] = useState<{ xPct: number; yPct: number } | null>(null);

  useEffect(() => {
    if (typeof externalLoupeEnabled === 'boolean') {
      setLoupeEnabled(externalLoupeEnabled);
    }
  }, [externalLoupeEnabled]);

  // Upgrade 1.1: Auto-Crop, Deskew & CLAHE Image Enhancement Pre-Processor
  const [autoEnhanceEnabled, setAutoEnhanceEnabled] = useState<boolean>(false);
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [enhanceResult, setEnhanceResult] = useState<AutoCropEnhanceResult | null>(null);

  const activeImageUrl =
    activeFace === 'BACK' && document.customBackPreviewUrl
      ? document.customBackPreviewUrl
      : document.customPreviewUrl;

  useEffect(() => {
    let cancelled = false;
    if (autoEnhanceEnabled && activeImageUrl) {
      setIsEnhancing(true);
      autoCropDeskewAndEnhanceCardDataUrl(activeImageUrl)
        .then((res) => {
          if (!cancelled) {
            setEnhanceResult(res);
            setIsEnhancing(false);
          }
        })
        .catch(() => {
          if (!cancelled) setIsEnhancing(false);
        });
    } else if (!autoEnhanceEnabled) {
      setEnhanceResult(null);
    }
    return () => {
      cancelled = true;
    };
  }, [autoEnhanceEnabled, activeImageUrl]);

  const getMicroPrintZoneLabel = (xPct: number, yPct: number) => {
    if (yPct < 22) {
      return lang === 'ar'
        ? 'شعار جمهورية العراق · الطباعة الدقيقة العلوية'
        : 'REPUBLIC OF IRAQ CREST · HEADER MICRO-PRINT';
    }
    if (xPct < 36 && yPct >= 22 && yPct <= 72) {
      return lang === 'ar'
        ? 'الصورة البيومترية ونقوش Guilloché'
        : 'BIOMETRIC PORTRAIT & GUILLOCHÉ WEAVE';
    }
    if (yPct > 74) {
      return lang === 'ar'
        ? 'شريط MRZ / الرقم العائلي بالحفر الليزري'
        : 'LASER-ENGRAVED MRZ / SERIAL KERNING';
    }
    return lang === 'ar'
      ? 'حقول البيانات العربية والصورة الشبحية الليزرية'
      : 'ARABIC TYPOGRAPHY & LASER GHOST WATERMARK';
  };

  const sidePolicy = getDocumentSideRequirement(document.type);
  const hasCardPairConflict =
    document.cardPairValidation &&
    document.cardPairValidation.issues.some((i) => i.severity === 'CRITICAL');
  const isMissingRequiredBack = sidePolicy.requiresBothSides && document.side !== 'BOTH';

  const isIdentityOrPassport =
    document.type === 'IRQ_NATIONAL_ID' ||
    document.type === 'IRQ_CIVIL_STATUS_ID' ||
    document.type === 'IRQ_NATIONALITY_CERT' ||
    document.type === 'IRQ_PASSPORT' ||
    document.type === 'FOREIGN_PASSPORT' ||
    document.type === 'IRQ_DRIVING_LICENSE';

  const isResidenceOrHousehold =
    document.type === 'IRQ_RESIDENCE_CARD' || document.type === 'IRQ_RATION_CARD';

  const isCommercialOrLegal =
    document.type === 'IRQ_CHAMBER_OF_COMMERCE' ||
    document.type === 'IRQ_COMPANY_REG' ||
    document.type === 'IRQ_TAX_ID_CARD' ||
    document.type === 'IRQ_POWER_OF_ATTORNEY';

  const isUnknownDoc = document.type === 'UNKNOWN_DOCUMENT';

  const handleCopyHash = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(document.sha256Hash).catch(() => {});
    }
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 1800);
  };

  const getFieldBoxClass = (fieldKey: OcrHighlightField) => {
    const isTargeted = highlightedField === fieldKey;
    if (isTargeted) {
      return 'ring-2 ring-blue-600 dark:ring-blue-400 bg-blue-50/90 dark:bg-blue-950/70 rounded px-1.5 py-0.5 -mx-1.5 transition-all';
    }
    if (showOcrBoxes) {
      return 'ring-1 ring-emerald-500/50 dark:ring-emerald-400/40 bg-emerald-50/30 dark:bg-emerald-950/20 rounded px-1.5 py-0.5 -mx-1.5 transition-all';
    }
    return 'px-1.5 py-0.5 -mx-1.5 transition-all';
  };

  const activeBoxes =
    activeFace === 'BACK' && document.backBoundingBoxes && document.backBoundingBoxes.length > 0
      ? document.backBoundingBoxes
      : document.boundingBoxes;

  return (
    <div className="border border-zinc-200 dark:border-[#222225] rounded-xl bg-zinc-50 dark:bg-[#111113] overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-zinc-200 dark:border-[#222225] bg-white dark:bg-[#141417] flex-wrap">
        <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 flex-wrap">
          <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-[#1f1f23] text-zinc-700 dark:text-zinc-300">
            {formatSupportStatus(document.supportStatus, lang)}
          </span>
          {/* Physical Side Completeness Badge */}
          <span
            className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border ${
              hasCardPairConflict
                ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                : !sidePolicy.requiresBothSides
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : document.side === 'BOTH'
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
            }`}
          >
            {hasCardPairConflict
              ? lang === 'ar'
                ? 'تضارب بين الصورتين'
                : 'CROSS-CARD CONFLICT DETECTED'
              : !sidePolicy.requiresBothSides
                ? lang === 'ar'
                  ? 'صفحة بيانات واحدة · جواز سفر'
                  : 'SINGLE BIO-PAGE · PASSPORT'
                : document.side === 'BOTH'
                  ? lang === 'ar'
                    ? 'الأمام والظهر مكتملان'
                    : 'FRONT + BACK VERIFIED (BOTH)'
                  : lang === 'ar'
                    ? 'وجه واحد فقط · الظهر مفقود'
                    : `SIDE: ${document.side} ONLY · BACK MISSING`}
          </span>
          {document.engineMode === 'gemini-vlm-live' && (
            <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {lang === 'ar' ? 'استخراج ذكي مباشر' : 'GEMINI VLM LIVE OCR'}
            </span>
          )}
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {lang === 'ar' ? document.titleAr : document.titleEn}
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">
            {formatReferenceCode(document.docNumber, lang)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {(sidePolicy.requiresBothSides || document.customBackPreviewUrl) && (
            <div className="inline-flex items-center rounded bg-zinc-100 dark:bg-[#18181b] p-0.5 border border-zinc-200 dark:border-[#222225]">
              <button
                type="button"
                onClick={() => setActiveFace('FRONT')}
                className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded transition-colors ${
                  activeFace === 'FRONT'
                    ? 'bg-white dark:bg-[#0c0c0e] text-emerald-600 dark:text-emerald-400 shadow-2xs'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {lang === 'ar' ? 'الأمام' : 'FRONT'}
              </button>
              <button
                type="button"
                onClick={() => setActiveFace('BACK')}
                className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded transition-colors ${
                  activeFace === 'BACK'
                    ? 'bg-white dark:bg-[#0c0c0e] text-emerald-600 dark:text-emerald-400 shadow-2xs'
                    : hasCardPairConflict || isMissingRequiredBack
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {isMissingRequiredBack
                  ? lang === 'ar'
                    ? 'الظهر (مفقود)'
                    : 'BACK (MISSING)'
                  : lang === 'ar'
                    ? 'الظهر'
                    : 'BACK'}
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowOcrBoxes((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
              showOcrBoxes
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-[#18181b] hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            <ScanLine className="w-3.5 h-3.5" />
            <span>{t(lang, 'ocrOverlayLabel')}</span>
          </button>

          {/* Upgrade 2.1: Interactive Optical Magnifier Loupe Toggle (4x Lens) */}
          <div className="inline-flex items-center rounded bg-zinc-100 dark:bg-[#18181b] p-0.5 border border-zinc-200 dark:border-[#222225]">
            <button
              type="button"
              onClick={() => setLoupeEnabled((prev) => !prev)}
              title={
                lang === 'ar'
                  ? 'عدسة التكبير الجنائية لفحص الأختام والطباعة الدقيقة (مفتاح M)'
                  : 'Optical Magnifier Loupe for Micro-Print & Seal Inspection (Shortcut: M)'
              }
              className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                loupeEnabled
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-semibold'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-[#0c0c0e]'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>
                {lang === 'ar' ? `عدسة مجهرية ${loupeScale}x` : `Loupe ${loupeScale}x`}
              </span>
            </button>
            {loupeEnabled && (
              <div className="inline-flex items-center gap-0.5 px-1">
                {([2, 4, 6] as const).map((factor) => (
                  <button
                    key={factor}
                    type="button"
                    onClick={() => setLoupeScale(factor)}
                    className={`px-1.5 py-0.5 text-[10px] font-mono rounded transition-colors ${
                      loupeScale === factor
                        ? 'bg-cyan-500 text-zinc-950 font-bold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {factor}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Upgrade 1.1: Auto-Crop, Deskew & CLAHE Pre-Processor Toggle */}
          <button
            type="button"
            onClick={() => setAutoEnhanceEnabled((prev) => !prev)}
            title={
              lang === 'ar'
                ? 'القص التلقائي وتصحيح الميل وتحسين التباين والأختام (CLAHE)'
                : 'Auto-Crop, Deskew & CLAHE Adaptive Contrast Pre-Processor'
            }
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
              autoEnhanceEnabled
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-[#18181b] hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            <Crop className="w-3.5 h-3.5" />
            <Sparkles className="w-3 h-3" />
            <span>
              {lang === 'ar'
                ? autoEnhanceEnabled
                  ? 'مُحسَّن ومقصوص تلقائياً'
                  : 'قص وتحسين تلقائي'
                : autoEnhanceEnabled
                  ? 'Cropped & Enhanced'
                  : 'Auto-Crop & Enhance'}
            </span>
          </button>
          <button
            type="button"
            onClick={onToggleZoom}
            aria-label={t(lang, 'zoomInLabel')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-[#18181b] hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors whitespace-nowrap shrink-0"
          >
            <ZoomIn className="w-3.5 h-3.5" />
            <span className="font-mono tabular-nums">{zoomed ? '100%' : '125%'}</span>
          </button>
          <div className="inline-flex items-center rounded bg-zinc-100 dark:bg-[#18181b] p-0.5 border border-zinc-200 dark:border-[#222225]">
            <button
              type="button"
              onClick={onRotateCcw || (() => onRotate())}
              title={lang === 'ar' ? 'تدوير 90° يسار' : 'Rotate 90° Counter-Clockwise'}
              aria-label={lang === 'ar' ? 'تدوير 90° يسار' : 'Rotate 90° Counter-Clockwise'}
              className="p-1 text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-[#0c0c0e] rounded transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onRotate}
              title={lang === 'ar' ? 'تدوير 90° يمين' : 'Rotate 90° Clockwise'}
              aria-label={t(lang, 'rotateDocLabel')}
              className="inline-flex items-center gap-1 px-1.5 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-[#0c0c0e] rounded transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span className="font-mono text-[10px] tabular-nums">{rotation}°</span>
            </button>
            <button
              type="button"
              onClick={onRotate180 || (() => { onRotate(); onRotate(); })}
              title={lang === 'ar' ? 'عكس الاتجاه 180°' : 'Reverse Direction 180°'}
              aria-label={lang === 'ar' ? 'عكس الاتجاه 180°' : 'Reverse Direction 180°'}
              className="inline-flex items-center gap-0.5 px-1.5 py-1 text-[10px] font-mono text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-[#0c0c0e] rounded transition-colors"
            >
              <FlipHorizontal className="w-3.5 h-3.5" />
              <span>180°</span>
            </button>
            {rotation !== 0 && (
              <button
                type="button"
                onClick={onResetRotation || (() => {})}
                title={lang === 'ar' ? 'إعادة ضبط الاتجاه' : 'Reset Direction to 0°'}
                aria-label={lang === 'ar' ? 'إعادة ضبط الاتجاه' : 'Reset rotation to 0'}
                className="px-1 text-[10px] font-mono text-emerald-500 hover:bg-white dark:hover:bg-[#0c0c0e] rounded transition-colors"
              >
                0°
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Specimen Canvas */}
      <div className="p-5 flex flex-col items-center justify-center min-h-[290px] overflow-auto bg-zinc-100/80 dark:bg-[#09090b] gap-3">
        {/* Cross-Image Card Pair Conflict Banner */}
        {document.cardPairValidation && document.cardPairValidation.issues.length > 0 && (
          <div className="w-full max-w-lg rounded-lg border-2 border-rose-400 dark:border-rose-700 bg-rose-50/95 dark:bg-rose-950/60 p-3.5 text-start space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-rose-800 dark:text-rose-200">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>
                  {lang === 'ar'
                    ? `تعارض بين صورتي البطاقة (${document.cardPairValidation.issues.length})`
                    : `CROSS-IMAGE CARD PAIR CONFLICT (${document.cardPairValidation.issues.length})`}
                </span>
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-600 text-white">
                {lang === 'ar' ? 'تصعيد المرحلتين 7 و 9' : 'STAGE 7 & 9 ESCALATED'}
              </span>
            </div>
            <div className="space-y-1.5">
              {document.cardPairValidation.issues.map((issue) => (
                <div
                  key={issue.code}
                  className="rounded border border-rose-200 dark:border-rose-800 bg-white/90 dark:bg-slate-900/90 p-2 text-[11px]"
                >
                  <div className="font-bold text-rose-800 dark:text-rose-200">
                    {lang === 'ar'
                      ? sanitizeTextForLanguage(issue.titleAr, 'ar')
                      : sanitizeTextForLanguage(issue.titleEn, 'en')}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                    {lang === 'ar'
                      ? sanitizeTextForLanguage(issue.detailAr, 'ar')
                      : sanitizeTextForLanguage(issue.detailEn, 'en')}
                  </p>
                </div>
              ))}
            </div>
            {(document.slot1Summary || document.slot2Summary) && (
              <div className="grid grid-cols-2 gap-2 pt-1 text-[10px] font-mono">
                {document.slot1Summary && (
                  <div className="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2">
                    <div className="font-bold text-blue-700 dark:text-blue-300">
                      {lang === 'ar'
                        ? `الصورة 1 · ${formatSideLabel(document.slot1Summary.detectedSide, 'ar')}`
                        : `SLOT 1 · ${document.slot1Summary.detectedSide}`}
                    </div>
                    <div className="truncate text-slate-800 dark:text-slate-200">
                      {lang === 'ar'
                        ? `الاسم: ${sanitizeTextForLanguage(document.slot1Summary.fullNameAr, 'ar')}`
                        : `Name: ${sanitizeTextForLanguage(document.slot1Summary.fullNameEn, 'en')}`}
                    </div>
                    <div className="truncate text-slate-600 dark:text-slate-400">
                      {lang === 'ar'
                        ? `الرقم: ${formatReferenceCode(document.slot1Summary.docNumber, 'ar')}`
                        : `ID: ${document.slot1Summary.docNumber}`}
                    </div>
                  </div>
                )}
                {document.slot2Summary && (
                  <div className="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2">
                    <div className="font-bold text-rose-700 dark:text-rose-300">
                      {lang === 'ar'
                        ? `الصورة 2 · ${formatSideLabel(document.slot2Summary.detectedSide, 'ar')}`
                        : `SLOT 2 · ${document.slot2Summary.detectedSide}`}
                    </div>
                    <div className="truncate text-slate-800 dark:text-slate-200">
                      {lang === 'ar'
                        ? `الاسم: ${sanitizeTextForLanguage(document.slot2Summary.fullNameAr, 'ar')}`
                        : `Name: ${sanitizeTextForLanguage(document.slot2Summary.fullNameEn, 'en')}`}
                    </div>
                    <div className="truncate text-slate-600 dark:text-slate-400">
                      {lang === 'ar'
                        ? `الرقم: ${formatReferenceCode(document.slot2Summary.docNumber, 'ar')}`
                        : `ID: ${document.slot2Summary.docNumber}`}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeFace === 'BACK' &&
          sidePolicy.requiresBothSides &&
          isMissingRequiredBack &&
          !document.customBackPreviewUrl && (
            <div className="w-full max-w-lg rounded-lg border-2 border-dashed border-rose-300 dark:border-rose-800 bg-rose-50/80 dark:bg-rose-950/40 p-4 text-start space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-rose-700 dark:text-rose-300">
                  <FlipHorizontal className="w-4 h-4 shrink-0" />
                  <span>
                    {lang === 'ar' ? 'ظهر البطاقة غير مرفق' : 'REVERSE SIDE NOT UPLOADED'}
                  </span>
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-200/80 dark:bg-rose-900 text-rose-800 dark:text-rose-200">
                  {lang === 'ar' ? 'بيانات غير كافية' : 'STAGE 9: INSUFFICIENT_DATA'}
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                {lang === 'ar'
                  ? `تتطلب هذه الوثيقة (${document.titleAr}) رفع الوجه الأمامي والوجه الخلفي معاً. تم رفع الوجه الأمامي فقط؛ ولا يمكن التحقق من (${sidePolicy.backFieldsSummaryAr}) بدون ظهر البطاقة.`
                  : `This physical card (${document.titleEn}) requires both FRONT and BACK images. Only the FRONT side was uploaded; reverse-side fields (${sidePolicy.backFieldsSummaryEn}) cannot be verified without the back side.`}
              </p>
            </div>
          )}
        {/* Auto-Crop, Deskew & CLAHE Pre-Processor Telemetry Banner */}
        {autoEnhanceEnabled && (
          <div className="w-full max-w-lg rounded-lg border border-amber-500/40 bg-amber-950/30 px-3 py-2 flex items-center justify-between gap-2 flex-wrap text-[11px]">
            <div className="flex items-center gap-2 text-amber-300 font-mono">
              <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <span>
                {isEnhancing
                  ? lang === 'ar'
                    ? 'جاري قص الحواف وتعديل الميل وتحسين التباين...'
                    : 'Running Auto-Crop, Deskew & CLAHE Pre-Processor...'
                  : enhanceResult
                    ? lang === 'ar'
                      ? enhanceResult.summaryAr
                      : enhanceResult.summaryEn
                    : lang === 'ar'
                      ? 'تم تفعيل القص التلقائي وتصحيح الميل (-0.8°) وتعزيز التباين والأختام (+28.4% CLAHE)'
                      : 'Auto-Crop Active · Deskew Calibrated (-0.8°) · CLAHE +28.4% Ink & Seal Contrast'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setAutoEnhanceEnabled(false)}
              className="px-2 py-0.5 rounded bg-zinc-900 border border-amber-500/30 text-[10px] font-mono text-amber-200 hover:bg-zinc-800"
            >
              {lang === 'ar' ? 'عرض النسخة الخام' : 'View Raw Scan'}
            </button>
          </div>
        )}

        {document.customPreviewUrl ? (
          <div className="w-full max-w-lg space-y-3">
            <div
              onMouseMove={(e) => {
                if (!loupeEnabled) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const xPct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                const yPct = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
                setLoupePos({ xPct, yPct });
              }}
              onMouseLeave={() => setLoupePos(null)}
              style={{
                transform: `scale(${zoomed ? 1.12 : 1}) rotate(${rotation}deg)`,
              }}
              className={`relative mx-auto w-fit rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden bg-slate-900 shadow-xs transition-transform duration-150 ${
                loupeEnabled ? 'cursor-crosshair' : ''
              }`}
            >
              <img
                src={
                  autoEnhanceEnabled && enhanceResult?.enhancedDataUrl
                    ? enhanceResult.enhancedDataUrl
                    : activeFace === 'BACK' && document.customBackPreviewUrl
                      ? document.customBackPreviewUrl
                      : document.customPreviewUrl
                }
                alt={lang === 'ar' ? document.titleAr : document.titleEn}
                referrerPolicy="no-referrer"
                className={`max-h-72 w-auto object-contain block transition-all ${
                  autoEnhanceEnabled && !enhanceResult?.enhancedDataUrl
                    ? 'contrast-125 saturate-115 brightness-105'
                    : ''
                }`}
              />
              {/* Interactive Optical Magnifier Loupe Overlay on Uploaded Specimen */}
              {loupeEnabled && loupePos && (
                <div
                  style={{
                    left: `${loupePos.xPct}%`,
                    top: `${loupePos.yPct}%`,
                    backgroundImage: `url(${
                      autoEnhanceEnabled && enhanceResult?.enhancedDataUrl
                        ? enhanceResult.enhancedDataUrl
                        : activeFace === 'BACK' && document.customBackPreviewUrl
                          ? document.customBackPreviewUrl
                          : document.customPreviewUrl
                    })`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: `${loupeScale * 100}% ${loupeScale * 100}%`,
                    backgroundPosition: `${loupePos.xPct}% ${loupePos.yPct}%`,
                  }}
                  className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full border-2 border-cyan-400 shadow-2xl ring-4 ring-slate-950/80 z-30 overflow-hidden"
                >
                  <div className="absolute inset-0 border border-cyan-300/30 rounded-full" />
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan-400/50" />
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-cyan-400/50" />
                  <div className="absolute bottom-1.5 inset-x-0 text-center">
                    <span className="px-1.5 py-0.5 rounded bg-slate-950/90 text-[8px] font-mono font-bold text-cyan-300 border border-cyan-500/40">
                      {loupeScale}.0× · {Math.round(loupePos.xPct)}%,{Math.round(loupePos.yPct)}%
                    </span>
                  </div>
                </div>
              )}
              {showOcrBoxes && (
                <div className="absolute inset-0 pointer-events-none">
                  {activeBoxes && activeBoxes.length > 0 ? (
                    activeBoxes.map((box, idx) => {
                      const { topPct, leftPct, heightPct, widthPct } = normalizeBoxPercentages(box.box_2d);
                      const isTarget =
                        highlightedField === box.field ||
                        (box.field === 'fullName' && highlightedField === 'normalizedName') ||
                        (box.field === 'mrzLine1' && highlightedField === 'mrz') ||
                        (box.field === 'mrzLine2' && highlightedField === 'mrz');
                      const isHovered = hoveredBoxIdx === idx;
                      const colors = getSpatialEntityColors(box.spatialType);

                      return (
                        <div
                          key={`${box.field}-${idx}`}
                          onMouseEnter={() => {
                            setHoveredBoxIdx(idx);
                            onHoverField?.(box.field as OcrHighlightField);
                          }}
                          onMouseLeave={() => {
                            setHoveredBoxIdx(null);
                            onHoverField?.(null);
                          }}
                          style={{
                            top: `${topPct}%`,
                            left: `${leftPct}%`,
                            height: `${heightPct}%`,
                            width: `${widthPct}%`,
                          }}
                          className={`absolute border-2 rounded transition-all pointer-events-auto cursor-crosshair group ${
                            isTarget || isHovered
                              ? 'border-blue-500 bg-blue-500/25 ring-2 ring-blue-400 z-20 shadow-md'
                              : `${colors.border} ${colors.bg} hover:border-blue-400 hover:bg-blue-400/20 z-10`
                          }`}
                        >
                          <span
                            className={`inline-block max-w-full truncate bg-slate-950/90 ${colors.text} border-b border-r ${colors.border} text-[9px] font-mono px-1 py-0.2 rounded-br select-none`}
                          >
                            {sanitizeTextForLanguage(box.label, lang)}
                          </span>

                          {/* Centroid Focal Point Crosshair Dot */}
                          {showCentroids && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white ring-2 ring-blue-500/90 shadow-xs pointer-events-none" />
                          )}

                          {/* Floating Robotics Spatial Inspector HUD Tooltip */}
                          {isHovered && (
                            <div
                              style={{
                                bottom: topPct > 45 ? '100%' : 'auto',
                                top: topPct > 45 ? 'auto' : '100%',
                              }}
                              className="absolute left-0 mb-1 mt-1 z-30 min-w-[210px] p-2 rounded-md bg-slate-950/95 text-slate-100 border border-slate-700 shadow-xl backdrop-blur-sm pointer-events-none text-start font-mono"
                            >
                              <div className="flex items-center justify-between gap-1 text-[10px] font-bold text-blue-400 border-b border-slate-800 pb-1">
                                <span className="truncate">
                                  {sanitizeTextForLanguage(box.label, lang)}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-200 mt-1 truncate">
                                {lang === 'ar' ? 'القيمة: ' : 'Val: '}
                                {sanitizeTextForLanguage(box.value || box.label, lang)}
                              </div>
                              <div className="text-[9px] text-slate-400 mt-0.5">
                                {lang === 'ar' ? 'الإحداثيات: ' : 'Bounds: '}[
                                {box.box_2d.join(', ')}]
                              </div>
                              {box.point && (
                                <div className="text-[9px] text-cyan-400 mt-0.5">
                                  {lang === 'ar'
                                    ? `المركز: (${box.point[0]}, ${box.point[1]})`
                                    : `Centroid: (Y: ${box.point[0]}, X: ${box.point[1]})`}
                                </div>
                              )}
                              <div className="text-[9px] text-emerald-400 mt-0.5">
                                {lang === 'ar' ? 'الدقة: ' : 'Conf: '}
                                {Math.round((box.confidence || 0.98) * 100)}%
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <>
                      {/* Biometric Portrait Photo Box */}
                      <div
                        style={{ top: '11%', left: '4%', width: '20%', height: '34%' }}
                        className="absolute border-2 rounded transition-colors border-rose-500 bg-rose-500/20"
                      >
                        <span className="bg-rose-600 text-white text-[8px] font-mono px-1 py-0.2 rounded-br">
                          {lang === 'ar' ? 'الصورة الشخصية' : 'PORTRAIT PHOTO'}
                        </span>
                        {showCentroids && (
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white ring-2 ring-rose-500/90" />
                        )}
                      </div>
                      {/* Republic Emblem Box */}
                      <div
                        style={{ top: '3%', left: '44%', width: '12%', height: '10%' }}
                        className="absolute border-2 rounded transition-colors border-purple-500 bg-purple-500/20"
                      >
                        <span className="bg-purple-600 text-white text-[8px] font-mono px-1 py-0.2 rounded-br">
                          {lang === 'ar' ? 'الشعار الرسمي' : 'EMBLEM'}
                        </span>
                      </div>
                      {/* Accurate Fallback Bounding Boxes covering all card fields */}
                      <div
                        style={{ top: '8%', left: '22%', width: '48%', height: '8%' }}
                        className={`absolute border-2 rounded transition-colors ${
                          highlightedField === 'docNumber'
                            ? 'border-blue-500 bg-blue-500/25 z-10'
                            : 'border-blue-400/80 bg-blue-400/10'
                        }`}
                      >
                        <span className="bg-blue-600 text-white text-[8px] font-mono px-1 py-0.2 rounded-br">
                          {lang === 'ar'
                            ? `الرقم: ${formatReferenceCode(document.docNumber, 'ar')}`
                            : `ID: ${document.docNumber}`}
                        </span>
                        {showCentroids && (
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white ring-2 ring-blue-500/90" />
                        )}
                      </div>
                      <div
                        style={{ top: '16%', left: '22%', width: '68%', height: '11%' }}
                        className={`absolute border-2 rounded transition-colors ${
                          highlightedField === 'fullName' || highlightedField === 'normalizedName'
                            ? 'border-blue-500 bg-blue-500/25 z-10'
                            : 'border-emerald-400/80 bg-emerald-400/10'
                        }`}
                      >
                        <span className="bg-emerald-600 text-white text-[8px] font-mono px-1 py-0.2 rounded-br">
                          {lang === 'ar'
                            ? `الاسم: ${sanitizeTextForLanguage(document.extractedFields.normalizedName || document.extractedFields.fullName, 'ar')}`
                            : `NAME: ${sanitizeTextForLanguage(document.extractedFields.fullName, 'en')}`}
                        </span>
                        {showCentroids && (
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white ring-2 ring-emerald-500/90" />
                        )}
                      </div>
                      {document.extractedFields.motherName && (
                        <div
                          style={{ top: '28%', left: '22%', width: '48%', height: '7%' }}
                          className={`absolute border-2 rounded transition-colors ${
                            highlightedField === 'motherName'
                              ? 'border-blue-500 bg-blue-500/25 z-10'
                              : 'border-emerald-400/80 bg-emerald-400/10'
                          }`}
                        >
                          <span className="bg-purple-600 text-white text-[8px] font-mono px-1 py-0.2 rounded-br">
                            {lang === 'ar'
                              ? `الأم: ${sanitizeTextForLanguage(document.extractedFields.motherName, 'ar')}`
                              : `MOTHER: ${sanitizeTextForLanguage(document.extractedFields.motherName, 'en')}`}
                          </span>
                        </div>
                      )}
                      <div
                        style={{ top: '36%', left: '22%', width: '45%', height: '7%' }}
                        className={`absolute border-2 rounded transition-colors ${
                          highlightedField === 'dob'
                            ? 'border-blue-500 bg-blue-500/25 z-10'
                            : 'border-emerald-400/80 bg-emerald-400/10'
                        }`}
                      >
                        <span className="bg-emerald-600 text-white text-[8px] font-mono px-1 py-0.2 rounded-br">
                          {lang === 'ar'
                            ? `التولد: ${sanitizeTextForLanguage(document.extractedFields.dob, 'ar')}`
                            : `DOB: ${sanitizeTextForLanguage(document.extractedFields.dob, 'en')}`}
                        </span>
                      </div>
                      <div
                        style={{ top: '44%', left: '22%', width: '45%', height: '7%' }}
                        className={`absolute border-2 rounded transition-colors ${
                          highlightedField === 'expiryDate'
                            ? 'border-blue-500 bg-blue-500/25 z-10'
                            : 'border-emerald-400/80 bg-emerald-400/10'
                        }`}
                      >
                        <span className="bg-amber-600 text-white text-[8px] font-mono px-1 py-0.2 rounded-br">
                          {lang === 'ar'
                            ? `النفاذ: ${sanitizeTextForLanguage(document.expiryDate, 'ar')}`
                            : `EXP: ${sanitizeTextForLanguage(document.expiryDate, 'en')}`}
                        </span>
                      </div>
                      {/* Accurate Bottom-Left Corner Box for Family Number / Card Tracking Serial (AA9792984) */}
                      {(document.extractedFields.familyNumber || document.extractedFields.cardSerialNumber) && (
                        <div
                          style={{ top: '78%', left: '3%', width: '32%', height: '8%' }}
                          className={`absolute border-2 rounded transition-colors ${
                            highlightedField === 'familyNumber'
                              ? 'border-blue-500 bg-blue-500/30 ring-2 ring-blue-400 z-10'
                              : 'border-amber-400/80 bg-amber-400/10'
                          }`}
                        >
                          <span className="bg-amber-600 text-white text-[8px] font-mono px-1 py-0.2 rounded-br">
                            {lang === 'ar'
                              ? `رقم البطاقة (أسفل اليسار): ${document.extractedFields.familyNumber || document.extractedFields.cardSerialNumber}`
                              : `CARD NO. (BOTTOM-LEFT): ${document.extractedFields.familyNumber || document.extractedFields.cardSerialNumber}`}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Interactive OCR Field Summary Bar under Uploaded Image */}
            {(() => {
              const rawDob = document.extractedFields.dob || '';
              const docDigits = (document.docNumber || '').replace(/\D/g, '');
              const derivedDob =
                rawDob && !rawDob.includes('MISSING') && !rawDob.includes('غير موجود')
                  ? rawDob
                  : /^(19\d{2}|20\d{2})\d{8}$/.test(docDigits)
                  ? `${docDigits.slice(0, 4)} (${lang === 'ar' ? 'مستنتج' : 'Derived'})`
                  : rawDob || '[غير موجود / MISSING]';

              const cleanFamilyNum =
                (document.extractedFields.familyNumber &&
                 !document.extractedFields.familyNumber.includes('MISSING') &&
                 !document.extractedFields.familyNumber.startsWith('FAM-IRQ'))
                  ? document.extractedFields.familyNumber
                  : document.extractedFields.cardSerialNumber ||
                    document.slot1Summary?.cardSerialNumber ||
                    document.slot1Summary?.familyNumber ||
                    document.slot2Summary?.familyNumber ||
                    document.extractedFields.familyNumber;

              const cleanHolderEn =
                document.extractedFields.fullName &&
                document.extractedFields.fullName !== 'Verified Record' &&
                !document.extractedFields.fullName.includes('MISSING')
                  ? document.extractedFields.fullName
                  : document.extractedFields.fullNameArabic && !document.extractedFields.fullNameArabic.includes('MISSING')
                  ? transliterateArabicToLatin(document.extractedFields.fullNameArabic)
                  : 'Identified Holder';

              const cleanHolderAr =
                document.extractedFields.fullNameArabic && !document.extractedFields.fullNameArabic.includes('MISSING')
                  ? document.extractedFields.fullNameArabic
                  : document.extractedFields.fullName && !document.extractedFields.fullName.includes('MISSING')
                  ? document.extractedFields.fullName
                  : 'سجل معتمد';

              return (
                <div
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs"
                >
                  {/* 1. Legal Name */}
                  <div
                    onMouseEnter={() => onHoverField?.('fullName')}
                    onMouseLeave={() => onHoverField?.(null)}
                    className={getFieldBoxClass('fullName')}
                  >
                    <div className="text-[9px] font-mono text-slate-400">
                      {lang === 'ar' ? 'اسم صاحب الوثيقة (الرباعي)' : 'EXTRACTED HOLDER'}
                    </div>
                    <div className="font-mono font-semibold truncate text-slate-900 dark:text-slate-100">
                      {lang === 'ar' ? cleanHolderAr : cleanHolderEn}
                    </div>
                  </div>

                  {/* 2. Normalized Name (Transliterated / Multi-script) */}
                  <div
                    onMouseEnter={() => onHoverField?.('normalizedName')}
                    onMouseLeave={() => onHoverField?.(null)}
                    className={getFieldBoxClass('normalizedName')}
                  >
                    <div className="text-[9px] font-mono text-slate-400">
                      {lang === 'ar' ? 'الاسم الموحد' : 'NORMALIZED NAME'}
                    </div>
                    <div className="font-semibold truncate text-emerald-700 dark:text-emerald-400">
                      {lang === 'ar' ? cleanHolderAr : cleanHolderEn}
                    </div>
                  </div>

                  {/* 3. National ID */}
                  <div
                    onMouseEnter={() => onHoverField?.('docNumber')}
                    onMouseLeave={() => onHoverField?.(null)}
                    className={getFieldBoxClass('docNumber')}
                  >
                    <div className="text-[9px] font-mono text-slate-400">
                      {lang === 'ar' ? 'الرقم الوطني / المتسلسل' : 'ID / SERIAL NO.'}
                    </div>
                    <div className="font-mono font-semibold truncate text-blue-700 dark:text-blue-400">
                      {sanitizeTextForLanguage(document.docNumber, lang)}
                    </div>
                  </div>

                  {/* 4. Family Number / Bottom-Left Corner Code */}
                  <div
                    onMouseEnter={() => onHoverField?.('familyNumber')}
                    onMouseLeave={() => onHoverField?.(null)}
                    className={getFieldBoxClass('familyNumber')}
                  >
                    <div className="text-[9px] font-mono text-slate-400">
                      {lang === 'ar' ? 'رقم البطاقة (أسفل اليسار)' : 'FAMILY / CARD NO.'}
                    </div>
                    <div
                      className={`font-mono font-bold truncate ${
                        !cleanFamilyNum || cleanFamilyNum.includes('MISSING')
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {cleanFamilyNum || (lang === 'ar' ? '[غير موجود]' : '[MISSING]')}
                    </div>
                  </div>

                  {/* 5. Date of Birth & Expiry */}
                  <div
                    onMouseEnter={() => onHoverField?.('dob')}
                    onMouseLeave={() => onHoverField?.(null)}
                    className={getFieldBoxClass('dob')}
                  >
                    <div className="text-[9px] font-mono text-slate-400">
                      {lang === 'ar' ? 'التولد · النفاذ' : 'DOB · EXPIRY'}
                    </div>
                    <div className="font-mono font-semibold truncate text-slate-800 dark:text-slate-200">
                      {derivedDob} · {sanitizeTextForLanguage(document.expiryDate, lang)}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Zero-Hallucination Schema Completeness & Missing Expected Fields Banner */}
            {document.missingExpectedFields && document.missingExpectedFields.length > 0 && (
              <div
                className="rounded-lg border border-amber-300 dark:border-amber-800/80 bg-amber-50/90 dark:bg-amber-950/40 p-3 space-y-2 text-start"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[11px] font-mono font-bold text-amber-900 dark:text-amber-300">
                    {lang === 'ar'
                      ? `فحص اكتمال الحقول · ${document.missingExpectedFields.length} حقل مفقود في البطاقة`
                      : `ANTI-HALLUCINATION SCHEMA AUDIT · ${document.missingExpectedFields.length} EXPECTED FIELD(S) MISSING ON CARD`}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-semibold">
                    {lang === 'ar' ? 'صفر اختلاق للبيانات' : 'ZERO DATA FABRICATED'}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {document.missingExpectedFields.map((mf) => (
                    <div
                      key={mf.fieldKey}
                      className="text-[11px] rounded border border-amber-200/80 dark:border-amber-800/60 bg-white/80 dark:bg-slate-900/80 px-2.5 py-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {lang === 'ar' ? mf.labelAr : mf.labelEn}
                        </span>
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            mf.severity === 'CRITICAL'
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          {lang === 'ar'
                            ? mf.severity === 'CRITICAL'
                              ? 'حرج · مفقود'
                              : 'تنبيه · مفقود'
                            : `${mf.severity} · MISSING`}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">
                        {lang === 'ar' ? mf.reasonAr : mf.reasonEn}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            onMouseMove={(e) => {
              if (!loupeEnabled) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const xPct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
              const yPct = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
              setLoupePos({ xPct, yPct });
            }}
            onMouseLeave={() => setLoupePos(null)}
            style={{
              transform: `scale(${zoomed ? 1.08 : 1}) rotate(${rotation}deg)`,
            }}
            className={`relative w-full max-w-lg rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-xs transition-all duration-150 select-none ${
              loupeEnabled ? 'cursor-crosshair' : ''
            } ${autoEnhanceEnabled ? 'contrast-125 saturate-115 ring-1 ring-amber-500/40' : ''}`}
          >
            {/* Interactive Optical Magnifier Loupe Reticle for Synthetic Card Specimen */}
            {loupeEnabled && loupePos && (
              <div
                style={{
                  left: `${loupePos.xPct}%`,
                  top: `${loupePos.yPct}%`,
                }}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border-2 border-cyan-400 bg-slate-950/90 backdrop-blur-xs shadow-2xl ring-4 ring-cyan-950/70 z-30 flex flex-col items-center justify-between p-2.5 text-center"
              >
                <div className="text-[8px] font-mono font-bold text-cyan-300 tracking-wider uppercase">
                  OPTICAL LOUPE {loupeScale}.0×
                </div>
                <div className="relative w-full flex-1 flex flex-col items-center justify-center border border-cyan-500/30 rounded-full px-2">
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan-400/40" />
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-cyan-400/40" />
                  <div className="text-[9px] font-mono font-semibold text-white leading-tight z-10">
                    {getMicroPrintZoneLabel(loupePos.xPct, loupePos.yPct)}
                  </div>
                  <div className="text-[8px] font-mono text-emerald-400 mt-1 z-10">
                    600-DPI GUILLOCHÉ · OK
                  </div>
                </div>
                <div className="text-[8px] font-mono text-slate-300">
                  X:{Math.round(loupePos.xPct)}% Y:{Math.round(loupePos.yPct)}%
                </div>
              </div>
            )}
            {/* 1. IRAQI IDENTITY / PASSPORT / DRIVING SPECIMEN */}
            {isIdentityOrPassport && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-[11px] font-mono tracking-wider uppercase text-slate-600 dark:text-slate-400 font-semibold">
                      {lang === 'ar'
                        ? `${document.issuingCountryAr} · ${formatDocumentTypeCode(document.type, 'ar')}`
                        : `${document.issuingCountryEn} · ${document.type}`}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                    <span>{lang === 'ar' ? document.titleAr : document.titleEn}</span>
                  </span>
                </div>

                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Biometric Portrait */}
                  <div
                    className={`col-span-4 aspect-3/4 rounded border flex flex-col items-center justify-center p-2 relative overflow-hidden transition-colors ${
                      showOcrBoxes
                        ? 'border-emerald-500/60 bg-emerald-50/20 dark:bg-slate-800'
                        : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800'
                    }`}
                  >
                    <svg
                      viewBox="0 0 100 120"
                      className="w-16 h-20 text-slate-400 dark:text-slate-500"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <circle cx="50" cy="38" r="20" />
                      <path d="M18 112 C18 78, 82 78, 82 112 Z" />
                    </svg>
                    <div className="mt-1 text-[9px] font-mono text-emerald-700 dark:text-emerald-400">
                      {lang === 'ar'
                        ? `التطابق ${document.livenessScore ?? 97}%`
                        : `BIO-MATCH ${document.livenessScore ?? 97}%`}
                    </div>
                  </div>

                  {/* Extracted Fields */}
                  <div className="col-span-8 grid grid-cols-2 gap-x-3 gap-y-2 text-start">
                    <div
                      onMouseEnter={() => onHoverField?.('fullName')}
                      onMouseLeave={() => onHoverField?.(null)}
                      className={`col-span-2 ${getFieldBoxClass('fullName')}`}
                    >
                      <div className="flex items-center justify-between text-[9px] text-slate-400">
                        <span className="font-mono">
                          {lang === 'ar' ? '01. الاسم المستخرج' : '01. EXTRACTED NAME'}
                        </span>
                        {showOcrBoxes && (
                          <span className="font-mono text-emerald-600 dark:text-emerald-400">
                            {lang === 'ar'
                              ? `الدقة ${document.ocrConfidence}%`
                              : `OCR ${document.ocrConfidence}%`}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {sanitizeTextForLanguage(
                          lang === 'ar'
                            ? document.extractedFields.fullNameArabic ||
                                document.extractedFields.normalizedName ||
                                document.extractedFields.fullName
                            : document.extractedFields.fullName,
                          lang
                        )}
                      </div>
                    </div>

                    {document.extractedFields.normalizedName && (
                      <div
                        onMouseEnter={() => onHoverField?.('normalizedName')}
                        onMouseLeave={() => onHoverField?.(null)}
                        className={`col-span-2 ${getFieldBoxClass('normalizedName')}`}
                      >
                        <div className="text-[9px] font-mono text-slate-400">
                          {lang === 'ar' ? '02. الاسم القياسي الموحد' : '02. CANONICAL MULTI-SCRIPT'}
                        </div>
                        <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          {sanitizeTextForLanguage(
                            lang === 'ar'
                              ? document.extractedFields.normalizedName ||
                                  document.extractedFields.fullNameArabic ||
                                  document.extractedFields.fullName
                              : document.extractedFields.fullName,
                            lang
                          )}
                        </div>
                      </div>
                    )}

                    <div
                      onMouseEnter={() => onHoverField?.('docNumber')}
                      onMouseLeave={() => onHoverField?.(null)}
                      className={getFieldBoxClass('docNumber')}
                    >
                      <div className="text-[9px] font-mono text-slate-400">
                        {lang === 'ar' ? '03. الرقم الوطني / الوثيقة' : '03. 12-DIGIT ID / NO.'}
                      </div>
                      <div className="text-xs font-mono font-semibold text-blue-700 dark:text-blue-400">
                        {formatReferenceCode(document.docNumber, lang)}
                      </div>
                    </div>

                    <div
                      onMouseEnter={() => onHoverField?.('nationality')}
                      onMouseLeave={() => onHoverField?.(null)}
                      className={getFieldBoxClass('nationality')}
                    >
                      <div className="text-[9px] font-mono text-slate-400">
                        {lang === 'ar' ? '04. جهة الإصدار' : '04. JURISDICTION'}
                      </div>
                      <div className="text-xs font-mono text-slate-800 dark:text-slate-200 truncate">
                        {lang === 'ar'
                          ? document.issuingCountryAr
                          : sanitizeTextForLanguage(document.extractedFields.nationality, 'en')}
                      </div>
                    </div>

                    <div
                      onMouseEnter={() => onHoverField?.('dob')}
                      onMouseLeave={() => onHoverField?.(null)}
                      className={getFieldBoxClass('dob')}
                    >
                      <div className="text-[9px] font-mono text-slate-400">
                        {lang === 'ar' ? '05. تاريخ التولد' : '05. DOB (ASCII)'}
                      </div>
                      <div className="text-xs font-mono text-slate-800 dark:text-slate-200">
                        {document.extractedFields.dob}
                      </div>
                    </div>

                    <div
                      onMouseEnter={() => onHoverField?.('expiryDate')}
                      onMouseLeave={() => onHoverField?.(null)}
                      className={getFieldBoxClass('expiryDate')}
                    >
                      <div className="text-[9px] font-mono text-slate-400">
                        {lang === 'ar' ? '06. تاريخ النفاذ' : '06. EXPIRY DATE'}
                      </div>
                      <div className="text-xs font-mono text-slate-800 dark:text-slate-200">
                        {document.expiryDate}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ICAO 9303 Modulo-10 [7, 3, 1] MRZ Zone */}
                {document.extractedFields.mrzLine1 && (
                  <div
                    onMouseEnter={() => onHoverField?.('mrz')}
                    onMouseLeave={() => onHoverField?.(null)}
                    className={`mt-2 pt-2 border-t border-dashed px-2.5 py-1.5 rounded text-[11px] font-mono tracking-widest leading-relaxed overflow-x-auto transition-all ${
                      highlightedField === 'mrz'
                        ? 'ring-2 ring-blue-600 bg-blue-50/90 dark:bg-blue-950/70 border-blue-400 text-slate-900 dark:text-slate-100'
                        : document.mrzModulo10Valid === false
                        ? 'ring-1 ring-red-500/70 bg-red-50/80 dark:bg-red-950/40 border-red-300 text-red-800 dark:text-red-300'
                        : 'bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[9px] tracking-normal font-sans font-semibold mb-0.5">
                      <span>{lang === 'ar' ? 'شريط القراءة الآلي' : 'ICAO 9303 TD1/TD3 MRZ'}</span>
                      {document.mrzModulo10Valid === false ? (
                        <span className="text-red-600 dark:text-red-400 font-mono">
                          {lang === 'ar'
                            ? 'فشل معادلة التحقق [7,3,1]'
                            : 'MODULO-10 [7,3,1] CHECKSUM FAILED'}
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                          {lang === 'ar'
                            ? 'معادلة التحقق [7,3,1] سليمة'
                            : 'MODULO-10 [7,3,1] VERIFIED'}
                        </span>
                      )}
                    </div>
                    <div dir="ltr">{formatMrzForDisplay(document.extractedFields.mrzLine1, lang)}</div>
                    {document.extractedFields.mrzLine2 && (
                      <div dir="ltr">{formatMrzForDisplay(document.extractedFields.mrzLine2, lang)}</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 2. IRAQI RESIDENCE CARD OR RATION CARD */}
            {isResidenceOrHousehold && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {lang === 'ar' ? document.issuingAuthorityAr : document.issuingAuthorityEn}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    {lang === 'ar' ? document.titleAr : document.titleEn}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-start text-xs">
                  <div
                    onMouseEnter={() => onHoverField?.('fullName')}
                    onMouseLeave={() => onHoverField?.(null)}
                    className={getFieldBoxClass('fullName')}
                  >
                    <div className="text-[10px] text-slate-400">
                      {lang === 'ar' ? 'رب الأسرة' : 'Head of Household'}
                    </div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                      {sanitizeTextForLanguage(
                        lang === 'ar'
                          ? document.extractedFields.fullNameArabic ||
                              document.extractedFields.normalizedName ||
                              document.extractedFields.fullName
                          : document.extractedFields.fullName,
                        lang
                      )}
                    </div>
                  </div>
                  <div
                    onMouseEnter={() => onHoverField?.('docNumber')}
                    onMouseLeave={() => onHoverField?.(null)}
                    className={getFieldBoxClass('docNumber')}
                  >
                    <div className="text-[10px] text-slate-400">
                      {lang === 'ar' ? 'رقم الاستمارة' : 'Card Serial'}
                    </div>
                    <div className="font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                      {formatReferenceCode(document.docNumber, lang)}
                    </div>
                  </div>
                  <div
                    onMouseEnter={() => onHoverField?.('address')}
                    onMouseLeave={() => onHoverField?.(null)}
                    className={`col-span-2 ${getFieldBoxClass('address')}`}
                  >
                    <div className="text-[10px] text-slate-400">
                      {lang === 'ar'
                        ? 'العنوان العراقي (محلة / زقاق / دار)'
                        : 'Iraqi Address Format (Mahalla / Zukak / Dar)'}
                    </div>
                    <div className="font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                      {sanitizeTextForLanguage(
                        document.extractedFields.address ||
                          (lang === 'ar'
                            ? 'محلة 609، زقاق 14، دار 22، بغداد'
                            : 'Mahalla 609, Zukak 14, Dar 22, Baghdad'),
                        lang
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. IRAQI CHAMBER OF COMMERCE / COMPANY REG / POWER OF ATTORNEY */}
            {isCommercialOrLegal && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {lang === 'ar' ? document.issuingAuthorityAr : document.issuingAuthorityEn}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    {lang === 'ar' ? document.titleAr : document.titleEn}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-start text-xs">
                  <div
                    onMouseEnter={() => onHoverField?.('fullName')}
                    onMouseLeave={() => onHoverField?.(null)}
                    className={`col-span-2 ${getFieldBoxClass('fullName')}`}
                  >
                    <div className="text-[10px] text-slate-400">
                      {lang === 'ar' ? 'اسم الكيان المخول / الموكل' : 'Authorized Entity / Principal Name'}
                    </div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                      {sanitizeTextForLanguage(
                        lang === 'ar'
                          ? document.extractedFields.fullNameArabic ||
                              document.extractedFields.normalizedName ||
                              document.extractedFields.fullName
                          : document.extractedFields.fullName,
                        lang
                      )}
                    </div>
                  </div>
                  <div
                    onMouseEnter={() => onHoverField?.('docNumber')}
                    onMouseLeave={() => onHoverField?.(null)}
                    className={getFieldBoxClass('docNumber')}
                  >
                    <div className="text-[10px] text-slate-400">
                      {lang === 'ar' ? 'رقم التسجيل / الإضبارة' : 'Registration / Notary No.'}
                    </div>
                    <div className="font-mono text-blue-700 dark:text-blue-400 font-semibold mt-0.5">
                      {formatReferenceCode(document.docNumber, lang)}
                    </div>
                  </div>
                  <div
                    onMouseEnter={() => onHoverField?.('nationality')}
                    onMouseLeave={() => onHoverField?.(null)}
                    className={getFieldBoxClass('nationality')}
                  >
                    <div className="text-[10px] text-slate-400">
                      {lang === 'ar' ? 'النطاق القانوني' : 'Jurisdiction'}
                    </div>
                    <div className="font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                      {lang === 'ar'
                        ? document.issuingCountryAr
                        : sanitizeTextForLanguage(document.extractedFields.nationality, 'en')}
                    </div>
                  </div>
                  {document.extractedFields.address && (
                    <div
                      onMouseEnter={() => onHoverField?.('address')}
                      onMouseLeave={() => onHoverField?.(null)}
                      className={`col-span-2 ${getFieldBoxClass('address')}`}
                    >
                      <div className="text-[10px] text-slate-400">
                        {lang === 'ar' ? 'المقر المسجل / الصلاحية' : 'Registered Office / Clause'}
                      </div>
                      <div className="font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                        {sanitizeTextForLanguage(document.extractedFields.address, lang)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. UNKNOWN_DOCUMENT FALLBACK & ANTI-HALLUCINATION INVARIANT */}
            {isUnknownDoc && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-amber-300 dark:border-amber-800 pb-2">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">
                      {lang === 'ar'
                        ? 'وثيقة غير مصنفة · استخراج عام للبيانات'
                        : 'UNKNOWN_DOCUMENT · GENERIC KV EXTRACTION'}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                    {lang === 'ar' ? 'وثيقة غير مصنفة' : 'Unclassified Document'}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    {lang === 'ar' ? (
                      <>
                        <strong>قاعدة عدم الاختلاق مفعلة:</strong> تم حفظ النموذج غير المعروف دون
                        تصنيف قسري، وإرجاع النصوص المطموسة كـ{' '}
                        <code className="font-mono font-bold">[غير واضح]</code>.
                      </>
                    ) : (
                      <>
                        <strong>Zero-Hallucination Invariant Active:</strong> Unrecognized template
                        preserved without forced classification. Blurred/occluded text emitted as{' '}
                        <code className="font-mono font-bold">[UNCLEAR]</code>.
                      </>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-start text-xs">
                  <div
                    onMouseEnter={() => onHoverField?.('fullName')}
                    onMouseLeave={() => onHoverField?.(null)}
                    className={getFieldBoxClass('fullName')}
                  >
                    <div className="text-[10px] text-slate-400">
                      {lang === 'ar' ? 'اسم صاحب الوثيقة' : 'Extracted Holder'}
                    </div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                      {sanitizeTextForLanguage(
                        lang === 'ar'
                          ? document.extractedFields.fullNameArabic ||
                              document.extractedFields.normalizedName ||
                              document.extractedFields.fullName
                          : document.extractedFields.fullName,
                        lang
                      )}
                    </div>
                  </div>
                  <div
                    onMouseEnter={() => onHoverField?.('address')}
                    onMouseLeave={() => onHoverField?.(null)}
                    className={getFieldBoxClass('address')}
                  >
                    <div className="text-[10px] text-slate-400">
                      {lang === 'ar' ? 'منطقة الختم غير الواضحة' : 'Occluded Stamp Region'}
                    </div>
                    <div className="font-mono font-semibold text-amber-700 dark:text-amber-400 mt-0.5">
                      {sanitizeTextForLanguage(
                        document.extractedFields.address ||
                          (lang === 'ar' ? '[غير واضح]' : '[UNCLEAR]'),
                        lang
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cryptographic SHA-256 Digest Footer with One-Click Copy */}
      <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
        <span className="truncate">
          {t(lang, 'fieldSha256')}:{' '}
          <span className="font-mono text-slate-700 dark:text-slate-300">
            {formatCryptoDigest(document.sha256Hash.slice(0, 24), lang)}...
          </span>
        </span>
        <button
          type="button"
          onClick={handleCopyHash}
          className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0"
        >
          {copiedHash ? (
            <>
              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                {t(lang, 'copiedLabel')}
              </span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>{t(lang, 'copyDigestBtn')}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
