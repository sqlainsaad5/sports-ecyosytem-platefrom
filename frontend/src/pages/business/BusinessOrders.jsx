import { useEffect, useMemo, useState } from 'react';
import { api, getErrorMessage } from '../../services/api';

/** SRS UC-B12 — filters, tracking, status */
export default function BusinessOrders() {
  const [list, setList] = useState([]);
  const [err, setErr] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    api
      .get('/business/orders')
      .then((r) => setList(r.data.data || []))
      .catch((e) => setErr(getErrorMessage(e)));
  }, []);

  const filtered = useMemo(() => {
    if (!filter) return list;
    return list.filter((o) => o.status === filter);
  }, [list, filter]);

  const update = async (id, status) => {
    try {
      await api.patch(`/business/orders/${id}`, { status });
      const { data } = await api.get('/business/orders');
      setList(data.data || []);
    } catch (e) {
      alert(getErrorMessage(e));
    }
  };

  const setTracking = async (id) => {
    const trackingNumber = prompt('Tracking number');
    if (trackingNumber == null || trackingNumber === '') return;
    try {
      await api.patch(`/business/orders/${id}`, { trackingNumber, status: 'shipped' });
      const { data } = await api.get('/business/orders');
      setList(data.data || []);
    } catch (e) {
      alert(getErrorMessage(e));
    }
  };

  return (
    <div>
      <h1 className="font-rajdhani text-5xl font-bold uppercase tracking-tight text-white">My Orders</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className={`rounded-lg px-3 py-1 text-xs uppercase ${!filter ? 'bg-[#cc97ff] text-black' : 'bg-black/40 text-slate-400'}`}
          onClick={() => setFilter('')}
        >
          All
        </button>
        {['pending', 'paid', 'processing', 'shipped', 'completed'].map((s) => (
          <button
            key={s}
            type="button"
            className={`rounded-lg px-3 py-1 text-xs uppercase ${filter === s ? 'bg-[#cc97ff] text-black' : 'bg-black/40 text-slate-400'}`}
            onClick={() => setFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>
      {err && <p className="text-sm text-red-400 mt-2">{err}</p>}
      <ul className="mt-6 space-y-3">
        {filtered.map((o) => (
          <li key={o._id} className="rounded-xl bg-[#11192c] p-4 text-sm">
            <p className="font-orbitron text-[#cc97ff]">Order #{o._id.slice(-6).toUpperCase()}</p>
            <p className="mt-1 font-medium text-white">
              {o.status} — total {o.totalAmount}
            </p>
            {o.shippingAddress?.line1 ? (
              <p className="mt-1 text-xs text-slate-400">
                Ship to: {o.shippingAddress.fullName} · {o.shippingAddress.line1}, {o.shippingAddress.city}
              </p>
            ) : null}
            {o.trackingNumber ? (
              <p className="mt-1 font-orbitron text-xs text-[#9bffce]">Tracking: {o.trackingNumber}</p>
            ) : null}
            <div className="mt-2 flex flex-wrap gap-2">
              {['processing', 'shipped', 'completed'].map((s) => (
                <button
                  key={s}
                  type="button"
                  className="rounded-lg bg-black/40 px-3 py-1 text-xs uppercase tracking-wider text-slate-300 hover:bg-[#1c253b]"
                  onClick={() => update(o._id, s)}
                >
                  Mark {s}
                </button>
              ))}
              <button
                type="button"
                className="rounded-lg border border-[#cc97ff]/40 px-3 py-1 text-xs uppercase text-[#cc97ff]"
                onClick={() => setTracking(o._id)}
              >
                Add tracking
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
