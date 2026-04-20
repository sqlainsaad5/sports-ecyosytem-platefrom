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
  const [address, setAddress] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerAddress, setOwnerAddress] = useState('');
  const [ownerLocation, setOwnerLocation] = useState('');
  const [openTime, setOpenTime] = useState('08:00');
  const [closeTime, setCloseTime] = useState('22:00');
  const [slotDurationMinutes, setSlotDurationMinutes] = useState('60');
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
      await api.post('/admin/grounds', {
        name,
        sportType,
        city,
        address,
        ownerName,
        ownerPhone,
        ownerAddress,
        ownerLocation,
        openTime,
        closeTime,
        slotDurationMinutes: Number(slotDurationMinutes) || 60,
        isActive: true,
      });
      setName('');
      setAddress('');
      setOwnerName('');
      setOwnerPhone('');
      setOwnerAddress('');
      setOwnerLocation('');
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
        <form onSubmit={create} className="grid gap-3 md:grid-cols-2">
          <input
            className={adminField}
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <select className={adminSelect} value={sportType} onChange={(e) => setSportType(e.target.value)}>
            <option value="cricket">Cricket</option>
            <option value="badminton">Badminton</option>
          </select>
          <input
            className={adminField}
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
          <input
            className={adminField}
            placeholder="Ground address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
          <input
            className={adminField}
            placeholder="Owner name"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            required
          />
          <input
            className={adminField}
            placeholder="Owner phone"
            value={ownerPhone}
            onChange={(e) => setOwnerPhone(e.target.value)}
            required
          />
          <input
            className={adminField}
            placeholder="Owner address"
            value={ownerAddress}
            onChange={(e) => setOwnerAddress(e.target.value)}
            required
          />
          <input
            className={adminField}
            placeholder="Owner location / map link"
            value={ownerLocation}
            onChange={(e) => setOwnerLocation(e.target.value)}
            required
          />
          <input
            type="time"
            className={adminField}
            value={openTime}
            onChange={(e) => setOpenTime(e.target.value)}
            required
          />
          <input
            type="time"
            className={adminField}
            value={closeTime}
            onChange={(e) => setCloseTime(e.target.value)}
            required
          />
          <input
            type="number"
            min="15"
            className={adminField}
            placeholder="Slot duration (minutes)"
            value={slotDurationMinutes}
            onChange={(e) => setSlotDurationMinutes(e.target.value)}
            required
          />
          <div className="md:col-span-2">
            <button type="submit" className={adminBtnPrimary}>
              Add
            </button>
          </div>
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
              <p className="mt-1 text-xs text-slate-500">
                Owner: {g.ownerName} ({g.ownerPhone})
              </p>
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
