/** Ground photos — supports legacy single imagePath */
export function groundImageList(ground) {
  if (!ground) return [];
  if (Array.isArray(ground.imagePaths) && ground.imagePaths.length) {
    return ground.imagePaths.filter(Boolean);
  }
  if (ground.imagePath) return [ground.imagePath];
  return [];
}

export function groundLocationLabel(ground) {
  return ground?.location || ground?.address || ground?.city || '';
}

export function isMapUrl(value) {
  return Boolean(value && /^https?:\/\//i.test(value));
}
