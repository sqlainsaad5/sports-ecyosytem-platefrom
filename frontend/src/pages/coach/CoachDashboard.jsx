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
    <div>
      <h1 className="text-2xl font-semibold">Coach dashboard</h1>
      {err && <p className="text-sm text-red-600 mt-2">{err}</p>}
      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Pending training requests</p>
          <p className="text-2xl font-semibold">{s?.pending ?? '—'}</p>
          <Link to="/coach/requests" className="text-sm text-brand-700 mt-2 inline-block">
            Review
          </Link>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Total received (mock payments)</p>
          <p className="text-2xl font-semibold">{s?.earned ?? '—'}</p>
        </div>
      </div>
    </div>
  );
}
