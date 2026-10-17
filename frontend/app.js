// Mock user profile
let userProfile = {
  name: "حيدر علي السعدي",
  balance: 450000,
  frequentRecipients: ["07701111222", "07802222333"]
};

// Preset scenarios for live demo with judges
const PRESETS = {
  lottery: {
    phone: "07809988776",
    amount: 75000,
    note: "رسوم استلام جائزة السيارة الجيب",
    isNovel: true
  },
  otp: {
    phone: "07501234567",
    amount: 120000,
    note: "تفعيل الحساب كود التأكيد 4491",
    isNovel: true
  },
  safe_acc: {
    phone: "07705544332",
    amount: 380000,
    note: "حساب الأمان المؤقت للتدقيق الأمني",
    isNovel: true
  },
  dinner: {
    phone: "07701111222",
    amount: 25000,
    note: "فلوس العشا البارحة",
    isNovel: false
  }
};

let currentTx = null;
let currentRiskReport = null;
let currentCoaching = null;
let auditLogs = [];

function setPreset(key) {
  const p = PRESETS[key];
  if (!p) return;
  document.getElementById("recipientPhone").value = p.phone;
  document.getElementById("transferAmount").value = p.amount;
  document.getElementById("transferNote").value = p.note;

  const tag = document.getElementById("recipientTag");
  if (p.isNovel) {
    tag.innerText = "⚠️ مستلم جديد (غير مسجل)";
    tag.style.color = "#FBBF24";
  } else {
    tag.innerText = "✅ جهة اتصال معتمدة";
    tag.style.color = "#34D399";
  }
}

async function handleSendClick() {
  const phone = document.getElementById("recipientPhone").value.trim();
  const amount = parseInt(document.getElementById("transferAmount").value, 10);
  const note = document.getElementById("transferNote").value.trim();

  if (!phone || isNaN(amount) || amount <= 0) {
    alert("يرجى إدخال رقم هاتف ومبلغ صحيحين.");
    return;
  }

  if (amount > userProfile.balance) {
    alert("الرصيد المتاح غير كافٍ لإتمام التحويل.");
    return;
  }

  currentTx = {
    sender_id: "usr_haider",
    recipient_msisdn: phone,
    amount_iqd: amount,
    note: note
  };

  // Try calling backend API; if offline, use embedded client-side fallback engine
  let evalResult;
  try {
    const resp = await fetch("http://localhost:8000/api/v1/transfer/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(currentTx)
    });
    if (resp.ok) {
      evalResult = await resp.json();
    } else {
      throw new Error("API returned non-200");
    }
  } catch (err) {
    console.warn("Backend API unreachable. Running embedded client-side risk engine.");
    evalResult = evaluateLocally(currentTx);
  }

  currentRiskReport = evalResult.risk_report;
  currentCoaching = evalResult.coaching;

  if (evalResult.decision === "ALLOW_DIRECT") {
    // Immediate direct execution
    executeApprovedTransfer(currentTx);
  } else {
    // Show Layer 2 Coaching Bottom Sheet
    showBottomSheet(currentRiskReport, currentCoaching);
  }
}

function showBottomSheet(risk, coaching) {
  document.getElementById("riskBadge").innerText = `درجة الخطورة: ${risk.risk_score}/100`;
  
  const archetypeMap = {
    advance_fee_lottery: "احتيال رسوم جوائز",
    fake_support_otp: "سرقة كود OTP والدعم",
    safe_government_account: "حساب أمان وهمي",
    fraudulent_social_merchant: "متجر وهمي غير موثق",
    impersonated_relative: "انتحال صفة قريب",
    default: "اشتباه نمط احتيالي"
  };

  const archetypeName = archetypeMap[risk.breakdown.detected_archetype] || "اشتباه احتيال";
  document.getElementById("archetypeBadge").innerText = archetypeName;

  document.getElementById("coachingMessage").innerText = coaching.coaching_message;
  document.getElementById("scammerMoveText").innerText = coaching.scammer_next_move_warning;

  // Reset consent and friction controls
  document.getElementById("consentCheckbox").checked = false;
  document.getElementById("btnOverride").disabled = true;

  const coolingSection = document.getElementById("coolingOffSection");
  const phraseInput = document.getElementById("confirmationPhraseInput");
  if (phraseInput) phraseInput.value = "";

  if (window.cooldownTimerInterval) {
    clearInterval(window.cooldownTimerInterval);
    window.cooldownTimerInterval = null;
  }

  // Tier 3 Critical Friction Check (Score >= 80)
  if (risk.risk_score >= 80) {
    coolingSection.style.display = "block";
    let timeLeft = 10; // 10s demo mode countdown (in production: 120s)
    const timerElem = document.getElementById("countdownTimer");
    timerElem.innerText = `${timeLeft}s`;
    window.canBypassTimer = false;

    window.cooldownTimerInterval = setInterval(() => {
      timeLeft -= 1;
      timerElem.innerText = `${timeLeft}s`;
      if (timeLeft <= 0) {
        clearInterval(window.cooldownTimerInterval);
        window.cooldownTimerInterval = null;
        window.canBypassTimer = true;
        timerElem.innerText = "انتهت المهلة ✅";
        timerElem.style.color = "#10b981";
        validateOverrideRequirements();
      }
    }, 1000);
  } else {
    coolingSection.style.display = "none";
    window.canBypassTimer = true;
  }

  // Open modal
  document.getElementById("modalOverlay").classList.add("active");
}

