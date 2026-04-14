import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../../services/api';

export default function CoachPayments() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    api
      .get('/coaches/payments')
      .then((r) => setData(r.data.data))
      .catch((e) => setErr(getErrorMessage(e)));
  }, []);
  return (
    <div className="space-y-8">
      <section className="midnight-asymmetric relative overflow-hidden bg-player-container p-8 shadow-player-hero">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#ff7524]/20 blur-3xl" />
        <p className="font-headline text-xs uppercase tracking-[0.3em] text-[#ff7524]">Available Balance</p>
        <h1 className="mt-2 font-orbitron text-5xl text-white md:text-7xl">{data?.totalReceived ?? 0}</h1>
      </section>
      {err && <p className="text-sm text-red-400 mt-2">{err}</p>}
      <section>
        <h2 className="font-headline text-2xl font-bold uppercase tracking-[0.08em] text-white">Transaction History</h2>
      <ul className="mt-4 space-y-2">
        {(data?.transactions || []).map((t) => (
          <li key={t._id} className="midnight-asymmetric grid gap-2 border border-player-inner/40 bg-player-container px-4 py-3 text-sm md:grid-cols-[1fr_auto_auto] md:items-center">
            <span className="font-headline uppercase tracking-widest text-slate-300">{t.type}</span>
            <span className="font-orbitron text-white">{t.amount}</span>
            <span className={`text-xs font-headline uppercase tracking-widest ${t.status === 'success' ? 'text-player-green' : 'text-[#ff7524]'}`}>{t.status}</span>
          </li>
        ))}
      </ul>
      </section>
    </div>
  );
}
