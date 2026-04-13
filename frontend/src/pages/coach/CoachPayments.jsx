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
    <div>
      <h1 className="text-2xl font-semibold">Payments</h1>
      {err && <p className="text-sm text-red-600 mt-2">{err}</p>}
      <p className="mt-4 text-lg font-medium">Total received: {data?.totalReceived ?? 0}</p>
      <ul className="mt-4 space-y-2">
        {(data?.transactions || []).map((t) => (
          <li key={t._id} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
            {t.type} — {t.amount} — {t.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
