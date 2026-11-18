# Bussola Bandi — Ricerca su aggregatori di bandi e fonti dati

Data della verifica: 18/11/2026. Legenda: **[V]** = visto funzionare direttamente (risposta scaricata e letta); **[D]** = visto documentato su pagina ufficiale ma non scaricato; **[NV]** = non verificato.

Nota di metodo: molti siti .gov.it (incentivitalia.gov.it, mimit.gov.it, italiadomani.gov.it, opencoesione.gov.it, opservice.regione.basilicata.it) **rifiutano la connessione dal server cloud usato per la ricerca** (connection reset / 403) e sono stati verificati dal browser sul Mac (IP italiano). Non è verificato se rispondono dai server Railway: va provato prima di costruirci sopra (vedi "Rischi").

---

## 1. Conclusione: le fonti da acquisire in automatico, in ordine di resa

| # | Fonte | URL esatto | Formato | Copertura | Stato |
|---|---|---|---|---|---|
| 1 | **Incentivi Italia (ex incentivi.gov.it + RNA) — Open Data Incentivi** | `https://www.incentivitalia.gov.it/open-data/incentivi/OpenData_Incentivi.json` (28,7 MB) e `.../OpenData_Incentivi.csv` (19,1 MB) | JSON array / CSV, file unico | 6.095 schede incentivo di 1.678 soggetti concedenti: ministeri, regioni, province autonome, CCIAA, comuni, altri enti. ~768 risultano aperte oggi | **[V]** |
| 2 | **EU Funding & Tenders Portal — Search API** | `POST https://api.tech.ec.europa.eu/search-api/prod/rest/search?apiKey=SEDIA&text=***&pageSize=50&pageNumber=1` | JSON, senza login | Tutti i bandi UE a gestione diretta: 1.187 tra aperti (589) e in arrivo (598) | **[V]** |
| 3 | **Italia Domani (PNRR) — feed RSS bandi** | `https://www.italiadomani.gov.it/content/sogei-ng/it/it/feed-rss.makers_notices_feed_rss.xml` (Amministrazioni titolari) e `.../feed-rss.recipients_notices_feed_rss.xml` (Soggetti attuatori) | RSS 2.0 | Bandi e avvisi PNRR; il primo feed contiene 392 item | **[V]** il primo; **[D]** il secondo |
| 4 | **MIMIT — RSS incentivi** | `https://www.mimit.gov.it/it/incentivi?format=feed&type=rss` (anche `type=atom`) | RSS/Atom, 10 item | Nuove misure e aggiornamenti degli incentivi MIMIT (ultimo: 17/11/2026) | **[V]** |
| 5 | **Invitalia — RSS** | `https://www.invitalia.it/rss.xml` | RSS, 10 item | Schede "incentivi e strumenti" Invitalia (Brevetti+, Bonus colonnine, ecc.) | **[V]** |
| 6 | **Portali regionali con dati strutturati** | Lombardia: `https://www.dati.lombardia.it/resource/bukx-h2uy.json` · Lazio: `https://www.lazioeuropa.it/wp-json/wp/v2/bandi` e `https://www.lazioeuropa.it/bandi/feed/` · Piemonte: `https://bandi.regione.piemonte.it/rss.xml` · Sicilia: `https://www.regione.sicilia.it/rss.xml` e `https://www.euroinfosicilia.it/feed/` · Calabria: `https://calabriaeuropa.regione.calabria.it/feed/` | API Socrata JSON / WP REST JSON / RSS | Bandi regionali (vedi dettaglio §3.7) | **[V]** |
| 7 | **Gazzetta Ufficiale — RSS** | `https://www.gazzettaufficiale.it/rss/SG` (Serie Generale); anche `/rss/S1`…`/rss/S5` | RSS | Decreti istitutivi e attuativi di incentivi. Molto rumore: serve filtro per parole chiave | **[V]** |
| 8 | **OpenCoesione — elenco opportunità 2021-2027** | `https://opencoesione.gov.it/it/opportunita_2021_2027/` | Pagina HTML di link (non dataset) | Indice ufficiale delle pagine "opportunità" e "preavvisi" di ogni Autorità di Gestione (PR FESR/FSE+ di tutte le regioni, PN, Interreg): è la **lista di semina** per gli scraper regionali | **[V]** |

Fonti complementari per il terzo settore/fondazioni (RSS **[V]**): `https://infobandi.csvnet.it/feed/`, `https://www.fondazioneconilsud.it/feed/`, `https://www.compagniadisanpaolo.it/it/feed/`, `https://www.cantiereterzosettore.it/feed/`.

