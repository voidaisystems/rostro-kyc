import React, { useState } from 'react';
import {
  CheckCircle2,
  Camera,
  Sparkles,
  ShieldCheck,
  FileCheck2,
  Upload,
  RotateCcw,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Layers,
  Eye,
  ChevronDown,
  ChevronUp,
  Zap,
  Globe,
  Lock,
} from 'lucide-react';
import type { KYCApplicant, Language } from '../utils/kycEngine';
import { ChallengeEvaluationLab } from './ChallengeEvaluationLab';
import { ZainCashEdgeForensicsLab } from './ZainCashEdgeForensicsLab';

interface CompetitionShowcaseTabProps {
  lang: Language;
  onOpenUploadModal: () => void;
  onNavigateToQueue: () => void;
  onIngestTestedScenario?: (applicant: KYCApplicant) => void;
}

interface ShowcaseScenario {
  id: string;
  badgeAr: string;
  badgeEn: string;
  titleAr: string;
  titleEn: string;
  userUploadAr: string;
  userUploadEn: string;
  systemActionAr: string;
  systemActionEn: string;
  outcomeLabelAr: string;
  outcomeLabelEn: string;
  outcomeTone: 'emerald' | 'amber' | 'rose' | 'blue';
  speedLabelEn: string;
  speedLabelAr: string;
  metrics: {
    labelAr: string;
    labelEn: string;
    valueEn: string;
    valueAr: string;
  }[];
}

