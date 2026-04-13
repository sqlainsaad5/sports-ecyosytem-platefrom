import { useEffect, useState } from 'react';
import AdminCard from '../../components/admin/AdminCard';
import AdminIcon from '../../components/admin/AdminIcon';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { adminBtnSecondary, adminTableHead, adminTableRow } from '../../components/admin/adminClassNames';
import { api, getErrorMessage } from '../../services/api';

export default function AdminUsers() {
  const [list, setList] = useState([]);
  const [err, setErr] = useState('');
  const load = () =>
    api
      .get('/admin/users')
      .then((r) => setList(r.data.data || []))
      .catch((e) => setErr(getErrorMessage(e)));
  useEffect(() => {
    load();
  }, []);

  const suspend = async (id, flag) => {
    try {
      await api.patch(`/admin/users/${id}`, { isSuspended: flag });
      load();
    } catch (e) {
      alert(getErrorMessage(e));
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="User management"
        subtitle="Monitor accounts, roles, verification status, and suspend access when needed."
        actions={
          <button type="button" onClick={() => load()} className={adminBtnSecondary}>
            <AdminIcon name="refresh" className="text-lg" />
            Refresh
          </button>
        }
      />

      {err ? (
        <AdminCard accent="orange" className="mb-6 p-4">
          <p className="text-sm text-admin-orange">{err}</p>
        </AdminCard>
      ) : null}

      <AdminCard accent="cyan" className="overflow-hidden">
        <div className="flex flex-col gap-2 border-b border-white/5 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <AdminIcon name="manage_accounts" className="text-[22px] text-admin-cyan" />
            <span className="font-headline text-xs font-bold uppercase tracking-widest">All users</span>
            <span className="font-label text-xs text-slate-500">({list.length})</span>
          </div>
        </div>
        <div className="max-h-[min(70vh,560px)] overflow-auto admin-scrollbar">
          <table className="w-full text-left text-sm">
            <thead className={adminTableHead}>
              <tr>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Verification</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((u) => (
                <tr key={u._id} className={adminTableRow}>
                  <td className="px-6 py-3.5 text-admin-on-surface">{u.email}</td>
                  <td className="px-6 py-3.5 capitalize text-slate-400">{u.role?.replace('_', ' ')}</td>
                  <td className="px-6 py-3.5">
                    <span className="rounded-full bg-white/5 px-2.5 py-0.5 font-label text-xs text-slate-400">
                      {u.verificationStatus}
                    </span>
                    {u.isSuspended ? (
                      <span className="ml-2 rounded-full bg-admin-orange/15 px-2.5 py-0.5 font-label text-xs text-admin-orange">
                        Suspended
                      </span>
                    ) : null}
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    {u.role !== 'admin' ? (
                      <button
                        type="button"
                        className="font-label text-xs font-semibold text-admin-cyan hover:underline"
                        onClick={() => suspend(u._id, !u.isSuspended)}
                      >
                        {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                      </button>
                    ) : (
                      <span className="font-label text-xs text-slate-600">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!list.length && !err ? (
            <p className="px-6 py-12 text-center font-label text-sm text-slate-500">No users loaded.</p>
          ) : null}
        </div>
      </AdminCard>
    </div>
  );
}
