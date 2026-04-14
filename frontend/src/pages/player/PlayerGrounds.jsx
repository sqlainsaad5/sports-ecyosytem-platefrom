import { useEffect, useState } from 'react';
import PlayerCard from '../../components/player/PlayerCard';
import PlayerPageHeader from '../../components/player/PlayerPageHeader';
import { playerBtnPrimary, playerField, playerLabel, playerSelect } from '../../components/player/playerClassNames';
import StripePaySection, { stripePublishableConfigured } from '../../components/payment/StripePaySection';
import { api, getErrorMessage } from '../../services/api';

export default function PlayerGrounds() {
  const [grounds, setGrounds] = useState([]);
  const [selected, setSelected] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [amount, setAmount] = useState('500');
  const [hold, setHold] = useState(null);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [intentLoading, setIntentLoading] = useState(false);

  const useStripeFlow = stripePublishableConfigured();

  useEffect(() => {
    api
      .get('/public/grounds')
      .then((r) => setGrounds(r.data.data || []))
      .catch((e) => setErr(getErrorMessage(e)));
  }, []);

  const createHold = async () => {
    setErr('');
    setOk('');
    setClientSecret('');
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

  const prepareGroundPayment = async () => {
    if (!hold?._id) return;
    setErr('');
    setOk('');
    setIntentLoading(true);
    setClientSecret('');
    try {
      const { data } = await api.post(`/players/ground-bookings/${hold._id}/payment-intent`);
      setClientSecret(data.data.clientSecret);
    } catch (e) {
      setErr(getErrorMessage(e));
    } finally {
      setIntentLoading(false);
    }
  };

  const confirmMock = async () => {
    if (!hold?._id) return;
    setErr('');
    try {
      await api.post(`/players/ground-bookings/${hold._id}/confirm-payment`, {});
      setOk('Booking confirmed (mock payment).');
      setHold(null);
      setClientSecret('');
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  const onStripeSucceeded = async (paymentIntentId) => {
    if (!hold?._id) return;
    setErr('');
    try {
      await api.post(`/players/ground-bookings/${hold._id}/confirm-payment`, { paymentIntentId });
      setOk('Booking confirmed.');
      setHold(null);
      setClientSecret('');
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
      {ok ? <p className="mb-4 text-sm text-player-green">{ok}</p> : null}
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
          <label className={playerLabel}>Amount (USD)</label>
          <input type="number" className={`${playerField} mt-2`} value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <button type="button" onClick={createHold} className={`${playerBtnPrimary} w-full`}>
          Hold slot
        </button>
        {hold ? (
          <div className="rounded-2xl bg-player-green/10 px-4 py-3 text-sm text-player-on-surface outline outline-1 outline-player-green/25">
            <p>Hold active until {new Date(hold.holdExpiresAt).toLocaleTimeString()}</p>
            {useStripeFlow ? (
              <div className="mt-3 space-y-3">
                <p className="text-xs text-slate-500">Use Stripe for payment (min. $0.50).</p>
                {!clientSecret ? (
                  <button
                    type="button"
                    disabled={intentLoading}
                    onClick={prepareGroundPayment}
                    className={`${playerBtnPrimary} w-full`}
                  >
                    {intentLoading ? 'Preparing…' : 'Continue to card payment'}
                  </button>
                ) : (
                  <StripePaySection
                    clientSecret={clientSecret}
                    onSucceeded={onStripeSucceeded}
                    onError={(m) => setErr(m)}
                    submitLabel="Confirm booking"
                    buttonClassName={`${playerBtnPrimary} w-full`}
                  />
                )}
              </div>
            ) : (
              <button type="button" onClick={confirmMock} className={`${playerBtnPrimary} mt-3 w-full`}>
                Confirm payment (mock)
              </button>
            )}
          </div>
        ) : null}
      </PlayerCard>
    </div>
  );
}
