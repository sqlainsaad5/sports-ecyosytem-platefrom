import { useState } from 'react';
import { api, getErrorMessage } from '../../services/api';

export default function BusinessSubscription() {
  const [msg, setMsg] = useState('');
  const subscribe = async (pkg) => {
    setMsg('');
    try {
      await api.post('/business/subscription', { package: pkg });
      setMsg(`Subscribed to ${pkg} (mock payment).`);
    } catch (e) {
      setMsg(getErrorMessage(e));
    }
  };
  const renew = async () => {
    try {
      await api.post('/business/subscription/renew');
      setMsg('Renewed.');
    } catch (e) {
      setMsg(getErrorMessage(e));
    }
  };
  return (
    <div className="max-w-4xl">
      <h1 className="font-rajdhani text-5xl font-bold uppercase tracking-tight text-white">Subscription Management</h1>
      <p className="mt-1 text-sm text-slate-400">Basic 20 / Pro 40 / Premium 60 listings per cycle (SRS).</p>
      {msg && <p className="mt-4 rounded-lg bg-[#1c253b] px-3 py-2 text-sm text-[#cc97ff]">{msg}</p>}
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <button type="button" className="rounded-xl bg-[#11192c] px-4 py-4 text-sm font-bold uppercase tracking-wider text-white hover:bg-[#1c253b]" onClick={() => subscribe('basic')}>
          Basic
        </button>
        <button type="button" className="rounded-xl bg-[#11192c] px-4 py-4 text-sm font-bold uppercase tracking-wider text-white hover:bg-[#1c253b]" onClick={() => subscribe('pro')}>
          Pro
        </button>
        <button type="button" className="rounded-xl bg-[#11192c] px-4 py-4 text-sm font-bold uppercase tracking-wider text-white hover:bg-[#1c253b]" onClick={() => subscribe('premium')}>
          Premium
        </button>
        <button type="button" className="rounded-xl bg-gradient-to-r from-[#cc97ff] to-[#9c48ea] px-4 py-4 text-sm font-bold uppercase tracking-wider text-[#360061]" onClick={renew}>
          Renew current
        </button>
      </div>
    </div>
  );
}
