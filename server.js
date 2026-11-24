require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');
const { sendAlert } = require('./src/alert');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }));

// Dati del sito letti dalle variabili d'ambiente: titolare (footer e privacy), statistiche e verifica Search Console.
app.locals.sito = {
  titolare: process.env.OWNER_NAME || '', piva: process.env.OWNER_VAT || '', indirizzo: process.env.OWNER_ADDRESS || '',
  email: process.env.CONTACT_EMAIL || '', pec: process.env.OWNER_PEC || '',
  ga4: /^G-[A-Z0-9]+$/.test(process.env.GA4_ID || '') ? process.env.GA4_ID : '', gsc: process.env.GSC_VERIFICATION || '',
  base: process.env.BASE_URL || ''
};

app.use((req, res, next) => {
  const lang = (req.query.lang === 'en' ? 'en' : (req.cookies && req.cookies.lang) || 'it');
  if (req.query.lang) res.cookie('lang', lang, { maxAge: 365 * 24 * 3600 * 1000 });
  res.locals.lang = lang === 'en' ? 'en' : 'it';
  next();
});

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/', require('./src/routes/index'));
app.use('/', require('./src/routes/newsletter'));
app.use('/', require('./src/routes/pubbliche'));
app.use('/api', require('./src/routes/api'));

// Area riservata: la sessione (cookie tecnico) esiste solo sotto /admin, i visitatori del sito non ricevono cookie di sessione.
const session = require('express-session');
const PgStore = require('connect-pg-simple')(session);
app.use('/admin', session({
  store: new PgStore({ pool: require('./src/db').pool, createTableIfMissing: true }),
  name: 'bb_admin', secret: process.env.SESSION_SECRET || require('crypto').randomBytes(32).toString('hex'),
  resave: false, saveUninitialized: false, rolling: true,
  cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/admin', maxAge: 8 * 3600 * 1000 }
}), require('./src/routes/admin'));

app.use((req, res) => res.status(404).send('Pagina non trovata'));

app.use((err, req, res, next) => {
  console.error(err);
  sendAlert(`${req.method} ${req.originalUrl}`, err);
  res.status(500).send('Si è verificato un errore. Il team è stato avvisato.');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Bussola Bandi in ascolto sulla porta ${port}`);
  require('./src/seed-fonti').seedFonti()
    .then(n => console.log('Registro fonti aggiornato:', n))
    .catch(e => { console.error(e); sendAlert('Caricamento registro fonti', e); });
  require('./src/schede').applicaSchede().catch(e => { console.error(e); sendAlert('Schede in evidenza', e); });
  require('./src/importers').pianifica();
});
