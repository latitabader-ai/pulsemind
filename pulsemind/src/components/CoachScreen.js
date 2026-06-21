import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { currentScores, weekData } from '../data/mockData';

// =============================================================================
// عنوان الـ backend الآمن. غيّره عند النشر لرابط السيرفر الفعلي
// (مثلاً https://pulsemind-api.onrender.com) بدل localhost.
// React هنا لا يتكلم أبداً مباشرة مع Gemini — كل الاتصال يمر عبر هذا السيرفر
// الذي يخزن مفتاح Gemini بأمان (في .env) ويطبّق rate limiting + memory.
// =============================================================================
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function getSessionId() {
  const KEY = 'pm_session_id';
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = 'sess_' + Math.random().toString(36).slice(2) + Date.now();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch (e) {
    // fallback لو localStorage غير متاح (نادر) — جلسة مؤقتة لمدة التحميل فقط
    return 'sess_fallback_' + Date.now();
  }
}

const lowSleepNights = weekData.filter(d => d.sleep < 6).length;

function MessageBubble({ role, text }) {
  const isUser = role === 'user';
  return (
    <div style={{
      display: 'flex', justifyContent: isUser ? 'flex-start' : 'flex-end',
      marginBottom: 10,
    }}>
      <div style={{
        maxWidth: '78%', padding: '10px 14px', borderRadius: 14,
        background: isUser ? '#fff' : 'var(--teal)',
        color: isUser ? 'var(--text-primary)' : '#fff',
        border: isUser ? '1px solid var(--border)' : 'none',
        fontSize: 13, lineHeight: 1.6,
        borderBottomLeftRadius: isUser ? 4 : 14,
        borderBottomRightRadius: isUser ? 14 : 4,
      }}>
        {text}
      </div>
    </div>
  );
}

export default function CoachScreen() {
  const { t, lang } = useLanguage();
  const sessionId = useRef(getSessionId());

  const [messages, setMessages] = useState([
    { role: 'assistant', text: t.coach.greeting(currentScores.burnout, lowSleepNights) },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // لو المستخدم بدّل اللغة وسط محادثة جديدة (لسا أول رسالة فقط)، نحدّث التحية
  useEffect(() => {
    setMessages((m) => {
      if (m.length === 1 && m[0].role === 'assistant') {
        return [{ role: 'assistant', text: t.coach.greeting(currentScores.burnout, lowSleepNights) }];
      }
      return m;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text) => {
    const userText = text ?? input;
    if (!userText.trim() || loading) return;
    setMessages(m => [...m, { role: 'user', text: userText }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/coach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          sessionId: sessionId.current,
          lang,
        }),
      });

      if (res.status === 429) {
        const data = await res.json().catch(() => ({}));
        setMessages(m => [...m, { role: 'assistant', text: data.message || t.coach.errorMsg }]);
        return;
      }

      if (!res.ok) throw new Error('Backend error');

      const data = await res.json();
      setMessages(m => [...m, { role: 'assistant', text: data.reply }]);
    } catch (err) {
      setMessages(m => [...m, { role: 'assistant', text: t.coach.errorMsg }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ background: 'linear-gradient(160deg,#1D9E75,#085041)', padding: '20px 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>🧠</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{t.coach.title}</div>
            <div style={{ fontSize: 11, color: '#9FE1CB' }}>{t.coach.subtitle}</div>
          </div>
        </div>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflow: 'auto', padding: '14px 16px' }}>
        {messages.map((m, i) => <MessageBubble key={i} role={m.role} text={m.text} />)}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
            <div style={{
              background: 'var(--teal)', borderRadius: 14, padding: '10px 16px',
              fontSize: 13, color: '#fff', opacity: 0.7,
            }}>{t.coach.typing}</div>
          </div>
        )}

        {messages.length === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 14 }}>
            {t.coach.prompts.map((p, i) => (
              <button key={i} onClick={() => send(p)} style={{
                background: '#fff', border: '1px solid var(--border)', borderRadius: 10,
                padding: '9px 12px', fontSize: 12, color: 'var(--teal-dark)', textAlign: 'start',
              }}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{
        display: 'flex', gap: 8, padding: '10px 14px 16px',
        borderTop: '1px solid var(--border)', background: '#fff',
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder={t.coach.placeholder}
          style={{
            flex: 1, border: '1px solid var(--border)', borderRadius: 20,
            padding: '10px 16px', fontSize: 13, outline: 'none',
          }}
        />
        <button onClick={() => send()} disabled={loading} style={{
          width: 40, height: 40, borderRadius: '50%', border: 'none',
          background: 'var(--teal)', color: '#fff', fontSize: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: loading ? 0.6 : 1,
        }}>↑</button>
      </div>
    </div>
  );
}
