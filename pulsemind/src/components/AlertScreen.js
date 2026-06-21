import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { peers, alertHistory, currentScores } from '../data/mockData';

const riskColor = (v) => v >= 75 ? '#E24B4A' : v >= 50 ? '#EF9F27' : '#1D9E75';

function PeerCard({ peer, onSend, sent, t }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, border: '1px solid var(--border)',
      padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: '50%', background: 'var(--teal-light)',
        color: 'var(--teal-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 700, flexShrink: 0,
      }}>{peer.initials}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{peer.name}</div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{peer.role}</div>
        <div style={{ fontSize: 10, color: 'var(--teal)', marginTop: 2 }}>● {peer.status}</div>
      </div>
      <button onClick={() => onSend(peer.id)} disabled={sent} style={{
        background: sent ? '#e2e8f0' : 'var(--teal)', color: sent ? 'var(--text-muted)' : '#fff',
        border: 'none', borderRadius: 10, padding: '8px 12px', fontSize: 11, fontWeight: 600,
        whiteSpace: 'nowrap',
      }}>
        {sent ? t.alert.sent : t.alert.sendAlert}
      </button>
    </div>
  );
}

export default function AlertScreen() {
  const { t } = useLanguage();
  const [sentTo, setSentTo] = useState([]);
  const burnout = currentScores.burnout;
  const color = riskColor(burnout);
  const riskKey = burnout >= 75 ? 'high' : burnout >= 50 ? 'medium' : 'low';

  const handleSend = (id) => setSentTo(s => [...s, id]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      <div style={{ background: 'linear-gradient(160deg,#1D9E75,#085041)', padding: '20px 20px 16px' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{t.alert.title}</div>
        <div style={{ fontSize: 12, color: '#9FE1CB' }}>{t.alert.subtitle}</div>
      </div>

      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        <div style={{
          background: '#fff', borderRadius: 14, border: `1px solid ${color}33`,
          padding: '16px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
            {t.alert.currentRisk}
          </div>
          <div style={{ fontSize: 40, fontWeight: 700, color, lineHeight: 1 }}>{burnout}%</div>
          <div style={{
            display: 'inline-block', marginTop: 8, padding: '4px 12px', borderRadius: 20,
            background: `${color}1A`, color, fontSize: 12, fontWeight: 600,
          }}>
            {t.alert.riskLabels[riskKey]}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 10, lineHeight: 1.6 }}>
            {t.alert.riskDesc}
          </div>
        </div>

        <div style={{ background: 'var(--teal-light)', borderRadius: 12, padding: '12px 14px' }}>
          <div style={{ fontSize: 12, color: 'var(--teal-dark)', lineHeight: 1.8 }}>
            <strong>{t.alert.privacyTitle}</strong><br />
            {t.alert.privacyText}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
            {t.alert.trustedPeers}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {peers.map(p => (
              <PeerCard key={p.id} peer={p} onSend={handleSend} sent={sentTo.includes(p.id)} t={t} />
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
            {t.alert.history}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {alertHistory.map((h, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                background: '#fff', borderRadius: 10, border: '1px solid var(--border)',
                padding: '10px 12px',
              }}>
                <span style={{ fontSize: 14 }}>{h.type === 'warning' ? '⚠️' : '✅'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.5 }}>{h.text}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{h.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
