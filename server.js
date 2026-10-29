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
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }));

app.use((req, res, next) => {
  const lang = (req.query.lang === 'en' ? 'en' : (req.cookies && req.cookies.lang) || 'it');
  if (req.query.lang) res.cookie('lang', lang, { maxAge: 365 * 24 * 3600 * 1000 });
  res.locals.lang = lang === 'en' ? 'en' : 'it';
  next();
});

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/', require('./src/routes/index'));
app.use('/', require('./src/routes/newsletter'));
app.use('/api', require('./src/routes/api'));

app.use((req, res) => res.status(404).send('Pagina non trovata'));

app.use((err, req, res, next) => {
  console.error(err);
  sendAlert(`${req.method} ${req.originalUrl}`, err);
  res.status(500).send('Si è verificato un errore. Il team è stato avvisato.');
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Bussola Bandi in ascolto sulla porta ${port}`));
