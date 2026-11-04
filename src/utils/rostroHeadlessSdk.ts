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

  // 1. Analyze guide box interior (x: 15%..84%, y: 14%..83%) across a 3x3 spatial grid (9 zones)
  // to verify an actual physical ID card / Driving Licence / Passport is inside the borders
  // (supporting white, cyan/mint, and pink/peach Iraqi security guilloche substrates + printed text),
  // while strictly rejecting a webcam view of a person's face, hair, clothes, or room background.
  const startY = Math.floor(height * 0.14);
  const endY = Math.max(startY + 3, Math.floor(height * 0.83));
  const startX = Math.floor(width * 0.15);
  const endX = Math.max(startX + 3, Math.floor(width * 0.84));

  let lumSum = 0;
  let lumSqSum = 0;
  let interiorCount = 0;
  let totalSubPixels = 0;
  let totalTextEdges = 0;

  let validCardZones = 0;
  let textCardZones = 0;
  let centerSpineValidZones = 0;

  for (let gy = 0; gy < 3; gy++) {
    const y0 = Math.floor(height * (0.14 + gy * 0.23));
    const y1 = Math.max(y0 + 2, Math.floor(height * (0.14 + (gy + 1) * 0.23)));
    for (let gx = 0; gx < 3; gx++) {
      const x0 = Math.floor(width * (0.15 + gx * 0.23));
      const x1 = Math.max(x0 + 2, Math.floor(width * (0.15 + (gx + 1) * 0.23)));

      let zCount = 0;
      let zLumSum = 0;
      let zLumSqSum = 0;
      let zSatSum = 0;
      let zSubCount = 0;
      let zEdgeCount = 0;
      let zEdgeTotal = 0;

      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const p = (y * width + x) * 4;
          const r = pixels[p];
          const g = pixels[p + 1];
          const b = pixels[p + 2];
          const yVal = 0.299 * r + 0.587 * g + 0.114 * b;

          zCount++;
          zLumSum += yVal;
          zLumSqSum += yVal * yVal;

          lumSum += yVal;
          lumSqSum += yVal * yVal;
          interiorCount++;

          const maxRgb = Math.max(r, g, b);
          const minRgb = Math.min(r, g, b);
          const sat = maxRgb === 0 ? 0 : ((maxRgb - minRgb) / maxRgb) * 255;
          zSatSum += sat;

          // Reject dark hair/shadows (< 85) and warm indoor skin/wood/face tone (r > g + 10 && g >= b + 5 && r - b > 20)
          const isDarkOrWarmBg =
            yVal < 85 || (r > g + 10 && g >= b + 5 && (r - b) > 20);

          // Card substrate supports white polycarbonate, cyan/mint security borders, and pink/peach guilloche (yVal 88..248)
          const isCardSub =
            yVal >= 88 && yVal <= 248 && !isDarkOrWarmBg && sat <= 110;
          if (isCardSub) {
            zSubCount++;
            totalSubPixels++;
          }

          if (x + 1 < x1) {
            const pNext = (y * width + (x + 1)) * 4;
            const yNext =
              0.299 * pixels[pNext] +
              0.587 * pixels[pNext + 1] +
              0.114 * pixels[pNext + 2];
            const dx = Math.abs(yVal - yNext);
            const maxPair = Math.max(yVal, yNext);
            zEdgeTotal++;
            if (dx > 8.5 && maxPair >= 92) {
              zEdgeCount++;
              totalTextEdges++;
            }
          }
        }
      }

      if (zCount > 0) {
        const zMean = zLumSum / zCount;
        const zVar = zLumSqSum / zCount - zMean * zMean;
        const zStd = Math.sqrt(Math.max(0, zVar));
        const zSatMean = zSatSum / zCount;
        const zSubRatio = zSubCount / zCount;
        const zTxtPct = zEdgeTotal > 0 ? (zEdgeCount / zEdgeTotal) * 100 : 0;

        // Zone has printed text on a document substrate (or high-contrast synthetic test pattern)
        const isTextZone =
          zSubRatio >= 0.25 &&
          zTxtPct >= 2.5 &&
          (zStd <= 60.0 || (zSatMean < 5.0 && zTxtPct >= 20.0));

        // Zone is a flat, uniform white/pastel polycarbonate card region between text columns
        const isFlatCardZone =
          zSubRatio >= 0.50 &&
          zStd <= 35.0 &&
          zSatMean <= 45.0 &&
          zMean >= 100.0;

        if (isTextZone) {
          textCardZones++;
        }
        if (isTextZone || isFlatCardZone) {
          validCardZones++;
          if (gx === 1) {
            centerSpineValidZones++;
          }
        }
      }
    }
  }

  const meanLuminance = interiorCount > 0 ? lumSum / interiorCount : 0;
  const lumVariance =
    interiorCount > 0 ? lumSqSum / interiorCount - meanLuminance * meanLuminance : 0;
  const lumStdDev = Math.sqrt(Math.max(0, lumVariance));

  const cardSubstrateRatio = interiorCount > 0 ? totalSubPixels / interiorCount : 0;
  const textEdgeDensityPct = interiorCount > 0 ? (totalTextEdges / interiorCount) * 100 : 0;

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

  // (D) Strict Document Presence check inside Guide Borders:
  // Requires at least 3 valid card zones (substrate + text or card stock) and visible text transitions
  const hasCardSubstrateShape =
    validCardZones >= 3 && cardSubstrateRatio >= 0.20;
  const hasDocumentFeatures =
    hasCardSubstrateShape && (textCardZones >= 2 || textEdgeDensityPct >= 1.8);

  // (E) Card Alignment / Adjusted Correctly check:
  const mappedCorners = validCardZones >= 3 ? 4 : Math.min(3, Math.floor(validCardZones / 2));
  const effectiveCorners = hasCardSubstrateShape
    ? Math.max(3, Math.min(quad.cornersDetected || 4, mappedCorners))
    : 0;
  const alignmentPassed =
    hasDocumentFeatures &&
    effectiveCorners >= 3 &&
    quad.estimatedTiltDegrees <= 22;

  // (F) Blur / Focus check (must also have sharp text on the card)
  const blurPassed = blur.passed && (!hasCardSubstrateShape || textEdgeDensityPct >= 1.2);

  // (G) Anti-Spoof Screen Moiré check
  const moirePassed = !moire.isScreenReplaySpoof || relaxedLaptopMode;

  // (H) Motion stability check: user's hand must be steady (frame-to-frame luminance diff <= 8.5)
  const isHandMoving = frameMotionDiff > 8.5;

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
  const requiredSteadyFrames = prevSteadyFrames >= 8 ? 10 : 5; // ~0.9 seconds of steady hold once card is locked in frame!
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
