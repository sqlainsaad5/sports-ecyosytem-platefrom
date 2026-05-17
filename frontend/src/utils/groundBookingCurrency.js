export const GROUND_BOOKING_CURRENCY_CODE = 'PKR';
export const GROUND_BOOKING_MIN_PKR = 50;

export function formatGroundBookingAmount(amount) {
  const n = Number(amount);
  if (Number.isNaN(n)) return '—';
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: GROUND_BOOKING_CURRENCY_CODE,
    maximumFractionDigits: 0,
  }).format(n);
}
