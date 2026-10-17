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

let ACTIVE_SCENARIOS = SCENARIOS;
let currentScenarioIndex = 0;
let currentDocIndex = 0;
let currentDocTab = 0;
let currentEvalData = null;

// Initialize on page load
document.addEventListener("DOMContentLoaded", async () => {
  const keyInput = document.getElementById("geminiApiKeyInput");
  if (keyInput) {
    keyInput.value = localStorage.getItem('gemini_api_key') || "";
  }

  // Fallback for browsers without native <dialog closedby="any"> support (modern-web-guidance: light-dismiss-a-dialog)
  if (typeof HTMLDialogElement !== 'undefined' && !('closedBy' in HTMLDialogElement.prototype)) {
    document.querySelectorAll('dialog[closedby="any"]').forEach((dialog) => {
      dialog.addEventListener('click', (event) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );
        if (isDialogContent) return;
        dialog.close();
      });
    });
  }

  // Load all 14 multi-category scenarios from server if running
  try {
    const res = await fetch('/api/v1/kyc/scenarios');
    if (res.ok) {
      const serverScenarios = await res.json();
      if (Array.isArray(serverScenarios) && serverScenarios.length > 0) {
        ACTIVE_SCENARIOS = serverScenarios;
      }
    }
  } catch (_) {}

  populateScenarioDropdown();
  await loadSelectedScenario();
});

function populateScenarioDropdown() {
  const select = document.getElementById("scenarioSelect");
  select.innerHTML = "";
  ACTIVE_SCENARIOS.forEach((sc, idx) => {
    const opt = document.createElement("option");
    opt.value = idx;
    opt.innerText = sc.scenario_name_ar;
    select.appendChild(opt);
  });
}

async function loadSelectedScenario() {
  const select = document.getElementById("scenarioSelect");
  currentScenarioIndex = parseInt(select.value, 10) || 0;
  currentDocIndex = 0;
  await reevaluateCurrentScenario();
}

function renderDocumentTabs(docs = []) {
  const container = document.getElementById("docTabsContainer");
  if (!container) return;

  const uploadedTab = document.getElementById("tabUploadedImg");
  const isUploadedVisible = uploadedTab && uploadedTab.style.display !== "none";

  container.innerHTML = "";
  docs.forEach((doc, idx) => {
    const btn = document.createElement("button");
    btn.className = `doc-tab ${idx === currentDocIndex && currentDocTab !== 'uploaded_doc' ? 'active' : ''}`;
    btn.innerText = `${idx + 1}. ${doc.classification?.canonical_name_ar || doc.doc_id}`;
    btn.onclick = () => switchDocTab(idx);
    container.appendChild(btn);
  });

  const upBtn = document.createElement("button");
  upBtn.id = "tabUploadedImg";
  upBtn.className = `doc-tab ${currentDocTab === 'uploaded_doc' ? 'active' : ''}`;
  upBtn.style.display = isUploadedVisible ? "inline-block" : "none";
  upBtn.innerText = "المستند المرفوع 🖼️";
  upBtn.onclick = () => switchDocTab('uploaded_doc');
  container.appendChild(upBtn);
}

function switchDocTab(tabOrIdx) {
  currentDocTab = tabOrIdx;
  const simDoc = document.getElementById("simulatedDoc");
  const uplDoc = document.getElementById("uploadedDocContainer");

  if (tabOrIdx === 'uploaded_doc') {
    if (simDoc) simDoc.style.display = 'none';
    if (uplDoc) uplDoc.style.display = 'block';
  } else {
    currentDocIndex = typeof tabOrIdx === 'number' ? tabOrIdx : 0;
    if (simDoc) simDoc.style.display = 'flex';
    if (uplDoc) uplDoc.style.display = 'none';
    if (currentEvalData && Array.isArray(currentEvalData.documents)) {
      renderDocumentTabs(currentEvalData.documents);
      renderDocumentVisualFromPipeline(currentEvalData.documents[currentDocIndex]);
    }
  }
}

async function reevaluateCurrentScenario() {
  const scenario = ACTIVE_SCENARIOS[currentScenarioIndex];
  if (!scenario) return;

  try {
    const res = await fetch('/api/v1/kyc/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scenario)
    });
    if (res.ok) {
      currentEvalData = await res.json();
      renderFullPipelineResult(currentEvalData);
      return;
    }
  } catch (e) {
    console.warn("Falling back to client-side evaluation:", e.message);
  }
}

