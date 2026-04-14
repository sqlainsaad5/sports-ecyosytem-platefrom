import { useEffect, useMemo, useState } from 'react';
import PlayerCard from '../../components/player/PlayerCard';
import PlayerPageHeader from '../../components/player/PlayerPageHeader';
import SkillArcRow from '../../components/player/SkillArcRow';
import { playerTableHead, playerTableRow } from '../../components/player/playerClassNames';
import { api, getErrorMessage } from '../../services/api';

export default function PlayerPerformance() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    api
      .get('/players/performance')
      .then((r) => setRows(r.data.data || []))
      .catch((e) => setErr(getErrorMessage(e)));
  }, []);

  const latest = useMemo(() => {
    const sorted = [...rows].sort((a, b) => new Date(b.weekStartDate) - new Date(a.weekStartDate));
    return sorted[0] || null;
  }, [rows]);

  return (
    <div className="space-y-10">
      <PlayerPageHeader title="Performance" subtitle="Coach evaluations by week." />
      {err ? <p className="mb-4 text-sm text-red-400">{err}</p> : null}

      <PlayerCard className="p-8">
        <h3 className="player-headline-section mb-6 font-headline text-xl font-bold uppercase tracking-tight text-white">
          Latest breakdown
        </h3>
        <div className="grid gap-8 md:grid-cols-3">
          <SkillArcRow label="Technique" sub="Precision & control" value={latest?.technique} stroke="#00FF87" />
          <SkillArcRow label="Fitness" sub="Stamina & power" value={latest?.fitness} stroke="#00B4D8" />
          <SkillArcRow label="Attitude" sub="Mindset & focus" value={latest?.attitude} stroke="#A855F7" />
        </div>
      </PlayerCard>

      {rows.length > 1 ? (
        <PlayerCard className="p-6">
          <h3 className="player-headline-section mb-4 font-headline text-xl font-bold uppercase tracking-tight text-white">
            Trend (technique)
          </h3>
          <div className="flex h-32 items-end gap-1">
            {[...rows]
              .sort((a, b) => new Date(a.weekStartDate) - new Date(b.weekStartDate))
              .slice(-8)
              .map((r) => (
                <div key={r._id} className="flex flex-1 flex-col items-center justify-end">
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-player-green/40 to-player-green"
                    style={{ height: `${Math.min(100, Number(r.technique) || 0)}%` }}
                    title={`${r.technique}`}
                  />
                  <span className="mt-1 text-[9px] text-player-on-variant">
                    {new Date(r.weekStartDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
          </div>
        </PlayerCard>
      ) : null}

      <PlayerCard elevate={false} className="overflow-x-auto p-0">
        <table className="min-w-full text-sm">
          <thead className={playerTableHead}>
            <tr>
              <th className="px-4 py-3">Week</th>
              <th className="px-4 py-3">Technique</th>
              <th className="px-4 py-3">Fitness</th>
              <th className="px-4 py-3">Attitude</th>
              <th className="px-4 py-3">Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._id} className={playerTableRow}>
                <td className="px-4 py-3 text-player-on-surface">{new Date(r.weekStartDate).toLocaleDateString()}</td>
                <td className="px-4 py-3 font-orbitron text-player-green">{r.technique}</td>
                <td className="px-4 py-3">{r.fitness}</td>
                <td className="px-4 py-3">{r.attitude}</td>
                <td className="px-4 py-3 text-player-on-variant">{r.comments}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && !err ? (
          <p className="p-6 text-sm text-player-on-variant">No evaluations recorded yet.</p>
        ) : null}
      </PlayerCard>
    </div>
  );
}
