export type Bar = { key: string; label: string; fullLabel: string; value: number; highlight?: boolean };

export default function BarChart({ bars, unit, target, labelEvery = 1 }: { bars: Bar[]; unit: string; target?: number; labelEvery?: number }) {
  const max = Math.max(1, target ?? 0, ...bars.map(bar => bar.value));
  return <div className="chart">
    <div className="chart-plot">
      {target ? <div className="chart-target" style={{ bottom: (target / max * 100) + '%' }}><span>Target</span></div> : null}
      {bars.map(bar => <div className="chart-col" key={bar.key}>
        <div className={bar.highlight ? 'chart-bar is-today' : 'chart-bar'} style={{ height: (bar.value / max * 100) + '%' }} role="img" aria-label={bar.fullLabel + ': ' + bar.value.toLocaleString() + ' ' + unit}/>
      </div>)}
    </div>
    <div className="chart-labels" aria-hidden="true">
      {bars.map((bar, index) => <span key={bar.key}>{index % labelEvery === 0 || index === bars.length - 1 ? bar.label : ''}</span>)}
    </div>
  </div>;
}
