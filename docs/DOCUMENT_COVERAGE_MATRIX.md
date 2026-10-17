# Project Rostro (واثق) — Universal Iraqi Document Coverage Matrix

> **Registry Version:** `2.1.0`  
> **Total Registered Iraqi Document Types:** **44** across **8 Categories (A–H)**  
> **Support Breakdown:** `TESTED: 20` | `CONFIGURED: 8` | `REGISTERED: 16`  
> **External Government Verification:** `EXTERNAL_VERIFICATION_UNAVAILABLE` (No live connection to MOI, Registrar of Companies, Tax Authority, or Core Banking databases is claimed).

## 1. Category Summary (Categories A–H)

| Code | Category ID | Category Name (EN) | Category Name (AR) | Total | TESTED | CONFIGURED | REGISTERED |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **A** | `IDENTITY_CIVIL` | Identity & Civil Status Documents | وثائق الهوية والأحوال المدنية | **9** | 3 | 1 | 5 |
| **B** | `RESIDENCE_ADDRESS` | Residence, Address & Household Documents | وثائق السكن والعنوان والأسرة | **5** | 4 | 1 | 0 |
| **C** | `TRAVEL_IMMIGRATION` | Travel & Immigration Documents | وثائق السفر والإقامة والهجرة | **3** | 2 | 0 | 1 |
| **D** | `DRIVING_VEHICLE` | Driving, Vehicle & Transport Documents | وثائق إجازة السوق والمركبات والنقل | **4** | 2 | 0 | 2 |
| **E** | `BUSINESS_MERCHANT` | Business & Merchant Onboarding Documents | وثائق تسجيل الشركات والتجار وممارسة المهنة | **10** | 4 | 3 | 3 |
| **F** | `EDUCATION_EMPLOYMENT_INCOME` | Education, Employment & Income Documents | وثائق التعليم والوظيفة وإثبات الدخل | **5** | 2 | 2 | 1 |
| **G** | `FINANCIAL_EVIDENCE` | Financial & Supporting Evidence | الوثائق المالية وكشوفات الحسابات المؤيدة | **4** | 1 | 1 | 2 |
| **H** | `LEGAL_AUTHORIZATION` | Legal, Authorization & Official Documents | الوكالات العدلية والوثائق القانونية والرسمية | **4** | 2 | 0 | 2 |

## 2. Full Document Type Catalog (44 Types)

