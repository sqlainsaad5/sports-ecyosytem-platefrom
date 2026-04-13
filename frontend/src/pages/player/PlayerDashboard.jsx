import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getErrorMessage } from '../../services/api';

export default function PlayerDashboard() {
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [n, r] = await Promise.all([
          api.get('/players/notifications'),
          api.get('/players/recommendations'),
        ]);
        setStats({
          notifications: n.data.data?.length || 0,
          coachMatches: r.data.data?.length || 0,
        });
      } catch (e) {
        setErr(getErrorMessage(e));
      }
    })();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Player dashboard</h1>
      <p className="text-slate-600 mt-1">Overview of your training, bookings, and shop activity.</p>
      {err && <p className="mt-4 text-sm text-red-600">{err}</p>}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Notifications</p>
          <p className="text-2xl font-semibold">{stats?.notifications ?? '—'}</p>
          <Link to="/player/notifications" className="text-sm text-brand-700 mt-2 inline-block">
            View all
          </Link>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Matched coaches</p>
          <p className="text-2xl font-semibold">{stats?.coachMatches ?? '—'}</p>
          <Link to="/player/coaches" className="text-sm text-brand-700 mt-2 inline-block">
            Browse
          </Link>
        </div>
      </div>
    </div>
  );
}
