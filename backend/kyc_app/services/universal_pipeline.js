/**
 * Project Rostro (روسترو) — Universal Iraqi Document Processing Pipeline
 * =====================================================================
 * Implements the 10-Stage Shared Processing Architecture driven by the
 * Universal Iraqi Document Registry:
 *   Upload → Quality Gate → Classification → Preprocessing → Extraction
 *   → Normalization → Validation → Risk Assessment → Decision Routing → Audit
 *
 * Strictly separates the 9 independent verification signals:
 *   1. image_quality
 *   2. text_extraction_confidence
 *   3. classification_confidence
 *   4. field_completeness
 *   5. data_consistency
 *   6. duplicate_detection
 *   7. authenticity_indicators
 *   8. external_authoritative_verification
 *   9. final_policy_decision
 */

const crypto = require("crypto");
const {
  DOCUMENT_CATEGORIES,
  getAllDocumentTypes,
  getDocumentTypeById
} = require("../registry/iraqi_document_registry");

// ============================================================================
// 1. MULTI-SCRIPT & DIALECT NORMALIZER (ARABIC, KURDISH SORANI, LATIN, DATES)
// ============================================================================
class IraqiMultiScriptNormalizer {
  static COMPOUND_PREFIXES = [
    "عبد", "نور", "ضياء", "علاء", "سيف", "تقي", "شمس", "جمال",
    "محي", "بهاء", "صلاح", "حسام", "عز", "سعد", "فخر", "زين"
  ];

  static HONORIFICS = [
    // Arabic bureaucratic, religious & tribal titles
    "الشيخ", "شيخ", "الحاج", "حاج", "السيد", "سيد", "الدكتور", "دكتور", "د",
    "المحامي", "المهندس", "مهندس", "الاستاذ", "استاذ", "القاضي", "الفريق", "اللواء", "العميد",
    // Kurdish Sorani honorifics
    "کاک", "كاك", "كاكه", "كاكة", "کاکە", "مامۆستا", "ماموستا", "شێخ", "حاجی", "دکتۆر"
  ];

  static KURDISH_TO_ARABIC_PHONETIC_MAP = [
    [/ێ/g, "ي"],
    [/ۆ/g, "و"],
    [/ڕ/g, "ر"],
    [/ڵ/g, "ل"],
    [/ڤ/g, "ف"],
    [/پ/g, "ب"],
    [/چ/g, "ج"],
    [/ژ/g, "ز"],
    [/گ/g, "ك"],
    [/ک/g, "ك"],
    [/ی/g, "ي"],
    [/ە/g, "ه"],
    [/ھ/g, "ه"],
    [/ئ/g, "ا"]
  ];

  static KRG_CITY_EQUIVALENTS = {
    "هەولێر": "اربيل",
    "هولير": "اربيل",
    "أربيل": "اربيل",
    "اربيل": "اربيل",
    "erbil": "اربيل",
    "hawler": "اربيل",
    "سلێمانی": "السليمانيه",
    "سليمانيه": "السليمانيه",
    "السليمانية": "السليمانيه",
    "sulaymaniyah": "السليمانيه",
    "دهۆک": "دهوك",
    "دهوك": "دهوك",
    "duhok": "دهوك",
    "هەڵەبجە": "حلبجه",
    "حلبجة": "حلبجه",
    "halabja": "حلبجه",
    "بغداد": "بغداد",
    "baghdad": "بغداد",
    "البصرة": "البصره",
    "البصره": "البصره",
    "basra": "البصره",
    "نينوى": "نينوي",
    "الموصل": "نينوي"
  };

  /**
   * Converts Eastern Arabic-Indic (٠-٩) and Persian/Kurdish (۰-۹) numerals to ASCII 0-9.
   */
  static normalizeDigits(text) {
    if (text === null || text === undefined) return "";
    let str = String(text);
    const arabicIndic = "٠١٢٣٤٥٦٧٨٩";
    const easternIndic = "۰۱۲۳۴۵۶۷۸۹";
    for (let i = 0; i < 10; i++) {
      str = str.replace(new RegExp(arabicIndic[i], "g"), String(i));
      str = str.replace(new RegExp(easternIndic[i], "g"), String(i));
    }
    return str;
  }

  /**
   * Normalizes Arabic and Kurdish Sorani script into a canonical comparison form.
   */
  static normalizeArabicAndKurdish(text) {
    if (text === null || text === undefined) return "";
    let str = this.normalizeDigits(text);

    // Strip Tashkeel (diacritics) and Tatweel (kashida)
    str = str.replace(/[\u064B-\u065F\u0670\u0640]/g, "");

    // Apply Kurdish Sorani to Arabic phonetic normalization
    for (const [pattern, replacement] of this.KURDISH_TO_ARABIC_PHONETIC_MAP) {
      str = str.replace(pattern, replacement);
    }

    // Unify Arabic Hamzas and endings
    str = str.replace(/[أإآٱ]/g, "ا");
    str = str.replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/ؤ/g, "و");

