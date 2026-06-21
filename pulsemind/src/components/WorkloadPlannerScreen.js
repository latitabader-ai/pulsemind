import React, { useMemo, useState } from 'react';
import { CalendarDays, Clock, Gauge, Plus, Sparkles } from 'lucide-react';
import { calculateDelayRisk, getAvailableFreeSlots, getBurnoutRules, planTasks } from '../services/plannerEngine';
import { currentScores } from '../data/mockData';

const fieldStyle = {
  width: '100%',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '9px 10px',
  fontSize: 12,
  color: 'var(--text-primary)',
  background: '#fff',
};

const Card = ({ children, style }) => (
  <section style={{
    background: '#fff',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: 14,
    ...style,
  }}>
    {children}
  </section>
);

function formatDateTime(value) {
  return new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function sessionHours(session) {
  return (new Date(session.endTime) - new Date(session.startTime)) / (60 * 60 * 1000);
}

export default function WorkloadPlannerScreen({
  tasks,
  setTasks,
  scheduledSessions,
  setScheduledSessions,
  calendarEvents,
  setCalendarEvents,
}) {
  const [form, setForm] = useState({
    title: '',
    deadline: '2026-07-01',
    estimatedHours: 4,
    priority: 'medium',
    difficulty: 3,
  });

  const rules = getBurnoutRules(currentScores.burnout);
  const activeTasks = tasks.filter((task) => task.status === 'active');
  const plannedHours = scheduledSessions.reduce((sum, session) => sum + sessionHours(session), 0);
  const latestDeadline = activeTasks.reduce((latest, task) => {
    const deadline = new Date(task.deadline);
    return deadline > latest ? deadline : latest;
  }, new Date());
  const freeHoursAvailable = getAvailableFreeSlots(calendarEvents, latestDeadline)
    .reduce((sum, slot) => sum + (slot.end - slot.start) / (60 * 60 * 1000), 0);
  const risk = calculateDelayRisk({
    burnout: currentScores.burnout,
    numberOfTasks: activeTasks.length,
    totalPlannedHours: plannedHours,
    freeHoursAvailable,
  });

  const upcomingDeadlines = useMemo(() => (
    [...activeTasks].sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).slice(0, 3)
  ), [activeTasks]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.title.trim()) return;

    const nextTask = {
      id: `task-${Date.now()}`,
      title: form.title.trim(),
      deadline: `${form.deadline}T17:00:00`,
      estimatedHours: Number(form.estimatedHours),
      priority: form.priority,
      difficulty: Number(form.difficulty),
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    const planning = planTasks([nextTask], calendarEvents, currentScores.burnout);
    setTasks((current) => [...current, nextTask]);
    setScheduledSessions((current) => [...current, ...planning.sessions]);
    setCalendarEvents(planning.calendarEvents);
    setForm((current) => ({ ...current, title: '', estimatedHours: 4, priority: 'medium', difficulty: 3 }));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'auto', background: 'var(--gray-bg)' }}>
      <header style={{
        background: 'linear-gradient(160deg, #0F6E56 0%, #1D9E75 100%)',
        color: '#fff',
        padding: '22px 20px 18px',
      }}>
        <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 5 }}>Smart Workload Planner</div>
        <h1 style={{ fontSize: 22, lineHeight: 1.2, margin: 0 }}>PulseMind plans the work sessions for you</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 16 }}>
          <div style={{ background: 'rgba(255,255,255,0.16)', borderRadius: 10, padding: 10 }}>
            <Clock size={16} />
            <div style={{ fontSize: 18, fontWeight: 700 }}>{rules.maxDailyHours}h</div>
            <div style={{ fontSize: 10, opacity: 0.8 }}>Daily cap</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.16)', borderRadius: 10, padding: 10 }}>
            <Gauge size={16} />
            <div style={{ fontSize: 18, fontWeight: 700 }}>{currentScores.burnout}%</div>
            <div style={{ fontSize: 10, opacity: 0.8 }}>Burnout-aware</div>
          </div>
        </div>
      </header>

      <main style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Card>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <strong style={{ fontSize: 14 }}>Add workload</strong>
              <Sparkles size={18} color="var(--teal)" />
            </div>
            <input name="title" value={form.title} onChange={handleChange} placeholder="Task title" style={fieldStyle} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input name="deadline" value={form.deadline} onChange={handleChange} type="date" style={fieldStyle} />
              <input name="estimatedHours" value={form.estimatedHours} onChange={handleChange} type="number" min="1" step="0.5" style={fieldStyle} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <select name="priority" value={form.priority} onChange={handleChange} style={fieldStyle}>
                <option value="low">Low priority</option>
                <option value="medium">Medium priority</option>
                <option value="high">High priority</option>
              </select>
              <select name="difficulty" value={form.difficulty} onChange={handleChange} style={fieldStyle}>
                {[1, 2, 3, 4, 5].map((level) => <option key={level} value={level}>Difficulty {level}</option>)}
              </select>
            </div>
            <button type="submit" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 7,
              border: 'none',
              borderRadius: 9,
              background: 'var(--teal)',
              color: '#fff',
              padding: '10px 12px',
              fontSize: 12,
              fontWeight: 700,
            }}>
              <Plus size={16} /> Generate sessions
            </button>
          </form>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Card style={{ padding: 12 }}>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Delay Risk</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: risk.level === 'High' ? 'var(--red)' : 'var(--teal)' }}>{risk.riskScore}%</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{risk.level}</div>
          </Card>
          <Card style={{ padding: 12 }}>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Generated Sessions</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--teal)' }}>{scheduledSessions.length}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{plannedHours.toFixed(1)} planned hours</div>
          </Card>
        </div>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <CalendarDays size={17} color="var(--teal)" />
            <strong style={{ fontSize: 14 }}>Upcoming deadlines</strong>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {upcomingDeadlines.map((task) => (
              <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 12 }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{task.title}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{new Date(task.deadline).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <strong style={{ display: 'block', fontSize: 14, marginBottom: 10 }}>Auto-generated calendar sessions</strong>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {scheduledSessions.slice(-5).reverse().map((session) => {
              const task = tasks.find((item) => item.id === session.taskId);
              return (
                <div key={session.id} style={{ border: '1px solid var(--border)', borderRadius: 9, padding: 9 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{task?.title || 'Task'} Work Session</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 3 }}>
                    {formatDateTime(session.startTime)} - {formatDateTime(session.endTime)}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--teal)', marginTop: 4 }}>Generated by PulseMind</div>
                </div>
              );
            })}
          </div>
        </Card>
      </main>
    </div>
  );
}
