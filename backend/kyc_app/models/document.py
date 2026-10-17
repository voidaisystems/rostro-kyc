from datetime import date, datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ExtractedField(BaseModel):
    field_name: str
    raw_value: Optional[str] = None
    normalized_value: Optional[str] = None
    confidence: float = Field(..., ge=0.0, le=1.0)
    bounding_box: Optional[Dict[str, float]] = None  # {ymin, xmin, ymax, xmax} normalized 0-1
    is_occluded: bool = False
    flag_reason: Optional[str] = None  # e.g., "OPTICAL_GLARE", "BLURRED_TEXT", "PARTIAL_CROP"

class UnifiedNationalCard(BaseModel):
    national_id_number: ExtractedField
    full_name_ar: ExtractedField
    mother_name_ar: ExtractedField
    date_of_birth: ExtractedField
    gender: ExtractedField
    expiry_date: ExtractedField
    family_number: Optional[ExtractedField] = None
    document_clarity_score: float = Field(..., ge=0.0, le=1.0)

class ChamberCommerceLicense(BaseModel):
    license_number: ExtractedField
    commercial_trade_name: ExtractedField
    owner_name: ExtractedField
    commercial_class: ExtractedField  # ممتازة، أولى، ثانية، إلخ
    activity_type: ExtractedField
    issue_date: ExtractedField
    expiry_date: ExtractedField
    governorate: ExtractedField
    document_clarity_score: float = Field(..., ge=0.0, le=1.0)

class TaxIdentificationCard(BaseModel):
    tax_id_number: ExtractedField
    taxpayer_name: ExtractedField
    national_id_reference: ExtractedField
    tax_branch: ExtractedField
    tax_year_status: ExtractedField
    document_clarity_score: float = Field(..., ge=0.0, le=1.0)

class MerchantKYCDocumentSet(BaseModel):
    application_id: str
    merchant_trade_name: str
    submission_timestamp: datetime = Field(default_factory=datetime.utcnow)
    national_card: UnifiedNationalCard
    business_license: ChamberCommerceLicense
    tax_card: TaxIdentificationCard

class CrossCheckResult(BaseModel):
    check_name: str
    status: str  # "MATCH", "MISMATCH", "UNVERIFIABLE", "EXPIRED"
    score: float = Field(..., ge=0.0, le=1.0)
    details: str
    source_fields: List[str]

class ReviewerSummaryDossier(BaseModel):
    recommended_decision: str  # "AUTO_PASS", "MANUAL_REVIEW_REQUIRED", "REJECT"
    overall_confidence: float = Field(..., ge=0.0, le=1.0)
    decision_rationale_ar: str
    identified_flags: List[str]
    estimated_human_review_seconds: int

class KYCApplicationEvaluation(BaseModel):
    application_id: str
    status: str  # "APPROVED_AUTOMATIC", "NEEDS_MANUAL_REVIEW", "REJECTED_AUTOMATIC"
    overall_confidence: float
    field_extractions: Dict[str, Any]
    cross_checks: List[CrossCheckResult]
    reviewer_dossier: ReviewerSummaryDossier
