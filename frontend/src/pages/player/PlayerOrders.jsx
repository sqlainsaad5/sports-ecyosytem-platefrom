import { useEffect, useState } from 'react';
import PlayerCard from '../../components/player/PlayerCard';
import PlayerPageHeader from '../../components/player/PlayerPageHeader';
import { api, getErrorMessage } from '../../services/api';

export default function PlayerOrders() {
  const [orders, setOrders] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    api
      .get('/players/orders')
      .then((r) => setOrders(r.data.data || []))
      .catch((e) => setErr(getErrorMessage(e)));
  }, []);

  return (
    <div>
      <PlayerPageHeader title="Orders" subtitle="Your equipment order history." />
      {err ? <p className="mb-4 text-sm text-red-400">{err}</p> : null}
      <ul className="space-y-4">
        {orders.map((o) => (
          <PlayerCard key={o._id} className="text-sm">
            <span className="font-bold text-player-green">{o.status}</span>
            <span className="text-player-on-variant"> — total {o.totalAmount}</span>
            {o.trackingNumber ? (
              <p className="mt-2 font-orbitron text-xs text-player-green">Tracking: {o.trackingNumber}</p>
            ) : null}
            {o.shippingAddress?.line1 ? (
              <p className="mt-1 text-xs text-player-on-variant">
                Ship: {o.shippingAddress.fullName} · {o.shippingAddress.line1}, {o.shippingAddress.city}
              </p>
            ) : null}
            <ul className="mt-3 space-y-1 text-player-on-variant">
              {o.items?.map((i, idx) => (
                <li key={idx}>
                  {i.name} × {i.quantity}
                </li>
              ))}
            </ul>
          </PlayerCard>
        ))}
        {!orders.length && !err ? <p className="text-sm text-player-on-variant">No orders yet.</p> : null}
      </ul>
    </div>
  );
}