### Indicazione operativa
La fonte n. 1 da sola porta Bussola Bandi a circa 770 misure aperte, già con regione, beneficiari, forma di agevolazione, importi, date e link istituzionale: è lo stesso catalogo che usano di fatto tutti i concorrenti come base. Le fonti 2-5 sono poche righe di codice ciascuna. Il vero differenziale dei concorrenti a pagamento è la parte che **non** esiste in formato aperto (comuni, GAL, fondazioni, CCIAA minori), che loro coprono con redazione umana + scraping di centinaia di siti.

---

## 2. Aggregatori concorrenti

| Sito | Copertura | Prezzo | Quanti bandi | Come raccoglie i dati | RSS / API / dataset |
|---|---|---|---|---|---|
| **Incentivi Italia** (incentivitalia.gov.it; incentivi.gov.it ora reindirizza qui) | Nazionale, regionale, CCIAA, comuni; solo misure di enti pubblici | Gratis | 6.095 schede nel dataset, ~768 aperte **[V]** | Caricamento obbligatorio da parte delle amministrazioni (portale nato dalla fusione RNA + incentivi.gov.it prevista dal Codice degli incentivi, D.Lgs. 184/2025) | Open data JSON/CSV/XML, CC BY 4.0 **[V]**; nessun RSS trovato |
| **Granter** (granter.it) | Terzo settore: bandi pubblici, fondazioni, aziende donatrici | A pagamento, 4 piani (Basic, Plus, Pro, Expert), prova 14 giorni; prezzi non mostrati in pagina | Numero non dichiarato; dichiara 3,7 mld € di opportunità e 16 tipologie | Dichiarato nelle FAQ: team che ricerca e valida, più strumenti automatici | Nessuno trovato (`/feed/` restituisce HTML) |
| **Contributi Europa** (contributieuropa.com) | Imprese: nazionale, regionale, CCIAA, fondazioni | Freemium: gratis con ricerche limitate; Premium 69 €/anno, Professional 249 €/anno | 14.742 schede in archivio (aperte + scadute) **[V]** | Redazione: schede scritte a mano con titolo standardizzato; pubblicazione quotidiana | Nessun RSS (`/feed/` dà errore 500). L'archivio WordPress è però leggibile da `https://www.contributieuropa.com/wp-json/wp/v2/bandi` **[V]** (con tassonomie area_geografica, beneficiari, settore, agevolazione) |
| **FASI** (fasi.eu) | UE, nazionale, regionale; taglio giornalistico | Iscrizione gratuita + piani a pagamento; piano "National" 120 €/mese + IVA **[V]** | Non dichiarato | Redazione giornalistica (sede Roma) | Nessun RSS trovato. API bandi offerta su richiesta commerciale ("Vuoi accedere ai bandi attraverso un endpoint API? Contattaci") |
| **Obiettivo Europa** (obiettivoeuropa.com) | UE, nazionale, PNRR, regionale/locale, fondazioni | A pagamento, prova 7 giorni; risultati oltre i primi solo per abbonati | 892 bandi aperti, oltre 200 nuovi al mese, oltre 800 enti monitorati (dichiarato in home) | Progettisti che selezionano e sintetizzano; aggiornamento quotidiano | Nessuno (`/feed/` 404) |
| **Trovabando** (trovabando.it) | Imprese: ministeri, regioni, CCIAA, UE | Freemium: prima selezione gratis, elenco completo a pagamento | Non dichiarato; "oltre 210 enti erogatori" | Database proprietario con matching sul profilo aziendale; metodo non descritto | RSS del solo blog `https://www.trovabando.it/feed/` **[V]** (2 item); il database non è esposto |
| **Italia Contributi** (italiacontributi.it) | Imprese, per regione/settore/beneficiario | Consultazione gratuita; guadagna con la consulenza | Non dichiarato | Redazionale, studio di consulenza | Nessuno (`/feed/` 403). Presenti testi promozionali estranei (gioco online): qualità dubbia |
| **InfoBandi CSVnet** (infobandi.csvnet.it) | Volontariato e terzo settore: fondazioni, UE, 8x1000, enti pubblici | Gratis | Piccolo: 60 post totali, 6 bandi attivi in home **[V]** | Redazione CSVnet + modulo "Segnala un bando" | RSS `https://infobandi.csvnet.it/feed/` **[V]** (10 item) |
| **Contributi Regione** (contributiregione.it, bandi.contributiregione.it) | Imprese, 20 regioni + nazionale | Consultazione gratuita, area login e app; guadagna con la consulenza (Europrofessional srl, Pesaro) | Non dichiarato | Redazionale | RSS del blog `https://www.contributiregione.it/feed/` **[V]** (ultimo post luglio 2026: poco aggiornato); la banca dati su sottodominio non ha feed |
| **Europa Facile** (europafacile.net, ART-ER Emilia-Romagna) | Solo UE: programmi, bandi, politiche | Gratis | Non dichiarato; ultima news 06/10/2026 | Redazione ART-ER (attivo dal 1998) | Nessun feed trovato in pagina |
| **Guida Incentivi** (guidaincentivi.it) | Bonus per cittadini e famiglie (casa, bollette, figli, ISEE) | Gratis, con pubblicità | ~100 articoli | Articoli redazionali (gruppo editoriale Gubitosa) | RSS `https://www.guidaincentivi.it/feed/` **[V]** |
| **Europa Innovazione** (europainnovazione.com) — trovato in più | Bandi UE | Gratis | — | Redazionale, aggiornamento quotidiano | RSS `https://www.europainnovazione.com/feed/` **[V]** |
| **BandiRadar** (open source, MIT) — trovato in più | Motore che unifica 19 fonti italiane | Gratis il core | Non dichiarato | 9 connettori diretti (incentivi.gov.it, TED, ANAC, dati.lombardia.it, lazioinnova.it, euroinfosicilia.it, Emilia-Romagna, dati.trentino.it) + 10 scraper regionali assistiti da LLM | Pacchetto Python + server MCP. Visto solo nella scheda su glama.ai, codice **[NV]** |