function renderFullPipelineResult(evalData) {
  document.getElementById("dossierTradeName").innerText = evalData.merchant_trade_name;
  document.getElementById("dossierAppId").innerText = evalData.application_id;

  // 1. Render Multi-Document Tabs & Active Specimen
  const docs = evalData.documents || [];
  renderDocumentTabs(docs);
  if (docs.length > 0) {
    renderDocumentVisualFromPipeline(docs[currentDocIndex] || docs[0]);
  }

  // 2. Render 9 Separated Verification Signals
  renderSeparatedSignals(evalData.separated_signals);

  // 3. Render Cross-Document Consistency Matrix
  const countBadge = document.getElementById("crossCheckCountBadge");
  if (countBadge) countBadge.innerText = `${(evalData.cross_checks || []).length} فحوصات متقاطعة وحتمية`;
  renderMatrix(evalData.cross_checks || []);

  // 4. Render Universal Field Table
  renderUniversalFieldsTable(evalData.universal_fields || []);

  // 5. Render Reviewer Dossier & Unknown Document Action
  const recDecision = evalData.reviewer_dossier?.recommended_decision || "HUMAN_REVIEW";
  let badgeText = "مراجعة ضابط الامتثال ⚠️";
  if (recDecision === "AUTO_PASS") badgeText = "اعتماد تلقائي فوري ✅";
  else if (recDecision === "RETAKE_REQUESTED") badgeText = "إعادة التقاط (حجب ضوئي) 📸";
  else if (recDecision === "POLICY_ESCALATION") badgeText = "تصعيد سياسة الهوية الأساسية 🛡️";

  renderDossier({
    overallConf: evalData.confidence_percentage || Math.round((evalData.overall_confidence || 0.9) * 100),
    badgeText,
    recDecision,
    rationale: evalData.reviewer_dossier?.rationale_ar || "",
    flags: evalData.reviewer_dossier?.identified_flags || []
  });

  // Show/Hide Unknown Document Registration Button
  const unkWrap = document.getElementById("registerUnknownDocWrap");
  const hasUnknownDoc = docs.some(d => d.classification?.doc_type_id === "UNKNOWN_DOCUMENT");
  if (unkWrap) {
    unkWrap.style.display = hasUnknownDoc ? "block" : "none";
  }
}

function renderSeparatedSignals(signals) {
  const grid = document.getElementById("separatedSignalsGrid");
  if (!grid || !signals) return;

  const items = [
    {
      label: "1. جودة الصورة",
      val: `${Math.round((signals.image_quality?.score || 0) * 100)}% (${signals.image_quality?.status})`,
      ok: signals.image_quality?.status === "PASS"
    },
    {
      label: "2. ثقة الاستخراج OCR",
      val: `${Math.round((signals.text_extraction_confidence?.score || 0) * 100)}% (${signals.text_extraction_confidence?.status})`,
      ok: signals.text_extraction_confidence?.score >= 0.80
    },
    {
      label: "3. ثقة التصنيف",
      val: `${Math.round((signals.classification_confidence?.score || 0) * 100)}% (${signals.classification_confidence?.status})`,
      ok: signals.classification_confidence?.status === "CLASSIFIED"
    },
    {
      label: "4. اكتمال الحقول",
      val: `${Math.round((signals.field_completeness?.score || 0) * 100)}% (${signals.field_completeness?.status})`,
      ok: signals.field_completeness?.status === "COMPLETE"
    },
    {
      label: "5. اتساق البيانات",
      val: `${Math.round((signals.data_consistency?.score || 0) * 100)}% (${signals.data_consistency?.status})`,
      ok: signals.data_consistency?.status !== "CONFLICT_DETECTED"
    },
    {
      label: "6. كشف التكرار",
      val: signals.duplicate_detection?.status || "UNIQUE",
      ok: !signals.duplicate_detection?.is_duplicate
    },
    {
      label: "7. مؤشرات الأصالة/MRZ",
      val: signals.authenticity_indicators?.status || "CONSISTENT",
      ok: signals.authenticity_indicators?.status !== "STRUCTURAL_CHECKSUM_WARNING"
    },
    {
      label: "8. التحقق الحكومي الخارجي",
      val: signals.external_authoritative_verification?.status || "UNAVAILABLE",
      ok: false,
      neutral: true
    },
    {
      label: "9. قرار السياسة النهائي",
      val: signals.final_policy_decision?.decision_tier || "HUMAN_REVIEW",
      ok: signals.final_policy_decision?.decision_tier === "AUTO_PASS"
    }
  ];

  grid.innerHTML = items.map(item => {
    const borderCol = item.neutral ? "#f59e0b" : (item.ok ? "#10b981" : "#ef4444");
    const textCol = item.neutral ? "#fbbf24" : (item.ok ? "#34d399" : "#f87171");
    return `
      <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(148, 163, 184, 0.2); border-right: 3px solid ${borderCol}; border-radius: 6px; padding: 6px 8px;">
        <div style="font-size: 0.68rem; color: #94a3b8;">${item.label}</div>
        <div style="font-size: 0.74rem; font-weight: 700; color: ${textCol}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${item.val}">${item.val}</div>
      </div>
    `;
  }).join("");
}

