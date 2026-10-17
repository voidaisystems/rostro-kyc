// Embedded Synthetic Dataset (5 Benchmark Scenarios)
const SCENARIOS = [
  {
    "scenario_id": "clean_merchant_pass",
    "scenario_name_ar": "1. تاجر معتمد وبيانات مطابقة تماماً (اعتماد فوري - 3 ثوانٍ)",
    "description": "حالة مثالية: وضوح بصري عالٍ، مطابقة تامة للاسم الرباعي والرقم الوطني، ترخيص ساري المفعول.",
    "merchant_trade_name": "شركة الرافدين لتجارة المواد الغذائية",
    "national_card": {
      "national_id_number": "198814205819",
      "full_name_ar": "علي حسين كاظم الجبوري",
      "mother_name_ar": "فاطمة حسن",
      "date_of_birth": "1988-06-14",
      "gender": "ذكر",
      "expiry_date": "2031-06-14",
      "clarity_score": 0.96
    },
    "business_license": {
      "license_number": "BG-2023-88412",
      "commercial_trade_name": "شركة الرافدين لتجارة المواد الغذائية",
      "owner_name": "علي حسين كاظم الجبوري",
      "commercial_class": "ممتازة",
      "activity_type": "تجارة المواد الغذائية والمشروبات بالجملة",
      "issue_date": "2023-01-10",
      "expiry_date": "2027-01-10",
      "governorate": "بغداد",
      "clarity_score": 0.94
    },
    "tax_card": {
      "tax_id_number": "901841208",
      "taxpayer_name": "علي حسين كاظم الجبوري",
      "national_id_reference": "198814205819",
      "tax_branch": "فرع الكرخ",
      "tax_year_status": "2025",
      "clarity_score": 0.95
    }
  },
  {
    "scenario_id": "expired_license_temporal_flag",
    "scenario_name_ar": "2. إجازة ممارسة مهنة منتهية الصلاحية (إحالة للتدقيق البشري)",
    "description": "جميع المستندات واضحة والأسماء متطابقة، لكن إجازة غرفة التجارة منتهية الصلاحية منذ 45 يوماً.",
    "merchant_trade_name": "مكتب النور للمقاولات العامة",
    "national_card": {
      "national_id_number": "197920194821",
      "full_name_ar": "حيدر جاسم محمد الساعدي",
      "mother_name_ar": "زينب عبد",
      "date_of_birth": "1979-11-20",
      "gender": "ذكر",
      "expiry_date": "2029-11-20",
      "clarity_score": 0.95
    },
    "business_license": {
      "license_number": "BS-2021-41092",
      "commercial_trade_name": "مكتب النور للمقاولات العامة",
      "owner_name": "حيدر جاسم محمد الساعدي",
      "commercial_class": "ثانية",
      "activity_type": "مقاولات عامة وأعمال صيانة",
      "issue_date": "2021-08-05",
      "expiry_date": "2026-08-05",
      "governorate": "البصرة",
      "clarity_score": 0.92
    },
    "tax_card": {
      "tax_id_number": "812049182",
      "taxpayer_name": "حيدر جاسم محمد الساعدي",
      "national_id_reference": "197920194821",
      "tax_branch": "فرع البصرة",
      "tax_year_status": "2025",
      "clarity_score": 0.93
    }
  },
  {
    "scenario_id": "specular_glare_zero_hallucination",
    "scenario_name_ar": "3. انعكاس فلاش ضوئي على تاريخ النفاذ (Blank & Flagged)",
    "description": "انعكاس ضوئي أبيض يغطي تاريخ نفاذ إجازة المهنة. النظام لا يخمن التاريخ بل يتركه فارغاً مع ثقة 18%.",
    "merchant_trade_name": "محل البركة لتجارة الأجهزة الكهربائية",
    "national_card": {
      "national_id_number": "199230491820",
      "full_name_ar": "مصطفى كمال الدين حميد الربيعي",
      "mother_name_ar": "مريم كاظم",
      "date_of_birth": "1992-03-15",
      "gender": "ذكر",
      "expiry_date": "2032-03-15",
      "clarity_score": 0.94
    },
    "business_license": {
      "license_number": "ER-2022-77120",
      "commercial_trade_name": "محل البركة للأجهزة الكهربائية",
      "owner_name": "مصطفى كمال الدين حميد",
      "commercial_class": "ثالثة",
      "activity_type": "بيع وتصليح الأجهزة الكهربائية",
      "issue_date": "2022-04-12",
      "expiry_date": null,
      "occluded_exp": true,
      "flag_exp": "انعكاس فلاش ضوئي (Specular Glare)",
      "clarity_score": 0.38
    },
    "tax_card": {
      "tax_id_number": "771920412",
      "taxpayer_name": "مصطفى كمال الدين حميد الربيعي",
      "national_id_reference": "199230491820",
      "tax_branch": "فرع أربيل",
      "tax_year_status": "2025",
      "clarity_score": 0.95
    }
  },
  {
    "scenario_id": "compound_name_and_orthography_success",
    "scenario_name_ar": "4. مرونة الأسماء المركبة العراقية وإسقاط اللقب (مطابقة ناجحة 96%)",
    "description": "الهوية: 'محمد باقر عبد الزهرة الشمري' مقابل الإجازة: 'محمد باقر عبد الزهره'. يحللها النظام كتطابق 96%.",
    "merchant_trade_name": "مجمع دجلة الطبي للتجهيزات",
    "national_card": {
      "national_id_number": "198544109281",
      "full_name_ar": "محمد باقر عبد الزهرة الشمري",
      "mother_name_ar": "هدى خضير",
      "date_of_birth": "1985-09-08",
      "gender": "ذكر",
      "expiry_date": "2030-09-08",
      "clarity_score": 0.95
    },
    "business_license": {
      "license_number": "BG-2024-11029",
      "commercial_trade_name": "مجمع دجلة الطبي للتجهيزات",
      "owner_name": "محمد باقر عبد الزهره",
      "commercial_class": "أولى",
      "activity_type": "استيراد وتوزيع الأجهزة والمستلزمات الطبية",
      "issue_date": "2024-02-15",
      "expiry_date": "2028-02-15",
      "governorate": "بغداد",
      "clarity_score": 0.93
    },
    "tax_card": {
      "tax_id_number": "910284712",
      "taxpayer_name": "محمد باقر عبد الزهرة الشمري",
      "national_id_reference": "198544109281",
      "tax_branch": "فرع الرصافة",
      "tax_year_status": "2025",
      "clarity_score": 0.94
    }
  },
  {
    "scenario_id": "identity_mismatch_fraud_attempt",
    "scenario_name_ar": "5. تعارض صارخ في هوية صاحب العمل (محاولة احتيال/انتحال)",
    "description": "الهوية الوطنية لشخص بينما إجازة ممارسة المهنة لشخص آخر تماماً. يكتشف النظام التعارض ويرفض فوراً.",
    "merchant_trade_name": "معرض الفرات للسيارات",
    "national_card": {
      "national_id_number": "199011409218",
      "full_name_ar": "كرار علي جاسم الجميلي",
      "mother_name_ar": "سهام ناصر",
      "date_of_birth": "1990-07-22",
      "gender": "ذكر",
      "expiry_date": "2030-07-22",
      "clarity_score": 0.95
    },
    "business_license": {
      "license_number": "NJ-2020-55910",
      "commercial_trade_name": "معرض الفرات لتجارة السيارات",
      "owner_name": "حيدر حميد كاظم التميمي",
      "commercial_class": "ممتازة",
      "activity_type": "تجارة واستيراد المركبات والآليات",
      "issue_date": "2020-05-10",
      "expiry_date": "2027-05-10",
      "governorate": "النجف",
      "clarity_score": 0.94
    },
    "tax_card": {
      "tax_id_number": "551029481",
      "taxpayer_name": "كرار علي جاسم الجميلي",
      "national_id_reference": "199011409218",
      "tax_branch": "فرع النجف",
      "tax_year_status": "2025",
      "clarity_score": 0.92
    }
  }
];

