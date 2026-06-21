// ---------------------------------------------------------------------------
// نظام Memory بسيط في الذاكرة (in-memory store) — يحفظ تاريخ المحادثة
// لكل مستخدم حسب sessionId، بحيث يتذكر الـ AI آخر الرسائل بين الطلبات.
//
// ملاحظة: هذا تخزين مؤقت (يُمسح عند إعادة تشغيل السيرفر). لمشروع إنتاجي
// حقيقي يُستبدل بـ Redis أو قاعدة بيانات، لكنه كافٍ تماماً لعرض هاكاثون.
// ---------------------------------------------------------------------------

const MAX_HISTORY_MESSAGES = 12; // نحتفظ بآخر 12 رسالة فقط لكل جلسة (6 تبادلات)
const SESSION_TTL_MS = 1000 * 60 * 60 * 2; // الجلسة تنتهي بعد ساعتين من الخمول

const sessions = new Map();

function getSession(sessionId) {
  cleanupExpired();
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, { history: [], lastActive: Date.now() });
  }
  const session = sessions.get(sessionId);
  session.lastActive = Date.now();
  return session;
}

function appendMessage(sessionId, role, text) {
  const session = getSession(sessionId);
  session.history.push({ role, text });
  if (session.history.length > MAX_HISTORY_MESSAGES) {
    session.history = session.history.slice(-MAX_HISTORY_MESSAGES);
  }
}

function getHistory(sessionId) {
  return getSession(sessionId).history;
}

function clearSession(sessionId) {
  sessions.delete(sessionId);
}

function cleanupExpired() {
  const now = Date.now();
  for (const [id, session] of sessions.entries()) {
    if (now - session.lastActive > SESSION_TTL_MS) {
      sessions.delete(id);
    }
  }
}

module.exports = { getSession, appendMessage, getHistory, clearSession };
