import { useEffect } from 'react';
import type { ReactNode } from 'react';

export function usePageTitle(title: string) {
  useEffect(() => { document.title = title + ' | Ovara'; }, [title]);
}

export function PageHeader({ title, desc, action }: { title: string; desc?: string; action?: ReactNode }) {
  usePageTitle(title);
  return <header className="page-head"><div><h1>{title}</h1>{desc && <p>{desc}</p>}</div>{action && <div className="page-head-action">{action}</div>}</header>;
}

export function Card({ title, action, children, className = '' }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={('card ' + className).trim()}>
    {(title || action) && <div className="card-head">{title && <h2>{title}</h2>}{action}</div>}
    {children}
  </section>;
}

export function Meter({ value, max, label }: { value: number; max: number; label: string }) {
  const percent = max > 0 ? Math.min(100, Math.round(value / max * 100)) : 0;
  return <div className={percent >= 100 ? 'meter is-full' : 'meter'} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><i style={{ width: percent + '%' }}/></div>;
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return <div className="empty"><b>{title}</b><p>{body}</p>{action}</div>;
}
