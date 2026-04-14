/** SRS UC-B9 — sale price / discount windows */

function inSaleWindow(p) {
  if (!p?.saleStart || !p?.saleEnd) return false;
  const now = Date.now();
  const a = new Date(p.saleStart).getTime();
  const b = new Date(p.saleEnd).getTime();
  return now >= a && now <= b;
}

function effectiveProductPrice(p) {
  if (!p) return 0;
  if (inSaleWindow(p)) {
    if (p.salePrice != null && p.salePrice >= 0) return Math.min(Number(p.salePrice), Number(p.price));
    if (p.discountPercent != null && p.discountPercent > 0) {
      return Math.round(p.price * (1 - p.discountPercent / 100) * 100) / 100;
    }
  }
  return Number(p.price) || 0;
}

module.exports = { effectiveProductPrice, inSaleWindow };
