import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getErrorMessage } from '../../services/api';

export default function BusinessDashboard() {
  const [p, setP] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    api
      .get('/business/me/profile')
      .then((r) => setP(r.data.data))
      .catch((e) => setErr(getErrorMessage(e)));
  }, []);
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-rajdhani text-5xl font-bold uppercase tracking-tight text-white">Operational Dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">Real-time performance metrics for your sports franchise.</p>
        </div>
      </div>
      {err && <p className="text-sm text-red-400 mt-2">{err}</p>}
      {p && (
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="rounded-xl bg-[#11192c] p-6">
            <p className="text-xs uppercase tracking-widest text-slate-400">Store</p>
            <p className="mt-2 font-rajdhani text-3xl font-bold text-white">{p.storeName}</p>
          </div>
          <div className="rounded-xl bg-[#11192c] p-6">
            <p className="text-xs uppercase tracking-widest text-slate-400">Plan</p>
            <p className="mt-2 font-orbitron text-3xl font-bold text-[#cc97ff]">{p.subscriptionPackage}</p>
          </div>
          <div className="rounded-xl bg-[#11192c] p-6">
            <p className="text-xs uppercase tracking-widest text-slate-400">Slots left</p>
            <p className="mt-2 font-orbitron text-3xl font-bold text-[#9bffce]">{p.listingSlotsRemaining}</p>
          </div>
          <div className="rounded-xl bg-[#11192c] p-6 flex items-end">
            <Link to="/business/subscription" className="w-full rounded-lg bg-gradient-to-r from-[#cc97ff] to-[#9c48ea] px-4 py-3 text-center font-rajdhani font-bold uppercase tracking-[0.14em] text-[#360061]">
              Manage subscription
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
