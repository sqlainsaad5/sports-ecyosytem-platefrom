import { useEffect, useState } from 'react';
import PlayerCard from '../../components/player/PlayerCard';
import PlayerPageHeader from '../../components/player/PlayerPageHeader';
import { playerBtnPrimary, playerField, playerLabel, playerSelect } from '../../components/player/playerClassNames';
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
      <PlayerPageHeader
        title="Book ground"
        subtitle="Hold a slot for a few minutes, then confirm payment."
      />
      {err ? <p className="mb-4 text-sm text-red-400">{err}</p> : null}
      <PlayerCard className="max-w-md space-y-4">
        <div>
          <label className={playerLabel}>Ground</label>
          <select className={`${playerSelect} mt-2`} value={selected} onChange={(e) => setSelected(e.target.value)}>
            <option value="">Select…</option>
            {grounds.map((g) => (
              <option key={g._id} value={g._id}>
                {g.name} ({g.sportType})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={playerLabel}>Start</label>
          <input type="datetime-local" className={`${playerField} mt-2`} value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div>
          <label className={playerLabel}>End</label>
          <input type="datetime-local" className={`${playerField} mt-2`} value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
        <div>
          <label className={playerLabel}>Amount</label>
          <input type="number" className={`${playerField} mt-2`} value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <button type="button" onClick={createHold} className={`${playerBtnPrimary} w-full`}>
          Hold slot
        </button>
        {hold ? (
          <div className="rounded-2xl bg-player-green/10 px-4 py-3 text-sm text-player-on-surface outline outline-1 outline-player-green/25">
            <p>Hold active until {new Date(hold.holdExpiresAt).toLocaleTimeString()}</p>
            <button type="button" onClick={confirm} className={`${playerBtnPrimary} mt-3 w-full`}>
              Confirm payment (mock)
            </button>
          </div>
        ) : null}
      </PlayerCard>
    </div>
  );
}