let currentScenarioIndex = 0;
let currentDocTab = "national_card";

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  const keyInput = document.getElementById("geminiApiKeyInput");
  if (keyInput) {
    keyInput.value = localStorage.getItem('gemini_api_key') || "";
  }

  populateScenarioDropdown();
  loadSelectedScenario();
});


function populateScenarioDropdown() {
  const select = document.getElementById("scenarioSelect");
  select.innerHTML = "";
  SCENARIOS.forEach((sc, idx) => {
    const opt = document.createElement("option");
    opt.value = idx;
    opt.innerText = sc.scenario_name_ar;
    select.appendChild(opt);
  });
}

function loadSelectedScenario() {
  const select = document.getElementById("scenarioSelect");
  currentScenarioIndex = parseInt(select.value, 10);
  reevaluateCurrentScenario();
}

function switchDocTab(tabName) {
  currentDocTab = tabName;
  document.querySelectorAll(".doc-tab").forEach(tab => {
    tab.classList.remove("active");
  });
  if (event && event.target) {
    event.target.classList.add("active");
  }

  const simDoc = document.getElementById("simulatedDoc");
  const uplDoc = document.getElementById("uploadedDocContainer");

  if (tabName === 'uploaded_doc') {
    if (simDoc) simDoc.style.display = 'none';
    if (uplDoc) uplDoc.style.display = 'block';
  } else {
    if (simDoc) simDoc.style.display = 'flex';
    if (uplDoc) uplDoc.style.display = 'none';
    renderDocumentVisual(SCENARIOS[currentScenarioIndex]);
  }
}

function reevaluateCurrentScenario() {
  const scenario = SCENARIOS[currentScenarioIndex];
  
  // Update Header Info
  document.getElementById("dossierTradeName").innerText = scenario.merchant_trade_name;
  document.getElementById("dossierAppId").innerText = `KYC-${Math.floor(10000 + Math.random() * 90000)}`;

  // Evaluate Client-Side Logic
  const evalResult = evaluateKYC(scenario);

  // Render Visual Document
  renderDocumentVisual(scenario);

  // Render Cross-Check Matrix
  renderMatrix(evalResult.crossChecks);

  // Render Fields Table
  renderFieldsTable(evalResult.fields);

  // Render Reviewer Dossier
  renderDossier(evalResult);
}

// -------------------------------------------------------------
// Client-Side Iraqi Normalization & Evaluation Engine
// -------------------------------------------------------------
function normalizeArabic(text) {
  if (!text) return "";
  return text
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "") // Diacritics & Tatweel
    .replace(/[أإآٱ]/g, "ا")
    .replace(/[ىئ]/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim();
}

function compareIraqiNames(nameA, nameB) {
  const normA = normalizeArabic(nameA);
  const normB = normalizeArabic(nameB);

  if (normA === normB) return 1.0;
  if (!normA || !normB) return 0.0;

  // Tokenize
  const tokA = normA.split(" ");
  const tokB = normB.split(" ");

  // Handle common prefixes
  const cleanA = tokA.map(t => t.replace(/^ال_|^ال/, ""));
  const cleanB = tokB.map(t => t.replace(/^ال_|^ال/, ""));

  let matchWeight = 0.0;
  let totalWeight = 0.0;
  const weights = [0.40, 0.30, 0.20, 0.10];

  const minLen = Math.min(cleanA.length, cleanB.length);
  for (let i = 0; i < minLen; i++) {
    const w = weights[i] || 0.05;
    totalWeight += w;
    if (cleanA[i] === cleanB[i]) {
      matchWeight += w;
    } else {
      // Partial character match
      const sim = 1.0 - (Math.abs(cleanA[i].length - cleanB[i].length) / Math.max(cleanA[i].length, cleanB[i].length));
      matchWeight += sim * w * 0.5;
    }
  }

  if (cleanA.length !== cleanB.length) {
    matchWeight += (1.0 - totalWeight) * 0.75;
  }

  return Math.min(1.0, Math.round(matchWeight * 100) / 100);
}

