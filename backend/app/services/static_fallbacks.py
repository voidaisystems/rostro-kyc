from typing import Dict
from ..models.transaction import CoachingResponse

STATIC_FALLBACK_ADVISORIES: Dict[str, Dict[str, str]] = {
    "advance_fee_lottery": {
        "coaching_message": "عيني حيدر دير بالك! ماكو أي جهة أو شركة رسمية بالعراق تطلب منك تدفع فلوس أو رسوم حتى تستلم جائزة سيارة أو مبالغ نقدية. المحتالين يستخدمون هذا الأسلوب حتى يسحبون فلوسك ويختفون.",
        "scammer_next_move_warning": "المحتال راح يضغط عليك ويكلك: 'الفرصة تروح إذا ما تحول خلال ربع ساعة'.",
        "recommended_action": "cancel"
    },
    "fake_support_otp": {
        "coaching_message": "تحذير أمني عاجل: موظفو زين كاش الحقيقيون لا يطلبون أبداً رمز الـ OTP أو كود التأكيد أو تحويل أموال لحسابات شخصية لتفعيل المحفظة. أي شخص يطلب هذا هو محتال بنسبة 100%.",
        "scammer_next_move_warning": "راح يهددك بإلغاء حسابك أو تجميد خطك إذا ما تنطيه الرمز فوراً.",
        "recommended_action": "cancel"
    },
    "safe_government_account": {
        "coaching_message": "تنبيه هام: لا توجد أي جهة قضائية أو أمنية في العراق تمتلك 'حسابات أمان' على أرقام هواتف شخصية. تحويل أموالك بحجة التحقيق أو التدقيق الأمني هو عملية احتيال واضحة.",
        "scammer_next_move_warning": "راح يحذرك ويطلب منك ما تغلق الخط ولا تسولف وية أهلك بحجة إن القضية سرية.",
        "recommended_action": "cancel"
    },
    "fraudulent_social_merchant": {
        "coaching_message": "انتبه: أنت تحول لحساب شخصي عادي مو حساب تاجر معتمد. صفحات الانستغرام غير الموثقة اللي ترفض الدفع عند الاستلام غالباً ما تكون صفحات وهمية لسرقة العربون.",
        "scammer_next_move_warning": "راح يطلب منك تحول المبلغ كامل بحجة إن المندوب ما يستلم كاش.",
        "recommended_action": "review_carefully"
    },
    "impersonated_relative": {
        "coaching_message": "يرجى التوقف والتحقق: حسابات الواتساب والتلكرام تتعرض للاختراق يومياً. اتصل بقريبك الآن بمكالمة هاتفية عادية واسمع صوته بنفسك قبل ما ترسل أي دينار.",
        "scammer_next_move_warning": "راح يدعي إنه مستعجل كلش وسوى حادث وما يلحك يخابرك صوت.",
        "recommended_action": "review_carefully"
    },
    "default": {
        "coaching_message": "تنبيه أمان: لاحظنا أنك تقوم بتحويل مبلغ غير معتاد إلى رقم غير مسجل في جهات اتصالك. نرجو التأكد من هوية المستلم والغرض من التحويل قبل إتمام العملية.",
        "scammer_next_move_warning": "المحتالون دائماً يستغلون الاستعجال ويضغطون على الضحية لاتخاذ قرار سريع.",
        "recommended_action": "review_carefully"
    }
}

def get_static_fallback(archetype: str = "default") -> CoachingResponse:
    data = STATIC_FALLBACK_ADVISORIES.get(archetype, STATIC_FALLBACK_ADVISORIES["default"])
    return CoachingResponse(
        coaching_message=data["coaching_message"],
        scam_archetype_detected=archetype,
        scammer_next_move_warning=data["scammer_next_move_warning"],
        urgency_level="high",
        recommended_action=data["recommended_action"],
        is_fallback=True
    )
