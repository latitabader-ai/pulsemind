import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

export default function CheckinScreen() {
  const { t } = useLanguage();
  const [step, setStep]     = useState(0);
  const [answers, setAnswers] = useState({ mood: null, energy: 5, achieve: null });
  const [done, setDone]     = useState(false);

  const questions = [
    { id: 'mood',   text: t.checkin.q1, options: ['😞','😕','😐','🙂','😄'], labels: t.checkin.q1labels },
    { id: 'energy', text: t.checkin.q2, type: 'slider' },
    { id: 'achieve',text: t.checkin.q3, options: ['😞','😕','🙂','😄'], labels: t.checkin.q3labels },
  ];

  const q = questions[step];

  const phq3 = () => {
    const m = answers.mood ?? 2;
    const e = Math.round(answers.energy / 2.5);
    const a = answers.achieve ?? 2;
    return Math.round(((5 - m) + (4 - e) + (3 - a)) / 12 * 27);
  };

  if (done) {
    const score = phq3();
    const level = score <= 4 ? t.checkin.levels.normal : score <= 9 ? t.checkin.levels.mild : t.checkin.levels.moderate;
    const color = score <= 4 ? '#1D9E75' : score <= 9 ? '#EF9F27' : '#E24B4A';
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: 'linear-gradient(160deg,#1D9E75,#085041)', padding: '20px 20px 24px' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{t.checkin.resultTitle}</div>
          <div style={{ fontSize: 12, color: '#9FE1CB' }}>{t.checkin.resultSubtitle}</div>
        </div>
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background:'#fff', borderRadius:14, border:'1px solid var(--border)', padding:20, textAlign:'center' }}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{t.checkin.scoreLabel}</div>
            <div style={{ fontSize: 52, fontWeight: 700, color, lineHeight: 1 }}>{score}</div>
            <div style={{ fontSize: 13, color, marginTop: 6, fontWeight: 600 }}>{level}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.6 }}>
              {t.checkin.autoUpdate}
            </div>
          </div>
          <div style={{ background:'var(--teal-light)', borderRadius:12, padding:'12px 14px' }}>
            <div style={{ fontSize: 12, color: 'var(--teal-dark)', lineHeight: 1.7 }}>
              <strong>{t.checkin.noteTitle}</strong> {t.checkin.note}
            </div>
          </div>
          <button onClick={() => { setDone(false); setStep(0); setAnswers({ mood:null, energy:5, achieve:null }); }}
            style={{ background:'var(--teal)', color:'#fff', border:'none', borderRadius:12,
              padding:'14px', fontSize:14, fontWeight:600 }}>
            {t.checkin.newCheckin}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background:'linear-gradient(160deg,#1D9E75,#085041)', padding:'20px 20px 24px' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{t.checkin.title}</div>
        <div style={{ fontSize: 12, color: '#9FE1CB' }}>{t.checkin.subtitle(questions.length)}</div>
        <div style={{ display:'flex', gap:6, marginTop:14 }}>
          {questions.map((_, i) => (
            <div key={i} style={{
              height: 4, borderRadius: 2, flex: i === step ? 2 : 1,
              background: i < step ? '#fff' : i === step ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)',
              transition: 'all .3s',
            }} />
          ))}
        </div>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
        <div style={{ background:'#fff', borderRadius:14, border:'1px solid var(--border)', padding:'16px' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color:'var(--text-primary)', marginBottom: 14 }}>
            {q.text}
          </div>

          {q.type === 'slider' ? (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <span style={{ fontSize:11, color:'var(--text-muted)' }}>{t.checkin.lowEnergy}</span>
                <span style={{ fontSize:20, fontWeight:700, color:'var(--teal)' }}>{answers.energy}</span>
                <span style={{ fontSize:11, color:'var(--text-muted)' }}>{t.checkin.highEnergy}</span>
              </div>
              <input type="range" min={0} max={10} step={1} value={answers.energy}
                onChange={e => setAnswers(a => ({...a, energy: +e.target.value}))}
                style={{ width:'100%', accentColor:'var(--teal)' }} />
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                {[0,2,4,6,8,10].map(n => (
                  <span key={n} style={{ fontSize:10, color:'var(--text-muted)' }}>{n}</span>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display:'flex', gap:8, justifyContent:'space-between' }}>
              {q.options.map((emoji, i) => (
                <button key={i} onClick={() => setAnswers(a => ({...a, [q.id]: i}))} style={{
                  flex:1, padding:'10px 4px', borderRadius:10,
                  border: answers[q.id] === i ? '2px solid var(--teal)' : '1px solid var(--border)',
                  background: answers[q.id] === i ? 'var(--teal-light)' : '#f8fafc',
                  display:'flex', flexDirection:'column', alignItems:'center', gap:4,
                  transition:'all .15s',
                }}>
                  <span style={{ fontSize: 22 }}>{emoji}</span>
                  <span style={{ fontSize:9, color: answers[q.id]===i ? 'var(--teal-dark)' : 'var(--text-muted)' }}>
                    {q.labels[i]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ display:'flex', gap:10, marginTop:'auto' }}>
          {step > 0 && (
            <button onClick={() => setStep(s => s-1)} style={{
              flex:1, padding:14, borderRadius:12,
              border:'1px solid var(--border)', background:'#fff',
              fontSize:14, color:'var(--text-secondary)',
            }}>{t.checkin.back}</button>
          )}
          <button
            disabled={q.type !== 'slider' && answers[q.id] === null}
            onClick={() => step < questions.length-1 ? setStep(s=>s+1) : setDone(true)}
            style={{
              flex:2, padding:14, borderRadius:12, border:'none',
              background: (q.type==='slider' || answers[q.id]!==null) ? 'var(--teal)' : '#cbd5e1',
              color:'#fff', fontSize:14, fontWeight:600, transition:'background .2s',
            }}>
            {step < questions.length-1 ? t.checkin.next : t.checkin.finish}
          </button>
        </div>
      </div>
    </div>
  );
}
