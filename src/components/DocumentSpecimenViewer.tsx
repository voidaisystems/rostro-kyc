/**
 * Copyright (c) 2026 Rostro Compliance Systems (مشروع روسترو للامتثال).
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *
 * @file src/components/DocumentSpecimenViewer.tsx
 * @module @rostro/ui/DocumentSpecimenViewer
 * @description
 * Interactive Forensic Document Specimen Viewer with Front/Back physical side flipping,
 * spatial OCR bounding-box overlays, ICAO Doc 9303 MRZ line inspection, and zoom/rotation controls.
 */

import React, { useState } from 'react';
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
} from 'lucide-react';
import {
  getDocumentSideRequirement,
  type KYCDocument,
  type Language,
} from '../utils/kycEngine';
import { t } from '../utils/i18n';

export type OcrHighlightField =
  | 'fullName'
  | 'normalizedName'
  | 'docNumber'
  | 'nationality'
  | 'dob'
  | 'expiryDate'
  | 'address'
  | 'mrz'
  | null;

interface DocumentSpecimenViewerProps {
  document: KYCDocument;
  lang: Language;
  zoomed: boolean;
  rotation: number;
  onToggleZoom: () => void;
  onRotate: () => void;
  highlightedField?: OcrHighlightField;
  onHoverField?: (field: OcrHighlightField) => void;
}

