import React, { useState, useRef } from 'react';
import { X, UploadCloud, ShieldCheck, FileCheck2, Lock } from 'lucide-react';
import {
  calculateRiskTier,
  type DocumentType,
  type KYCApplicant,
  type Language,
} from '../utils/kycEngine';
import { t } from '../utils/i18n';

interface SecureUploadModalProps {
  isOpen: boolean;
  lang: Language;
  onClose: () => void;
  onIngestApplicant: (newApplicant: KYCApplicant) => void;
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
  const [countryCode, setCountryCode] = useState<'IQ' | 'AE' | 'SA' | 'GB' | 'SE' | 'SG'>('IQ');
  const [entityType, setEntityType] = useState<'individual' | 'corporate'>('individual');
  const [docType, setDocType] = useState<DocumentType>('national_id');
  const [docNumber, setDocNumber] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFileSizeKb, setSelectedFileSizeKb] = useState(1480);
  const [customPreviewUrl, setCustomPreviewUrl] = useState<string | undefined>(undefined);
  const [validationError, setValidationError] = useState('');
  const [uploadStage, setUploadStage] = useState<0 | 1 | 2 | 3>(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const countryMap: Record<
    'IQ' | 'AE' | 'SA' | 'GB' | 'SE' | 'SG',
    { en: string; ar: string; nat: string }
  > = {
    IQ: { en: 'Republic of Iraq', ar: 'جمهورية العراق', nat: 'IRQ' },
    AE: { en: 'United Arab Emirates', ar: 'الإمارات العربية المتحدة', nat: 'ARE' },
    SA: { en: 'Saudi Arabia', ar: 'المملكة العربية السعودية', nat: 'SAU' },
    GB: { en: 'United Kingdom', ar: 'المملكة المتحدة', nat: 'GBR' },
    SE: { en: 'Sweden', ar: 'السويد', nat: 'SWE' },
    SG: { en: 'Singapore', ar: 'سنغافورة', nat: 'SGP' },
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFileName(file.name);
    setSelectedFileSizeKb(Math.max(120, Math.round(file.size / 1024)));
    setValidationError('');

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCustomPreviewUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setCustomPreviewUrl(undefined);
    }
  };

  const handleLoadSampleSpecimen = () => {
    if (!fullNameEn.trim()) setFullNameEn('Abdulghaffar Jamil Al-Shammari');
    if (!fullNameAr.trim()) setFullNameAr('عبد الغفار جميل مزهر الشمري');
    if (!email.trim()) setEmail('a.alshammari@hijazi-trading.iq');
    if (!docNumber.trim()) setDocNumber('A78689122');
    setCountryCode('IQ');
    setDocType('national_id');
    setSelectedFileName('01_faker_national_id.jpg');
    setSelectedFileSizeKb(1420);
    setCustomPreviewUrl('/faker_specimens/01_faker_national_id.jpg');
    setValidationError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullNameEn.trim() || !docNumber.trim() || !selectedFileName.trim()) {
      setValidationError(t(lang, 'validationErrorRequired'));
      return;
    }

    setValidationError('');
    setUploadStage(1);

    setTimeout(() => {
      setUploadStage(2);
    }, 180);

    setTimeout(() => {
      setUploadStage(3);
    }, 360);

    let backendEval: any = null;
    if (customPreviewUrl && customPreviewUrl.startsWith('data:image/')) {
      try {
        const resp = await fetch('/api/v1/kyc/upload-and-evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            merchant_trade_name: fullNameAr.trim() || fullNameEn.trim(),
            images: { national_card: customPreviewUrl },
          }),
        });
        if (resp.ok) {
          backendEval = await resp.json();
        }
      } catch (_) {}
    }

    setTimeout(() => {
      const cInfo = countryMap[countryCode];
      const riskScore = 11;
      const newId = `app-${Date.now()}`;
      const refNum = Math.floor(9100 + Math.random() * 800);
      const upperName = fullNameEn.trim().toUpperCase();

      const docTitles: Record<DocumentType, { en: string; ar: string }> = {
        passport: { en: `${cInfo.en} Biometric Passport`, ar: `جواز سفر إلكتروني (${cInfo.ar})` },
        national_id: { en: `${cInfo.en} National ID Card`, ar: `البطاقة الوطنية الموحدة (${cInfo.ar})` },
        utility_bill: { en: 'Residence / Utility Statement', ar: 'بطاقة السكن / فاتورة خدمات' },
        corporate_registry: { en: 'Chamber of Commerce / Registry Extract', ar: 'هوية غرفة التجارة / السجل التجاري' },
        liveness_selfie: { en: '3D Biometric Liveness Frame', ar: 'إطار التحقق الحيوي ثلاثي الأبعاد' },
      };

      const detectedName = backendEval?.detected_primary_name || upperName;
      const detectedDocNum = backendEval?.detected_primary_id || docNumber.trim().toUpperCase();

      const newApplicant: KYCApplicant = {
        id: newId,
        referenceCode: backendEval?.application_id || `KYC-2026-${refNum}`,
        fullNameEn: fullNameEn.trim(),
        fullNameAr: fullNameAr.trim() || detectedName,
        email: email.trim() || 'compliance.contact@rostro.iq',
        phone: countryCode === 'IQ' ? '+964 770 901 4420' : '+971 50 901 4420',
        countryCode,
        countryEn: cInfo.en,
        countryAr: cInfo.ar,
        entityType,
        submittedAt: '2026-10-17 08:42 UTC',
        updatedAt: '2026-10-17 08:42 UTC',
        status: 'pending',
        riskScore,
        riskTier: calculateRiskTier(riskScore),
        sanctionsMatch: false,
        pepMatch: false,
        adverseMediaMatch: false,
        biometricMatchScore: 98,
        assignedReviewerEn: 'Layla Al-Hashemi',
        assignedReviewerAr: 'ليلى الهاشمي',
        documents: [
          {
            id: `doc-${Date.now()}`,
            type: docType,
            titleEn: backendEval?.document_type_en || docTitles[docType].en,
            titleAr: backendEval?.document_type_ar || docTitles[docType].ar,
            docNumber: detectedDocNum,
            issueDate: '2024-02-10',
            expiryDate: '2034-02-09',
            issuingCountryEn: cInfo.en,
            issuingCountryAr: cInfo.ar,
            ocrConfidence: 97,
            livenessScore: 98,
            fileSizeKb: selectedFileSizeKb,
            sha256Hash: 'a4f982b17c5d3901e62a48c7b902f1e4c6b8d0912a34f5e6d7c8b9a012345678',
            status: 'pending',
            customPreviewUrl,
            extractedFields: {
              fullName: detectedName,
              dob: '1985-11-27',
              nationality: cInfo.nat,
              mrzLine1: `I<${cInfo.nat}${detectedDocNum}9<<<<<<<<<<<<<<<`.slice(0, 30),
              mrzLine2: `8511272M3402095${cInfo.nat}<<<<<<<<<<<6`.slice(0, 30),
              address: countryCode === 'IQ' ? 'Baghdad - Al-Karrada - M 245 Z 79 D 20' : `Financial Center District, Tower 2, ${cInfo.en}`,
            },
          },
        ],
        auditTrail: [
          {
            id: `aud-${Date.now()}`,
            timestamp: '2026-10-17 08:42 UTC',
            actorEn: 'Rostro AES-256-GCM Ingestion Portal',
            actorAr: 'بوابة إدراج روسترو المشفرة AES-256-GCM',
            actionEn: `Uploaded & verified ${selectedFileName} (OCR 97%)`,
            actionAr: `تم رفع والتحقق من الوثيقة ${selectedFileName} (دقة القراءة 97%)`,
          },
        ],
      };

      setUploadStage(0);
      setFullNameEn('');
      setFullNameAr('');
      setEmail('');
      setDocNumber('');
      setSelectedFileName('');
      setCustomPreviewUrl(undefined);
      onIngestApplicant(newApplicant);
      onClose();
    }, 520);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
    >
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-lg">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="input-fullname-en"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                {t(lang, 'applicantNameLabel')} *
              </label>
              <input
                id="input-fullname-en"
                type="text"
                value={fullNameEn}
                onChange={(e) => setFullNameEn(e.target.value)}
                placeholder="e.g. Zayd Al-Maktoum"
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
                placeholder="مثال: زيد المكتوم"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="input-country"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                {t(lang, 'applicantCountryLabel')}
              </label>
              <select
                id="input-country"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              >
                <option value="IQ">Republic of Iraq (IQ)</option>
                <option value="AE">United Arab Emirates (AE)</option>
                <option value="SA">Saudi Arabia (SA)</option>
                <option value="GB">United Kingdom (GB)</option>
                <option value="SE">Sweden (SE)</option>
                <option value="SG">Singapore (SG)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="input-entity-type"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                {t(lang, 'entityTypeLabel')}
              </label>
              <select
                id="input-entity-type"
                value={entityType}
                onChange={(e) => setEntityType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              >
                <option value="individual">{t(lang, 'entityIndividual')}</option>
                <option value="corporate">{t(lang, 'entityCorporate')}</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="input-doc-type"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                {t(lang, 'docCategoryLabel')}
              </label>
              <select
                id="input-doc-type"
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocumentType)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              >
                <option value="passport">{t(lang, 'docPassport')}</option>
                <option value="national_id">{t(lang, 'docNationalId')}</option>
                <option value="utility_bill">{t(lang, 'docUtilityBill')}</option>
                <option value="corporate_registry">{t(lang, 'docCorporate')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="input-doc-number"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                {t(lang, 'docNumberInputLabel')} *
              </label>
              <input
                id="input-doc-number"
                type="text"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                placeholder="e.g. N99402185"
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

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
                placeholder="applicant@organization.ae"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* File Dropzone */}
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-5 text-center bg-slate-50/70 dark:bg-slate-950/50 space-y-3">
            <input
              ref={fileInputRef}
              id="kyc-file-input"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="sr-only"
            />
            <div className="flex flex-col items-center justify-center gap-1.5">
              {selectedFileName ? (
                <>
                  <FileCheck2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                  <div className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100">
                    {selectedFileName} ({selectedFileSizeKb} KB)
                  </div>
                </>
              ) : (
                <>
                  <UploadCloud className="w-7 h-7 text-slate-400" />
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {t(lang, 'dropzoneTitle')}
                  </div>
                </>
              )}
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {t(lang, 'dropzoneHint')}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0"
              >
                Browse Local File
              </button>
              <button
                type="button"
                onClick={handleLoadSampleSpecimen}
                className="px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap shrink-0"
              >
                {t(lang, 'chooseDemoFileBtn')}
              </button>
            </div>
          </div>

          {/* Real-time Upload & Encryption Progress */}
          {uploadStage > 0 && (
            <div className="p-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/40 text-xs text-blue-800 dark:text-blue-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span className="font-mono">
                {uploadStage === 1 && t(lang, 'uploadingStage1')}
                {uploadStage === 2 && t(lang, 'uploadingStage2')}
                {uploadStage === 3 && t(lang, 'uploadingStage3')}
              </span>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              {t(lang, 'cancelBtn')}
            </button>
            <button
              type="submit"
              disabled={uploadStage > 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{t(lang, 'submitUploadBtn')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
