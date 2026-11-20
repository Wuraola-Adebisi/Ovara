import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PagePrimitives';

export default function NotFoundPage({ inApp = false }: { inApp?: boolean }) {
  const content = <>
    <PageHeader title="That page does not exist" desc="The link may be old, or the address may have a typo."/>
    <p><Link className="btn btn-primary" to={inApp ? '/app' : '/'}>{inApp ? 'Back to today' : 'Back to the homepage'}</Link></p>
  </>;
  return inApp ? <div className="stack">{content}</div> : <main className="prose-page" id="main">{content}</main>;
}
