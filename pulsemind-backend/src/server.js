require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const { callGemini } = require('./geminiClient');
const { getLocalReply } = require('./fallbackEngine');
const { appendMessage, getHistory, clearSession } = require('./memoryStore');

const app = express();
const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

app.use(cors());
app.use(express.json({ limit: '32kb' }));

// ---------------------------------------------------------------------------
// Rate limiting — يحمي مفتاح Gemini من الاستهلاك الزائد أو سوء الاستخدام.
// حد عام لكل IP + حد أكثر تشدداً على نقطة /api/coach تحديداً.
// ---------------------------------------------------------------------------
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // دقيقة واحدة
  max: 60, // 60 طلب بالدقيقة لكل IP كحد عام
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'rate_limited', message: 'طلبات كثيرة جداً، حاول بعد قليل.' },
});

const coachLimiter = rateLimit({
  windowMs: 60 * 1000, // دقيقة واحدة
  max: 12, // 12 رسالة بالدقيقة لكل IP — يكفي محادثة طبيعية، يمنع الإساءة
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'rate_limited',
    message: 'وصلت للحد الأقصى من الرسائل بالدقيقة، خذ نفس وحاول بعد قليل 🙂',
  },
});

app.use(globalLimiter);

// ---------------------------------------------------------------------------
// نقطة الصحة — للتأكد إن السيرفر شغال (مفيدة وقت النشر على Render/Railway)
// ---------------------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', geminiConfigured: Boolean(GEMINI_API_KEY) });
});

// ---------------------------------------------------------------------------
// نقطة المدرب الذكي الرئيسية
// body: { message: string, sessionId: string, lang: 'ar' | 'en' }
// ---------------------------------------------------------------------------
app.post('/api/coach', coachLimiter, async (req, res) => {
  const { message, sessionId, lang } = req.body || {};

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'invalid_request', message: 'الرسالة مطلوبة.' });
  }
  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ error: 'invalid_request', message: 'sessionId مطلوب.' });
  }

  const safeLang = lang === 'en' ? 'en' : 'ar';
  const trimmedMessage = message.slice(0, 1000); // حماية من رسائل ضخمة

  // Memory: نجيب تاريخ المحادثة قبل إضافة الرسالة الجديدة
  const history = getHistory(sessionId);

  let reply;
  let source = 'gemini';

  if (!GEMINI_API_KEY) {
    reply = getLocalReply(trimmedMessage, safeLang);
    source = 'local';
  } else {
    try {
      reply = await callGemini({
        apiKey: GEMINI_API_KEY,
        userText: trimmedMessage,
        history,
        lang: safeLang,
      });
    } catch (err) {
      console.error('[Gemini fallback]', err.message);
      reply = getLocalReply(trimmedMessage, safeLang);
      source = 'local_fallback';
    }
  }

  // Memory: نحفظ رسالة المستخدم ورد المساعد بعد نجاح المعالجة
  appendMessage(sessionId, 'user', trimmedMessage);
  appendMessage(sessionId, 'assistant', reply);

  res.json({ reply, source });
});

// ---------------------------------------------------------------------------
// مسح الذاكرة لجلسة معيّنة (مفيد لزر "محادثة جديدة" في الفرونت إند)
// ---------------------------------------------------------------------------
app.post('/api/coach/reset', (req, res) => {
  const { sessionId } = req.body || {};
  if (sessionId) clearSession(sessionId);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`✅ PulseMind backend running on http://localhost:${PORT}`);
  console.log(`   Gemini configured: ${Boolean(GEMINI_API_KEY)}`);
});
