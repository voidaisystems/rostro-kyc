import React, { useState } from 'react';
import {
  Camera,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Upload,
  Code2,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Lock,
  Users,
  Fingerprint,
} from 'lucide-react';
import { LiveCameraScannerModal } from './LiveCameraScannerModal';
import {
  verifyDocumentHeadlessApi,
  type ExtractedIdPayload,
  type HeadlessVerifyResponse,
} from '../utils/rostroHeadlessSdk';
import {
  analyzeDocumentAntiSpoofing,
  verifyIraqiAccountPacket,
  type AntiSpoofSimulationPreset,
  type KYCDocument,
  type Language,
} from '../utils/kycEngine';
import { initialApplicants } from '../utils/seedData';

interface PartnerAppSdkSimulatorProps {
  lang: Language;
  onAddVerifiedDossier?: (payload: ExtractedIdPayload, frontImg?: string, backImg?: string) => void;
}

type PartnerAppTheme = 'ZAINCASH_IQ' | 'SUPERQI_BANK' | 'BALY_SUPERAPP';

export const PartnerAppSdkSimulator: React.FC<PartnerAppSdkSimulatorProps> = ({
  lang,
  onAddVerifiedDossier,
}) => {
  const isAr = lang === 'ar';

  const [partnerApp, setPartnerApp] = useState<PartnerAppTheme>('ZAINCASH_IQ');
  const [activeCameraSlot, setActiveCameraSlot] = useState<
    'NATIONAL_ID_FRONT' | 'NATIONAL_ID_BACK' | 'RESIDENCE_CARD' | null
  >(null);

  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [residenceImage, setResidenceImage] = useState<string | null>(null);

  const [isVerifying, setIsVerifying] = useState(false);
  const [headlessResult, setHeadlessResult] = useState<HeadlessVerifyResponse | null>(null);
  const [residenceResult, setResidenceResult] = useState<HeadlessVerifyResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-filled host app form fields (populated automatically by our headless backend)
  const [formFirstName, setFormFirstName] = useState('');
  const [formFatherName, setFormFatherName] = useState('');
  const [formGrandfatherName, setFormGrandfatherName] = useState('');
  const [formSurname, setFormSurname] = useState('');
  const [formFullNameEn, setFormFullNameEn] = useState('');
  const [formMotherName, setFormMotherName] = useState('');
  const [formNationalId, setFormNationalId] = useState('');
  const [formCardSerial, setFormCardSerial] = useState('');
  const [formBirthYear, setFormBirthYear] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [activePacketMode, setActivePacketMode] = useState<
    'FATHER_LINEAGE' | 'SELF_HOLDER' | 'UNLINKED_MISMATCH'
  >('FATHER_LINEAGE');
  const [activeSpoofPreset, setActiveSpoofPreset] =
    useState<AntiSpoofSimulationPreset>('AUTHENTIC_PHYSICAL');

  const applyInstantPacketScenario = (
    packetMode: 'FATHER_LINEAGE' | 'SELF_HOLDER' | 'UNLINKED_MISMATCH',
    spoofPreset: AntiSpoofSimulationPreset = 'AUTHENTIC_PHYSICAL'
  ) => {
    setActivePacketMode(packetMode);
    setActiveSpoofPreset(spoofPreset);
    setFormFirstName('عبدالله · Abdullah');
    setFormFatherName('طارق · Tariq');
    setFormGrandfatherName('كريم · Kareem');
    setFormSurname('الدليمي · Al-Dulaimi');
    setFormFullNameEn('ABDULLAH TARIQ KAREEM AL-DULAIMI');
    setFormMotherName('فاطمة حسن · Fatima Hassan');
    setFormNationalId('198749201841');
    setFormCardSerial('AA9792984 · 184920-BGD-04');
    setFormBirthYear('1987-09-18');
    setFormAddress(
      packetMode === 'UNLINKED_MISMATCH'
        ? 'Mahalla 102, Zukak 5, Dar 8, Basra (Mismatched Household)'
        : 'Mahalla 609, Zukak 14, Dar 22, Al-Mansour, Baghdad'
    );
  };

  const runHeadlessVerification = async (
    nextFront: string | null,
    nextBack: string | null,
    docType: 'IRQ_NATIONAL_ID' | 'IRQ_RESIDENCE_CARD' = 'IRQ_NATIONAL_ID'
  ) => {
    const primaryImg = nextFront || nextBack;
    if (!primaryImg) return;

    setIsVerifying(true);
    setErrorMsg(null);
    try {
      const response = await verifyDocumentHeadlessApi({
        partnerAppId: partnerApp,
        documentType: docType,
        frontImageBase64: primaryImg,
        backImageBase64: nextFront && nextBack ? nextBack : undefined,
        fileName: `${partnerApp.toLowerCase()}_camera_scan.png`,
      });

      if (docType === 'IRQ_RESIDENCE_CARD') {
        setResidenceResult(response);
        if (
          response.extractedData.address &&
          !response.extractedData.address.includes('MISSING')
        ) {
          setFormAddress(response.extractedData.address);
        }
      } else {
        setHeadlessResult(response);
        const d = response.extractedData;
        if (d.firstNameAr && !d.firstNameAr.includes('MISSING')) setFormFirstName(d.firstNameAr);
        if (d.fatherNameAr && !d.fatherNameAr.includes('MISSING')) setFormFatherName(d.fatherNameAr);
        if (d.grandfatherNameAr && !d.grandfatherNameAr.includes('MISSING'))
          setFormGrandfatherName(d.grandfatherNameAr);
        if (d.surnameAr && !d.surnameAr.includes('MISSING')) setFormSurname(d.surnameAr);
        if (d.fullNameEn && !d.fullNameEn.includes('MISSING')) setFormFullNameEn(d.fullNameEn);
        if (d.motherName && !d.motherName.includes('MISSING')) setFormMotherName(d.motherName);
        if (d.nationalIdNumber && !d.nationalIdNumber.includes('MISSING'))
          setFormNationalId(d.nationalIdNumber);
        if (d.familyCardSerial && !d.familyCardSerial.includes('MISSING'))
          setFormCardSerial(d.familyCardSerial);
        if (d.birthYearOrDob && !d.birthYearOrDob.includes('MISSING'))
          setFormBirthYear(d.birthYearOrDob);
        if (d.address && !d.address.includes('MISSING') && !formAddress)
          setFormAddress(d.address);
      }

      if (onAddVerifiedDossier && response.rawPayload) {
        onAddVerifiedDossier(
          response.rawPayload,
          nextFront || undefined,
          nextBack || undefined
        );
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCapturedPhoto = async (
    frontDataUrl: string,
    _frontName: string,
    capturedBackDataUrl?: string
  ) => {
    const slot = activeCameraSlot;
    setActiveCameraSlot(null);

    if (slot === 'NATIONAL_ID_FRONT') {
      setFrontImage(frontDataUrl);
      if (capturedBackDataUrl) {
        setBackImage(capturedBackDataUrl);
      }
      await runHeadlessVerification(
        frontDataUrl,
        capturedBackDataUrl || backImage,
        'IRQ_NATIONAL_ID'
      );
    } else if (slot === 'NATIONAL_ID_BACK') {
      setBackImage(frontDataUrl);
      await runHeadlessVerification(frontImage || frontDataUrl, frontDataUrl, 'IRQ_NATIONAL_ID');
    } else if (slot === 'RESIDENCE_CARD') {
      setResidenceImage(frontDataUrl);
      await runHeadlessVerification(frontDataUrl, null, 'IRQ_RESIDENCE_CARD');
    }
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    slot: 'NATIONAL_ID_FRONT' | 'NATIONAL_ID_BACK' | 'RESIDENCE_CARD'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === 'string') {
        const dataUrl = reader.result;
        if (slot === 'NATIONAL_ID_FRONT') {
          setFrontImage(dataUrl);
          await runHeadlessVerification(dataUrl, backImage, 'IRQ_NATIONAL_ID');
        } else if (slot === 'NATIONAL_ID_BACK') {
          setBackImage(dataUrl);
          await runHeadlessVerification(frontImage || dataUrl, dataUrl, 'IRQ_NATIONAL_ID');
        } else if (slot === 'RESIDENCE_CARD') {
          setResidenceImage(dataUrl);
          await runHeadlessVerification(dataUrl, null, 'IRQ_RESIDENCE_CARD');
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const brandMeta = {
    ZAINCASH_IQ: {
      nameEn: 'ZainCash Iraq Wallet',
      nameAr: 'محفظة زين كاش العراق',
      subtitleEn: 'New Citizen Wallet Registration (Their Native App UI)',
      subtitleAr: 'فتح حساب محفظة جديد (واجهة تطبيق زين كاش الخاصة بهم)',
      accentBg: 'bg-purple-600',
      accentText: 'text-purple-400',
      accentBorder: 'border-purple-500/40',
    },
    SUPERQI_BANK: {
      nameEn: 'SuperQi Digital Bank',
      nameAr: 'تطبيق سوبر كي المصرفي',
      subtitleEn: 'Instant Sovereign Account Opening (Their Native App UI)',
      subtitleAr: 'فتح حساب مصرفي فوري (واجهة تطبيق سوبر كي الخاصة بهم)',
      accentBg: 'bg-amber-500',
      accentText: 'text-amber-400',
      accentBorder: 'border-amber-500/40',
    },
    BALY_SUPERAPP: {
      nameEn: 'Baly Iraq Super-App',
      nameAr: 'تطبيق بالي العراق',
      subtitleEn: 'Captain / Customer Identity Verification (Their Native App UI)',
      subtitleAr: 'توثيق هوية الكابتن أو المستخدم (واجهة تطبيق بالي الخاصة بهم)',
      accentBg: 'bg-blue-600',
      accentText: 'text-blue-400',
      accentBorder: 'border-blue-500/40',
    },
  }[partnerApp];

  return (
    <div className="space-y-6">
      {/* Top Explanation Banner */}
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/15 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400">
            <Smartphone className="w-4 h-4" />
            <span>
              {isAr
                ? 'وضع النظام الخفي داخل تطبيقات الهواتف (Headless Camera SDK + Backend API)'
                : 'Headless In-App Integration Mode (@rostro/camera-gate-sdk + POST /api/v1/verify-document)'}
            </span>
          </div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {isAr
              ? 'جرب كيف يعمل نظامنا خفياً داخل تطبيق زين كاش أو سوبر كي أو بالي باستخدام كاميرا اللابتوب'
              : 'Try How Our System Activates Inside ZainCash, SuperQi, or Baly Using Your Laptop Camera'}
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
            {isAr
              ? 'المستخدم يبقى داخل واجهة تطبيق زين كاش أو بالي بالكامل. بمجرد ضغطه على (فتح الكاميرا لمسح البطاقة الوطنية أو بطاقة السكن)، يتفعل محركنا الخفي لفحص جودة الصورة، يقرأ الاسم الرباعي والرقم الوطني ورقم البطاقة السفلي (AA9792984)، ويملأ حقول التسجيل تلقائياً.'
              : 'The user stays 100% inside ZainCash or Baly’s own UI/UX. The moment they tap "Open Camera" to scan their National ID or Residence Card, our headless camera gate activates on the camera stream, verifies the card via our backend API, and auto-fills their registration form.'}
          </p>
        </div>

        {/* Partner Host App Selector */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {(
            [
              { id: 'ZAINCASH_IQ', labelEn: 'ZainCash App UI', labelAr: 'تطبيق زين كاش' },
              { id: 'SUPERQI_BANK', labelEn: 'SuperQi App UI', labelAr: 'تطبيق سوبر كي' },
              { id: 'BALY_SUPERAPP', labelEn: 'Baly App UI', labelAr: 'تطبيق بالي' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPartnerApp(item.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                partnerApp === item.id
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                  : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {isAr ? item.labelAr : item.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split View: Left = Partner's Own Mobile App UI | Right = Headless Backend JSON & Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (7 cols): THEIR APP UI (ZainCash / SuperQi / Baly Registration Screen) */}
        <div className="lg:col-span-7 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0d0d10] shadow-xl overflow-hidden">
          {/* Simulated Phone Top Bar of the Partner App */}
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl ${brandMeta.accentBg} text-white flex items-center justify-center font-bold text-sm shadow-sm`}
              >
                {partnerApp === 'ZAINCASH_IQ' ? 'Z' : partnerApp === 'SUPERQI_BANK' ? 'Qi' : 'B'}
              </div>
              <div>
                <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {isAr ? brandMeta.nameAr : brandMeta.nameEn}
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {isAr ? brandMeta.subtitleAr : brandMeta.subtitleEn}
                </div>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-semibold">
              {isAr ? 'كاميرا Rostro الخفية متصلة' : 'Rostro Headless SDK Active'}
            </span>
          </div>

          <div className="p-5 space-y-5">
            {/* Step 1 in Partner App: Scan National ID & Residence Card */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {isAr
                  ? '١. امسح الوثائق بكاميرا الجهاز (أو ارفع صورة للتجربة)'
                  : '1. Scan Documents with Device Camera (or Upload Photo)'}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Card 1: National ID Front */}
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-50/60 dark:bg-zinc-900/40 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {isAr ? 'البطاقة الوطنية (الأمام)' : 'National ID (Front)'}
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      {isAr ? 'الاسم الرباعي + الرقم الوطني' : 'Quad Name + 12-Digit ID'}
                    </div>
                  </div>

                  {frontImage && (
                    <img
                      src={frontImage}
                      alt="Front ID"
                      className="w-full h-24 object-cover rounded-lg border border-emerald-500/40"
                    />
                  )}

                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveCameraSlot('NATIONAL_ID_FRONT')}
                      className="w-full py-2 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{isAr ? 'افتح الكاميرا للمسح' : 'Open Camera'}</span>
                    </button>

                    <label className="w-full py-1.5 px-2.5 rounded-lg bg-zinc-200/70 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium flex items-center justify-center gap-1.5 cursor-pointer">
                      <Upload className="w-3 h-3" />
                      <span>{isAr ? 'أو اختر ملف صورة' : 'Or Pick File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'NATIONAL_ID_FRONT')}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Card 2: National ID Back */}
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-50/60 dark:bg-zinc-900/40 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {isAr ? 'البطاقة الوطنية (الظهر)' : 'National ID (Back)'}
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      {isAr ? 'شريط القراءة الآلي MRZ' : '3-Line TD1 MRZ Check'}
                    </div>
                  </div>

                  {backImage && (
                    <img
                      src={backImage}
                      alt="Back ID"
                      className="w-full h-24 object-cover rounded-lg border border-emerald-500/40"
                    />
                  )}

                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveCameraSlot('NATIONAL_ID_BACK')}
                      className="w-full py-2 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{isAr ? 'افتح الكاميرا للمسح' : 'Open Camera'}</span>
                    </button>

                    <label className="w-full py-1.5 px-2.5 rounded-lg bg-zinc-200/70 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium flex items-center justify-center gap-1.5 cursor-pointer">
                      <Upload className="w-3 h-3" />
                      <span>{isAr ? 'أو اختر ملف صورة' : 'Or Pick File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'NATIONAL_ID_BACK')}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Card 3: Residence Card */}
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-50/60 dark:bg-zinc-900/40 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {isAr ? 'بطاقة السكن العراقية' : 'Residence Card'}
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      {isAr ? 'المحلة / الزقاق / الدار' : 'Mahalla / Zukak / Dar'}
                    </div>
                  </div>

                  {residenceImage && (
                    <img
                      src={residenceImage}
                      alt="Residence Card"
                      className="w-full h-24 object-cover rounded-lg border border-emerald-500/40"
                    />
                  )}

                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveCameraSlot('RESIDENCE_CARD')}
                      className="w-full py-2 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{isAr ? 'افتح الكاميرا للمسح' : 'Open Camera'}</span>
                    </button>

                    <label className="w-full py-1.5 px-2.5 rounded-lg bg-zinc-200/70 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium flex items-center justify-center gap-1.5 cursor-pointer">
                      <Upload className="w-3 h-3" />
                      <span>{isAr ? 'أو اختر ملف صورة' : 'Or Pick File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'RESIDENCE_CARD')}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Processing Indicator */}
            {isVerifying && (
              <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center gap-3 text-xs text-blue-600 dark:text-blue-300">
                <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                <span>
                  {isAr
                    ? 'محرك Rostro الخلفي يقوم الآن باستخراج الاسم الرباعي والرقم الوطني وفحص التزوير...'
                    : 'Rostro Headless Backend is extracting 4-part Iraqi name, ID number & running forensic checks...'}
                </span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Step 2 in Partner App: Auto-Filled Registration Form */}
            <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  {isAr
                    ? '٢. حقول فتح الحساب في تطبيقهم (تُملأ تلقائياً من نظامنا)'
                    : '2. Partner App Registration Form (Auto-Filled by Rostro API)'}
                </span>
                {headlessResult && (
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                      headlessResult.decision === 'AUTO_APPROVED'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{headlessResult.decision}</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div>
                  <label className="block text-[11px] text-zinc-500 mb-1">
                    {isAr ? 'الاسم الأول (الاسم)' : 'First Name (AR)'}
                  </label>
                  <input
                    type="text"
                    value={formFirstName}
                    onChange={(e) => setFormFirstName(e.target.value)}
                    placeholder={isAr ? 'يُملأ تلقائياً...' : 'Auto-filled...'}
                    className="w-full px-2.5 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-500 mb-1">
                    {isAr ? 'اسم الأب' : "Father's Name"}
                  </label>
                  <input
                    type="text"
                    value={formFatherName}
                    onChange={(e) => setFormFatherName(e.target.value)}
                    placeholder={isAr ? 'يُملأ تلقائياً...' : 'Auto-filled...'}
                    className="w-full px-2.5 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-500 mb-1">
                    {isAr ? 'اسم الجد' : 'Grandfather'}
                  </label>
                  <input
                    type="text"
                    value={formGrandfatherName}
                    onChange={(e) => setFormGrandfatherName(e.target.value)}
                    placeholder={isAr ? 'يُملأ تلقائياً...' : 'Auto-filled...'}
                    className="w-full px-2.5 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-500 mb-1">
                    {isAr ? 'اللقب / العشيرة' : 'Surname / Clan'}
                  </label>
                  <input
                    type="text"
                    value={formSurname}
                    onChange={(e) => setFormSurname(e.target.value)}
                    placeholder={isAr ? 'يُملأ تلقائياً...' : 'Auto-filled...'}
                    className="w-full px-2.5 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div>
                  <label className="block text-[11px] text-zinc-500 mb-1">
                    {isAr ? 'الاسم الكامل (بالحروف اللاتينية)' : 'Full Name (Latin Transliterated)'}
                  </label>
                  <input
                    type="text"
                    value={formFullNameEn}
                    onChange={(e) => setFormFullNameEn(e.target.value)}
                    placeholder="Auto-transliterated..."
                    className="w-full px-2.5 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-500 mb-1">
                    {isAr ? 'الرقم الوطني (12 رقماً)' : '12-Digit National ID'}
                  </label>
                  <input
                    type="text"
                    value={formNationalId}
                    onChange={(e) => setFormNationalId(e.target.value)}
                    placeholder="196169656419"
                    className="w-full px-2.5 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono font-bold text-emerald-600 dark:text-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-500 mb-1">
                    {isAr ? 'رقم البطاقة السفلي (أسفل اليسار)' : 'Bottom-Left Card Serial'}
                  </label>
                  <input
                    type="text"
                    value={formCardSerial}
                    onChange={(e) => setFormCardSerial(e.target.value)}
                    placeholder="AA9792984"
                    className="w-full px-2.5 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono font-bold text-amber-600 dark:text-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div>
                  <label className="block text-[11px] text-zinc-500 mb-1">
                    {isAr ? 'اسم الأم والجد' : 'Mother & Grandfather'}
                  </label>
                  <input
                    type="text"
                    value={formMotherName}
                    onChange={(e) => setFormMotherName(e.target.value)}
                    placeholder={isAr ? 'يُملأ تلقائياً...' : 'Auto-filled...'}
                    className="w-full px-2.5 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-500 mb-1">
                    {isAr ? 'سنة التولد (مستنتجة من الرقم الوطني)' : 'Birth Year / DOB'}
                  </label>
                  <input
                    type="text"
                    value={formBirthYear}
                    onChange={(e) => setFormBirthYear(e.target.value)}
                    placeholder="1961"
                    className="w-full px-2.5 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-500 mb-1">
                    {isAr ? 'عنوان السكن (محلة / زقاق / دار)' : 'Residence Address'}
                  </label>
                  <input
                    type="text"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    placeholder={isAr ? 'من بطاقة السكن...' : 'From Residence Card...'}
                    className="w-full px-2.5 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (5 cols): IRAQI ACCOUNT PACKET LINEAGE + DEEP ANTI-SPOOFING + HEADLESS JSON */}
        <div className="lg:col-span-5 space-y-4">
          {(() => {
            const baseNatDoc: KYCDocument = {
              ...initialApplicants[0].documents[0],
              docNumber: formNationalId || '198749201841',
              antiSpoofPreset: activeSpoofPreset,
              extractedFields: {
                ...initialApplicants[0].documents[0].extractedFields,
                fullName: formFullNameEn || 'ABDULLAH TARIQ KAREEM AL-DULAIMI',
                fullNameArabic: 'عبدالله طارق كريم الدليمي',
                firstName: formFirstName.split('·')[0]?.trim() || 'عبدالله',
                fatherName: formFatherName.split('·')[0]?.trim() || 'طارق',
                grandfatherName: formGrandfatherName.split('·')[0]?.trim() || 'كريم',
                surname: formSurname.split('·')[0]?.trim() || 'الدليمي',
                dob: formBirthYear || '1987-09-18',
              },
            };

            const resDoc: KYCDocument =
              activePacketMode === 'FATHER_LINEAGE'
                ? {
                    ...initialApplicants[0].documents[1],
                    docNumber: 'RES-BGD-771042',
                    extractedFields: {
                      ...initialApplicants[0].documents[1].extractedFields,
                      fullName: 'TARIQ KAREEM QASIM AL-DULAIMI',
                      fullNameArabic: 'طارق كريم قاسم الدليمي',
                      firstName: formFatherName.split('·')[0]?.trim() || 'طارق',
                      fatherName: formGrandfatherName.split('·')[0]?.trim() || 'كريم',
                      grandfatherName: 'قاسم',
                      surname: formSurname.split('·')[0]?.trim() || 'الدليمي',
                      address: formAddress || 'Mahalla 609, Zukak 14, Dar 22, Al-Mansour, Baghdad',
                    },
                  }
                : activePacketMode === 'UNLINKED_MISMATCH'
                  ? {
                      ...initialApplicants[0].documents[1],
                      docNumber: 'RES-BSR-00918',
                      extractedFields: {
                        ...initialApplicants[0].documents[1].extractedFields,
                        fullName: 'MUSTAFA HASSAN JABBAR AL-MALIKI',
                        fullNameArabic: 'مصطفى حسن جبار المالكي',
                        firstName: 'مصطفى',
                        fatherName: 'حسن',
                        grandfatherName: 'جبار',
                        surname: 'المالكي',
                        address: 'Mahalla 102, Zukak 5, Dar 8, Basra',
                      },
                    }
                  : {
                      ...initialApplicants[0].documents[1],
                      extractedFields: {
                        ...initialApplicants[0].documents[1].extractedFields,
                        fullName: formFullNameEn || 'ABDULLAH TARIQ KAREEM AL-DULAIMI',
                        fullNameArabic: 'عبدالله طارق كريم الدليمي',
                        address:
                          formAddress || 'Mahalla 609, Zukak 14, Dar 22, Al-Mansour, Baghdad',
                      },
                    };

            const packetReport = verifyIraqiAccountPacket(baseNatDoc, resDoc);
            const spoofReport = analyzeDocumentAntiSpoofing(baseNatDoc, activeSpoofPreset);

            return (
              <>
                {/* 1. Multi-Document Iraqi Account Packet Card (National ID + Residence Card) */}
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0d0d10] p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      <Users className="w-4 h-4 text-emerald-500" />
                      <span>
                        {isAr
                          ? 'حقيبة الحساب العراقي (البطاقة الوطنية + بطاقة السكن)'
                          : 'Full Iraqi Account Packet (ID + Residence Lineage)'}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-semibold tabular-nums text-emerald-500">
                      {packetReport.lineageConfidence}%
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => applyInstantPacketScenario('FATHER_LINEAGE', activeSpoofPreset)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border cursor-pointer whitespace-nowrap ${
                        activePacketMode === 'FATHER_LINEAGE'
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800'
                      }`}
                    >
                      {isAr ? 'سكن باسم الأب (رب الأسرة)' : "Father's Residence Card"}
                    </button>
                    <button
                      type="button"
                      onClick={() => applyInstantPacketScenario('SELF_HOLDER', activeSpoofPreset)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border cursor-pointer whitespace-nowrap ${
                        activePacketMode === 'SELF_HOLDER'
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800'
                      }`}
                    >
                      {isAr ? 'سكن باسم مقدم الطلب' : "Applicant's Own Residence"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        applyInstantPacketScenario('UNLINKED_MISMATCH', activeSpoofPreset)
                      }
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border cursor-pointer whitespace-nowrap ${
                        activePacketMode === 'UNLINKED_MISMATCH'
                          ? 'bg-red-600 text-white border-red-500'
                          : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800'
                      }`}
                    >
                      {isAr ? 'تضارب نسب السكن (رفض)' : 'Unrelated Household (Fraud)'}
                    </button>
                  </div>

                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {isAr ? packetReport.summaryAr : packetReport.summaryEn}
                  </p>
                </div>

                {/* 2. Deep Anti-Spoofing 5-Vector Card */}
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0d0d10] p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      <Fingerprint className="w-4 h-4 text-emerald-500" />
                      <span>
                        {isAr
                          ? 'كشف التزوير وتصوير الشاشات (Deep Anti-Spoofing)'
                          : 'Deep Anti-Spoofing & Screen-Replay Gate'}
                      </span>
                    </div>
                    <span
                      className={`font-mono text-xs font-bold tabular-nums ${
                        spoofReport.overallVerdict === 'SPOOF_OR_FORGERY_REJECTED'
                          ? 'text-red-500'
                          : 'text-emerald-500'
                      }`}
                    >
                      {spoofReport.authenticityScore}/100
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {(
                      [
                        {
                          id: 'AUTHENTIC_PHYSICAL',
                          en: 'Physical Card',
                          ar: 'بطاقة أصلية',
                        },
                        {
                          id: 'SCREEN_REPLAY_MOIRE',
                          en: 'Screen Moiré',
                          ar: 'تصوير شاشة',
                        },
                        {
                          id: 'PAPER_PHOTOCOPY',
                          en: 'Paper Copy',
                          ar: 'نسخة ورقية',
                        },
                        {
                          id: 'DIGITAL_FONT_AND_PHOTO_TAMPER',
                          en: 'Font/Photo Tamper',
                          ar: 'تلاعب رقمي',
                        },
                      ] as const
                    ).map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => applyInstantPacketScenario(activePacketMode, b.id)}
                        className={`px-2 py-1 rounded-lg text-[11px] font-semibold border cursor-pointer whitespace-nowrap ${
                          activeSpoofPreset === b.id
                            ? b.id === 'AUTHENTIC_PHYSICAL'
                              ? 'bg-emerald-600 text-white border-emerald-500'
                              : 'bg-red-600 text-white border-red-500'
                            : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800'
                        }`}
                      >
                        {isAr ? b.ar : b.en}
                      </button>
                    ))}
                  </div>

                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {isAr ? spoofReport.summaryAr : spoofReport.summaryEn}
                  </p>
                </div>
              </>
            );
          })()}

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0d0d10] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                <Code2 className="w-4 h-4 text-emerald-500" />
                <span>
                  {isAr
                    ? 'استجابة خادم Rostro الخفي (POST /api/v1/verify-document)'
                    : 'Live Headless Backend Response (POST /api/v1/verify-document)'}
                </span>
              </div>
              {headlessResult && (
                <span className="font-mono text-[10px] text-emerald-400">
                  {headlessResult.processingTimeMs} ms
                </span>
              )}
            </div>

            <pre className="p-3 rounded-xl bg-zinc-950 text-emerald-300 font-mono text-[11px] overflow-x-auto max-h-80 leading-relaxed border border-zinc-800">
              {headlessResult
                ? JSON.stringify(
                    {
                      sdkVersion: headlessResult.sdkVersion,
                      partnerAppId: headlessResult.partnerAppId,
                      decision: headlessResult.decision,
                      riskScore: headlessResult.riskScore,
                      extractedData: headlessResult.extractedData,
                      forensics: headlessResult.forensics,
                      cbiLaw78Receipt: headlessResult.cbiLaw78Receipt,
                    },
                    null,
                    2
                  )
                : residenceResult
                  ? JSON.stringify(
                      {
                        sdkVersion: residenceResult.sdkVersion,
                        partnerAppId: residenceResult.partnerAppId,
                        decision: residenceResult.decision,
                        extractedData: residenceResult.extractedData,
                        cbiLaw78Receipt: residenceResult.cbiLaw78Receipt,
                      },
                      null,
                      2
                    )
                  : `// Waiting for camera scan inside ${brandMeta.nameEn}...
// Tap "Open Camera" on the left and snap your document!
{
  "endpoint": "POST /api/v1/verify-document",
  "cameraHook": "RostroCameraGate.evaluateFrame(rgba, w, h)",
  "packetMode": "${activePacketMode}",
  "antiSpoofGate": "${activeSpoofPreset}",
  "status": "READY_FOR_CAMERA_CAPTURE"
}`}
            </pre>
          </div>
        </div>
      </div>

      {/* Live Camera Modal */}
      <LiveCameraScannerModal
        isOpen={activeCameraSlot !== null}
        lang={lang}
        requiresBackSide={activeCameraSlot === 'NATIONAL_ID_FRONT'}
        initialStep={activeCameraSlot === 'NATIONAL_ID_BACK' ? 'BACK' : 'FRONT'}
        expectedDocLabelEn={
          activeCameraSlot === 'RESIDENCE_CARD'
            ? 'Iraqi Residence Card'
            : 'Iraqi Unified National ID'
        }
        expectedDocLabelAr={
          activeCameraSlot === 'RESIDENCE_CARD'
            ? 'بطاقة السكن العراقية'
            : 'البطاقة الوطنية الموحدة'
        }
        slotLabelEn={
          activeCameraSlot === 'NATIONAL_ID_FRONT'
            ? 'Iraqi National ID (Front + Back Auto-Flow)'
            : activeCameraSlot === 'NATIONAL_ID_BACK'
              ? 'Iraqi National ID (Back Side)'
              : 'Iraqi Residence Card'
        }
        slotLabelAr={
          activeCameraSlot === 'NATIONAL_ID_FRONT'
            ? 'البطاقة الوطنية الموحدة (مسح الأمام ثم الظهر تلقائياً)'
            : activeCameraSlot === 'NATIONAL_ID_BACK'
              ? 'البطاقة الوطنية الموحدة (الوجه الخلفي)'
              : 'بطاقة السكن العراقية'
        }
        onClose={() => setActiveCameraSlot(null)}
        onCaptureDataUrl={(frontUrl, frontName, backUrl) =>
          void handleCapturedPhoto(frontUrl, frontName, backUrl)
        }
      />
    </div>
  );
};
