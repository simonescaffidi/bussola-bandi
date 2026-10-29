# Bussola Bandi

Portale pubblico di bandi, voucher e finanziamenti europei, nazionali e regionali per cittadini e imprese italiane (comprese quelle non ancora costituite). Responsive, bilingue IT/EN, conforme GDPR, con newsletter per filtro personalizzato.

## Stack
Node 20 + Express 5 + EJS + CSS vanilla, PostgreSQL (driver pg), email transazionali via API Brevo, deploy su Railway.

## Sviluppo locale
```
npm install
cp .env.example .env
npm run migrate
npm run seed
npm start
```

## Endpoint di ingestione
Il task pianificato giornaliero (Cowork) invia i bandi trovati a POST /api/ingest con header x-api-key: INGEST_API_KEY e body {"bandi":[...]}. I nuovi bandi attivano l'invio automatico ai iscritti alla newsletter i cui filtri corrispondono.

## Pagine
- / — ricerca bandi con filtri (destinatario, regione, provincia, settore)
- /canali — elenco fonti ufficiali monitorate
- /newsletter — iscrizione newsletter con filtri personalizzati
- /privacy — informativa privacy/cookie GDPR

Powered by www.simonescaffidi.it