**Cosa si ricava dai concorrenti**
- Nessuno pubblica dati riusabili, tranne il portale pubblico. Tutti i privati partono dalle stesse fonti ufficiali e aggiungono lavoro redazionale.
- I due numeri dichiarati sul perimetro di monitoraggio: Obiettivo Europa oltre 800 enti, Trovabando oltre 210 enti. È l'ordine di grandezza della lista di siti da sorvegliare per essere competitivi.
- I contenuti dei concorrenti (schede di Contributi Europa, ecc.) sono testi protetti da diritto d'autore e da diritto sulle banche dati: si possono usare come **segnale di scoperta** (accorgersi che è uscito un bando e poi andare alla fonte ufficiale), non copiare.

---

## 3. Fonti ufficiali leggibili da macchina — dettaglio

### 3.1 Incentivi Italia (ex incentivi.gov.it) **[V]**
- `https://www.incentivi.gov.it/it/open-data` reindirizza a `https://www.incentivitalia.gov.it/`. Pagina open data: `https://www.incentivitalia.gov.it/open-data`.
- Dataset incentivi: `/open-data/incentivi/OpenData_Incentivi.json` e `.csv`. Header `Last-Modified: 12/11/2026 04:02 GMT`. La pagina dichiara **aggiornamento giornaliero**; il catalogo dati.gov.it lo marca mensile; il file visto era fermo da 6 giorni.
- Licenza: **CC BY 4.0** (uso commerciale consentito, con attribuzione).
- Metadati: `https://www.incentivitalia.gov.it/sites/default/files/2026-10/Metadati_Scheda_Incentivi_Italia_0.docx` **[D]**.
- Campi principali: `idBando`, `ID_Incentivo`, `Titolo`, `Descrizione`, `Data_apertura`, `Data_chiusura`, `Note_di_apertura_chiusura`, `Link_istituzionale` (presente nel 100% dei record), `Soggetto_Concedente`, `Amministrazione_responsabile`, `Regioni`, `Comuni`, `Tipologia_Soggetto`, `Dimensione_beneficiari`, `Forma_agevolazione`, `Settore_Attivita`, `Codici_ATECO`, `Obiettivo_Finalita`, `Costi_Ammessi`, `Stanziamento_incentivo`, `Spesa_Ammessa_Min/Max`, `Agevolazione_Concedibile_Min/Max`, `Base_normativa_primaria`.
- Numeri calcolati sul file: 6.095 record; per anno di apertura 2023: 980, 2024: 1.754, 2025: 1.698, 2026: 1.015. Aperti al 18/11/2026: 768 (di cui 546 con data di chiusura) — Regioni/Province autonome 437, CCIAA 80, Comuni 70, Ministeri 54, altri 127. Forma: fondo perduto 700, prestito 97, garanzia 59.
- Limiti: quasi tutto rivolto a imprese (683 su 768); pochi bandi per cittadini. Il file intero non si scarica in un colpo dal browser (errore), ma a blocchi con header `Range` sì: prevedere download a blocchi o con ripresa.
- Nessuna API di ricerca documentata; nessun RSS.

