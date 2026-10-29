// Modulo unico di alert errori per Bussola Bandi (standard Simone)
const { sendMail } = require('./mailer');
let lastSent = 0;
const ANTI_SPAM_MS = 30 * 60 * 1000;

async function sendAlert(context, error) {
  const now = Date.now();
  if (now - lastSent < ANTI_SPAM_MS) return;
  lastSent = now;
  const to = process.env.ALERT_EMAIL || 'info@simonescaffidi.it';
  const body = `Errore in Bussola Bandi.\n\nContesto: ${context}\n\nDettagli: ${error && error.stack ? error.stack : error}\n\nOrario: ${new Date().toISOString()}`;
  try {
    await sendMail({ to, subject: '[Bussola Bandi] Errore applicazione', text: body });
  } catch (e) {
    console.error('Impossibile inviare alert via Brevo:', e.message);
  }
}
module.exports = { sendAlert };
