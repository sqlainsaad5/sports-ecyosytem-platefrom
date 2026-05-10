import { useEffect, useState } from 'react';
import PlayerCard from '../../components/player/PlayerCard';
import PlayerPageHeader from '../../components/player/PlayerPageHeader';
import { playerBtnPrimary, playerField, playerLabel, playerSelect } from '../../components/player/playerClassNames';
import StripePaySection, { stripePublishableConfigured } from '../../components/payment/StripePaySection';
import { api, getErrorMessage } from '../../services/api';
import { publicAssetUrl } from '../../utils/assetUrl';

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
  const [slotCheck, setSlotCheck] = useState(null);

  const useStripeFlow = stripePublishableConfigured();
  const selectedGround = grounds.find((g) => g._id === selected);

  useEffect(() => {
    if (!selected || !start || !end) {
      setSlotCheck(null);
      return;
    }
    const startMs = new Date(start).getTime();
    const endMs = new Date(end).getTime();
    if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs <= startMs) {
      setSlotCheck(null);
      return;
    }
    const t = setTimeout(() => {
      api
        .get(`/public/grounds/${selected}/slots/check`, {
          params: { startTime: new Date(start).toISOString(), endTime: new Date(end).toISOString() },
        })
        .then((r) => setSlotCheck(r.data.data))
        .catch(() => setSlotCheck(null));
    }, 400);
    return () => clearTimeout(t);
  }, [selected, start, end]);

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
        subtitle="Choose a ground managed by admin, then hold and confirm your booking."
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
        {selectedGround ? (
          <div className="rounded-2xl bg-player-bg px-4 py-3 text-sm text-player-on-surface outline outline-1 outline-white/10">
            {selectedGround.imagePath ? (
              <img
                src={publicAssetUrl(selectedGround.imagePath)}
                alt=""
                className="mb-3 max-h-52 w-full rounded-xl object-cover"
              />
            ) : null}
            <p className="font-semibold text-white">{selectedGround.name}</p>
            <p className="mt-1 text-xs text-slate-400">
              Hours: {selectedGround.openTime || '—'}–{selectedGround.closeTime || '—'} · Slot{' '}
              {selectedGround.slotDurationMinutes ?? 60} min
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Owner: {selectedGround.ownerName} ·{' '}
              <a className="text-player-green underline-offset-2 hover:underline" href={`tel:${selectedGround.ownerPhone}`}>
                {selectedGround.ownerPhone}
              </a>
            </p>
            <p className="mt-1 text-xs text-slate-400">Address: {selectedGround.ownerAddress || selectedGround.address || '—'}</p>
            <p className="mt-1 text-xs text-slate-400">
              Location:{' '}
              {selectedGround.ownerLocation && /^https?:\/\//i.test(selectedGround.ownerLocation) ? (
                <a
                  href={selectedGround.ownerLocation}
                  target="_blank"
                  rel="noreferrer"
                  className="text-player-green underline-offset-2 hover:underline"
                >
                  Open map
                </a>
              ) : (
                <span>{selectedGround.ownerLocation || selectedGround.city || '—'}</span>
              )}
            </p>
            {slotCheck && start && end ? (
              <p
                className={`mt-3 font-headline text-xs font-bold uppercase tracking-wider ${
                  slotCheck.available ? 'text-player-green' : 'text-red-400'
                }`}
              >
                {slotCheck.available ? 'Selected time slot is available' : 'Selected time slot is not available (booked or held)'}
              </p>
            ) : null}
          </div>
        ) : null}
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