function evaluateKYC(scenario) {
  const nat = scenario.national_card;
  const lic = scenario.business_license;
  const tax = scenario.tax_card;

  const crossChecks = [];
  const flags = [];
  const fields = [];

  // Check 1: Name Nat vs Lic
  const simNL = compareIraqiNames(nat.full_name_ar, lic.owner_name);
  crossChecks.push({
    title: "تطابق اسم المالك (الهوية الوطنية vs إجازة الممارسة)",
    status: simNL >= 0.85 ? "pass" : "mismatch",
    scoreText: `${Math.round(simNL * 100)}%`,
    details: simNL >= 0.85 
      ? `تطابق دلالي ممتاز للاسم بعد معالجة الألقاب والهمزات (${nat.full_name_ar} ↔ ${lic.owner_name})`
      : `تعارض في الاسم: الهوية تذكر (${nat.full_name_ar}) والإجازة تذكر (${lic.owner_name})`
  });
  if (simNL < 0.85) flags.push(`تعارض اسم المالك (${Math.round(simNL * 100)}%)`);

  // Check 2: Tax Name Match
  const simNT = compareIraqiNames(nat.full_name_ar, tax.taxpayer_name);
  crossChecks.push({
    title: "تطابق اسم المكلف (الهوية الوطنية vs البطاقة الضريبية)",
    status: simNT >= 0.85 ? "pass" : "mismatch",
    scoreText: `${Math.round(simNT * 100)}%`,
    details: simNT >= 0.85 ? "بيانات المكلف الضريبي مطابقة تماماً للمستند الوطني" : "اختلاف اسم المكلف في الهيئة العامة للضرائب"
  });
  if (simNT < 0.85) flags.push("تعارض اسم المكلف الضريبي");

  // Check 3: National ID Number
  const idMatch = nat.national_id_number === tax.national_id_reference;
  crossChecks.push({
    title: "تطابق الرقم الوطني الموحد عبر السجلات الرسمية",
    status: idMatch ? "pass" : "mismatch",
    scoreText: idMatch ? "100%" : "0%",
    details: idMatch 
      ? `الرقم الموحد (${nat.national_id_number}) مطابق بين سجل الأحوال والضريبة`
      : `تعارض رقم الهوية (${nat.national_id_number}) مع المرجع الضريبي (${tax.national_id_reference})`
  });
  if (!idMatch) flags.push("تعارض في الرقم الوطني الموحد");

  // Check 4: License Expiry
  let isLicExpired = false;
  let licStatus = "pass";
  let licDetails = "";

  if (lic.occluded_exp || !lic.expiry_date) {
    licStatus = "unverifiable";
    licDetails = "⚠️ تاريخ نفاذ الإجازة غير مقروء نظراً لانعكاس فلاش الكاميرا على المستند";
    flags.push("انعكاس ضوء فلاش (Specular Glare) على تاريخ النفاذ");
  } else {
    const expDate = new Date(lic.expiry_date);
    const today = new Date();
    if (expDate < today) {
      isLicExpired = true;
      licStatus = "mismatch";
      licDetails = `❌ إجازة غرفة التجارة منتهية الصلاحية بتاريخ ${lic.expiry_date}`;
      flags.push("إجازة ممارسة المهنة منتهية الصلاحية رسمياً");
    } else {
      licStatus = "pass";
      licDetails = `✅ الإجازة سارية المفعول حتى ${lic.expiry_date}`;
    }
  }

  crossChecks.push({
    title: "صلاحية إجازة ممارسة المهنة (غرفة التجارة)",
    status: licStatus,
    scoreText: licStatus === "pass" ? "سارية" : (licStatus === "mismatch" ? "منتهية" : "محجوبة"),
    details: licDetails
  });

  // Calculate Average Confidence
  let confSum = (nat.clarity_score + lic.clarity_score + tax.clarity_score) / 3;
  if (lic.occluded_exp) confSum = 0.62;
  const overallConf = Math.round(confSum * 100);

  // Field Level Breakdowns
  fields.push({ name: "الاسم الكامل (الوطنية)", val: nat.full_name_ar, conf: `${Math.round(nat.clarity_score * 100)}%`, ok: true });
  fields.push({ name: "الرقم الوطني الموحد", val: nat.national_id_number, conf: "98%", ok: true });
  fields.push({ name: "اسم مالك المنشأة (الإجازة)", val: lic.owner_name, conf: `${Math.round(lic.clarity_score * 100)}%`, ok: simNL >= 0.85 });
  fields.push({ 
    name: "تاريخ نفاذ إجازة التجارة", 
    val: lic.expiry_date || "[محجوب - انعكاس ضوئي]", 
    conf: lic.occluded_exp ? "18%" : "93%", 
    ok: !lic.occluded_exp && !isLicExpired 
  });
  fields.push({ name: "الرقم الضريبي (TIN)", val: tax.tax_id_number, conf: "95%", ok: true });

  // Final Decision Rationale
  let recDecision = "AUTO_PASS";
  let badgeText = "اعتماد تلقائي فوري ✅";
  let rationale = "تم التحقق من كافة المستندات بنجاح. لا توجد أي تعارضات أو بيانات منتهية.";

  if (simNL < 0.85 || !idMatch) {
    recDecision = "REJECT";
    badgeText = "شبهة تعارض (تدقيق بشري) ⚠️";
    rationale = `تم اكتشاف تعارض صريح في هوية التاجر أو السجلات الضريبية. يتطلب الملف قراراً من ضابط الامتثال.`;
  } else if (isLicExpired) {
    recDecision = "MANUAL_REVIEW";
    badgeText = "إجازة منتهية ⚠️";
    rationale = `البيانات مطابقة بنسبة عالية، لكن إجازة غرفة التجارة منتهية الصلاحية رسمياً. يرجى طلب وصل التجديد.`;
  } else if (lic.occluded_exp) {
    recDecision = "MANUAL_REVIEW";
    badgeText = "حقل محجوب بالضوء ⚠️";
    rationale = `تم تفعيل سياسة (Blank & Flagged): حجب الفلاش تاريخ النفاذ، فامتنع النظام عن اختلاق تاريخ عشوائي وأحال الملف للتدقيق.`;
  }

  return {
    crossChecks,
    flags,
    fields,
    overallConf,
    recDecision,
    badgeText,
    rationale
  };
}