### 3.2 Registro Nazionale Aiuti (RNA) **[V]**
- Ora dentro Incentivi Italia. Misure: `https://www.incentivitalia.gov.it/open-data/misure`, file mensili `https://www.incentivitalia.gov.it/open-data/misura/OpenData_Misura_AAAA_MM.xml` (+ `.zip`), 214 file; scaricato e letto `OpenData_Misura_2026_11.xml` (196 KB). Aggiornamento settimanale (ultimo 17/11/2026).
- Aiuti individuali: `https://www.incentivitalia.gov.it/open-data/aiuti`, file `.../open-data/aiuti/OpenData_Aiuti_AAAA_MM.xml`, 114 file **[D]**.
- Campi misura: `CAR`, `TITOLO_MISURA`, `DES_AUTORITA`, `LINK_AIUTO`, `DATA_INIZIO_MISURA`, `DATA_FINE_MISURA`, `DES_TIPO_MISURA` (regime / aiuto ad hoc), settori NACE, aree, strumenti, dotazioni.
- Utilità per Bussola Bandi: **media-bassa**. Registra i regimi di aiuto (base giuridica), non i bandi con scadenza; contiene molti aiuti ad hoc a singoli beneficiari. Utile come segnale anticipato ("è stato registrato un nuovo regime → arriverà un bando") e per trovare enti concedenti non presenti altrove.

### 3.3 EU Funding & Tenders **[V]**
- `POST https://api.tech.ec.europa.eu/search-api/prod/rest/search?apiKey=SEDIA&text=***&pageSize=N&pageNumber=N`, corpo multipart con `query` (JSON) e `languages` (`["en"]`).
- Filtro provato: `{"bool":{"must":[{"terms":{"type":["1","2","8"]}},{"terms":{"status":["31094501","31094502"]}}]}}` → 1.187 risultati (31094501 = in arrivo: 598; 31094502 = aperti: 589).
- Campi: `identifier`, `title`, `callTitle`, `status`, `startDate`, `deadlineDate`, `frameworkProgramme`, `budget`, `description`, `url`.
- Senza filtro restituisce 4,3 milioni di documenti (anche eventi, notizie): il filtro è obbligatorio. Testi in inglese.
- Nessuna documentazione ufficiale dell'endpoint letta direttamente: è l'API usata dal portale stesso, stabile ma non garantita.

### 3.4 PNRR Italia Domani **[V]**
- Catalogo open data: `https://www.italiadomani.gov.it/content/sogei-ng/it/it/catalogo-open-data.html` — 66 dataset CSV, licenza CC BY 4.0, ma riguardano **progetti, soggetti, gare, indicatori**. **Non esiste un dataset "bandi e avvisi"** tra quelli visti in prima pagina.
- I bandi sono esposti via RSS (elenco feed: `https://www.italiadomani.gov.it/content/sogei-ng/it/it/feed-rss.html`): Notizie, Documenti, Bandi Amministrazioni Titolari, Bandi Soggetti Attuatori.
- Attenzione: il feed contiene anche avvisi di selezione di esperti/personale (item più recente: 05/06/2026): va filtrato. Il PNRR è in chiusura, quindi fonte in esaurimento.
- Collegato: `https://raw.githubusercontent.com/teamdigitale/padigitale2026-opendata/main/data/avvisi.csv` **[V]** (avvisi PA digitale 2026 per comuni/scuole, con stato e importi).

### 3.5 OpenCoesione e dati.gov.it **[V]**
- OpenCoesione: licenza CC BY 4.0. Dataset "Opportunità di finanziamento 2014-2020": `https://opencoesione.gov.it/media/opendata/opportunita_2014_2020.csv` (666 KB, campi ID, programma, fondo, date, oggetto, importo, beneficiari, link) ma `Last-Modified` 30/06/2020: **storico, inutile per bandi aperti**.
- Per il 2021-2027 non c'è CSV (`opportunita_2021_2027.csv` → 404): solo la pagina di link alle Autorità di Gestione (fonte n. 8).
- API OpenCoesione (`/it/api-opencoesione/`): riguarda i progetti finanziati, non i bandi **[D]**.
- dati.gov.it: API CKAN funzionante `https://www.dati.gov.it/opendata/api/3/action/package_search?q=...` **[V]**. Dataset utili trovati:
  - "Open Data Incentivi" (MIMIT) → è la fonte n. 1.
  - Regione Lombardia "Anagrafica dei bandi regionali".
  - Regione Basilicata "Avvisi e Bandi pubblici": `https://opservice.regione.basilicata.it/opendata/dataset/bando.json` / `.csv` e `avvisopubblico.json` **[NV]** (connessione rifiutata dal cloud).
  - Provincia di Trento "Calendario avvisi – Bandi FEASR" (Google Sheet CSV) **[NV]**.
  - GAL Terra dei Messapi: `https://terradeimessapi.it/eventi-2/feed/` **[NV]**.
  - Il resto dei risultati per "bandi" sono gare d'appalto e concorsi, non contributi.

