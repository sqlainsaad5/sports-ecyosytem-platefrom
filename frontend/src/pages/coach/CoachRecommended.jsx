import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../../services/api';

/** SRS UC-C4 — system-recommended players for this coach */
export default function CoachRecommended() {
  const [list, setList] = useState([]);
  const [err, setErr] = useState('');

  const load = () => {
    api
      .get('/coaches/recommended-players')
      .then((r) => setList(r.data.data || []))
      .catch((e) => setErr(getErrorMessage(e)));
  };

  useEffect(() => {
    load();
  }, []);

  const notify = async (playerId) => {
    try {
      await api.post(`/coaches/recommended-players/${playerId}/notify`);
      alert('Player notified. They can reach out via training requests.');
    } catch (e) {
      alert(getErrorMessage(e));
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-5xl tracking-[0.08em] text-white">MATCHED PLAYERS</h1>
        <p className="font-headline text-xs uppercase tracking-[0.3em] text-[#ff7524]">SRS UC-C4 — sport, location &amp; skill alignment</p>
      </div>
      {err && <p className="text-sm text-red-400">{err}</p>}
      <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {list.map((row) => (
          <li
            key={row.userId}
            className="midnight-asymmetric border-l-4 border-transparent bg-player-container p-5 transition hover:border-[#ff7524] hover:bg-player-surface"
          >
            <p className="font-display text-3xl text-white">{row.profile?.fullName || 'Player'}</p>
            <p className="mt-2 text-sm text-slate-400">
              {row.profile?.sportPreference} · {row.profile?.skillLevel}
              {row.profile?.city ? ` · ${row.profile.city}` : ''}
            </p>
            <p className="mt-2 font-orbitron text-sm text-player-green">Match score {Math.round(row.matchScore)}</p>
            <button
              type="button"
              className="mt-4 bg-[#ff7524] px-4 py-2 font-display text-lg tracking-[0.12em] text-black"
              onClick={() => notify(row.userId)}
            >
              SEND INTEREST
            </button>
          </li>
        ))}
      </ul>
      {!err && list.length === 0 && <p className="text-slate-500">No matching players yet — complete your profile specialties and city.</p>}
    </div>
  );
}
