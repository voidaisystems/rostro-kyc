#!/usr/bin/env python3
"""
Project Rostro (روسترو) — Iraqi KYC Synthetic Document Generator using Python Faker
===================================================================================
Uses Faker (ar_AA & en_US locales) + ICAO Doc 9303 Modulo-10 Checksum Math + Pillow
to generate 3 realistic, 100% synthetic, watermarked Iraqi KYC documents:
  1. Unified Iraqi National Card (البطاقة الوطنية الموحدة — IRQ_NATIONAL_ID)
  2. Iraqi Residence Card (بطاقة السكن — IRQ_RESIDENCE_CARD)
  3. Chamber of Commerce License (إجازة غرفة التجارة — IRQ_CHAMBER_COMMERCE)

All generated images include prominent "SPECIMEN / عينة تركيبية (FAKER)" watermarks
and contain zero real personal data.
"""

import json
import os
import random
from datetime import date, timedelta
from faker import Faker
from PIL import Image, ImageDraw, ImageFont
import arabic_reshaper
from bidi.algorithm import get_display

# Initialize Faker with Arabic and English locales
fake_ar = Faker("ar_AA")
fake_en = Faker("en_US")
Faker.seed(20261017)
random.seed(20261017)

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "synthetic_kyc", "faker_specimens")
os.makedirs(OUTPUT_DIR, exist_ok=True)

FONT_PATH = "/System/Library/Fonts/Supplemental/Tahoma.ttf"
if not os.path.exists(FONT_PATH):
    FONT_PATH = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"


def ar(text: str) -> str:
    """Reshapes Arabic script and applies BiDi visual ordering for Pillow rendering."""
    if not text:
        return ""
    reshaped = arabic_reshaper.reshape(str(text))
    return get_display(reshaped)


def to_arabic_indic(num_str: str) -> str:
    """Converts ASCII digits 0-9 to Arabic-Indic digits ٠-٩."""
    table = str.maketrans("0123456789", "٠١٢٣٤٥٦٧٨٩")
    return str(num_str).translate(table)


def compute_icao_mod10(s: str) -> int:
    """Computes ICAO Doc 9303 Modulo-10 check digit using (7, 3, 1) weights."""
    weights = [7, 3, 1]
    total = 0
    for i, ch in enumerate(s.upper()):
        if "0" <= ch <= "9":
            val = ord(ch) - ord("0")
        elif "A" <= ch <= "Z":
            val = ord(ch) - ord("A") + 10
        else:
            val = 0
        total += val * weights[i % 3]
    return total % 10


def build_td1_mrz(doc_serial: str, dob_yyMMdd: str, sex: str, exp_yyMMdd: str, name_en_mrz: str):
    """Builds a mathematically valid 3x30 TD1 MRZ block for an Iraqi National ID."""
    doc9 = doc_serial.upper().ljust(9, "<")[:9]
    doc_chk = compute_icao_mod10(doc9)
    l1 = f"I<IRQ{doc9}{doc_chk}".ljust(30, "<")

    dob_chk = compute_icao_mod10(dob_yyMMdd)
    exp_chk = compute_icao_mod10(exp_yyMMdd)
    l2_prefix = f"{dob_yyMMdd}{dob_chk}{sex}{exp_yyMMdd}{exp_chk}IRQ<<<<<<<<<<<"
    comp_input = l1[5:30] + l2_prefix[0:7] + l2_prefix[8:15] + l2_prefix[18:29]
    comp_chk = compute_icao_mod10(comp_input)
    l2 = l2_prefix[:29] + str(comp_chk)

    l3 = name_en_mrz.upper().replace(" ", "<").ljust(30, "<")[:30]
    return l1, l2, l3


