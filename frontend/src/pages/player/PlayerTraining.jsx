import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../../services/api';

export default function PlayerTraining() {
  const [requests, setRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [err, setErr] = useState('');

  const load = async () => {
    try {
      const [a, b, c] = await Promise.all([
        api.get('/players/training-requests'),
        api.get('/players/training-sessions'),
        api.get('/players/training-plans'),
      ]);
      setRequests(a.data.data || []);
      setSessions(b.data.data || []);
      setPlans(c.data.data || []);
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Training</h1>
        <p className="text-slate-600 mt-1">Requests, confirmed sessions, and weekly plans from your coach.</p>
        {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
      </div>
      <section>
        <h2 className="text-lg font-medium">Requests</h2>
        <ul className="mt-2 space-y-2">
          {requests.map((r) => (
            <li key={r._id} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
              Coach:{' '}
              <span className="font-medium">
                {r.coach?.coachProfile?.fullName || r.coach?.email || String(r.coach?._id || r.coach || '')}
              </span>{' '}
              — <span className="font-medium">{r.status}</span>
            </li>
          ))}
          {!requests.length && <p className="text-slate-500 text-sm">No requests yet.</p>}
        </ul>
      </section>
      <section>
        <h2 className="text-lg font-medium">Sessions</h2>
        <ul className="mt-2 space-y-2">
          {sessions.map((s) => (
            <li key={s._id} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
              {new Date(s.scheduledAt).toLocaleString()} — {s.status} —{' '}
              {s.coach?.coachProfile?.fullName || s.coach?.email || 'Coach'}
            </li>
          ))}
          {!sessions.length && <p className="text-slate-500 text-sm">No sessions scheduled.</p>}
        </ul>
      </section>
      <section>
        <h2 className="text-lg font-medium">Weekly plans</h2>
        <ul className="mt-2 space-y-2">
          {plans.map((p) => (
            <li key={p._id} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
              <span className="font-medium">{p.title || 'Plan'}</span> — week of {new Date(p.weekStartDate).toLocaleDateString()}
              <pre className="mt-1 text-xs text-slate-600 whitespace-pre-wrap">{p.goals || p.exercises}</pre>
            </li>
          ))}
          {!plans.length && <p className="text-slate-500 text-sm">No plans published yet.</p>}
        </ul>
      </section>
    </div>
  );
}
