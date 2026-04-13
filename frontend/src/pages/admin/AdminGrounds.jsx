import { useEffect, useState } from 'react';
import AdminCard from '../../components/admin/AdminCard';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { adminBtnPrimary, adminField, adminSelect } from '../../components/admin/adminClassNames';
import { api, getErrorMessage } from '../../services/api';

export default function AdminGrounds() {
  const [list, setList] = useState([]);
  const [name, setName] = useState('');
  const [sportType, setSportType] = useState('cricket');
  const [city, setCity] = useState('');
  const [err, setErr] = useState('');
  const load = () =>
    api
      .get('/admin/grounds')
      .then((r) => setList(r.data.data || []))
      .catch((e) => setErr(getErrorMessage(e)));
  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/grounds', { name, sportType, city, address: city, isActive: true });
      setName('');
      load();
    } catch (er) {
      alert(getErrorMessage(er));
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Ground management"
        subtitle="Register indoor grounds and assign sport types for player bookings."
      />
      {err ? (
        <AdminCard accent="orange" className="p-4">
          <p className="text-sm text-admin-orange">{err}</p>
        </AdminCard>
      ) : null}

      <AdminCard accent="cyan" className="p-6">
        <h2 className="mb-4 font-headline text-xs font-bold uppercase tracking-widest text-slate-400">
          Add ground
        </h2>
        <form onSubmit={create} className="flex flex-wrap items-end gap-3">
          <input
            className={`${adminField} min-w-[140px] flex-1`}
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <select className={`${adminSelect} min-w-[140px]`} value={sportType} onChange={(e) => setSportType(e.target.value)}>
            <option value="cricket">Cricket</option>
            <option value="badminton">Badminton</option>
          </select>
          <input
            className={`${adminField} min-w-[120px]`}
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button type="submit" className={adminBtnPrimary}>
            Add
          </button>
        </form>
      </AdminCard>

      <AdminCard accent="none" className="overflow-hidden border border-white/[0.06]">
        <div className="border-b border-white/5 px-6 py-4">
          <h2 className="font-headline text-sm font-bold uppercase text-white">All grounds</h2>
        </div>
        <ul className="max-h-[min(60vh,440px)] divide-y divide-white/[0.04] overflow-y-auto admin-scrollbar">
          {list.map((g) => (
            <li key={g._id} className="px-6 py-3.5 text-sm transition-colors hover:bg-white/[0.04]">
              <span className="font-semibold text-slate-200">{g.name}</span>
              <span className="mx-2 text-slate-600">·</span>
              <span className="capitalize text-slate-400">{g.sportType}</span>
              <span className="mx-2 text-slate-600">·</span>
              <span className="font-label text-slate-500">{g.city}</span>
            </li>
          ))}
          {!list.length ? (
            <li className="px-6 py-12 text-center font-label text-sm text-slate-500">No grounds yet.</li>
          ) : null}
        </ul>
      </AdminCard>
    </div>
  );
}
