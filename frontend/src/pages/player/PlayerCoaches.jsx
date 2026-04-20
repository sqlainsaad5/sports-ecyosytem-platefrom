import { useEffect, useState } from 'react';
import PlayerCard from '../../components/player/PlayerCard';
import PlayerPageHeader from '../../components/player/PlayerPageHeader';
import { playerBtnSm, playerField, playerLabel } from '../../components/player/playerClassNames';
import StripePaySection, { stripePublishableConfigured } from '../../components/payment/StripePaySection';
import { api, getErrorMessage } from '../../services/api';

export default function PlayerCoaches() {
  const [list, setList] = useState([]);
  const [generationMethod, setGenerationMethod] = useState('rules');
  const [requestNote, setRequestNote] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [err, setErr] = useState('');
  const [payAmt, setPayAmt] = useState({});
  const [payCard, setPayCard] = useState('4242');
  const [stripeCheckout, setStripeCheckout] = useState(null);
  const [intentLoading, setIntentLoading] = useState(false);

  const useStripeFlow = stripePublishableConfigured();

  const load = async () => {
    try {
      const { data } = await api.get('/players/recommendations', { params: { limit: 5 } });
      setList(data.data || []);
      setGenerationMethod(data.generationMethod || 'rules');
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startStripePay = async (coachId) => {
    const amount = parseFloat(payAmt[coachId] || '0', 10);
    if (!amount || amount <= 0) {
      setErr('Enter amount');
      return;
    }
    setErr('');
    setIntentLoading(true);
    setStripeCheckout(null);
    try {
      const { data } = await api.post('/players/payments/coach/payment-intent', { coachId, amount });
      setStripeCheckout({
        clientSecret: data.data.clientSecret,
        coachId,
        amount,
      });
    } catch (e) {
      setErr(getErrorMessage(e));
    } finally {
      setIntentLoading(false);
    }
  };

  const confirmCoachPayment = async (paymentIntentId) => {
    if (!stripeCheckout) return;
    const { coachId, amount } = stripeCheckout;
    setErr('');
    try {
      await api.post('/players/payments/coach', {
        coachId,
        amount,
        paymentIntentId,
      });
      setStripeCheckout(null);
      setStatusMsg('Payment completed.');
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  const payCoachMock = async (coachId) => {
    const amount = parseFloat(payAmt[coachId] || '0', 10);
    if (!amount || amount <= 0) {
      setErr('Enter amount');
      return;
    }
    setErr('');
    try {
      await api.post('/players/payments/coach', {
        coachId,
        amount,
        cardLast4: payCard.replace(/\D/g, '').slice(0, 4) || 'mock',
      });
      setStatusMsg('Payment recorded (mock gateway).');
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  const requestTraining = async (id) => {
    setErr('');
    try {
      await api.post('/players/training-requests', {
        coachId: id,
        message: requestNote || 'I would like to train with you.',
      });
      setStatusMsg('Request sent.');
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  return (
    <div>
      <PlayerPageHeader
        title="Coach match"
        subtitle="Verified coaches matched to your sport, skill, and city."
      />
      <p className="mb-3 text-xs uppercase tracking-[0.16em] text-player-on-variant/70">
        Source: {generationMethod === 'ai' ? 'AI Recommended' : 'Rules Fallback'}
      </p>
      {err ? <p className="mb-4 text-sm text-red-400">{err}</p> : null}
      {statusMsg ? <p className="mb-4 text-sm text-player-green">{statusMsg}</p> : null}
      <PlayerCard className="mb-6 max-w-xl">
        <label className={playerLabel}>Optional message (all requests)</label>
        <input
          className={`${playerField} mt-2`}
          placeholder="I would like to train with you."
          value={requestNote}
          onChange={(e) => setRequestNote(e.target.value)}
        />
      </PlayerCard>
      <ul className="space-y-4">
        {list.map((row) => (
          <PlayerCard key={row.userId} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-player-green/40 bg-player-green/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-player-green">
                  #{row.rank || '—'}
                </span>
                <p className="text-lg font-bold text-white">{row.profile?.fullName}</p>
              </div>
              <p className="mt-1 text-sm text-player-on-variant">
                {row.profile?.specialties?.join(', ')} · {row.profile?.city || '—'}
              </p>
              <p className="mt-2 text-xs text-player-on-variant/70">
                Match score: {row.matchScore?.toFixed?.(1) ?? row.matchScore}
              </p>
              {row.breakdown ? (
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-player-on-variant/80">
                  <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5">Skill {row.breakdown.skill}%</span>
                  <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5">Time {row.breakdown.time}%</span>
                  <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5">
                    Location {row.breakdown.location}%
                  </span>
                  <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5">
                    Performance {row.breakdown.performance}%
                  </span>
                </div>
              ) : null}
              {Array.isArray(row.reasons) && row.reasons.length ? (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-player-on-variant/70">
                  {row.reasons.slice(0, 3).map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              ) : null}
            </div>
            <div className="flex flex-col gap-2 sm:w-56">
              <button type="button" onClick={() => requestTraining(row.userId)} className={playerBtnSm}>
                Request training
              </button>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">UC-P10 — pay fee</p>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Amount"
                className={`${playerField} text-xs`}
                value={payAmt[row.userId] ?? ''}
                onChange={(e) => setPayAmt((p) => ({ ...p, [row.userId]: e.target.value }))}
              />
              {useStripeFlow ? (
                <>
                  {stripeCheckout?.coachId === row.userId ? (
                    <StripePaySection
                      clientSecret={stripeCheckout.clientSecret}
                      onSucceeded={confirmCoachPayment}
                      onError={(m) => setErr(m)}
                      submitLabel="Pay coach"
                      buttonClassName={playerBtnSm}
                    />
                  ) : (
                    <button
                      type="button"
                      disabled={intentLoading}
                      onClick={() => startStripePay(row.userId)}
                      className={playerBtnSm}
                    >
                      {intentLoading ? '…' : 'Pay with card (Stripe)'}
                    </button>
                  )}
                </>
              ) : (
                <>
                  <input
                    className={`${playerField} text-xs`}
                    placeholder="Card last 4"
                    maxLength={4}
                    value={payCard}
                    onChange={(e) => setPayCard(e.target.value)}
                  />
                  <button type="button" onClick={() => payCoachMock(row.userId)} className={playerBtnSm}>
                    Pay coach (mock)
                  </button>
                </>
              )}
            </div>
          </PlayerCard>
        ))}
        {!list.length && !err ? (
          <p className="text-sm text-player-on-variant">No coaches yet — complete your profile or wait for verifications.</p>
        ) : null}
      </ul>
    </div>
  );
}
