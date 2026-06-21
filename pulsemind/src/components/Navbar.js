import React from 'react';
import { BarChart3, Bell, Bot, CalendarDays, CheckCircle2, Home } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const tabIcons = {
  home: Home,
  checkin: CheckCircle2,
  analytics: BarChart3,
  planner: CalendarDays,
  coach: Bot,
  alert: Bell,
};

const tabOrder = ['home', 'checkin', 'analytics', 'planner', 'coach', 'alert'];

export default function Navbar({ active, onNav }) {
  const { t } = useLanguage();

  return (
    <nav style={{
      display: 'flex', justifyContent: 'space-around',
      padding: '10px 0 14px',
      borderTop: '1px solid var(--border)',
      background: 'var(--card-bg)',
      position: 'sticky', bottom: 0,
    }}>
      {tabOrder.map((id) => {
        const Icon = tabIcons[id];
        return (
          <button key={id} onClick={() => onNav(id)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 3, background: 'none', border: 'none',
            color: active === id ? 'var(--teal)' : 'var(--text-muted)',
            fontSize: 10, fontWeight: active === id ? 600 : 400,
            transition: 'color .15s',
          }}>
            <Icon size={19} strokeWidth={active === id ? 2.6 : 2} />
            {t.nav[id]}
          </button>
        );
      })}
    </nav>
  );
}