    // Clean punctuation & collapse whitespace
    str = str.replace(/[.,،؛:/\\\-_()"'«»]/g, " ");
    return str.replace(/\s+/g, " ").trim();
  }

  static normalizeGovernorateOrCity(text) {
    if (!text) return "";
    const raw = String(text).trim().toLowerCase();
    if (this.KRG_CITY_EQUIVALENTS[raw]) return this.KRG_CITY_EQUIVALENTS[raw];
    const norm = this.normalizeArabicAndKurdish(text);
    if (this.KRG_CITY_EQUIVALENTS[norm]) return this.KRG_CITY_EQUIVALENTS[norm];
    for (const [key, val] of Object.entries(this.KRG_CITY_EQUIVALENTS)) {
      if (norm.includes(key) || raw.includes(key)) return val;
    }
    return norm;
  }

  /**
   * Parses diverse Iraqi & international date formats into ISO YYYY-MM-DD:
   * - ISO: "2028-05-14"
   * - Iraqi Slash/Dash DD/MM/YYYY: "14/05/2028" or "14-05-2028"
   * - YYYY/MM/DD: "2028/05/14"
   * - Arabic-Indic digits: "٢٠٢٨/٠٥/١٤" or "١٤/٠٥/٢٠٢٨"
   * - Hijri dates: "1445/08/15 هـ" -> marked as HIJRI calendar
   */
  static parseAndNormalizeDate(rawDate) {
    if (!rawDate) return { iso: null, calendar: "UNKNOWN", is_valid: false };
    const digitStr = this.normalizeDigits(rawDate).trim();

    // Detect Hijri dates (years 1300..1500 or explicit هـ)
    const hijriMatch = digitStr.match(/\b(13\d{2}|14\d{2})\b/) || digitStr.includes("هـ");
    if (hijriMatch) {
      return {
        iso: digitStr,
        calendar: "HIJRI",
        is_valid: true,
        raw_normalized: digitStr
      };
    }

    // Pattern 1: YYYY-MM-DD or YYYY/MM/DD
    let m = digitStr.match(/^(\d{4})[\-\/.](0?[1-9]|1[0-2])[\-\/.](0?[1-9]|[12]\d|3[01])$/);
    if (m) {
      const y = parseInt(m[1], 10);
      const mo = String(m[2]).padStart(2, "0");
      const d = String(m[3]).padStart(2, "0");
      const iso = `${y}-${mo}-${d}`;
      const dt = new Date(`${iso}T00:00:00Z`);
      const valid = !isNaN(dt.getTime()) && dt.getUTCMonth() + 1 === parseInt(mo, 10) && dt.getUTCDate() === parseInt(d, 10);
      return { iso: valid ? iso : null, calendar: "GREGORIAN", is_valid: valid, date_obj: valid ? dt : null };
    }

    // Pattern 2: DD/MM/YYYY or DD-MM-YYYY (Common across Iraqi ministries)
    m = digitStr.match(/^(0?[1-9]|[12]\d|3[01])[\-\/.](0?[1-9]|1[0-2])[\-\/.](\d{4})$/);
    if (m) {
      const d = String(m[1]).padStart(2, "0");
      const mo = String(m[2]).padStart(2, "0");
      const y = parseInt(m[3], 10);
      const iso = `${y}-${mo}-${d}`;
      const dt = new Date(`${iso}T00:00:00Z`);
      const valid = !isNaN(dt.getTime()) && dt.getUTCMonth() + 1 === parseInt(mo, 10) && dt.getUTCDate() === parseInt(d, 10);
      return { iso: valid ? iso : null, calendar: "GREGORIAN", is_valid: valid, date_obj: valid ? dt : null };
    }

    return { iso: null, calendar: "GREGORIAN", is_valid: false };
  }

  /**
   * Tokenizes an Iraqi / Kurdish / Latin personal name, stripping honorifics
   * and binding compound religious/patronymic names (e.g., عبد الزهرة -> عبد_الزهره).
   */
  static tokenizePersonName(fullName) {
    if (!fullName) return [];
    const norm = this.normalizeArabicAndKurdish(fullName).toLowerCase();
    const rawTokens = norm.split(/\s+/).filter(Boolean);

    // Strip honorific titles and prefixes like "بن" / "بنت"
    const filtered = rawTokens.filter(t => !this.HONORIFICS.includes(t) && t !== "بن" && t !== "بنت");

    const boundTokens = [];
    let i = 0;
    while (i < filtered.length) {
      const curr = filtered[i];
      if (this.COMPOUND_PREFIXES.includes(curr) && i + 1 < filtered.length) {
        boundTokens.push(`${curr}_${filtered[i + 1]}`);
        i += 2;
      } else if (curr === "ال" && i + 1 < filtered.length) {
        boundTokens.push(`ال${filtered[i + 1]}`);
        i += 2;
      } else {
        boundTokens.push(curr);
        i++;
      }
    }
    return boundTokens;
  }

  static levenshteinDistance(s1, s2) {
    const m = s1.length;
    const n = s2.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      }
    }
    return dp[m][n];
  }

  static tokenSimilarity(t1, t2) {
    if (t1 === t2) return 1.0;
    // Strip definite article "ال" for tribal surname comparison (e.g. الشمري vs شمري)
    const c1 = t1.replace(/^ال/, "");
    const c2 = t2.replace(/^ال/, "");
    if (c1 === c2 && c1.length >= 3) return 0.98;

    const maxLen = Math.max(c1.length, c2.length);
    if (maxLen === 0) return 1.0;
    const dist = this.levenshteinDistance(c1, c2);
    return Math.max(0, 1.0 - dist / maxLen);
  }

  /**
   * Reconciles two personal names across Iraqi/Kurdish documents.
   * Distinguishes:
   *   - EXACT_MATCH      (raw strings identical)
   *   - NORMALIZED_MATCH (score >= 0.92 after normalization/honorific stripping)
   *   - PROBABLE_MATCH   (0.78 <= score < 0.92, e.g. omitted grandfather/tribal token or household father match)
   *   - CONFLICT         (score < 0.78)
   */
  static comparePersonNames(nameA, nameB, options = {}) {
    if (!nameA || !nameB) {
      return { status: "UNAVAILABLE", score: 0.0, explanation: "Missing name on one or both documents." };
    }

    const rawA = String(nameA).trim();
    const rawB = String(nameB).trim();
    const tokensA = this.tokenizePersonName(rawA);
    const tokensB = this.tokenizePersonName(rawB);

    if (tokensA.length === 0 || tokensB.length === 0) {
      return { status: "UNAVAILABLE", score: 0.0, explanation: "Name tokens empty after normalization." };
    }

    if (rawA === rawB) {
      return {
        status: "EXACT_MATCH",
        score: 1.0,
        tokens_a: tokensA,
        tokens_b: tokensB,
        explanation: "Exact character-for-character match across documents."
      };
    }

    // Standard 4-part Iraqi patronymic positional weighting: Given (0.35), Father (0.35), Grandfather (0.15), Clan/Tribe (0.15)
    const weights = [0.35, 0.35, 0.15, 0.15];
    const minTokens = Math.min(tokensA.length, tokensB.length, 4);
    let weightedSum = 0;
    let totalWeight = 0;

    for (let k = 0; k < minTokens; k++) {
      const w = weights[k];
      const sim = this.tokenSimilarity(tokensA[k], tokensB[k]);
      weightedSum += sim * w;
      totalWeight += w;
    }

    // Also check if last token (tribal surname) matches when one name omits the 3rd token
    if (tokensA.length >= 3 && tokensB.length >= 3 && tokensA.length !== tokensB.length) {
      const lastA = tokensA[tokensA.length - 1];
      const lastB = tokensB[tokensB.length - 1];
      const lastSim = this.tokenSimilarity(lastA, lastB);
      if (lastSim >= 0.90) {
        weightedSum += 0.15 * lastSim;
        totalWeight += 0.15;
      }
    }

    let finalScore = totalWeight > 0 ? weightedSum / totalWeight : 0;

    // Special household check: Applicant's Father+Grandfather matches Head of Family on Residence/Ration Card
    // e.g. Applicant: "علي حسين كاظم الجبوري", Residence Card Head: "حسين كاظم الجبوري" (Applicant's father)
    let isPatronymicHouseholdMatch = false;
    if (finalScore < 0.78 && options.allowPatronymicHousehold && tokensA.length >= 3 && tokensB.length >= 2) {
      const fatherSim = this.tokenSimilarity(tokensA[1], tokensB[0]);
      const grandSim = this.tokenSimilarity(tokensA[2], tokensB[1]);
      if (fatherSim >= 0.90 && grandSim >= 0.90) {
        isPatronymicHouseholdMatch = true;
        finalScore = 0.86;
      }
    }

    finalScore = parseFloat(Math.min(1.0, finalScore).toFixed(4));

    let status = "CONFLICT";
    let explanation = "";
    if (finalScore >= 0.92) {
      status = "NORMALIZED_MATCH";
      explanation = `Normalized onomastic match (${Math.round(finalScore * 100)}%) after script/honorific normalization.`;
    } else if (isPatronymicHouseholdMatch) {
      status = "PROBABLE_MATCH";
      explanation = `Patronymic household lineage match (${Math.round(finalScore * 100)}%): Residence/Household card is registered under applicant's father (${rawB}). Requires reviewer confirmation.`;
    } else if (finalScore >= 0.78) {
      status = "PROBABLE_MATCH";
      explanation = `Partial/probable name match (${Math.round(finalScore * 100)}%): given and father names align, with minor token omission or transliteration drift. Escalated for human confirmation.`;
    } else {
      status = "CONFLICT";
      explanation = `Identity name conflict (${Math.round(finalScore * 100)}% similarity) between "${rawA}" and "${rawB}".`;
    }

    return {
      status,
      score: finalScore,
      is_patronymic_household: isPatronymicHouseholdMatch,
      tokens_a: tokensA,
      tokens_b: tokensB,
      explanation
    };
  }

  /**
   * Normalizes a field value based on the normalizer type configured in the registry.
   */
  static normalizeFieldValue(rawValue, normalizerType) {
    if (rawValue === null || rawValue === undefined || rawValue === "" || rawValue === "[غير واضح]") {
      return null;
    }
    const str = String(rawValue).trim();
    switch (normalizerType) {
      case "DIGITS_ASCII":
        return this.normalizeDigits(str).replace(/\D+/g, "");
      case "ALPHANUM_UPPER":
        return this.normalizeDigits(str).toUpperCase().replace(/\s+/g, "");
      case "LATIN_UPPER":
        return str.toUpperCase().replace(/\s+/g, " ").trim();
      case "DATE_ISO": {
        const parsed = this.parseAndNormalizeDate(str);
        return parsed.iso || this.normalizeDigits(str);
      }
      case "IRAQI_NAME":
      case "KURDISH_ARABIC_NAME":
      case "LATIN_OR_ARABIC_NAME":
        return this.normalizeArabicAndKurdish(str);
      case "KRG_CITY_ALIGN":
        return this.normalizeGovernorateOrCity(str);
      case "IRAQI_ADDRESS_NORM":
      case "KURDISH_ARABIC_TEXT":
      case "ARABIC_TEXT":
        return this.normalizeArabicAndKurdish(str);
      case "MRZ_CLEAN":
        return str.toUpperCase().replace(/\s+/g, "<");
      default:
        return this.normalizeDigits(str);
    }
  }
}

// ============================================================================
// 2. REUSABLE DETERMINISTIC VALIDATORS (ICAO TD1/TD3 MRZ, SYNTAX, DATES, IBAN)
// ============================================================================
class DeterministicValidators {
  static WEIGHTS = [7, 3, 1];

  static mrzCharValue(ch) {
    if (ch >= "0" && ch <= "9") return parseInt(ch, 10);
    if (ch >= "A" && ch <= "Z") return ch.charCodeAt(0) - 55;
    return 0; // '<' filler
  }

  static computeModulo10(str) {
    let sum = 0;
    for (let i = 0; i < str.length; i++) {
      sum += this.mrzCharValue(str[i]) * this.WEIGHTS[i % 3];
    }
    return sum % 10;
  }

  /**
   * Validates 3-line 30-character ICAO Doc 9303 TD1 MRZ (Unified National Card Back).
   * Only executed when TD1 MRZ lines are present on a TD1-configured document.
   */
  static validateTD1MRZ(line1, line2, line3, frontFields = {}) {
    if (!line1 || !line2) {
      return {
        applicable: true,
        mrz_present: false,
        status: "MRZ_NOT_PROVIDED_ON_UPLOAD",
        all_checksums_valid: null,
        front_consistency_match: null,
        explanation: "Back-side TD1 MRZ lines were not included in this capture."
      };
    }

    const l1 = String(line1).toUpperCase().replace(/\s+/g, "<").padEnd(30, "<");
    const l2 = String(line2).toUpperCase().replace(/\s+/g, "<").padEnd(30, "<");
    const l3 = String(line3 || "").toUpperCase().replace(/\s+/g, "<").padEnd(30, "<");

    const issuingState = l1.substring(2, 5).replace(/</g, "");
    const docNum = l1.substring(5, 14);
    const docCheckGiven = l1.charAt(14);
    const docCheckCalc = String(this.computeModulo10(docNum));

    const dob = l2.substring(0, 6);
    const dobCheckGiven = l2.charAt(6);
    const dobCheckCalc = String(this.computeModulo10(dob));

    const exp = l2.substring(8, 14);
    const expCheckGiven = l2.charAt(14);
    const expCheckCalc = String(this.computeModulo10(exp));

    const isDocValid = docCheckGiven === docCheckCalc;
    const isDobValid = dobCheckGiven === dobCheckCalc;
    const isExpValid = expCheckGiven === expCheckCalc;
    const allValid = isDocValid && isDobValid && isExpValid;

    // Cross-check MRZ against front-side fields if available
    const frontChecks = [];
    let frontConsistent = true;
    if (frontFields.date_of_birth) {
      const parsedDob = IraqiMultiScriptNormalizer.parseAndNormalizeDate(frontFields.date_of_birth);
      if (parsedDob.iso) {
        const yymmdd = parsedDob.iso.replace(/-/g, "").substring(2, 8);
        const match = yymmdd === dob;
        if (!match) frontConsistent = false;
        frontChecks.push({ field: "date_of_birth", mrz_val: dob, front_val: yymmdd, match });
      }
    }
    if (frontFields.expiry_date) {
      const parsedExp = IraqiMultiScriptNormalizer.parseAndNormalizeDate(frontFields.expiry_date);
      if (parsedExp.iso) {
        const yymmdd = parsedExp.iso.replace(/-/g, "").substring(2, 8);
        const match = yymmdd === exp;
        if (!match) frontConsistent = false;
        frontChecks.push({ field: "expiry_date", mrz_val: exp, front_val: yymmdd, match });
      }
    }

    return {
      applicable: true,
      mrz_present: true,
      mrz_format: "ICAO_DOC_9303_TD1",
      issuing_state: issuingState,
      all_checksums_valid: allValid,
      front_consistency_match: frontConsistent,
      front_cross_checks: frontChecks,
      doc_number: { raw: docNum.replace(/</g, ""), given_check: docCheckGiven, calc_check: docCheckCalc, is_valid: isDocValid },
      date_of_birth: { raw: dob, given_check: dobCheckGiven, calc_check: dobCheckCalc, is_valid: isDobValid },
      expiry_date: { raw: exp, given_check: expCheckGiven, calc_check: expCheckCalc, is_valid: isExpValid },
      mrz_name_line: l3.replace(/<+/g, " ").trim(),
      explanation: allValid && frontConsistent
        ? "All TD1 Modulo-10 (7-3-1) check digits and front-to-back field comparisons passed."
        : !allValid
        ? "TD1 Modulo-10 check digit mismatch detected (possible OCR misread or altered MRZ)."
        : "Mismatch between back-side MRZ dates and front-side printed dates."
    };
  }

