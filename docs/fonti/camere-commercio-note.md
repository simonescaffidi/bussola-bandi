# Bandi delle Camere di commercio: fonti aggregate e note operative

Rilevazione del 18/11/2026. Registro completo: `camere-commercio.json` (62 camere, 60 con pagina bandi verificata).

## 1. Fonte dell'elenco

- Elenco ufficiale Unioncamere: https://www.unioncamere.gov.it/sistema-camerale/elenco-delle-camere-di-commercio-italiane (62 camere; www.camcom.gov.it e' lo stesso sito).
- Unioni regionali: https://www.unioncamere.gov.it/sistema-camerale/elenco-delle-unioni-regionali
- Sicilia: l'elenco riporta ancora **Agrigento, Caltanissetta e Trapani come tre camere separate** (l'accorpamento del DM 21/04/2015 non e' operativo), piu' Palermo ed Enna, Messina e Sud Est Sicilia (CT-RG-SR). Sono quindi 6 voci siciliane.

## 2. Fonti centralizzate

| Fonte | URL | Cosa contiene | RSS / struttura |
|---|---|---|---|
| Punto Impresa Digitale - voucher | https://www.puntoimpresadigitale.camcom.it/bandi-incentivi/voucher-digitali | Elenco nazionale dei bandi voucher delle camere (digitale / doppia transizione), con filtro per camera ("PID erogatore"); schede sotto `/voucher/...` | HTML strutturato (Drupal). RSS generale del sito: https://www.puntoimpresadigitale.camcom.it/rss.xml (10 elementi, non solo bandi). E' la fonte unica piu' utile. |
| PID - bandi e incentivi | https://www.puntoimpresadigitale.camcom.it/paginainterna/bandi-incentivi | Pagina indice (voucher + altri incentivi digitali) | HTML |
| Unioncamere Lombardia | https://www.unioncamerelombardia.it/bandi-e-incentivi-alle-imprese | Bandi regionali e camerali lombardi; filtri `?stato=1` (in apertura), `?stato=2` (aperti), archivio `/bandi-archivio?stato=3` | HTML con parametri di filtro; nessun RSS trovato. Copre anche Milano, il cui sito blocca i bot. |
| Unioncamere Piemonte | https://pie.camcom.it/bandi-per-imprese | Bandi regionali gestiti dal sistema camerale piemontese, con stato e scadenza | HTML strutturato (stesso template `/bandi` delle camere), paginato |
| Unioncamere Emilia-Romagna | https://www.ucer.camcom.it/promozione-e-innovazione/bandi e https://www.ucer.camcom.it/internazionalizzazione-delle-imprese/bandi | Bandi regionali di sistema (poco aggiornata: ultima modifica 07/2025) | Feed elencati in https://www.ucer.camcom.it/rss-feed |
| Unioncamere Veneto | https://www.unioncamereveneto.it/attivita-e-servizi/attivita/gestione-bandi-regionali/ | Bandi regionali gestiti per conto della Regione Veneto; news sui bandi in homepage | Feed WordPress: https://www.unioncamereveneto.it/feed/ |
| Unioncamere Sicilia | https://unioncameresicilia.it/ | Notizie di sistema (SNI, progetti); nessuna sezione bandi dedicata individuata | Feed WordPress: https://unioncameresicilia.it/feed/ |
| Unioncamere Puglia | https://www.unioncamerepuglia.it/category/eventi-ed-iniziative/bandi-e-finanziamenti/ | Categoria "Bandi e gare" | Feed WordPress: https://www.unioncamerepuglia.it/feed/ (il feed di categoria `.../bandi-e-finanziamenti/feed/` e' lo standard WordPress, non provato) |
| Unioncamere Calabria | https://www.uc-cal.camcom.gov.it/P42A0C551S350/Bandi-e-Finanziamenti.htm | Bandi e finanziamenti | RSS: https://uc-cal.camcom.gov.it/rss/?sez=tab2 e `?sez=tab3` |
| Unioncamere Toscana | https://www.unioncamere-toscana.it/ | Notizie di sistema | Feed: https://www.unioncamere-toscana.it/feed/ |
| Unioncamere Sardegna | https://unioncameresardegna.it/ | Notizie di sistema | Feed: https://unioncameresardegna.it/feed/ |
| Unioncamere Campania | https://www.unioncamere.campania.it/ | Nessuna sezione bandi individuata | - |
| Unioncamere nazionale | https://www.unioncamere.gov.it/pnrr-credito-e-incentivi-alle-imprese | Misure nazionali gestite dal sistema (PID-Next, Brevetti+/Marchi+/Disegni+, parita' di genere, bandi sisma); non elenca i bandi delle singole camere | RSS notizie: https://www.unioncamere.gov.it/taxonomy/term/71/feed |
| Portale Agevolazioni | https://portaleagevolazioni.eu/ | Servizio camerale di orientamento alla finanza agevolata: ricerca bandi **dietro registrazione**, nessun elenco pubblico | Feed del sito: https://portaleagevolazioni.eu/feed/ (2 elementi, non e' un feed di bandi) |
| ReStart Infocamere | https://restart.infocamere.it/ | Piattaforma su cui le imprese inviano le domande ai bandi camerali; applicazione JavaScript con accesso SPID/CNS, nessun elenco pubblico leggibile | Non utilizzabile per lo scraping |
| Telemaco | https://webtelemaco.infocamere.it/ | Sportello pratiche ("Contributi alle imprese" richiede login) | Non utilizzabile |
| incentivi.gov.it | https://www.incentivi.gov.it/it | Catalogo MIMIT degli incentivi; molte camere lo linkano. Non raggiungibile da questo ambiente (connessione chiusa): **non verificato** se e quanto includa i bandi camerali | Da verificare |

