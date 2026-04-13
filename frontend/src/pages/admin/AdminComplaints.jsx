import { useEffect, useState } from 'react';
import AdminCard from '../../components/admin/AdminCard';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { api, getErrorMessage } from '../../services/api';

export default function AdminComplaints() {
  const [list, setList] = useState([]);
  const [err, setErr] = useState('');
  const load = () =>
    api
      .get('/admin/complaints')
      .then((r) => setList(r.data.data || []))
      .catch((e) => setErr(getErrorMessage(e)));
  useEffect(() => {
    load();
  }, []);

  const patch = async (id) => {
    const status = prompt('Status: open | investigating | resolved | dismissed');
    const resolution = prompt('Resolution notes') || '';
    if (!status) return;
    try {
      await api.patch(`/admin/complaints/${id}`, { status, resolution });
      load();
    } catch (e) {
      alert(getErrorMessage(e));
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Complaint management"
        subtitle="Review disputes; update status and resolution notes."
      />
      {err ? (
        <AdminCard accent="orange" className="mb-6 p-4">
          <p className="text-sm text-admin-orange">{err}</p>
        </AdminCard>
      ) : null}
      <ul className="space-y-4">
        {list.map((c) => (
          <AdminCard key={c._id} accent="cyan" className="p-6">
            <h3 className="font-headline text-lg font-bold uppercase tracking-tight text-white">{c.subject}</h3>
            <p className="mt-2 text-sm leading-relaxed text-admin-on-surface-variant">{c.description}</p>
            <div className="mt-3">
              <span className="rounded-full bg-white/10 px-3 py-0.5 font-label text-xs text-slate-400">
                Status: {c.status}
              </span>
            </div>
            <button
              type="button"
              className="mt-4 font-label text-xs font-semibold text-admin-cyan hover:underline"
              onClick={() => patch(c._id)}
            >
              Update status
            </button>
          </AdminCard>
        ))}
        {!list.length && !err ? (
          <AdminCard accent="none" className="border border-dashed border-white/10 p-10 text-center font-label text-sm text-slate-500">
            No complaints.
          </AdminCard>
        ) : null}
      </ul>
    </div>
  );
}
