export type Language = 'en' | 'ar';
export type VerificationStatus = 'approved' | 'pending' | 'flagged' | 'rejected';
export type RiskTier = 'low' | 'medium' | 'high';
export type DocumentType = 'passport' | 'national_id' | 'utility_bill' | 'corporate_registry' | 'liveness_selfie';

export interface KYCDocument {
  id: string;
  type: DocumentType;
  titleEn: string;
  titleAr: string;
  docNumber: string;
  issueDate: string;
  expiryDate: string;
  issuingCountryEn: string;
  issuingCountryAr: string;
  ocrConfidence: number; // 0-100
  livenessScore?: number; // 0-100
  fileSizeKb: number;
  sha256Hash: string;
  status: VerificationStatus;
  extractedFields: {
    fullName: string;
    dob: string;
    nationality: string;
    mrzLine1?: string;
    mrzLine2?: string;
    address?: string;
  };
  customPreviewUrl?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorEn: string;
  actorAr: string;
  actionEn: string;
  actionAr: string;
  noteEn?: string;
  noteAr?: string;
}

export interface KYCApplicant {
  id: string;
  referenceCode: string;
  fullNameEn: string;
  fullNameAr: string;
  email: string;
  phone: string;
  countryCode: string;
  countryEn: string;
  countryAr: string;
  entityType: 'individual' | 'corporate';
  submittedAt: string;
  updatedAt: string;
  status: VerificationStatus;
  riskScore: number; // 0-100 (lower is safer)
  riskTier: RiskTier;
  sanctionsMatch: boolean;
  pepMatch: boolean;
  adverseMediaMatch: boolean;
  biometricMatchScore: number; // 0-100
  assignedReviewerEn: string;
  assignedReviewerAr: string;
  documents: KYCDocument[];
  auditTrail: AuditEvent[];
}

export interface AutomationConfig {
  autoApproveMaxRiskScore: number; // e.g., 25
  minOcrConfidence: number; // e.g., 90
  minBiometricScore: number; // e.g., 88
  autoRejectSanctionsHit: boolean;
  requireUtilityBillForHighRisk: boolean;
  strictExpiryCheck: boolean;
}

export interface BatchRunResult {
  processedCount: number;
  autoApprovedIds: string[];
  autoFlaggedIds: string[];
  autoRejectedIds: string[];
  unchangedIds: string[];
}

export function calculateRiskTier(riskScore: number): RiskTier {
  if (riskScore <= 28) return 'low';
  if (riskScore <= 64) return 'medium';
  return 'high';
}

