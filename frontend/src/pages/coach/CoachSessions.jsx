import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../../services/api';

export default function CoachSessions() {
  const [list, setList] = useState([]);
  const [err, setErr] = useState('');
  useEffect(() => {
    api
      .get('/coaches/training-sessions')
      .then((r) => setList(r.data.data || []))
      .catch((e) => setErr(getErrorMessage(e)));
  }, []);

  const mark = async (id, present) => {
    try {
      await api.post(`/coaches/sessions/${id}/attendance`, { present });
      alert('Attendance saved');
    } catch (e) {
      alert(getErrorMessage(e));
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-5xl tracking-[0.08em] text-white">WEEKLY SCHEDULE</h1>
        <p className="font-headline text-xs uppercase tracking-[0.3em] text-slate-500">Training Timeline</p>
      </div>
      {err && <p className="text-sm text-red-400 mt-2">{err}</p>}
      <ul className="mt-4 grid gap-4">
        {list.map((s) => (
          <li key={s._id} className="midnight-asymmetric grid gap-4 border border-player-inner/40 bg-player-container p-4 shadow-player-card md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="font-display text-3xl text-white">{s.player?.playerProfile?.fullName || s.player?.email || `player ${s.player?._id || s.player}`}</p>
              <p className="font-orbitron text-xs uppercase tracking-[0.15em] text-[#ff7524]">{new Date(s.scheduledAt).toLocaleString()}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" className="bg-[#ff7524] px-3 py-2 font-display text-lg tracking-widest text-black" onClick={() => mark(s._id, true)}>
                PRESENT
              </button>
              <button type="button" className="border border-player-inner px-3 py-2 font-display text-lg tracking-widest text-slate-300" onClick={() => mark(s._id, false)}>
                ABSENT
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
