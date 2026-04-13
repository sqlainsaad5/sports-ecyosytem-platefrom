import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../../services/api';

export default function CoachSessions() {
  const [list, setList] = useState([]);
  const [err, setErr] = useState('');
  useEffect(() => {
    api
      .get('/coaches/training-sessions')
      .then((r) => setList(r.data.data || []))
      .catch((e) => setErr(getErrorMessage(e)));
  }, []);

  const mark = async (id, present) => {
    try {
      await api.post(`/coaches/sessions/${id}/attendance`, { present });
      alert('Attendance saved');
    } catch (e) {
      alert(getErrorMessage(e));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold">Training sessions</h1>
      {err && <p className="text-sm text-red-600 mt-2">{err}</p>}
      <ul className="mt-4 space-y-2">
        {list.map((s) => (
          <li key={s._id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm flex flex-wrap gap-2 justify-between">
            <span>
              {new Date(s.scheduledAt).toLocaleString()} —{' '}
              {s.player?.playerProfile?.fullName || s.player?.email || `player ${s.player?._id || s.player}`}
            </span>
            <div className="flex gap-2">
              <button type="button" className="rounded bg-emerald-600 text-white px-2 py-1 text-xs" onClick={() => mark(s._id, true)}>
                Present
              </button>
              <button type="button" className="rounded bg-slate-200 px-2 py-1 text-xs" onClick={() => mark(s._id, false)}>
                Absent
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