def generate_synthetic_iraqi_profile():
    """Generates a cohesive Iraqi merchant identity using Faker."""
    first_name = fake_ar.first_name_male()
    father_name = fake_ar.first_name_male()
    grandfather_name = fake_ar.first_name_male()
    iraq_clans = [
        ("الجبوري", "AL<JUBOURI"),
        ("التميمي", "AL<TAMIMI"),
        ("الشمري", "AL<SHAMMARI"),
        ("الدليمي", "AL<DULAIMI"),
        ("الساعدي", "AL<SAADI"),
        ("الكبيسي", "AL<KUBAISI"),
        ("الربيعي", "AL<RUBAIE"),
    ]
    clan_ar, clan_mrz = random.choice(iraq_clans)

    # Strip tashkeel (diacritics) from Faker ar_AA names for crisp rendering
    def strip_diacritics(s: str) -> str:
        return "".join(c for c in s if not (0x064B <= ord(c) <= 0x065F))

    first_name = strip_diacritics(first_name)
    father_name = strip_diacritics(father_name)
    grandfather_name = strip_diacritics(grandfather_name)
    full_name_ar = f"{first_name} {father_name} {grandfather_name} {clan_ar}"
    mother_name_ar = strip_diacritics(f"{fake_ar.first_name_female()} {fake_ar.first_name_male()}")

    dob_date = fake_en.date_of_birth(minimum_age=28, maximum_age=52)
    dob_iso = dob_date.strftime("%Y-%m-%d")
    dob_mrz = dob_date.strftime("%y%m%d")

    issue_date = date(2024, 3, 15)
    exp_date = date(2032, 3, 15)
    exp_iso = exp_date.strftime("%Y-%m-%d")
    exp_mrz = exp_date.strftime("%y%m%d")

    # 12-digit Iraqi National ID starting with birth year
    national_id_12 = f"{dob_date.year}{fake_en.numerify('########')}"
    doc_serial = f"A{fake_en.numerify('########')}"

    mrz_l1, mrz_l2, mrz_l3 = build_td1_mrz(
        doc_serial=doc_serial,
        dob_yyMMdd=dob_mrz,
        sex="M",
        exp_yyMMdd=exp_mrz,
        name_en_mrz=f"{clan_mrz}<<ABDULGHAFFAR<JAMIL<M"
    )

    mahalla = fake_en.numerify("###")
    zukak = fake_en.numerify("##")
    dar = fake_en.numerify("##")
    res_form_num = fake_en.numerify("######")
    info_office = "مكتب معلومات الكرادة الشرقية"
    full_address_ar = f"بغداد - الكرادة - م {to_arabic_indic(mahalla)} ز {to_arabic_indic(zukak)} د {to_arabic_indic(dar)}"

    license_num = f"BG-2025-{fake_en.numerify('#####')}"
    trade_name_ar = f"شركة {fake_ar.last_name()} للتجارة العامة والمقاولات"
    lic_issue_iso = "2025-01-20"
    lic_exp_iso = "2029-01-20"

    return {
        "generator": "Python Faker (ar_AA / en_US) + Rostro Iraqi KYC Provider",
        "full_name_ar": full_name_ar,
        "mother_name_ar": mother_name_ar,
        "date_of_birth": dob_iso,
        "national_id_number": national_id_12,
        "document_serial": doc_serial,
        "expiry_date": exp_iso,
        "mrz_line1": mrz_l1,
        "mrz_line2": mrz_l2,
        "mrz_line3": mrz_l3,
        "residence_card": {
            "head_of_family_name": full_name_ar,
            "information_office": info_office,
            "full_address": full_address_ar,
            "form_number": to_arabic_indic(res_form_num),
            "governorate": "بغداد"
        },
        "chamber_license": {
            "license_number": license_num,
            "commercial_trade_name": trade_name_ar,
            "owner_name": full_name_ar,
            "commercial_class": "الأولى - ممتازة",
            "issue_date": lic_issue_iso,
            "expiry_date": lic_exp_iso,
            "governorate": "بغداد"
        }
    }


