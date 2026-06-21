import React, { useState } from 'react';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import Navbar from './components/Navbar';
import HomeScreen from './components/HomeScreen';
import CheckinScreen from './components/CheckinScreen';
import AnalyticsScreen from './components/AnalyticsScreen';
import CoachScreen from './components/CoachScreen';
import AlertScreen from './components/AlertScreen';
import WorkloadPlannerScreen from './components/WorkloadPlannerScreen';
import { calendarEvents as initialCalendarEvents, scheduledSessions as initialSessions, tasks as initialTasks } from './data/mockData';

const screens = {
  home: HomeScreen,
  checkin: CheckinScreen,
  analytics: AnalyticsScreen,
  coach: CoachScreen,
  alert: AlertScreen,
  planner: WorkloadPlannerScreen,
};

function LanguageToggle() {
  const { t, toggleLang } = useLanguage();
  return (
    <button
      onClick={toggleLang}
      style={{
        position: 'absolute', top: 14, insetInlineEnd: 14, zIndex: 20,
        background: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.4)',
        color: '#fff', borderRadius: 20, padding: '5px 12px',
        fontSize: 11, fontWeight: 600, backdropFilter: 'blur(4px)',
      }}
    >
      🌐 {t.common.langSwitch}
    </button>
  );
}

function AppShell() {
  const [active, setActive] = useState('home');
  const [calendarEvents, setCalendarEvents] = useState(initialCalendarEvents);
  const [tasks, setTasks] = useState(initialTasks);
  const [scheduledSessions, setScheduledSessions] = useState(initialSessions);
  const Screen = screens[active];

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', padding: 20,
    }}>
      <div style={{
        width: 390, height: 780, maxHeight: '95vh',
        background: 'var(--gray-bg)', borderRadius: 36,
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        border: '8px solid #1a202c', position: 'relative',
      }}>
        <LanguageToggle />
        <Screen
          onNav={setActive}
          calendarEvents={calendarEvents}
          setCalendarEvents={setCalendarEvents}
          tasks={tasks}
          setTasks={setTasks}
          scheduledSessions={scheduledSessions}
          setScheduledSessions={setScheduledSessions}
        />
        <Navbar active={active} onNav={setActive} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppShell />
    </LanguageProvider>
  );
}