### 3.6 RSS ministeri e agenzie
- MIMIT incentivi **[V]** (vedi tabella); MIMIT notizie `https://www.mimit.gov.it/it/notizie-stampa?format=feed&type=rss` **[V]**. `https://www.mimit.gov.it/it/rss` è una pagina HTML, non un feed.
- Invitalia `https://www.invitalia.it/rss.xml` **[V]**.
- Gazzetta Ufficiale `/rss/SG`, `/rss/S1`-`/rss/S5` **[V]** (S4 = concorsi, non utile).
- Ministero del Turismo `https://www.ministeroturismo.gov.it/feed/` **[V]**; Unioncamere `https://www.unioncamere.gov.it/rss.xml` **[V]** (notizie generali).
- Nessun feed trovato agli indirizzi provati per: Lavoro, MUR, MASE, Cultura, INAIL, ISMEA, SIMEST (feed vuoto), Sport e Salute.

### 3.7 Portali regionali
| Regione | URL | Formato | Note |
|---|---|---|---|
| Lombardia | `https://www.dati.lombardia.it/resource/bukx-h2uy.json` (CSV: `/api/views/bukx-h2uy/rows.csv?accessType=DOWNLOAD`) | API Socrata | **[V]** 1.934 righe, CC BY 4.0, aggiornamento mensile (ultimo 01/10/2026). Campi: codice, titolo, ente, apertura, chiusura, tipo strumento. Include anche concorsi: filtrare su `tipo_strumento`. Manca il link alla scheda |
| Lazio | `https://www.lazioeuropa.it/wp-json/wp/v2/bandi` e `https://www.lazioeuropa.it/bandi/feed/` | WP REST JSON / RSS | **[V]** 983 bandi, con tassonomie fondi, destinatari, enti, aree, tipologie-agevolazioni; ultimo 12/11/2026 |
| Piemonte | `https://bandi.regione.piemonte.it/rss.xml` | RSS | **[V]** 10 item, ma l'ultimo è del 03/08/2026 e riguarda preinformazioni: copertura parziale |
| Sicilia | `https://www.regione.sicilia.it/rss.xml`, `https://www.euroinfosicilia.it/feed/` | RSS | **[V]** feed generali (notizie + avvisi + atti): filtro per parole chiave necessario |
| Calabria | `https://calabriaeuropa.regione.calabria.it/feed/`, `https://www.regione.calabria.it/feed/` | RSS | **[V]** |
| Basilicata | `https://opservice.regione.basilicata.it/opendata/dataset/bando.json` | JSON/CSV | **[NV]** |
| Emilia-Romagna | `https://bandi.regione.emilia-romagna.it/` | Solo HTML | Nessun RSS agli indirizzi provati |
| Toscana, Veneto, Marche, FVG, Liguria, Sardegna, VdA, Lazio (sito regione) | — | Solo HTML | Nessun feed agli indirizzi provati; servono scraper |
| Campania, Puglia, Abruzzo, Umbria, Molise | — | — | **[NV]** (non raggiungibili dal cloud) |

---

## 4. Rischi e punti aperti
1. **Raggiungibilità da Railway**: i siti .gov.it sopra indicati hanno chiuso la connessione dal server cloud di questa ricerca. Se accade anche da Railway serve un proxy/uscita con IP italiano. Non verificato.
2. **Freschezza della fonte n. 1**: dichiarata giornaliera, file visto vecchio di 6 giorni. Tenere comunque RSS MIMIT/Invitalia come canale veloce.
3. **Scadenze mancanti**: 222 delle 768 misure "aperte" non hanno data di chiusura (misure a sportello o dato non compilato).
4. **Buco strutturale**: bandi per cittadini, comuni, GAL e fondazioni non hanno fonti aperte centralizzate. È il lavoro che i concorrenti fanno a mano.
5. L'endpoint UE non ha garanzie contrattuali; apiKey `SEDIA` è quella pubblica del portale.
