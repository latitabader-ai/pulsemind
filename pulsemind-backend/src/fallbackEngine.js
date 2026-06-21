const { currentScores, sleepAvg, lowSleepNights } = require('./mockData');

// ---------------------------------------------------------------------------
// محرك ردود محلي (Fallback) — يعمل تلقائياً إذا فشل الاتصال بـ Gemini API
// (مفتاح غير صالح، لا إنترنت، تجاوز الحد المجاني، rate limit...).
// يدعم العربي والإنجليزي حسب لغة الواجهة المُرسلة من الفرونت إند.
// ---------------------------------------------------------------------------

const rulesAr = [
  {
    keywords: ['ليش', 'سبب', 'مرتفع', 'احتراق', 'لماذا', 'وش السبب'],
    reply: () =>
      `مؤشر الاحتراق عندك صعد لـ ${currentScores.burnout}% بسبب تراكم 3 عوامل واضحة في بياناتك: ` +
      `متوسط نومك هذا الأسبوع ${sleepAvg} ساعة فقط (${lowSleepNights} ليالٍ تحت 6 ساعات)، ` +
      `وكثافة جدولك الأكاديمي عند ${currentScores.calendarDensity}%، ` +
      `بالإضافة لمؤشر MBI-SS عند ${currentScores.mbi}% الذي يعكس إرهاقاً عاطفياً متزايد. ` +
      `النوم هو نقطة التدخل الأسرع تأثيراً هنا.`,
  },
  {
    keywords: ['نوم', 'أنام', 'النوم', 'سهر', 'ارتاح'],
    reply: () =>
      `بياناتك من الساعة الذكية توضح إن نومك انخفض إلى ${sleepAvg} ساعة بالمتوسط، وهذا أقل من الحد الموصى به (7-8 ساعات). ` +
      `جرب هذا الأسبوع: نام قبل 11 مساءً، وابعد عن الشاشة 30 دقيقة قبل النوم. ` +
      `هذا التغيير وحده ممكن يخفض مؤشر PSQI عندك من ${currentScores.psqi} إلى ما تحت 5 خلال أسبوع.`,
  },
  {
    keywords: ['خطة', 'دراسة', 'اختبار', 'مذاكرة', 'جدول'],
    reply: () =>
      `بناءً على جدولك، عندك ${currentScores.calendarDensity}% كثافة التزامات هذا الأسبوع. ` +
      `أقترح نظام بومودورو: 25 دقيقة مذاكرة مركزة + 5 دقائق استراحة، 4 دورات ثم استراحة طويلة 20 دقيقة. ` +
      `وزّع المراجعة على 3 جلسات قصيرة يومياً بدل جلسة واحدة طويلة — هذا يقلل الحمل الذهني ويحسّن الاستيعاب.`,
  },
  {
    keywords: ['متعب', 'تعبان', 'مرهق', 'ضايق', 'زهقان', 'مافيني'],
    reply: () =>
      `أتفهم إحساسك تماماً، وبياناتك تدعم هذا الشعور — المؤشرات عندك مرتفعة بشكل حقيقي وليس مجرد إحساس عابر. ` +
      `هذا وقت مناسب نشوف فيه أحد جهات اتصالك الموثوقة من Peer Alert، أو نبدأ بخطوة صغيرة واحدة الليلة: نوم مبكر فقط. ` +
      `لا تحاول تحل كل شي دفعة واحدة.`,
  },
  {
    keywords: ['انتحار', 'اموت', 'اقتل', 'مافي فايدة', 'ابغى اروح'],
    reply: () =>
      `كلامك يهمني جداً، وأبغاك تعرف إنك ما لازم تواجه هذا وحدك. ` +
      `أتمنى تتواصل الآن مع خط مساعدة مختص أو شخص تثق فيه قريب منك. ` +
      `هذا أهم من أي مؤشر أو بيانات في التطبيق.`,
  },
];

const rulesEn = [
  {
    keywords: ['why', 'reason', 'high', 'burnout', 'cause'],
    reply: () =>
      `Your burnout score climbed to ${currentScores.burnout}% due to three clear factors in your data: ` +
      `your average sleep this week is only ${sleepAvg} hours (${lowSleepNights} nights under 6 hours), ` +
      `your academic schedule density is at ${currentScores.calendarDensity}%, ` +
      `and your MBI-SS score is ${currentScores.mbi}%, reflecting growing emotional exhaustion. ` +
      `Sleep is the fastest point of intervention here.`,
  },
  {
    keywords: ['sleep', 'tired', 'rest', 'insomnia'],
    reply: () =>
      `Your smartwatch data shows your sleep dropped to an average of ${sleepAvg} hours — below the recommended 7-8 hours. ` +
      `Try this week: sleep before 11 PM, and avoid screens 30 minutes before bed. ` +
      `This change alone could lower your PSQI from ${currentScores.psqi} to under 5 within a week.`,
  },
  {
    keywords: ['plan', 'study', 'exam', 'schedule', 'revision'],
    reply: () =>
      `Based on your schedule, you have ${currentScores.calendarDensity}% commitment density this week. ` +
      `I suggest the Pomodoro method: 25 minutes focused study + 5 minute break, 4 cycles then a 20 minute long break. ` +
      `Spread your review across 3 short sessions a day instead of one long session — this reduces mental load and improves retention.`,
  },
  {
    keywords: ['exhausted', 'stressed', 'overwhelmed', 'burnt out', "can't anymore"],
    reply: () =>
      `I completely understand how you feel, and your data backs this up — your metrics are genuinely elevated, not just a passing feeling. ` +
      `This might be a good time to reach out to one of your trusted contacts in Peer Alert, or start with one small step tonight: an early night's sleep. ` +
      `Don't try to fix everything at once.`,
  },
  {
    keywords: ['suicide', 'kill myself', 'end it', 'no point', 'want to die'],
    reply: () =>
      `What you're sharing matters a lot, and I want you to know you don't have to face this alone. ` +
      `I really hope you can reach out right now to a crisis helpline or someone you trust nearby. ` +
      `That matters more than any score or data in this app.`,
  },
];

const fallbackRepliesAr = [
  () =>
    `بناءً على بياناتك الحالية (Burnout ${currentScores.burnout}%، PHQ-3 عند ${currentScores.phq3})، ` +
    `أنصحك تبدأ بخطوة واحدة صغيرة اليوم: 10 دقائق مشي أو تنفس عميق. التغييرات الصغيرة المتكررة أفعل من القرارات الكبيرة المؤجلة.`,
  () =>
    `لاحظت من جدولك إن عندك التزامات مكثفة هذا الأسبوع. خلنا نقسمها لخطوات صغيرة — وش أكثر شي يضغط عليك بالتحديد الآن؟`,
];

const fallbackRepliesEn = [
  () =>
    `Based on your current data (Burnout ${currentScores.burnout}%, PHQ-3 at ${currentScores.phq3}), ` +
    `I'd suggest starting with one small step today: a 10 minute walk or deep breathing. Small repeated changes beat big delayed decisions.`,
  () =>
    `I noticed your schedule is quite packed this week. Let's break it into small steps — what's weighing on you the most right now?`,
];

function getLocalReply(userText, lang = 'ar') {
  const text = (userText || '').toLowerCase();
  const rules = lang === 'en' ? rulesEn : rulesAr;
  const fallbacks = lang === 'en' ? fallbackRepliesEn : fallbackRepliesAr;

  for (const rule of rules) {
    if (rule.keywords.some(k => text.includes(k))) return rule.reply();
  }
  return fallbacks[Math.floor(Math.random() * fallbacks.length)]();
}

module.exports = { getLocalReply };