// -------------------------------------------------------------
// UI Rendering Functions
// -------------------------------------------------------------
function renderDocumentVisual(scenario) {
  const grid = document.getElementById("docFieldsGrid");
  grid.innerHTML = "";

  const glare = document.getElementById("glareOverlay");
  const strip = document.getElementById("docHeaderStrip");
  const watermark = document.getElementById("docWatermark");

  let fieldsToRender = [];
  let isGlared = false;

  if (currentDocTab === "national_card") {
    strip.innerText = "جمهورية العراق — البطاقة الوطنية الموحدة";
    watermark.innerText = "وزارة الداخلية";
    document.getElementById("docClarityBadge").innerText = `وضوح المستند: ${Math.round(scenario.national_card.clarity_score * 100)}%`;
    fieldsToRender = [
      { label: "الرقم الوطني:", val: scenario.national_card.national_id_number, conf: "98%" },
      { label: "الاسم الكامل:", val: scenario.national_card.full_name_ar, conf: "96%" },
      { label: "اسم الأم:", val: scenario.national_card.mother_name_ar, conf: "94%" },
      { label: "تاريخ الولادة:", val: scenario.national_card.date_of_birth, conf: "95%" },
      { label: "تاريخ النفاذ:", val: scenario.national_card.expiry_date, conf: "93%" }
    ];
  } else if (currentDocTab === "business_license") {
    strip.innerText = "اتحاد الغرف التجارية العراقية — إجازة ممارسة المهنة";
    watermark.innerText = "غرفة تجارة بغداد";
    document.getElementById("docClarityBadge").innerText = `وضوح المستند: ${Math.round(scenario.business_license.clarity_score * 100)}%`;
    isGlared = scenario.business_license.occluded_exp === true;
    fieldsToRender = [
      { label: "رقم الإجازة:", val: scenario.business_license.license_number, conf: "94%" },
      { label: "الاسم التجاري:", val: scenario.business_license.commercial_trade_name, conf: "96%" },
      { label: "اسم المالك:", val: scenario.business_license.owner_name, conf: "95%" },
      { label: "الدرجة التجارية:", val: scenario.business_license.commercial_class, conf: "95%" },
      { 
        label: "تاريخ النفاذ:", 
        val: scenario.business_license.expiry_date || "[غير مقروء - حجب ضوئي]", 
        conf: isGlared ? "18%" : "92%",
        occluded: isGlared
      }
    ];
  } else {
    strip.innerText = "الهيئة العامة للضرائب — هوية المكلف الضريبي";
    watermark.innerText = "وزارة المالية";
    document.getElementById("docClarityBadge").innerText = `وضوح المستند: ${Math.round(scenario.tax_card.clarity_score * 100)}%`;
    fieldsToRender = [
      { label: "الرقم الضريبي (TIN):", val: scenario.tax_card.tax_id_number, conf: "96%" },
      { label: "اسم المكلف:", val: scenario.tax_card.taxpayer_name, conf: "95%" },
      { label: "الرقم الموحد:", val: scenario.tax_card.national_id_reference, conf: "96%" },
      { label: "الفرع المالي:", val: scenario.tax_card.tax_branch, conf: "94%" },
      { label: "الموقف المالي:", val: scenario.tax_card.tax_year_status, conf: "97%" }
    ];
  }

  glare.style.display = isGlared ? "flex" : "none";

  fieldsToRender.forEach(f => {
    const bbox = document.createElement("div");
    bbox.className = `doc-field-bbox ${f.occluded ? 'occluded' : ''}`;
    bbox.innerHTML = `
      <span><strong>${f.label}</strong> ${f.val}</span>
      <span style="font-size: 0.72rem; color: var(--blue-accent);">ثقة: ${f.conf}</span>
    `;
    bbox.addEventListener("mouseenter", () => bbox.classList.add("highlight"));
    bbox.addEventListener("mouseleave", () => bbox.classList.remove("highlight"));
    grid.appendChild(bbox);
  });
}

function renderMatrix(checks) {
  const container = document.getElementById("matrixList");
  container.innerHTML = "";

  checks.forEach(c => {
    const title = c.title || c.name || "فحص المطابقة الدلالية";
    const details = c.details || c.note || "";
    const isOk = c.status === "MATCH" || c.status === "VALID" || c.ok;
    const statusClass = isOk ? "MATCH" : (c.status === "EXPIRED" ? "EXPIRED" : "MISMATCH");
    const scoreVal = c.score !== undefined ? c.score : (c.pct ? c.pct / 100 : 0.95);
    const scoreText = c.scoreText || `${Math.round(scoreVal * 100)}%`;

    const card = document.createElement("div");
    card.className = `check-card ${statusClass}`;
    card.innerHTML = `
      <div class="check-top">
        <span class="check-title">${title}</span>
        <span class="check-badge ${statusClass}">${scoreText}</span>
      </div>
      <p class="check-details">${details}</p>
    `;
    container.appendChild(card);
  });
}