function hideBottomSheet() {
  if (window.cooldownTimerInterval) {
    clearInterval(window.cooldownTimerInterval);
    window.cooldownTimerInterval = null;
  }
  document.getElementById("modalOverlay").classList.remove("active");
}

function validateOverrideRequirements() {
  const isChecked = document.getElementById("consentCheckbox").checked;
  const isCritical = currentRiskReport && currentRiskReport.risk_score >= 80;
  
  if (!isChecked) {
    document.getElementById("btnOverride").disabled = true;
    return;
  }

  if (isCritical) {
    const phrase = (document.getElementById("confirmationPhraseInput").value || "").trim();
    const phraseValid = phrase.includes("أتحمل") || phrase.includes("مسؤولية");
    const timerElapsed = window.canBypassTimer === true;
    document.getElementById("btnOverride").disabled = !(phraseValid && timerElapsed);
  } else {
    document.getElementById("btnOverride").disabled = false;
  }
}

function handleUserChoice(choice) {
  hideBottomSheet();

  const isCritical = currentRiskReport && currentRiskReport.risk_score >= 80;
  const auditRecord = {
    id: "CBI-" + Math.floor(Math.random() * 90000 + 10000),
    time: new Date().toLocaleTimeString("ar-IQ"),
    recipient: currentTx.recipient_msisdn,
    amount: currentTx.amount_iqd,
    note: currentTx.note,
    riskScore: currentRiskReport.risk_score,
    archetype: currentRiskReport.breakdown.detected_archetype || "N/A",
    decision: choice === "CANCEL" ? "تم الإلغاء (حماية الأموال)" : (isCritical ? "متابعة مع حجز نقدي (180ث)" : "متابعة على مسؤولية العميل"),
    legalDeclaration: "Law 78/2012 Art 13 Non-Repudiation"
  };

  auditLogs.unshift(auditRecord);
  renderAuditLogs();

  if (choice === "CANCEL") {
    alert("🛡️ تم إلغاء التحويل بنجاح! رصيدك بأمان تام.");
  } else {
    // User insisted on overriding
    userProfile.balance -= currentTx.amount_iqd;
    updateBalanceDisplay();
    if (isCritical) {
      alert("⚠️ تم إتمام التحويل بموجب القانون رقم 78 لسنة 2012 (مسؤولية العميل الكاملة).\n\n🔒 تم تفعيل حجز السحب النقدي المؤقت (3 دقائق) لدى وكلاء الكاش لمنع استلام المحتال للأموال فوراً.");
    } else {
      alert("⚠️ تم تنفيذ التحويل بناءً على طلبك ومسؤوليتك القانونية.");
    }
  }
}

function executeApprovedTransfer(tx) {
  userProfile.balance -= tx.amount_iqd;
  updateBalanceDisplay();

  const auditRecord = {
    id: "AUD-" + Math.floor(Math.random() * 90000 + 10000),
    time: new Date().toLocaleTimeString("ar-IQ"),
    recipient: tx.recipient_msisdn,
    amount: tx.amount_iqd,
    note: tx.note,
    riskScore: currentRiskReport.risk_score,
    archetype: "None",
    decision: "تحويل روتيني معتمد (مباشر)"
  };

  auditLogs.unshift(auditRecord);
  renderAuditLogs();

  alert(`✅ تم تحويل مبلغ ${tx.amount_iqd.toLocaleString()} د.ع بنجاح إلى ${tx.recipient_msisdn}`);
}

function updateBalanceDisplay() {
  document.getElementById("walletBalance").innerText = userProfile.balance.toLocaleString();
}

function toggleAuditDrawer() {
  const drawer = document.getElementById("auditDrawer");
  drawer.classList.toggle("active");
}