const SHOWCASE_SCENARIOS: ShowcaseScenario[] = [
  {
    id: 'valid_national_id',
    badgeAr: 'الحالة ١ · القبول الفوري',
    badgeEn: 'Case 1 · Instant Approval',
    titleAr: 'بطاقة وطنية عراقية مكتملة (الوجه الأمامي والظهر)',
    titleEn: 'Complete Iraqi National ID (Front + Back Uploaded)',
    userUploadAr: 'صورة واضحة للوجه الأمامي والخلفي للبطاقة الوطنية الموحدة.',
    userUploadEn: 'Clear photo of both the Front and Back sides of the Iraqi Unified National Card.',
    systemActionAr:
      'يتحقق النظام من وضوح الصورة محلياً، ثم يقرأ الوجهين معاً بالذكاء الاصطناعي في نفس اللحظة، ويطابق الرقم الوطني (12 رقماً) مع شريط القراءة الآلي في ظهر البطاقة.',
    systemActionEn:
      'Verifies image sharpness on-device, reads both Front and Back in parallel via AI, and cross-checks the 12-digit National ID against the back-side MRZ checksum.',
    outcomeLabelAr: 'معتمد تلقائياً خلال ٣.٨ ثانية',
    outcomeLabelEn: 'Approved Automatically in 3.8s',
    outcomeTone: 'emerald',
    speedLabelEn: '3.8s End-to-End',
    speedLabelAr: '٣.٨ ثانية للعملية الكاملة',
    metrics: [
      { labelAr: 'الوجهان المرفقان', labelEn: 'Sides Verified', valueEn: 'FRONT + BACK ✓', valueAr: 'الأمام والظهر ✓' },
      { labelAr: 'توحيد الأرقام والنصوص', labelEn: 'Script Normalization', valueEn: 'Eastern → ASCII 0-9 ✓', valueAr: '٠-٩ ← 0-9 ✓' },
      { labelAr: 'فحص الشريط الآلي', labelEn: 'ICAO 9303 MRZ Check', valueEn: 'Valid Modulo-10 ✓', valueAr: 'معادلة التحقق سليمة ✓' },
    ],
  },
  {
    id: 'vertical_rotated_photo',
    badgeAr: 'الحالة ٢ · التصحيح الذكي للاتجاه',
    badgeEn: 'Case 2 · Smart Orientation Fix',
    titleAr: 'صورة ملتقطة بشكل عمودي أو مقلوب بالهاتف',
    titleEn: 'Vertical or Upside-Down Phone Camera Photo',
    userUploadAr: 'المستخدم صوّر البطاقة بالطول (عمودياً) أو رأساً على عقب (180°).',
    userUploadEn: 'User photographed the horizontal ID card vertically (sideways) or upside-down.',
    systemActionAr:
      'يكتشف النظام موقع شعار جمهورية العراق والنسر الذهبي والختم الأخضر على حافة البطاقة، ويدير البطاقة بالاتجاه الصحيح (270° أو 90° أو 180°) تلقائياً لتصبح أفقية ومعتدلة قبل القراءة.',
    systemActionEn:
      'Detects the Republic of Iraq header, Gold Eagle, and Green Octagon along the card edges and automatically rotates 270°, 90°, or 180° so the card is horizontal and right-side-up.',
    outcomeLabelAr: 'تعديل تلقائي للاتجاه وقراءة صحيحة ١٠٠٪',
    outcomeLabelEn: 'Auto-Rotated Upright + Extracted cleanly',
    outcomeTone: 'emerald',
    speedLabelEn: '<15ms Auto-Rotate',
    speedLabelAr: 'أقل من ١٥ مللي ثانية للتدوير',
    metrics: [
      { labelAr: 'كشف اتجاه الترويسة', labelEn: 'Header Edge Detection', valueEn: 'Right Edge → 270° CCW', valueAr: 'الحافة اليمنى ← تدوير ٢٧٠°' },
      { labelAr: 'استهلاك الوحدات للتدوير', labelEn: 'AI Tokens Used to Rotate', valueEn: '0 Tokens (On-Device)', valueAr: 'صفر (معالجة محلية)' },
      { labelAr: 'حالة الصورة النهائية', labelEn: 'Final Card Alignment', valueEn: 'Horizontal & Upright ✓', valueAr: 'أفقية ومعتدلة ✓' },
    ],
  },
  {
    id: 'blurry_or_flash_photo',
    badgeAr: 'الحالة ٣ · حماية الجودة قبل الذكاء الاصطناعي',
    badgeEn: 'Case 3 · Pre-AI Quality Gate',
    titleAr: 'صورة ضبابية أو فيها انعكاس فلاش قوي أو دقة منخفضة',
    titleEn: 'Blurry, Flash-Washed, or Low-Resolution Photo',
    userUploadAr: 'اهتزاز يد المستخدم أثناء التصوير أو تشغيل فلاش قوي طمس الكتابة.',
    userUploadEn: 'Camera shake blurred the text, or harsh camera flash bleached out the card surface.',
    systemActionAr:
      'يرفض النظام الصورة فوراً على جهاز المستخدم خلال ١٢ جزءاً من الثانية (بدون استهلاك أي وحدات ذكاء اصطناعي) ويظهر تنبيهاً واضحاً يطلب التقاط صورة أخرى أوضح.',
    systemActionEn:
      'Catches the defect on-device in 12ms (using zero AI API tokens) and displays a clear warning asking the user to take another clearer photo.',
    outcomeLabelAr: 'يطلب إعادة التصوير فوراً (يوفر وقت وتكلفة المعالجة)',
    outcomeLabelEn: 'Prompts User to Retake Photo Immediately',
    outcomeTone: 'rose',
    speedLabelEn: '12ms On-Device',
    speedLabelAr: '١٢ مللي ثانية على الجهاز',
    metrics: [
      { labelAr: 'فحص الضبابية والحدة', labelEn: 'Blur & Sharpness Check', valueEn: 'Detects Camera Shake', valueAr: 'يكتشف اهتزاز الكاميرا' },
      { labelAr: 'فحص وهج الفلاش القوي', labelEn: 'Flash Washout Check', valueEn: 'Detects Bleached Ink', valueAr: 'يكتشف طمس الإضاءة' },
      { labelAr: 'فحص دقة الصورة', labelEn: 'Resolution Gate', valueEn: 'Blocks < 380×240px', valueAr: 'يحظر أقل من ٣٨٠×٢٤٠' },
    ],
  },
  {
    id: 'missing_back_or_mismatch',
    badgeAr: 'الحالة ٤ · منع التلاعب ونقص الوثائق',
    badgeEn: 'Case 4 · Anti-Fraud & Completeness',
    titleAr: 'رفع الوجه الأمامي فقط أو رفع هويتين لشخصين مختلفين',
    titleEn: 'Front Side Only OR Two Different People’s IDs Uploaded',
    userUploadAr: 'رفع وجه واحد فقط للبطاقة، أو وضع هوية شخص آخر في خانة الوجه الخلفي.',
    userUploadEn: 'User uploaded only the front side of an ID card, or uploaded two different people’s cards.',
    systemActionAr:
      'يشترط النظام وجود الوجهين الأمامي والخلفي معاً لجميع البطاقات (ما عدا جواز السفر صفحة واحدة)، ويقارن الاسم والرقم الوطني بين الصورتين لمنع خلط الوثائق.',
    systemActionEn:
      'Enforces both Front and Back for physical ID cards (Passport is single bio-page) and cross-verifies cardholder identity across both slots.',
    outcomeLabelAr: 'إيقاف تلقائي وتحويل للمراجعة أو طلب الوجه الناقص',
    outcomeLabelEn: 'Blocks Mismatch & Requests Missing Back Side',
    outcomeTone: 'amber',
    speedLabelEn: '100% Rule Enforcement',
    speedLabelAr: 'تطبيق القواعد ١٠٠٪',
    metrics: [
      { labelAr: 'قاعدة البطاقات العراقية', labelEn: 'ID Card Policy', valueEn: 'Requires Front + Back', valueAr: 'يتطلب الأمام والظهر' },
      { labelAr: 'قاعدة جواز السفر', labelEn: 'Passport Policy', valueEn: 'Single Bio-Page Only', valueAr: 'صفحة بيانات واحدة فقط' },
      { labelAr: 'مطابقة صاحب البطاقة', labelEn: 'Cross-Slot Holder Match', valueEn: 'Detects Different IDs', valueAr: 'يكتشف اختلاف الهويات' },
    ],
  },
  {
    id: 'forged_or_photocopy_id',
    badgeAr: 'الحالة ٥ · كشف الوثائق المزورة',
    badgeEn: 'Case 5 · Anti-Forgery Scanner',
    titleAr: 'كشف التعديل الرقمي أو النسخ الورقية الملونة أو تغيير الأرقام',
    titleEn: 'Detects Photoshop Edits, Paper Photocopies & Altered ID Numbers',
    userUploadAr: 'بطاقة تم تعديل رقمها أو اسمها رقمياً، أو مطبوعة على ورق عادي، أو مصورة من شاشة أخرى.',
    userUploadEn: 'An ID with a Photoshopped name/number, printed on plain white paper, or photographed from another screen.',
    systemActionAr:
      'يعمل النظام كجهاز فحص العملات والبطاقات عبر 5 طبقات بالكاميرا والرياضيات: يفحص تلاعب البكسلات، ويتأكد من وجود العلامات الأمنية العراقية الـ 4 وخلفية البوليكاربونات الموجية، ويختبر المعادلة الرياضية السرية [7, 3, 1].',
    systemActionEn:
      'Acts like a physical banknote/ID verifier using 5 camera & math layers: scans 8×8 pixel ELA tampering, checks all 4 Iraqi security landmarks & guilloche waves, and verifies ICAO [7, 3, 1] check digits.',
    outcomeLabelAr: 'حظر فوري للوثيقة المزورة وتحديد مكان التلاعب باللون الأحمر',
    outcomeLabelEn: 'Blocks Forged ID + Highlights Tampered Zone in Red',
    outcomeTone: 'rose',
    speedLabelEn: '<20ms Anti-Forgery Scan',
    speedLabelAr: 'أقل من ٢٠ مللي ثانية لكشف التزوير',
    metrics: [
      { labelAr: 'فحص تعديل البكسلات', labelEn: 'ELA Pixel Splice Scan', valueEn: 'Catches Edited Text/Photo', valueAr: 'يكتشف تعديل النص والصورة' },
      { labelAr: 'العلامات الأمنية العراقية (4/4)', labelEn: '4 Iraqi Security Landmarks', valueEn: 'Blocks Paper Photocopies', valueAr: 'يحظر النسخ الورقية الملونة' },
      { labelAr: 'المعادلة السرية [7, 3, 1]', labelEn: 'Modulo-10 Math Check', valueEn: 'Catches 1 Changed Digit', valueAr: 'يكتشف تغيير رقم واحد' },
    ],
  },
];

