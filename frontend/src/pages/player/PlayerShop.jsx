import { useEffect, useMemo, useState } from 'react';
import PlayerCard from '../../components/player/PlayerCard';
import PlayerPageHeader from '../../components/player/PlayerPageHeader';
import { playerBtnOutlineSm, playerBtnPrimary } from '../../components/player/playerClassNames';
import StripePaySection, { stripePublishableConfigured } from '../../components/payment/StripePaySection';
import { api, getErrorMessage } from '../../services/api';

/** SRS UC-P8 — browse, filter, cart, checkout (Stripe or mock when keys unset) */
export default function PlayerShop() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [sport, setSport] = useState('');
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [ship, setShip] = useState({
    fullName: '',
    line1: '',
    city: '',
    phone: '',
    postalCode: '',
  });
  const [cardLast4, setCardLast4] = useState('4242');
  const [note, setNote] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [intentLoading, setIntentLoading] = useState(false);

  const useStripeFlow = stripePublishableConfigured();

  const params = useMemo(() => {
    const p = {};
    if (sport) p.sport = sport;
    if (q.trim()) p.q = q.trim();
    if (category.trim()) p.category = category.trim();
    return p;
  }, [sport, q, category]);

  const load = () => {
    api
      .get('/players/products', { params })
      .then((r) => setProducts(r.data.data || []))
      .catch((e) => setErr(getErrorMessage(e)));
  };

  useEffect(() => {
    load();
  }, [sport, q, category]);

  useEffect(() => {
    setClientSecret('');
  }, [cart]);

  const cartItems = () =>
    Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([productId, quantity]) => ({ productId, quantity }));

  const prepareStripeIntent = async () => {
    const items = cartItems();
    if (!items.length) return;
    setErr('');
    setOk('');
    setIntentLoading(true);
    setClientSecret('');
    try {
      const { data } = await api.post('/players/orders/payment-intent', { items });
      setClientSecret(data.data.clientSecret);
    } catch (e) {
      setErr(getErrorMessage(e));
    } finally {
      setIntentLoading(false);
    }
  };

  const finalizeOrder = async (paymentIntentId) => {
    const items = cartItems();
    setErr('');
    try {
      await api.post('/players/orders', {
        items,
        shippingAddress: ship.line1 ? ship : undefined,
        customerNote: note || undefined,
        paymentIntentId,
      });
      setCart({});
      setShowCheckout(false);
      setClientSecret('');
      setOk('Order placed successfully.');
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  const checkoutMock = async () => {
    const items = cartItems();
    if (!items.length) return;
    setErr('');
    setOk('');
    try {
      await api.post('/players/orders', {
        items,
        shippingAddress: ship.line1 ? ship : undefined,
        customerNote: note || undefined,
        cardLast4: cardLast4 || 'mock',
      });
      setCart({});
      setShowCheckout(false);
      setOk('Order placed (development mock payment).');
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  const add = (id) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));

  return (
    <div>
      <PlayerPageHeader title="Equipment" subtitle="Browse verified stores — filters, sale pricing, checkout." />
      {err ? <p className="mb-4 text-sm text-red-400">{err}</p> : null}
      {ok ? <p className="mb-4 text-sm text-player-green">{ok}</p> : null}

      <div className="mb-6 flex flex-wrap gap-3">
        <input
          className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
          placeholder="Search name"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <input
          className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <select
          className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
          value={sport}
          onChange={(e) => setSport(e.target.value)}
        >
          <option value="">All sports</option>
          <option value="cricket">Cricket</option>
          <option value="badminton">Badminton</option>
          <option value="general">General</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {products.map((p) => (
          <PlayerCard key={p._id}>
            <p className="text-lg font-bold text-white">{p.name}</p>
            <p className="text-sm text-player-on-variant">
              {p.sportType}
              {p.category ? ` · ${p.category}` : ''}
            </p>
            <p className="mt-2 font-orbitron text-lg font-bold text-player-green">
              {p.onSale ? (
                <>
                  <span className="text-player-green">{p.effectivePrice ?? p.price}</span>
                  <span className="ml-2 text-sm line-through text-slate-500">{p.price}</span>
                  <span className="ml-2 rounded bg-amber-500/20 px-1 text-[10px] uppercase text-amber-200">Sale</span>
                </>
              ) : (
                <>{p.effectivePrice ?? p.price}</>
              )}{' '}
              · Stock {p.stock}
            </p>
            <button type="button" onClick={() => add(p._id)} className={`${playerBtnOutlineSm} mt-4 w-full`}>
              Add to cart ({cart[p._id] || 0})
            </button>
          </PlayerCard>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={() => setShowCheckout((s) => !s)} className={playerBtnPrimary}>
          {showCheckout ? 'Hide checkout' : 'Checkout'}
        </button>
      </div>

      {showCheckout ? (
        <div className="mt-6 max-w-lg space-y-3 rounded-xl border border-white/10 bg-black/25 p-4 text-sm">
          <p className="font-headline text-xs uppercase text-slate-400">Shipping (optional)</p>
          {['fullName', 'line1', 'city', 'phone', 'postalCode'].map((k) => (
            <input
              key={k}
              className="w-full rounded border border-white/10 bg-black/40 px-2 py-1.5 text-white"
              placeholder={k}
              value={ship[k]}
              onChange={(e) => setShip((s) => ({ ...s, [k]: e.target.value }))}
            />
          ))}
          <textarea
            className="w-full rounded border border-white/10 bg-black/40 px-2 py-1.5 text-white"
            placeholder="Order note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          {useStripeFlow ? (
            <div className="space-y-3 border-t border-white/10 pt-4">
              <p className="text-xs text-slate-400">
                Card payment is processed securely with Stripe (min. order $0.50 USD).
              </p>
              {!clientSecret ? (
                <button
                  type="button"
                  disabled={intentLoading || !cartItems().length}
                  onClick={prepareStripeIntent}
                  className={playerBtnPrimary}
                >
                  {intentLoading ? 'Preparing…' : 'Continue to card payment'}
                </button>
              ) : (
                <StripePaySection
                  clientSecret={clientSecret}
                  onSucceeded={finalizeOrder}
                  onError={(m) => setErr(m)}
                  submitLabel="Pay & place order"
                  buttonClassName={playerBtnPrimary}
                />
              )}
            </div>
          ) : (
            <>
              <p className="font-headline text-xs uppercase text-slate-400">Development mock card (last 4)</p>
              <input
                className="w-full rounded border border-white/10 bg-black/40 px-2 py-1.5 text-white"
                maxLength={4}
                value={cardLast4}
                onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
              />
              <button type="button" onClick={checkoutMock} className={playerBtnPrimary}>
                Place order (mock)
              </button>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
