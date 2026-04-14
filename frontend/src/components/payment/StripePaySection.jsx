import { useState } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const pk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
export const stripePromise = pk ? loadStripe(pk) : null;

export function stripePublishableConfigured() {
  return Boolean(pk && String(pk).startsWith('pk_'));
}

function InnerPay({ onSucceeded, onError, submitLabel, busyLabel, buttonClassName }) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });
    setBusy(false);
    if (error) {
      onError?.(error.message || 'Payment failed');
      return;
    }
    if (paymentIntent?.status === 'succeeded' && paymentIntent.id) {
      onSucceeded(paymentIntent.id);
    } else {
      onError?.('Payment was not completed.');
    }
  };

  return (
    <form onSubmit={handle} className="space-y-4">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || busy}
        className={
          buttonClassName ||
          'rounded-lg bg-player-green px-4 py-2 font-headline text-sm font-bold uppercase tracking-wider text-black disabled:opacity-50'
        }
      >
        {busy ? busyLabel || 'Processing…' : submitLabel || 'Pay securely'}
      </button>
    </form>
  );
}

/**
 * Renders Stripe Payment Element when clientSecret is set (PaymentIntent from backend).
 */
export default function StripePaySection({
  clientSecret,
  onSucceeded,
  onError,
  submitLabel,
  busyLabel,
  buttonClassName,
}) {
  if (!clientSecret || !stripePromise) return null;
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <InnerPay
        onSucceeded={onSucceeded}
        onError={onError}
        submitLabel={submitLabel}
        busyLabel={busyLabel}
        buttonClassName={buttonClassName}
      />
    </Elements>
  );
}
