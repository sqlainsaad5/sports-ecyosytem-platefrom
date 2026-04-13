import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../../services/api';

export default function PlayerGrounds() {
  const [grounds, setGrounds] = useState([]);
  const [selected, setSelected] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [amount, setAmount] = useState('500');
  const [hold, setHold] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api
      .get('/public/grounds')
      .then((r) => setGrounds(r.data.data || []))
      .catch((e) => setErr(getErrorMessage(e)));
  }, []);

  const createHold = async () => {
    setErr('');
    try {
      const { data } = await api.post('/players/ground-bookings/hold', {
        groundId: selected,
        startTime: new Date(start).toISOString(),
        endTime: new Date(end).toISOString(),
        amount: Number(amount) || 0,
      });
      setHold(data.data);
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  const confirm = async () => {
    if (!hold?._id) return;
    setErr('');
    try {
      await api.post(`/players/ground-bookings/${hold._id}/confirm-payment`);
      alert('Booking confirmed (mock payment).');
      setHold(null);
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold">Indoor ground booking</h1>
      <p className="text-slate-600 mt-1">Hold a slot for a few minutes, then confirm payment.</p>
      {err && <p className="mt-4 text-sm text-red-600">{err}</p>}
      <div className="mt-6 max-w-md space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <div>
          <label className="text-sm font-medium">Ground</label>
          <select
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">Select…</option>
            {grounds.map((g) => (
              <option key={g._id} value={g._id}>
                {g.name} ({g.sportType})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Start</label>
          <input
            type="datetime-local"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">End</label>
          <input
            type="datetime-local"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Amount</label>
          <input
            type="number"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <button type="button" onClick={createHold} className="w-full rounded-lg bg-slate-800 text-white py-2 text-sm">
          Hold slot
        </button>
        {hold && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm">
            <p>Hold active until {new Date(hold.holdExpiresAt).toLocaleTimeString()}</p>
            <button type="button" onClick={confirm} className="mt-2 w-full rounded-lg bg-brand-600 text-white py-2">
              Confirm payment (mock)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
