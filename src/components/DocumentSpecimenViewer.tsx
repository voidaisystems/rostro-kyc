import React from 'react';
import { ShieldCheck, FileText, Building2, Fingerprint, ZoomIn, RotateCw } from 'lucide-react';
import type { KYCDocument, Language } from '../utils/kycEngine';
import { t } from '../utils/i18n';

interface DocumentSpecimenViewerProps {
  document: KYCDocument;
  lang: Language;
  zoomed: boolean;
  rotation: number;
  onToggleZoom: () => void;
  onRotate: () => void;
}

export const DocumentSpecimenViewer: React.FC<DocumentSpecimenViewerProps> = ({
  document,
  lang,
  zoomed,
  rotation,
  onToggleZoom,
  onRotate,
}) => {
  const isPassportOrId = document.type === 'passport' || document.type === 'national_id';
  const isUtility = document.type === 'utility_bill';
  const isCorporate = document.type === 'corporate_registry';

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900/90 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {lang === 'ar' ? document.titleAr : document.titleEn}
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">{document.docNumber}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">{document.fileSizeKb} KB</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleZoom}
            aria-label={t(lang, 'zoomInLabel')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors whitespace-nowrap shrink-0"
          >
            <ZoomIn className="w-3.5 h-3.5" />
            <span>{zoomed ? '100%' : '125%'}</span>
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
      <div className="p-5 flex items-center justify-center min-h-[290px] overflow-auto bg-slate-100/80 dark:bg-slate-950/60">
        {document.customPreviewUrl ? (
          <img
            src={document.customPreviewUrl}
            alt={lang === 'ar' ? document.titleAr : document.titleEn}
            referrerPolicy="no-referrer"
            style={{
              transform: `scale(${zoomed ? 1.15 : 1}) rotate(${rotation}deg)`,
            }}
            className="max-h-64 rounded border border-slate-300 dark:border-slate-700 object-contain transition-transform duration-150"
          />
        ) : (
          <div
            style={{
              transform: `scale(${zoomed ? 1.08 : 1}) rotate(${rotation}deg)`,
            }}
            className="w-full max-w-lg rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-xs transition-transform duration-150 select-none"
          >
            {isPassportOrId && (
              <div className="space-y-3" dir="ltr">
                {/* Official Specimen Header */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-[11px] font-mono tracking-wider uppercase text-slate-600 dark:text-slate-400 font-semibold">
                      {document.issuingCountryEn} · ICAO 9303 eMRTD SPECIMEN
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                    <span className="font-mono">{document.type === 'passport' ? 'PASSPORT' : 'NATIONAL ID'}</span>
                    {' / '}
                    <span>{document.type === 'passport' ? 'جواز سفر' : 'بطاقة هوية'}</span>
                  </span>
                </div>

                {/* Middle Bio Data Grid */}
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Biometric Portrait Silhouette */}
                  <div className="col-span-4 aspect-3/4 rounded border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center p-2 relative overflow-hidden">
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
                      BIO-MATCH {document.livenessScore ?? 96}%
                    </div>
                  </div>

                  {/* Extracted Fields */}
                  <div className="col-span-8 grid grid-cols-2 gap-x-3 gap-y-2 text-left">
                    <div className="col-span-2 border-b border-dashed border-emerald-500/40 pb-1">
                      <div className="text-[9px] text-slate-400">
                        <span className="font-mono">01. FULL NAME</span> / <span>الاسم</span>
                      </div>
                      <div className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {document.extractedFields.fullName}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] font-mono text-slate-400">02. DOCUMENT NO.</div>
                      <div className="text-xs font-mono font-semibold text-blue-700 dark:text-blue-400">
                        {document.docNumber}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] font-mono text-slate-400">03. NATIONALITY</div>
                      <div className="text-xs font-mono text-slate-800 dark:text-slate-200">
                        {document.extractedFields.nationality}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] font-mono text-slate-400">04. DATE OF BIRTH</div>
                      <div className="text-xs font-mono text-slate-800 dark:text-slate-200">
                        {document.extractedFields.dob}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] font-mono text-slate-400">05. EXPIRY DATE</div>
                      <div className="text-xs font-mono text-slate-800 dark:text-slate-200">
                        {document.expiryDate}
                      </div>
                    </div>
                  </div>
                </div>

                {/* MRZ Zone */}
                {document.extractedFields.mrzLine1 && (
                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 rounded font-mono text-[10px] leading-tight tracking-widest text-slate-700 dark:text-slate-300 overflow-x-auto">
                    <div>{document.extractedFields.mrzLine1}</div>
                    <div>{document.extractedFields.mrzLine2}</div>
                  </div>
                )}
              </div>
            )}

            {isUtility && (
              <div className="space-y-3" dir="ltr">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {document.titleEn}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    STATEMENT #{document.docNumber}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-[10px] font-mono text-slate-400">ACCOUNT HOLDER</div>
                    <div className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                      {document.extractedFields.fullName}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-slate-400">STATEMENT ISSUE DATE</div>
                    <div className="font-mono text-slate-800 dark:text-slate-200">
                      {document.issueDate}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-[10px] font-mono text-slate-400">VERIFIED SERVICE ADDRESS</div>
                    <div className="font-mono text-slate-800 dark:text-slate-200">
                      {document.extractedFields.address || 'Verified Residential Premise'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isCorporate && (
              <div className="space-y-3" dir="ltr">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {document.titleEn}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    REG #{document.docNumber}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-[10px] font-mono text-slate-400">REGISTERED LEGAL ENTITY</div>
                    <div className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                      {document.extractedFields.fullName}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-slate-400">INCORPORATION DATE</div>
                    <div className="font-mono text-slate-800 dark:text-slate-200">
                      {document.extractedFields.dob}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-[10px] font-mono text-slate-400">REGISTERED SEAT</div>
                    <div className="font-mono text-slate-800 dark:text-slate-200">
                      {document.extractedFields.address}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {document.type === 'liveness_selfie' && (
              <div className="flex items-center gap-4 py-2" dir="ltr">
                <Fingerprint className="w-10 h-10 text-blue-600 dark:text-blue-400 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    3D Active Depth Map & Liveness Frame
                  </div>
                  <div className="text-[11px] font-mono text-slate-500">
                    Subject: {document.extractedFields.fullName} · Score: {document.livenessScore ?? 98}%
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cryptographic Footer */}
      <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
        <span className="font-mono truncate max-w-md" title={document.sha256Hash}>
          SHA-256: {document.sha256Hash.slice(0, 28)}...
        </span>
        <span className="tabular-nums text-slate-700 dark:text-slate-300">
          <span>{t(lang, 'ocrConfidenceLabel')}: </span>
          <span className="font-mono font-semibold">{document.ocrConfidence}%</span>
        </span>
      </div>
    </div>
  );
};