  /**
   * Validates 2-line 44-character ICAO Doc 9303 TD3 MRZ (Iraqi & Foreign Passports).
   */
  static validateTD3MRZ(line1, line2) {
    if (!line1 || !line2) {
      return {
        applicable: true,
        mrz_present: false,
        status: "MRZ_NOT_PROVIDED",
        all_checksums_valid: null,
        explanation: "TD3 passport MRZ lines were not provided."
      };
    }

    const l1 = String(line1).toUpperCase().replace(/\s+/g, "<").padEnd(44, "<");
    const l2 = String(line2).toUpperCase().replace(/\s+/g, "<").padEnd(44, "<");

    const issuingState = l1.substring(2, 5).replace(/</g, "");
    const passNum = l2.substring(0, 9);
    const passCheckGiven = l2.charAt(9);
    const passCheckCalc = String(this.computeModulo10(passNum));

    const nationality = l2.substring(10, 13).replace(/</g, "");
    const dob = l2.substring(13, 19);
    const dobCheckGiven = l2.charAt(19);
    const dobCheckCalc = String(this.computeModulo10(dob));

    const exp = l2.substring(21, 27);
    const expCheckGiven = l2.charAt(27);
    const expCheckCalc = String(this.computeModulo10(exp));

    const isPassValid = passCheckGiven === passCheckCalc;
    const isDobValid = dobCheckGiven === dobCheckCalc;
    const isExpValid = expCheckGiven === expCheckCalc;
    const allValid = isPassValid && isDobValid && isExpValid;

    return {
      applicable: true,
      mrz_present: true,
      mrz_format: "ICAO_DOC_9303_TD3",
      issuing_state: issuingState,
      nationality,
      is_iraqi_issued: issuingState === "IRQ",
      all_checksums_valid: allValid,
      passport_number: { raw: passNum.replace(/</g, ""), given_check: passCheckGiven, calc_check: passCheckCalc, is_valid: isPassValid },
      date_of_birth: { raw: dob, given_check: dobCheckGiven, calc_check: dobCheckCalc, is_valid: isDobValid },
      expiry_date: { raw: exp, given_check: expCheckGiven, calc_check: expCheckCalc, is_valid: isExpValid },
      explanation: allValid
        ? `TD3 Passport MRZ check digits valid (Issuer: ${issuingState}).`
        : "TD3 Passport MRZ check digit failure."
    };
  }

  /**
   * Validates an individual field according to its configured validators list.
   */
  static validateField(fieldSpec, rawValue, normalizedValue, referenceDate = new Date()) {
    if (rawValue === null || rawValue === undefined || rawValue === "" || rawValue === "[غير واضح]") {
      return {
        status: fieldSpec.required ? "UNVERIFIABLE_NULL" : "NOT_APPLICABLE",
        applied_rules: ["ZERO_HALLUCINATION_NULL_POLICY"],
        explanation: fieldSpec.required
          ? `Required field "${fieldSpec.label_en}" is unreadable/missing and left explicitly null.`
          : `Optional field "${fieldSpec.label_en}" is not present.`,
        days_to_expiry: null
      };
    }

    const validators = fieldSpec.validators || [];
    const appliedRules = [];
    const issues = [];
    let daysToExpiry = null;

    for (const vRule of validators) {
      appliedRules.push(vRule);
      switch (vRule) {
        case "VALID_NATIONAL_ID_12": {
          if (!/^(19|20)\d{10}$/.test(normalizedValue)) {
            issues.push(`National ID "${normalizedValue}" does not match 12-digit Iraqi birth-year prefix format (19xx/20xx).`);
          }
          break;
        }
        case "VALID_TAX_ID": {
          if (!/^\d{8,12}$/.test(normalizedValue)) {
            issues.push(`Tax ID "${normalizedValue}" must contain 8 to 12 digits.`);
          }
          break;
        }
        case "VALID_IRAQI_IBAN": {
          if (!/^IQ\d{2}[A-Z0-9]{4}\d{15}$/.test(normalizedValue)) {
            issues.push(`IBAN "${normalizedValue}" does not match the 23-character Central Bank of Iraq IBAN format (IQ + 2 check digits + 4 bank code + 15 digits).`);
          }
          break;
        }
        case "VALID_VIN_17": {
          if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(normalizedValue)) {
            issues.push(`Chassis VIN "${normalizedValue}" does not match standard 17-character automotive VIN format.`);
          }
          break;
        }
        case "VALID_PAST_DATE": {
          const parsed = IraqiMultiScriptNormalizer.parseAndNormalizeDate(rawValue);
          if (!parsed.is_valid) {
            issues.push(`Date "${rawValue}" could not be parsed as a valid calendar date.`);
          } else if (parsed.calendar === "GREGORIAN" && parsed.date_obj > referenceDate) {
            issues.push(`Historical/Issue date "${parsed.iso}" cannot be in the future.`);
          }
          break;
        }
        case "VALID_FUTURE_EXPIRY": {
          const parsed = IraqiMultiScriptNormalizer.parseAndNormalizeDate(rawValue);
          if (!parsed.is_valid) {
            issues.push(`Expiry date "${rawValue}" is malformed.`);
          } else if (parsed.calendar === "GREGORIAN" && parsed.date_obj) {
            daysToExpiry = Math.floor((parsed.date_obj - referenceDate) / (1000 * 60 * 60 * 24));
            if (daysToExpiry < 0) {
              issues.push(`Document expired ${Math.abs(daysToExpiry)} days ago (Expiry: ${parsed.iso}).`);
            }
          }
          break;
        }
        case "NON_IRQ_COUNTRY_CODE": {
          if (normalizedValue === "IRQ") {
            issues.push("Foreign passport schema received Iraqi country code (IRQ); should be routed to IRQ_PASSPORT.");
          }
          break;
        }
        case "VALID_IRAQI_ADDRESS": {
          if (normalizedValue.length < 3) {
            issues.push("Iraqi address string is too short to identify Mahalla/Zukak/Dar or neighborhood.");
          }
          break;
        }
        case "NON_EMPTY_NAME":
        case "NON_EMPTY_TEXT":
        case "NON_EMPTY_ID": {
          if (!normalizedValue || normalizedValue.length < 2) {
            issues.push(`Field "${fieldSpec.label_en}" is too short or empty.`);
          }
          break;
        }
        default:
          break;
      }
    }

    if (issues.length > 0) {
      return {
        status: "INVALID",
        applied_rules: appliedRules,
        explanation: issues.join(" "),
        days_to_expiry: daysToExpiry
      };
    }

    return {
      status: "VALID",
      applied_rules: appliedRules.length > 0 ? appliedRules : ["SYNTAX_CHECK_PASS"],
      explanation: `Field "${fieldSpec.label_en}" passed syntax and domain validation.`,
      days_to_expiry: daysToExpiry
    };
  }
}

