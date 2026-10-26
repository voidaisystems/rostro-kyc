import {
  computeLaplacianBlurVariance,
  detectFftMoireScreenSpoof,
  detectHsvSpecularGlare,
  detectCardQuadAndCorners,
} from './edgeForensicsEngine.ts';
import type { DocumentType } from './kycEngine.ts';

export type ExtractedIdPayload = Record<string, any>;

export type CameraGateStatus =
  | 'INITIALIZING'
  | 'WARMING_UP'
  | 'WRONG_OR_NO_DOCUMENT'
  | 'HOLD_STILL'
  | 'LOW_RESOLUTION'
  | 'LOW_LIGHT'
  | 'LIGHT_SPOT_GLARE'
  | 'NOT_ALIGNED'
  | 'TOO_BLURRY'
  | 'SCREEN_MOIRE_DETECTED'
  | 'READY_AUTO_SNAP';

export interface CameraDiagnosticCheck {
  id:
    | 'DOCUMENT_PRESENCE'
    | 'RESOLUTION'
    | 'LIGHTING'
    | 'LIGHT_REFLECTION'
    | 'ALIGNMENT'
    | 'SHARPNESS'
    | 'ANTI_SPOOF';
  passed: boolean;
  labelEn: string;
  labelAr: string;
  detailEn: string;
  detailAr: string;
}

export interface CameraFrameTelemetry {
  status: CameraGateStatus;
  readyToSnap: boolean;
  autoSnapProgressPct: number; // 0..100
  sharpnessVariance: number;
  glarePercent: number;
  meanLuminance: number; // 0..255
  moireRatio: number;
  cornersDetected: number;
  estimatedTiltDegrees: number;
  glareHotspotBox: [number, number, number, number] | null; // [top%, left%, bottom%, right%]
  feedbackEn: string;
  feedbackAr: string;
  actionHintEn: string;
  actionHintAr: string;
  steadyFramesCount: number;
  diagnostics: CameraDiagnosticCheck[];
}

export interface HeadlessVerifyRequest {
  partnerAppId?: 'ZAINCASH_IQ' | 'SUPERQI_BANK' | 'BALY_SUPERAPP' | string;
  documentType?: DocumentType;
  frontImageBase64: string;
  backImageBase64?: string;
  fileName?: string;
}

export interface HeadlessVerifyResponse {
  sdkVersion: string;
  partnerAppId: string;
  timestamp: string;
  processingTimeMs: number;
  decision: 'AUTO_APPROVED' | 'HUMAN_REVIEW' | 'AUTO_REJECTED' | 'INSUFFICIENT_DATA';
  riskScore: number;
  riskTier: 'low' | 'medium' | 'high';
  extractedData: {
    documentType: DocumentType;
    firstNameAr: string;
    fatherNameAr: string;
    grandfatherNameAr: string;
    surnameAr: string;
    fullNameAr: string;
    fullNameEn: string;
    normalizedName: string;
    motherName: string;
    nationalIdNumber: string;
    familyCardSerial: string;
    birthYearOrDob: string;
    issueDate: string;
    expiryDate: string;
    governorateEn: string;
    governorateAr: string;
    address: string;
    issuingCountryCode: string;
    isForeignDocument: boolean;
  };
  forensics: {
    ocrConfidence: number;
    mrzModulo10Valid: boolean;
    hasBlur: boolean;
    hasGlare: boolean;
    dualSideVerified: boolean;
    crossCardConflict: boolean;
    missingCriticalFields: string[];
  };
  cbiLaw78Receipt: {
    hmacSha256: string;
    imageSha256: string;
    legalStandard: string;
  };
  rawPayload: ExtractedIdPayload;
}

