import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../../services/api';

export default function CoachRequests() {
  const [list, setList] = useState([]);
  const [err, setErr] = useState('');

  const load = () =>
    api
      .get('/coaches/training-requests')
      .then((r) => setList(r.data.data || []))
      .catch((e) => setErr(getErrorMessage(e)));

  useEffect(() => {
    load();
  }, []);

  const act = async (id, status) => {
    let scheduledAt;
    if (status === 'accepted') {
      const t = prompt('Scheduled at (ISO datetime), or leave empty for default');
      if (t) scheduledAt = t;
    }
    const body = scheduledAt ? { status, scheduledAt } : { status };
    try {
      await api.patch(`/coaches/training-requests/${id}`, body);
      load();
    } catch (e) {
      alert(getErrorMessage(e));
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl tracking-[0.08em] text-white">TRAINING REQUESTS</h1>
          <p className="font-headline text-xs uppercase tracking-[0.3em] text-slate-500">Management Dashboard</p>
        </div>
      </div>
      {err && <p className="text-sm text-red-400 mt-2">{err}</p>}
      <ul className="mt-4 grid gap-6 xl:grid-cols-2">
        {list.map((r) => (
          <li key={r._id} className="midnight-asymmetric relative overflow-hidden border-l-4 border-[#ff7524] bg-player-surface p-6 shadow-player-card">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="font-display text-4xl text-white">
                {r.player?.playerProfile?.fullName || r.player?.email || String(r.player?._id || r.player || '')}
                </p>
                <p className="font-headline text-[11px] uppercase tracking-[0.2em] text-slate-500">{r.status}</p>
              </div>
              <span className="rounded-full bg-[#ff7524]/10 px-3 py-1 font-orbitron text-[10px] uppercase tracking-widest text-[#ff7524]">Pending</span>
            </div>
            {r.message && <p className="mb-6 border-b border-[#ff7524]/20 bg-player-bg/60 p-3 text-sm italic text-slate-300">"{r.message}"</p>}
            <div className="flex items-center justify-between border-t border-white/5 pt-5">
              <span className="text-[10px] font-headline uppercase tracking-[0.22em] text-slate-500">Live request</span>
              {r.status === 'pending' && (
                <div className="flex gap-3">
                  <button type="button" className="px-4 py-2 font-display text-xl tracking-[0.14em] text-slate-400 transition hover:text-red-400" onClick={() => act(r._id, 'rejected')}>
                    DECLINE
                  </button>
                  <button type="button" className="bg-[#ff7524] px-6 py-2 font-display text-xl tracking-[0.14em] text-black shadow-[0_0_20px_rgba(255,107,0,0.25)] transition hover:brightness-110" onClick={() => act(r._id, 'accepted')}>
                    ACCEPT
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
