/** Ground booking charges are in Pakistani Rupees (PKR). */
const GROUND_BOOKING_CURRENCY = 'pkr';
const GROUND_BOOKING_MIN_PKR = 50;

function groundBookingAmountToMinor(amount) {
  const n = Number(amount);
  if (Number.isNaN(n) || n < 0) return 0;
  return Math.round(n * 100);
}

function isValidGroundBookingStripeAmount(amount) {
  return groundBookingAmountToMinor(amount) >= GROUND_BOOKING_MIN_PKR * 100;
}

module.exports = {
  GROUND_BOOKING_CURRENCY,
  GROUND_BOOKING_MIN_PKR,
  groundBookingAmountToMinor,
  isValidGroundBookingStripeAmount,
};