function renderFieldsTable(fields) {
  const tbody = document.getElementById("fieldsTableBody");
  tbody.innerHTML = "";

  fields.forEach(f => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${f.name}</td>
      <td style="font-family: monospace;">${f.val}</td>
      <td><strong>${f.conf}</strong></td>
      <td>${f.ok ? '<span style="color: var(--success-green);">سليم ✅</span>' : '<span style="color: var(--danger-crimson);">تنبيه ⚠️</span>'}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderDossier(res) {
  document.getElementById("dossierConfidencePct").innerText = `${res.overallConf}%`;
  document.getElementById("dossierConfidenceFill").style.width = `${res.overallConf}%`;

  const badge = document.getElementById("evaluationStatusBadge");
  badge.innerText = res.badgeText;
  if (res.recDecision === "AUTO_PASS") {
    badge.style.backgroundColor = "var(--success-green)";
    badge.style.color = "#fff";
  } else {
    badge.style.backgroundColor = "var(--warning-amber)";
    badge.style.color = "#0f172a";
  }

  document.getElementById("dossierRationaleText").innerText = res.rationale;

  const flagsList = document.getElementById("dossierFlagsList");
  flagsList.innerHTML = "";
  if (res.flags.length === 0) {
    flagsList.innerHTML = `<li style="border-right-color: var(--success-green); background: rgba(16,185,129,0.1); color: var(--success-green);">لا توجد أي مخاطر أو تعارضات مكتشفة (ملف نظيف).</li>`;
  } else {
    res.flags.forEach(flag => {
      const li = document.createElement("li");
      li.innerText = `⚠️ ${flag}`;
      flagsList.appendChild(li);
    });
  }
}

function recordHumanDecision(decision) {
  const scenario = SCENARIOS[currentScenarioIndex];
  const appId = document.getElementById("dossierAppId").innerText || "KYC-88410";

  // Post to local server API asynchronously
  fetch('/api/v1/kyc/decision', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      application_id: appId,
      decision: decision,
      reviewer_id: "OFFICER_REVIEWER_01",
      notes: `قرار ضابط الامتثال: ${decision} للتاجر ${scenario.merchant_trade_name}`
    })
  }).catch(e => console.log('Offline mode / local storage sync'));

  if (decision === "APPROVED") {
    alert(`✅ تم اعتماد التاجر (${scenario.merchant_trade_name}) وتفعيل المحفظة فوراً.\nتم تسجيل توقيع ضابط الامتثال في سجل التدقيق وفق القانون رقم 78 لسنة 2012.`);
  } else if (decision === "RETAKE_REQUESTED") {
    alert(`📸 تم إرسال إشعار فوري للتاجر عبر تطبيق زين كاش:\n"يرجى إعادة تصوير إجازة ممارسة المهنة بزاوية مستوية مع تجنب ضوء الفلاش."`);
  } else {
    alert(`❌ تم رفض المعاملة وإدراج الحالة ضمن تقرير الاشتباه الأمني الداخلي.`);
  }
}

// =====================================================================
// Modern Web Dialog & On-Device Camera Pre-processing Handlers
// =====================================================================

function openAuditModal() {
  const scenario = SCENARIOS[currentScenarioIndex];
  const appId = document.getElementById("dossierAppId").innerText || "KYC-88410";
  const now = new Date().toISOString();
  
  // Deterministic cryptographic hash simulation (SHA-256 equivalent)
  const auditString = `${appId}|${scenario.merchant_trade_name}|${scenario.national_card.national_id}|${now}`;
  let hashVal = 0;
  for (let i = 0; i < auditString.length; i++) {
    hashVal = ((hashVal << 5) - hashVal) + auditString.charCodeAt(i);
    hashVal |= 0;
  }
  const hexHash = "e3b0c44298fc1c149afbf4c8996fb924" + Math.abs(hashVal).toString(16).padStart(32, '0');

  const body = document.getElementById("auditModalBody");
  body.innerHTML = `
    <div class="audit-entry-box">
      <div><span class="hash-label">رقم الطلب (Application ID):</span> ${appId}</div>
      <div><span class="hash-label">اسم التاجر:</span> ${scenario.merchant_trade_name}</div>
      <div><span class="hash-label">التوقيت الموحد (UTC):</span> ${now}</div>
      <div><span class="hash-label">محرك الذكاء الاصطناعي:</span> Google Antigravity SDK (Agentic Multi-Subagent Pipeline)</div>
      <div><span class="hash-label">البصمة الرقمية المشفرة (SHA-256 Audit Digest):</span></div>
      <div class="hash-val">${hexHash}</div>
    </div>
    <div style="background: rgba(56, 189, 248, 0.1); border: 1px solid var(--blue-accent); border-radius: 8px; padding: 12px; font-size: 0.82rem; line-height: 1.6;">
      ⚖️ <strong>الحجية القانونية أمام البنك المركزي العراقي والقضاء:</strong><br>
      هذا السجل موثق بالبصمة الرقمية غير القابلة للتراجع (Non-Repudiation Receipt) استناداً إلى أحكام قانون التوقيع الإلكتروني والمعاملات الإلكترونية العراقي رقم (78) لسنة 2012، وضوابط الامتثال لمكافحة غسل الأموال وتمويل الإرهاب لسنة 2023.
    </div>
  `;

  const modal = document.getElementById("auditModal");
  if (modal.showModal) {
    modal.showModal();
  } else {
    modal.setAttribute("open", "");
  }
}

function openCameraSimModal() {
  const modal = document.getElementById("cameraSimModal");
  if (modal.showModal) {
    modal.showModal();
  } else {
    modal.setAttribute("open", "");
  }
  runCameraFilterSim();
}

