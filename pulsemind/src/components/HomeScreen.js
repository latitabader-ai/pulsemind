import React from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import BurnoutRing from './BurnoutRing';
import { useLanguage } from '../i18n/LanguageContext';
import { currentScores, weekData, forecastData } from '../data/mockData';
import { calculateDelayRisk } from '../services/plannerEngine';

const MetricCard = ({ label, value, unit }) => (
  <div style={{
    background: 'rgba(255,255,255,0.15)', borderRadius: 12,
    padding: '10px 8px', textAlign: 'center', flex: 1,
  }}>
    <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', lineHeight: 1 }}>
      {value}<span style={{ fontSize: 11 }}>{unit}</span>
    </div>
    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', marginTop: 3 }}>{label}</div>
  </div>
);

const eventColors = { lecture:'#E1F5EE', meeting:'#FAEEDA', exam:'#FCEBEB', study:'#E6F1FB', generated:'#E1F5EE' };
const eventText  = { lecture:'#085041', meeting:'#633806', exam:'#791F1F', study:'#0C447C', generated:'#085041' };

function hoursBetween(start, end) {
  return (new Date(end) - new Date(start)) / (60 * 60 * 1000);
}

export default function HomeScreen({ onNav, calendarEvents = [], tasks = [], scheduledSessions = [] }) {
  const { t } = useLanguage();
  const forecast = forecastData[forecastData.length - 1].burnout;
  const activeTasks = tasks.filter((task) => task.status === 'active');
  const upcomingDeadline = [...activeTasks].sort((a, b) => new Date(a.deadline) - new Date(b.deadline))[0];
  const plannedHoursThisWeek = scheduledSessions.reduce((sum, session) => sum + hoursBetween(session.startTime, session.endTime), 0);
  const risk = calculateDelayRisk({
    burnout: currentScores.burnout,
    numberOfTasks: activeTasks.length,
    totalPlannedHours: plannedHoursThisWeek,
    freeHoursAvailable: Math.max(1, 40 - plannedHoursThisWeek),
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'auto' }}>
      <div style={{
        background: 'linear-gradient(160deg, #1D9E75 0%, #085041 100%)',
        padding: '20px 20px 24px',
      }}>
        <div style={{ fontSize: 12, color: '#9FE1CB', marginBottom: 2 }}>{t.home.morning}</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 18 }}>{t.home.name}</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <BurnoutRing value={currentScores.burnout} />
          <div style={{
            background: 'rgba(255,255,255,0.15)', borderRadius: 20,
            padding: '6px 14px', fontSize: 12, color: '#fff',
          }}>
            {t.home.forecast(forecast)}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <MetricCard label={t.home.sleep} value={currentScores.sleep} unit="h" />
          <MetricCard label={t.home.energy} value={currentScores.energy} unit="%" />
          <MetricCard label="PSQI"   value={currentScores.psqi}   unit="" />
        </div>
      </div>

      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        <div style={{
          background: '#FAEEDA', border: '1px solid #EF9F27',
          borderRadius: 12, padding: '10px 14px',
        }}>
          <div style={{ fontSize: 12, color: '#633806', lineHeight: 1.6 }}>
            <strong>⚠️ {t.home.alertTitle}</strong> {t.home.alertText}
          </div>
          <button onClick={() => onNav('coach')} style={{
            marginTop: 8, background: 'var(--amber)', color: '#fff',
            border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 600,
          }}>
            {t.home.talkToCoach}
          </button>
        </div>

        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border)', padding: '12px 14px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>
            {t.home.weekTrend}
          </div>
          <ResponsiveContainer width="100%" height={80}>
            <AreaChart data={weekData}>
              <defs>
                <linearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1D9E75" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#1D9E75" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="burnout" stroke="#1D9E75" strokeWidth={2}
                fill="url(#burnGrad)" dot={false} />
              <Tooltip formatter={v => [`${v}%`, 'Burnout']}
                contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border)', padding: '12px 14px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>
            {t.home.todaySchedule}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {calendarEvents.map((e, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: eventColors[e.type] || '#f1f5f9', borderRadius: 8, padding: '7px 10px',
              }}>
                <span style={{ fontSize: 11, color: eventText[e.type] || 'var(--text-secondary)', minWidth: 40, fontWeight: 600 }}>{e.time}</span>
                <span style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <span style={{ fontSize: 12, color: eventText[e.type] || 'var(--text-primary)' }}>{e.title}</span>
                  {e.generated && <span style={{ fontSize: 10, color: 'var(--teal)' }}>Generated by PulseMind</span>}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border)', padding: '12px 14px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>
            Smart Workload Planner
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: 'Upcoming Deadlines', value: upcomingDeadline ? new Date(upcomingDeadline.deadline).toLocaleDateString() : 'None' },
              { label: 'Planned Hours This Week', value: `${plannedHoursThisWeek.toFixed(1)}h` },
              { label: 'Delay Risk', value: `${risk.riskScore}% ${risk.level}` },
              { label: 'Generated Sessions', value: scheduledSessions.length },
            ].map((item) => (
              <div key={item.label} style={{ background: '#f8fafc', borderRadius: 10, padding: '9px 10px' }}>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</div>
              </div>
            ))}
          </div>
          <button onClick={() => onNav('planner')} style={{
            marginTop: 10,
            width: '100%',
            background: 'var(--teal)',
            color: '#fff',
            border: 'none',
            borderRadius: 9,
            padding: '8px 12px',
            fontSize: 11,
            fontWeight: 700,
          }}>
            Open Planner
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { name: 'MBI-SS', val: currentScores.mbi, color: '#EF9F27' },
            { name: 'PHQ-3',  val: currentScores.phq3 * 10, color: '#E24B4A' },
          ].map(s => (
            <div key={s.name} style={{
              background: '#fff', borderRadius: 12, border: '1px solid var(--border)', padding: '10px 12px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{s.name}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.val}%</span>
              </div>
              <div style={{ height: 4, background: '#f1f5f9', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: 4, width: `${s.val}%`, background: s.color, borderRadius: 2,
                  transition: 'width 1s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
