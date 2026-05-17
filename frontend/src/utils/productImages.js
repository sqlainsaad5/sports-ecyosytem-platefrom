/** Primary stored image path from a product or order line item */
export function productPrimaryImagePath(product) {
  if (!product) return null;
  if (product.imagePath) return product.imagePath;
  const arr = product.images || [];
  if (!arr.length) return null;
  const i = typeof product.primaryImageIndex === 'number' ? product.primaryImageIndex : 0;
  return arr[i] || arr[0] || null;
}
