import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../../services/api';

export default function BusinessOrders() {
  const [list, setList] = useState([]);
  const [err, setErr] = useState('');
  useEffect(() => {
    api
      .get('/business/orders')
      .then((r) => setList(r.data.data || []))
      .catch((e) => setErr(getErrorMessage(e)));
  }, []);

  const update = async (id, status) => {
    try {
      await api.patch(`/business/orders/${id}`, { status });
      const { data } = await api.get('/business/orders');
      setList(data.data || []);
    } catch (e) {
      alert(getErrorMessage(e));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold">Orders</h1>
      {err && <p className="text-sm text-red-600 mt-2">{err}</p>}
      <ul className="mt-4 space-y-3">
        {list.map((o) => (
          <li key={o._id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
            <p className="font-medium">
              {o.status} — total {o.totalAmount}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {['processing', 'shipped', 'completed'].map((s) => (
                <button key={s} type="button" className="rounded border px-2 py-1 text-xs" onClick={() => update(o._id, s)}>
                  Mark {s}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
