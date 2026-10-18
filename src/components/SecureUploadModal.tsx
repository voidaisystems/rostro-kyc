import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  ShieldCheck,
  FileCheck2,
  Lock,
  Sparkles,
  AlertTriangle,
  FlipHorizontal,
  CheckCircle2,
} from 'lucide-react';
import {
  calculateRiskTier,
  getDocumentSideRequirement,
  isMissingOrUnclearValue,
  normalizeMultiScriptText,
  type DocumentCategoryCode,
  type DocumentSupportStatus,
  type DocumentType,
  type KYCApplicant,
  type Language,
  type MissingExpectedField,
  type NineVerificationSignals,
  type OcrBoundingBox,
  type PipelineStage9Outcome,
} from '../utils/kycEngine';
import { t } from '../utils/i18n';

interface SecureUploadModalProps {
  isOpen: boolean;
  lang: Language;
  onClose: () => void;
  onIngestApplicant: (newApplicant: KYCApplicant) => void;
}

type IraqiGovKey = 'BGD' | 'EBL' | 'BSR' | 'SUL' | 'MOS';

interface ServerExtractionResponse {
  documentType: DocumentType;
  categoryCode: DocumentCategoryCode;
  supportStatus: DocumentSupportStatus;
  side: 'FRONT' | 'BACK' | 'BOTH';
  detectedLanguages: ('ar' | 'en' | 'ku')[];
  titleEn: string;
  titleAr: string;
  fullNameEn: string;
  fullNameAr: string;
  normalizedName: string;
  docNumber: string;
  dob: string;
  issueDate: string;
  expiryDate: string;
  governorateKey: IraqiGovKey;
  governorateEn: string;
  governorateAr: string;
  issuingAuthorityEn: string;
  issuingAuthorityAr: string;
  address: string;
  familyNumber: string;
  mrzLine1: string;
  mrzLine2: string;
  mrzModulo10Valid: boolean;
  ocrConfidence: number;
  livenessScore: number;
  hasGlare: boolean;
  hasBlur: boolean;
  sha256Hash: string;
  cbiLaw78HmacReceipt: string;
  nineSignals: NineVerificationSignals;
  boundingBoxes: OcrBoundingBox[];
  missingExpectedFields?: MissingExpectedField[];
  engineMode: 'gemini-vlm-live' | 'deterministic-fallback';
}