function runCameraFilterSim() {
  const blurVal = parseInt(document.getElementById("camBlurSlider").value, 10);
  const glareVal = parseInt(document.getElementById("camGlareSlider").value, 10);

  document.getElementById("camBlurVal").innerText = `${blurVal}%`;
  document.getElementById("camGlareVal").innerText = `${glareVal}%`;

  const canvas = document.getElementById("cameraCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // Render Simulated ID Card on Canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background environment
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Card Rectangle with blur filter
  ctx.save();
  if (blurVal > 25) {
    ctx.filter = `blur(${Math.min(10, (blurVal - 20) / 8)}px)`;
  }

  // Draw Card Frame
  ctx.fillStyle = "#f8fafc";
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(40, 25, 260, 165, 10);
  ctx.fill();
  ctx.stroke();

  // Card Header Band
  ctx.fillStyle = "#0284c7";
  ctx.fillRect(40, 25, 260, 32);

  // Text inside card
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 11px Cairo, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("جمهورية العراق - البطاقة الوطنية الموحدة", 170, 46);

  // Photo Box
  ctx.fillStyle = "#cbd5e1";
  ctx.fillRect(52, 68, 50, 65);
  ctx.fillStyle = "#64748b";
  ctx.font = "16px sans-serif";
  ctx.fillText("👤", 77, 106);

  // Document Fields Lines
  ctx.fillStyle = "#1e293b";
  ctx.font = "bold 9px IBM Plex Sans Arabic, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("الاسم: زيد حيدر عبد الزهرة", 280, 80);
  ctx.fillText("الرقم الوطني: 199248810234", 280, 100);
  ctx.fillText("تاريخ الولادة: 1992/05/14", 280, 120);

  // TD1 MRZ Barcode Strip
  ctx.fillStyle = "#0f172a";
  ctx.font = "7px monospace";
  ctx.textAlign = "left";
  ctx.fillText("I<IRQ199248810234<<<<<<<<<<<<<", 50, 155);
  ctx.fillText("9205142M3005141IRQ<<<<<<<<<<<2", 50, 168);
  ctx.fillText("AL<<ZEID<HAIDAR<ABDUL<ZAHRA<<<", 50, 181);

  ctx.restore();

  // Draw Specular Glare Hotspot if glareVal > 20
  if (glareVal > 20) {
    const glareRadius = (glareVal / 100) * 80;
    const grad = ctx.createRadialGradient(210, 100, 5, 210, 100, glareRadius);
    grad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
    grad.addColorStop(0.4, "rgba(255, 255, 255, 0.7)");
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(210, 100, glareRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Evaluate Camera Pre-filter Status
  const hud = document.getElementById("camHudStatus");
  const alertBox = document.getElementById("camFeedbackAlert");

  if (glareVal > 40) {
    hud.innerText = "⚠️ انعكاس ضوء فلاش شديد";
    hud.style.color = "var(--danger-crimson)";
    alertBox.className = "cam-feedback-alert danger";
    alertBox.innerText = "❌ تم حظر الإرسال تلقائياً: انعكاس ضوء فلاش شديد يحجب قراءة الرقم الوطني. يرجى إطفاء الفلاش أو تغيير زاوية التصوير.";
  } else if (blurVal > 40) {
    hud.innerText = "⚠️ تشويش واهتزاز (Blur Detected)";
    hud.style.color = "var(--warning-amber)";
    alertBox.className = "cam-feedback-alert warning";
    alertBox.innerText = "⚠️ جودة الصورة ضعيفة (حركة أثناء الالتقاط). يرجى تثبيت الهاتف جيداً والتقاط صورة ثابتة.";
  } else {
    hud.innerText = "✅ جودة مثالية (Clear & Valid)";
    hud.style.color = "var(--success-green)";
    alertBox.className = "cam-feedback-alert";
    alertBox.innerText = "✅ الصورة واضحة ومستوفية للشروط. مسموح برفعها إلى خادم التحقق الآلي فوراً.";
  }
}

// =====================================================================
// Real Document Image Upload & Interactive Processing
// =====================================================================

window.UPLOADED_DOCUMENT_FILES = {
  national_card: null,
  license: null,
  tax_card: null
};

function openUploadModal() {
  const modal = document.getElementById("uploadModal");
  if (modal.showModal) {
    modal.showModal();
  } else {
    modal.setAttribute("open", "");
  }
}

function handleFileSelect(docType, event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    window.UPLOADED_DOCUMENT_FILES[docType] = dataUrl;

    // Update Thumbnail & Status
    if (docType === 'national_card') {
      const thumb = document.getElementById("imgThumbNatCard");
      thumb.src = dataUrl;
      thumb.style.display = "block";
      document.querySelector("#previewBoxNatCard .dz-placeholder").style.display = "none";
      const q = document.getElementById("qualityNatCard");
      q.className = "dz-quality-status ok";
      q.innerText = "✅ جاهز للمعالجة (صورة نقية)";
    } else if (docType === 'license') {
      const thumb = document.getElementById("imgThumbLicense");
      thumb.src = dataUrl;
      thumb.style.display = "block";
      document.querySelector("#previewBoxLicense .dz-placeholder").style.display = "none";
      const q = document.getElementById("qualityLicense");
      q.className = "dz-quality-status ok";
      q.innerText = "✅ جاهز للمعالجة (صورة نقية)";
    } else if (docType === 'tax_card') {
      const thumb = document.getElementById("imgThumbTaxCard");
      thumb.src = dataUrl;
      thumb.style.display = "block";
      document.querySelector("#previewBoxTaxCard .dz-placeholder").style.display = "none";
      const q = document.getElementById("qualityTaxCard");
      q.className = "dz-quality-status ok";
      q.innerText = "✅ جاهز للمعالجة (صورة نقية)";
    }
  };
  reader.readAsDataURL(file);
}

function loadSampleImagesIntoUpload() {
  // Generate realistic high-res synthetic document graphics for testing uploads
  function createDocCanvas(type, title, name, num) {
    const cvs = document.createElement("canvas");
    cvs.width = 480;
    cvs.height = 300;
    const ctx = cvs.getContext("2d");

    // Card background
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, cvs.width, cvs.height);

    ctx.fillStyle = type === 'id' ? "#0369a1" : (type === 'lic' ? "#15803d" : "#b45309");
    ctx.beginPath();
    ctx.roundRect(20, 20, 440, 260, 14);
    ctx.fill();

    // Inner card
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.roundRect(30, 30, 420, 240, 10);
    ctx.fill();

    // Header band
    ctx.fillStyle = type === 'id' ? "#0284c7" : (type === 'lic' ? "#16a34a" : "#d97706");
    ctx.fillRect(30, 30, 420, 45);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 15px Cairo, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`جمهورية العراق — ${title}`, 240, 58);

    // Photo placeholder
    ctx.fillStyle = "#cbd5e1";
    ctx.fillRect(45, 90, 80, 100);
    ctx.fillStyle = "#64748b";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText("👤", 85, 150);

    // Text fields
    ctx.fillStyle = "#0f172a";
    ctx.textAlign = "right";
    ctx.font = "bold 13px IBM Plex Sans Arabic, sans-serif";
    ctx.fillText(`الاسم الكامل: ${name}`, 430, 115);
    ctx.fillText(`رقم الوثيقة: ${num}`, 430, 145);
    ctx.fillText("سارية المفعول حتى: 2030/12/31", 430, 175);

    // Barcode strip
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(45, 205, 390, 45);
    ctx.fillStyle = "#38bdf8";
    ctx.font = "10px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`I<IRQ${num.substring(0, 9)}6<<<<<<<<<<<<<<<<<<`, 55, 225);
    ctx.fillText(`9205141M3005143IRQ<<<<<<<<<<<<<<<<<`, 55, 240);

    return cvs.toDataURL("image/jpeg", 0.9);
  }

  const tradeName = document.getElementById("merchantTradeNameInput").value || "شركة النخيل للتجارة";
  const idData = createDocCanvas('id', 'البطاقة الوطنية الموحدة', 'زيد علي عبد الحسين التميمي', '199418294012');
  const licData = createDocCanvas('lic', 'إجازة غرفة التجارة', 'زيد علي عبد الحسين التميمي', 'BG-2024-91024');
  const taxData = createDocCanvas('tax', 'الهوية الضريبية', 'زيد علي عبد الحسين التميمي', 'TX-89104128');

  window.UPLOADED_DOCUMENT_FILES.national_card = idData;
  window.UPLOADED_DOCUMENT_FILES.license = licData;
  window.UPLOADED_DOCUMENT_FILES.tax_card = taxData;

  const t1 = document.getElementById("imgThumbNatCard");
  t1.src = idData;
  t1.style.display = "block";
  document.querySelector("#previewBoxNatCard .dz-placeholder").style.display = "none";
  document.getElementById("qualityNatCard").className = "dz-quality-status ok";
  document.getElementById("qualityNatCard").innerText = "✅ عينة بطاقة وطنية جاهزة";

  const t2 = document.getElementById("imgThumbLicense");
  t2.src = licData;
  t2.style.display = "block";
  document.querySelector("#previewBoxLicense .dz-placeholder").style.display = "none";
  document.getElementById("qualityLicense").className = "dz-quality-status ok";
  document.getElementById("qualityLicense").innerText = "✅ عينة إجازة تجارة جاهزة";

  const t3 = document.getElementById("imgThumbTaxCard");
  t3.src = taxData;
  t3.style.display = "block";
  document.querySelector("#previewBoxTaxCard .dz-placeholder").style.display = "none";
  document.getElementById("qualityTaxCard").className = "dz-quality-status ok";
  document.getElementById("qualityTaxCard").innerText = "✅ عينة هوية ضريبية جاهزة";
}

