# Catalogue of Real-World Iraqi Scam Patterns & Signatures

> **Document Purpose:** Fulfills the official brief requirement:  
> *"Research real Iraqi scam patterns and turn them into a written catalogue your detection layer uses."*  
> **Target Environment:** Iraqi Mobile Wallets (ZainCash, Qi Card, FastPay, FIB)

---

## 1. The Fake ZainCash Support & OTP Extraction Scam
* **Modus Operandi:** The fraudster calls the victim posing as an official technical support agent or customer care representative from ZainCash. They claim the victim's account is subject to immediate suspension, unverified, or won an internal reward, and demand the 4- or 6-digit OTP code sent to the victim's phone.
* **Prevalent Channels:** Voice calls (direct GSM phone call, often spoofed or private number), WhatsApp voice notes.
* **Common Iraqi Phrases / Script:**
  * *"أني وياك من الإدارة العامة لزين كاش، حسابك راح يتقفل اليوم بسبب التحديث الأمني."*
  * *"وصلك هسة مسج بي 6 أرقام، اقرألي اياه بسرعة حتى نفعل الحساب وما ينلغي."*
* **Detection Triggers (Layer 1):**
  * Incoming transfer or password reset attempt accompanied by keyword triggers in payment notes or support tickets: `رمز`, `كود`, `تأكيد`, `تفعيل`, `OTP`, `موظف الدعم`, `زين كاش`.
* **Coaching Counter-Script (Layer 2):**
  * *"عيني دير بالك! موظفي زين كاش الحقيقيين مستحيل يطلبون منك رمز الـ OTP أو كود التفعيل بأي شكل من الأشكال. هذا الرمز سري ومثل كلمة سر قاصتك، لا تنطيه لأي أحد نهائياً."*

---

## 2. The Advance Fee Lottery & Prize Scam
* **Modus Operandi:** Victim receives an SMS or WhatsApp message stating their phone number was selected in a major national lottery or corporate giveaway (e.g., winning a brand-new Toyota Hilux, iPhone, or 10,000,000 IQD). To release the prize, the victim must urgently transfer a "customs clearance", "shipping", or "tax processing" fee via ZainCash.
* **Prevalent Channels:** Telegram, WhatsApp broadcast groups, fake Facebook sponsored ads.
* **Common Iraqi Phrases / Script:**
  * *"ألف مبروك! رقمك فاز ويانا بسيارة جيب شيروكي أو مبلغ 10 ملايين دينار نقداً."*
  * *"حتى نستكمل إجراءات الشحن والتسليم، لازم تحول رسوم التسجيل والتخليص 75,000 دينار على هذا الرقم."*
  * *"العرض ينتهي خلال ساعتين، إذا ما تحول تلغى الجائزة وتتحول لغيرك."*
* **Detection Triggers (Layer 1):**
  * First-time transfer to a personal wallet number with transfer notes matching: `جائزة`, `مبروك`, `رسوم استلام`, `شحن`, `تخليص`, `سحب`, `مسابقة`.
* **Coaching Counter-Script (Layer 2):**
  * *"حبيبي انتبه، هاي طريقة نصب شائعة جداً بالعراق! ماكو أي جهة أو شركة رسمية تطلب منك تدفع فلوس أو رسوم حتى تستلم جائزة أنت أصلاً ما مسجل بيها. من تحول الفلوس راح يحظروك ومستحيل تشوف أي جائزة."*

---

## 3. The "Safe Government Account" / Impersonation Scam
* **Modus Operandi:** Fraudster contacts the victim claiming to be an investigator, intelligence officer (الأمن الوطني), or tax auditor. They claim the victim's wallet has received illicit funds and is about to be frozen by law enforcement. The victim is instructed to transfer their entire balance to a "temporary safe government audit account" to clear their name.
* **Prevalent Channels:** Voice calls, official-looking forged letterhead PDFs on WhatsApp.
* **Common Iraqi Phrases / Script:**
  * *"حسابك داخل بقضية غسيل أموال ومطلوب للتحقيق. لازم تحول رصيدك هسة لحساب الأمان حتى ندقق الفلوس ونرجعها باجر."*
  * *"لا تسد الخط ولا تحجي وية أحد، لأن التلفون مراقب."*
* **Detection Triggers (Layer 1):**
  * Rapid balance drainage (user transfers >80% of wallet balance within minutes of a deposit).
  * Transfer to an individual civilian phone number.
* **Coaching Counter-Script (Layer 2):**
  * *"أهلاً بك، نرجو منك التوقف فوراً! الأجهزة الأمنية والرقابية في العراق لا تملك 'حسابات أمان' على أرقام هواتف شخصية، ولا تطلب من المواطنين تحويل أموالهم عبر المحافظ الإلكترونية. هذا الشخص محتال يحاول استغلال خوفك."*

---

## 4. The Fraudulent Social Media Merchant Scam (Instagram / TikTok)
* **Modus Operandi:** Fake online shop claiming to sell electronics, clothing, or luxury goods at unrealistically low prices. When the customer wants to buy, the merchant refuses Cash on Delivery (الدفع عند الاستلام) and insists on 100% upfront payment to a personal ZainCash wallet, then blocks the buyer immediately.
* **Prevalent Channels:** Sponsored Instagram/TikTok pages with disabled comments and fake follower counts.
* **Common Iraqi Phrases / Script:**
  * *"ماعندنا دفع عند الاستلام لأن المندوب يرجع البضاعة. دز 120 ألف على زين كاش ونشحنلك اليوم."*
  * *"العرض لليوم فقط وباقي قطعتين."*
* **Detection Triggers (Layer 1):**
  * Transfer to a new, non-merchant wallet number accompanied by product-related keywords (`شحن`, `ساعة`, `ملابس`, `طلب`) without merchant business accreditation.
* **Coaching Counter-Script (Layer 2):**
  * *"تنبيه: أنت تقوم بتحويل أموال إلى حساب شخصي عادي وليس حساب تاجر معتمد في زين كاش. إذا كنت تشتري من صفحة انستغرام غير معروفة، ننصحك بالإصرار على الدفع عند الاستلام، لأن الحسابات الشخصية لا توفر حماية للمشتري."*

---

## 5. The Impersonated Relative in Distress (Account Hijacking)
* **Modus Operandi:** A friend or family member's WhatsApp or Telegram account is hijacked. The fraudster messages the victim urgently claiming an accident, sudden surgery, or car impoundment, pleading for an immediate emergency transfer of 50,000–250,000 IQD to a third-party wallet number.
* **Prevalent Channels:** Hijacked WhatsApp / Telegram accounts.
* **Common Iraqi Phrases / Script:**
  * *"حبيبي سويت حادث بالسيارة والولد واكف على راسي ومحتاج 100 ألف ضروري ما عندي كاش، دزها على هذا الرقم مال الولد بسرعة."*
* **Detection Triggers (Layer 1):**
  * Sudden off-hours transfer to a novel number not in user's frequent contact book, high urgency score.
* **Coaching Counter-Script (Layer 2):**
  * *"قبل أن تحول: حسابات الواتساب تتعرض للاختراق بشكل متكرر. يرجى الاتصال بقريبك هاتفياً بمكالمة خلوية عادية وسماع صوته بنفسك للتأكد من هويته قبل إرسال أي مبلغ."*