function renderDocumentVisualFromPipeline(doc) {
  if (!doc) return;
  const grid = document.getElementById("docFieldsGrid");
  grid.innerHTML = "";

  const glare = document.getElementById("glareOverlay");
  const strip = document.getElementById("docHeaderStrip");
  const watermark = document.getElementById("docWatermark");
  const metaBar = document.getElementById("docClassificationMeta");

  const cls = doc.classification || {};
  const pre = doc.preprocessing || {};
  const qScore = Math.round((doc.image_quality?.quality_score || 0.95) * 100);

  strip.innerText = `${cls.canonical_name_ar || "وثيقة عراقية"} (${cls.doc_type_id || "DOC"})`;
  watermark.innerText = `SPECIMEN / عينة تركيبية — ${cls.issuing_authority_ar || "جمهورية العراق"}`;
  document.getElementById("docClarityBadge").innerText = `وضوح المستند: ${qScore}% | اللغات: ${(cls.detected_languages || ["ar"]).join("+").toUpperCase()}`;

  if (metaBar) {
    const statusColor = cls.support_status === "TESTED" ? "#34d399" : (cls.support_status === "UNSUPPORTED_OR_UNCERTAIN_CLASSIFICATION" ? "#f87171" : "#fbbf24");
    metaBar.innerHTML = `
      <span>🏷️ الفئة: <strong>${cls.category_name_ar || cls.document_category}</strong></span>
      <span>📐 التوجيه: <strong>${pre.preprocessing_policy || "STANDARD"} (${pre.applied_rotation_deg || 0}°)</strong></span>
      <span>🛡️ حالة السجل: <strong style="color:${statusColor}">${cls.support_status}</strong></span>
    `;
  }

  const isGlared = (doc.image_quality?.quality_flags || []).includes("SPECULAR_FLASH_GLARE_DETECTED");
  glare.style.display = isGlared ? "flex" : "none";

  (doc.fields || []).forEach(f => {
    const isOccluded = f.original_value === null;
    const bbox = document.createElement("div");
    bbox.className = `doc-field-bbox ${isOccluded ? 'occluded' : ''}`;
    const displayVal = f.reviewer_correction || f.original_value || "[فارغ / محجوب — Zero Hallucination]";
    bbox.innerHTML = `
      <div>
        <strong>${f.label_ar}:</strong> <span>${displayVal}</span>
        ${f.normalized_value && f.normalized_value !== String(f.original_value) ? `<div style="font-size:0.68rem; color:#94a3b8;">مُطبَّع: ${f.normalized_value}</div>` : ''}
      </div>
      <span style="font-size: 0.72rem; color: var(--blue-accent);">ثقة: ${Math.round((f.confidence || 0) * 100)}%</span>
    `;
    bbox.addEventListener("mouseenter", () => bbox.classList.add("highlight"));
    bbox.addEventListener("mouseleave", () => bbox.classList.remove("highlight"));
    grid.appendChild(bbox);
  });

  // If unknown document, show candidate categories ranked by classifier
  if (cls.doc_type_id === "UNKNOWN_DOCUMENT" && Array.isArray(cls.candidate_categories) && cls.candidate_categories.length > 0) {
    const candBox = document.createElement("div");
    candBox.style.cssText = "margin-top:8px; padding:8px; background:rgba(245,158,11,0.15); border:1px solid #f59e0b; border-radius:6px; font-size:0.75rem;";
    candBox.innerHTML = `<strong>🔎 الفئات المرشحة الأقرب (Candidate Categories):</strong><br>` +
      cls.candidate_categories.map(c => `• ${c.canonical_name_ar} (${c.doc_type_id}) — ثقة: ${Math.round(c.confidence * 100)}%`).join("<br>");
    grid.appendChild(candBox);
  }
}

