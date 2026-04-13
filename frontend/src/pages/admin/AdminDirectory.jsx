import { useEffect, useState } from 'react';
import AdminCard from '../../components/admin/AdminCard';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { api, getErrorMessage } from '../../services/api';

function DirectoryTable({ title, accent, rows, renderPrimary, renderSecondary }) {
  return (
    <AdminCard accent={accent} className="overflow-hidden">
      <div className="border-b border-white/5 px-6 py-4">
        <h2 className="font-headline text-sm font-bold uppercase tracking-wide text-white">{title}</h2>
        <p className="mt-0.5 font-label text-xs text-slate-500">{rows.length} records</p>
      </div>
      <ul className="max-h-72 divide-y divide-white/[0.04] overflow-y-auto admin-scrollbar text-sm">
        {rows.map((u) => (
          <li key={u._id} className="px-6 py-3.5 transition-colors hover:bg-white/[0.04]">
            <p className="font-semibold text-slate-200">{renderPrimary(u)}</p>
            <p className="font-label text-xs text-slate-500">{u.email}</p>
            <p className="mt-1 font-label text-xs text-slate-400">{renderSecondary(u)}</p>
          </li>
        ))}
        {!rows.length ? (
          <li className="px-6 py-10 text-center font-label text-sm text-slate-500">No entries.</li>
        ) : null}
      </ul>
    </AdminCard>
  );
}

export default function AdminDirectory() {
  const [coaches, setCoaches] = useState([]);
  const [biz, setBiz] = useState([]);
  const [err, setErr] = useState('');
  useEffect(() => {
    Promise.all([api.get('/admin/coaches'), api.get('/admin/business-owners')])
      .then(([c, b]) => {
        setCoaches(c.data.data || []);
        setBiz(b.data.data || []);
      })
      .catch((e) => setErr(getErrorMessage(e)));
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Coaches & business"
        subtitle="Directory of coaches and business owners (UC-A6 / UC-A7)."
      />
      {err ? (
        <AdminCard accent="orange" className="p-4">
          <p className="text-sm text-admin-orange">{err}</p>
        </AdminCard>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-2">
        <DirectoryTable
          title="Coaches"
          accent="cyan"
          rows={coaches}
          renderPrimary={(u) => u.coachProfile?.fullName || u.email}
          renderSecondary={(u) => `Verification: ${u.verificationStatus}`}
        />
        <DirectoryTable
          title="Business owners"
          accent="gold"
          rows={biz}
          renderPrimary={(u) => u.businessProfile?.businessName || u.email}
          renderSecondary={(u) => `Verification: ${u.verificationStatus}`}
        />
      </div>
    </div>
  );
}
