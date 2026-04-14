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
      <h1 className="font-rajdhani text-5xl font-bold uppercase tracking-tight text-white">My Orders</h1>
      {err && <p className="text-sm text-red-400 mt-2">{err}</p>}
      <ul className="mt-6 space-y-3">
        {list.map((o) => (
          <li key={o._id} className="rounded-xl bg-[#11192c] p-4 text-sm">
            <p className="font-orbitron text-[#cc97ff]">Order #{o._id.slice(-6).toUpperCase()}</p>
            <p className="mt-1 font-medium text-white">
              {o.status} - total {o.totalAmount}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {['processing', 'shipped', 'completed'].map((s) => (
                <button key={s} type="button" className="rounded-lg bg-black/40 px-3 py-1 text-xs uppercase tracking-wider text-slate-300 hover:bg-[#1c253b]" onClick={() => update(o._id, s)}>
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
