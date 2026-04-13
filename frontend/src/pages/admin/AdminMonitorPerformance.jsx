import { useEffect, useState } from 'react';
import AdminCard from '../../components/admin/AdminCard';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { api, getErrorMessage } from '../../services/api';

function Panel({ title, accent, children }) {
  return (
    <AdminCard accent={accent} className="overflow-hidden">
      <div className="border-b border-white/5 px-6 py-4">
        <h2 className="font-headline text-sm font-bold uppercase tracking-wide text-white">{title}</h2>
      </div>
      <ul className="max-h-64 divide-y divide-white/[0.04] overflow-y-auto admin-scrollbar text-sm">{children}</ul>
    </AdminCard>
  );
}

export default function AdminMonitorPerformance() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    api
      .get('/admin/monitor/performance')
      .then((r) => setData(r.data.data))
      .catch((e) => setErr(getErrorMessage(e)));
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Performance monitor"
        subtitle="Evaluations and attendance records (UC-A11)."
      />
      {err ? (
        <AdminCard accent="orange" className="p-4">
          <p className="text-sm text-admin-orange">{err}</p>
        </AdminCard>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Evaluations" accent="cyan">
          {(data?.performance || []).map((p) => (
            <li key={p._id} className="px-6 py-3.5 transition-colors hover:bg-white/[0.04]">
              <span className="font-orbitron font-bold text-admin-cyan">T:{p.technique}</span>
              <span className="text-slate-500"> · </span>
              <span className="text-slate-300">F:{p.fitness}</span>
              <span className="text-slate-500"> · </span>
              <span className="text-slate-300">A:{p.attitude}</span>
              <p className="mt-1 font-label text-xs text-slate-500">
                Week {p.weekStartDate ? new Date(p.weekStartDate).toLocaleDateString() : '—'}
              </p>
            </li>
          ))}
          {!(data?.performance || []).length ? (
            <li className="px-6 py-10 text-center font-label text-sm text-slate-500">No evaluations.</li>
          ) : null}
        </Panel>
        <Panel title="Attendance" accent="orange">
          {(data?.attendance || []).map((a) => (
            <li
              key={a._id}
              className="flex items-center justify-between px-6 py-3.5 transition-colors hover:bg-white/[0.04]"
            >
              <span className="text-slate-300">{a.present ? 'Present' : 'Absent'}</span>
              <span
                className={`rounded-full px-2.5 py-0.5 font-label text-xs font-bold ${
                  a.present ? 'bg-emerald-500/10 text-emerald-400' : 'bg-admin-orange/15 text-admin-orange'
                }`}
              >
                {a.present ? 'OK' : 'Missed'}
              </span>
            </li>
          ))}
          {!(data?.attendance || []).length ? (
            <li className="px-6 py-10 text-center font-label text-sm text-slate-500">No attendance rows.</li>
          ) : null}
        </Panel>
      </div>
    </div>
  );
}
