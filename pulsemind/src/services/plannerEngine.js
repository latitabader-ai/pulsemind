const DAY_START_HOUR = 8;
const DAY_END_HOUR = 18;
const HOUR_MS = 60 * 60 * 1000;
const priorityWeight = { high: 0, medium: 1, low: 2 };

export function getBurnoutRules(burnout) {
  if (burnout > 70) {
    return { safetyBufferRate: 0.2, maxDailyHours: 2, maxSessionHours: 1, minSessionHours: 0.5 };
  }
  if (burnout >= 40) {
    return { safetyBufferRate: 0.15, maxDailyHours: 3, maxSessionHours: 1.5, minSessionHours: 0.5 };
  }
  return { safetyBufferRate: 0.1, maxDailyHours: 4, maxSessionHours: 2, minSessionHours: 0.75 };
}

function toDateTime(date, hour, minute = 0) {
  const next = new Date(date);
  next.setHours(hour, minute, 0, 0);
  return next;
}

function dateKey(date) {
  return date.toISOString().slice(0, 10);
}

function parseClockTime(time) {
  const [hour, minute = '0'] = String(time || '09:00').split(':');
  return { hour: Number(hour), minute: Number(minute) };
}

function eventRange(event, fallbackDate) {
  if (event.startTime && event.endTime) {
    return { start: new Date(event.startTime), end: new Date(event.endTime) };
  }

  const base = event.date ? new Date(`${event.date}T00:00:00`) : fallbackDate;
  const { hour, minute } = parseClockTime(event.time);
  const start = toDateTime(base, hour, minute);
  const duration = event.durationHours || (event.generated ? 1.5 : 1);
  return { start, end: new Date(start.getTime() + duration * HOUR_MS) };
}

function mergeBusyRanges(ranges) {
  return ranges
    .sort((a, b) => a.start - b.start)
    .reduce((merged, range) => {
      const last = merged[merged.length - 1];
      if (!last || range.start > last.end) return [...merged, { ...range }];
      last.end = new Date(Math.max(last.end.getTime(), range.end.getTime()));
      return merged;
    }, []);
}

export function getAvailableFreeSlots(calendarEvents, deadline, now = new Date()) {
  const slots = [];
  const firstDay = new Date(now);
  firstDay.setHours(0, 0, 0, 0);
  const lastDay = new Date(deadline);
  lastDay.setHours(0, 0, 0, 0);

  for (let cursor = firstDay; cursor <= lastDay; cursor.setDate(cursor.getDate() + 1)) {
    const day = new Date(cursor);
    const workStart = toDateTime(day, DAY_START_HOUR);
    const workEnd = toDateTime(day, DAY_END_HOUR);
    const startBoundary = dateKey(day) === dateKey(now) ? new Date(Math.max(now.getTime(), workStart.getTime())) : workStart;
    if (startBoundary >= workEnd) continue;

    const busy = mergeBusyRanges(
      calendarEvents
        .map((event) => eventRange(event, day))
        .filter(({ start, end }) => dateKey(start) === dateKey(day) && end > startBoundary && start < workEnd)
        .map(({ start, end }) => ({
          start: new Date(Math.max(start.getTime(), startBoundary.getTime())),
          end: new Date(Math.min(end.getTime(), workEnd.getTime())),
        }))
    );

    let freeStart = startBoundary;
    busy.forEach((range) => {
      if (range.start > freeStart) slots.push({ start: new Date(freeStart), end: new Date(range.start) });
      freeStart = new Date(Math.max(freeStart.getTime(), range.end.getTime()));
    });
    if (freeStart < workEnd) slots.push({ start: new Date(freeStart), end: workEnd });
  }

  return slots;
}

export function calculateDelayRisk({ burnout, numberOfTasks, totalPlannedHours, freeHoursAvailable }) {
  const workloadPressure = freeHoursAvailable <= 0 ? 50 : Math.min(50, (totalPlannedHours / freeHoursAvailable) * 45);
  const burnoutPressure = Math.min(30, burnout * 0.3);
  const taskPressure = Math.min(20, numberOfTasks * 4);
  const riskScore = Math.min(100, Math.round(workloadPressure + burnoutPressure + taskPressure));
  const level = riskScore >= 70 ? 'High' : riskScore >= 40 ? 'Medium' : 'Low';

  return { riskScore, level };
}

export function planTasks(tasks, calendarEvents, burnout, now = new Date()) {
  const rules = getBurnoutRules(burnout);
  const sessions = [];
  const dailyPlanned = {};
  let workingEvents = [...calendarEvents];

  const activeTasks = tasks
    .filter((task) => task.status === 'active')
    .sort((a, b) => {
      const priorityDiff = priorityWeight[a.priority] - priorityWeight[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(a.deadline) - new Date(b.deadline);
    });

  activeTasks.forEach((task) => {
    const deadline = new Date(task.deadline);
    const effectiveHours = Number((task.estimatedHours * (1 + rules.safetyBufferRate)).toFixed(2));
    let remaining = effectiveHours;
    const freeSlots = getAvailableFreeSlots(workingEvents, deadline, now);

    freeSlots.forEach((slot) => {
      if (remaining <= 0) return;

      const key = dateKey(slot.start);
      const usedToday = dailyPlanned[key] || 0;
      const dayCapacity = Math.max(0, rules.maxDailyHours - usedToday);
      const slotHours = (slot.end - slot.start) / HOUR_MS;
      const duration = Math.min(remaining, dayCapacity, slotHours, rules.maxSessionHours);

      if (duration < rules.minSessionHours) return;

      const sessionStart = new Date(slot.start);
      const sessionEnd = new Date(sessionStart.getTime() + duration * HOUR_MS);
      const session = {
        id: `session-${task.id}-${sessions.length + 1}`,
        taskId: task.id,
        startTime: sessionStart.toISOString(),
        endTime: sessionEnd.toISOString(),
        generated: true,
      };

      sessions.push(session);
      workingEvents = [
        ...workingEvents,
        {
          id: session.id,
          taskId: task.id,
          title: 'Task Work Session',
          subtitle: 'Generated by PulseMind',
          type: 'generated',
          generated: true,
          startTime: session.startTime,
          endTime: session.endTime,
          date: dateKey(sessionStart),
          time: sessionStart.toTimeString().slice(0, 5),
        },
      ];
      dailyPlanned[key] = usedToday + duration;
      remaining = Number((remaining - duration).toFixed(2));
    });
  });

  const totalPlannedHours = sessions.reduce((sum, session) => sum + (new Date(session.endTime) - new Date(session.startTime)) / HOUR_MS, 0);
  const latestDeadline = activeTasks.reduce((latest, task) => {
    const deadline = new Date(task.deadline);
    return deadline > latest ? deadline : latest;
  }, now);
  const freeHoursAvailable = getAvailableFreeSlots(calendarEvents, latestDeadline, now)
    .reduce((sum, slot) => sum + (slot.end - slot.start) / HOUR_MS, 0);

  return {
    sessions,
    calendarEvents: workingEvents,
    delayRisk: calculateDelayRisk({
      burnout,
      numberOfTasks: activeTasks.length,
      totalPlannedHours,
      freeHoursAvailable,
    }),
    rules,
  };
}
