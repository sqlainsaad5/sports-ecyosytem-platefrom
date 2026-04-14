export default function SkillArcRow({ label, sub, value, stroke }) {
  const r = 40;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, Number(value) || 0)) / 100;
  return (
    <div className="flex items-center gap-6">
      <div className="relative h-20 w-20 shrink-0">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden>
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={stroke}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${pct * c} ${c}`}
          />
        </svg>
        <div className="player-stat-figure absolute inset-0 flex items-center justify-center text-xs">
          {value != null ? `${Math.round(value)}%` : '—'}
        </div>
      </div>
      <div>
        <p className="text-sm font-bold text-white">{label}</p>
        <p className="text-[10px] font-medium uppercase text-player-on-variant">{sub}</p>
      </div>
    </div>
  );
}