def draw_watermark_stamp(draw, width, height):
    """Draws a clear SPECIMEN / عينة تركيبية badge so the image is unmistakably synthetic."""
    font_wm = ImageFont.truetype(FONT_PATH, 16)
    badge_text = ar("عينة اختبار تركيبية (Faker Specimen) — غير صالحة للتداول الرسمي")
    draw.rounded_rectangle([(20, height - 42), (width - 20, height - 12)], radius=6, fill=(254, 243, 199), outline=(217, 119, 6), width=2)
    draw.text((width // 2, height - 27), badge_text, font=font_wm, fill=(146, 64, 14), anchor="mm")


def render_doc1_national_id(profile, out_path):
    """Renders Document 1: Unified Iraqi National Card (البطاقة الوطنية الموحدة)."""
    W, H = 900, 570
    img = Image.new("RGB", (W, H), (241, 245, 249))
    draw = ImageDraw.Draw(img)

    font_header = ImageFont.truetype(FONT_PATH, 26)
    font_sub = ImageFont.truetype(FONT_PATH, 18)
    font_label = ImageFont.truetype(FONT_PATH, 18)
    font_val = ImageFont.truetype(FONT_PATH, 21)
    font_mrz = ImageFont.truetype("/System/Library/Fonts/Supplemental/Courier New Bold.ttf", 21) if os.path.exists("/System/Library/Fonts/Supplemental/Courier New Bold.ttf") else font_val

    # Card border & guilloche-style background stripes
    draw.rounded_rectangle([(12, 12), (W - 12, H - 12)], radius=22, fill=(248, 250, 252), outline=(2, 132, 199), width=4)
    for y in range(110, 420, 18):
        draw.line([(20, y), (W - 20, y)], fill=(224, 242, 254), width=1)

    # Top Header Band
    draw.rounded_rectangle([(16, 16), (W - 16, 98)], radius=18, fill=(3, 105, 161))
    draw.text((W - 40, 42), ar("جمهورية العراق — وزارة الداخلية"), font=font_header, fill=(255, 255, 255), anchor="ra")
    draw.text((W - 40, 74), ar("مديرية شؤون البطاقة الوطنية — البطاقة الوطنية الموحدة"), font=font_sub, fill=(186, 230, 253), anchor="ra")
    draw.text((40, 55), "REPUBLIC OF IRAQ - NATIONAL CARD", font=font_sub, fill=(224, 242, 254), anchor="lm")

    # Synthetic Portrait Placeholder & Gold Chip
    draw.rounded_rectangle([(45, 125), (215, 335)], radius=12, fill=(203, 213, 225), outline=(100, 116, 139), width=2)
    draw.text((130, 215), "SPECIMEN", font=font_sub, fill=(71, 85, 105), anchor="mm")
    draw.text((130, 245), ar("صورة رمزية"), font=font_sub, fill=(71, 85, 105), anchor="mm")

    # Gold Chip
    draw.rounded_rectangle([(245, 140), (320, 195)], radius=8, fill=(250, 204, 21), outline=(161, 98, 7), width=2)

    # Right-to-Left Fields
    fields = [
        ("الرقم الوطني الموحد:", to_arabic_indic(profile["national_id_number"]) + f"  ({profile['national_id_number']})"),
        ("الاسم الكامل:", profile["full_name_ar"]),
        ("اسم الأم:", profile["mother_name_ar"]),
        ("تاريخ الولادة:", profile["date_of_birth"]),
        ("تاريخ النفاذ:", profile["expiry_date"]),
        ("رقم البطاقة:", profile["document_serial"]),
    ]

    y_pos = 130
    for label_ar, value_str in fields:
        draw.text((W - 45, y_pos), ar(label_ar), font=font_label, fill=(71, 85, 105), anchor="ra")
        draw.text((W - 230, y_pos), ar(value_str), font=font_val, fill=(15, 23, 42), anchor="ra")
        y_pos += 44

    # Bottom ICAO Doc 9303 TD1 MRZ Zone (3 lines x 30 chars)
    draw.rounded_rectangle([(30, 405), (W - 30, 512)], radius=10, fill=(255, 255, 255), outline=(148, 163, 184), width=2)
    draw.text((55, 422), profile["mrz_line1"], font=font_mrz, fill=(15, 23, 42))
    draw.text((55, 452), profile["mrz_line2"], font=font_mrz, fill=(15, 23, 42))
    draw.text((55, 482), profile["mrz_line3"], font=font_mrz, fill=(15, 23, 42))

    draw_watermark_stamp(draw, W, H)
    img.save(out_path, "JPEG", quality=95)


def render_doc2_residence_card(profile, out_path):
    """Renders Document 2: Iraqi Residence Card (بطاقة السكن — IRQ_RESIDENCE_CARD)."""
    W, H = 900, 570
    img = Image.new("RGB", (W, H), (240, 253, 244))
    draw = ImageDraw.Draw(img)

    font_header = ImageFont.truetype(FONT_PATH, 26)
    font_sub = ImageFont.truetype(FONT_PATH, 18)
    font_label = ImageFont.truetype(FONT_PATH, 19)
    font_val = ImageFont.truetype(FONT_PATH, 22)

    draw.rounded_rectangle([(12, 12), (W - 12, H - 12)], radius=22, fill=(247, 254, 231), outline=(21, 128, 61), width=4)

    # Top Header Band
    draw.rounded_rectangle([(16, 16), (W - 16, 98)], radius=18, fill=(22, 101, 52))
    draw.text((W - 40, 42), ar("جمهورية العراق — وزارة الداخلية — مديرية الأحوال المدنية"), font=font_header, fill=(255, 255, 255), anchor="ra")
    draw.text((W - 40, 74), ar("بطاقة السكن العراقية (تأييد عنوان السكن العائلي)"), font=font_sub, fill=(187, 247, 208), anchor="ra")
    draw.text((40, 55), "IRAQI RESIDENCE CARD", font=font_sub, fill=(220, 252, 231), anchor="lm")

    res = profile["residence_card"]
    rows = [
        ("اسم رب الأسرة:", res["head_of_family_name"]),
        ("مكتب المعلومات:", res["information_office"]),
        ("عنوان السكن الكامل:", res["full_address"]),
        ("رقم الاستمارة:", res["form_number"]),
        ("المحافظة:", res["governorate"]),
        ("الرقم الوطني لرب الأسرة:", profile["national_id_number"]),
    ]

    y_pos = 140
    for label_ar, val_str in rows:
        draw.rounded_rectangle([(230, y_pos - 12), (W - 40, y_pos + 32)], radius=8, fill=(255, 255, 255), outline=(187, 247, 208), width=1)
        draw.text((W - 60, y_pos), ar(label_ar), font=font_label, fill=(22, 101, 52), anchor="ra")
        draw.text((W - 290, y_pos), ar(val_str), font=font_val, fill=(15, 23, 42), anchor="ra")
        y_pos += 58

    # Official Seal Simulation Box in Left Column
    draw.ellipse([(45, 250), (205, 410)], fill=(240, 253, 244), outline=(22, 101, 52), width=3)
    draw.ellipse([(53, 258), (197, 402)], outline=(21, 128, 61), width=1)
    draw.text((125, 315), ar("ختم مكتب المعلومات"), font=font_sub, fill=(22, 101, 52), anchor="mm")
    draw.text((125, 345), "SPECIMEN SEAL", font=font_sub, fill=(22, 101, 52), anchor="mm")

    draw_watermark_stamp(draw, W, H)
    img.save(out_path, "JPEG", quality=95)


def render_doc3_chamber_license(profile, out_path):
    """Renders Document 3: Chamber of Commerce License (إجازة غرفة التجارة — IRQ_CHAMBER_COMMERCE)."""
    W, H = 900, 570
    img = Image.new("RGB", (W, H), (255, 251, 235))
    draw = ImageDraw.Draw(img)

    font_header = ImageFont.truetype(FONT_PATH, 25)
    font_sub = ImageFont.truetype(FONT_PATH, 18)
    font_label = ImageFont.truetype(FONT_PATH, 19)
    font_val = ImageFont.truetype(FONT_PATH, 21)

    draw.rounded_rectangle([(12, 12), (W - 12, H - 12)], radius=22, fill=(254, 252, 232), outline=(180, 83, 9), width=4)

    # Header
    draw.rounded_rectangle([(16, 16), (W - 16, 98)], radius=18, fill=(146, 64, 14))
    draw.text((W - 40, 42), ar("اتحاد الغرف التجارية العراقية — غرفة تجارة بغداد"), font=font_header, fill=(255, 255, 255), anchor="ra")
    draw.text((W - 40, 74), ar("شهادة تسجيل وإجازة ممارسة المهنة التجارية"), font=font_sub, fill=(253, 230, 138), anchor="ra")
    draw.text((40, 55), "CHAMBER OF COMMERCE LICENSE", font=font_sub, fill=(254, 243, 199), anchor="lm")

    lic = profile["chamber_license"]
    rows = [
        ("رقم الإجازة / العضوية:", lic["license_number"]),
        ("الاسم التجاري للمنشأة:", lic["commercial_trade_name"]),
        ("اسم صاحب العمل / المالك:", lic["owner_name"]),
        ("الصنف / الدرجة التجارية:", lic["commercial_class"]),
        ("تاريخ الإصدار:", lic["issue_date"]),
        ("تاريخ النفاذ (الصلاحية):", lic["expiry_date"]),
        ("المحافظة:", lic["governorate"]),
    ]

    y_pos = 132
    for label_ar, val_str in rows:
        draw.rounded_rectangle([(50, y_pos - 10), (W - 40, y_pos + 30)], radius=8, fill=(255, 255, 255), outline=(253, 230, 138), width=1)
        draw.text((W - 60, y_pos), ar(label_ar), font=font_label, fill=(146, 64, 14), anchor="ra")
        draw.text((W - 295, y_pos), ar(val_str), font=font_val, fill=(15, 23, 42), anchor="ra")
        y_pos += 52

    draw_watermark_stamp(draw, W, H)
    img.save(out_path, "JPEG", quality=95)


if __name__ == "__main__":
    profile = generate_synthetic_iraqi_profile()

    p1 = os.path.join(OUTPUT_DIR, "01_faker_national_id.jpg")
    p2 = os.path.join(OUTPUT_DIR, "02_faker_residence_card.jpg")
    p3 = os.path.join(OUTPUT_DIR, "03_faker_chamber_license.jpg")
    manifest_path = os.path.join(OUTPUT_DIR, "faker_generated_pack.json")

    render_doc1_national_id(profile, p1)
    render_doc2_residence_card(profile, p2)
    render_doc3_chamber_license(profile, p3)

    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(profile, f, ensure_ascii=False, indent=2)

    print("Generated 3 Faker Iraqi KYC Documents:")
    print("  1.", p1)
    print("  2.", p2)
    print("  3.", p3)
    print("  Manifest:", manifest_path)
    print("  Merchant:", profile["full_name_ar"], "| National ID:", profile["national_id_number"])