// ============================================================================
// 3. UNIVERSAL DOCUMENT CLASSIFIER & UNKNOWN DOCUMENT FALLBACK
// ============================================================================
class UniversalDocumentClassifier {
  /**
   * Examines uploaded document metadata, explicit hints, or OCR text to identify:
   * - Document category, specific doc_type_id, side, languages, issuing authority,
   *   generation, classification confidence, and support status.
   * - Never forces an unknown document into a wrong category; triggers generic fallback.
   */
  static classifyDocument(docInput = {}) {
    const allTypes = getAllDocumentTypes();

    // 1. Check if an explicit registered doc_type_id is provided and valid
    if (docInput.doc_type_id && docInput.doc_type_id !== "AUTO_DETECT" && docInput.doc_type_id !== "UNKNOWN_DOCUMENT") {
      const exactEntry = getDocumentTypeById(docInput.doc_type_id);
      if (exactEntry) {
        const side = this.detectSide(docInput, exactEntry);
        const langs = this.detectLanguages(docInput, exactEntry);
        return {
          is_classified: true,
          is_supported: exactEntry.support_status !== "NOT_SUPPORTED",
          doc_type_id: exactEntry.doc_type_id,
          canonical_name_en: exactEntry.canonical_name_en,
          canonical_name_ar: exactEntry.canonical_name_ar,
          canonical_name_ku: exactEntry.canonical_name_ku,
          document_category: exactEntry.category,
          category_name_ar: DOCUMENT_CATEGORIES[exactEntry.category]?.name_ar,
          document_side: side,
          detected_languages: langs,
          issuing_authority_ar: exactEntry.issuing_authority_ar,
          issuing_authority_en: exactEntry.issuing_authority_en,
          jurisdiction: exactEntry.jurisdiction,
          layout_generation: docInput.layout_generation || exactEntry.supported_generations[0] || "STANDARD",
          classification_confidence: docInput.classification_confidence || 0.96,
          support_status: exactEntry.support_status,
          candidate_categories: [
            {
              doc_type_id: exactEntry.doc_type_id,
              canonical_name_ar: exactEntry.canonical_name_ar,
              canonical_name_en: exactEntry.canonical_name_en,
              category: exactEntry.category,
              confidence: docInput.classification_confidence || 0.96
            }
          ]
        };
      }
    }

    // 2. Score all registered document types based on text cues, headers, and field keys
    const corpusText = IraqiMultiScriptNormalizer.normalizeArabicAndKurdish(
      [
        docInput.document_title,
        docInput.document_type_ar,
        docInput.document_type_en,
        docInput.raw_ocr_text,
        docInput.header_text,
        JSON.stringify(docInput.fields || {})
      ].filter(Boolean).join(" ")
    ).toLowerCase();

    const inputFieldKeys = Object.keys(docInput.fields || {});
    const scoredCandidates = [];

    for (const entry of allTypes) {
      let score = 0;

      // Match aliases and canonical names
      const terms = [
        entry.canonical_name_ar,
        entry.canonical_name_en,
        entry.canonical_name_ku,
        ...(entry.aliases || [])
      ].filter(Boolean);

      for (const term of terms) {
        const normTerm = IraqiMultiScriptNormalizer.normalizeArabicAndKurdish(term).toLowerCase();
        if (normTerm && corpusText.includes(normTerm)) {
          score += 0.55;
          break;
        }
      }

      // Match expected field keys
      const expectedKeys = entry.expected_fields.map(f => f.key);
      let matchedFields = 0;
      for (const k of inputFieldKeys) {
        if (expectedKeys.includes(k)) matchedFields++;
      }
      if (expectedKeys.length > 0 && matchedFields > 0) {
        score += 0.45 * (matchedFields / expectedKeys.length);
      }

      if (score > 0.10) {
        scoredCandidates.push({
          entry,
          score: parseFloat(Math.min(0.98, score).toFixed(3))
        });
      }
    }

    scoredCandidates.sort((a, b) => b.score - a.score);
    const best = scoredCandidates[0];

    // 3. Unknown or Low-Confidence Document Fallback (Mandatory Section 5 Capability)
    if (!best || best.score < 0.65 || docInput.doc_type_id === "UNKNOWN_DOCUMENT") {
      return {
        is_classified: false,
        is_supported: false,
        doc_type_id: "UNKNOWN_DOCUMENT",
        canonical_name_en: docInput.document_title || "Unrecognized / Unconfigured Document",
        canonical_name_ar: docInput.document_type_ar || docInput.document_title || "وثيقة غير مصنفة أو غير مهيأة في السجل",
        canonical_name_ku: "بەڵگەنامەی نەناسراو",
        document_category: "UNKNOWN_CATEGORY",
        category_name_ar: "فئة غير معروفة — تحال للمراجعة البشرية",
        document_side: "UNKNOWN",
        detected_languages: this.detectLanguages(docInput, null),
        issuing_authority_ar: docInput.issuing_authority || "غير محدد — يتطلب تصنيف ضابط الامتثال",
        issuing_authority_en: docInput.issuing_authority || "Unidentified Issuing Authority",
        jurisdiction: "UNKNOWN",
        layout_generation: "UNREGISTERED_LAYOUT",
        classification_confidence: best ? best.score : 0.25,
        support_status: "UNSUPPORTED_OR_UNCERTAIN_CLASSIFICATION",
        candidate_categories: scoredCandidates.slice(0, 3).map(c => ({
          doc_type_id: c.entry.doc_type_id,
          canonical_name_ar: c.entry.canonical_name_ar,
          canonical_name_en: c.entry.canonical_name_en,
          category: c.entry.category,
          confidence: c.score
        }))
      };
    }

    const winner = best.entry;
    return {
      is_classified: true,
      is_supported: winner.support_status !== "NOT_SUPPORTED",
      doc_type_id: winner.doc_type_id,
      canonical_name_en: winner.canonical_name_en,
      canonical_name_ar: winner.canonical_name_ar,
      canonical_name_ku: winner.canonical_name_ku,
      document_category: winner.category,
      category_name_ar: DOCUMENT_CATEGORIES[winner.category]?.name_ar,
      document_side: this.detectSide(docInput, winner),
      detected_languages: this.detectLanguages(docInput, winner),
      issuing_authority_ar: winner.issuing_authority_ar,
      issuing_authority_en: winner.issuing_authority_en,
      jurisdiction: winner.jurisdiction,
      layout_generation: docInput.layout_generation || winner.supported_generations[0] || "STANDARD",
      classification_confidence: best.score,
      support_status: winner.support_status,
      candidate_categories: scoredCandidates.slice(0, 3).map(c => ({
        doc_type_id: c.entry.doc_type_id,
        canonical_name_ar: c.entry.canonical_name_ar,
        canonical_name_en: c.entry.canonical_name_en,
        category: c.entry.category,
        confidence: c.score
      }))
    };
  }

  static detectSide(docInput, registryEntry) {
    if (docInput.document_side) return docInput.document_side;
    const fields = docInput.fields || {};
    if (fields.mrz_line1 && fields.national_id_number) return "FRONT_AND_BACK";
    if (fields.mrz_line1 && !fields.full_name_ar && registryEntry?.doc_type_id === "IRQ_NATIONAL_ID") return "BACK";
    return "FRONT";
  }

  static detectLanguages(docInput, registryEntry) {
    if (Array.isArray(docInput.detected_languages)) return docInput.detected_languages;
    const text = JSON.stringify(docInput.fields || {}) + " " + (docInput.raw_ocr_text || "");
    const langs = new Set();
    if (/[\u0600-\u06FF]/.test(text)) langs.add("ar");
    if (/[ێۆڕڵڤپچژگە]/.test(text) || registryEntry?.jurisdiction === "KRG") langs.add("ku");
    if (/[A-Za-z]{3,}/.test(text)) langs.add("en");
    return langs.size > 0 ? Array.from(langs) : (registryEntry?.supported_languages || ["ar"]);
  }
}

// ============================================================================
// 4. DOCUMENT-SPECIFIC PREPROCESSOR (ORIENTATION & GEOMETRY)
// ============================================================================
class DocumentPreprocessor {
  /**
   * Applies document-specific orientation & geometry rules rather than blindly
   * rotating every portrait image.
   * - ID_CARD_LANDSCAPE: Plastic ID cards have ~1.58:1 aspect ratio. If captured
   *   in portrait (height > width), rotate 270 deg to landscape.
   * - A4_PORTRAIT: Certificates, company registrations, powers of attorney, and
   *   tax clearances are naturally portrait (height > width). Never rotate upright A4s sideways!
   */
  static evaluatePreprocessing(docInput, registryEntry) {
    const policy = registryEntry?.preprocessing_policy || "FLEXIBLE_FORM";
    const width = docInput.image_width || (policy === "A4_PORTRAIT" ? 794 : 1012);
    const height = docInput.image_height || (policy === "A4_PORTRAIT" ? 1123 : 638);
    const exifOrientation = docInput.exif_orientation || 1;

    let appliedRotation = 0;
    let action = "PRESERVED_NATURAL_ORIENTATION";

    if (docInput.rotation_degrees) {
      appliedRotation = (360 - (docInput.rotation_degrees % 360)) % 360;
      action = `CORRECTED_ROTATION_${appliedRotation}_DEG`;
    } else if (exifOrientation === 6) {
      appliedRotation = 90;
      action = "EXIF_ORIENTATION_90_APPLIED";
    } else if (exifOrientation === 8) {
      appliedRotation = 270;
      action = "EXIF_ORIENTATION_270_APPLIED";
    } else if (policy === "ID_CARD_LANDSCAPE" && height > width * 1.1) {
      appliedRotation = 270;
      action = "RECTIFIED_PORTRAIT_CAPTURE_TO_ID_LANDSCAPE";
    } else if (policy === "A4_PORTRAIT" && width > height * 1.15) {
      appliedRotation = 90;
      action = "RECTIFIED_SIDEWAYS_CAPTURE_TO_A4_PORTRAIT";
    }

    return {
      preprocessing_policy: policy,
      original_dimensions: { width, height },
      applied_rotation_deg: appliedRotation,
      action_taken: action
    };
  }
}

// ============================================================================
// 5. UNIVERSAL PIPELINE EXECUTION ENGINE
// ============================================================================
class UniversalKYCPipeline {
  static PROCESSED_FINGERPRINTS = new Map();
  static LAST_AUDIT_HASH = "0000000000000000000000000000000000000000000000000000000000000000";

  /**
   * Converts legacy 3-document scenarios (national_card, business_license, tax_card)
   * into the universal multi-document array format seamlessly.
   */
  static normalizeCaseInput(casePayload) {
    if (Array.isArray(casePayload.documents) && casePayload.documents.length > 0) {
      return casePayload.documents;
    }

    const docs = [];
    if (casePayload.national_card) {
      docs.push({
        doc_id: "DOC-NAT-01",
        doc_type_id: "IRQ_NATIONAL_ID",
        has_glare: Boolean(casePayload.national_card.has_glare),
        has_blur: Boolean(casePayload.national_card.has_blur),
        clarity_score: casePayload.national_card.clarity_score,
        fields: casePayload.national_card
      });
    }
    if (casePayload.residence_card) {
      docs.push({
        doc_id: "DOC-RES-01",
        doc_type_id: "IRQ_RESIDENCE_CARD",
        has_glare: Boolean(casePayload.residence_card.has_glare),
        clarity_score: casePayload.residence_card.clarity_score,
        fields: casePayload.residence_card
      });
    }
    if (casePayload.business_license) {
      docs.push({
        doc_id: "DOC-LIC-01",
        doc_type_id: "IRQ_CHAMBER_COMMERCE",
        has_glare: Boolean(casePayload.business_license.has_glare || casePayload.business_license.occluded_exp),
        clarity_score: casePayload.business_license.clarity_score,
        fields: casePayload.business_license
      });
    }
    if (casePayload.tax_card) {
      docs.push({
        doc_id: "DOC-TAX-01",
        doc_type_id: "IRQ_TAX_CARD",
        has_glare: Boolean(casePayload.tax_card.has_glare),
        clarity_score: casePayload.tax_card.clarity_score,
        fields: casePayload.tax_card
      });
    }
    return docs;
  }