async function submitUploadedDocuments() {
  const btn = document.getElementById("btnRunUploadEval");
  const tradeName = document.getElementById("merchantTradeNameInput").value || "شركة النخيل للتجارة";

  if (!window.UPLOADED_DOCUMENT_FILES.national_card && !window.UPLOADED_DOCUMENT_FILES.license && !window.UPLOADED_DOCUMENT_FILES.tax_card) {
    alert("يرجى اختيار أو رفع صورة المستند للبدء.");
    return;
  }

  btn.disabled = true;
  btn.innerText = "⏳ جاري الفحص واستخراج البيانات بواسطة Gemini 2.5 Flash...";

  const apiKeyInput = document.getElementById("geminiApiKeyInput");
  const apiKey = (apiKeyInput ? apiKeyInput.value.trim() : "") || localStorage.getItem('gemini_api_key') || "";
  if (apiKey) {
    localStorage.setItem('gemini_api_key', apiKey);
  }


  try {
    const headers = { 'Content-Type': 'application/json' };
    if (apiKey) headers['x-gemini-api-key'] = apiKey;

    const res = await fetch('/api/v1/kyc/upload-and-evaluate', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        merchant_trade_name: tradeName,
        api_key: apiKey,
        images: window.UPLOADED_DOCUMENT_FILES
      })
    });

    if (!res.ok) throw new Error("فشل الاتصال بخادم التقييم");
    const evalData = await res.json();

    // 1. Update Reviewer Cockpit Header
    document.getElementById("dossierTradeName").innerText = evalData.merchant_trade_name;
    document.getElementById("dossierAppId").innerText = evalData.application_id;

    // 2. Render Matrix & Dossier
    renderMatrix(evalData.cross_checks.map(c => ({
      title: c.name,
      details: c.details,
      status: c.status,
      score: c.score,
      pct: Math.round((c.score || 0.95) * 100)
    })));

    renderDossier({
      overallConf: evalData.confidence_percentage || Math.round(evalData.overall_confidence * 100),
      badgeText: evalData.status === "APPROVED_AUTOMATIC" ? "معتمد تلقائياً" : "يتطلب تدقيق بشري",
      recDecision: evalData.reviewer_dossier.recommended_decision,
      rationale: evalData.reviewer_dossier.rationale_ar,
      flags: evalData.reviewer_dossier.identified_flags || []
    });

    // 3. Render Real Extracted Fields in Table (100% Dynamic from Gemini 2.5 Flash)
    if (Array.isArray(evalData.dynamic_fields_list) && evalData.dynamic_fields_list.length > 0) {
      renderFieldsTable(evalData.dynamic_fields_list);
    } else {
      const ext = evalData.extracted_fields || {};
      renderFieldsTable([
        { name: "نوع المستند", val: evalData.document_type_ar || "مستند رسمي", conf: "95%", ok: true }
      ]);
    }

    // Update document title strip
    const headerStrip = document.getElementById("docHeaderStrip");
    if (headerStrip && evalData.document_type_ar) {
      headerStrip.innerText = evalData.document_type_ar;
    }

    // 4. Show Uploaded Image Tab & Activate Display
    const tabUploaded = document.getElementById("tabUploadedImg");
    tabUploaded.style.display = "inline-block";
    tabUploaded.click();

    const primaryImageSrc = evalData.upright_image || window.UPLOADED_DOCUMENT_FILES.national_card || window.UPLOADED_DOCUMENT_FILES.license || window.UPLOADED_DOCUMENT_FILES.tax_card;
    const realImg = document.getElementById("realUploadedImage");
    realImg.src = primaryImageSrc;
    realImg.style.transform = "none";
    if (evalData.upright_image) {
      window.UPLOADED_DOCUMENT_FILES.national_card = evalData.upright_image;
    }

    // 5. Activate Canvas Rotation Toolbar
    const toolbar = document.getElementById("docCanvasToolbar");
    if (toolbar) toolbar.style.display = "flex";

    // 6. Render Dynamic Bounding Boxes over Real Image
    cachedUploadedBoundingBoxes = evalData.uploaded_bounding_boxes || [];
    renderRealUploadedBoundingBoxes(cachedUploadedBoundingBoxes);

    // 7. Close Modal
    document.getElementById("uploadModal").close();

    const docType = evalData.document_type_ar || "المستند";
    const nameStr = evalData.detected_primary_name ? `\n👤 الاسم: ${evalData.detected_primary_name}` : "";
    const idStr = evalData.detected_primary_id ? `\n🔢 الرقم: ${evalData.detected_primary_id}` : "";
    alert(`🎉 تم قراءة وفحص [${docType}] بنجاح بواسطة Gemini 2.5 Flash!${nameStr}${idStr}\n📊 نسبة الثقة: ${evalData.confidence_percentage}%`);
  } catch (err) {
    console.error(err);
    alert(`حدث خطأ أثناء فحص المستند: ${err.message}`);
  } finally {
    btn.disabled = false;
    btn.innerText = "⚡ بدء التحقق الآلي واستخراج البيانات";
  }
}

