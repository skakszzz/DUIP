'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Props {
  workspaceId: string;
}

function HomeIcon({ active }: { active: boolean }) {
  const c = active ? '#5C3A1F' : '#B09779';
  const sw = active ? 2.2 : 1.8;
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11 12 4l8 7v8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19Z" fill={c} fillOpacity={active ? 0.14 : 0}/>
      <path d="M10 20v-5h4v5"/>
    </svg>
  );
}

function CalendarIcon({ active }: { active: boolean }) {
  const c = active ? '#5C3A1F' : '#B09779';
  const sw = active ? 2.2 : 1.8;
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" fill={c} fillOpacity={active ? 0.14 : 0}/>
      <path d="M3.5 10h17M8 3v4M16 3v4"/>
      {active && <circle cx="12" cy="15" r="1.3" fill={c} stroke="none"/>}
    </svg>
  );
}

function GardenIcon({ active }: { active: boolean }) {
  const c = active ? '#5C3A1F' : '#B09779';
  const sw = active ? 2.2 : 1.8;
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20s-7-3-7-9a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 6-7 9-7 9Z" fill={c} fillOpacity={active ? 0.14 : 0}/>
      <path d="M12 20V10"/>
    </svg>
  );
}

export default function TabBar({ workspaceId }: Props) {
  const pathname = usePathname();

  const isCalendar = pathname.includes('/calendar');
  const isGarden = pathname.includes('/garden');
  const isHome = !isCalendar && !isGarden;

  const tabs = [
    { id: 'home',     label: '홈',    href: `/workspaces/${workspaceId}/today`,    Icon: HomeIcon,     active: isHome },
    { id: 'calendar', label: '캘린더', href: `/workspaces/${workspaceId}/calendar`, Icon: CalendarIcon, active: isCalendar },
    { id: 'garden',   label: '동산',   href: `/workspaces/${workspaceId}/garden`,   Icon: GardenIcon,   active: isGarden },
  ];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{ background: 'linear-gradient(180deg, rgba(251,246,238,0) 0%, rgba(251,246,238,0.97) 28%, #FBF6EE 100%)' }}
    >
      <div
        className="max-w-md mx-auto"
        style={{ borderTop: '1px solid rgba(234,223,199,0.55)', paddingBottom: 'env(safe-area-inset-bottom, 10px)' }}
      >
        <div className="flex items-center pt-1">
          {tabs.map(({ id, label, href, Icon, active }) => (
            <Link
              key={id}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-[3px]"
              style={{ height: 60 }}
            >
              <Icon active={active} />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: active ? 800 : 600,
                  color: active ? '#5C3A1F' : '#B09779',
                  letterSpacing: '-0.01em',
                }}
              >
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
