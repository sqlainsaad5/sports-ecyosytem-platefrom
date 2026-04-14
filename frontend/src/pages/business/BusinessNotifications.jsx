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
      <h1 className="font-rajdhani text-5xl font-bold uppercase tracking-tight text-white">Notifications</h1>
      <p className="text-sm text-slate-400 mt-1">Verification, orders, subscription reminders, low stock.</p>
      {err && <p className="text-sm text-red-400 mt-2">{err}</p>}
      <ul className="mt-6 space-y-3">
        {list.map((n) => (
          <li key={n._id} className="rounded-xl bg-[#11192c] px-4 py-3 text-sm">
            <p className="font-medium text-white">{n.title}</p>
            <p className="text-slate-400">{n.body}</p>
          </li>
        ))}
        {!list.length && !err && <p className="text-slate-500">No notifications yet.</p>}
      </ul>
    </div>
  );
}
