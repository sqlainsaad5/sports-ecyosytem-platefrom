import { useEffect, useState } from 'react';
import AdminCard from '../../components/admin/AdminCard';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { adminBtnPrimary, adminField, adminSelect } from '../../components/admin/adminClassNames';
import { api, getErrorMessage } from '../../services/api';
import { publicAssetUrl } from '../../utils/assetUrl';
import { groundImageList, groundLocationLabel, isMapUrl } from '../../utils/groundImages';

const MIN_GROUND_IMAGES = 3;

export default function AdminGrounds() {
  const [list, setList] = useState([]);
  const [name, setName] = useState('');
  const [sportType, setSportType] = useState('cricket');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerAddress, setOwnerAddress] = useState('');
  const [ownerLocation, setOwnerLocation] = useState('');
  const [openTime, setOpenTime] = useState('08:00');
  const [closeTime, setCloseTime] = useState('22:00');
  const [slotDurationMinutes, setSlotDurationMinutes] = useState('60');
  const [lengthFeet, setLengthFeet] = useState('');
  const [areaSqFt, setAreaSqFt] = useState('');
  const [imagePaths, setImagePaths] = useState([]);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [err, setErr] = useState('');

  const load = () =>
    api
      .get('/admin/grounds')
      .then((r) => setList(r.data.data || []))
      .catch((e) => setErr(getErrorMessage(e)));

  useEffect(() => {
    load();
  }, []);

  const uploadFiles = async (files) => {
    if (!files?.length) return;
    setPhotoUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        const { data } = await api.post('/uploads/image', fd);
        if (data.data?.path) uploaded.push(data.data.path);
      }
      if (uploaded.length) setImagePaths((prev) => [...prev, ...uploaded]);
    } catch (er) {
      alert(getErrorMessage(er));
    } finally {
      setPhotoUploading(false);
    }
  };

  const onPickGroundPhotos = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    uploadFiles(files);
  };

  const removeImage = (index) => {
    setImagePaths((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setName('');
    setAddress('');
    setLocation('');
    setOwnerName('');
    setOwnerPhone('');
    setOwnerAddress('');
    setOwnerLocation('');
    setLengthFeet('');
    setAreaSqFt('');
    setImagePaths([]);
  };

  const create = async (e) => {
    e.preventDefault();
    if (imagePaths.length < MIN_GROUND_IMAGES) {
      alert(`Please upload at least ${MIN_GROUND_IMAGES} ground photos (you have ${imagePaths.length}).`);
      return;
    }
    try {
      await api.post('/admin/grounds', {
        name,
        sportType,
        city,
        address,
        location,
        ownerName,
        ownerPhone,
        ownerAddress,
        ownerLocation,
        openTime,
        closeTime,
        slotDurationMinutes: Number(slotDurationMinutes) || 60,
        lengthFeet: Number(lengthFeet),
        areaSqFt: Number(areaSqFt),
        imagePaths,
        isActive: true,
      });
      resetForm();
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
            className={`${adminField} md:col-span-2`}
            placeholder="Ground location (area, landmark, or Google Maps link)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
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
          <input
            type="number"
            min="1"
            step="1"
            className={adminField}
            placeholder="Ground length (feet)"
            value={lengthFeet}
            onChange={(e) => setLengthFeet(e.target.value)}
            required
          />
          <input
            type="number"
            min="1"
            step="1"
            className={adminField}
            placeholder="Area (square feet)"
            value={areaSqFt}
            onChange={(e) => setAreaSqFt(e.target.value)}
            required
          />
          <div className="md:col-span-2 space-y-3">
            <label className="block font-label text-[11px] uppercase tracking-wider text-slate-500">
              Ground photos (minimum {MIN_GROUND_IMAGES}, add more if needed) *
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <label className="cursor-pointer rounded-md border border-dashed border-white/20 px-4 py-2 text-sm text-slate-400 transition-colors hover:border-admin-cyan hover:text-admin-cyan">
                {photoUploading ? 'Uploading…' : 'Choose photos'}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={photoUploading}
                  onChange={onPickGroundPhotos}
                />
              </label>
              <span
                className={`font-label text-xs ${imagePaths.length >= MIN_GROUND_IMAGES ? 'text-admin-cyan' : 'text-admin-orange'}`}
              >
                {imagePaths.length} / {MIN_GROUND_IMAGES}+ uploaded
              </span>
            </div>
            {imagePaths.length ? (
              <ul className="flex flex-wrap gap-2">
                {imagePaths.map((path, i) => (
                  <li key={`${path}-${i}`} className="group relative">
                    <img
                      src={publicAssetUrl(path)}
                      alt=""
                      className="h-20 w-28 rounded-md object-cover ring-1 ring-white/10"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white opacity-90 hover:opacity-100"
                      title="Remove"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div className="md:col-span-2">
            <button type="submit" className={adminBtnPrimary} disabled={photoUploading}>
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
          {list.map((g) => {
            const images = groundImageList(g);
            const loc = groundLocationLabel(g);
            return (
              <li key={g._id} className="flex gap-4 px-6 py-3.5 text-sm transition-colors hover:bg-white/[0.04]">
                {images.length ? (
                  <div className="flex shrink-0 gap-1">
                    {images.slice(0, 3).map((path, i) => (
                      <img
                        key={`${path}-${i}`}
                        src={publicAssetUrl(path)}
                        alt=""
                        className="h-14 w-16 rounded-md object-cover"
                      />
                    ))}
                    {images.length > 3 ? (
                      <span className="flex h-14 w-8 items-center justify-center rounded-md bg-admin-surface-low text-[10px] text-slate-400">
                        +{images.length - 3}
                      </span>
                    ) : null}
                  </div>
                ) : (
                  <div className="h-14 w-20 shrink-0 rounded-md bg-admin-surface-low" />
                )}
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-slate-200">{g.name}</span>
                  <span className="mx-2 text-slate-600">·</span>
                  <span className="capitalize text-slate-400">{g.sportType}</span>
                  <span className="mx-2 text-slate-600">·</span>
                  <span className="font-label text-slate-500">{g.city}</span>
                  {loc ? (
                    <p className="mt-1 text-xs text-slate-500">
                      Location:{' '}
                      {isMapUrl(loc) ? (
                        <a href={loc} target="_blank" rel="noreferrer" className="text-admin-cyan hover:underline">
                          Open map
                        </a>
                      ) : (
                        loc
                      )}
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs text-slate-500">
                    Owner: {g.ownerName} ({g.ownerPhone})
                  </p>
                  {g.lengthFeet || g.areaSqFt ? (
                    <p className="mt-1 text-xs text-slate-500">
                      {g.lengthFeet ? `${g.lengthFeet} ft length` : null}
                      {g.lengthFeet && g.areaSqFt ? ' · ' : null}
                      {g.areaSqFt ? `${g.areaSqFt.toLocaleString()} sq ft` : null}
                      {images.length ? ` · ${images.length} photos` : null}
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
          {!list.length ? (
            <li className="px-6 py-12 text-center font-label text-sm text-slate-500">No grounds yet.</li>
          ) : null}
        </ul>
      </AdminCard>
    </div>
  );
}
