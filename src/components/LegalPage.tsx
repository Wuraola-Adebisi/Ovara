import type { ReactNode } from 'react';
import { usePageTitle } from './PagePrimitives';

export type LegalSection = { heading: string; body: ReactNode };

export default function LegalPage({ title, updated, intro, sections }: { title: string; updated: string; intro: string; sections: LegalSection[] }) {
  usePageTitle(title);
  return <main className="prose-page legal" id="main">
    <div className="container narrow">
      <h1>{title}</h1>
      <p className="muted">Last updated: {updated}</p>
      <p className="lead">{intro}</p>
      {sections.map((section, index) => <section key={section.heading}><h2>{index + 1}. {section.heading}</h2>{section.body}</section>)}
    </div>
  </main>;
}
