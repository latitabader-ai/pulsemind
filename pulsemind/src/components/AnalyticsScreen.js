import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip,
} from 'recharts';
import { useLanguage } from '../i18n/LanguageContext';
import { rangeData, currentScores } from '../data/mockData';

const ScoreGauge = ({ label, sub, value, max, color, source }) => {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={{
      background: '#fff', borderRadius: 14, border: '1px solid var(--border)',
      padding: '14px', display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{label}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{sub}</div>
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
      </div>
      <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: 6, width: `${pct}%`, background: color, borderRadius: 3,
          transition: 'width 1s ease',
        }} />
      </div>
      <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>📡 {source}</div>
    </div>
  );
};

export default function AnalyticsScreen() {
  const { t, lang } = useLanguage();
  const [range, setRange] = useState(0);
  const activeData = rangeData[range];
  const sleepUnit = lang === 'en' ? 'h' : 'ساعة';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      <div style={{ background: 'linear-gradient(160deg,#1D9E75,#085041)', padding: '20px 20px 16px' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{t.analytics.title}</div>
        <div style={{ fontSize: 12, color: '#9FE1CB', marginBottom: 14 }}>{t.analytics.subtitle}</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {t.analytics.ranges.map((r, i) => (
            <button key={r} onClick={() => setRange(i)} style={{
              flex: 1, padding: '7px 0', borderRadius: 10, border: 'none',
              background: range === i ? '#fff' : 'rgba(255,255,255,0.15)',
              color: range === i ? 'var(--teal-dark)' : '#fff',
              fontSize: 12, fontWeight: range === i ? 700 : 400,
              transition: 'all .15s',
            }}>{r}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border)', padding: '12px 14px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>
            {t.analytics.burnoutTrend(t.analytics.ranges[range])}
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={activeData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={v => [`${v}%`, 'Burnout']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Line type="monotone" dataKey="burnout" stroke="#E24B4A" strokeWidth={2.5}
                dot={{ r: 3, fill: '#E24B4A' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border)', padding: '12px 14px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>
            {t.analytics.sleepChart}
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={activeData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={v => [`${v} ${sleepUnit}`, lang === 'en' ? 'Sleep' : 'نوم']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Bar dataKey="sleep" radius={[6, 6, 0, 0]}>
                {activeData.map((d, i) => (
                  <Cell key={i} fill={d.sleep < 6 ? '#E24B4A' : d.sleep < 7 ? '#EF9F27' : '#1D9E75'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
            {t.analytics.validatedScales}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <ScoreGauge
              label="MBI-SS" sub={t.analytics.mbiSub}
              value={currentScores.mbi} max={100} color="#EF9F27"
              source={t.analytics.mbiSource} />
            <ScoreGauge
              label="PSQI" sub={t.analytics.psqiSub}
              value={currentScores.psqi} max={10} color="#0C447C"
              source={t.analytics.psqiSource} />
            <ScoreGauge
              label="PHQ-3" sub={t.analytics.phqSub}
              value={currentScores.phq3} max={9} color="#E24B4A"
              source={t.analytics.phqSource} />
            <ScoreGauge
              label={t.analytics.calLabel} sub={t.analytics.calSub}
              value={currentScores.calendarDensity} max={100} color="#1D9E75"
              source={t.analytics.calSource} />
          </div>
        </div>

        <div style={{ background: 'var(--teal-light)', borderRadius: 12, padding: '12px 14px' }}>
          <div style={{ fontSize: 12, color: 'var(--teal-dark)', lineHeight: 1.7 }}>
            <strong>{t.analytics.howTitle}</strong><br />
            {t.analytics.howText}
          </div>
        </div>
      </div>
    </div>
  );
}