export function evaluateApplicantWithRules(
  applicant: KYCApplicant,
  config: AutomationConfig
): { nextStatus: VerificationStatus; reasonEn: string; reasonAr: string } {
  // 1. Check Sanctions / PEP hits first
  if (config.autoRejectSanctionsHit && (applicant.sanctionsMatch || applicant.pepMatch)) {
    return {
      nextStatus: 'rejected',
      reasonEn: 'Auto-rejected by Rule #01: Positive match on OFAC/UN Sanctions or PEP screening.',
      reasonAr: 'رفض تلقائي بموجب القاعدة #01: تطابق إيجابي في قوائم العقوبات الدولية أو الأشخاص المعرضين سياسياً.',
    };
  }

  // 2. Check Document Expiry if strict check enabled
  if (config.strictExpiryCheck) {
    const now = new Date('2026-10-17T00:00:00Z').getTime();
    const hasExpiredDoc = applicant.documents.some((doc) => {
      if (!doc.expiryDate || doc.expiryDate === 'N/A') return false;
      const exp = new Date(doc.expiryDate).getTime();
      return !isNaN(exp) && exp < now;
    });
    if (hasExpiredDoc) {
      return {
        nextStatus: 'flagged',
        reasonEn: 'Auto-flagged by Rule #04: Primary identity document has passed its expiration date.',
        reasonAr: 'مراجعة مطلوبة بموجب القاعدة #04: انتهاء صلاحية وثيقة الهوية الأساسية.',
      };
    }
  }

  // 3. Check High Risk Utility Bill requirement
  if (config.requireUtilityBillForHighRisk && applicant.riskScore > 60) {
    const hasUtility = applicant.documents.some((d) => d.type === 'utility_bill');
    if (!hasUtility) {
      return {
        nextStatus: 'flagged',
        reasonEn: 'Auto-flagged by Rule #05: High-risk profile missing secondary proof of address.',
        reasonAr: 'مراجعة مطلوبة بموجب القاعدة #05: ملف عالي المخاطر يفتقر إلى إثبات عنوان ثانوي.',
      };
    }
  }

  // 4. Calculate minimum OCR confidence across submitted documents
  const minDocOcr =
    applicant.documents.length > 0
      ? Math.min(...applicant.documents.map((d) => d.ocrConfidence))
      : 0;

  // 5. Evaluate Fast-Track Auto-Approval
  if (
    applicant.riskScore <= config.autoApproveMaxRiskScore &&
    minDocOcr >= config.minOcrConfidence &&
    applicant.biometricMatchScore >= config.minBiometricScore &&
    !applicant.sanctionsMatch &&
    !applicant.pepMatch &&
    !applicant.adverseMediaMatch
  ) {
    return {
      nextStatus: 'approved',
      reasonEn: `Auto-approved by Fast-Track Engine (Risk ${applicant.riskScore} <= ${config.autoApproveMaxRiskScore}, OCR ${minDocOcr}% >= ${config.minOcrConfidence}%, Biometrics ${applicant.biometricMatchScore}%).`,
      reasonAr: `موافقة تلقائية عبر محرك المسار السريع (المخاطر ${applicant.riskScore}، دقة القراءة الضوئية ${minDocOcr}%، التطابق الحيوي ${applicant.biometricMatchScore}%).`,
    };
  }

  // 6. Otherwise flag for manual compliance officer review
  return {
    nextStatus: 'flagged',
    reasonEn: `Escalated to Manual Review: Thresholds not met for straight-through processing (Risk: ${applicant.riskScore}, Min OCR: ${minDocOcr}%, Biometric: ${applicant.biometricMatchScore}%).`,
    reasonAr: `تم التصعيد للمراجعة اليدوية: لم يتم استيفاء حدود المعالجة المباشرة (المخاطر: ${applicant.riskScore}، دقة القراءة: ${minDocOcr}%، التطابق الحيوي: ${applicant.biometricMatchScore}%).`,
  };
}

export function runAutomatedBatchWorkflow(
  applicants: KYCApplicant[],
  config: AutomationConfig,
  targetStatuses: VerificationStatus[] = ['pending', 'flagged']
): { updatedApplicants: KYCApplicant[]; summary: BatchRunResult } {
  const autoApprovedIds: string[] = [];
  const autoFlaggedIds: string[] = [];
  const autoRejectedIds: string[] = [];
  const unchangedIds: string[] = [];

  const updatedApplicants = applicants.map((applicant) => {
    if (!targetStatuses.includes(applicant.status)) {
      unchangedIds.push(applicant.id);
      return applicant;
    }

    const evaluation = evaluateApplicantWithRules(applicant, config);
    const updatedDocs = applicant.documents.map((doc) => ({
      ...doc,
      status: evaluation.nextStatus,
    }));

    const newAudit: AuditEvent = {
      id: `aud-${Date.now()}-${applicant.id}`,
      timestamp: '2026-10-17 08:40 UTC',
      actorEn: 'Automated Workflow Engine v3.2',
      actorAr: 'محرك سير العمل التلقائي v3.2',
      actionEn: `Status transitioned to ${evaluation.nextStatus.toUpperCase()}`,
      actionAr: `تم تحديث الحالة إلى ${
        evaluation.nextStatus === 'approved'
          ? 'معتمد'
          : evaluation.nextStatus === 'rejected'
          ? 'مرفوض'
          : 'مراجعة مطلوبة'
      }`,
      noteEn: evaluation.reasonEn,
      noteAr: evaluation.reasonAr,
    };

    if (evaluation.nextStatus === 'approved') autoApprovedIds.push(applicant.id);
    else if (evaluation.nextStatus === 'rejected') autoRejectedIds.push(applicant.id);
    else if (evaluation.nextStatus === 'flagged') autoFlaggedIds.push(applicant.id);

    return {
      ...applicant,
      status: evaluation.nextStatus,
      updatedAt: '2026-10-17 08:40 UTC',
      documents: updatedDocs,
      auditTrail: [newAudit, ...applicant.auditTrail],
    };
  });

  return {
    updatedApplicants,
    summary: {
      processedCount: autoApprovedIds.length + autoFlaggedIds.length + autoRejectedIds.length,
      autoApprovedIds,
      autoFlaggedIds,
      autoRejectedIds,
      unchangedIds,
    },
  };
}

