import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../../services/api';

export default function PlayerCoaches() {
  const [list, setList] = useState([]);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = async () => {
    try {
      const { data } = await api.get('/players/recommendations');
      setList(data.data || []);
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const requestTraining = async (id) => {
    setErr('');
    try {
      await api.post('/players/training-requests', { coachId: id, message: msg || 'I would like to train with you.' });
      setMsg('');
      alert('Request sent.');
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold">Coach recommendations</h1>
      <p className="text-slate-600 mt-1">Based on your sport, skill, and city (verified coaches only).</p>
      {err && <p className="mt-4 text-sm text-red-600">{err}</p>}
      <div className="mt-4 max-w-xl">
        <label className="text-sm font-medium text-slate-700">Optional message (all requests)</label>
        <input
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="I would like to train with you."
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
        />
      </div>
      <ul className="mt-6 space-y-3">
        {list.map((row) => (
          <li key={row.userId} className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="font-medium">{row.profile?.fullName}</p>
              <p className="text-sm text-slate-500">
                {row.profile?.specialties?.join(', ')} · {row.profile?.city || '—'}
              </p>
              <p className="text-xs text-slate-400 mt-1">Match score: {row.matchScore?.toFixed?.(1) ?? row.matchScore}</p>
            </div>
            <div className="flex flex-col gap-2 sm:w-48">
              <button
                type="button"
                onClick={() => requestTraining(row.userId)}
                className="rounded-lg bg-brand-600 text-white text-sm py-2 hover:bg-brand-700"
              >
                Request training
              </button>
            </div>
          </li>
        ))}
        {!list.length && !err && <p className="text-slate-500">No coaches yet — complete your profile or wait for verifications.</p>}
      </ul>
    </div>
  );
}