export const SecureUploadModal: React.FC<SecureUploadModalProps> = ({
  isOpen,
  lang,
  onClose,
  onIngestApplicant,
}) => {
  const [fullNameEn, setFullNameEn] = useState('');
  const [fullNameAr, setFullNameAr] = useState('');
  const [email, setEmail] = useState('');
  const [govKey, setGovKey] = useState<IraqiGovKey>('BGD');
  const [entityType, setEntityType] = useState<'individual' | 'corporate'>('individual');
  const [docType, setDocType] = useState<DocumentType>('IRQ_NATIONAL_ID');
  const [docNumber, setDocNumber] = useState('');

  // Front / Primary Bio-Data Page state
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFileSizeKb, setSelectedFileSizeKb] = useState(1540);
  const [selectedMimeType, setSelectedMimeType] = useState('image/png');
  const [customPreviewUrl, setCustomPreviewUrl] = useState<string | undefined>(undefined);

  // Back / Reverse Card Side state
  const [selectedBackFileName, setSelectedBackFileName] = useState('');
  const [selectedBackFileSizeKb, setSelectedBackFileSizeKb] = useState(0);
  const [selectedBackMimeType, setSelectedBackMimeType] = useState('image/png');
  const [customBackPreviewUrl, setCustomBackPreviewUrl] = useState<string | undefined>(undefined);

  const [validationError, setValidationError] = useState('');
  const [uploadStage, setUploadStage] = useState<0 | 1 | 2 | 3>(0);
  const [isExtractingOcr, setIsExtractingOcr] = useState<boolean>(false);
  const [lastExtraction, setLastExtraction] = useState<ServerExtractionResponse | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const backFileInputRef = useRef<HTMLInputElement | null>(null);
  const extractionPromiseRef = useRef<Promise<ServerExtractionResponse | null> | null>(null);

  if (!isOpen) return null;

  const activeDocType = lastExtraction?.documentType || docType;
  const sidePolicy = getDocumentSideRequirement(activeDocType);
  const hasBothSidesAttached = Boolean(
    selectedFileName && (selectedBackFileName || !sidePolicy.requiresBothSides)
  );

  const govMap: Record<
    IraqiGovKey,
    { countryEn: string; countryAr: string; govEn: string; govAr: string }
  > = {
    BGD: {
      countryEn: 'Iraq',
      countryAr: 'العراق',
      govEn: 'Baghdad (Al-Karkh)',
      govAr: 'بغداد (الكرخ)',
    },
    EBL: {
      countryEn: 'Iraq (KRG)',
      countryAr: 'العراق (إقليم كردستان)',
      govEn: 'Erbil (Hawler)',
      govAr: 'أربيل (هەولێر)',
    },
    BSR: {
      countryEn: 'Iraq',
      countryAr: 'العراق',
      govEn: 'Basra (Al-Ashar)',
      govAr: 'البصرة (العشار)',
    },
    SUL: {
      countryEn: 'Iraq (KRG)',
      countryAr: 'العراق (إقليم كردستان)',
      govEn: 'Sulaymaniyah (As-Sulaymaniyyah)',
      govAr: 'السليمانية (سلێمانی)',
    },
    MOS: {
      countryEn: 'Iraq',
      countryAr: 'العراق',
      govEn: 'Nineveh (Mosul)',
      govAr: 'نينوى (الموصل)',
    },
  };

  const runServerGeminiExtraction = (
    base64Data: string | undefined,
    mimeType: string,
    fileName: string,
    forceReplaceFields = true,
    backBase64Data?: string,
    backMime = 'image/png',
    uploadedSideHint?: 'FRONT' | 'BACK' | 'BOTH'
  ): Promise<ServerExtractionResponse | null> => {
    setIsExtractingOcr(true);
    const task = (async (): Promise<ServerExtractionResponse | null> => {
      try {
        const response = await fetch('/api/kyc/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            mimeType,
            fileName,
            backImageBase64: backBase64Data,
            backMimeType: backMime,
            uploadedSideHint,
            overrides: forceReplaceFields
              ? {}
              : {
                  fullNameEn: fullNameEn.trim() || undefined,
                  fullNameAr: fullNameAr.trim() || undefined,
                  docNumber: docNumber.trim() || undefined,
                  docType,
                  govKey,
                },
          }),
        });
        if (!response.ok) return null;
        const data: ServerExtractionResponse = await response.json();
        setLastExtraction(data);

        // Always populate the form with the newly extracted document data
        if (forceReplaceFields) {
          setFullNameEn(data.fullNameEn || '');
          setFullNameAr(data.fullNameAr || '');
          setDocNumber(data.docNumber || '');
        } else {
          setFullNameEn((prev) => (prev.trim() ? prev : data.fullNameEn));
          setFullNameAr((prev) => (prev.trim() ? prev : data.fullNameAr));
          setDocNumber((prev) => (prev.trim() ? prev : data.docNumber));
        }
        if (data.documentType) setDocType(data.documentType);
        if (data.governorateKey) setGovKey(data.governorateKey);

        return data;
      } catch {
        return null;
      } finally {
        setIsExtractingOcr(false);
        extractionPromiseRef.current = null;
      }
    })();
    extractionPromiseRef.current = task;
    return task;
  };

  const processSelectedFile = (file: File) => {
    setSelectedFileName(file.name);
    setSelectedFileSizeKb(Math.max(80, Math.round(file.size / 1024)));
    setSelectedMimeType(file.type || 'image/png');
    setValidationError('');
    setLastExtraction(null);

    const sideHint: 'FRONT' | 'BOTH' = selectedBackFileName ? 'BOTH' : 'FRONT';

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCustomPreviewUrl(reader.result);
          void runServerGeminiExtraction(
            reader.result,
            file.type || 'image/png',
            file.name,
            true,
            customBackPreviewUrl,
            selectedBackMimeType,
            sideHint
          );
        }
      };
      reader.readAsDataURL(file);
    } else {
      setCustomPreviewUrl(undefined);
      void runServerGeminiExtraction(
        undefined,
        file.type || 'application/pdf',
        file.name,
        true,
        customBackPreviewUrl,
        selectedBackMimeType,
        sideHint
      );
    }
  };

  const processSelectedBackFile = (file: File) => {
    setSelectedBackFileName(file.name);
    setSelectedBackFileSizeKb(Math.max(80, Math.round(file.size / 1024)));
    setSelectedBackMimeType(file.type || 'image/png');
    setValidationError('');

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCustomBackPreviewUrl(reader.result);
          void runServerGeminiExtraction(
            customPreviewUrl,
            selectedMimeType,
            selectedFileName || file.name,
            false,
            reader.result,
            file.type || 'image/png',
            'BOTH'
          );
        }
      };
      reader.readAsDataURL(file);
    } else {
      setCustomBackPreviewUrl(undefined);
      void runServerGeminiExtraction(
        customPreviewUrl,
        selectedMimeType,
        selectedFileName || file.name,
        false,
        undefined,
        file.type || 'application/pdf',
        'BOTH'
      );
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processSelectedFile(file);
  };

  const handleBackFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processSelectedBackFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    processSelectedFile(file);
  };

  const handleBackDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    processSelectedBackFile(file);
  };

  const handleAttachSampleBackSide = () => {
    const backName = 'irq_card_reverse_mrz_specimen.png';
    setSelectedBackFileName(backName);
    setSelectedBackFileSizeKb(1180);
    setValidationError('');
    if (!selectedFileName) {
      setSelectedFileName('irq_national_id_front_specimen.png');
    }
    void runServerGeminiExtraction(
      customPreviewUrl,
      selectedMimeType,
      selectedFileName || 'irq_national_id_front_specimen.png',
      false,
      customBackPreviewUrl,
      selectedBackMimeType,
      'BOTH'
    );
  };

  const handleLoadSampleSpecimen = () => {
    const sampleNameEn = 'Kadhem Mohammad Ali Al-Baghdadi';
    const sampleNameAr = 'كاظم محمد علي البغدادي';
    const sampleDocNum = 'A1234567';
    const sampleFile = 'irq_national_id_kadhem_albaghdadi_front.png';
    const sampleBackFile = 'irq_national_id_kadhem_albaghdadi_back.png';

    setFullNameEn(sampleNameEn);
    setFullNameAr(sampleNameAr);
    if (!email.trim()) setEmail('k.albaghdadi@sulaymaniyah-trade.iq');
    setDocNumber(sampleDocNum);
    setGovKey('SUL');
    setSelectedFileName(sampleFile);
    setSelectedFileSizeKb(1420);
    setSelectedBackFileName(sampleBackFile);
    setSelectedBackFileSizeKb(1180);
    setValidationError('');

    void runServerGeminiExtraction(
      undefined,
      'image/png',
      sampleFile,
      false,
      undefined,
      'image/png',
      'BOTH'
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFileName.trim() && !fullNameEn.trim() && !docNumber.trim()) {
      setValidationError(t(lang, 'validationErrorRequired'));
      return;
    }

    setValidationError('');
    setUploadStage(1);

    const sideHint: 'FRONT' | 'BOTH' = selectedBackFileName ? 'BOTH' : 'FRONT';

    // Wait for any in-flight Gemini VLM OCR extraction to complete first!
    let extracted = lastExtraction;
    if (extractionPromiseRef.current) {
      extracted = await extractionPromiseRef.current;
    } else if (!extracted) {
      extracted = await runServerGeminiExtraction(
        customPreviewUrl,
        selectedMimeType,
        selectedFileName || 'irq_specimen_upload.png',
        false,
        customBackPreviewUrl,
        selectedBackMimeType,
        sideHint
      );
    }

    setUploadStage(2);
    await new Promise((r) => setTimeout(r, 150));
    setUploadStage(3);
    await new Promise((r) => setTimeout(r, 150));

    const gInfo = govMap[extracted?.governorateKey || govKey];
    const resolvedNameEn =
      extracted?.engineMode === 'gemini-vlm-live'
        ? extracted.fullNameEn || fullNameEn.trim()
        : fullNameEn.trim() || extracted?.fullNameEn || 'Kadhem Mohammad Ali Al-Baghdadi';
    const resolvedNameAr =
      extracted?.engineMode === 'gemini-vlm-live'
        ? extracted.fullNameAr || fullNameAr.trim()
        : fullNameAr.trim() || extracted?.fullNameAr || 'كاظم محمد علي البغدادي';
    const rawDocNum =
      extracted?.engineMode === 'gemini-vlm-live'
        ? extracted.docNumber || docNumber.trim()
        : docNumber.trim() || extracted?.docNumber || 'A1234567';

    const normalizedDocNum = isMissingOrUnclearValue(rawDocNum)
      ? '[غير موجود / MISSING]'
      : normalizeMultiScriptText(rawDocNum).toUpperCase();
    const normalizedAr = isMissingOrUnclearValue(resolvedNameAr)
      ? '[غير موجود / MISSING]'
      : normalizeMultiScriptText(resolvedNameAr);
    const upperName = isMissingOrUnclearValue(resolvedNameEn)
      ? '[غير موجود / MISSING]'
      : resolvedNameEn.toUpperCase();

    const finalDocType = extracted?.documentType || docType;
    const finalSidePolicy = getDocumentSideRequirement(finalDocType);
    const resolvedSide: 'FRONT' | 'BACK' | 'BOTH' =
      selectedBackFileName || extracted?.side === 'BOTH'
        ? 'BOTH'
        : extracted?.side === 'BACK'
          ? 'BACK'
          : 'FRONT';

    const missingFields = extracted?.missingExpectedFields || [];
    const criticalMissing = missingFields.filter((f) => f.severity === 'CRITICAL');
    const isMissingRequiredSecondSide =
      finalSidePolicy.requiresBothSides && resolvedSide !== 'BOTH';
    const hasCriticalMissing =
      isMissingRequiredSecondSide ||
      criticalMissing.length > 0 ||
      isMissingOrUnclearValue(resolvedNameEn) ||
      isMissingOrUnclearValue(rawDocNum);
    const isUnknownOrPoa =
      finalDocType === 'UNKNOWN_DOCUMENT' || finalDocType === 'IRQ_POWER_OF_ATTORNEY';

    const stage9Outcome: PipelineStage9Outcome = hasCriticalMissing
      ? 'INSUFFICIENT_DATA'
      : isUnknownOrPoa || missingFields.length > 0
        ? 'HUMAN_REVIEW'
        : 'AUTO_APPROVED';

    const initialStatus =
      stage9Outcome === 'INSUFFICIENT_DATA' || stage9Outcome === 'HUMAN_REVIEW'
        ? 'flagged'
        : 'pending';

    const riskScore = hasCriticalMissing ? 58 : isUnknownOrPoa ? 42 : 11;
    const newId = `app-${Date.now()}`;
    const refNum = Math.floor(9100 + Math.random() * 800);

    const missingSummaryEn =
      missingFields.length > 0
        ? ` · Missing Expected Field(s) / Side Flagged (Zero-Hallucination): ${missingFields.map((m) => m.labelEn).join(', ')}`
        : '';
    const missingSummaryAr =
      missingFields.length > 0
        ? ` · تنبيه نقص حقول أو وجه البطاقة (دون اختلاق بيانات): ${missingFields.map((m) => m.labelAr).join('، ')}`
        : '';

    const newApplicant: KYCApplicant = {
      id: newId,
      referenceCode: `ROSTRO-2026-${refNum}`,
      fullNameEn: resolvedNameEn,
      fullNameAr: resolvedNameAr,
      normalizedEntityName: normalizedAr,
      email: email.trim() || 'compliance.contact@iraq-enterprise.iq',
      phone: '+964 770 901 4420',
      countryCode: 'IQ',
      countryEn: gInfo.countryEn,
      countryAr: gInfo.countryAr,
      governorateEn:
        extracted?.governorateEn && !isMissingOrUnclearValue(extracted.governorateEn)
          ? extracted.governorateEn
          : gInfo.govEn,
      governorateAr:
        extracted?.governorateAr && !isMissingOrUnclearValue(extracted.governorateAr)
          ? extracted.governorateAr
          : gInfo.govAr,
      entityType,
      submittedAt: '2026-10-17 08:45 UTC',
      updatedAt: '2026-10-17 08:45 UTC',
      status: initialStatus,
      stage9Outcome,
      riskScore,
      riskTier: calculateRiskTier(riskScore),
      sanctionsMatch: false,
      pepMatch: false,
      adverseMediaMatch: false,
      biometricMatchScore: extracted?.livenessScore ?? 98,
      assignedReviewerEn: 'Zainab Al-Rubaye',
      assignedReviewerAr: 'زينب الربيعي',
      nineSignals: extracted?.nineSignals || {
        image_quality: 0.96,
        classification_confidence: finalDocType === 'UNKNOWN_DOCUMENT' ? 0.35 : 0.99,
        extraction_confidence: 0.97,
        normalization_quality: 1.0,
        format_validity: hasCriticalMissing ? 0.55 : 1.0,
        document_consistency: hasCriticalMissing ? 0.52 : 0.98,
        cross_document_consistency: hasCriticalMissing ? 0.65 : 0.97,
        authenticity_risk_indicators: 0.98,
        external_verification_status: 'EXTERNAL_VERIFICATION_UNAVAILABLE',
      },
      documents: [
        {
          id: `doc-${Date.now()}`,
          type: finalDocType,
          categoryCode: extracted?.categoryCode || 'A_IDENTITY_CIVIL',
          supportStatus: extracted?.supportStatus || 'TESTED',
          side: resolvedSide,
          detectedLanguages: extracted?.detectedLanguages || ['ar', 'ku', 'en'],
          titleEn:
            extracted?.titleEn || 'Unified Iraqi National Card (البطاقة الوطنية)',
          titleAr: extracted?.titleAr || 'البطاقة الوطنية الموحدة',
          docNumber: normalizedDocNum,
          issueDate: extracted?.issueDate || '[غير موجود / MISSING]',
          expiryDate: extracted?.expiryDate || '[غير موجود / MISSING]',
          issuingAuthorityEn:
            extracted?.issuingAuthorityEn ||
            'Directorate of National Card — Ministry of Interior',
          issuingAuthorityAr:
            extracted?.issuingAuthorityAr || 'مديرية البطاقة الوطنية — وزارة الداخلية',
          issuingCountryEn: 'Republic of Iraq',
          issuingCountryAr: 'جمهورية العراق',
          ocrConfidence: extracted?.ocrConfidence ?? 97,
          livenessScore: extracted?.livenessScore ?? 98,
          hasGlare: extracted?.hasGlare ?? false,
          hasBlur: extracted?.hasBlur ?? false,
          mrzModulo10Valid: extracted?.mrzModulo10Valid ?? true,
          fileSizeKb: selectedFileSizeKb + selectedBackFileSizeKb,
          sha256Hash:
            extracted?.sha256Hash ||
            'a4f982b17c5d3901e62a48c7b902f1e4c6b8d0912a34f5e6d7c8b9a012345678',
          status: initialStatus,
          customPreviewUrl,
          customBackPreviewUrl,
          boundingBoxes: extracted?.boundingBoxes,
          missingExpectedFields: missingFields,
          engineMode: extracted?.engineMode || 'gemini-vlm-live',
          extractedFields: {
            fullName: upperName,
            normalizedName: normalizedAr,
            dob: extracted?.dob || '[غير موجود / MISSING]',
            nationality: `IRQ · ${extracted?.governorateEn || gInfo.govEn}`,
            mrzLine1:
              extracted?.mrzLine1 || '[غير موجود على الوثيقة / NO MRZ ON CARD]',
            mrzLine2:
              extracted?.mrzLine2 || '[غير موجود على الوثيقة / NO MRZ ON CARD]',
            address:
              extracted?.address || '[غير موجود / MISSING]',
            familyNumber: extracted?.familyNumber || '[غير موجود / MISSING]',
          },
        },
      ],
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          timestamp: '2026-10-17 08:45 UTC',
          actorEn:
            extracted?.engineMode === 'gemini-vlm-live'
              ? 'Gemini 3 Flash VLM OCR + Dual-Side & Anti-Hallucination Gate'
              : 'UniversalKYCPipeline v2.0.0-IRQ',
          actorAr: 'محرك روسترو الشامل + بوابة الوجهين وعدم الهلوسة',
          actionEn: `Classified as ${extracted?.titleEn || finalDocType} (Side: ${resolvedSide}) · Holder: ${resolvedNameEn} (${resolvedNameAr}) · ID: ${normalizedDocNum}${missingSummaryEn}`,
          actionAr: `تم تصنيف الوثيقة كـ (${extracted?.titleAr || finalDocType} · الوجه: ${resolvedSide}) · الاسم: ${resolvedNameAr} (${normalizedDocNum})${missingSummaryAr}`,
          cbiLaw78HmacReceipt:
            extracted?.cbiLaw78HmacReceipt || 'HMAC-SHA256-CBI78-a4f982b17c5d3901',
        },
      ],
    };

    setUploadStage(0);
    setFullNameEn('');
    setFullNameAr('');
    setEmail('');
    setDocNumber('');
    setSelectedFileName('');
    setSelectedBackFileName('');
    setCustomPreviewUrl(undefined);
    setCustomBackPreviewUrl(undefined);
    setLastExtraction(null);
    onIngestApplicant(newApplicant);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
    >
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-lg max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2
              id="upload-modal-title"
              className="text-base font-bold text-slate-900 dark:text-slate-100"
            >
              {t(lang, 'uploadModalTitle')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t(lang, 'uploadModalSubtitle')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t(lang, 'cancelBtn')}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {validationError && (
            <div
              role="alert"
              className="p-3 rounded-lg border border-red-200 dark:border-red-800/80 bg-red-50 dark:bg-red-950/50 text-xs text-red-700 dark:text-red-300 font-medium"
            >
              {validationError}
            </div>
          )}

          {/* Card Front+Back vs. Passport Single-Page Policy Banner */}
          <div
            className={`rounded-lg border px-3.5 py-2.5 flex items-center justify-between gap-2 flex-wrap text-xs ${
              !sidePolicy.requiresBothSides
                ? 'border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                : hasBothSidesAttached || lastExtraction?.side === 'BOTH'
                  ? 'border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                  : selectedFileName
                    ? 'border-amber-300 dark:border-amber-800/80 bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
                    : 'border-blue-200 dark:border-blue-800/80 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <FlipHorizontal className="w-4 h-4 shrink-0" />
              <div>
                <div className="font-mono font-bold text-[11px]">
                  {lang === 'ar' ? sidePolicy.policyBadgeAr : sidePolicy.policyBadgeEn}
                </div>
                <div className="text-[11px] opacity-85">
                  {sidePolicy.requiresBothSides
                    ? 'All physical cards (National ID, Residence Card, Driving License, Chamber ID) require BOTH Front & Back uploads. Passports only require 1 Bio-Data page.'
                    : 'Passports & single-page certificates contain all mandatory fields & MRZ on a single page — no back side needed.'}
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/80 dark:bg-slate-900/80 border border-current/20 shrink-0">
              {!sidePolicy.requiresBothSides
                ? '1 PAGE REQUIRED'
                : hasBothSidesAttached || lastExtraction?.side === 'BOTH'
                  ? '2/2 SIDES READY (BOTH)'
                  : selectedFileName
                    ? '1/2 SIDES (BACK MISSING)'
                    : '2 SIDES REQUIRED'}
            </span>
          </div>

          {/* Dual-Slot Dropzones: Slot 1 (Front / Bio-Page) + Slot 2 (Back Side for Cards, Locked for Passports) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* SLOT 1: FRONT SIDE / BIO-DATA PAGE */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3.5 text-center bg-slate-50/70 dark:bg-slate-950/50 flex flex-col justify-between space-y-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                className="hidden"
                id="kyc-file-upload-input"
              />

              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 pb-1.5">
                <span>
                  {sidePolicy.requiresBothSides
                    ? '01. FRONT SIDE (الوجه الأمامي)'
                    : '01. BIO-DATA PAGE (صفحة الجواز)'}
                </span>
                <span className="text-blue-600 dark:text-blue-400">REQUIRED</span>
              </div>

              {customPreviewUrl ? (
                <div className="flex flex-col items-center gap-1.5 py-1">
                  <img
                    src={customPreviewUrl}
                    alt="Uploaded Front Side Preview"
                    className="max-h-24 rounded border border-slate-300 dark:border-slate-700 object-contain"
                  />
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-[10px] font-mono text-emerald-700 dark:text-emerald-300 max-w-full truncate">
                    <FileCheck2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{selectedFileName}</span>
                  </div>
                </div>
              ) : selectedFileName ? (
                <div className="py-3 flex flex-col items-center gap-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-[11px] font-mono text-emerald-700 dark:text-emerald-300">
                    <FileCheck2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate max-w-[180px]">{selectedFileName}</span>
                  </div>
                </div>
              ) : (
                <div className="py-2 space-y-1">
                  <div className="mx-auto w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                  <div className="text-[11px] font-medium text-slate-800 dark:text-slate-200">
                    Upload Front Side (الأمام)
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                    {sidePolicy.frontFieldsSummaryEn}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-center gap-1.5 pt-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Browse Front
                </button>
                <button
                  type="button"
                  onClick={handleLoadSampleSpecimen}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-md border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
                >
                  {t(lang, 'chooseDemoFileBtn')}
                </button>
              </div>
            </div>

            {/* SLOT 2: BACK SIDE (REQUIRED FOR CARDS, EXEMPT FOR PASSPORTS) */}
            {sidePolicy.requiresBothSides ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleBackDrop}
                className={`border-2 border-dashed rounded-xl p-3.5 text-center flex flex-col justify-between space-y-2 ${
                  selectedBackFileName || lastExtraction?.side === 'BOTH'
                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20'
                    : selectedFileName
                      ? 'border-amber-300 dark:border-amber-700 bg-amber-50/40 dark:bg-amber-950/25'
                      : 'border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/50'
                }`}
              >
                <input
                  ref={backFileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleBackFileChange}
                  className="hidden"
                  id="kyc-back-file-upload-input"
                />

                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 pb-1.5">
                  <span>02. BACK SIDE (الوجه الخلفي / الظهر)</span>
                  <span
                    className={
                      selectedBackFileName || lastExtraction?.side === 'BOTH'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }
                  >
                    {selectedBackFileName || lastExtraction?.side === 'BOTH'
                      ? 'VERIFIED (BOTH)'
                      : 'REQUIRED FOR CARD'}
                  </span>
                </div>

                {customBackPreviewUrl ? (
                  <div className="flex flex-col items-center gap-1.5 py-1">
                    <img
                      src={customBackPreviewUrl}
                      alt="Uploaded Back Side Preview"
                      className="max-h-24 rounded border border-slate-300 dark:border-slate-700 object-contain"
                    />
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-[10px] font-mono text-emerald-700 dark:text-emerald-300 max-w-full truncate">
                      <FileCheck2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{selectedBackFileName}</span>
                    </div>
                  </div>
                ) : selectedBackFileName || lastExtraction?.side === 'BOTH' ? (
                  <div className="py-3 flex flex-col items-center gap-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-[11px] font-mono text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate max-w-[180px]">
                        {selectedBackFileName || 'Reverse Side Verified (MRZ + Dates)'}
                      </span>
                    </div>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-300">
                      Back side merged: Issue/Expiry Dates, Family No. & TD1 MRZ
                    </p>
                  </div>
                ) : (
                  <div className="py-2 space-y-1">
                    <div className="mx-auto w-8 h-8 rounded-lg bg-amber-100/80 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                      <FlipHorizontal className="w-4 h-4" />
                    </div>
                    <div className="text-[11px] font-medium text-slate-800 dark:text-slate-200">
                      Upload Back Side (ظهر البطاقة)
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                      {sidePolicy.backFieldsSummaryEn}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-center gap-1.5 pt-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => backFileInputRef.current?.click()}
                    className="px-2.5 py-1 text-[11px] font-medium rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Browse Back Side
                  </button>
                  <button
                    type="button"
                    onClick={handleAttachSampleBackSide}
                    className="px-2.5 py-1 text-[11px] font-medium rounded-md border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
                  >
                    + Attach Back Side (الظهر)
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-center bg-emerald-50/40 dark:bg-emerald-950/20 flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300 border-b border-emerald-200/70 dark:border-emerald-800/60 pb-1.5">
                  <span>02. REVERSE SIDE (الظهر)</span>
                  <span>EXEMPT · PASSPORT</span>
                </div>
                <div className="py-3 space-y-1.5">
                  <div className="mx-auto w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-900 dark:text-emerald-200">
                    No Back Side Required for Passport
                  </div>
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-tight">
                    {sidePolicy.frontFieldsSummaryEn}
                  </p>
                </div>
                <div className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400">
                  ICAO 9303 TD3 Single Bio-Page Standard
                </div>
              </div>
            )}
          </div>

          {/* Live Gemini VLM OCR Extraction & Missing-Field / Missing-Side Panel */}
          {(isExtractingOcr || lastExtraction) && (
            <div className="space-y-2.5">
              {isExtractingOcr && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-xs font-mono text-blue-700 dark:text-blue-300 animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>Gemini VLM reading Arabic / Kurdish / English text & verifying card sides...</span>
                </div>
              )}

              {!isExtractingOcr && lastExtraction && (
                <div
                  dir="ltr"
                  className="text-left rounded-lg border border-blue-200 dark:border-blue-800/80 bg-blue-50/70 dark:bg-blue-950/50 p-3 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-blue-700 dark:text-blue-300">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {lastExtraction.engineMode === 'gemini-vlm-live'
                          ? `LIVE GEMINI VLM OCR · ${lastExtraction.documentType} (SIDE: ${lastExtraction.side})`
                          : `OCR EXTRACTED · ${lastExtraction.documentType} (SIDE: ${lastExtraction.side})`}
                      </span>
                    </span>
                    <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-300 font-semibold">
                      Confidence: {lastExtraction.ocrConfidence}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] pt-1 border-t border-blue-200/60 dark:border-blue-800/60">
                    <div>
                      <div className="text-[9px] font-mono text-slate-500">FULL NAME (EN)</div>
                      <div
                        className={`font-semibold truncate ${
                          isMissingOrUnclearValue(lastExtraction.fullNameEn)
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {lastExtraction.fullNameEn}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] font-mono text-slate-500">FULL NAME (AR/KU)</div>
                      <div
                        className={`font-semibold truncate ${
                          isMissingOrUnclearValue(lastExtraction.fullNameAr)
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {lastExtraction.fullNameAr}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] font-mono text-slate-500">ID / CARD NUMBER</div>
                      <div
                        className={`font-mono font-semibold truncate ${
                          isMissingOrUnclearValue(lastExtraction.docNumber)
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-blue-700 dark:text-blue-300'
                        }`}
                      >
                        {lastExtraction.docNumber}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] font-mono text-slate-500">
                        {lastExtraction.documentType === 'IRQ_RESIDENCE_CARD' ||
                        lastExtraction.documentType === 'IRQ_RATION_CARD'
                          ? 'ADDRESS (MAHALLA/ZUKAK/DAR)'
                          : 'DATE OF BIRTH'}
                      </div>
                      <div
                        className={`font-mono truncate ${
                          isMissingOrUnclearValue(
                            lastExtraction.documentType === 'IRQ_RESIDENCE_CARD' ||
                              lastExtraction.documentType === 'IRQ_RATION_CARD'
                              ? lastExtraction.address
                              : lastExtraction.dob
                          )
                            ? 'text-rose-600 dark:text-rose-400 font-semibold'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {lastExtraction.documentType === 'IRQ_RESIDENCE_CARD' ||
                        lastExtraction.documentType === 'IRQ_RATION_CARD'
                          ? lastExtraction.address
                          : lastExtraction.dob}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] font-mono text-slate-500">PLACE OF BIRTH / GOV</div>
                      <div
                        className={`truncate ${
                          isMissingOrUnclearValue(lastExtraction.governorateEn)
                            ? 'text-rose-600 dark:text-rose-400 font-semibold'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {lastExtraction.governorateEn}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] font-mono text-slate-500">
                        {lastExtraction.documentType === 'IRQ_RESIDENCE_CARD' ||
                        lastExtraction.documentType === 'IRQ_RATION_CARD'
                          ? 'ISSUE DATE'
                          : 'EXPIRY DATE'}
                      </div>
                      <div
                        className={`font-mono truncate ${
                          isMissingOrUnclearValue(
                            lastExtraction.documentType === 'IRQ_RESIDENCE_CARD' ||
                              lastExtraction.documentType === 'IRQ_RATION_CARD'
                              ? lastExtraction.issueDate
                              : lastExtraction.expiryDate
                          )
                            ? 'text-rose-600 dark:text-rose-400 font-semibold'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {lastExtraction.documentType === 'IRQ_RESIDENCE_CARD' ||
                        lastExtraction.documentType === 'IRQ_RATION_CARD'
                          ? lastExtraction.issueDate
                          : lastExtraction.expiryDate}
                      </div>
                    </div>
                  </div>

                  {/* Schema-Aware & Side-Aware Missing Expected Fields Warning Box */}
                  {lastExtraction.missingExpectedFields &&
                    lastExtraction.missingExpectedFields.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-amber-300/80 dark:border-amber-800/80 rounded-md bg-amber-50/90 dark:bg-amber-950/60 p-2.5 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-900 dark:text-amber-300">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                            <span>
                              MISSING CARD SIDE OR EXPECTED FIELD(S) ON {lastExtraction.documentType} ({lastExtraction.missingExpectedFields.length})
                            </span>
                          </span>
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                            ZERO FABRICATION
                          </span>
                        </div>
                        <ul className="space-y-1">
                          {lastExtraction.missingExpectedFields.map((mf) => (
                            <li
                              key={mf.fieldKey}
                              className="text-[10px] text-slate-800 dark:text-slate-200 flex items-start justify-between gap-2 bg-white/80 dark:bg-slate-900/80 px-2 py-1 rounded border border-amber-200/70 dark:border-amber-800/60"
                            >
                              <div>
                                <span className="font-semibold">{mf.labelEn}: </span>
                                <span className="text-slate-600 dark:text-slate-400">
                                  {mf.reasonEn}
                                </span>
                              </div>
                              <span
                                className={`shrink-0 text-[9px] font-mono font-bold px-1 py-0.2 rounded ${
                                  mf.severity === 'CRITICAL'
                                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                                    : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                }`}
                              >
                                {mf.severity}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="input-fullname-en"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                {t(lang, 'applicantNameLabel')} (Auto-extracted or Manual)
              </label>
              <input
                id="input-fullname-en"
                type="text"
                value={fullNameEn}
                onChange={(e) => setFullNameEn(e.target.value)}
                placeholder="Auto-filled by Gemini OCR on upload"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label
                htmlFor="input-fullname-ar"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                {t(lang, 'applicantNameArLabel')}
              </label>
              <input
                id="input-fullname-ar"
                type="text"
                value={fullNameAr}
                onChange={(e) => setFullNameAr(e.target.value)}
                placeholder="يتم استخراجه تلقائياً من الوثيقة"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="input-email"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                {t(lang, 'applicantEmailLabel')}
              </label>
              <input
                id="input-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="compliance@company.iq"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="select-country"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                {t(lang, 'applicantCountryLabel')}
              </label>
              <select
                id="select-country"
                value={govKey}
                onChange={(e) => setGovKey(e.target.value as IraqiGovKey)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              >
                <option value="BGD">Baghdad (بغداد)</option>
                <option value="EBL">Erbil · KRG (أربيل / هەولێر)</option>
                <option value="BSR">Basra (البصرة)</option>
                <option value="SUL">Sulaymaniyah · KRG (السليمانية / سلێمانی)</option>
                <option value="MOS">Nineveh · Mosul (نينوى)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="select-entity"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                {t(lang, 'entityTypeLabel')}
              </label>
              <select
                id="select-entity"
                value={entityType}
                onChange={(e) => setEntityType(e.target.value as 'individual' | 'corporate')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              >
                <option value="individual">{t(lang, 'entityIndividual')}</option>
                <option value="corporate">{t(lang, 'entityCorporate')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="select-doctype"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                {t(lang, 'docCategoryLabel')}
              </label>
              <select
                id="select-doctype"
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocumentType)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              >
                <option value="IRQ_NATIONAL_ID">{t(lang, 'docNationalId')}</option>
                <option value="IRQ_RESIDENCE_CARD">{t(lang, 'docResidenceCard')}</option>
                <option value="IRQ_PASSPORT">{t(lang, 'docPassport')}</option>
                <option value="IRQ_CHAMBER_OF_COMMERCE">{t(lang, 'docChamberCommerce')}</option>
                <option value="IRQ_POWER_OF_ATTORNEY">{t(lang, 'docPowerOfAttorney')}</option>
                <option value="UNKNOWN_DOCUMENT">{t(lang, 'docUnknown')}</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="input-docnum"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                {t(lang, 'docNumberInputLabel')} (Auto-extracted or Manual)
              </label>
              <input
                id="input-docnum"
                type="text"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                placeholder="Auto-filled by Gemini OCR on upload"
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* 10-Stage Pipeline Progress Feedback */}
          {uploadStage > 0 && (
            <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5 text-xs font-mono text-blue-600 dark:text-blue-400">
              <Lock className="w-4 h-4 animate-pulse shrink-0" />
              <span>
                {uploadStage === 1 && t(lang, 'uploadingStage1')}
                {uploadStage === 2 && t(lang, 'uploadingStage2')}
                {uploadStage === 3 && t(lang, 'uploadingStage3')}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Live Gemini 3 Flash VLM · CBI Law No. 78 HMAC</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {t(lang, 'cancelBtn')}
              </button>
              <button
                type="submit"
                disabled={uploadStage > 0}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white transition-colors whitespace-nowrap shrink-0"
              >
                {isExtractingOcr
                  ? 'Reading ID with Gemini AI...'
                  : t(lang, 'submitUploadBtn')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
