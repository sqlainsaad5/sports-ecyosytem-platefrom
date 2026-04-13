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
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold">Listing subscription</h1>
      <p className="text-sm text-slate-600 mt-1">Basic 20 / Pro 40 / Premium 60 listings per cycle (SRS).</p>
      {msg && <p className="mt-4 text-sm text-brand-800 bg-brand-50 rounded-lg px-3 py-2">{msg}</p>}
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" className="rounded-lg bg-slate-800 text-white px-4 py-2 text-sm" onClick={() => subscribe('basic')}>
          Basic
        </button>
        <button type="button" className="rounded-lg bg-slate-800 text-white px-4 py-2 text-sm" onClick={() => subscribe('pro')}>
          Pro
        </button>
        <button type="button" className="rounded-lg bg-slate-800 text-white px-4 py-2 text-sm" onClick={() => subscribe('premium')}>
          Premium
        </button>
        <button type="button" className="rounded-lg border border-slate-300 px-4 py-2 text-sm" onClick={renew}>
          Renew current
        </button>
      </div>
    </div>
  );
}
