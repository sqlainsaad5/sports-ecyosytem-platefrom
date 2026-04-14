import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../../services/api';

/** SRS UC-C12 — balance, history, withdrawal */
export default function CoachPayments() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [withdrawAmt, setWithdrawAmt] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => {
    api
      .get('/coaches/payments')
      .then((r) => setData(r.data.data))
      .catch((e) => setErr(getErrorMessage(e)));
  };

  useEffect(() => {
    load();
  }, []);

  const withdraw = async (e) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmt, 10);
    if (!amount || amount <= 0) return;
    setBusy(true);
    try {
      await api.post('/coaches/payments/withdrawal', { amount });
      setWithdrawAmt('');
      load();
    } catch (err2) {
      alert(getErrorMessage(err2));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="midnight-asymmetric relative overflow-hidden bg-player-container p-8 shadow-player-hero">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#ff7524]/20 blur-3xl" />
        <p className="font-headline text-xs uppercase tracking-[0.3em] text-[#ff7524]">Gross received</p>
        <h1 className="mt-2 font-orbitron text-5xl text-white md:text-7xl">{data?.totalReceived ?? 0}</h1>
        <p className="mt-4 font-headline text-xs uppercase tracking-[0.3em] text-slate-400">Available (after withdrawals)</p>
        <p className="font-orbitron text-3xl text-player-green md:text-4xl">{data?.availableBalance ?? data?.totalReceived ?? 0}</p>
      </section>
      {err && <p className="text-sm text-red-400 mt-2">{err}</p>}
      <section className="midnight-asymmetric border border-player-inner/40 bg-player-container p-6">
        <h2 className="font-headline text-lg uppercase tracking-[0.12em] text-white">Request withdrawal</h2>
        <p className="mt-1 text-xs text-slate-500">Prototype settlement — SRS UC-C12</p>
        <form className="mt-4 flex flex-wrap items-end gap-3" onSubmit={withdraw}>
          <label className="flex flex-col text-sm text-slate-400">
            Amount
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={withdrawAmt}
              onChange={(e) => setWithdrawAmt(e.target.value)}
              className="mt-1 rounded border border-player-inner/50 bg-black/30 px-3 py-2 font-orbitron text-white"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-[#ff7524] px-5 py-2 font-display text-lg tracking-[0.12em] text-black disabled:opacity-50"
          >
            {busy ? '…' : 'WITHDRAW'}
          </button>
        </form>
      </section>
      <section>
        <h2 className="font-headline text-2xl font-bold uppercase tracking-[0.08em] text-white">Transaction History</h2>
      <ul className="mt-4 space-y-2">
        {(data?.transactions || []).map((t) => (
          <li key={t._id} className="midnight-asymmetric grid gap-2 border border-player-inner/40 bg-player-container px-4 py-3 text-sm md:grid-cols-[1fr_auto_auto] md:items-center">
            <span className="font-headline uppercase tracking-widest text-slate-300">{t.type}</span>
            <span className="font-orbitron text-white">{t.amount}</span>
            <span className={`text-xs font-headline uppercase tracking-widest ${t.status === 'completed' ? 'text-player-green' : 'text-[#ff7524]'}`}>{t.status}</span>
          </li>
        ))}
      </ul>
      </section>
    </div>
  );
}
