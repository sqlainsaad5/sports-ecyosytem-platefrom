import { useEffect, useState } from 'react';
import AdminCard from '../../components/admin/AdminCard';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { adminBtnCompactGhost, adminBtnCompactPrimary } from '../../components/admin/adminClassNames';
import { api, getErrorMessage } from '../../services/api';

export default function AdminVerifyBusiness() {
  const [list, setList] = useState([]);
  const [err, setErr] = useState('');
  const load = () =>
    api
      .get('/admin/verification/business')
      .then((r) => setList(r.data.data || []))
      .catch((e) => setErr(getErrorMessage(e)));
  useEffect(() => {
    load();
  }, []);

  const act = async (userId, action) => {
    const reason = prompt('Reason / notes (optional)') || '';
    try {
      await api.patch(`/admin/verification/business/${userId}`, { action, reason });
      load();
    } catch (e) {
      alert(getErrorMessage(e));
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Business verification"
        subtitle="Validate business owner registrations before go-live."
      />
      {err ? (
        <AdminCard accent="orange" className="mb-6 p-4">
          <p className="text-sm text-admin-orange">{err}</p>
        </AdminCard>
      ) : null}
      <ul className="space-y-4">
        {list.map((u) => (
          <AdminCard key={u._id} accent="orange" className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-base font-bold text-white">{u.businessProfile?.businessName || '—'}</p>
                <p className="mt-1 font-label text-sm text-slate-400">{u.email}</p>
                <p className="mt-2 font-label text-xs text-slate-500">Status: {u.verificationStatus}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={adminBtnCompactPrimary} onClick={() => act(u._id, 'approve')}>
                  Approve
                </button>
                <button type="button" className={adminBtnCompactGhost} onClick={() => act(u._id, 'reject')}>
                  Reject
                </button>
                <button type="button" className={adminBtnCompactGhost} onClick={() => act(u._id, 'more_info')}>
                  Request docs
                </button>
              </div>
            </div>
          </AdminCard>
        ))}
        {!list.length && !err ? (
          <AdminCard accent="none" className="border border-dashed border-white/10 p-10 text-center font-label text-sm text-slate-500">
            Queue empty.
          </AdminCard>
        ) : null}
      </ul>
    </div>
  );
}
