import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getErrorMessage } from '../../services/api';

export default function CoachDashboard() {
  const [s, setS] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    Promise.all([api.get('/coaches/training-requests'), api.get('/coaches/payments')])
      .then(([a, b]) =>
        setS({
          pending: (a.data.data || []).filter((x) => x.status === 'pending').length,
          earned: b.data.data?.totalReceived ?? 0,
        })
      )
      .catch((e) => setErr(getErrorMessage(e)));
  }, []);
  return (
    <div className="space-y-8 text-player-on-surface">
      <section className="midnight-asymmetric relative overflow-hidden bg-gradient-to-r from-[#a04100] to-[#ff7524] px-6 py-8 shadow-player-hero md:px-10">
        <div className="absolute -right-10 -top-6 text-[180px] text-white/10">
          <span className="material-symbols-outlined">sports_cricket</span>
        </div>
        <div className="relative z-10">
          <h1 className="font-display text-5xl tracking-tight text-white md:text-7xl">WELCOME BACK, COACH</h1>
          <p className="mt-2 font-headline text-sm uppercase tracking-[0.18em] text-white/85">Elite Performance Command Center</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/coach/requests" className="bg-white px-6 py-3 font-display text-xl tracking-[0.14em] text-[#a04100] transition hover:brightness-95">
              VIEW REQUESTS
            </Link>
            <Link to="/coach/sessions" className="border-2 border-white px-6 py-3 font-display text-xl tracking-[0.14em] text-white transition hover:bg-white/10">
              OPEN SCHEDULE
            </Link>
          </div>
        </div>
      </section>

      {err && <p className="text-sm text-red-400">{err}</p>}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="midnight-asymmetric border-l-4 border-[#ff7524] bg-player-container p-5 shadow-player-card">
          <p className="font-headline text-xs uppercase tracking-[0.16em] text-player-on-variant">Pending Requests</p>
          <p className="mt-2 font-orbitron text-3xl font-bold text-white">{s?.pending ?? '—'}</p>
        </div>
        <div className="midnight-asymmetric border-l-4 border-player-green bg-player-container p-5 shadow-player-card">
          <p className="font-headline text-xs uppercase tracking-[0.16em] text-player-on-variant">Total Received</p>
          <p className="mt-2 font-orbitron text-3xl font-bold text-white">{s?.earned ?? '—'}</p>
        </div>
        <div className="midnight-asymmetric border-l-4 border-violet-400 bg-player-container p-5 shadow-player-card">
          <p className="font-headline text-xs uppercase tracking-[0.16em] text-player-on-variant">Session Readiness</p>
          <p className="mt-2 font-orbitron text-3xl font-bold text-white">94%</p>
        </div>
        <div className="midnight-asymmetric border-l-4 border-cyan-400 bg-player-container p-5 shadow-player-card">
          <p className="font-headline text-xs uppercase tracking-[0.16em] text-player-on-variant">Weekly Volume</p>
          <p className="mt-2 font-orbitron text-3xl font-bold text-white">18</p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="midnight-asymmetric lg:col-span-2 bg-player-container p-6 shadow-player-card">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-headline text-xl font-bold uppercase tracking-[0.08em] text-white">Weekly Session Volume</h2>
            <span className="rounded bg-player-inner px-3 py-1 font-headline text-xs uppercase tracking-widest text-player-on-variant">Last 7 days</span>
          </div>
          <div className="flex h-56 items-end gap-2">
            {[40, 66, 84, 52, 73, 30, 20].map((height, idx) => (
              <div key={height} className="flex flex-1 flex-col items-center gap-2">
                <div className={`w-full rounded-t-sm ${idx === 2 ? 'bg-[#ff7524]' : 'bg-[#ff7524]/25'}`} style={{ height: `${height}%` }} />
                <span className={`font-headline text-[10px] uppercase ${idx === 2 ? 'text-[#ff7524]' : 'text-slate-500'}`}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="midnight-asymmetric bg-player-container p-6 shadow-player-card">
          <h2 className="font-headline text-xl font-bold uppercase tracking-[0.08em] text-white">Top Performers</h2>
          <ul className="mt-6 space-y-4">
            {[
              ['Bilal Raza', '142 KPH', 85],
              ['Hamza Ali', '138 KPH', 72],
              ['Zain Siddiqui', '135 KPH', 65],
            ].map(([name, speed, width]) => (
              <li key={name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white">{name}</span>
                  <span className="font-orbitron text-xs text-player-green">{speed}</span>
                </div>
                <div className="h-1.5 rounded-full bg-player-bg">
                  <div className="h-full rounded-full bg-player-green" style={{ width: `${width}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
