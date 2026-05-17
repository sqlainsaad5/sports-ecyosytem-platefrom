import { useEffect, useState } from 'react';
import { coachBtnPrimary, coachField, coachLabel, coachSelect } from '../../components/coach/coachClassNames';
import StripePaySection, { stripePublishableConfigured } from '../../components/payment/StripePaySection';
import { GroundBrowseCard, GroundDetailsPanel, GroundPhotoStrip } from '../../components/GroundMedia';
import { api, getErrorMessage } from '../../services/api';
import {
  formatGroundBookingAmount,
  GROUND_BOOKING_MIN_PKR,
} from '../../utils/groundBookingCurrency';

const coachLinkClass = 'text-[#ff7524] underline-offset-2 hover:underline';
const coachBtnOutline =
  'mt-3 rounded-lg border border-white/20 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white transition hover:border-[#ff7524]/50 hover:text-[#ff7524]';

export default function CoachGrounds() {
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
      .get('/coaches/ground-bookings')
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
      const { data } = await api.post('/coaches/ground-bookings/hold', {
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
      const { data } = await api.post(`/coaches/ground-bookings/${hold._id}/payment-intent`);
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
      await api.post(`/coaches/ground-bookings/${hold._id}/confirm-payment`, {});
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
      await api.post(`/coaches/ground-bookings/${hold._id}/confirm-payment`, { paymentIntentId });
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
      await api.delete(`/coaches/ground-bookings/${id}`);
      setOk('Booking cancelled.');
      loadBookings();
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  return (
    <div className="space-y-8 text-player-on-surface">
      <div>
        <h1 className="font-headline text-2xl font-bold uppercase tracking-[0.08em] text-white">Book ground</h1>
        <p className="mt-2 text-sm text-slate-400">
          Select a ground to see photos, location, dimensions, and owner details — then book your slot.
        </p>
      </div>
      {err ? <p className="text-sm text-red-400">{err}</p> : null}
      {ok ? <p className="text-sm text-[#ff7524]">{ok}</p> : null}

      <section className="max-w-2xl space-y-4 rounded-2xl bg-player-container p-5 shadow-player-card">
        <h2 className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-[#ff7524]">Book a slot</h2>
        <div>
          <label className={coachLabel}>Ground</label>
          <select className={`${coachSelect} mt-2`} value={selected} onChange={(e) => setSelected(e.target.value)}>
            <option value="">Select a ground…</option>
            {grounds.map((g) => (
              <option key={g._id} value={g._id}>
                {g.name} ({g.sportType})
              </option>
            ))}
          </select>
        </div>
        {!selected ? (
          <p className="text-sm text-slate-400">Choose a ground from the list or grid below to view full details.</p>
        ) : (
          <div className="rounded-2xl bg-player-bg px-4 py-4 outline outline-1 outline-white/10">
            <GroundDetailsPanel
              ground={selectedGround}
              linkClassName={coachLinkClass}
              slotCheck={start && end ? slotCheck : null}
              slotAvailableClassName="text-[#ff7524]"
            />
          </div>
        )}
        <div>
          <label className={coachLabel}>Start</label>
          <input
            type="datetime-local"
            className={`${coachField} mt-2`}
            value={start}
            onChange={(e) => setStart(e.target.value)}
            disabled={!selected}
          />
        </div>
        <div>
          <label className={coachLabel}>End</label>
          <input
            type="datetime-local"
            className={`${coachField} mt-2`}
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            disabled={!selected}
          />
        </div>
        <div>
          <label className={coachLabel}>Amount (PKR)</label>
          <input
            type="number"
            className={`${coachField} mt-2`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={!selected}
          />
        </div>
        <button
          type="button"
          onClick={createHold}
          disabled={!selected}
          className={`${coachBtnPrimary} w-full disabled:cursor-not-allowed disabled:opacity-50`}
        >
          Hold slot
        </button>
        {hold ? (
          <div className="rounded-2xl bg-[#ff7524]/10 px-4 py-3 text-sm text-player-on-surface outline outline-1 outline-[#ff7524]/25">
            <p>Hold active until {new Date(hold.holdExpiresAt).toLocaleTimeString()}</p>
            {useStripeFlow ? (
              <div className="mt-3 space-y-3">
                <p className="text-xs text-slate-500">Use Stripe for payment (min. {GROUND_BOOKING_MIN_PKR} PKR).</p>
                {!clientSecret ? (
                  <button
                    type="button"
                    disabled={intentLoading}
                    onClick={prepareGroundPayment}
                    className={`${coachBtnPrimary} w-full`}
                  >
                    {intentLoading ? 'Preparing…' : 'Continue to card payment'}
                  </button>
                ) : (
                  <StripePaySection
                    clientSecret={clientSecret}
                    onSucceeded={onStripeSucceeded}
                    onError={(m) => setErr(m)}
                    submitLabel="Confirm booking"
                    buttonClassName={`${coachBtnPrimary} w-full`}
                  />
                )}
              </div>
            ) : (
              <button type="button" onClick={confirmMock} className={`${coachBtnPrimary} mt-3 w-full`}>
                Confirm payment (mock)
              </button>
            )}
          </div>
        ) : null}
      </section>

      <section>
        <h2 className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Available grounds</h2>
        {!grounds.length ? (
          <p className="mt-4 text-sm text-slate-400">No active grounds listed yet.</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {grounds.map((g) => (
              <GroundBrowseCard
                key={g._id}
                ground={g}
                selected={selected === g._id}
                onSelect={setSelected}
                accent="coach"
              />
            ))}
          </div>
        )}
      </section>

      {bookings.length ? (
        <section>
          <h2 className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Your bookings</h2>
          <ul className="mt-4 space-y-4">
            {bookings.map((b) => {
              const g = b.ground;
              if (!g || typeof g !== 'object') return null;
              return (
                <li
                  key={b._id}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-player-container shadow-player-card"
                >
                  <GroundPhotoStrip ground={g} />
                  <div className="p-4 text-sm">
                    <p className="font-bold text-white">{g.name}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {g.sportType}
                      {g.city ? ` · ${g.city}` : ''}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {b.status} · {new Date(b.startTime).toLocaleString()} – {new Date(b.endTime).toLocaleString()}
                      {b.amount != null ? ` · ${formatGroundBookingAmount(b.amount)}` : ''}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {g.ownerAddress || g.address || '—'}
                      {g.lengthFeet ? ` · ${g.lengthFeet} ft` : ''}
                      {g.areaSqFt ? ` · ${Number(g.areaSqFt).toLocaleString()} sq ft` : ''}
                    </p>
                    {b.status !== 'cancelled' && b.status !== 'completed' ? (
                      <button type="button" onClick={() => cancelBooking(b._id)} className={`${coachBtnOutline} mt-3`}>
                        Cancel
                      </button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
