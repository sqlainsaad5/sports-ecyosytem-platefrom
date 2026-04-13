import { useEffect, useState } from 'react';
import AdminCard from '../../components/admin/AdminCard';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { api, getErrorMessage } from '../../services/api';

export default function AdminReports() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    api
      .get('/admin/reports/summary')
      .then((r) => setData(r.data.data))
      .catch((e) => setErr(getErrorMessage(e)));
  }, []);

  return (
    <div>
      <AdminPageHeader
        title="Reports & analytics"
        subtitle="Payment aggregates by type (UC-A13)."
      />
      {err ? (
        <AdminCard accent="orange" className="mb-6 p-4">
          <p className="text-sm text-admin-orange">{err}</p>
        </AdminCard>
      ) : null}
      <AdminCard accent="gold" className="overflow-hidden">
        <div className="border-b border-white/5 px-6 py-4">
          <h2 className="font-headline text-sm font-bold uppercase text-white">Payments by type</h2>
        </div>
        <ul className="divide-y divide-white/[0.04]">
          {(data?.paymentsByType || []).map((row) => (
            <li
              key={row._id}
              className="flex flex-wrap items-baseline justify-between gap-2 px-6 py-4 transition-colors hover:bg-white/[0.04]"
            >
              <span className="font-semibold text-slate-200">{row._id}</span>
              <span className="font-label text-sm text-slate-400">
                <span className="font-orbitron font-bold tabular-nums text-admin-cyan">{row.count}</span>
                <span className="mx-2 text-slate-600">×</span>
                <span className="text-slate-300">total {row.total}</span>
              </span>
            </li>
          ))}
          {!(data?.paymentsByType || []).length && !err ? (
            <li className="px-6 py-12 text-center font-label text-sm text-slate-500">No payment data.</li>
          ) : null}
        </ul>
      </AdminCard>
    </div>
  );
}
