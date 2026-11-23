import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';

const siteUrl = 'https://www.withovara.com';

export function usePageTitle(title: string, pageDescription?: string) {
  const { pathname } = useLocation();
  useEffect(() => {
    const description = pageDescription || 'Ovara is a health and wellness space shaped around real life, with room for movement, nourishment, habits and reflection.';
    const pageUrl = siteUrl + (pathname === '/' ? '/' : pathname.replace(/\/$/, ''));
    const pageTitle = title + ' | Ovara';
    document.title = pageTitle;

    const setMeta = (selector: string, attribute: string, value: string) => {
      let element = document.head.querySelector<HTMLMetaElement>(selector);
      if (!element) { element = document.createElement('meta'); document.head.appendChild(element); }
      element.setAttribute(attribute, value);
    };
    const setLink = (selector: string, rel: string, href: string) => {
      let element = document.head.querySelector<HTMLLinkElement>(selector);
      if (!element) { element = document.createElement('link'); document.head.appendChild(element); }
      element.setAttribute('rel', rel);
      element.setAttribute('href', href);
    };

    setMeta('meta[name="description"]', 'name', 'description');
    setMeta('meta[property="og:title"]', 'property', 'og:title');
    setMeta('meta[property="og:description"]', 'property', 'og:description');
    setMeta('meta[property="og:url"]', 'property', 'og:url');
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title');
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description');
    setMeta('meta[name="robots"]', 'name', 'robots');
    document.head.querySelector('meta[name="description"]')?.setAttribute('content', description);
    document.head.querySelector('meta[property="og:title"]')?.setAttribute('content', pageTitle);
    document.head.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
    document.head.querySelector('meta[property="og:url"]')?.setAttribute('content', pageUrl);
    document.head.querySelector('meta[name="twitter:title"]')?.setAttribute('content', pageTitle);
    document.head.querySelector('meta[name="twitter:description"]')?.setAttribute('content', description);
    document.head.querySelector('meta[name="robots"]')?.setAttribute('content', pathname.startsWith('/app') ? 'noindex, nofollow' : 'index, follow');
    setLink('link[rel="canonical"]', 'canonical', pageUrl);
  }, [title, pageDescription, pathname]);
}

export function PageHeader({ title, desc, action }: { title: string; desc?: string; action?: ReactNode }) {
  usePageTitle(title, desc);
  return <header className="page-head"><div><h1>{title}</h1>{desc && <p>{desc}</p>}</div>{action && <div className="page-head-action">{action}</div>}</header>;
}

export function PageFeature({ eyebrow, text, image, imageAlt }: { eyebrow: string; text: string; image: string; imageAlt: string }) {
  return <section className="page-feature" aria-label={eyebrow}>
    <div className="page-feature-copy"><span className="eyebrow">{eyebrow}</span><p>{text}</p></div>
    <img src={image} alt={imageAlt} loading="lazy" />
  </section>;
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
