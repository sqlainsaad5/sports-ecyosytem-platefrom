import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../../services/api';

/** In-app alerts — verification, training, payments (same API as backend notifyUser) */
export default function CoachNotifications() {
  const [list, setList] = useState([]);
  const [err, setErr] = useState('');
  useEffect(() => {
    api
      .get('/coaches/notifications')
      .then((r) => setList(r.data.data || []))
      .catch((e) => setErr(getErrorMessage(e)));
  }, []);
  return (
    <div>
      <h1 className="font-display text-4xl tracking-[0.08em] text-white">NOTIFICATIONS</h1>
      <p className="font-headline text-xs uppercase tracking-[0.25em] text-[#ff7524]">Verification, training, payments</p>
      {err && <p className="text-sm text-red-400 mt-2">{err}</p>}
      <ul className="mt-6 space-y-3">
        {list.map((n) => (
          <li key={n._id} className="midnight-asymmetric border border-player-inner/40 bg-player-container px-4 py-3 text-sm">
            <p className="font-headline font-semibold text-white">{n.title}</p>
            <p className="mt-1 text-slate-300">{n.body}</p>
            <p className="mt-2 text-[10px] uppercase tracking-widest text-slate-500">{n.category}</p>
          </li>
        ))}
        {!list.length && !err && <p className="text-slate-500">No notifications yet.</p>}
      </ul>
    </div>
  );
}