export function filterAndSortApplicants(
  applicants: KYCApplicant[],
  options: {
    statusFilter: VerificationStatus | 'all';
    riskFilter: RiskTier | 'all';
    docTypeFilter: DocumentType | 'all';
    searchQuery: string;
    sortBy: 'submittedAt' | 'riskScore' | 'ocrConfidence';
    sortOrder: 'asc' | 'desc';
  }
): KYCApplicant[] {
  const q = options.searchQuery.trim().toLowerCase();

  const filtered = applicants.filter((item) => {
    if (options.statusFilter !== 'all' && item.status !== options.statusFilter) {
      return false;
    }
    if (options.riskFilter !== 'all' && item.riskTier !== options.riskFilter) {
      return false;
    }
    if (options.docTypeFilter !== 'all') {
      const hasDocType = item.documents.some((d) => d.type === options.docTypeFilter);
      if (!hasDocType) return false;
    }
    if (q.length > 0) {
      const matchesNameEn = item.fullNameEn.toLowerCase().includes(q);
      const matchesNameAr = item.fullNameAr.toLowerCase().includes(q);
      const matchesRef = item.referenceCode.toLowerCase().includes(q);
      const matchesEmail = item.email.toLowerCase().includes(q);
      const matchesCountryEn = item.countryEn.toLowerCase().includes(q);
      const matchesCountryAr = item.countryAr.toLowerCase().includes(q);
      const matchesDocNum = item.documents.some((d) => d.docNumber.toLowerCase().includes(q));
      if (
        !matchesNameEn &&
        !matchesNameAr &&
        !matchesRef &&
        !matchesEmail &&
        !matchesCountryEn &&
        !matchesCountryAr &&
        !matchesDocNum
      ) {
        return false;
      }
    }
    return true;
  });

  return [...filtered].sort((a, b) => {
    let valA = 0;
    let valB = 0;

    if (options.sortBy === 'riskScore') {
      valA = a.riskScore;
      valB = b.riskScore;
    } else if (options.sortBy === 'ocrConfidence') {
      valA = a.documents.length ? Math.min(...a.documents.map((d) => d.ocrConfidence)) : 0;
      valB = b.documents.length ? Math.min(...b.documents.map((d) => d.ocrConfidence)) : 0;
    } else {
      valA = new Date(a.submittedAt.replace(' UTC', 'Z')).getTime() || 0;
      valB = new Date(b.submittedAt.replace(' UTC', 'Z')).getTime() || 0;
    }

    return options.sortOrder === 'asc' ? valA - valB : valB - valA;
  });
}

export function computeKpiMetrics(applicants: KYCApplicant[]) {
  const total = applicants.length;
  const approved = applicants.filter((a) => a.status === 'approved').length;
  const pending = applicants.filter((a) => a.status === 'pending').length;
  const flagged = applicants.filter((a) => a.status === 'flagged').length;
  const rejected = applicants.filter((a) => a.status === 'rejected').length;

  const approvalRate = total > 0 ? Math.round((approved / total) * 1000) / 10 : 0;
  const avgOcr =
    total > 0
      ? Math.round(
          (applicants.reduce((acc, item) => {
            const itemAvg =
              item.documents.reduce((s, d) => s + d.ocrConfidence, 0) /
              Math.max(1, item.documents.length);
            return acc + itemAvg;
          }, 0) /
            total) *
            10
        ) / 10
      : 0;

  const totalDocs = applicants.reduce((sum, a) => sum + a.documents.length, 0);

  return {
    total,
    approved,
    pending,
    flagged,
    rejected,
    actionRequired: pending + flagged,
    approvalRate,
    avgOcr,
    totalDocs,
  };
}