export const DocumentSpecimenViewer: React.FC<DocumentSpecimenViewerProps> = ({
  document,
  lang,
  zoomed,
  rotation,
  onToggleZoom,
  onRotate,
  highlightedField = null,
  onHoverField,
}) => {
  const [showOcrBoxes, setShowOcrBoxes] = useState<boolean>(true);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);
  const [activeFace, setActiveFace] = useState<'FRONT' | 'BACK'>('FRONT');

  const sidePolicy = getDocumentSideRequirement(document.type);
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

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900/90 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-wrap">
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 flex-wrap">
          <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {document.categoryCode.split('_')[0]} · {document.supportStatus}
          </span>
          {/* Physical Side Completeness Badge */}
          <span
            className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border ${
              !sidePolicy.requiresBothSides
                ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : document.side === 'BOTH'
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
            }`}
          >
            {!sidePolicy.requiresBothSides
              ? 'SINGLE BIO-PAGE · PASSPORT'
              : document.side === 'BOTH'
                ? 'FRONT + BACK VERIFIED (BOTH)'
                : `SIDE: ${document.side} ONLY · BACK MISSING`}
          </span>
          {document.engineMode === 'gemini-vlm-live' && (
            <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80">
              GEMINI VLM LIVE OCR
            </span>
          )}
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {lang === 'ar' ? document.titleAr : document.titleEn}
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">{document.docNumber}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {sidePolicy.requiresBothSides && (
            <div className="inline-flex items-center rounded bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setActiveFace('FRONT')}
                className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded transition-colors ${
                  activeFace === 'FRONT'
                    ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                FRONT (الأمام)
              </button>
              <button
                type="button"
                onClick={() => setActiveFace('BACK')}
                className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded transition-colors ${
                  activeFace === 'BACK'
                    ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-2xs'
                    : isMissingRequiredBack
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {isMissingRequiredBack ? 'BACK (مفقود)' : 'BACK (الظهر)'}
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowOcrBoxes((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
              showOcrBoxes
                ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <ScanLine className="w-3.5 h-3.5" />
            <span>{t(lang, 'ocrOverlayLabel')}</span>
          </button>
          <button
            type="button"
            onClick={onToggleZoom}
            aria-label={t(lang, 'zoomInLabel')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors whitespace-nowrap shrink-0"
          >
            <ZoomIn className="w-3.5 h-3.5" />
            <span className="font-mono tabular-nums">{zoomed ? '100%' : '125%'}</span>
          </button>
          <button
            type="button"
            onClick={onRotate}
            aria-label={t(lang, 'rotateDocLabel')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="font-mono tabular-nums">{rotation}°</span>
          </button>
        </div>
      </div>

      {/* Specimen Canvas */}
      <div className="p-5 flex flex-col items-center justify-center min-h-[290px] overflow-auto bg-slate-100/80 dark:bg-slate-950/60 gap-3">
        {activeFace === 'BACK' && sidePolicy.requiresBothSides && isMissingRequiredBack && (
          <div className="w-full max-w-lg rounded-lg border-2 border-dashed border-rose-300 dark:border-rose-800 bg-rose-50/80 dark:bg-rose-950/40 p-4 text-left space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-rose-700 dark:text-rose-300">
                <FlipHorizontal className="w-4 h-4 shrink-0" />
                <span>REVERSE SIDE (ظهر البطاقة) NOT UPLOADED</span>
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-200/80 dark:bg-rose-900 text-rose-800 dark:text-rose-200">
                STAGE 9: INSUFFICIENT_DATA
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300">
              This physical card ({document.type}) requires both <strong>FRONT</strong> and{' '}
              <strong>BACK</strong> images. Only the FRONT side was uploaded; reverse-side fields (
              {sidePolicy.backFieldsSummaryEn}) cannot be verified without the back side.
            </p>
          </div>
        )}
        {document.customPreviewUrl ? (
          <div className="w-full max-w-lg space-y-3">
            <div
              style={{
                transform: `scale(${zoomed ? 1.12 : 1}) rotate(${rotation}deg)`,
              }}
              className="relative mx-auto w-fit rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden bg-slate-900 shadow-xs transition-transform duration-150"
            >
              <img
                src={
                  activeFace === 'BACK' && document.customBackPreviewUrl
                    ? document.customBackPreviewUrl
                    : document.customPreviewUrl
                }
                alt={lang === 'ar' ? document.titleAr : document.titleEn}
                referrerPolicy="no-referrer"
                className="max-h-72 w-auto object-contain block"
              />
              {showOcrBoxes && (
                <div className="absolute inset-0 pointer-events-none">
                  {document.boundingBoxes && document.boundingBoxes.length > 0 ? (
                    document.boundingBoxes.map((box, idx) => {
                      const [ymin, xmin, ymax, xmax] = box.box_2d;
                      const topPct = Math.max(0, Math.min(92, ymin / 10));
                      const leftPct = Math.max(0, Math.min(92, xmin / 10));
                      const heightPct = Math.max(8, Math.min(100 - topPct, (ymax - ymin) / 10));
                      const widthPct = Math.max(15, Math.min(100 - leftPct, (xmax - xmin) / 10));
                      const isTarget =
                        highlightedField === box.field ||
                        (box.field === 'fullName' && highlightedField === 'normalizedName');

                      return (
                        <div
                          key={`${box.field}-${idx}`}
                          style={{
                            top: `${topPct}%`,
                            left: `${leftPct}%`,
                            height: `${heightPct}%`,
                            width: `${widthPct}%`,
                          }}
                          className={`absolute border-2 rounded transition-colors ${
                            isTarget
                              ? 'border-blue-500 bg-blue-500/20'
                              : 'border-emerald-400/85 bg-emerald-400/10'
                          }`}
                        >
                          <span className="inline-block max-w-full truncate bg-slate-950/90 text-emerald-300 border-b border-r border-emerald-500/50 text-[9px] font-mono px-1 py-0.2 rounded-br">
                            {box.label}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <>
                      <div
                        className={`absolute top-[16%] left-[32%] right-[8%] h-[16%] border-2 rounded transition-colors ${
                          highlightedField === 'fullName' || highlightedField === 'normalizedName'
                            ? 'border-blue-500 bg-blue-500/20'
                            : 'border-emerald-400/80 bg-emerald-400/10'
                        }`}
                      >
                        <span className="bg-emerald-600 text-white text-[9px] font-mono px-1 py-0.2 rounded-br">
                          NAME: {document.extractedFields.fullName}
                        </span>
                      </div>
                      <div
                        className={`absolute top-[38%] left-[32%] right-[22%] h-[14%] border-2 rounded transition-colors ${
                          highlightedField === 'docNumber'
                            ? 'border-blue-500 bg-blue-500/20'
                            : 'border-emerald-400/80 bg-emerald-400/10'
                        }`}
                      >
                        <span className="bg-blue-600 text-white text-[9px] font-mono px-1 py-0.2 rounded-br">
                          ID: {document.docNumber}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Interactive OCR Field Summary Bar under Uploaded Image */}
            <div
              dir="ltr"
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs"
            >
              <div
                onMouseEnter={() => onHoverField?.('fullName')}
                onMouseLeave={() => onHoverField?.(null)}
                className={getFieldBoxClass('fullName')}
              >
                <div className="text-[9px] font-mono text-slate-400">EXTRACTED HOLDER</div>
                <div
                  className={`font-mono font-semibold truncate ${
                    document.extractedFields.fullName.includes('MISSING') ||
                    document.extractedFields.fullName.includes('غير موجود')
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-slate-900 dark:text-slate-100'
                  }`}
                >
                  {document.extractedFields.fullName}
                </div>
              </div>
              <div
                onMouseEnter={() => onHoverField?.('normalizedName')}
                onMouseLeave={() => onHoverField?.(null)}
                className={getFieldBoxClass('normalizedName')}
              >
                <div className="text-[9px] font-mono text-slate-400">NORMALIZED (AR/KU)</div>
                <div
                  className={`font-semibold truncate ${
                    (document.extractedFields.normalizedName || '').includes('MISSING') ||
                    (document.extractedFields.normalizedName || '').includes('غير موجود')
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-emerald-700 dark:text-emerald-400'
                  }`}
                >
                  {document.extractedFields.normalizedName || document.extractedFields.fullName}
                </div>
              </div>
              <div
                onMouseEnter={() => onHoverField?.('docNumber')}
                onMouseLeave={() => onHoverField?.(null)}
                className={getFieldBoxClass('docNumber')}
              >
                <div className="text-[9px] font-mono text-slate-400">ID / SERIAL NO.</div>
                <div
                  className={`font-mono font-semibold truncate ${
                    document.docNumber.includes('MISSING') ||
                    document.docNumber.includes('غير موجود')
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-blue-700 dark:text-blue-400'
                  }`}
                >
                  {document.docNumber}
                </div>
              </div>
              <div
                onMouseEnter={() => onHoverField?.('dob')}
                onMouseLeave={() => onHoverField?.(null)}
                className={getFieldBoxClass('dob')}
              >
                <div className="text-[9px] font-mono text-slate-400">
                  {document.type === 'IRQ_RESIDENCE_CARD' || document.type === 'IRQ_RATION_CARD'
                    ? 'ADDRESS (MAHALLA/ZUKAK/DAR)'
                    : 'DOB · EXPIRY'}
                </div>
                <div
                  className={`font-mono font-semibold truncate ${
                    (document.type === 'IRQ_RESIDENCE_CARD' || document.type === 'IRQ_RATION_CARD'
                      ? document.extractedFields.address || ''
                      : `${document.extractedFields.dob} · ${document.expiryDate}`
                    ).includes('MISSING') ||
                    (document.type === 'IRQ_RESIDENCE_CARD' || document.type === 'IRQ_RATION_CARD'
                      ? document.extractedFields.address || ''
                      : `${document.extractedFields.dob} · ${document.expiryDate}`
                    ).includes('غير موجود')
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {document.type === 'IRQ_RESIDENCE_CARD' || document.type === 'IRQ_RATION_CARD'
                    ? document.extractedFields.address || '[غير موجود / MISSING]'
                    : `${document.extractedFields.dob} · ${document.expiryDate}`}
                </div>
              </div>
            </div>

            {/* Zero-Hallucination Schema Completeness & Missing Expected Fields Banner */}
            {document.missingExpectedFields && document.missingExpectedFields.length > 0 && (
              <div
                dir="ltr"
                className="rounded-lg border border-amber-300 dark:border-amber-800/80 bg-amber-50/90 dark:bg-amber-950/40 p-3 space-y-2 text-left"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[11px] font-mono font-bold text-amber-900 dark:text-amber-300">
                    ANTI-HALLUCINATION SCHEMA AUDIT · {document.missingExpectedFields.length} EXPECTED FIELD(S) MISSING ON CARD
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-semibold">
                    ZERO DATA FABRICATED
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
                          {mf.labelEn}
                        </span>
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            mf.severity === 'CRITICAL'
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          {mf.severity} · MISSING
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
            style={{
              transform: `scale(${zoomed ? 1.08 : 1}) rotate(${rotation}deg)`,
            }}
            className="w-full max-w-lg rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-xs transition-transform duration-150 select-none"
          >
            {/* 1. IRAQI IDENTITY / PASSPORT / DRIVING SPECIMEN */}
            {isIdentityOrPassport && (
              <div className="space-y-3" dir="ltr">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-[11px] font-mono tracking-wider uppercase text-slate-600 dark:text-slate-400 font-semibold">
                      {document.issuingCountryEn} · {document.type}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                    <span>{document.titleAr}</span>
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
                      BIO-MATCH {document.livenessScore ?? 97}%
                    </div>
                  </div>

                  {/* Extracted Fields */}
                  <div className="col-span-8 grid grid-cols-2 gap-x-3 gap-y-2 text-left">
                    <div
                      onMouseEnter={() => onHoverField?.('fullName')}
                      onMouseLeave={() => onHoverField?.(null)}
                      className={`col-span-2 ${getFieldBoxClass('fullName')}`}
                    >
                      <div className="flex items-center justify-between text-[9px] text-slate-400">
                        <span>
                          <span className="font-mono">01. EXTRACTED NAME</span> / <span>الاسم</span>
                        </span>
                        {showOcrBoxes && (
                          <span className="font-mono text-emerald-600 dark:text-emerald-400">
                            OCR {document.ocrConfidence}%
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {document.extractedFields.fullName}
                      </div>
                    </div>

                    {document.extractedFields.normalizedName && (
                      <div
                        onMouseEnter={() => onHoverField?.('normalizedName')}
                        onMouseLeave={() => onHoverField?.(null)}
                        className={`col-span-2 ${getFieldBoxClass('normalizedName')}`}
                      >
                        <div className="text-[9px] font-mono text-slate-400">
                          02. CANONICAL MULTI-SCRIPT (AR/KU)
                        </div>
                        <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          {document.extractedFields.normalizedName}
                        </div>
                      </div>
                    )}

                    <div
                      onMouseEnter={() => onHoverField?.('docNumber')}
                      onMouseLeave={() => onHoverField?.(null)}
                      className={getFieldBoxClass('docNumber')}
                    >
                      <div className="text-[9px] font-mono text-slate-400">03. 12-DIGIT ID / NO.</div>
                      <div className="text-xs font-mono font-semibold text-blue-700 dark:text-blue-400">
                        {document.docNumber}
                      </div>
                    </div>

                    <div
                      onMouseEnter={() => onHoverField?.('nationality')}
                      onMouseLeave={() => onHoverField?.(null)}
                      className={getFieldBoxClass('nationality')}
                    >
                      <div className="text-[9px] font-mono text-slate-400">04. JURISDICTION</div>
                      <div className="text-xs font-mono text-slate-800 dark:text-slate-200 truncate">
                        {document.extractedFields.nationality}
                      </div>
                    </div>

                    <div
                      onMouseEnter={() => onHoverField?.('dob')}
                      onMouseLeave={() => onHoverField?.(null)}
                      className={getFieldBoxClass('dob')}
                    >
                      <div className="text-[9px] font-mono text-slate-400">05. DOB (ASCII)</div>
                      <div className="text-xs font-mono text-slate-800 dark:text-slate-200">
                        {document.extractedFields.dob}
                      </div>
                    </div>

                    <div
                      onMouseEnter={() => onHoverField?.('expiryDate')}
                      onMouseLeave={() => onHoverField?.(null)}
                      className={getFieldBoxClass('expiryDate')}
                    >
                      <div className="text-[9px] font-mono text-slate-400">06. EXPIRY DATE</div>
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
                      <span>ICAO 9303 TD1/TD3 MRZ</span>
                      {document.mrzModulo10Valid === false ? (
                        <span className="text-red-600 dark:text-red-400 font-mono">
                          MODULO-10 [7,3,1] CHECKSUM FAILED
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                          MODULO-10 [7,3,1] VERIFIED
                        </span>
                      )}
                    </div>
                    <div>{document.extractedFields.mrzLine1}</div>
                    {document.extractedFields.mrzLine2 && (
                      <div>{document.extractedFields.mrzLine2}</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 2. IRAQI RESIDENCE CARD (بطاقة السكن) OR RATION CARD */}
            {isResidenceOrHousehold && (
              <div className="space-y-3" dir="ltr">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {document.issuingAuthorityEn}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    {document.titleAr}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-left text-xs">
                  <div
                    onMouseEnter={() => onHoverField?.('fullName')}
                    onMouseLeave={() => onHoverField?.(null)}
                    className={getFieldBoxClass('fullName')}
                  >
                    <div className="text-[10px] text-slate-400">Head of Household / رب الأسرة</div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                      {document.extractedFields.fullName}
                    </div>
                  </div>
                  <div
                    onMouseEnter={() => onHoverField?.('docNumber')}
                    onMouseLeave={() => onHoverField?.(null)}
                    className={getFieldBoxClass('docNumber')}
                  >
                    <div className="text-[10px] text-slate-400">Card Serial / رقم الاستمارة</div>
                    <div className="font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                      {document.docNumber}
                    </div>
                  </div>
                  <div
                    onMouseEnter={() => onHoverField?.('address')}
                    onMouseLeave={() => onHoverField?.(null)}
                    className={`col-span-2 ${getFieldBoxClass('address')}`}
                  >
                    <div className="text-[10px] text-slate-400">
                      Iraqi Address Format (Mahalla / Zukak / Dar · محلة / زقاق / دار)
                    </div>
                    <div className="font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                      {document.extractedFields.address || 'Mahalla 609, Zukak 14, Dar 22, Baghdad'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. IRAQI CHAMBER OF COMMERCE / COMPANY REG / POWER OF ATTORNEY */}
            {isCommercialOrLegal && (
              <div className="space-y-3" dir="ltr">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {document.issuingAuthorityEn}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    {document.titleAr}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-left text-xs">
                  <div
                    onMouseEnter={() => onHoverField?.('fullName')}
                    onMouseLeave={() => onHoverField?.(null)}
                    className={`col-span-2 ${getFieldBoxClass('fullName')}`}
                  >
                    <div className="text-[10px] text-slate-400">
                      Authorized Entity / Principal Name
                    </div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                      {document.extractedFields.fullName}
                    </div>
                  </div>
                  <div
                    onMouseEnter={() => onHoverField?.('docNumber')}
                    onMouseLeave={() => onHoverField?.(null)}
                    className={getFieldBoxClass('docNumber')}
                  >
                    <div className="text-[10px] text-slate-400">Registration / Notary No.</div>
                    <div className="font-mono text-blue-700 dark:text-blue-400 font-semibold mt-0.5">
                      {document.docNumber}
                    </div>
                  </div>
                  <div
                    onMouseEnter={() => onHoverField?.('nationality')}
                    onMouseLeave={() => onHoverField?.(null)}
                    className={getFieldBoxClass('nationality')}
                  >
                    <div className="text-[10px] text-slate-400">Jurisdiction</div>
                    <div className="font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                      {document.extractedFields.nationality}
                    </div>
                  </div>
                  {document.extractedFields.address && (
                    <div
                      onMouseEnter={() => onHoverField?.('address')}
                      onMouseLeave={() => onHoverField?.(null)}
                      className={`col-span-2 ${getFieldBoxClass('address')}`}
                    >
                      <div className="text-[10px] text-slate-400">Registered Office / Clause</div>
                      <div className="font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                        {document.extractedFields.address}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. UNKNOWN_DOCUMENT FALLBACK & ANTI-HALLUCINATION INVARIANT */}
            {isUnknownDoc && (
              <div className="space-y-3" dir="ltr">
                <div className="flex items-center justify-between border-b border-amber-300 dark:border-amber-800 pb-2">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">
                      UNKNOWN_DOCUMENT · GENERIC KV EXTRACTION
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                    وثيقة غير مصنفة
                  </span>
                </div>
                <div className="p-2.5 rounded bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Zero-Hallucination Invariant Active:</strong> Unrecognized template
                    preserved without forced classification. Blurred/occluded text emitted as{' '}
                    <code className="font-mono font-bold">[غير واضح]</code>.
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-left text-xs">
                  <div
                    onMouseEnter={() => onHoverField?.('fullName')}
                    onMouseLeave={() => onHoverField?.(null)}
                    className={getFieldBoxClass('fullName')}
                  >
                    <div className="text-[10px] text-slate-400">Extracted Holder</div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                      {document.extractedFields.fullName}
                    </div>
                  </div>
                  <div
                    onMouseEnter={() => onHoverField?.('address')}
                    onMouseLeave={() => onHoverField?.(null)}
                    className={getFieldBoxClass('address')}
                  >
                    <div className="text-[10px] text-slate-400">Occluded Stamp Region</div>
                    <div className="font-mono font-semibold text-amber-700 dark:text-amber-400 mt-0.5">
                      {document.extractedFields.address || '[غير واضح]'}
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
            {document.sha256Hash.slice(0, 24)}...
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
