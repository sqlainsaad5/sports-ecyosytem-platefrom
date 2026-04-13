import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../../services/api';

export default function BusinessProducts() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('10');
  const [stock, setStock] = useState('5');
  const [sportType, setSportType] = useState('general');

  const loadMine = () => api.get('/business/products').then((r) => setItems(r.data.data || []));

  useEffect(() => {
    loadMine().catch((e) => setErr(getErrorMessage(e)));
  }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post('/business/products', {
        name,
        price: Number(price),
        stock: Number(stock),
        sportType,
        description: '',
      });
      setName('');
      loadMine();
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
      <h1 className="text-2xl font-semibold">Products</h1>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <form onSubmit={create} className="max-w-md space-y-2 rounded-xl border bg-white p-4">
        <input className="w-full border rounded px-2 py-1 text-sm" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <div className="flex gap-2">
          <input className="w-24 border rounded px-2 py-1 text-sm" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
          <input className="w-24 border rounded px-2 py-1 text-sm" type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
          <select className="border rounded px-2 py-1 text-sm" value={sportType} onChange={(e) => setSportType(e.target.value)}>
            <option value="general">General</option>
            <option value="cricket">Cricket</option>
            <option value="badminton">Badminton</option>
          </select>
        </div>
        <button type="submit" className="rounded-lg bg-brand-600 text-white px-4 py-2 text-sm">
          Add (requires verification + quota)
        </button>
      </form>
      <ul className="space-y-2">
        {items.map((p) => (
          <li key={p._id} className="flex justify-between items-center border rounded-lg p-3 bg-white text-sm">
            <span>
              {p.name} — {p.price} (stock {p.stock})
            </span>
            <button type="button" className="text-red-600 text-xs" onClick={() => remove(p._id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
