import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../../services/api';

export default function PlayerShop() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [err, setErr] = useState('');

  useEffect(() => {
    api
      .get('/players/products')
      .then((r) => setProducts(r.data.data || []))
      .catch((e) => setErr(getErrorMessage(e)));
  }, []);

  const add = (id) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));

  const checkout = async () => {
    const items = Object.entries(cart)
      .filter(([, q]) => q > 0)
      .map(([productId, quantity]) => ({ productId, quantity }));
    if (!items.length) return;
    setErr('');
    try {
      await api.post('/players/orders', { items });
      setCart({});
      alert('Order placed (mock payment).');
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold">Equipment shop</h1>
      <p className="text-slate-600 mt-1">Purchase from verified business listings.</p>
      {err && <p className="mt-4 text-sm text-red-600">{err}</p>}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {products.map((p) => (
          <div key={p._id} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="font-medium">{p.name}</p>
            <p className="text-sm text-slate-500">{p.sportType}</p>
            <p className="text-lg font-semibold mt-2">{p.price} · Stock {p.stock}</p>
            <button
              type="button"
              onClick={() => add(p._id)}
              className="mt-3 w-full rounded-lg border border-slate-200 py-2 text-sm hover:bg-slate-50"
            >
              Add to cart ({cart[p._id] || 0})
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={checkout}
        className="mt-6 rounded-lg bg-brand-600 text-white px-6 py-2 text-sm font-medium"
      >
        Checkout
      </button>
    </div>
  );
}
