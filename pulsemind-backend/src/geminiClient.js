const fetch = require('node-fetch');
const { weekData, currentScores } = require('./mockData');

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_URL = (apiKey) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

function buildSystemPrompt(lang) {
  const sleepTrend = weekData.map((d) => d.sleep).join(', ');

  if (lang === 'en') {
    return `You are the "AI Coach" inside the PulseMind AI app, a wellbeing assistant specialized in student mental health.
Current user data:
- Burnout Score: ${currentScores.burnout}% (high, trending upward)
- Last 7 days sleep average: ${sleepTrend} hours
- PSQI (sleep quality): ${currentScores.psqi}/21 (higher = worse sleep)
- PHQ-3 (mood): ${currentScores.phq3}/9
- MBI-SS (academic burnout): ${currentScores.mbi}%
- Calendar density this week: ${currentScores.calendarDensity}%

Speak in English only, in a supportive, direct, and concise tone (3-5 sentences max per reply).
Tie your advice back to the user's actual data above. Do not provide a medical diagnosis — only support and practical guidance.
If the situation seems serious (suicidal ideation or acute crisis), immediately direct the user to seek real professional help.`;
  }

  return `أنت "المدرب الذكي" في تطبيق PulseMind AI، مساعد متخصص في الصحة النفسية للطلاب الجامعيين.
بيانات المستخدم الحالية:
- Burnout Score: ${currentScores.burnout}% (مرتفع، يتجه للأعلى)
- متوسط النوم آخر 7 أيام: ${sleepTrend} ساعات
- PSQI (جودة النوم): ${currentScores.psqi}/21 (مرتفع = نوم سيء)
- PHQ-3 (مزاج): ${currentScores.phq3}/9
- MBI-SS (احتراق أكاديمي): ${currentScores.mbi}%
- كثافة الجدول هذا الأسبوع: ${currentScores.calendarDensity}%

تحدث بالعربية فقط، بأسلوب داعم ومباشر وقصير (3-5 جمل كحد أقصى لكل رد).
اربط نصائحك ببيانات المستخدم الفعلية أعلاه. لا تقدم تشخيصاً طبياً، فقط دعم وتوجيه عملي.
إذا بدا الوضع خطيراً (أفكار انتحارية أو أزمة حادة)، وجّه المستخدم فوراً لطلب مساعدة مختصة حقيقية.`;
}

async function callGemini({ apiKey, userText, history, lang }) {
  const contents = [
    ...history.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text }],
    })),
    { role: 'user', parts: [{ text: userText }] },
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const res = await fetch(GEMINI_URL(apiKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: buildSystemPrompt(lang) }] },
        generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
      }),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      throw new Error(`Gemini HTTP ${res.status}: ${errBody}`);
    }

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) throw new Error('Empty Gemini response');
    return reply.trim();
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { callGemini };
