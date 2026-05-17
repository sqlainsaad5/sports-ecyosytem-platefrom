import { useEffect, useState } from 'react';
import PlayerCard from '../../components/player/PlayerCard';
import PlayerPageHeader from '../../components/player/PlayerPageHeader';
import {
  playerBtnOutlineSm,
  playerBtnPrimary,
  playerField,
  playerLabel,
  playerSelect,
} from '../../components/player/playerClassNames';
import StripePaySection, { stripePublishableConfigured } from '../../components/payment/StripePaySection';
import { GroundBrowseCard, GroundDetailsPanel, GroundPhotoStrip } from '../../components/GroundMedia';
import { api, getErrorMessage } from '../../services/api';
import {
  formatGroundBookingAmount,
  GROUND_BOOKING_MIN_PKR,
} from '../../utils/groundBookingCurrency';

export default function PlayerGrounds() {
  const [grounds, setGrounds] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [amount, setAmount] = useState('5000');
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

  const loadGrounds = () =>
    api
      .get('/public/grounds')
      .then((r) => setGrounds(r.data.data || []))
      .catch((e) => setErr(getErrorMessage(e)));

  const loadBookings = () =>
    api
      .get('/players/ground-bookings')
      .then((r) => setBookings(r.data.data || []))
      .catch(() => {});

  useEffect(() => {
    loadGrounds();
    loadBookings();
  }, []);

  const createHold = async () => {
    if (!selected) {
      setErr('Select a ground first.');
      return;
    }
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
      loadBookings();
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
      loadBookings();
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  const cancelBooking = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    setErr('');
    try {
      await api.delete(`/players/ground-bookings/${id}`);
      setOk('Booking cancelled.');
      loadBookings();
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  return (
    <div>
      <PlayerPageHeader
        title="Book ground"
        subtitle="Select a ground, book your slot, then browse all venues below."
      />
      {err ? <p className="mb-4 text-sm text-red-400">{err}</p> : null}
      {ok ? <p className="mb-4 text-sm text-player-green">{ok}</p> : null}

      <PlayerCard className="mb-8 space-y-4">
        <h2 className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-player-green">
          Book a slot
        </h2>
        <div>
          <label className={playerLabel}>Ground</label>
          <select className={`${playerSelect} mt-2`} value={selected} onChange={(e) => setSelected(e.target.value)}>
            <option value="">Select a ground…</option>
            {grounds.map((g) => (
              <option key={g._id} value={g._id}>
                {g.name} ({g.sportType})
              </option>
            ))}
          </select>
        </div>
        {!selected ? (
          <p className="text-sm text-player-on-variant">Choose a ground to see photos, location, and book your slot.</p>
        ) : (
            <div className="rounded-2xl bg-player-bg px-4 py-4 outline outline-1 outline-white/10">
              <GroundDetailsPanel ground={selectedGround} slotCheck={start && end ? slotCheck : null} />
            </div>
          )}
          <div>
            <label className={playerLabel}>Start</label>
            <input
              type="datetime-local"
              className={`${playerField} mt-2`}
              value={start}
              onChange={(e) => setStart(e.target.value)}
              disabled={!selected}
            />
          </div>
          <div>
            <label className={playerLabel}>End</label>
            <input
              type="datetime-local"
              className={`${playerField} mt-2`}
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              disabled={!selected}
            />
          </div>
          <div>
            <label className={playerLabel}>Amount (PKR)</label>
            <input
              type="number"
              className={`${playerField} mt-2`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={!selected}
            />
          </div>
          <button
            type="button"
            onClick={createHold}
            disabled={!selected}
            className={`${playerBtnPrimary} w-full disabled:opacity-50`}
          >
            Hold slot
          </button>
          {hold ? (
            <div className="rounded-2xl bg-player-green/10 px-4 py-3 text-sm text-player-on-surface outline outline-1 outline-player-green/25">
              <p>Hold active until {new Date(hold.holdExpiresAt).toLocaleTimeString()}</p>
              {useStripeFlow ? (
                <div className="mt-3 space-y-3">
                  <p className="text-xs text-slate-500">Use Stripe for payment (min. {GROUND_BOOKING_MIN_PKR} PKR).</p>
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

      <section className="mb-8">
        <h2 className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-player-on-variant">
          Available grounds
        </h2>
        {!grounds.length ? (
          <p className="mt-4 text-sm text-player-on-variant">No active grounds listed yet.</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {grounds.map((g) => (
              <GroundBrowseCard
                key={g._id}
                ground={g}
                selected={selected === g._id}
                onSelect={setSelected}
              />
            ))}
          </div>
        )}
      </section>

      {bookings.length ? (
        <section className="mt-10">
          <h2 className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-player-on-variant">
            Your bookings
          </h2>
          <ul className="mt-4 space-y-4">
            {bookings.map((b) => {
              const g = b.ground;
              if (!g || typeof g !== 'object') return null;
              return (
                <PlayerCard key={b._id} className="overflow-hidden p-0">
                  <GroundPhotoStrip ground={g} />
                  <div className="p-4 text-sm">
                    <p className="font-bold text-white">{g.name}</p>
                    <p className="mt-1 text-xs text-player-on-variant">
                      {b.status} · {new Date(b.startTime).toLocaleString()} – {new Date(b.endTime).toLocaleString()}
                      {b.amount != null ? ` · ${formatGroundBookingAmount(b.amount)}` : ''}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {g.city ? `${g.city} · ` : ''}
                      {g.lengthFeet ? `${g.lengthFeet} ft` : ''}
                      {g.areaSqFt ? ` · ${Number(g.areaSqFt).toLocaleString()} sq ft` : ''}
                    </p>
                    {b.status !== 'cancelled' && b.status !== 'completed' ? (
                      <button type="button" onClick={() => cancelBooking(b._id)} className={`${playerBtnOutlineSm} mt-3`}>
                        Cancel
                      </button>
                    ) : null}
                  </div>
                </PlayerCard>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
