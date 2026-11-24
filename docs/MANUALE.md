# Bussola Bandi - Manuale d'uso

## Per chi visita il sito
- **Bandi** (home): ricerca con filtri per destinatario, regione, settore, livello, stato (Aperto, In scadenza, In arrivo) e provincia. Ogni bando ha una scheda completa con il link al bando ufficiale.
- **Scadenze**: i bandi che chiudono nei prossimi 30, 60 o 90 giorni, in ordine di data, filtrabili per regione.
- **Simulatori**: calcolo indicativo del contributo per Nuova Sabatini, Resto al Sud 2.0, Autoimpiego Centro-Nord e credito d'imposta ZES Unica.
- **Novità dalle fonti**: avvisi, decreti e notizie su bandi pubblicati dagli enti monitorati.
- **Fonti ufficiali**: il registro di tutte le fonti controllate.
- **Newsletter**: iscrizione con filtri (destinatario, regione, settore); arriva una sola email riepilogativa quando escono bandi in linea.
- **Richiedi assistenza**: modulo presente in ogni scheda bando e in ogni simulatore.

## Per chi gestisce il sito
Tutte le API richiedono l'header `x-api-key` con il valore della variabile `INGEST_API_KEY`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `SESSION_SECRET`, `OWNER_NAME`, `OWNER_VAT`, `OWNER_ADDRESS`, `OWNER_PEC`, `CONTACT_EMAIL` (dati del titolare in footer e privacy), `GA4_ID`, `GSC_VERIFICATION`.

Il servizio non deve andare in pausa automatica (impostazione Railway "sleep" disattivata), altrimenti l'import delle 05:30 non parte.

| Cosa | Chiamata |
|---|---|
| Stato di import, fonti e segnalazioni | `GET /api/import/stato` |
| Avviare subito gli import (`?solo=incentivitalia,eu,rss,monitor`) | `POST /api/import` |
| Richieste di assistenza ricevute | `GET /api/richieste` |
| Aggiungere una fonte | `POST /api/fonti` |
| Scheda completa di un bando | `POST /api/bandi/:id/dettagli` |
| Bandi importanti ancora senza scheda | `GET /api/bandi/senza-scheda` |
| Correggere link, date, importo o testi di un bando | `POST /api/bandi/:id/correggi` |
| Togliere un bando dal sito (chiuso, doppione) con il motivo | `POST /api/bandi/:id/escludi` |
| Bandi ancora da tradurre in inglese | `GET /api/traduzioni/mancanti` |
| Salvare le traduzioni | `POST /api/traduzioni` |
| Fonti che il server non riesce a leggere | `GET /api/fonti/non-lette` |
| Verificare se un sito è raggiungibile dal server | `GET /api/probe?url=...` |

### Pagina di amministrazione
Indirizzo `/admin`. Si entra con l'email della variabile `ADMIN_EMAIL` e la password della variabile `ADMIN_PASSWORD` (si leggono e si cambiano nel pannello Railway, servizio web, scheda Variables). Dentro ci sono le richieste di assistenza (stato nuova, contattata, chiusa, con note), il numero di bandi e di iscritti, l'esito degli ultimi import e l'elenco degli iscritti alla newsletter.

### Statistiche e Google
- Google Analytics: proprietà `bussola-bandi`, ID `G-8HCHHETFKN` (variabile `GA4_ID`). Il codice parte solo se il visitatore accetta i cookie statistici.
- Search Console: proprietà verificata con tag HTML (variabile `GSC_VERIFICATION`, da non togliere). Sitemap inviata: `/sitemap.xml`.

### Cosa succede ogni giorno
1. **05:30** il sito importa l'open data Incentivi Italia e i bandi UE, legge i feed RSS, controlla la pagina bandi di ogni fonte del registro e segna quelle cambiate. Aggiunge al registro gli enti nuovi trovati nell'open data.
2. **06:17** l'agente (task pianificato Cowork) valuta le novità, legge le fonti cambiate e inserisce le schede dei bandi nuovi.
3. L'agente traduce in inglese una parte dei bandi ancora solo in italiano e scrive la scheda completa di alcuni bandi nazionali.
4. I bandi scaduti vengono chiusi; gli iscritti alla newsletter ricevono i bandi nuovi in linea con i loro filtri.

### Variabili d'ambiente
`DATABASE_URL`, `BASE_URL`, `BREVO_API_KEY`, `MAIL_FROM_EMAIL`, `MAIL_FROM_NAME`, `ALERT_EMAIL` (avvisi di errore), `LEADS_EMAIL` (destinatario delle richieste di assistenza; se manca si usa `ALERT_EMAIL`), `INGEST_API_KEY`.

### Simulatori
Regole in `src/data/simulatori.js` (campi e note) e `public/js/simulatori.js` (calcolo). Vanno ricontrollate quando cambia la normativa; la data "Regole aggiornate al" è il campo `aggiornato`.