/**
 * Headless On-Device Camera Frame Evaluator (`@rostro/camera-gate-sdk`)
 * Works identically on both Smartphone and Laptop webcams across the entire platform.
 * Diagnoses:
 * 1. Wrong/No Document in Frame (Strict 4-Quadrant Card Substrate + Printed Text Co-Occurrence, rejecting faces/rooms)
 * 2. Hand / Frame Motion Instability (Requires card to be held still)
 * 3. Low Resolution / Too Far
 * 4. Low Light / Too Dark
 * 5. Light Spot / Specular Flash Reflection (with hotspot coordinates)
 * 6. Not Adjusted / Tilted / Off-Center Alignment
 * 7. Blur / Focus Sharpness
 * 8. Screen Replay Moiré
 */
export function evaluateCameraFrameHeadless(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  prevSteadyFrames = 0,
  relaxedLaptopMode = true,
  streamWidth = 1280,
  streamHeight = 720,
  frameMotionDiff = 0
): CameraFrameTelemetry {
  const totalPixels = width * height;
  if (totalPixels === 0 || pixels.length < totalPixels * 4) {
    return {
      status: 'INITIALIZING',
      readyToSnap: false,
      autoSnapProgressPct: 0,
      sharpnessVariance: 0,
      glarePercent: 0,
      meanLuminance: 0,
      moireRatio: 0,
      cornersDetected: 0,
      estimatedTiltDegrees: 0,
      glareHotspotBox: null,
      feedbackEn: 'Initializing camera sensor...',
      feedbackAr: 'جاري تهيئة مستشعر الكاميرا...',
      actionHintEn: 'Hold your document in front of the camera',
      actionHintAr: 'ضع الوثيقة أمام الكاميرا',
      steadyFramesCount: 0,
      diagnostics: [],
    };
  }

  // 1. Analyze guide box interior (x: 14%..86%, y: 14%..86%) across 4 inner sub-quadrants
  // to verify an actual physical ID card (bright polycarbonate/paper substrate + dark printed text) is present,
  // and NOT a person's face, clothes, or room background.
  const startY = Math.floor(height * 0.14);
  const endY = Math.max(startY + 2, Math.ceil(height * 0.86));
  const startX = Math.floor(width * 0.12);
  const endX = Math.max(startX + 2, Math.ceil(width * 0.88));
  const midX = Math.floor((startX + endX) / 2);
  const midY = Math.floor((startY + endY) / 2);

  let lumSum = 0;
  let lumSqSum = 0;
  let interiorCount = 0;
  let cardSubstratePixels = 0;
  let skinOrDarkRoomPixels = 0;
  let textOnCardTransitions = 0;

  const quadTotal = [0, 0, 0, 0]; // TL, TR, BL, BR
  const quadSubstrate = [0, 0, 0, 0];
  const quadTextEdges = [0, 0, 0, 0];

  for (let y = startY; y < endY; y++) {
    const isBottomHalf = y >= midY;
    for (let x = startX; x < endX; x++) {
      const isRightHalf = x >= midX;
      const qIdx = (isBottomHalf ? 2 : 0) + (isRightHalf ? 1 : 0);
      quadTotal[qIdx]++;

      const p = (y * width + x) * 4;
      const r = pixels[p];
      const g = pixels[p + 1];
      const b = pixels[p + 2];
      const yVal = 0.299 * r + 0.587 * g + 0.114 * b;
      lumSum += yVal;
      lumSqSum += yVal * yVal;
      interiorCount++;

      const maxRgb = Math.max(r, g, b);
      const minRgb = Math.min(r, g, b);
      const sat = maxRgb === 0 ? 0 : ((maxRgb - minRgb) / maxRgb) * 255;

      // Human skin / warm wood / dim room detector:
      // Skin and warm indoor room walls have strong R > G > B dominance or low luminance
      const isWarmSkinOrWood =
        (r > g + 15 && g > b + 8 && r - b > 28 && sat >= 24) || yVal < 95;
      if (isWarmSkinOrWood) {
        skinOrDarkRoomPixels++;
      }

      // Physical ID card polycarbonate/paper substrate:
      // Bright neutral, cool white, light grey, or security pastel tint (yVal >= 122, low-to-moderate saturation, not warm skin)
      const isCardSubstrate =
        yVal >= 122 &&
        yVal <= 250 &&
        sat <= 85 &&
        r - b <= 35 &&
        !(r > g + 16 && g > b + 10);

      if (isCardSubstrate) {
        cardSubstratePixels++;
        quadSubstrate[qIdx]++;
      }

      // Printed text / micro-feature contrast specifically on or adjacent to bright card stock
      if (x + 1 < endX) {
        const pNext = (y * width + (x + 1)) * 4;
        const rN = pixels[pNext];
        const gN = pixels[pNext + 1];
        const bN = pixels[pNext + 2];
        const yNext = 0.299 * rN + 0.587 * gN + 0.114 * bN;
        const maxLumPair = Math.max(yVal, yNext);
        const diff = Math.abs(yVal - yNext);

        // Require at least one pixel of the edge pair to be bright card stock (>= 125) and not warm skin
        if (diff > 18 && maxLumPair >= 125 && !isWarmSkinOrWood) {
          textOnCardTransitions++;
          quadTextEdges[qIdx]++;
        }
      }
    }
  }

  const meanLuminance = interiorCount > 0 ? lumSum / interiorCount : 0;
  const lumVariance =
    interiorCount > 0 ? lumSqSum / interiorCount - meanLuminance * meanLuminance : 0;
  const lumStdDev = Math.sqrt(Math.max(0, lumVariance));

  const cardSubstrateRatio = interiorCount > 0 ? cardSubstratePixels / interiorCount : 0;
  const skinOrDarkRatio = interiorCount > 0 ? skinOrDarkRoomPixels / interiorCount : 0;
  const textEdgeDensityPct = interiorCount > 0 ? (textOnCardTransitions / interiorCount) * 100 : 0;

  // Count how many of the 4 inner guide-box quadrants contain BOTH bright card substrate AND printed details
  let activeCardQuadrants = 0;
  let substrateOnlyQuadrants = 0;
  for (let q = 0; q < 4; q++) {
    const qTot = Math.max(1, quadTotal[q]);
    const qSubRatio = quadSubstrate[q] / qTot;
    const qTxtPct = (quadTextEdges[q] / qTot) * 100;
    if (qSubRatio >= 0.20) {
      substrateOnlyQuadrants++;
    }
    if (qSubRatio >= 0.20 && qTxtPct >= 1.4) {
      activeCardQuadrants++;
    }
  }

  // 2. Run core vision kernels
  const blurThreshold = relaxedLaptopMode ? 55 : 105;
  const blur = computeLaplacianBlurVariance(pixels, width, height, blurThreshold);
  const glare = detectHsvSpecularGlare(pixels, width, height, 4.2);
  const moire = detectFftMoireScreenSpoof(pixels, width, height, 42.0);
  const quad = detectCardQuadAndCorners(pixels, width, height);

  // 3. Evaluate all diagnostic conditions:
  // (A) Low Light check: mean luminance < 48
  const lowLightPassed = meanLuminance >= 48;

  // (B) Light Spot / Specular Reflection check:
  const hasConcentratedLightSpot =
    !glare.passed || (glare.hotspotBox !== null && glare.glareAreaPercent >= 2.2);
  const glareSpotPassed = !hasConcentratedLightSpot;

  // (C) Low Resolution check: camera stream < 480x320
  const resolutionPassed = streamWidth >= 480 && streamHeight >= 320;

  // (D) Strict Document Presence check:
  // A webcam view of a person's face/room has high skinOrDarkRatio and < 3 active card quadrants.
  // A physical ID card held inside the guide box has:
  // - cardSubstrateRatio >= 0.28
  // - textEdgeDensityPct >= 2.4%
  // - activeCardQuadrants >= 3 (at least 3 of the 4 quadrants have both card substrate and printed text)
  // - skinOrDarkRatio <= 0.62
  const hasCardSubstrateShape =
    cardSubstrateRatio >= 0.28 && substrateOnlyQuadrants >= 3 && skinOrDarkRatio <= 0.65;
  const hasDocumentFeatures =
    hasCardSubstrateShape && activeCardQuadrants >= 3 && textEdgeDensityPct >= 2.4;

  // (E) Card Alignment / Adjusted Correctly check:
  // Corners only count if the card surface is actually present in those quadrants!
  const effectiveCorners = hasCardSubstrateShape
    ? Math.min(quad.cornersDetected, Math.max(activeCardQuadrants, substrateOnlyQuadrants))
    : activeCardQuadrants;
  const alignmentPassed =
    hasDocumentFeatures &&
    effectiveCorners >= 4 &&
    activeCardQuadrants >= 3 &&
    quad.estimatedTiltDegrees <= 14;

  // (F) Blur / Focus check (must also have sharp text on the card)
  const blurPassed = blur.passed && (!hasCardSubstrateShape || textEdgeDensityPct >= 2.2);

  // (G) Anti-Spoof Screen Moiré check
  const moirePassed = !moire.isScreenReplaySpoof || relaxedLaptopMode;

  // (H) Motion stability check: user's hand must be steady (frame-to-frame luminance diff <= 5.5)
  const isHandMoving = frameMotionDiff > 5.5;

  const diagnostics: CameraDiagnosticCheck[] = [
    {
      id: 'DOCUMENT_PRESENCE',
      passed: hasDocumentFeatures,
      labelEn: 'Document in Frame',
      labelAr: 'وجود الوثيقة بالإطار',
      detailEn: hasDocumentFeatures
        ? `ID card detected (${Math.round(cardSubstrateRatio * 100)}% card fill)`
        : 'No ID card in box — hold document close inside frame',
      detailAr: hasDocumentFeatures
        ? `تم رصد البطاقة داخل الإطار (${Math.round(cardSubstrateRatio * 100)}%)`
        : 'لا توجد بطاقة داخل المربع — قرّب الوثيقة داخل الإطار',
    },
    {
      id: 'ALIGNMENT',
      passed: alignmentPassed,
      labelEn: 'Card Alignment',
      labelAr: 'محاذاة البطاقة',
      detailEn: alignmentPassed
        ? `4/4 corners aligned (${quad.estimatedTiltDegrees}° tilt)`
        : `${effectiveCorners}/4 card corners in frame — center card in box`,
      detailAr: alignmentPassed
        ? `البطاقة بمحاذاة الإطار (4/4 زوايا)`
        : `البطاقة غير مضبوطة (${effectiveCorners}/4 زوايا) — ضع البطاقة وسط الإطار`,
    },
    {
      id: 'LIGHTING',
      passed: lowLightPassed,
      labelEn: 'Lighting Level',
      labelAr: 'مستوى الإضاءة',
      detailEn: lowLightPassed
        ? `Good lighting (${meanLuminance.toFixed(0)}/255)`
        : `Low light (${meanLuminance.toFixed(0)}/255) — move to brighter area`,
      detailAr: lowLightPassed
        ? `إضاءة جيدة (${meanLuminance.toFixed(0)}/255)`
        : `إضاءة ضعيفة (${meanLuminance.toFixed(0)}/255) — اقترب من مصدر إضاءة`,
    },
    {
      id: 'LIGHT_REFLECTION',
      passed: glareSpotPassed,
      labelEn: 'Light Spot / Glare',
      labelAr: 'بقعة ضوء / انعكاس',
      detailEn: glareSpotPassed
        ? `No light reflection (${glare.glareAreaPercent.toFixed(1)}%)`
        : `Light spot detected (${glare.glareAreaPercent.toFixed(1)}%) — tilt card slightly`,
      detailAr: glareSpotPassed
        ? `لا يوجد انعكاس ضوئي (${glare.glareAreaPercent.toFixed(1)}%)`
        : `بقعة ضوء ساطعة على البطاقة (${glare.glareAreaPercent.toFixed(1)}%) — أمِل البطاقة قليلاً`,
    },
    {
      id: 'SHARPNESS',
      passed: blurPassed && hasDocumentFeatures,
      labelEn: 'Focus & Sharpness',
      labelAr: 'الوضوح والتركيز',
      detailEn:
        blurPassed && hasDocumentFeatures
          ? `Sharp text (σ²=${blur.variance.toFixed(0)})`
          : !hasCardSubstrateShape && lumStdDev > 4
            ? 'Waiting for card to focus...'
            : `Blurry (σ²=${blur.variance.toFixed(0)} < ${blurThreshold}) — hold steady`,
      detailAr:
        blurPassed && hasDocumentFeatures
          ? `النص واضح وحاد (${blur.variance.toFixed(0)})`
          : !hasCardSubstrateShape && lumStdDev > 4
            ? 'بانتظار وضع البطاقة للتركيز...'
            : `الصورة ضبابية (${blur.variance.toFixed(0)}) — ثبّت يدك أمام الكاميرا`,
    },
    {
      id: 'RESOLUTION',
      passed: resolutionPassed,
      labelEn: 'Resolution Quality',
      labelAr: 'دقة الكاميرا',
      detailEn: resolutionPassed
        ? `HD Stream (${streamWidth}×${streamHeight})`
        : `Low resolution (${streamWidth}×${streamHeight}) — move card closer`,
      detailAr: resolutionPassed
        ? `دقة عالية (${streamWidth}×${streamHeight})`
        : `دقة منخفضة — قرّب البطاقة من عدسة الكاميرا`,
    },
  ];

  // Priority 1: Low Light
  if (!lowLightPassed) {
    return {
      status: 'LOW_LIGHT',
      readyToSnap: false,
      autoSnapProgressPct: 0,
      sharpnessVariance: blur.variance,
      glarePercent: glare.glareAreaPercent,
      meanLuminance,
      moireRatio: moire.highFreqPeriodicRatio,
      cornersDetected: effectiveCorners,
      estimatedTiltDegrees: quad.estimatedTiltDegrees,
      glareHotspotBox: glare.hotspotBox,
      feedbackEn: `Low Light Detected (${meanLuminance.toFixed(0)}/255)`,
      feedbackAr: `الإضاءة منخفضة جداً (${meanLuminance.toFixed(0)}/255)`,
      actionHintEn: 'Turn on room light or move closer to a light source so card text is readable.',
      actionHintAr: 'يرجى زيادة إضاءة الغرفة أو الاقتراب من مصدر ضوء لقراءة بيانات البطاقة.',
      steadyFramesCount: 0,
      diagnostics,
    };
  }

  // Priority 2: Concentrated Light Spot / Glare Reflection
  if (!glareSpotPassed) {
    return {
      status: 'LIGHT_SPOT_GLARE',
      readyToSnap: false,
      autoSnapProgressPct: 0,
      sharpnessVariance: blur.variance,
      glarePercent: glare.glareAreaPercent,
      meanLuminance,
      moireRatio: moire.highFreqPeriodicRatio,
      cornersDetected: effectiveCorners,
      estimatedTiltDegrees: quad.estimatedTiltDegrees,
      glareHotspotBox: glare.hotspotBox,
      feedbackEn: `Light Reflection / Hotspot on Card (${glare.glareAreaPercent.toFixed(1)}%)`,
      feedbackAr: `انعكاس ضوئي / بقعة ضوء ساطعة على البطاقة (${glare.glareAreaPercent.toFixed(1)}%)`,
      actionHintEn: 'Tilt the card slightly (10°–15°) away from overhead light to remove the bright spot.',
      actionHintAr: 'أمِل البطاقة قليلاً (10–15 درجة) لإزالة بقعة الضوء المنعكسة على البلاستيك.',
      steadyFramesCount: 0,
      diagnostics,
    };
  }

  // Priority 3: Completely uniform/out-of-focus frame or blurry card held inside box
  if (!blurPassed && (hasCardSubstrateShape || lumStdDev <= 4)) {
    return {
      status: 'TOO_BLURRY',
      readyToSnap: false,
      autoSnapProgressPct: 0,
      sharpnessVariance: blur.variance,
      glarePercent: glare.glareAreaPercent,
      meanLuminance,
      moireRatio: moire.highFreqPeriodicRatio,
      cornersDetected: effectiveCorners,
      estimatedTiltDegrees: quad.estimatedTiltDegrees,
      glareHotspotBox: null,
      feedbackEn: `Document is Blurry (Sharpness ${blur.variance.toFixed(0)} / ${blurThreshold})`,
      feedbackAr: `الصورة غير واضحة / مهتزة (الحدة ${blur.variance.toFixed(0)} من ${blurThreshold})`,
      actionHintEn: 'Hold the document steady at 15–20 cm from the camera lens until text is sharp.',
      actionHintAr: 'ثبّت البطاقة على بُعد 15–20 سم من عدسة الكاميرا حتى تتضح الكتابة.',
      steadyFramesCount: 0,
      diagnostics,
    };
  }

  // Priority 4: No Document / Only Face or Room Background in Frame!
  // This strictly prevents auto-snapping when the user hasn't placed the ID card inside the box yet.
  if (!hasDocumentFeatures) {
    return {
      status: 'WRONG_OR_NO_DOCUMENT',
      readyToSnap: false,
      autoSnapProgressPct: 0,
      sharpnessVariance: blur.variance,
      glarePercent: glare.glareAreaPercent,
      meanLuminance,
      moireRatio: moire.highFreqPeriodicRatio,
      cornersDetected: effectiveCorners,
      estimatedTiltDegrees: quad.estimatedTiltDegrees,
      glareHotspotBox: null,
      feedbackEn: 'Waiting for ID Card — Place Document in Frame',
      feedbackAr: 'بانتظار الوثيقة — ضع البطاقة داخل الإطار الإرشادي',
      actionHintEn:
        'Hold your National ID, Residence Card, or Passport close to the camera so it fills the guide box.',
      actionHintAr:
        'قرّب البطاقة الوطنية أو بطاقة السكن أو الجواز أمام الكاميرا ليملأ المربع الإرشادي.',
      steadyFramesCount: 0,
      diagnostics,
    };
  }

  // Priority 5: Low Resolution stream
  if (!resolutionPassed) {
    return {
      status: 'LOW_RESOLUTION',
      readyToSnap: false,
      autoSnapProgressPct: 0,
      sharpnessVariance: blur.variance,
      glarePercent: glare.glareAreaPercent,
      meanLuminance,
      moireRatio: moire.highFreqPeriodicRatio,
      cornersDetected: effectiveCorners,
      estimatedTiltDegrees: quad.estimatedTiltDegrees,
      glareHotspotBox: null,
      feedbackEn: `Low Resolution (${streamWidth}×${streamHeight})`,
      feedbackAr: `دقة الكاميرا منخفضة (${streamWidth}×${streamHeight})`,
      actionHintEn: 'Move the document closer so it fills at least 75% of the guide frame.',
      actionHintAr: 'قرّب الوثيقة من الكاميرا لتملأ 75% على الأقل من مربع التوجيه.',
      steadyFramesCount: 0,
      diagnostics,
    };
  }

  // Priority 6: Card Not Aligned in all 4 quadrants
  if (!alignmentPassed) {
    return {
      status: 'NOT_ALIGNED',
      readyToSnap: false,
      autoSnapProgressPct: 0,
      sharpnessVariance: blur.variance,
      glarePercent: glare.glareAreaPercent,
      meanLuminance,
      moireRatio: moire.highFreqPeriodicRatio,
      cornersDetected: effectiveCorners,
      estimatedTiltDegrees: quad.estimatedTiltDegrees,
      glareHotspotBox: null,
      feedbackEn: `Center Card in Box (${effectiveCorners}/4 Corners Aligned)`,
      feedbackAr: `وسّط البطاقة داخل الإطار (${effectiveCorners}/4 زوايا)`,
      actionHintEn: 'Move the card slightly so all 4 corners fit inside the rectangular guide.',
      actionHintAr: 'حرك البطاقة قليلاً بحيث تدخل الزوايا الأربع بالكامل داخل المربع.',
      steadyFramesCount: 0,
      diagnostics,
    };
  }

  // Priority 7: Screen Moiré Spoof
  if (!moirePassed) {
    return {
      status: 'SCREEN_MOIRE_DETECTED',
      readyToSnap: false,
      autoSnapProgressPct: 0,
      sharpnessVariance: blur.variance,
      glarePercent: glare.glareAreaPercent,
      meanLuminance,
      moireRatio: moire.highFreqPeriodicRatio,
      cornersDetected: effectiveCorners,
      estimatedTiltDegrees: quad.estimatedTiltDegrees,
      glareHotspotBox: null,
      feedbackEn: 'Screen Reflection / Digital Moiré Detected',
      feedbackAr: 'تم رصد انعكاس شاشة إلكترونية (Moiré)',
      actionHintEn: 'Please present the physical original document, not a photo on another screen.',
      actionHintAr: 'يرجى وضع الوثيقة الورقية أو البلاستيكية الأصلية وليس شاشة هاتف آخر.',
      steadyFramesCount: 0,
      diagnostics,
    };
  }

  // Priority 8: Hand / Card Motion Check — do not increment steady counter while user is still moving the card!
  if (isHandMoving) {
    return {
      status: 'HOLD_STILL',
      readyToSnap: false,
      autoSnapProgressPct: 0,
      sharpnessVariance: blur.variance,
      glarePercent: glare.glareAreaPercent,
      meanLuminance,
      moireRatio: moire.highFreqPeriodicRatio,
      cornersDetected: 4,
      estimatedTiltDegrees: quad.estimatedTiltDegrees,
      glareHotspotBox: null,
      feedbackEn: 'Card Detected — Hold Your Hand Still...',
      feedbackAr: 'تم رصد البطاقة — ثبّت يدك لالتقاط الصورة...',
      actionHintEn: 'Keep the document steady inside the frame for 2 seconds to auto-capture.',
      actionHintAr: 'ثبّت البطاقة بدون حركة لمدة ثانيتين ليتم الالتقاط التلقائي.',
      steadyFramesCount: 0,
      diagnostics,
    };
  }

  const nextSteady = prevSteadyFrames + 1;
  const requiredSteadyFrames = 10; // ~2.0 seconds of continuous rock-steady hold after warm-up!
  const progressPct = Math.min(100, Math.round((nextSteady / requiredSteadyFrames) * 100));

  return {
    status: 'READY_AUTO_SNAP',
    readyToSnap: true,
    autoSnapProgressPct: progressPct,
    sharpnessVariance: blur.variance,
    glarePercent: glare.glareAreaPercent,
    meanLuminance,
    moireRatio: moire.highFreqPeriodicRatio,
    cornersDetected: 4,
    estimatedTiltDegrees: quad.estimatedTiltDegrees,
    glareHotspotBox: null,
    feedbackEn:
      progressPct >= 100
        ? 'Perfect! Auto-Capturing Now...'
        : `Hold Steady — Auto-Capturing (${progressPct}%)`,
    feedbackAr:
      progressPct >= 100
        ? 'ممتاز! جاري الالتقاط التلقائي الآن...'
        : `ثبّت يدك — جاري الالتقاط التلقائي (${progressPct}%)`,
    actionHintEn: 'Keep holding still — capturing crystal-clear document photo...',
    actionHintAr: 'استمر بتثبيت البطاقة للحظة — جاري التقاط صورة عالية الدقة...',
    steadyFramesCount: nextSteady,
    diagnostics,
  };
}

/**
 * Headless API Client that any host app (ZainCash, SuperQi, Baly) calls
 * after capturing the document image from its camera.
 */
export async function verifyDocumentHeadlessApi(
  req: HeadlessVerifyRequest
): Promise<HeadlessVerifyResponse> {
  const response = await fetch('/api/v1/verify-document', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Rostro-Partner-Id': req.partnerAppId || 'ZAINCASH_IQ',
    },
    body: JSON.stringify(req),
  });

  if (!response.ok) {
    throw new Error(`Headless API error: HTTP ${response.status}`);
  }

  return (await response.json()) as HeadlessVerifyResponse;
}
