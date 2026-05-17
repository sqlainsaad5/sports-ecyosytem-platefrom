import { api, getErrorMessage } from '../services/api';

/** Open a verification document in a new tab (authenticated blob download). */
export async function previewVerificationDocument(fileUrl, originalName) {
  const res = await api.get(fileUrl, { responseType: 'blob' });
  const url = URL.createObjectURL(res.data);
  const w = window.open(url, '_blank', 'noopener,noreferrer');
  if (!w) {
    const a = document.createElement('a');
    a.href = url;
    a.download = originalName || 'certificate';
    a.rel = 'noopener';
    a.click();
  }
  setTimeout(() => URL.revokeObjectURL(url), 120_000);
}

export function previewVerificationDocumentError(e) {
  return getErrorMessage(e);
}