  /**
   * Processes a single document through Stages 1–7 of the Shared Pipeline.
   */
  static processSingleDocument(docInput, index, referenceDate = new Date()) {
    const docId = docInput.doc_id || `DOC-0${index + 1}`;

    // STAGE 1: Quality Gate
    const hasGlare = Boolean(docInput.has_glare || docInput.occluded_exp || docInput.fields?.has_glare || docInput.fields?.occluded_exp);
    const hasBlur = Boolean(docInput.has_blur || docInput.fields?.has_blur);
    const isCutOff = Boolean(docInput.is_cut_off);
    const blurVariance = docInput.blur_variance !== undefined ? docInput.blur_variance : (hasBlur ? 55.0 : 155.0);
    const glarePct = docInput.glare_hotspot_pct !== undefined ? docInput.glare_hotspot_pct : (hasGlare ? 0.11 : 0.01);
    const contrastRatio = docInput.contrast_ratio !== undefined ? docInput.contrast_ratio : 0.89;

    const qualityFlags = [];
    let qualityScore = docInput.clarity_score !== undefined ? docInput.clarity_score : 0.95;
    if (hasGlare || glarePct > 0.06) {
      qualityFlags.push("SPECULAR_FLASH_GLARE_DETECTED");
      qualityScore = Math.min(qualityScore, 0.35);
    }
    if (hasBlur || blurVariance < 80.0) {
      qualityFlags.push("OPTICAL_MOTION_BLUR_DETECTED");
      qualityScore = Math.min(qualityScore, 0.42);
    }
    if (isCutOff) {
      qualityFlags.push("DOCUMENT_BOUNDARY_TRUNCATED");
      qualityScore = Math.min(qualityScore, 0.40);
    }

    const imageQuality = {
      is_acceptable: qualityFlags.length === 0,
      quality_score: parseFloat(qualityScore.toFixed(3)),
      blur_variance: blurVariance,
      glare_hotspot_pct: glarePct,
      contrast_ratio: contrastRatio,
      boundary_complete: !isCutOff,
      quality_flags: qualityFlags
    };

    // STAGE 2: Universal Document Classification
    const classification = UniversalDocumentClassifier.classifyDocument(docInput);
    const registryEntry = getDocumentTypeById(classification.doc_type_id);

    // STAGE 3: Document-Specific Preprocessing
    const preprocessing = DocumentPreprocessor.evaluatePreprocessing(docInput, registryEntry);

    // STAGE 4 & 5: Field Extraction, Normalization & Validation
    const rawFieldsObj = docInput.fields || {};
    const universalFields = [];
    const fieldConfidences = [];
    let requiredCount = 0;
    let presentRequiredCount = 0;
    const missingRequiredFields = [];

    if (registryEntry && classification.is_classified) {
      // Configured Document Schema Extraction
      for (const fieldSpec of registryEntry.expected_fields) {
        if (fieldSpec.required) requiredCount++;

        // Support field aliases in input fixtures (e.g., full_name vs full_name_ar)
        let rawVal = rawFieldsObj[fieldSpec.key];
        if (rawVal === undefined) {
          if (fieldSpec.key === "full_name_ar") rawVal = rawFieldsObj.full_name || rawFieldsObj.name_ar;
          if (fieldSpec.key === "national_id_number") rawVal = rawFieldsObj.national_id;
          if (fieldSpec.key === "owner_name") rawVal = rawFieldsObj.owner_name_ar;
        }

        // Enforce "Blank and flagged beats invented": if glare occludes field or value is null
        const isOccludedField = Boolean(
          rawVal === null ||
          rawVal === "[OCCLUDED]" ||
          (hasGlare && fieldSpec.key === (docInput.occluded_field || "expiry_date"))
        );

        const effectiveOriginal = isOccludedField ? null : (rawVal !== undefined ? rawVal : null);
        const normalizedVal = IraqiMultiScriptNormalizer.normalizeFieldValue(effectiveOriginal, fieldSpec.normalizer);

        if (fieldSpec.required) {
          if (effectiveOriginal !== null && effectiveOriginal !== "") {
            presentRequiredCount++;
          } else {
            missingRequiredFields.push(fieldSpec.key);
          }
        }

        // Compute calibrated per-field confidence
        let fieldConf = (docInput.field_confidences && docInput.field_confidences[fieldSpec.key]) !== undefined
          ? docInput.field_confidences[fieldSpec.key]
          : (effectiveOriginal !== null ? Math.min(0.98, qualityScore * 0.99) : 0.15);

        const uncertaintyFlags = [];
        if (isOccludedField) {
          fieldConf = 0.15;
          uncertaintyFlags.push("OCCLUDED_OR_GLARE_NULLIFIED");
        } else if (effectiveOriginal === null && fieldSpec.required) {
          fieldConf = 0.20;
          uncertaintyFlags.push("REQUIRED_FIELD_MISSING");
        }
        if (hasBlur) uncertaintyFlags.push("BLUR_DEGRADATION");
        if (registryEntry.doc_type_id === "IRQ_RESIDENCE_CARD" || registryEntry.doc_type_id === "IRQ_CIVIL_STATUS_ID") {
          uncertaintyFlags.push("CURSIVE_ARABIC_HANDWRITING_ZONE");
        }

        const validation = DeterministicValidators.validateField(
          fieldSpec,
          effectiveOriginal,
          normalizedVal,
          referenceDate
        );

        if (validation.status === "INVALID") {
          fieldConf = Math.min(fieldConf, 0.45);
          uncertaintyFlags.push("SYNTAX_OR_POLICY_FAILURE");
        }

        if (fieldSpec.required || effectiveOriginal !== null) {
          fieldConfidences.push(fieldConf);
        }

        universalFields.push({
          field_key: fieldSpec.key,
          label_ar: fieldSpec.label_ar,
          label_en: fieldSpec.label_en,
          label_ku: fieldSpec.label_ku,
          original_value: effectiveOriginal,
          normalized_value: normalizedVal,
          field_type: fieldSpec.field_type,
          required: fieldSpec.required,
          source_doc_id: docId,
          doc_type_id: classification.doc_type_id,
          document_side: classification.document_side,
          source_region: (docInput.bounding_boxes && docInput.bounding_boxes[fieldSpec.key]) || [120, 150, 175, 580],
          confidence: parseFloat(fieldConf.toFixed(3)),
          uncertainty_flags: uncertaintyFlags,
          validation_status: validation.status,
          applied_rules: validation.applied_rules,
          explanation: validation.explanation,
          days_to_expiry: validation.days_to_expiry,
          reviewer_correction: docInput.reviewer_corrections?.[fieldSpec.key] || null
        });
      }
    } else {
      // GENERIC FALLBACK EXTRACTION FOR UNSEEN / UNKNOWN DOCUMENTS (Section 5)
      for (const [k, v] of Object.entries(rawFieldsObj)) {
        const normV = IraqiMultiScriptNormalizer.normalizeArabicAndKurdish(v);
        fieldConfidences.push(0.60);
        universalFields.push({
          field_key: k,
          label_ar: `حقل مستخرج عام (${k})`,
          label_en: `Generic Extracted Field (${k})`,
          label_ku: k,
          original_value: v,
          normalized_value: normV,
          field_type: "GENERIC_UNCLASSIFIED_TEXT",
          required: false,
          source_doc_id: docId,
          doc_type_id: "UNKNOWN_DOCUMENT",
          document_side: "UNKNOWN",
          source_region: [100, 100, 200, 600],
          confidence: 0.60,
          uncertainty_flags: ["UNREGISTERED_DOCUMENT_SCHEMA", "REQUIRES_HUMAN_CLASSIFICATION"],
          validation_status: "WARNING",
          applied_rules: ["GENERIC_OCR_FALLBACK"],
          explanation: "Extracted via generic layout fallback; document type is not configured in registry.",
          days_to_expiry: null,
          reviewer_correction: null
        });
      }
    }

    // STAGE 6: Document-Specific Deterministic Rules (Only run rules configured for this type!)
    let mrzValidation = {
      applicable: false,
      status: "NOT_APPLICABLE_FOR_DOCUMENT_TYPE",
      explanation: `MRZ check is not applicable to ${classification.canonical_name_en}.`
    };

    if (registryEntry?.mrz_config?.has_mrz) {
      if (registryEntry.mrz_config.format === "TD1") {
        mrzValidation = DeterministicValidators.validateTD1MRZ(
          rawFieldsObj.mrz_line1,
          rawFieldsObj.mrz_line2,
          rawFieldsObj.mrz_line3,
          rawFieldsObj
        );
      } else if (registryEntry.mrz_config.format === "TD3") {
        mrzValidation = DeterministicValidators.validateTD3MRZ(
          rawFieldsObj.mrz_line1,
          rawFieldsObj.mrz_line2
        );
      }
    }

    const avgExtractionConf = fieldConfidences.length > 0
      ? parseFloat((fieldConfidences.reduce((a, b) => a + b, 0) / fieldConfidences.length).toFixed(3))
      : 0.50;

    const completenessRatio = requiredCount > 0
      ? parseFloat((presentRequiredCount / requiredCount).toFixed(3))
      : (universalFields.length > 0 ? 1.0 : 0.0);

    // Compute perceptual / content hash for duplicate detection
    const canonicalDocFingerprint = crypto
      .createHash("sha256")
      .update(JSON.stringify({ type: classification.doc_type_id, fields: rawFieldsObj, img: docInput.image_hash || "" }))
      .digest("hex");

    return {
      doc_id: docId,
      fingerprint: canonicalDocFingerprint,
      classification,
      preprocessing,
      image_quality: imageQuality,
      text_extraction_confidence: avgExtractionConf,
      field_completeness: {
        required_fields_total: requiredCount,
        required_fields_present: presentRequiredCount,
        completeness_ratio: completenessRatio,
        missing_required_fields: missingRequiredFields
      },
      mrz_validation: mrzValidation,
      fields: universalFields,
      raw_fields: rawFieldsObj
    };
  }

