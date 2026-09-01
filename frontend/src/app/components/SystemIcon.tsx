import { IconoModulo } from '@/lib/modulos';

const paths: Record<IconoModulo | 'home' | 'user' | 'flame' | 'buscar', React.ReactNode> = {
  buscar: <><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></>,
  home: <><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10M9 20v-6h6v6"/></>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4.5 21c.5-4.5 3.2-7 7.5-7s7 2.5 7.5 7"/></>,
  flame: <path d="M13.8 2.5c.4 3-1.2 4.3-2.6 6.1-1.1-1.3-1.4-2.4-1.1-4.1C6.5 7 4.5 10 5.2 14.2A7 7 0 0 0 19 13c0-3.6-2-6.9-5.2-10.5Z"/>,
  building: <><path d="M3 21h18M5 21V8l7-4 7 4v13M9 11h.01M15 11h.01M9 15h.01M15 15h.01M10 21v-3h4v3"/></>,
  people: <><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3.5 20c.3-4 2.3-6 5.5-6s5.2 2 5.5 6M15 14c3 0 5 1.8 5.5 5"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  shield: <><path d="M12 3 20 6v5c0 5-3.2 8.2-8 10-4.8-1.8-8-5-8-10V6l8-3Z"/><path d="m9 12 2 2 4-4"/></>,
  alert: <><path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v4M12 17h.01"/></>,
  truck: <><path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z"/><circle cx="7" cy="19" r="2"/><circle cx="18" cy="19" r="2"/></>,
  tools: <><path d="m14 7 3-3 3 3-3 3M4 20l9-9M7 4l3 3-3 3-3-3 3-3Z"/><path d="m14 14 6 6"/></>,
  academy: <><path d="m3 9 9-5 9 5-9 5-9-5Z"/><path d="M7 12v4c3 2 7 2 10 0v-4M21 9v6"/></>,
  finance: <><circle cx="12" cy="12" r="9"/><path d="M15 8.5c-.7-.7-1.6-1-3-1-1.7 0-3 .9-3 2s1 1.8 3 2.4 3 1.2 3 2.6-1.3 2.5-3 2.5c-1.4 0-2.5-.4-3.3-1.2M12 5v14"/></>,
  box: <><path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="M4 7v10l8 4 8-4V7M12 11v10"/></>,
  document: <><path d="M6 3h8l4 4v14H6zM14 3v5h4M9 12h6M9 16h6"/></>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></>,
  chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>,
};

export function SystemIcon({ name, size = 20 }: { name: keyof typeof paths; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
