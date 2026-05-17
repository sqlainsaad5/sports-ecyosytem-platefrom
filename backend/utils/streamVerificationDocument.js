const path = require('path');
const fs = require('fs');

function contentTypeForExt(ext) {
  if (ext === '.pdf') return 'application/pdf';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  return 'application/octet-stream';
}

/** Stream a verification document file to the response (path must stay under uploads/). */
function streamVerificationDocumentFile(doc, res) {
  const rel = String(doc.filePath || '').replace(/^\//, '');
  if (!rel || rel.includes('..')) {
    res.status(400).json({ success: false, message: 'Invalid file path' });
    return false;
  }
  const uploadsRoot = path.resolve(path.join(__dirname, '..', 'uploads'));
  const abs = path.resolve(path.join(__dirname, '..', rel));
  if (!abs.startsWith(uploadsRoot)) {
    res.status(400).json({ success: false, message: 'Invalid file path' });
    return false;
  }
  if (!fs.existsSync(abs)) {
    res.status(404).json({ success: false, message: 'File missing on server' });
    return false;
  }

  const ext = path.extname(abs).toLowerCase();
  const name = doc.originalName || path.basename(abs);
  res.setHeader('Content-Type', contentTypeForExt(ext));
  res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(name)}`);
  res.sendFile(abs);
  return true;
}

module.exports = { streamVerificationDocumentFile };
