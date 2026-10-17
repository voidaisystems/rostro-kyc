import re
import unicodedata
from typing import List, Tuple

class IraqiArabicNormalizer:
    # Common Arabic religious compound prefixes in Iraq
    COMPOUND_PREFIXES = [
        "عبد", "نور", "سيف", "علاء", "بهاء", "ضياء", "شمس", "حسام", "صباح",
        "تقي", "مهدي", "نجم", "صدر", "عماد", "جمال", "كمال", "جلال"
    ]
    
    DIVINE_OR_HONORIFIC_SUFFIXES = [
        "الله", "الرحمن", "الرحيم", "الكاظم", "الحسين", "الرضا", "الزهراء", "الزهرة",
        "الجبار", "الخالق", "العزيز", "المهدي", "الدين", "الاسلام", "الحق", "العباس"
    ]

    TRIBAL_PREFIXES = ["ال", "آل", "ابن", "بني", "بيت"]

    @classmethod
    def normalize_orthography(cls, text: str) -> str:
        if not text:
            return ""

        # 1. Unicode NFKC Normalization
        text = unicodedata.normalize("NFKC", text.strip())

        # 2. Strip diacritics (Harakat)
        text = re.sub(r'[\u064B-\u065F\u0670]', '', text)

        # 3. Strip Tatweel (Kashida)
        text = re.sub(r'\u0640', '', text)

        # 4. Canonicalize Alef variations: [أ، إ، آ، ٱ] -> ا
        text = re.sub(r'[أإآٱ]', 'ا', text)

        # 5. Canonicalize Yaa & Alif Maqsura: [ى، ئ] -> ي
        text = re.sub(r'[ىئ]', 'ي', text)

        # 6. Canonicalize Taa Marbuta: ة -> ه
        text = re.sub(r'ة', 'ه', text)

        # 7. Collapse multiple spaces
        text = re.sub(r'\s+', ' ', text).strip()

        return text

    @classmethod
    def tokenize_and_bind_compounds(cls, normalized_name: str) -> List[str]:
        raw_tokens = normalized_name.split()
        if not raw_tokens:
            return []

        bound_tokens = []
        i = 0
        n = len(raw_tokens)

        while i < n:
            token = raw_tokens[i]

            # Check if this token is a compound prefix and next token is an honorific/divine suffix
            if i + 1 < n:
                next_token = raw_tokens[i + 1]
                # E.g. "عبد" + "الزهره" or "نور" + "الدين"
                if token in cls.COMPOUND_PREFIXES and (next_token in cls.DIVINE_OR_HONORIFIC_SUFFIXES or next_token.startswith("ال")):
                    bound_tokens.append(f"{token}_{next_token}")
                    i += 2
                    continue
                # E.g. "ابو" + "فهد" or "ال" + "جبوري"
                if token in ["ابو", "ابن", "ام", "ال", "الـ"]:
                    bound_tokens.append(f"{token}_{next_token}")
                    i += 2
                    continue

            bound_tokens.append(token)
            i += 1

        return bound_tokens

    @classmethod
    def strip_tribal_prefix(cls, token: str) -> str:
        # Strip "ال" from start of tribe or name if present
        if token.startswith("ال_"):
            return token[3:]
        if token.startswith("ال") and len(token) > 3:
            return token[2:]
        return token

    @classmethod
    def levenshtein_similarity(cls, s1: str, s2: str) -> float:
        if s1 == s2:
            return 1.0
        if not s1 or not s2:
            return 0.0

        len1, len2 = len(s1), len(s2)
        dp = [[0] * (len2 + 1) for _ in range(len1 + 1)]

        for i in range(len1 + 1):
            dp[i][0] = i
        for j in range(len2 + 1):
            dp[0][j] = j

        for i in range(1, len1 + 1):
            for j in range(1, len2 + 1):
                cost = 0 if s1[i - 1] == s2[j - 1] else 1
                dp[i][j] = min(
                    dp[i - 1][j] + 1,      # deletion
                    dp[i][j - 1] + 1,      # insertion
                    dp[i - 1][j - 1] + cost # substitution
                )

        dist = dp[len1][len2]
        max_len = max(len1, len2)
        return max(0.0, 1.0 - (dist / max_len))

    @classmethod
    def compare_iraqi_names(cls, name_a: str, name_b: str) -> Tuple[float, str]:
        """
        Compares two Iraqi names with position-weighted token reconciliation:
        - First Name (Weight: 40%)
        - Father's Name (Weight: 30%)
        - Grandfather's Name (Weight: 20%)
        - Surname/Tribe (Weight: 10%)
        """
        norm_a = cls.normalize_orthography(name_a)
        norm_b = cls.normalize_orthography(name_b)

        if norm_a == norm_b:
            return 1.0, "EXACT_CANONICAL_MATCH"

        tokens_a = cls.tokenize_and_bind_compounds(norm_a)
        tokens_b = cls.tokenize_and_bind_compounds(norm_b)

        if not tokens_a or not tokens_b:
            return 0.0, "EMPTY_NAME_COMPARISON"

        # Position weights for up to 4 tokens
        weights = [0.40, 0.30, 0.20, 0.10]
        total_score = 0.0
        evaluated_weight = 0.0

        min_len = min(len(tokens_a), len(tokens_b))

        for idx in range(min_len):
            w = weights[idx] if idx < len(weights) else 0.05
            t_a = cls.strip_tribal_prefix(tokens_a[idx])
            t_b = cls.strip_tribal_prefix(tokens_b[idx])

            sim = cls.levenshtein_similarity(t_a, t_b)
            total_score += sim * w
            evaluated_weight += w

        # Handle omitted tribal title or 4th grandfather name
        if len(tokens_a) != len(tokens_b):
            remaining_weight = 1.0 - evaluated_weight
            # If the difference is just an omitted surname or 4th token, allow high partial credit
            total_score += remaining_weight * 0.75
        
        final_score = round(min(1.0, total_score), 3)

        if final_score >= 0.90:
            status = "STRONG_MATCH"
        elif final_score >= 0.75:
            status = "PROBABLE_MATCH_MINOR_OMISSION"
        else:
            status = "NAME_MISMATCH"

        return final_score, status