| # | Document Type ID | Canonical Name (AR) | Canonical Name (EN) | Category | Jurisdiction | Languages | Preprocessing Policy | Primary ID? | Support Status | External Verification |
| :-: | :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| 1 | `IRQ_NATIONAL_ID` | البطاقة الوطنية الموحدة | Unified Iraqi National Card | `IDENTITY_CIVIL` | `FEDERAL_IRAQ` | `ar/ku/en` | `ID_CARD_LANDSCAPE` | Yes | **TESTED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |
| 2 | `IRQ_CIVIL_STATUS_ID` | هوية الأحوال المدنية | Iraqi Civil Status ID (Legacy Jinsiya ID) | `IDENTITY_CIVIL` | `FEDERAL_IRAQ` | `ar/ku` | `FLEXIBLE_FORM` | Yes | **TESTED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |
| 3 | `IRQ_NATIONALITY_CERT` | شهادة الجنسية العراقية | Iraqi Nationality Certificate | `IDENTITY_CIVIL` | `FEDERAL_IRAQ` | `ar` | `A4_PORTRAIT` | No | **CONFIGURED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |
| 4 | `IRQ_PASSPORT` | جواز السفر العراقي | Iraqi Republic Passport | `IDENTITY_CIVIL` | `FEDERAL_IRAQ` | `ar/ku/en` | `PASSPORT_BOOKLET` | Yes | **TESTED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |
| 5 | `IRQ_FAMILY_REGISTRY` | صورة قيد الأسرة / الأحوال المدنية | Family Registration & Civil Status Extract (Surat Qayd) | `IDENTITY_CIVIL` | `FEDERAL_IRAQ` | `ar/ku` | `A4_PORTRAIT` | No | **REGISTERED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |
| 6 | `IRQ_BIRTH_CERT` | شهادة الولادة العراقية | Iraqi Birth Certificate (Shahadat Al-Wilada) | `IDENTITY_CIVIL` | `FEDERAL_IRAQ` | `ar/ku` | `A4_PORTRAIT` | No | **REGISTERED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |
| 7 | `IRQ_MARRIAGE_CERT` | عقد الزواج الرسمي | Iraqi Marriage Certificate (Aqd Al-Zawaj) | `IDENTITY_CIVIL` | `FEDERAL_IRAQ` | `ar/ku` | `A4_PORTRAIT` | No | **REGISTERED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |
| 8 | `IRQ_DIVORCE_CERT` | قرار / حجة الطلاق | Iraqi Divorce Record (Hujjat Al-Talaq) | `IDENTITY_CIVIL` | `FEDERAL_IRAQ` | `ar/ku` | `A4_PORTRAIT` | No | **REGISTERED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |
| 9 | `IRQ_DEATH_CERT` | شهادة الوفاة | Iraqi Death Certificate (Shahadat Al-Wafat) | `IDENTITY_CIVIL` | `FEDERAL_IRAQ` | `ar/ku` | `A4_PORTRAIT` | No | **REGISTERED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |
| 10 | `IRQ_RESIDENCE_CARD` | بطاقة السكن | Iraqi Residence Card (Bitaqat Al-Sakan) | `RESIDENCE_ADDRESS` | `FEDERAL_IRAQ` | `ar` | `ID_CARD_LANDSCAPE` | No | **TESTED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |
| 11 | `KRG_INFO_CARD` | بطاقة المعلومات — إقليم كوردستان | KRG Residency / Information Card (Karti Zanyari) | `RESIDENCE_ADDRESS` | `KRG` | `ku/ar` | `ID_CARD_LANDSCAPE` | No | **TESTED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |
| 12 | `IRQ_RATION_CARD` | البطاقة التموينية (الأسرية) | Iraqi Food Ration Card (Al-Bitaqa Al-Tamwiniya) | `RESIDENCE_ADDRESS` | `FEDERAL_IRAQ` | `ar/ku` | `FLEXIBLE_FORM` | No | **TESTED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |
| 13 | `IRQ_MUKHTAR_CERT` | تأييد سكن مصدق (المختار / المجلس البلدي) | Official Residency Confirmation Letter (Ta'yeed Sakan) | `RESIDENCE_ADDRESS` | `MUNICIPAL_SYNDICATE` | `ar/ku` | `A4_PORTRAIT` | No | **CONFIGURED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |
| 14 | `IRQ_UTILITY_BILL` | قائمة أجور الكهرباء أو الماء | Electricity or Water Utility Bill | `RESIDENCE_ADDRESS` | `FEDERAL_IRAQ` | `ar/ku` | `FLEXIBLE_FORM` | No | **TESTED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |
| 15 | `FOREIGN_PASSPORT` | جواز سفر أجنبي (غير عراقي) | Foreign National Passport (Non-Iraqi) | `TRAVEL_IMMIGRATION` | `FOREIGN` | `en/ar` | `PASSPORT_BOOKLET` | Yes | **TESTED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |
| 16 | `IRQ_RESIDENCE_PERMIT` | إجازة / هوية الإقامة للأجانب | Iraqi / KRG Foreigner Residency Permit (Iqama) | `TRAVEL_IMMIGRATION` | `FEDERAL_IRAQ` | `ar/ku/en` | `ID_CARD_LANDSCAPE` | No | **TESTED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |
| 17 | `IRQ_ENTRY_VISA` | سمة دخول إلى جمهورية العراق (فيزا) | Iraqi Entry Visa (Simat Dukhul) | `TRAVEL_IMMIGRATION` | `FEDERAL_IRAQ` | `ar/en/ku` | `FLEXIBLE_FORM` | No | **REGISTERED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |
| 18 | `IRQ_DRIVING_LICENSE` | إجازة السوق العراقية | Iraqi Driving License (Ijazat Al-Suq) | `DRIVING_VEHICLE` | `FEDERAL_IRAQ` | `ar/ku/en` | `ID_CARD_LANDSCAPE` | No | **TESTED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |
| 19 | `IRQ_VEHICLE_REGISTRATION` | شهادة تسجيل المركبة (السنوية) | Iraqi Vehicle Registration Card (Sanawiya) | `DRIVING_VEHICLE` | `FEDERAL_IRAQ` | `ar/ku/en` | `ID_CARD_LANDSCAPE` | No | **TESTED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |
| 20 | `IRQ_VEHICLE_INSPECTION` | استمارة فحص المتانة والأمان للمركبات | Vehicle Roadworthiness & Inspection Certificate (Fahs Al-Matana) | `DRIVING_VEHICLE` | `FEDERAL_IRAQ` | `ar/ku` | `A4_PORTRAIT` | No | **REGISTERED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |
| 21 | `IRQ_VEHICLE_INSURANCE` | وثيقة التأمين الإلزامي أو الشامل للمركبات | Motor Vehicle Insurance Policy | `DRIVING_VEHICLE` | `FEDERAL_IRAQ` | `ar/en` | `A4_PORTRAIT` | No | **REGISTERED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |
| 22 | `IRQ_CHAMBER_COMMERCE` | هوية غرفة التجارة / إجازة ممارسة المهنة | Iraqi Chamber of Commerce Membership & Trade License | `BUSINESS_MERCHANT` | `FEDERAL_IRAQ` | `ar/en` | `FLEXIBLE_FORM` | No | **TESTED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |
| 23 | `KRG_CHAMBER_COMMERCE` | شهادة غرفة التجارة والصناعة — إقليم كوردستان | KRG Chamber of Commerce & Industry Certificate | `BUSINESS_MERCHANT` | `KRG` | `ku/ar/en` | `A4_PORTRAIT` | No | **TESTED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |
| 24 | `IRQ_COMPANY_REGISTRATION` | شهادة تأسيس / تسجيل شركة (دائرة مسجل الشركات) | Certificate of Company Registration (Shahadat Tasjeel Sharika) | `BUSINESS_MERCHANT` | `FEDERAL_IRAQ` | `ar/en/ku` | `A4_PORTRAIT` | No | **TESTED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |
| 25 | `IRQ_TAX_CARD` | الهوية الضريبية / براءة الذمة الضريبية | Iraqi Taxpayer ID & Tax Clearance Certificate | `BUSINESS_MERCHANT` | `FEDERAL_IRAQ` | `ar/ku` | `A4_PORTRAIT` | No | **TESTED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |
| 26 | `IRQ_MUNICIPAL_PERMIT` | إجازة البلدية / إجازة صحية لممارسة المهنة | Municipality Business & Health Permit (Ijazat Al-Baladiya) | `BUSINESS_MERCHANT` | `MUNICIPAL_SYNDICATE` | `ar/ku` | `A4_PORTRAIT` | No | **CONFIGURED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |
| 27 | `IRQ_AUTHORIZED_SIGNATORY` | كتاب تخويل بالتوقيع وإدارة الحساب المصرفي | Authorized Signatory Board Resolution / Letter | `BUSINESS_MERCHANT` | `FEDERAL_IRAQ` | `ar/en/ku` | `A4_PORTRAIT` | No | **CONFIGURED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |
| 28 | `IRQ_COMMERCIAL_CONTRACT` | عقد تأسيس الشركة / عقد تجاري مصدق | Company Memorandum of Association / Commercial Contract | `BUSINESS_MERCHANT` | `FEDERAL_IRAQ` | `ar/ku` | `A4_PORTRAIT` | No | **CONFIGURED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |
| 29 | `IRQ_SHAREHOLDER_REGISTER` | سجل المساهمين والمستفيد الحقيقي (محضر الهيئة العامة) | Company Shareholder & Beneficial Ownership Record (UBO) | `BUSINESS_MERCHANT` | `FEDERAL_IRAQ` | `ar/ku` | `A4_PORTRAIT` | No | **REGISTERED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |
| 30 | `IRQ_IMPORT_EXPORT_LICENSE` | هوية مستورد / مصدر (الشركة العامة للمعارض العراقية) | Iraqi Import / Export Identity License | `BUSINESS_MERCHANT` | `FEDERAL_IRAQ` | `ar/en` | `ID_CARD_LANDSCAPE` | No | **REGISTERED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |
| 31 | `IRQ_CUSTOMS_DECLARATION` | التصريحة الكمركية (الهيئة العامة للكمارك) | Iraqi Customs Clearance Declaration (Tasriha Kumrukiya) | `BUSINESS_MERCHANT` | `FEDERAL_IRAQ` | `ar/en` | `A4_PORTRAIT` | No | **REGISTERED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |
| 32 | `IRQ_SYNDICATE_ID` | هوية النقابة المهنية (أطباء / مهندسين / محامين / صيادلة) | Iraqi Professional Syndicate ID (Doctors, Engineers, Lawyers, Pharmacists) | `EDUCATION_EMPLOYMENT_INCOME` | `MUNICIPAL_SYNDICATE` | `ar/en/ku` | `ID_CARD_LANDSCAPE` | No | **TESTED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |
| 33 | `IRQ_EMPLOYMENT_LETTER` | كتاب تأييد استمرار بالخدمة ومقدار الراتب | Official Employment & Salary Continuity Letter (Ta'yeed Istimrar bil-Khidma) | `EDUCATION_EMPLOYMENT_INCOME` | `FEDERAL_IRAQ` | `ar/ku/en` | `A4_PORTRAIT` | No | **TESTED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |
| 34 | `IRQ_EMPLOYER_ID` | هوية موظف حكومي أو قطاع خاص | Ministry or Corporate Employee ID Card (Huwiyat Muwazzaf) | `EDUCATION_EMPLOYMENT_INCOME` | `FEDERAL_IRAQ` | `ar/ku/en` | `ID_CARD_LANDSCAPE` | No | **CONFIGURED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |
| 35 | `IRQ_SALARY_SLIP` | شريط الراتب / كشف توطين الراتب | Salary Slip / Payroll Statement (Shareet Al-Ratib) | `EDUCATION_EMPLOYMENT_INCOME` | `FEDERAL_IRAQ` | `ar/ku` | `A4_PORTRAIT` | No | **CONFIGURED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |
| 36 | `IRQ_DEGREE_CERT` | وثيقة تخرج جامعية / شهادة دراسية | University Graduation Certificate / Academic Degree (Wathiqat Takharruj) | `EDUCATION_EMPLOYMENT_INCOME` | `FEDERAL_IRAQ` | `ar/en/ku` | `A4_PORTRAIT` | No | **REGISTERED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |
| 37 | `IRQ_BANK_STATEMENT` | كشف حساب مصرفي رسمي | Iraqi Bank Account Statement (Kashf Hisab Masrafi) | `FINANCIAL_EVIDENCE` | `FEDERAL_IRAQ` | `ar/en` | `A4_PORTRAIT` | No | **TESTED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |
| 38 | `IRQ_IBAN_LETTER` | كتاب تأييد ملكية الحساب المصرفي والـ IBAN | Bank Account Ownership & IBAN Confirmation Letter | `FINANCIAL_EVIDENCE` | `FEDERAL_IRAQ` | `ar/en` | `A4_PORTRAIT` | No | **CONFIGURED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |
| 39 | `IRQ_COMMERCIAL_INVOICE` | فاتورة تجارية / وصل قبض | Commercial Invoice or Payment Receipt (Wasl Tijari / Fatura) | `FINANCIAL_EVIDENCE` | `MUNICIPAL_SYNDICATE` | `ar/ku/en` | `A4_PORTRAIT` | No | **REGISTERED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |
| 40 | `IRQ_PROOF_OF_FUNDS` | شهادة الملاءة المالية / إثبات مصدر الأموال | Proof of Funds / Financial Solvency Certificate (Kafala / Mala'a Maliya) | `FINANCIAL_EVIDENCE` | `FEDERAL_IRAQ` | `ar/en` | `A4_PORTRAIT` | No | **REGISTERED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |
| 41 | `IRQ_POWER_OF_ATTORNEY` | وكالة عامة أو خاصة مصدقة (دائرة الكاتب العدل) | Notarized Iraqi Power of Attorney (Wakala Aama / Khassa) | `LEGAL_AUTHORIZATION` | `FEDERAL_IRAQ` | `ar/ku` | `A4_PORTRAIT` | No | **TESTED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |
| 42 | `IRQ_PROPERTY_DEED` | سند التسجيل العقاري (الطابو — نموذج 23) | Real Estate Title Deed (Sanad Al-Tasjeel Al-Aqari / Tapu Form 23) | `LEGAL_AUTHORIZATION` | `FEDERAL_IRAQ` | `ar/ku` | `A4_PORTRAIT` | No | **TESTED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |
| 43 | `IRQ_COURT_DECISION` | قرار محكمة / قسام شرعي أو نظامي | Judicial Court Decision or Legal Inheritance Decree (Qassam Shar'i) | `LEGAL_AUTHORIZATION` | `FEDERAL_IRAQ` | `ar/ku` | `A4_PORTRAIT` | No | **REGISTERED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |
| 44 | `IRQ_OFFICIAL_AUTH_LETTER` | كتاب تخويل رسمي صادر من جهة حكومية أو نقابية | Government or Institutional Official Authorization Letter | `LEGAL_AUTHORIZATION` | `FEDERAL_IRAQ` | `ar/ku` | `A4_PORTRAIT` | No | **REGISTERED** | `EXTERNAL_VERIFICATION_UNAVAILABLE` |

## 3. Support Status Definitions & Engineering Honesty

- **`TESTED`**: Document schema, extraction rules, multi-script normalization, deterministic validation, synthetic test fixtures, and automated verification assertions in `backend/tests/test_hybrid_server.js` are all implemented and passing.
- **`CONFIGURED`**: Document schema, expected fields, normalizers, and deterministic validation rules are configured in `backend/kyc_app/registry/iraqi_document_registry.js` and ready for pipeline execution.
- **`REGISTERED`**: Document type and aliases are registered in the catalog for classification and automatic routing to `HUMAN_REVIEW`.
- **`UNSUPPORTED_OR_UNCERTAIN_CLASSIFICATION`**: Triggered when an uploaded document does not match any registered type with confidence >= 0.65. Preserves evidence, runs generic key-value layout fallback, ranks candidate categories, and routes to `HUMAN_REVIEW` so an officer can classify or register it.
- **`EXTERNAL_VERIFICATION_UNAVAILABLE`**: Explicitly reported on every document and case to distinguish internal optical/structural consistency from live sovereign database verification.