  /**
   * Evaluates an entire multi-document verification case through all 10 pipeline stages.
   */
  static evaluateCase(casePayload = {}) {
    const startTime = Date.now();
    const caseId = casePayload.application_id || casePayload.case_id || `KYC-CASE-${Math.floor(10000 + Math.random() * 90000)}`;
    const referenceDate = casePayload.reference_date ? new Date(casePayload.reference_date) : new Date("2026-10-17T12:00:00Z");

    const rawDocs = this.normalizeCaseInput(casePayload);
    const processedDocs = rawDocs.map((d, idx) => this.processSingleDocument(d, idx, referenceDate));

    // ========================================================================
    // SIGNAL 6: DUPLICATE DETECTION (Within Case & Across Submissions)
    // ========================================================================
    const seenFingerprintsInCase = new Map();
    const seenDocNumbersInCase = new Map();
    const duplicateFlags = [];

    for (const doc of processedDocs) {
      if (seenFingerprintsInCase.has(doc.fingerprint)) {
        duplicateFlags.push({
          doc_id: doc.doc_id,
          duplicate_of: seenFingerprintsInCase.get(doc.fingerprint),
          type: "EXACT_DOCUMENT_DUPLICATE_IN_CASE",
          explanation_ar: `تم رفع نفس الوثيقة (${doc.classification.canonical_name_ar}) مرتين ضمن نفس المعاملة.`,
          explanation_en: `Exact duplicate document (${doc.classification.canonical_name_en}) uploaded multiple times in the same case.`
        });
      } else {
        seenFingerprintsInCase.set(doc.fingerprint, doc.doc_id);
      }

      // Check primary document number duplication across different types if identical
      const idField = doc.fields.find(f => ["DOCUMENT_NUMBER", "NATIONAL_ID_12"].includes(f.field_type) && f.normalized_value);
      if (idField) {
        const key = `${doc.classification.doc_type_id}:${idField.normalized_value}`;
        if (seenDocNumbersInCase.has(key)) {
          duplicateFlags.push({
            doc_id: doc.doc_id,
            duplicate_of: seenDocNumbersInCase.get(key),
            type: "DUPLICATE_DOCUMENT_IDENTIFIER",
            explanation_ar: `تكرار رقم الوثيقة (${idField.normalized_value}) لنفس النوع (${doc.classification.canonical_name_ar}).`,
            explanation_en: `Duplicate document identifier (${idField.normalized_value}) for ${doc.classification.canonical_name_en}.`
          });
        } else {
          seenDocNumbersInCase.set(key, doc.doc_id);
        }
      }
    }

    // ========================================================================
    // STAGE 8: ENTITY GRAPH & CROSS-DOCUMENT RECONCILIATION
    // ========================================================================
    const entityGraph = {
      individuals: [],
      business_entities: [],
      authorizations_poa: [],
      addresses: []
    };

    let hasPrimaryIdentityDoc = false;
    let hasForeignPassport = false;
    let hasIraqiResidencyOrVisa = false;

    for (const doc of processedDocs) {
      const regEntry = getDocumentTypeById(doc.classification.doc_type_id);
      if (regEntry?.can_establish_primary_identity) {
        hasPrimaryIdentityDoc = true;
      }
      if (doc.classification.doc_type_id === "FOREIGN_PASSPORT") {
        hasForeignPassport = true;
      }
      if (["IRQ_RESIDENCE_PERMIT", "IRQ_ENTRY_VISA"].includes(doc.classification.doc_type_id)) {
        hasIraqiResidencyOrVisa = true;
      }

      // Populate Entity Graph
      for (const f of doc.fields) {
        if (!f.original_value) continue;
        if (f.field_type === "PERSON_NAME" && !["mother_name_ar", "father_name_ar"].includes(f.field_key)) {
          entityGraph.individuals.push({
            role: f.field_key,
            name_original: f.original_value,
            name_normalized: f.normalized_value,
            source_doc_id: doc.doc_id,
            doc_type_id: doc.classification.doc_type_id,
            doc_name_ar: doc.classification.canonical_name_ar
          });
        }
        if (f.field_type === "LEGAL_ENTITY_NAME") {
          entityGraph.business_entities.push({
            entity_name_original: f.original_value,
            entity_name_normalized: f.normalized_value,
            source_doc_id: doc.doc_id,
            doc_type_id: doc.classification.doc_type_id,
            doc_name_ar: doc.classification.canonical_name_ar
          });
        }
        if (f.field_type === "ADDRESS_IRAQI") {
          entityGraph.addresses.push({
            address_original: f.original_value,
            address_normalized: f.normalized_value,
            source_doc_id: doc.doc_id,
            doc_type_id: doc.classification.doc_type_id
          });
        }
      }

      if (["IRQ_POWER_OF_ATTORNEY", "IRQ_AUTHORIZED_SIGNATORY"].includes(doc.classification.doc_type_id)) {
        const grantor = doc.fields.find(f => ["grantor_name", "company_legal_name"].includes(f.field_key))?.original_value;
        const grantee = doc.fields.find(f => ["grantee_name", "authorized_person_name"].includes(f.field_key))?.original_value;
        if (grantor && grantee) {
          entityGraph.authorizations_poa.push({
            doc_id: doc.doc_id,
            doc_type_id: doc.classification.doc_type_id,
            grantor_principal: grantor,
            grantee_representative: grantee,
            notary_or_ref: doc.fields.find(f => ["notary_record_number", "resolution_number"].includes(f.field_key))?.original_value || "N/A"
          });
        }
      }
    }

    // Run Cross-Document Checks dynamically when corresponding evidence exists
    const crossChecks = [];
    let consistencyPenalties = 0;
    let hasHardConflict = false;
    let hasProbableOrPoaMatch = false;

    // 1. Person Name Cross-Verification across documents
    const primaryPersonRecords = entityGraph.individuals.filter(
      ind => !["grantor_name"].includes(ind.role)
    );

    if (primaryPersonRecords.length >= 2) {
      const anchor = primaryPersonRecords[0];
      for (let i = 1; i < primaryPersonRecords.length; i++) {
        const target = primaryPersonRecords[i];
        const allowHousehold = ["IRQ_RESIDENCE_CARD", "IRQ_RATION_CARD", "IRQ_UTILITY_BILL"].includes(target.doc_type_id);
        const cmp = IraqiMultiScriptNormalizer.comparePersonNames(anchor.name_original, target.name_original, {
          allowPatronymicHousehold: allowHousehold
        });

        // If direct comparison is a CONFLICT, check if an active Power of Attorney / Signatory Resolution links them!
        let poaLinked = false;
        let poaDetails = "";
        if (cmp.status === "CONFLICT" && entityGraph.authorizations_poa.length > 0) {
          for (const auth of entityGraph.authorizations_poa) {
            const repMatch = IraqiMultiScriptNormalizer.comparePersonNames(anchor.name_original, auth.grantee_representative);
            const prinMatch = IraqiMultiScriptNormalizer.comparePersonNames(target.name_original, auth.grantor_principal);
            if (repMatch.score >= 0.85 && prinMatch.score >= 0.85) {
              poaLinked = true;
              poaDetails = `Linked via ${auth.doc_type_id} (#${auth.notary_or_ref}): Representative "${auth.grantee_representative}" is authorized on behalf of Principal "${auth.grantor_principal}".`;
              break;
            }
          }
        }

        if (poaLinked) {
          hasProbableOrPoaMatch = true;
          crossChecks.push({
            check_type: "CROSS_DOC_REPRESENTATIVE_POA_LINK",
            name: `سلسلة التخويل والوكالة: ${anchor.doc_name_ar} ↔ ${target.doc_name_ar}`,
            status: "LINKED_VIA_POA",
            ok: true,
            score: 0.94,
            details: `مقدم الطلب (${anchor.name_original}) مفوض قانونياً بموجب وكالة/تخويل عن المالك (${target.name_original}). يتطلب مصادقة ضابط الامتثال القانوني على الوكالة.`,
            details_en: poaDetails
          });
        } else {
          if (cmp.status === "CONFLICT") {
            hasHardConflict = true;
            consistencyPenalties += 0.45;
          } else if (cmp.status === "PROBABLE_MATCH") {
            hasProbableOrPoaMatch = true;
            consistencyPenalties += 0.10;
          }

          crossChecks.push({
            check_type: "CROSS_DOC_NAME_RECONCILIATION",
            name: `مطابقة الاسم: ${anchor.doc_name_ar} ↔ ${target.doc_name_ar}`,
            status: cmp.status,
            ok: cmp.status === "EXACT_MATCH" || cmp.status === "NORMALIZED_MATCH",
            score: cmp.score,
            details: `${cmp.explanation} [${anchor.name_original} ⇔ ${target.name_original}]`,
            details_en: cmp.explanation
          });
        }
      }
    }

    // 2. 12-Digit National ID Cross-Check (when present on 2+ documents)
    const natIdFields = [];
    for (const doc of processedDocs) {
      for (const f of doc.fields) {
        if (f.field_type === "NATIONAL_ID_12" && f.normalized_value) {
          natIdFields.push({ doc_name_ar: doc.classification.canonical_name_ar, val: f.normalized_value });
        }
      }
    }
    if (natIdFields.length >= 2) {
      const firstId = natIdFields[0].val;
      const allMatch = natIdFields.every(item => item.val === firstId);
      if (!allMatch) {
        hasHardConflict = true;
        consistencyPenalties += 0.45;
      }
      crossChecks.push({
        check_type: "CROSS_DOC_NATIONAL_ID",
        name: "مطابقة الرقم الوطني الموحد (12 مرتبة) عبر الوثائق",
        status: allMatch ? "EXACT_MATCH" : "CONFLICT",
        ok: allMatch,
        score: allMatch ? 1.0 : 0.0,
        details: allMatch
          ? `الرقم الوطني (${firstId}) متطابق تماماً عبر ${natIdFields.length} وثائق.`
          : `تعارض في الرقم الوطني بين الوثائق المرفوعة (${natIdFields.map(n => n.val).join(" ≠ ")}).`
      });
    }

    // 3. Passport Number Cross-Check (Foreign Passport <-> Residency Permit / Entry Visa)
    const passportNumFields = [];
    for (const doc of processedDocs) {
      for (const f of doc.fields) {
        if (["passport_number", "passport_reference"].includes(f.field_key) && f.normalized_value) {
          passportNumFields.push({ doc_name_ar: doc.classification.canonical_name_ar, val: f.normalized_value });
        }
      }
    }
    if (passportNumFields.length >= 2) {
      const firstPass = passportNumFields[0].val;
      const allPassMatch = passportNumFields.every(p => p.val === firstPass);
      if (!allPassMatch) {
        hasHardConflict = true;
        consistencyPenalties += 0.40;
      }
      crossChecks.push({
        check_type: "CROSS_DOC_PASSPORT_REFERENCE",
        name: "مطابقة رقم جواز السفر مع سمة الدخول / الإقامة",
        status: allPassMatch ? "EXACT_MATCH" : "CONFLICT",
        ok: allPassMatch,
        score: allPassMatch ? 1.0 : 0.0,
        details: allPassMatch
          ? `رقم الجواز (${firstPass}) مطابق لوثيقة الإقامة العراقية.`
          : `عدم تطابق رقم الجواز بين جواز السفر ووثيقة الإقامة.`
      });
    }

    // 4. Date of Birth Cross-Check across Identity / Passport / Driving License
    const dobFields = [];
    for (const doc of processedDocs) {
      const dobF = doc.fields.find(f => f.field_key === "date_of_birth" && f.normalized_value);
      if (dobF) dobFields.push({ doc_name_ar: doc.classification.canonical_name_ar, val: dobF.normalized_value });
    }
    if (dobFields.length >= 2) {
      const firstDob = dobFields[0].val;
      const dobMatch = dobFields.every(d => d.val === firstDob);
      if (!dobMatch) {
        hasHardConflict = true;
        consistencyPenalties += 0.35;
      }
      crossChecks.push({
        check_type: "CROSS_DOC_DOB_CONSISTENCY",
        name: "مطابقة تاريخ الولادة عبر وثائق الهوية",
        status: dobMatch ? "EXACT_MATCH" : "CONFLICT",
        ok: dobMatch,
        score: dobMatch ? 1.0 : 0.0,
        details: dobMatch
          ? `تاريخ الولادة (${firstDob}) متطابق عبر الوثائق.`
          : `اختلاف في تاريخ الولادة (${dobFields.map(d => d.val).join(" ≠ ")}).`
      });
    }

    // 5. Governorate / Jurisdiction Alignment across Residence & Business Documents
    const govFields = [];
    for (const doc of processedDocs) {
      const gF = doc.fields.find(f => f.field_key === "governorate" && f.normalized_value);
      if (gF) {
        govFields.push({
          doc_name_ar: doc.classification.canonical_name_ar,
          raw: gF.original_value,
          norm: IraqiMultiScriptNormalizer.normalizeGovernorateOrCity(gF.original_value)
        });
      }
    }
    if (govFields.length >= 2) {
      const firstGov = govFields[0].norm;
      const govMatch = govFields.every(g => g.norm === firstGov);
      crossChecks.push({
        check_type: "CROSS_DOC_JURISDICTION_ALIGNMENT",
        name: "مطابقة المحافظة / الإقليم الجغرافي (العربية والكوردية)",
        status: govMatch ? "NORMALIZED_MATCH" : "PROBABLE_MATCH",
        ok: govMatch,
        score: govMatch ? 1.0 : 0.75,
        details: govMatch
          ? `المحافظة متطابقة (${govFields.map(g => g.raw).join(" ≡ ")}) بعد التطبيع اللغوي.`
          : `اختلاف جغرافي بين المحافظات (${govFields.map(g => g.raw).join(" / ")}) — يراجع من قبل الضابط.`
      });
    }

    // 6. Document-Specific Validity & Expiry Audit Summary
    let hasExpiredDoc = false;
    let hasInvalidField = false;
    let hasMissingRequired = false;
    let hasUnclassifiedDoc = false;
    let hasGlareOrBlur = false;
    let hasLegalOrPoaEscalation = false;

    for (const doc of processedDocs) {
      if (!doc.classification.is_classified || doc.classification.support_status === "UNSUPPORTED_OR_UNCERTAIN_CLASSIFICATION") {
        hasUnclassifiedDoc = true;
      }
      if (doc.classification.support_status === "REGISTERED") {
        hasLegalOrPoaEscalation = true;
      }
      if (["LEGAL_AUTHORIZATION"].includes(doc.classification.document_category)) {
        hasLegalOrPoaEscalation = true;
      }
      if (!doc.image_quality.is_acceptable) {
        hasGlareOrBlur = true;
      }
      if (doc.field_completeness.missing_required_fields.length > 0) {
        hasMissingRequired = true;
      }

      for (const f of doc.fields) {
        if (f.days_to_expiry !== null && f.days_to_expiry < 0) {
          hasExpiredDoc = true;
          crossChecks.push({
            check_type: "TEMPORAL_EXPIRY_CHECK",
            name: `صلاحية ${doc.classification.canonical_name_ar}`,
            status: "EXPIRED",
            ok: false,
            score: 0.0,
            details: `الوثيقة منتهية الصلاحية منذ ${Math.abs(f.days_to_expiry)} يوم (تاريخ النفاذ: ${f.normalized_value}).`
          });
        } else if (f.validation_status === "INVALID") {
          hasInvalidField = true;
          crossChecks.push({
            check_type: "FIELD_SYNTAX_VALIDATION",
            name: `فحص حقل ${f.label_ar} (${doc.classification.canonical_name_ar})`,
            status: "INVALID",
            ok: false,
            score: 0.2,
            details: f.explanation
          });
        }
      }

      if (doc.mrz_validation?.applicable && doc.mrz_validation?.mrz_present) {
        const mrzOk = doc.mrz_validation.all_checksums_valid && doc.mrz_validation.front_consistency_match !== false;
        if (!mrzOk) hasInvalidField = true;
        crossChecks.push({
          check_type: "ICAO_MRZ_VALIDATION",
          name: `فحص منطقة القراءة الآلية (${doc.mrz_validation.mrz_format}) — ${doc.classification.canonical_name_ar}`,
          status: mrzOk ? "VALID" : "MISMATCH",
          ok: mrzOk,
          score: mrzOk ? 0.99 : 0.25,
          details: doc.mrz_validation.explanation
        });
      }
    }

    // 7. Policy Check: Solo Supporting Document without Primary Identity
    if (!hasPrimaryIdentityDoc && !hasUnclassifiedDoc) {
      crossChecks.push({
        check_type: "PRIMARY_IDENTITY_POLICY",
        name: "فحص سياسة إثبات الهوية الأساسية (KYC Primary Identity Rule)",
        status: "POLICY_VIOLATION",
        ok: false,
        score: 0.0,
        details: "الوثائق المرفوعة (وظيفية / تعليمية / مالية / فواتير) هي وثائق ساندة ولا تكفي لوحدها لإثبات الهوية المدنية بدون بطاقة وطنية أو جواز سفر."
      });
    }

    // 8. Policy Check: Foreign Passport requires Iraqi Residency Permit / Visa
    if (hasForeignPassport && !hasIraqiResidencyOrVisa) {
      crossChecks.push({
        check_type: "FOREIGN_NATIONAL_RESIDENCY_POLICY",
        name: "ضوابط إقامة الأجانب (جواز سفر أجنبي)",
        status: "MISSING_RESIDENCY_PERMIT",
        ok: false,
        score: 0.3,
        details: "تم تقديم جواز سفر أجنبي بدون إرفاق هوية الإقامة العراقية أو سمة الدخول النافذة."
      });
    }

    // ========================================================================
    // STAGE 9: THE 9 INDEPENDENT VERIFICATION SIGNALS & ROUTING DECISION
    // ========================================================================
    const avgQualityScore = processedDocs.length > 0
      ? parseFloat((processedDocs.reduce((s, d) => s + d.image_quality.quality_score, 0) / processedDocs.length).toFixed(3))
      : 0.0;

    const rawExtractionScore = processedDocs.length > 0
      ? parseFloat((processedDocs.reduce((s, d) => s + d.text_extraction_confidence, 0) / processedDocs.length).toFixed(3))
      : 0.0;
    const avgExtractionScore = hasGlareOrBlur ? Math.min(0.22, rawExtractionScore) : rawExtractionScore;

    const avgClassificationScore = processedDocs.length > 0
      ? parseFloat((processedDocs.reduce((s, d) => s + d.classification.classification_confidence, 0) / processedDocs.length).toFixed(3))
      : 0.0;

    const avgCompletenessScore = processedDocs.length > 0
      ? parseFloat((processedDocs.reduce((s, d) => s + d.field_completeness.completeness_ratio, 0) / processedDocs.length).toFixed(3))
      : 0.0;

    const consistencyScore = parseFloat(Math.max(0.0, 1.0 - consistencyPenalties).toFixed(3));

    // Determine Explicit Routing Decision (Never silently merge or auto-reject as fraud!)
    let decisionTier = "AUTO_PASS";
    let status = "APPROVED_AUTOMATIC";
    const escalationReasonsAr = [];
    const escalationReasonsEn = [];
    const identifiedFlags = [];

    if (hasGlareOrBlur || hasMissingRequired) {
      decisionTier = "RETAKE_REQUESTED";
      status = "RETAKE_OR_REVIEW_REQUIRED";
      escalationReasonsAr.push("تم رصد عوائق بصرية (انعكاس فلاش ضوئي أو ضبابية أو حقل إلزامي غير مقروء). تطبيقاً لقاعدة عدم الهلوسة تُرك الحقل فارغاً (null) وطُلب إعادة التقاط الصورة.");
      escalationReasonsEn.push("Optical glare, motion blur, or unreadable required field detected; left explicitly null under Zero-Hallucination policy.");
      identifiedFlags.push("OPTICAL_QUALITY_OR_OCCLUSION_NULL", "OPTICAL_FLASH_GLARE_OCCLUSION");
    }

    if (hasUnclassifiedDoc) {
      decisionTier = "HUMAN_REVIEW";
      status = "NEEDS_MANUAL_REVIEW";
      escalationReasonsAr.push("تتضمن المعاملة وثيقة غير مصنفة أو غير مهيأة بالكامل في السجل؛ تم استخراج بياناتها الأولية وإحالتها لضابط الامتثال لتصنيفها أو تسجيلها.");
      escalationReasonsEn.push("Case contains an unrecognized or unconfigured document type; generic layout extracted and routed to human review.");
      identifiedFlags.push("UNSUPPORTED_OR_UNCERTAIN_CLASSIFICATION");
    }

    if (duplicateFlags.length > 0) {
      decisionTier = "HUMAN_REVIEW";
      status = "NEEDS_MANUAL_REVIEW";
      escalationReasonsAr.push(duplicateFlags.map(d => d.explanation_ar).join(" "));
      escalationReasonsEn.push(duplicateFlags.map(d => d.explanation_en).join(" "));
      identifiedFlags.push("DUPLICATE_DOCUMENT_DETECTED");
    }

    if (!hasPrimaryIdentityDoc && !hasUnclassifiedDoc) {
      decisionTier = "POLICY_ESCALATION";
      status = "NEEDS_MANUAL_REVIEW";
      escalationReasonsAr.push("الوثائق المقدمة ساندة فقط (تعليم/وظيفة/فواتير) ولا تتضمن وثيقة هوية سيادية أساسية (بطاقة وطنية أو جواز سفر).");
      escalationReasonsEn.push("Submitted documents are supporting evidence only and cannot independently establish primary identity.");
      identifiedFlags.push("MISSING_PRIMARY_IDENTITY_DOCUMENT");
    }

    if (hasForeignPassport) {
      decisionTier = "HUMAN_REVIEW";
      status = "NEEDS_MANUAL_REVIEW";
      escalationReasonsAr.push(
        hasIraqiResidencyOrVisa
          ? "معاملة مواطن أجنبي (جواز سفر أجنبي + إقامة عراقية): تحال للمراجعة الرقابية حسب ضوابط العناية الواجبة لغير العراقيين."
          : "جواز سفر أجنبي بدون وثيقة إقامة عراقية أو سمة دخول سارية."
      );
      escalationReasonsEn.push("Foreign national onboarding requires compliance verification of Iraqi residency permit / visa.");
      identifiedFlags.push(hasIraqiResidencyOrVisa ? "FOREIGN_NATIONAL_EDD_REVIEW" : "MISSING_IRAQI_RESIDENCY_PERMIT");
    }

    if (hasExpiredDoc) {
      decisionTier = "HUMAN_REVIEW";
      status = "NEEDS_MANUAL_REVIEW";
      escalationReasonsAr.push("إحدى الوثائق الرسمية المرفوعة منتهية الصلاحية زمنياً وتتطلب تجديداً رسمياً.");
      escalationReasonsEn.push("One or more submitted documents have passed their expiration date.");
      identifiedFlags.push("EXPIRED_DOCUMENT_DETECTED", "EXPIRED_TRADE_LICENSE");
    }

    if (hasHardConflict || hasInvalidField) {
      decisionTier = "HUMAN_REVIEW";
      status = "NEEDS_MANUAL_REVIEW";
      escalationReasonsAr.push("تم رصد تعارض في البيانات عبر الوثائق أو خلل في قواعد التحقق الحتمية يستوجب تدقيق ضابط الامتثال.");
      escalationReasonsEn.push("Cross-document data conflict or deterministic validation failure detected; escalated to compliance officer.");
      identifiedFlags.push("CROSS_DOCUMENT_OR_SYNTAX_CONFLICT", "OWNERSHIP_IDENTITY_MISMATCH");
    }

    if (hasProbableOrPoaMatch || hasLegalOrPoaEscalation) {
      if (decisionTier === "AUTO_PASS") {
        decisionTier = "HUMAN_REVIEW";
        status = "NEEDS_MANUAL_REVIEW";
      }
      escalationReasonsAr.push("تتضمن المعاملة وكالة عدلية / تخويلاً قانونياً أو تطابقاً نسبياً لاسم رب الأسرة يستوجب المصادقة البشرية السريعة.");
      escalationReasonsEn.push("Case involves a legal Power of Attorney, supporting legal deed, or patronymic household match requiring officer sign-off.");
      identifiedFlags.push("LEGAL_OR_PATRONYMIC_CONFIRMATION_REQUIRED");
    }

    const overallConfidence = parseFloat(
      (
        0.25 * avgExtractionScore +
        0.25 * consistencyScore +
        0.20 * avgClassificationScore +
        0.15 * avgQualityScore +
        0.15 * avgCompletenessScore
      ).toFixed(3)
    );

    if (decisionTier === "AUTO_PASS" && overallConfidence < 0.86) {
      decisionTier = "HUMAN_REVIEW";
      status = "NEEDS_MANUAL_REVIEW";
      escalationReasonsAr.push("معدل الثقة الإجمالي أقل من عتبة الاعتماد التلقائي (86%).");
      identifiedFlags.push("CONFIDENCE_BELOW_AUTO_PASS_THRESHOLD");
    }

    const separatedSignals = {
      image_quality: {
        score: avgQualityScore,
        status: hasGlareOrBlur ? "DEGRADED_OR_OCCLUDED" : "PASS",
        per_document: processedDocs.map(d => ({ doc_id: d.doc_id, ...d.image_quality }))
      },
      text_extraction_confidence: {
        score: avgExtractionScore,
        status: avgExtractionScore >= 0.85 ? "HIGH" : avgExtractionScore >= 0.70 ? "MODERATE" : "LOW"
      },
      classification_confidence: {
        score: avgClassificationScore,
        status: hasUnclassifiedDoc ? "UNSUPPORTED_OR_UNCERTAIN" : "CLASSIFIED",
        per_document: processedDocs.map(d => ({
          doc_id: d.doc_id,
          doc_type_id: d.classification.doc_type_id,
          canonical_name_ar: d.classification.canonical_name_ar,
          category: d.classification.document_category,
          confidence: d.classification.classification_confidence,
          support_status: d.classification.support_status
        }))
      },
      field_completeness: {
        score: avgCompletenessScore,
        status: hasMissingRequired ? "INCOMPLETE_REQUIRED_FIELDS" : "COMPLETE",
        missing_fields: processedDocs.flatMap(d => d.field_completeness.missing_required_fields.map(f => `${d.doc_id}:${f}`))
      },
      data_consistency: {
        score: consistencyScore,
        status: hasHardConflict ? "CONFLICT_DETECTED" : hasProbableOrPoaMatch ? "PROBABLE_OR_POA_LINKED" : "CONSISTENT",
        checks_run: crossChecks.length
      },
      duplicate_detection: {
        is_duplicate: duplicateFlags.length > 0,
        status: duplicateFlags.length > 0 ? "DUPLICATE_FLAGGED" : "UNIQUE",
        duplicates: duplicateFlags
      },
      authenticity_indicators: {
        status: processedDocs.some(d => d.mrz_validation?.all_checksums_valid === false)
          ? "STRUCTURAL_CHECKSUM_WARNING"
          : processedDocs.some(d => d.mrz_validation?.all_checksums_valid === true)
          ? "OPTICAL_AND_MRZ_CONSISTENT"
          : "OPTICAL_LAYOUT_CONSISTENT_NO_MRZ",
        disclaimer: "Internal consistency and MRZ math check digits verify optical transcription integrity; they do not substitute for physical security-feature forensics or live government registry verification."
      },
      external_authoritative_verification: {
        status: "EXTERNAL_VERIFICATION_UNAVAILABLE",
        connected_registries: [],
        explanation: "No live connection to Ministry of Interior, Registrar of Companies, Tax Authority, or Core Banking databases is active in this environment."
      },
      final_policy_decision: {
        decision_tier: decisionTier,
        application_status: status,
        primary_identity_established: hasPrimaryIdentityDoc,
        overall_composite_score: overallConfidence
      }
    };

    // STAGE 10: Hash-Chained Audit Record
    const timestamp = new Date().toISOString();
    const auditPayload = JSON.stringify({
      prev_hash: this.LAST_AUDIT_HASH,
      case_id: caseId,
      doc_types: processedDocs.map(d => d.classification.doc_type_id),
      decision: decisionTier,
      score: overallConfidence,
      timestamp
    });
    const currentAuditHash = crypto.createHash("sha256").update(auditPayload).digest("hex");
    this.LAST_AUDIT_HASH = currentAuditHash;

    const allUniversalFields = processedDocs.flatMap(d => d.fields);
    const rationaleAr = decisionTier === "AUTO_PASS"
      ? `تم التحقق من ${processedDocs.length} وثائق رسمية بنجاح (${processedDocs.map(d => d.classification.canonical_name_ar).join(" + ")}). جميع الحقول المطلوبة كاملة ومطابقة للقواعد الحتمية واللغوية دون أي تعارض.`
      : escalationReasonsAr.join(" • ");

    return {
      application_id: caseId,
      merchant_trade_name: casePayload.merchant_trade_name || entityGraph.business_entities[0]?.entity_name_original || entityGraph.individuals[0]?.name_original || "معاملة تحقق شاملة",
      status,
      overall_confidence: overallConfidence,
      confidence_percentage: Math.round(overallConfidence * 100),
      evaluation_latency_ms: Math.max(12, Date.now() - startTime),
      documents_count: processedDocs.length,
      documents: processedDocs,
      universal_fields: allUniversalFields,
      entity_graph: entityGraph,
      separated_signals: separatedSignals,
      scoring_breakdown: {
        ocr_confidence: avgExtractionScore,
        consistency_score: consistencyScore,
        classification_confidence: avgClassificationScore,
        image_quality_score: avgQualityScore,
        completeness_score: avgCompletenessScore
      },
      cross_checks: crossChecks,
      reviewer_dossier: {
        recommended_decision: decisionTier,
        rationale_ar: rationaleAr,
        rationale_en: escalationReasonsEn.join(" | ") || "All configured document checks passed.",
        identified_flags: identifiedFlags,
        estimated_review_seconds: decisionTier === "AUTO_PASS" ? 0 : 25
      },
      cbi_audit: {
        standard: "Central Bank of Iraq Electronic Transactions Law No. 78 of 2012 (Hash-Chained Audit Trail)",
        timestamp,
        previous_chain_hash: auditPayload ? JSON.parse(auditPayload).prev_hash.substring(0, 16) + "..." : "GENESIS",
        hmac_sha256_digest: currentAuditHash,
        external_verification_status: "EXTERNAL_VERIFICATION_UNAVAILABLE"
      }
    };
  }
}

module.exports = {
  IraqiMultiScriptNormalizer,
  DeterministicValidators,
  UniversalDocumentClassifier,
  DocumentPreprocessor,
  UniversalKYCPipeline
};
