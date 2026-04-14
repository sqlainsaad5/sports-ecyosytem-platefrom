import { useState } from 'react';
import { api, getErrorMessage } from '../../services/api';
import StripePaySection, { stripePublishableConfigured } from '../../components/payment/StripePaySection';

/** SRS UC-B3 / UC-B4 — subscribe, renew, change tier (Stripe or mock) */
export default function BusinessSubscription() {
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [cardLast4, setCardLast4] = useState('4242');
  const [clientSecret, setClientSecret] = useState('');
  const [pending, setPending] = useState(null);
  const [intentLoading, setIntentLoading] = useState(false);

  const useStripeFlow = stripePublishableConfigured();

  const startIntent = async (kind, pkg) => {
    setMsg('');
    setErr('');
    setClientSecret('');
    setPending(null);
    setIntentLoading(true);
    try {
      const body = { action: kind };
      if (kind === 'subscribe' || kind === 'change') body.package = pkg;
      const { data } = await api.post('/business/subscription/payment-intent', body);
      setClientSecret(data.data.clientSecret);
      setPending({
        kind,
        package: data.data.package || pkg,
      });
    } catch (e) {
      setErr(getErrorMessage(e));
    } finally {
      setIntentLoading(false);
    }
  };

  const onStripeSucceeded = async (paymentIntentId) => {
    if (!pending) return;
    setErr('');
    try {
      if (pending.kind === 'subscribe') {
        await api.post('/business/subscription', { package: pending.package, paymentIntentId });
        setMsg(`Subscribed to ${pending.package}.`);
      } else if (pending.kind === 'renew') {
        await api.post('/business/subscription/renew', { paymentIntentId });
        setMsg('Subscription renewed.');
      } else {
        await api.put('/business/subscription/plan', { package: pending.package, paymentIntentId });
        setMsg(`Plan changed to ${pending.package}.`);
      }
      setClientSecret('');
      setPending(null);
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  const subscribeMock = async (pkg) => {
    setMsg('');
    setErr('');
    try {
      await api.post('/business/subscription', { package: pkg, cardLast4 });
      setMsg(`Subscribed to ${pkg} (mock payment).`);
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  const renewMock = async () => {
    try {
      await api.post('/business/subscription/renew');
      setMsg('Renewed (mock).');
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  const changeMock = async (pkg) => {
    setMsg('');
    setErr('');
    try {
      await api.put('/business/subscription/plan', { package: pkg, cardLast4 });
      setMsg(`Plan changed to ${pkg} (mock).`);
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="font-rajdhani text-5xl font-bold uppercase tracking-tight text-white">Subscription Management</h1>
      <p className="mt-1 text-sm text-slate-400">Basic 20 / Pro 40 / Premium 60 listings per cycle (SRS).</p>
      {err ? <p className="mt-4 rounded-lg bg-red-950/50 px-3 py-2 text-sm text-red-300">{err}</p> : null}
      {msg ? <p className="mt-4 rounded-lg bg-[#1c253b] px-3 py-2 text-sm text-[#cc97ff]">{msg}</p> : null}

      {useStripeFlow ? (
        <div className="mt-6 space-y-4 rounded-xl border border-white/10 bg-[#0b1324] p-4">
          <p className="text-sm text-slate-400">
            Payments use Stripe (test mode). Choose a plan, then complete the card form when it appears.
          </p>
          {!clientSecret ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <button
                type="button"
                disabled={intentLoading}
                className="rounded-xl bg-[#11192c] px-4 py-3 text-sm font-bold uppercase text-white hover:bg-[#1c253b]"
                onClick={() => startIntent('subscribe', 'basic')}
              >
                Basic — pay
              </button>
              <button
                type="button"
                disabled={intentLoading}
                className="rounded-xl bg-[#11192c] px-4 py-3 text-sm font-bold uppercase text-white hover:bg-[#1c253b]"
                onClick={() => startIntent('subscribe', 'pro')}
              >
                Pro — pay
              </button>
              <button
                type="button"
                disabled={intentLoading}
                className="rounded-xl bg-[#11192c] px-4 py-3 text-sm font-bold uppercase text-white hover:bg-[#1c253b]"
                onClick={() => startIntent('subscribe', 'premium')}
              >
                Premium — pay
              </button>
              <button
                type="button"
                disabled={intentLoading}
                className="rounded-xl bg-gradient-to-r from-[#cc97ff] to-[#9c48ea] px-4 py-3 text-sm font-bold uppercase text-[#360061]"
                onClick={() => startIntent('renew')}
              >
                Renew current — pay
              </button>
            </div>
          ) : (
            <div className="mt-4 max-w-md">
              <StripePaySection
                clientSecret={clientSecret}
                onSucceeded={onStripeSucceeded}
                onError={(m) => setErr(m)}
                submitLabel="Complete payment"
                buttonClassName="w-full rounded-lg bg-gradient-to-r from-[#cc97ff] to-[#9c48ea] px-4 py-3 font-headline text-sm font-bold uppercase text-[#360061]"
              />
            </div>
          )}
          <p className="mt-6 text-xs uppercase tracking-widest text-slate-500">Change plan</p>
          <div className="flex flex-wrap gap-2">
            {['basic', 'pro', 'premium'].map((pkg) => (
              <button
                key={pkg}
                type="button"
                disabled={intentLoading || !!clientSecret}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm uppercase text-white hover:bg-white/5"
                onClick={() => startIntent('change', pkg)}
              >
                Switch to {pkg} (pay)
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="mt-4 max-w-xs">
            <label className="text-xs uppercase text-slate-500">Mock card last 4 (UC-B3)</label>
            <input
              className="mt-1 w-full rounded-lg bg-black/40 px-3 py-2 text-white"
              maxLength={4}
              value={cardLast4}
              onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
            />
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <button
              type="button"
              className="rounded-xl bg-[#11192c] px-4 py-4 text-sm font-bold uppercase tracking-wider text-white hover:bg-[#1c253b]"
              onClick={() => subscribeMock('basic')}
            >
              Basic
            </button>
            <button
              type="button"
              className="rounded-xl bg-[#11192c] px-4 py-4 text-sm font-bold uppercase tracking-wider text-white hover:bg-[#1c253b]"
              onClick={() => subscribeMock('pro')}
            >
              Pro
            </button>
            <button
              type="button"
              className="rounded-xl bg-[#11192c] px-4 py-4 text-sm font-bold uppercase tracking-wider text-white hover:bg-[#1c253b]"
              onClick={() => subscribeMock('premium')}
            >
              Premium
            </button>
            <button
              type="button"
              className="rounded-xl bg-gradient-to-r from-[#cc97ff] to-[#9c48ea] px-4 py-4 text-sm font-bold uppercase tracking-wider text-[#360061]"
              onClick={renewMock}
            >
              Renew current
            </button>
          </div>
          <p className="mt-8 text-xs uppercase tracking-widest text-slate-500">Change plan (upgrade/downgrade guard)</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {['basic', 'pro', 'premium'].map((pkg) => (
              <button
                key={pkg}
                type="button"
                className="rounded-lg border border-white/10 px-4 py-2 text-sm uppercase text-white hover:bg-white/5"
                onClick={() => changeMock(pkg)}
              >
                Switch to {pkg}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
