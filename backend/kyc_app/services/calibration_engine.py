import re
from typing import Optional, Dict, Any, List, Tuple
from datetime import datetime

class CalibrationEngine:
    DATE_REGEX = re.compile(r"^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$")
    NATIONAL_ID_REGEX = re.compile(r"^(19|20)\d{2}\d{8}$")  # 12 digits starting with valid birth year
    TAX_ID_REGEX = re.compile(r"^\d{9,12}$")
    LICENSE_NUM_REGEX = re.compile(r"^[A-Za-z0-9\-_/]{4,20}$")

    ALPHA_CLARITY = 0.35
    BETA_MODEL_PROB = 0.40
    GAMMA_SYNTAX = 0.25

    @classmethod
    def validate_field_syntax(cls, field_name: str, value: Optional[str]) -> Tuple[float, Optional[str]]:
        if not value or not value.strip():
            return 0.0, "FIELD_EMPTY_OR_UNREADABLE"

        val = value.strip()

        if "date" in field_name or "birth" in field_name or "expiry" in field_name or "issue" in field_name:
            if cls.DATE_REGEX.match(val):
                # Verify date logic
                try:
                    datetime.strptime(val, "%Y-%m-%d")
                    return 1.0, None
                except ValueError:
                    return 0.2, "INVALID_CALENDAR_DATE"
            return 0.0, "MALFORMED_DATE_FORMAT"

        if "national_id" in field_name:
            clean_digits = re.sub(r"\D", "", val)
            if cls.NATIONAL_ID_REGEX.match(clean_digits):
                return 1.0, None
            if len(clean_digits) == 12:
                return 0.8, "NON_STANDARD_YEAR_PREFIX"
            return 0.1, "INVALID_NATIONAL_ID_LENGTH"

        if "tax_id" in field_name:
            clean_digits = re.sub(r"\D", "", val)
            if cls.TAX_ID_REGEX.match(clean_digits):
                return 1.0, None
            return 0.2, "MALFORMED_TAX_IDENTIFIER"

        if "license_number" in field_name:
            if cls.LICENSE_NUM_REGEX.match(val):
                return 1.0, None
            return 0.5, "NON_STANDARD_LICENSE_FORMAT"

        if "gender" in field_name:
            if val in ["ذكر", "أنثى"]:
                return 1.0, None
            return 0.0, "INVALID_GENDER_TOKEN"

        # General text fields (names, activity, governorate)
        if len(val) >= 3:
            return 1.0, None
        return 0.3, "SUSPICIOUSLY_SHORT_TEXT"

    @classmethod
    def compute_field_confidence(
        cls,
        field_name: str,
        raw_value: Optional[str],
        document_clarity_score: float,
        model_prob: float,
        is_occluded: bool = False
    ) -> Tuple[float, Optional[str]]:
        """
        Computes mathematically grounded tri-factor confidence:
        C(f) = 0.35 * V_clarity + 0.40 * M_prob + 0.25 * S_syntax
        Enforces "Blank and Flagged Beats Invented".
        """
        if is_occluded or not raw_value or raw_value.lower() in ["null", "none", "", "[unreadable]"]:
            return 0.15, "OCCLUDED_OR_SPECULAR_GLARE"

        syntax_score, syntax_flag = cls.validate_field_syntax(field_name, raw_value)

        # Severe penalty if optical clarity is poor
        adjusted_clarity = document_clarity_score
        if document_clarity_score < 0.40:
            # Low clarity dampens model probability (prevents hallucination through blur/glare)
            model_prob = min(model_prob, 0.45)

        raw_conf = (
            cls.ALPHA_CLARITY * adjusted_clarity +
            cls.BETA_MODEL_PROB * model_prob +
            cls.GAMMA_SYNTAX * syntax_score
        )

        calibrated = round(min(1.0, max(0.0, raw_conf)), 3)
        flag = syntax_flag if syntax_score < 0.6 else None

        return calibrated, flag

    @classmethod
    def calculate_expected_calibration_error(
        cls,
        confidences: List[float],
        accuracies: List[bool],
        num_bins: int = 5
    ) -> float:
        """
        Computes empirical Expected Calibration Error (ECE):
        ECE = sum_b ( |acc(B_b) - conf(B_b)| * |B_b| / N )
        """
        if not confidences or len(confidences) != len(accuracies):
            return 0.0

        n = len(confidences)
        bin_boundaries = [i / num_bins for i in range(num_bins + 1)]
        ece = 0.0

        for i in range(num_bins):
            bin_lower = bin_boundaries[i]
            bin_upper = bin_boundaries[i + 1]

            # Indices of items falling in this bin
            bin_indices = [
                idx for idx, c in enumerate(confidences)
                if bin_lower <= c < bin_upper or (i == num_bins - 1 and bin_lower <= c <= bin_upper)
            ]

            bin_size = len(bin_indices)
            if bin_size > 0:
                bin_acc = sum(1 for idx in bin_indices if accuracies[idx]) / bin_size
                bin_conf = sum(confidences[idx] for idx in bin_indices) / bin_size
                ece += abs(bin_acc - bin_conf) * (bin_size / n)

        return round(ece, 4)