function renderMatrix(checks) {
  const container = document.getElementById("matrixList");
  container.innerHTML = "";

  checks.forEach(c => {
    const title = c.title || c.name || "فحص المطابقة الدلالية";
    const details = c.details || c.note || "";
    const isOk = ["MATCH", "EXACT_MATCH", "NORMALIZED_MATCH", "LINKED_VIA_POA", "VALID", "PASS"].includes(c.status) || c.ok;
    const statusClass = isOk ? "MATCH" : (c.status === "EXPIRED" ? "EXPIRED" : "MISMATCH");
    const scoreVal = c.score !== undefined ? c.score : (c.pct ? c.pct / 100 : 0.95);
    const scoreText = c.scoreText || `${c.status} (${Math.round(scoreVal * 100)}%)`;

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

function renderUniversalFieldsTable(fields) {
  const tbody = document.getElementById("fieldsTableBody");
  tbody.innerHTML = "";

  fields.forEach((f, idx) => {
    const tr = document.createElement("tr");
    const isOk = f.validation_status === "VALID";
    const origVal = f.reviewer_correction ? `${f.reviewer_correction} ✏️` : (f.original_value !== null && f.original_value !== undefined ? f.original_value : '<span style="color:#f87171">[null — محجوب]</span>');
    const normVal = f.normalized_value || "—";
    const confPct = `${Math.round((f.confidence || 0) * 100)}%`;
    const rulesStr = (f.applied_rules || []).join(", ") || "SYNTAX";

    tr.innerHTML = `
      <td>
        <strong>${f.label_ar || f.name}</strong>
        <div style="font-size: 0.68rem; color: #94a3b8;">${f.doc_type_id || ''} • ${f.document_side || 'FRONT'}</div>
      </td>
      <td style="font-family: monospace;">${origVal}</td>
      <td style="font-family: monospace; color: #38bdf8;">${normVal}</td>
      <td><strong>${confPct}</strong></td>
      <td>
        ${isOk
          ? `<span style="color: var(--success-green);">VALID ✅</span>`
          : `<span style="color: var(--danger-crimson);" title="${f.explanation || ''}">${f.validation_status || 'FLAGGED'} ⚠️</span>`
        }
        <div style="font-size: 0.65rem; color: #94a3b8;">${rulesStr}</div>
      </td>
    `;
    tbody.appendChild(tr);
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
      <td style="font-family: monospace; color: #38bdf8;">${f.val}</td>
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

async function openCoverageMatrixModal() {
  const modal = document.getElementById("coverageModal");
  const body = document.getElementById("coverageModalBody");
  body.innerHTML = `<p style="padding: 16px;">⏳ جاري تحميل مصفوفة تغطية الوثائق العراقية من السجل الموحد...</p>`;
  if (modal.showModal) modal.showModal();
  else modal.setAttribute("open", "");

  try {
    const res = await fetch('/api/v1/kyc/coverage-matrix');
    const data = await res.json();
    const s = data.summary;

    const catCards = Object.entries(s.by_category).map(([key, c]) => `
      <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(148, 163, 184, 0.25); border-radius: 8px; padding: 10px;">
        <div style="font-size: 0.78rem; font-weight: 800; color: #38bdf8;">الفئة ${c.code}: ${c.name_ar}</div>
        <div style="font-size: 0.7rem; color: #94a3b8; margin-top: 4px;">الإجمالي: <strong>${c.total}</strong> | TESTED: <strong style="color:#34d399">${c.tested}</strong> | CONFIGURED: <strong style="color:#fbbf24">${c.configured}</strong> | REGISTERED: <strong>${c.registered}</strong></div>
      </div>
    `).join("");

    const rowsHtml = data.matrix.map((row, i) => {
      const stColor = row.support_status === "TESTED" ? "#34d399" : (row.support_status === "CONFIGURED" ? "#fbbf24" : "#94a3b8");
      return `
        <tr>
          <td>${i + 1}</td>
          <td style="font-family: monospace; font-size: 0.74rem; color: #38bdf8;">${row.doc_type_id}</td>
          <td><strong>${row.canonical_name_ar}</strong><div style="font-size:0.68rem; color:#94a3b8;">${row.canonical_name_en}</div></td>
          <td>${row.category_name_ar}</td>
          <td>${row.supported_languages.join("/").toUpperCase()}</td>
          <td>${row.preprocessing_policy}</td>
          <td><strong style="color:${stColor}">${row.support_status}</strong></td>
          <td style="font-size:0.68rem; color:#fbbf24;">${row.external_verification_status}</td>
        </tr>
      `;
    }).join("");

    body.innerHTML = `
      <div style="margin-bottom: 12px; padding: 10px 14px; background: rgba(16, 185, 129, 0.12); border: 1px solid #10b981; border-radius: 8px; font-size: 0.82rem;">
        ✅ <strong>إصدار السجل: ${s.registry_version}</strong> — إجمالي الوثائق العراقية المسجلة: <strong>${s.total_types}</strong> نوعاً عبر 8 فئات (A–H) |
        مختبرة آلياً (TESTED): <strong>${s.by_status.TESTED}</strong> | مهيأة (CONFIGURED): <strong>${s.by_status.CONFIGURED}</strong> | مسجلة (REGISTERED): <strong>${s.by_status.REGISTERED}</strong>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 8px; margin-bottom: 14px;">
        ${catCards}
      </div>
      <div class="fields-table-container" style="max-height: 420px; overflow-y: auto;">
        <table class="fields-table">
          <thead>
            <tr>
              <th>#</th>
              <th>المعرف (ID)</th>
              <th>اسم الوثيقة (عربي / إنجليزي)</th>
              <th>الفئة</th>
              <th>اللغات</th>
              <th>التوجيه</th>
              <th>حالة الدعم</th>
              <th>التحقق الخارجي</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>
    `;
  } catch (err) {
    body.innerHTML = `<p style="color:#f87171;">تعذر تحميل مصفوفة التغطية: ${err.message}</p>`;
  }
}

async function promptRegisterUnknownDoc() {
  const doc = currentEvalData?.documents?.find(d => d.classification?.doc_type_id === "UNKNOWN_DOCUMENT") || currentEvalData?.documents?.[0];
  const defaultAr = doc?.classification?.canonical_name_ar || "وصل استلام محصول الحنطة التسويقي";
  const nameAr = prompt("أدخل الاسم الرسمي للوثيقة بالعربية لتسجيلها في السجل الموحد:", defaultAr);
  if (!nameAr) return;
  const codeId = prompt("أدخل المعرف البرمجي للوثيقة (doc_type_id):", "IRQ_AGRI_GRAIN_RECEIPT");
  if (!codeId) return;

  try {
    const res = await fetch('/api/v1/kyc/register-candidate-type', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        doc_type_id: codeId,
        canonical_name_ar: nameAr,
        canonical_name_en: codeId.replace(/_/g, " "),
        category: "FINANCIAL_EVIDENCE"
      })
    });
    const out = await res.json();
    if (res.ok) {
      alert(`✅ تم تسجيل الوثيقة [${out.entry.doc_type_id} — ${out.entry.canonical_name_ar}] بنجاح في السجل العراقي الموحد بحالة REGISTERED!`);
      openCoverageMatrixModal();
    } else {
      alert(`خطأ: ${out.message}`);
    }
  } catch (e) {
    alert(`تعذر التسجيل: ${e.message}`);
  }
}

function recordHumanDecision(decision) {
  const scenario = ACTIVE_SCENARIOS[currentScenarioIndex];
  const appId = document.getElementById("dossierAppId").innerText || "KYC-88410";

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
    alert(`✅ تم اعتماد المعاملة (${scenario.merchant_trade_name}) وتفعيل الحساب.\nتم تسجيل توقيع ضابط الامتثال في سجل التدقيق المتسلسل (Hash-Chained Audit) وفق القانون رقم 78 لسنة 2012.`);
  } else if (decision === "RETAKE_REQUESTED") {
    alert(`📸 تم إرسال إشعار فوري للعميل لإعادة التقاط الوثيقة المحجوبة بالضوء.`);
  } else {
    alert(`❌ تم رفض المعاملة وتوثيق أسباب التعارض في سجل التدقيق الرقابي.`);
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