export const CompetitionShowcaseTab: React.FC<CompetitionShowcaseTabProps> = ({
  lang,
  onOpenUploadModal,
  onNavigateToQueue,
  onIngestTestedScenario,
}) => {
  const isAr = lang === 'ar';
  const [activeScenarioId, setActiveScenarioId] = useState<string>('valid_national_id');
  const [showAdvancedLabs, setShowAdvancedLabs] = useState<boolean>(false);

  const activeScenario =
    SHOWCASE_SCENARIOS.find((s) => s.id === activeScenarioId) || SHOWCASE_SCENARIOS[0];

  const steps = [
    {
      num: '01',
      icon: Camera,
      titleAr: 'فحص جودة الصورة وتصحيح الاتجاه',
      titleEn: 'Smart Quality & Orientation Gate',
      timeBadgeEn: '< 15 ms · 0 Tokens',
      timeBadgeAr: 'أقل من ١٥ مللي ثانية · بدون وحدات',
      descAr:
        'فحص فوري على المتصفح يكتشف الضبابية، الفلاش القوي، والدقة المنخفضة ليطلب صورة أوضح فوراً، مع تدوير البطاقات العمودية أو المقلوبة (270° / 90° / 180°) تلقائياً للوضع الصحيح.',
      descEn:
        'Instant client-side check flags blur, harsh flash, and low resolution so the user retakes bad photos immediately, while auto-rotating vertical or upside-down cards right-side-up.',
    },
    {
      num: '02',
      icon: Sparkles,
      titleAr: 'القراءة المتوازية للوجهين بالذكاء الاصطناعي',
      titleEn: 'Parallel Bilingual AI Extraction',
      timeBadgeEn: '~ 3.5 sec · Fast JSON',
      timeBadgeAr: 'حوالي ٣.٥ ثانية · استخراج مهيكل',
      descAr:
        'ضغط ذكي للصور وقراءة الوجه الأمامي والخلفي في نفس اللحظة، مع دعم كامل للغة العربية والكردية والإنجليزية وتوحيد الأرقام المشرقية (٠-٩ ← 0-9) بدون أي تخمين للحقول غير الواضحة.',
      descEn:
        'Compresses camera photos and reads Front + Back simultaneously, normalizing Arabic, Kurdish, and English text and numerals (0-9) with strict zero-hallucination on unclear text.',
    },
    {
      num: '03',
      icon: ShieldCheck,
      titleAr: 'مطابقة الوجهين والتحقق الرياضي',
      titleEn: 'Cross-Side & Mathematical Verification',
      timeBadgeEn: 'ICAO 9303 Verified',
      timeBadgeAr: 'مطابق للمعيار الدولي 9303',
      descAr:
        'التأكد من إرفاق الوجه الأمامي والخلفي للبطاقات، ومطابقة اسم صاحب الهوية بين الوجهين، وفحص الأرقام السرية في شريط القراءة الآلي رياضياً لكشف أي تزوير.',
      descEn:
        'Verifies both Front and Back are present for ID cards, confirms both sides belong to the same person, and validates ICAO 9303 MRZ check digits mathematically.',
    },
    {
      num: '04',
      icon: FileCheck2,
      titleAr: 'القرار الفوري وسجل التدقيق الرقابي',
      titleEn: 'Instant Decision & Compliance Audit',
      timeBadgeEn: 'CBI Law No. 78 Ready',
      timeBadgeAr: 'متوافق مع قانون البنك المركزي 78',
      descAr:
        'إصدار قرار فوري: اعتماد تلقائي للوثائق السليمة المكتملة، أو تحويل للمراجعة البشرية عند نقص البيانات، أو رفض تلقائي عند وجود تلاعب، مع حفظ سجل تدقيق مشفر.',
      descEn:
        'Routes complete valid documents to Instant Approval, flags missing fields for Human Review, or blocks tampered IDs with a signed compliance audit trail.',
    },
  ];

  const supportedDocs = [
    {
      titleAr: 'البطاقة الوطنية الموحدة',
      titleEn: 'Iraqi Unified National Card',
      ruleAr: 'يتطلب الوجه الأمامي والوجه الخلفي معاً',
      ruleEn: 'Requires Front + Back Sides',
      fieldsAr: 'الاسم الكامل، الرقم الوطني (12 رقماً)، التولد، تاريخ النفاذ، والشريط الآلي الثلاثي.',
      fieldsEn: 'Full Name, 12-Digit National ID, DOB, Expiry Date, and 3-line TD1 MRZ.',
    },
    {
      titleAr: 'بطاقة السكن العراقية',
      titleEn: 'Iraqi Residence Card',
      ruleAr: 'يتطلب الوجه الأمامي والوجه الخلفي معاً',
      ruleEn: 'Requires Front + Back Sides',
      fieldsAr: 'اسم رب الأسرة، المحافظة، العنوان الكامل (محلة / زقاق / دار)، ورقم البطاقة.',
      fieldsEn: 'Head of Household, Governorate, Full Address (Mahalla / Zukak / Dar), and Serial No.',
    },
    {
      titleAr: 'جواز السفر العراقي الإلكتروني',
      titleEn: 'Iraqi e-Passport',
      ruleAr: 'يكفي صفحة البيانات الشخصية فقط (وجه واحد)',
      ruleEn: 'Single Bio-Data Page Only',
      fieldsAr: 'الاسم الكامل، رقم الجواز، تاريخ الإصدار والنفاذ، والشريط الآلي الثنائي.',
      fieldsEn: 'Full Name, Passport Number, Issue & Expiry Dates, and 2-line TD3 MRZ.',
    },
    {
      titleAr: 'هوية الأحوال المدنية وإجازة السوق',
      titleEn: 'Civil ID & Driving License',
      ruleAr: 'يتطلب الوجه الأمامي والوجه الخلفي معاً',
      ruleEn: 'Requires Front + Back Sides',
      fieldsAr: 'دعم الوثائق العراقية وإقليم كردستان مع توحيد النصوص العربية والكردية.',
      fieldsEn: 'Supports Federal Iraq & KRG documents with Arabic and Kurdish script normalization.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. HERO OVERVIEW BANNER */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#111113] p-6 sm:p-8">
        <div className="max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <Layers className="w-4 h-4" />
            <span>
              {isAr
                ? 'عرض المسابقة · شرح مبسط لكيفية عمل النظام'
                : 'Competition Overview · How the System Works'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {isAr
              ? 'نظام التحقق الذكي من الوثائق والهويات العراقية'
              : 'Intelligent Iraqi Identity & Document Verification System'}
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {isAr
              ? 'مصمم للمصارف والمحافظ الإلكترونية والشركات المالية في العراق. يقوم النظام بفحص جودة الصورة وتصحيح اتجاهها فوراً على جهاز المستخدم، ثم يقرأ الوجه الأمامي والخلفي للوثيقة بالذكاء الاصطناعي ويتحقق من صحتها رياضياً خلال ثوانٍ دون أي تعقيد.'
              : 'Built for Iraqi banks, e-wallets, and fintechs. Automatically checks image quality and fixes card orientation on the device, reads both Front and Back sides in parallel with AI, and verifies identity mathematically in seconds.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onOpenUploadModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>
                {isAr
                  ? 'جرّب رفع وفحص وثيقة الآن'
                  : 'Try Live Document Upload Now'}
              </span>
            </button>

            <button
              type="button"
              onClick={onNavigateToQueue}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>
                {isAr ? 'استعراض جدول طلبات التحقق' : 'View Verification Queue'}
              </span>
            </button>
          </div>
        </div>

        {/* 3 Core Executive Pillars */}
        <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800/80 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {isAr ? 'سريع ويوفر استهلاك الموارد' : 'Fast & Token-Efficient'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                {isAr
                  ? 'يكتشف الصور الضبابية والمقلوبة محلياً خلال ١٥ مللي ثانية قبل إرسالها للذكاء الاصطناعي، ويعالج الوجهين معاً على التوازي.'
                  : 'Rejects blurry or flash-washed photos on-device in <15ms before spending AI tokens, and processes Front + Back in parallel.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {isAr ? 'مصمم خصيصاً للوثائق العراقية' : 'Tailored for Iraqi Documents'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                {isAr
                  ? 'يفهم البطاقة الوطنية الموحدة وبطاقة السكن (محلة/زقاق/دار) والجواز العراقي باللغات العربية والكردية والإنجليزية.'
                  : 'Native support for Iraqi Unified ID, Residence Card (Mahalla/Zukak/Dar), and Passport across Arabic, Kurdish, and English.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {isAr ? 'أمان كامل بدون تخمين' : 'Zero-Hallucination Safety'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                {isAr
                  ? 'لا يخمن أبداً أي رقم أو اسم غير واضح، ويكتشف فوراً إذا قام المستخدم برفع هويتين لشخصين مختلفين.'
                  : 'Never invents unreadable numbers or names, and immediately blocks attempts to upload two different people’s IDs.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. THE 4-STEP END-TO-END WORKFLOW */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {isAr
              ? 'كيف يعمل النظام خطوة بخطوة (٤ مراحل رئيسية)'
              : 'How the System Works Step-by-Step (4 Core Stages)'}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {isAr
              ? 'مسار واضح ومؤتمت بالكامل من لحظة اختيار صورة الوثيقة وحتى إصدار القرار النهائي'
              : 'Clean, automated pipeline from the moment a user selects a document photo to the final compliance decision'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-zinc-200 dark:divide-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#111113] overflow-hidden">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      {isAr ? `المرحلة ${step.num}` : `STEP ${step.num}`}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                      {isAr ? step.timeBadgeAr : step.timeBadgeEn}
                    </span>
                  </div>

                  <div className="w-9 h-9 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>

                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {isAr ? step.titleAr : step.titleEn}
                  </h3>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {isAr ? step.descAr : step.descEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. INTERACTIVE SCENARIO EXPLORER (WHAT HAPPENS IN EACH REAL-WORLD CASE) */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#111113] overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-zinc-200 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {isAr
                ? 'استكشف كيف يتصرف النظام في الحالات الواقعية'
                : 'Interactive Case Explorer — See How the System Responds'}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {isAr
                ? 'اضغط على أي حالة لترى كيف يعالج النظام الصور السليمة، الصور المقلوبة، الصور الضبابية، أو الوثائق المزورة'
                : 'Select any real-world scenario below to see how the system handles clean IDs, sideways photos, blur/flash, or forged documents'}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenUploadModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-200 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg transition-colors shrink-0"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isAr ? 'جربها بنفسك في نافذة الرفع' : 'Test Live in Uploader'}</span>
          </button>
        </div>

        {/* Scenario Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-[#0c0c0e] divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 dark:divide-zinc-800/80">
          {SHOWCASE_SCENARIOS.map((sc) => {
            const isSelected = sc.id === activeScenario.id;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => setActiveScenarioId(sc.id)}
                className={`p-4 text-start transition-colors flex flex-col justify-between gap-1.5 ${
                  isSelected
                    ? 'bg-white dark:bg-[#111113] border-b-2 border-b-emerald-500'
                    : 'hover:bg-zinc-100/80 dark:hover:bg-zinc-900/50'
                }`}
              >
                <span className="text-[11px] font-mono font-medium text-emerald-600 dark:text-emerald-400">
                  {isAr ? sc.badgeAr : sc.badgeEn}
                </span>
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2">
                  {isAr ? sc.titleAr : sc.titleEn}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Scenario Detail Panel */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-zinc-400">
              <span>{isAr ? activeScenario.badgeAr : activeScenario.badgeEn}</span>
              <span>·</span>
              <span>{isAr ? activeScenario.speedLabelAr : activeScenario.speedLabelEn}</span>
            </div>

            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {isAr ? activeScenario.titleAr : activeScenario.titleEn}
            </h3>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800/80">
                <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                  {isAr ? '١. ماذا رفع المستخدم؟' : '1. What the User Uploaded:'}
                </div>
                <div className="text-zinc-800 dark:text-zinc-200 font-medium">
                  {isAr ? activeScenario.userUploadAr : activeScenario.userUploadEn}
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800/80">
                <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                  {isAr ? '٢. كيف تعامل النظام مع الصورة؟' : '2. How the System Processed It:'}
                </div>
                <div className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {isAr ? activeScenario.systemActionAr : activeScenario.systemActionEn}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-[#0c0c0e] p-5 space-y-4">
            <div>
              <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                {isAr ? 'النتيجة النهائية للنظام' : 'System Final Outcome'}
              </div>
              <div
                className={`mt-1.5 flex items-center gap-2 text-sm sm:text-base font-semibold ${
                  activeScenario.outcomeTone === 'emerald'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : activeScenario.outcomeTone === 'amber'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-red-600 dark:text-red-400'
                }`}
              >
                {activeScenario.outcomeTone === 'emerald' && (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                )}
                {activeScenario.outcomeTone === 'amber' && (
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                )}
                {activeScenario.outcomeTone === 'rose' && (
                  <XCircle className="w-4 h-4 shrink-0" />
                )}
                <span>
                  {isAr ? activeScenario.outcomeLabelAr : activeScenario.outcomeLabelEn}
                </span>
              </div>
            </div>

            <div className="divide-y divide-zinc-200 dark:divide-zinc-800/80 border-t border-b border-zinc-200 dark:border-zinc-800/80">
              {activeScenario.metrics.map((m, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                  <span className="text-zinc-600 dark:text-zinc-400">
                    {isAr ? m.labelAr : m.labelEn}
                  </span>
                  <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
                    {isAr ? m.valueAr : m.valueEn}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={onOpenUploadModal}
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium inline-flex items-center justify-center gap-2 transition-colors"
            >
              <span>
                {isAr
                  ? 'افتح نافذة الفحص وجرب هذه الحالة مباشرة'
                  : 'Open Live Uploader to Test This Case'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3B. HOW THE ANTI-FORGERY & COUNTERFEIT SCANNER WORKS (LIKE A BANK CURRENCY / ID VERIFIER — NO NFC) */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#111113] p-6 space-y-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>
                {isAr
                  ? 'فاحص كشف التزوير والوثائق المزورة (٥ فحوصات بالكاميرا والرياضيات)'
                  : '5-Layer Camera & Mathematical Anti-Forgery Scanner (Works Without NFC)'}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {isAr
                ? 'كيف يعرف النظام أن البطاقة مزورة مثل أجهزة فحص النقود والبطاقات؟'
                : 'How the System Detects Counterfeit & Tampered IDs Like a Bank Currency Verifier'}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-3xl">
              {isAr
                ? 'يعمل الفاحص المدمج على أي صورة مرفوعة بالكاميرا العادية ويكشف التعديل الرقمي، النسخ الورقية الملونة، تغيير الأرقام، وتصوير شاشة هاتف آخر.'
                : 'Inspects every uploaded photo in <20ms using pixel forensics, Iraqi security landmark recognition, optical specularity, and cryptographic checksums.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenUploadModal}
            className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-medium inline-flex items-center gap-2 transition-colors"
          >
            <span>
              {isAr
                ? 'تجربة فحص هوية مزورة الآن'
                : 'Test Forged ID Scanner Live'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-zinc-200 dark:divide-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-[#0c0c0e] overflow-hidden">
          {[
            {
              stepEn: '01 · ELA',
              stepAr: '٠١ · فحص البكسلات',
              titleAr: 'كشف التعديل الرقمي وتغيير الأرقام',
              titleEn: 'Photoshop & Pixel Splice Scan (ELA)',
              descAr:
                'يحلل ضغط البكسلات (8×8) ليكتشف فوراً أي مربع لصق أو مسح وتعديل للرقم الوطني أو الاسم، ويحدد مكان التزوير بمربع أحمر فوق البطاقة.',
              descEn:
                'Analyzes 8×8 pixel compression residuals to catch pasted text patches or altered ID numbers and highlights the exact tampered area in red.',
            },
            {
              stepEn: '02 · LANDMARKS',
              stepAr: '٠٢ · العلامات الأمنية',
              titleAr: 'فحص العلامات الأمنية العراقية الـ ٤',
              titleEn: '4 Iraqi Security Landmarks',
              descAr:
                'يتحقق من وجود الشريحة الذهبية، شعار النسر الجمهوري، الزخرفة الأمنية الخضراء، والخلفية الموجية الدقيقة التي تختفي في النسخ الورقية.',
              descEn:
                'Verifies the Gold Contact Chip, Eagle of Saladin, Emerald Octagon Rosette, and fine Guilloche wave micro-grid that paper copies lack.',
            },
            {
              stepEn: '03 · SUBSTRATE',
              stepAr: '٠٣ · خامة البطاقة',
              titleAr: 'كشف النسخ الورقية الملونة مقابل البوليكاربونات',
              titleEn: 'Polycarbonate vs. Paper Photocopy',
              descAr:
                'يميز بصرياً بين لمعة خامة البوليكاربونات الأصلية والحبر المتغير وبين الورق الأبيض العادي المطبوع بطابعة ملونة.',
              descEn:
                'Distinguishes multi-layer polycarbonate & Optically Variable Ink (OVI) from flat matte CMYK toner on plain A4 paper.',
            },
            {
              stepEn: '04 · GHOST SSIM',
              stepAr: '٠٤ · الصورة الشبحية',
              titleAr: 'تطابق الصورة الشبحية وكشف شاشات الهواتف',
              titleEn: 'Ghost Portrait & Screen-Replay FFT',
              descAr:
                'يطابق الصورة الشخصية مع الصورة الشبحية الليزرية (≥ 0.68) لمنع لصق صورة شخص آخر، ويكشف تموجات الشاشات إذا صُورت من هاتف ثانٍ.',
              descEn:
                'Matches the main photo against the laser-engraved ghost portrait (SSIM ≥ 0.68) and blocks photos taken of another phone/monitor screen.',
            },
            {
              stepEn: '05 · MATH [7,3,1]',
              stepAr: '٠٥ · معادلة [7,3,1]',
              titleAr: 'المعادلة الرياضية السرية للأرقام ومطابقة الوجهين',
              titleEn: 'Modulo-10 [7,3,1] Math & Dual-Side Match',
              descAr:
                'يفحص أرقام التحقق الـ 4 في ظهر البطاقة بمعادلة [7, 3, 1] ويقارنها مع الوجه الأمامي؛ تغيير رقم واحد فقط يكشف التزوير بنسبة 100%.',
              descEn:
                'Computes all 4 ICAO 9303 [7, 3, 1] check digits on the back MRZ and cross-matches them with the front; changing even 1 digit fails 100%.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-4 space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  {isAr ? item.stepAr : item.stepEn}
                </div>
                <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                  {isAr ? item.titleAr : item.titleEn}
                </h3>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {isAr ? item.descAr : item.descEn}
                </p>
              </div>
              <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                <span>{isAr ? 'مفعل تلقائياً' : 'Active Live'}</span>
                <span>{isAr ? 'ناجح' : 'PASS'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. SUPPORTED IRAQI DOCUMENTS SUMMARY */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {isAr
              ? 'الوثائق العراقية المدعومة وقواعد التحقق'
              : 'Supported Iraqi Documents & Verification Rules'}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {isAr
              ? 'يميز النظام تلقائياً بين البطاقات التي تتطلب وجهين (أمامي وخلفي) وبين جواز السفر الذي يتطلب صفحة واحدة'
              : 'Automatically distinguishes between physical cards requiring both Front & Back sides and passports requiring a single bio-page'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 dark:divide-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#111113] overflow-hidden">
          {supportedDocs.map((doc, idx) => (
            <div
              key={idx}
              className="p-5 space-y-2"
            >
              <div className="text-[11px] font-mono font-medium text-emerald-600 dark:text-emerald-400">
                {isAr ? doc.ruleAr : doc.ruleEn}
              </div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {isAr ? doc.titleAr : doc.titleEn}
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {isAr ? doc.fieldsAr : doc.fieldsEn}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. OPTIONAL COLLAPSIBLE DRAWER FOR DEEP TECHNICAL BENCHMARKS (HIDDEN BY DEFAULT SO PAGE STAYS CLEAN) */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowAdvancedLabs((prev) => !prev)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#111113] hover:bg-zinc-50 dark:hover:bg-zinc-900 text-xs font-medium text-zinc-600 dark:text-zinc-400 transition-colors"
        >
          <span>
            {isAr
              ? 'عرض التفاصيل الهندسية المتقدمة واختبارات الحالات الحدية (للمحكمين التقنيين فقط)'
              : 'Show Advanced Engineering Benchmarks & Edge Forensics Lab (Optional Technical Deep-Dive)'}
          </span>
          {showAdvancedLabs ? (
            <ChevronUp className="w-4 h-4 shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 shrink-0" />
          )}
        </button>

        {showAdvancedLabs && (
          <div className="mt-6 space-y-8">
            <ChallengeEvaluationLab lang={lang} onOpenUploadModal={onOpenUploadModal} />
            <ZainCashEdgeForensicsLab
              lang={lang}
              onOpenUploadModal={onOpenUploadModal}
              onIngestTestedScenario={(newApp) => {
                if (onIngestTestedScenario) onIngestTestedScenario(newApp);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
