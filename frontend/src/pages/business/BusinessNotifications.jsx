import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../../services/api';

export default function BusinessNotifications() {
  const [list, setList] = useState([]);
  const [err, setErr] = useState('');
  useEffect(() => {
    api
      .get('/business/notifications')
      .then((r) => setList(r.data.data || []))
      .catch((e) => setErr(getErrorMessage(e)));
  }, []);
  return (
    <div>
      <h1 className="text-2xl font-semibold">Notifications (UC-B15)</h1>
      <p className="text-sm text-slate-600 mt-1">Verification, orders, subscription reminders, low stock.</p>
      {err && <p className="text-sm text-red-600 mt-2">{err}</p>}
      <ul className="mt-4 space-y-2">
        {list.map((n) => (
          <li key={n._id} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
            <p className="font-medium">{n.title}</p>
            <p className="text-slate-600">{n.body}</p>
          </li>
        ))}
        {!list.length && !err && <p className="text-slate-500">No notifications yet.</p>}
      </ul>
    </div>
  );
}
