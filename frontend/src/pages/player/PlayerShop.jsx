import { useEffect, useState } from 'react';
import PlayerCard from '../../components/player/PlayerCard';
import PlayerPageHeader from '../../components/player/PlayerPageHeader';
import { playerBtnOutlineSm, playerBtnPrimary } from '../../components/player/playerClassNames';
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
      <PlayerPageHeader title="Equipment" subtitle="Purchase from verified business listings." />
      {err ? <p className="mb-4 text-sm text-red-400">{err}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        {products.map((p) => (
          <PlayerCard key={p._id}>
            <p className="text-lg font-bold text-white">{p.name}</p>
            <p className="text-sm text-player-on-variant">{p.sportType}</p>
            <p className="mt-2 font-orbitron text-lg font-bold text-player-green">
              {p.price} · Stock {p.stock}
            </p>
            <button type="button" onClick={() => add(p._id)} className={`${playerBtnOutlineSm} mt-4 w-full`}>
              Add to cart ({cart[p._id] || 0})
            </button>
          </PlayerCard>
        ))}
      </div>
      <button type="button" onClick={checkout} className={`${playerBtnPrimary} mt-8`}>
        Checkout
      </button>
    </div>
  );
}
