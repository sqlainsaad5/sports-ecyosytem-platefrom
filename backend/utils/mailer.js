const nodemailer = require('nodemailer');

let cachedTransport = null;

function getMailerConfig() {
  return {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM,
  };
}

function getTransport() {
  if (cachedTransport) return cachedTransport;
  const cfg = getMailerConfig();
  if (!cfg.host || !cfg.user || !cfg.pass || !cfg.from) {
    throw new Error('SMTP is not fully configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS, and SMTP_FROM.');
  }
  cachedTransport = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: {
      user: cfg.user,
      pass: cfg.pass,
    },
  });
  return cachedTransport;
}

async function sendMail({ to, subject, html, text }) {
  const transport = getTransport();
  const { from } = getMailerConfig();
  return transport.sendMail({ from, to, subject, html, text });
}

function isMailerConfigured() {
  const cfg = getMailerConfig();
  return Boolean(cfg.host && cfg.user && cfg.pass && cfg.from);
}

module.exports = { sendMail, isMailerConfigured };
