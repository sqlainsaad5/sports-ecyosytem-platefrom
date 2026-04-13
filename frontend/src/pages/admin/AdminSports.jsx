import { useEffect, useState } from 'react';
import AdminCard from '../../components/admin/AdminCard';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { adminBtnPrimary, adminField } from '../../components/admin/adminClassNames';
import { api, getErrorMessage } from '../../services/api';

export default function AdminSports() {
  const [list, setList] = useState([]);
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const load = () =>
    api
      .get('/admin/sports')
      .then((r) => setList(r.data.data || []))
      .catch((e) => setErr(getErrorMessage(e)));
  useEffect(() => {
    load();
  }, []);

  const add = async (e) => {
    e.preventDefault();
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    try {
      await api.post('/admin/sports', { name, slug });
      setName('');
      load();
    } catch (er) {
      alert(getErrorMessage(er));
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete category?')) return;
    try {
      await api.delete(`/admin/sports/${id}`);
      load();
    } catch (er) {
      alert(getErrorMessage(er));
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Sport categories"
        subtitle="Taxonomy used across bookings and profiles (UC-A8)."
      />
      {err ? (
        <AdminCard accent="orange" className="mb-6 p-4">
          <p className="text-sm text-admin-orange">{err}</p>
        </AdminCard>
      ) : null}

      <AdminCard accent="cyan" className="mb-6 p-6">
        <form onSubmit={add} className="flex flex-wrap items-center gap-3">
          <input
            className={`${adminField} min-w-[180px] flex-1`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            required
          />
          <button type="submit" className={adminBtnPrimary}>
            Add
          </button>
        </form>
      </AdminCard>

      <AdminCard accent="none" className="overflow-hidden border border-white/[0.06]">
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <span className="font-headline text-sm font-bold uppercase text-white">Categories</span>
          <span className="font-label text-xs text-slate-500">{list.length} total</span>
        </div>
        <ul className="divide-y divide-white/[0.04]">
          {list.map((s) => (
            <li
              key={s._id}
              className="flex items-center justify-between px-6 py-3.5 text-sm transition-colors hover:bg-white/[0.04]"
            >
              <span className="font-semibold text-slate-200">{s.name}</span>
              <button
                type="button"
                className="font-label text-xs font-semibold text-admin-orange hover:underline"
                onClick={() => remove(s._id)}
              >
                Delete
              </button>
            </li>
          ))}
          {!list.length && !err ? (
            <li className="px-6 py-12 text-center font-label text-sm text-slate-500">No categories.</li>
          ) : null}
        </ul>
      </AdminCard>
    </div>
  );
}