function renderAuditLogs() {
  const container = document.getElementById("auditList");
  if (auditLogs.length === 0) {
    container.innerHTML = '<div class="audit-empty">لا توجد عمليات مسجلة بعد.</div>';
    return;
  }

  container.innerHTML = auditLogs.map(log => `
    <div class="audit-item">
      <div style="display:flex; justify-content:space-between; font-weight:700;">
        <span>${log.id} (${log.time})</span>
        <span style="color: ${log.decision.includes('الإلغاء') ? '#34D399' : '#F87171'}">${log.decision}</span>
      </div>
      <div>المستلم: ${log.recipient} | المبلغ: ${log.amount.toLocaleString()} د.ع</div>
      <div>الملاحظة: "${log.note}"</div>
      <div style="color:#94A3B8;">الخطورة: ${log.riskScore}/100 | النمط: ${log.archetype}</div>
    </div>
  `).join("");
}

// Embedded client-side deterministic evaluation fallback
function evaluateLocally(tx) {
  const isNovel = !userProfile.frequentRecipients.includes(tx.recipient_msisdn);
  let score = 0;
  let triggered = [];
  let archetype = "default";

  if (isNovel) {
    score += 25;
    triggered.push("NOVEL_RECIPIENT");
  }

  if (tx.amount_iqd > 50000) {
    score += 25;
    triggered.push("AMOUNT_ANOMALY");
  }

  const note = tx.note.toLowerCase();
  if (note.includes("جائزة") || note.includes("رسوم") || note.includes("سيارة") || note.includes("ربحت")) {
    score += 35;
    archetype = "advance_fee_lottery";
    triggered.push("LOTTERY_SCAM_KEYWORDS");
  } else if (note.includes("كود") || note.includes("رمز") || note.includes("otp") || note.includes("تفعيل")) {
    score += 35;
    archetype = "fake_support_otp";
    triggered.push("OTP_SCAM_KEYWORDS");
  } else if (note.includes("حساب أمان") || note.includes("أمن") || note.includes("تدقيق")) {
    score += 35;
    archetype = "safe_government_account";
    triggered.push("GOV_ACCOUNT_SCAM_KEYWORDS");
  } else if (note.includes("عشا") || note.includes("ماركت") || note.includes("ايجار")) {
    score = Math.max(0, score - 20);
  }

  const finalScore = Math.min(100, score);
  const isSuspicious = finalScore >= 30;

  const advisories = {
    advance_fee_lottery: {
      msg: "حبيبي دير بالك! ماكو أي جهة أو مسابقة رسمية بالعراق تطلب منك تدفع فلوس أو رسوم حتى تستلم جائزة سيارة أو مبالغ نقدية. المحتالين يستخدمون هذا الأسلوب حتى يسحبون فلوسك ويختفون.",
      move: "المحتال راح يضغط عليك ويكلك: 'الفرصة تروح إذا ما تحول خلال ربع ساعة'."
    },
    fake_support_otp: {
      msg: "تحذير أمني عاجل: موظفو زين كاش الحقيقيون لا يطلبون أبداً رمز الـ OTP أو كود التأكيد أو تحويل أموال لحسابات شخصية لتفعيل المحفظة. أي شخص يطلب هذا هو محتال بنسبة 100%.",
      move: "راح يهددك بإلغاء حسابك أو تجميد خطك إذا ما تنطيه الرمز فوراً."
    },
    safe_government_account: {
      msg: "تنبيه هام: لا توجد أي جهة قضائية أو أمنية في العراق تمتلك 'حسابات أمان' على أرقام هواتف شخصية. تحويل أموالك بحجة التحقيق أو التدقيق الأمني هو عملية احتيال واضحة.",
      move: "راح يحذرك ويطلب منك ما تغلق الخط ولا تسولف وية أهلك بحجة إن القضية سرية."
    },
    default: {
      msg: "تنبيه أمان: أنت تقوم بتحويل مبلغ غير معتاد لشخص غير مسجل لديك. يرجى التأكد من هوية الشخص قبل إتمام التحويل.",
      move: "المحتالون دائماً يستغلون الاستعجال ويطلبون تحويلاً فورياً."
    }
  };

  const adv = advisories[archetype] || advisories.default;

  return {
    decision: isSuspicious ? "INTERVENE_COACHING" : "ALLOW_DIRECT",
    risk_report: {
      is_suspicious: isSuspicious,
      risk_score: finalScore,
      severity: finalScore >= 60 ? "HIGH" : (finalScore >= 30 ? "MEDIUM" : "LOW"),
      breakdown: {
        detected_archetype: archetype,
        triggered_rules: triggered
      }
    },
    coaching: {
      coaching_message: adv.msg,
      scam_archetype_detected: archetype,
      scammer_next_move_warning: adv.move,
      recommended_action: "cancel"
    }
  };
}
