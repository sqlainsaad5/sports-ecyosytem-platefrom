import { useEffect, useState } from 'react';
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
      <h1 className="text-2xl font-semibold">My orders</h1>
      {err && <p className="mt-4 text-sm text-red-600">{err}</p>}
      <ul className="mt-6 space-y-3">
        {orders.map((o) => (
          <li key={o._id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
            <span className="font-medium">{o.status}</span> — total {o.totalAmount}
            <ul className="mt-2 text-slate-600">
              {o.items?.map((i, idx) => (
                <li key={idx}>
                  {i.name} × {i.quantity}
                </li>
              ))}
            </ul>
          </li>
        ))}
        {!orders.length && !err && <p className="text-slate-500">No orders yet.</p>}
      </ul>
    </div>
  );
}
