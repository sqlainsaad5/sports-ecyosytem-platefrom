import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../../services/api';

export default function PlayerNotifications() {
  const [list, setList] = useState([]);
  const [err, setErr] = useState('');

  const load = () =>
    api
      .get('/players/notifications')
      .then((r) => setList(r.data.data || []))
      .catch((e) => setErr(getErrorMessage(e)));

  useEffect(() => {
    load();
  }, []);

  const mark = async (id) => {
    await api.patch(`/players/notifications/${id}/read`);
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold">Notifications</h1>
      {err && <p className="mt-4 text-sm text-red-600">{err}</p>}
      <ul className="mt-6 space-y-2">
        {list.map((n) => (
          <li
            key={n._id}
            className={`rounded-xl border px-4 py-3 text-sm ${n.read ? 'border-slate-100 bg-white' : 'border-brand-200 bg-emerald-50'}`}
          >
            <p className="font-medium">{n.title}</p>
            <p className="text-slate-600">{n.body}</p>
            {!n.read && (
              <button type="button" className="mt-2 text-xs text-brand-700" onClick={() => mark(n._id)}>
                Mark read
              </button>
            )}
          </li>
        ))}
        {!list.length && !err && <p className="text-slate-500">No notifications.</p>}
      </ul>
    </div>
  );
}
