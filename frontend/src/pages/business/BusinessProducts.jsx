import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getErrorMessage } from '../../services/api';

/** SRS UC-B6–B11 — products, pricing windows, categories, low-stock threshold */
export default function BusinessProducts() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState('');
  const [gateLoading, setGateLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState('');
  const [listingSlotsRemaining, setListingSlotsRemaining] = useState(0);
  const [documentsCount, setDocumentsCount] = useState(0);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('10');
  const [stock, setStock] = useState('5');
  const [sportType, setSportType] = useState('general');
  const [category, setCategory] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [saleStart, setSaleStart] = useState('');
  const [saleEnd, setSaleEnd] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const isVerified = verificationStatus === 'verified';
  const hasDocuments = documentsCount > 0;
  const hasListingSlots = Number(listingSlotsRemaining || 0) > 0;
  const canAddProducts = isVerified && hasDocuments && hasListingSlots;

  const loadMine = () => api.get('/business/products').then((r) => setItems(r.data.data || []));
  const loadGate = async () => {
    const [meRes, profileRes, docsRes] = await Promise.all([
      api.get('/auth/me'),
      api.get('/business/me/profile'),
      api.get('/business/documents'),
    ]);
    setVerificationStatus(meRes.data?.data?.verificationStatus || '');
    setListingSlotsRemaining(profileRes.data?.data?.listingSlotsRemaining || 0);
    setDocumentsCount((docsRes.data?.data || []).length);
  };

  useEffect(() => {
    Promise.all([loadMine(), loadGate()])
      .catch((e) => setErr(getErrorMessage(e)))
      .finally(() => setGateLoading(false));
  }, []);

  const create = async (e) => {
    e.preventDefault();
    if (!canAddProducts) {
      setErr('Complete verification documents and subscription requirements before adding products.');
      return;
    }
    try {
      const body = {
        name,
        price: Number(price),
        stock: Number(stock),
        sportType,
        description: '',
        category: category || undefined,
        lowStockThreshold: lowStockThreshold ? Number(lowStockThreshold) : 5,
      };
      if (salePrice) body.salePrice = Number(salePrice);
      if (discountPercent) body.discountPercent = Number(discountPercent);
      if (saleStart) body.saleStart = new Date(saleStart).toISOString();
      if (saleEnd) body.saleEnd = new Date(saleEnd).toISOString();
      await api.post('/business/products', body);
      setName('');
      await Promise.all([loadMine(), loadGate()]);
    } catch (er) {
      alert(getErrorMessage(er));
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete product?')) return;
    try {
      await api.delete(`/business/products/${id}`);
      loadMine();
    } catch (er) {
      alert(getErrorMessage(er));
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="font-rajdhani text-5xl font-bold uppercase tracking-tight text-white">My Products</h1>
      {err && <p className="text-sm text-red-400">{err}</p>}
      {gateLoading ? (
        <p className="text-sm text-slate-400">Checking verification status...</p>
      ) : !canAddProducts ? (
        <div className="max-w-2xl rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm">
          <p className="font-semibold text-amber-200">Verification required before adding products.</p>
          <p className="mt-2 text-amber-100/90">
            Upload business documents and purchase or renew a subscription package. Product creation unlocks only after verification and available listing slots.
          </p>
          <ul className="mt-3 space-y-1 text-xs text-amber-100/80">
            <li>Verification status: {verificationStatus || 'unknown'}</li>
            <li>Documents uploaded: {documentsCount}</li>
            <li>Listing slots remaining: {listingSlotsRemaining}</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to="/business/documents"
              className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/20"
            >
              Upload documents
            </Link>
            <Link
              to="/business/subscription"
              className="rounded-lg bg-gradient-to-r from-[#cc97ff] to-[#9c48ea] px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#360061]"
            >
              Manage subscription
            </Link>
          </div>
        </div>
      ) : null}
      <form onSubmit={create} className="max-w-2xl space-y-3 rounded-xl bg-[#11192c] p-5">
        <input
          className="w-full rounded-lg border-none bg-black/40 px-3 py-2 text-sm text-white focus:ring-1 focus:ring-[#cc97ff]"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <div className="flex flex-wrap gap-2">
          <input
            className="w-24 rounded-lg border-none bg-black/40 px-2 py-2 text-sm text-white focus:ring-1 focus:ring-[#cc97ff]"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <input
            className="w-24 rounded-lg border-none bg-black/40 px-2 py-2 text-sm text-white focus:ring-1 focus:ring-[#cc97ff]"
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
          <input
            className="w-32 rounded-lg border-none bg-black/40 px-2 py-2 text-sm text-white focus:ring-1 focus:ring-[#cc97ff]"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <select
            className="rounded-lg border-none bg-black/40 px-2 py-2 text-sm text-white focus:ring-1 focus:ring-[#cc97ff]"
            value={sportType}
            onChange={(e) => setSportType(e.target.value)}
          >
            <option value="general">General</option>
            <option value="cricket">Cricket</option>
            <option value="badminton">Badminton</option>
          </select>
        </div>
        <p className="text-xs text-slate-500">UC-B9 sale window (optional)</p>
        <div className="flex flex-wrap gap-2">
          <input
            className="w-28 rounded-lg border-none bg-black/40 px-2 py-2 text-sm text-white"
            placeholder="Sale price"
            type="number"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
          />
          <input
            className="w-28 rounded-lg border-none bg-black/40 px-2 py-2 text-sm text-white"
            placeholder="% off"
            type="number"
            value={discountPercent}
            onChange={(e) => setDiscountPercent(e.target.value)}
          />
          <input className="rounded-lg bg-black/40 px-2 py-2 text-sm text-white" type="date" value={saleStart} onChange={(e) => setSaleStart(e.target.value)} />
          <input className="rounded-lg bg-black/40 px-2 py-2 text-sm text-white" type="date" value={saleEnd} onChange={(e) => setSaleEnd(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-slate-500">Low stock threshold (UC-B10)</label>
          <input
            className="ml-2 w-20 rounded-lg border-none bg-black/40 px-2 py-1 text-sm text-white"
            type="number"
            min="0"
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={!canAddProducts}
          className="rounded-lg bg-gradient-to-r from-[#cc97ff] to-[#9c48ea] px-4 py-2 text-sm font-bold uppercase tracking-wider text-[#360061]"
        >
          {canAddProducts ? 'Add product' : 'Complete verification first'}
        </button>
      </form>
      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((p) => (
          <li key={p._id} className="rounded-xl bg-[#11192c] p-4 text-sm">
            <p className="font-rajdhani text-2xl font-bold text-white">{p.name}</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-slate-500">
              {p.sportType}
              {p.category ? ` · ${p.category}` : ''}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <span className="font-orbitron text-[#9bffce]">${p.price}</span>
              <span className="text-xs text-slate-400">
                Stock {p.stock} · alert ≤{p.lowStockThreshold ?? 5}
              </span>
            </div>
            <button
              type="button"
              className="mt-4 rounded-lg bg-[#a70138]/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#ff6e84]"
              onClick={() => remove(p._id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
