// A ring with one open side: a day that is still in progress.
export function OvaraMark({ size = 28 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
    <rect width="32" height="32" rx="10" fill="var(--color-accent)"/>
    <path d="M23.2 11.6A9 9 0 1 0 25 16" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round"/>
    <circle cx="23.6" cy="9.4" r="2.6" fill="var(--color-night)"/>
  </svg>;
}

export default function Wordmark() {
  return <span className="wordmark"><OvaraMark/><span>Ovara</span></span>;
}
