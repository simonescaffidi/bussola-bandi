// Unico modulo email del progetto: usa SEMPRE l'API HTTP di Brevo (mai SMTP)
const BREVO_API_URL = 'https://api.brevo.com/v3';

async function brevoFetch(path, body) {
  if (!process.env.BREVO_API_KEY) throw new Error('BREVO_API_KEY mancante');
  const res = await fetch(`${BREVO_API_URL}${path}`, {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json',
      accept: 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`Brevo API ${path} -> ${res.status}: ${t}`);
  }
  return res.status === 204 ? null : res.json().catch(() => null);
}

async function sendMail({ to, subject, text, html }) {
  return brevoFetch('/smtp/email', {
    sender: { email: process.env.MAIL_FROM_EMAIL || 'info@simonescaffidi.it', name: process.env.MAIL_FROM_NAME || 'Bussola Bandi' },
    to: [{ email: to }],
    subject,
    textContent: text,
    htmlContent: html || `<pre>${text}</pre>`
  });
}

module.exports = { sendMail, brevoFetch };