Non esiste quindi un feed unico nazionale di tutti i bandi camerali: la copertura si ottiene con PID voucher + Unioncamere regionali + le 62 pagine.

## 3. Come leggere i siti delle camere

- **Template Infocamere (Drupal)**: molte camere hanno `/bandi` con stato (Aperto / In rendicontazione / Chiuso), scadenza e feed `/bandi/rss.xml`. Feed bandi con contenuti reali: Alessandria-Asti, Bergamo, Cagliari-Oristano, Cremona-Mantova-Pavia, Ferrara-Ravenna, Firenze, Frosinone-Latina, Irpinia Sannio, Maremma e Tirreno, Molise, Riviere di Liguria, Messina (misto a gare).
- **Attenzione ai `/bandi` vuoti o di test**: la pagina esiste ma non e' usata a Palermo-Enna, Napoli, Salerno, Brescia, Caserta, Arezzo-Siena, Basilicata, Monte Rosa; contiene solo dati di prova a Trapani e Sassari. Nel JSON e' indicata la pagina realmente usata.
- **Feed generali** `/rss.xml` (notizie) presenti su quasi tutti i siti Drupal; feed Atom su Emilia, Genova, Marche, Modena, Padova, Umbria, Verona; `/feed/` WordPress su Agrigento e Catanzaro-Crotone-Vibo.
- **Siti che bloccano i client automatici**: Milano (Imperva/Incapsula, serve browser headless), Chieti Pescara e Como-Lecco (reset della connessione da IP datacenter). Verona e' resa via JavaScript: usare l'API `++api++`.
- **Sicilia**: nessuna camera siciliana ha un elenco bandi strutturato affidabile. Palermo-Enna e Trapani pubblicano i bandi dentro la sezione PID, Sud Est Sicilia nella pagina "Voucher Digitali", Agrigento nella sezione Promozione, Caltanissetta in "Bandi in corso", Messina in `/bandi` (misto a gare). Conviene controllare anche homepage/notizie e incrociare con l'elenco voucher PID filtrato per camera.

## 4. Tipologie ricorrenti di bandi camerali (per la categorizzazione)

1. **Digitale / doppia transizione**: Voucher digitali I4.0, Bando Voucher Doppia Transizione (digitale ed ecologica), voucher AI, cybersecurity, PID-Next. E' il bando piu' diffuso, quasi in ogni camera.
2. **Transizione energetica e sostenibilita'**: efficientamento energetico/idrico, fotovoltaico, report di sostenibilita', ESG, economia circolare.
3. **Internazionalizzazione ed export**: voucher internazionalizzazione, digital export, progetto SEI, incontri d'affari all'estero.
4. **Fiere**: contributi per fiere in Italia e all'estero, voucher fieristici (spesso a semestre o a finestre).
5. **Formazione e lavoro**: bando Formazione Lavoro, percorsi scuola-lavoro (PCTO), certificazione delle competenze, borse ITS Academy, occupazione giovanile, tirocini.
6. **Turismo**: bando/voucher turismo, ospitalita' italiana, marketing territoriale, prodotti tipici.
7. **Certificazioni**: parita' di genere (UNI/PdR 125), conciliazione vita-lavoro, certificazioni di qualita'/ambientali, societa' benefit.
8. **Credito e finanza**: abbattimento tassi, accesso al credito, confidi, finanza innovativa, servizi di finanza d'impresa.
9. **Nuova impresa e start-up**: bando nuova impresa, start-up, imprese giovanili e femminili, aree interne ("restanza").
10. **Sicurezza e commercio di prossimita'**: videosorveglianza/antirapina, distretti del commercio, centri commerciali naturali, temporary shop.
11. **Proprieta' industriale**: Brevetti+, Marchi+, Disegni+ (misure MIMIT/Unioncamere rilanciate da tutte le camere: da deduplicare), fondo EUIPO PMI.
12. **Contributi a enti terzi e associazioni**: cofinanziamento di iniziative promozionali, patrocini (non rivolti alle imprese: valutare se escluderli).
13. **Emergenze e ristori**: eventi calamitosi, bradisismo, sisma.
14. **Premi e concorsi**: premi innovazione, impresa storica, fedelta' al lavoro (non sono contributi: categoria separata).

Da filtrare perche' non sono contributi: bandi di gara, concorsi per il personale, esami abilitanti, revisione di albi e ruoli, avvisi su orari e chiusure.
