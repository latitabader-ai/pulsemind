export const weekData = [
  { day: 'Sun', burnout: 42, sleep: 7.2, mood: 7, energy: 8, psqi: 3.1 },
  { day: 'Mon', burnout: 48, sleep: 6.8, mood: 6, energy: 7, psqi: 4.2 },
  { day: 'Tue',  burnout: 45, sleep: 7.0, mood: 7, energy: 7, psqi: 3.8 },
  { day: 'Wed', burnout: 55, sleep: 5.5, mood: 5, energy: 5, psqi: 5.5 },
  { day: 'Thu', burnout: 58, sleep: 5.0, mood: 4, energy: 5, psqi: 6.1 },
  { day: 'Fri', burnout: 67, sleep: 4.5, mood: 3, energy: 4, psqi: 7.0 },
  { day: 'Sat', burnout: 63, sleep: 4.5, mood: 4, energy: 4, psqi: 7.2 },
];

// عرض الشهر — 4 نقاط أسبوعية (التدهور يظهر بوضوح، النوم ينزل تحت 6)
export const monthData = [
  { day: 'W1', burnout: 44, sleep: 7.1, mood: 7, energy: 7, psqi: 3.4 },
  { day: 'W2', burnout: 51, sleep: 6.2, mood: 6, energy: 6, psqi: 4.6 },
  { day: 'W3', burnout: 57, sleep: 5.4, mood: 5, energy: 5, psqi: 5.8 },
  { day: 'W4', burnout: 63, sleep: 4.7, mood: 4, energy: 4, psqi: 6.9 },
];

// عرض 3 أشهر — نقاط شهرية (النوم يعبر للأحمر بحلول يونيو)
export const threeMonthData = [
  { day: 'Apr', burnout: 38, sleep: 7.2, mood: 8, energy: 8, psqi: 2.8 },
  { day: 'May', burnout: 49, sleep: 5.9, mood: 6, energy: 6, psqi: 4.5 },
  { day: 'Jun', burnout: 61, sleep: 4.9, mood: 4, energy: 5, psqi: 6.7 },
];

// مصفوفة مرتبة حسب رقم الزر (0=أسبوع، 1=شهر، 2=3أشهر) — تستخدمها AnalyticsScreen
export const rangeData = [weekData, monthData, threeMonthData];

export const forecastData = [
  { day: 'Today', burnout: 63 },
  { day: 'Tue',  burnout: 66 },
  { day: 'Wed',   burnout: 69 },
  { day: 'Thu',  burnout: 72 },
  { day: 'Fri',  burnout: 75 },
  { day: 'Sat',  burnout: 77 },
  { day: 'Sun',  burnout: 79 },
];

export const currentScores = {
  burnout: 63,
  sleep: 4.5,
  energy: 62,
  psqi: 7.2,
  phq3: 5,
  mbi: 58,
  calendarDensity: 42,
  mood: 4,
};

export const calendarEvents = [
  { time: '09:00', title: 'Team Meeting', type: 'meeting' },
  { time: '13:00', title: 'Database Lecture', type: 'lecture' },
  { time: '15:30', title: 'Product Review', type: 'meeting' },
  { time: '17:00', title: 'Research Lab', type: 'study' },
];

export const tasks = [
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

export const scheduledSessions = [];

export const peers = [
  { id: 1, name: 'سعد العمري', initials: 'سع', role: 'صديق — مرشد أكاديمي', status: 'متاح' },
  { id: 2, name: 'نورة الحربي', initials: 'نح', role: 'صديقة — زميلة دراسة', status: 'متاح' },
];

export const alertHistory = [
  { type: 'warning', text: 'تم إرسال تنبيه لسعد — مؤشر 71%', date: 'الإثنين الماضي' },
  { type: 'success', text: 'انخفض المؤشر إلى 48% بعد التدخل', date: 'الأربعاء الماضي' },
  { type: 'warning', text: 'تم إرسال تنبيه لنورة — مؤشر 68%', date: 'قبل أسبوعين' },
];

export const recoveryPlan = [
  { category: 'النوم', icon: '🌙', title: 'روتين نوم ثابت', desc: 'النوم قبل 11 مساءً لمدة 7 أيام', progress: 28 },
  { category: 'التركيز', icon: '⏱', title: 'بومودورو 25/5', desc: 'جلسات مذاكرة منظمة مع استراحات', progress: 60 },
  { category: 'الاسترخاء', icon: '🫁', title: 'تنفس عميق', desc: '5 دقائق صباحاً يومياً', progress: 45 },
  { category: 'النشاط', icon: '🚶', title: '8000 خطوة يومياً', desc: 'زيادة النشاط البدني تدريجياً', progress: 35 },
];
