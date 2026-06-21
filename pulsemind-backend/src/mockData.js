// نفس بيانات mockData.js في الفرونت إند — مصدر واحد للحقيقة على السيرفر
const weekData = [
  { day: 'أح', burnout: 42, sleep: 7.2, mood: 7, energy: 8, psqi: 3.1 },
  { day: 'اث', burnout: 48, sleep: 6.8, mood: 6, energy: 7, psqi: 4.2 },
  { day: 'ث', burnout: 45, sleep: 7.0, mood: 7, energy: 7, psqi: 3.8 },
  { day: 'أر', burnout: 55, sleep: 5.5, mood: 5, energy: 5, psqi: 5.5 },
  { day: 'خم', burnout: 58, sleep: 5.0, mood: 4, energy: 5, psqi: 6.1 },
  { day: 'جم', burnout: 67, sleep: 4.5, mood: 3, energy: 4, psqi: 7.0 },
  { day: 'سب', burnout: 63, sleep: 4.5, mood: 4, energy: 4, psqi: 7.2 },
];

const currentScores = {
  burnout: 63,
  sleep: 4.5,
  energy: 62,
  psqi: 7.2,
  phq3: 5,
  mbi: 58,
  calendarDensity: 42,
  mood: 4,
};

const sleepAvg = (weekData.reduce((s, d) => s + d.sleep, 0) / weekData.length).toFixed(1);
const lowSleepNights = weekData.filter(d => d.sleep < 6).length;

const calendarEvents = [
  { time: '09:00', title: 'Team Meeting', type: 'meeting' },
  { time: '13:00', title: 'Database Lecture', type: 'lecture' },
  { time: '15:30', title: 'Product Review', type: 'meeting' },
  { time: '17:00', title: 'Research Lab', type: 'study' },
];

const tasks = [
  {
    id: 'task-1',
    title: 'Final Project',
    deadline: '2026-07-01T17:00:00',
    estimatedHours: 12,
    priority: 'high',
    difficulty: 4,
    status: 'active',
    createdAt: '2026-06-21T09:00:00',
  },
  {
    id: 'task-2',
    title: 'Quarterly Report',
    deadline: '2026-06-28T16:00:00',
    estimatedHours: 6,
    priority: 'medium',
    difficulty: 3,
    status: 'active',
    createdAt: '2026-06-21T10:00:00',
  },
];

const scheduledSessions = [];

module.exports = {
  weekData,
  currentScores,
  sleepAvg,
  lowSleepNights,
  calendarEvents,
  tasks,
  scheduledSessions,
};
