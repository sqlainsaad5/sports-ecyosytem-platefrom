import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../../services/api';

export default function CoachRequests() {
  const [list, setList] = useState([]);
  const [err, setErr] = useState('');

  const load = () =>
    api
      .get('/coaches/training-requests')
      .then((r) => setList(r.data.data || []))
      .catch((e) => setErr(getErrorMessage(e)));

  useEffect(() => {
    load();
  }, []);

  const act = async (id, status) => {
    let scheduledAt;
    if (status === 'accepted') {
      const t = prompt('Scheduled at (ISO datetime), or leave empty for default');
      if (t) scheduledAt = t;
    }
    const body = scheduledAt ? { status, scheduledAt } : { status };
    try {
      await api.patch(`/coaches/training-requests/${id}`, body);
      load();
    } catch (e) {
      alert(getErrorMessage(e));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold">Training requests</h1>
      {err && <p className="text-sm text-red-600 mt-2">{err}</p>}
      <ul className="mt-4 space-y-2">
        {list.map((r) => (
          <li key={r._id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm flex flex-wrap gap-2 items-center justify-between">
            <div>
              Player:{' '}
              <span className="font-medium">
                {r.player?.playerProfile?.fullName || r.player?.email || String(r.player?._id || r.player || '')}
              </span>{' '}
              — {r.status}
              {r.message && <p className="text-slate-600 mt-1">{r.message}</p>}
            </div>
            {r.status === 'pending' && (
              <div className="flex gap-2">
                <button type="button" className="rounded-lg bg-brand-600 text-white px-3 py-1" onClick={() => act(r._id, 'accepted')}>
                  Accept
                </button>
                <button type="button" className="rounded-lg border px-3 py-1" onClick={() => act(r._id, 'rejected')}>
                  Reject
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
