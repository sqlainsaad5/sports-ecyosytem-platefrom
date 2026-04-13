import { useEffect, useState } from 'react';
import AdminCard from '../../components/admin/AdminCard';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { adminPillLive, adminPillPending } from '../../components/admin/adminClassNames';
import { api, getErrorMessage } from '../../services/api';

function ListBlock({ title, accent, children }) {
  return (
    <AdminCard accent={accent} className="overflow-hidden">
      <div className="border-b border-white/5 px-6 py-4">
        <h2 className="font-headline text-sm font-bold uppercase tracking-wide text-white">{title}</h2>
      </div>
      <ul className="max-h-72 divide-y divide-white/[0.04] overflow-y-auto admin-scrollbar text-sm">{children}</ul>
    </AdminCard>
  );
}

export default function AdminMonitorBookings() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    api
      .get('/admin/monitor/bookings')
      .then((r) => setData(r.data.data))
      .catch((e) => setErr(getErrorMessage(e)));
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Booking monitor"
        subtitle="Ground bookings and training sessions (UC-A10)."
      />
      {err ? (
        <AdminCard accent="orange" className="p-4">
          <p className="text-sm text-admin-orange">{err}</p>
        </AdminCard>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-2">
        <ListBlock title="Ground bookings" accent="cyan">
          {(data?.bookings || []).map((b) => (
            <li key={b._id} className="px-6 py-3.5 transition-colors hover:bg-white/[0.04]">
              <span className={adminPillLive}>{b.status}</span>
              <p className="mt-2 font-label text-xs text-slate-400">
                {b.startTime ? new Date(b.startTime).toLocaleString() : '—'}
              </p>
            </li>
          ))}
          {!(data?.bookings || []).length ? (
            <li className="px-6 py-10 text-center font-label text-sm text-slate-500">No bookings.</li>
          ) : null}
        </ListBlock>
        <ListBlock title="Training sessions" accent="gold">
          {(data?.sessions || []).map((s) => (
            <li key={s._id} className="px-6 py-3.5 transition-colors hover:bg-white/[0.04]">
              <span className={adminPillPending}>{s.status}</span>
              <p className="mt-2 font-label text-xs text-slate-400">
                {s.scheduledAt ? new Date(s.scheduledAt).toLocaleString() : '—'}
              </p>
            </li>
          ))}
          {!(data?.sessions || []).length ? (
            <li className="px-6 py-10 text-center font-label text-sm text-slate-500">No sessions.</li>
          ) : null}
        </ListBlock>
      </div>
    </div>
  );
}