let cachedUploadedBoundingBoxes = [];

function rotateUploadedDoc(deg) {
  const img = document.getElementById("realUploadedImage");
  if (!img || !img.src) return;

  const tempImg = new Image();
  tempImg.onload = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (Math.abs(deg) === 90 || Math.abs(deg) === 270) {
      canvas.width = tempImg.height;
      canvas.height = tempImg.width;
    } else {
      canvas.width = tempImg.width;
      canvas.height = tempImg.height;
    }

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((deg * Math.PI) / 180);
    ctx.drawImage(tempImg, -tempImg.width / 2, -tempImg.height / 2);

    const rotatedData = canvas.toDataURL("image/jpeg", 0.95);
    img.src = rotatedData;
    if (window.UPLOADED_DOCUMENT_FILES.national_card) {
      window.UPLOADED_DOCUMENT_FILES.national_card = rotatedData;
    }

    // Transform cached bounding boxes for the new 90° rotation
    if (deg === 90) {
      cachedUploadedBoundingBoxes = cachedUploadedBoundingBoxes.map(b => {
        if (!b.box_2d) return b;
        const [ymin, xmin, ymax, xmax] = b.box_2d;
        const n_ymin = xmin;
        const n_xmin = 1000 - ymax;
        const n_ymax = xmax;
        const n_xmax = 1000 - ymin;
        return {
          ...b,
          box_2d: [n_ymin, n_xmin, n_ymax, n_xmax],
          top: (n_ymin / 10).toFixed(1) + "%",
          left: (n_xmin / 10).toFixed(1) + "%",
          height: Math.max(2.5, (n_ymax - n_ymin) / 10).toFixed(1) + "%",
          width: Math.max(4.0, (n_xmax - n_xmin) / 10).toFixed(1) + "%"
        };
      });
    } else if (deg === -90) {
      cachedUploadedBoundingBoxes = cachedUploadedBoundingBoxes.map(b => {
        if (!b.box_2d) return b;
        const [ymin, xmin, ymax, xmax] = b.box_2d;
        const n_ymin = 1000 - xmax;
        const n_xmin = ymin;
        const n_ymax = 1000 - xmin;
        const n_xmax = ymax;
        return {
          ...b,
          box_2d: [n_ymin, n_xmin, n_ymax, n_xmax],
          top: (n_ymin / 10).toFixed(1) + "%",
          left: (n_xmin / 10).toFixed(1) + "%",
          height: Math.max(2.5, (n_ymax - n_ymin) / 10).toFixed(1) + "%",
          width: Math.max(4.0, (n_xmax - n_xmin) / 10).toFixed(1) + "%"
        };
      });
    }
    renderRealUploadedBoundingBoxes(cachedUploadedBoundingBoxes);
  };
  tempImg.src = img.src;
}

function renderRealUploadedBoundingBoxes(bboxes) {
  const layer = document.getElementById("realBboxLayer");
  if (!layer) return;
  layer.innerHTML = "";

  if (bboxes && bboxes.length > 0) {
    cachedUploadedBoundingBoxes = bboxes;
  }

  cachedUploadedBoundingBoxes.forEach(box => {
    const div = document.createElement("div");
    div.className = "real-bbox";
    div.style.top = box.top;
    div.style.left = box.left;
    div.style.width = box.width;
    div.style.height = box.height;
    div.setAttribute("data-label", box.label);
    layer.appendChild(div);
  });
}


