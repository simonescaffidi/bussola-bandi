# GAL e FLAG/GALPA d'Italia - fonti ufficiali e note (rilevazione 18/11/2026)

File dati: `gal.json` (235 voci: 203 GAL + 32 FLAG/GALPA; 206 siti aperti e verificati, 159 con pagina bandi individuata).

## 1. Elenchi nazionali dei GAL

| Fonte | URL | Periodo | Scaricabile? |
|---|---|---|---|
| Rete PAC (ex Rete Rurale) - "I GAL selezionati in Italia - Programmazione 2023-2027" | https://www.reterurale.it/flex/cm/pages/ServeBLOB.php/L/IT/IDPagina/27580 | 2023-2027, 199 GAL, dati a marzo 2026 | No (nessun Excel/CSV/JSON). Solo HTML: una pagina per regione (`.../IDPagina/<id>`, id sotto) con nome GAL + link al sito. Facile da leggere con uno scraper. E' la fonte usata per `gal.json`. |
| GeoGAL (CREA / Rete Leader) | https://geogal.crea.gov.it/ | 2014-2022, 200 GAL | Parziale: tabelle con pulsanti copia/CSV/Excel lato browser; scheda per GAL `default.asp?i=0&p=gal&gal=<id>` (telefono, email, sito); poligoni in `https://geogal.crea.gov.it/shape/gal2.geo.json` (GeoJSON, solo nome e geometria). Non aggiornato al 2023-2027 e diversi siti indicati sono ormai morti o passati ad altri (domini scaduti). |
| EU CAP Network - LAG Directory | https://eu-cap-network.ec.europa.eu/networking/leader/lag-directory_en | 2023-2027, tutta la UE | No export. La ricerca filtrata per paese (`.../lag-directory/search_en?f[0]=country:20` = Italia) e' vietata ai robot da robots.txt e risponde 403 agli accessi automatici; la mappa usa `/lag-directory/lag-locations.json_en` (GeoJSON con nome e id, 50 punti per chiamata, limite di frequenza 429). Non adatta a un job giornaliero. |
| Rete PAC - "I bandi Leader dei GAL italiani" | https://www.reterurale.it/leader/bandigal | archivio | Pagina storica: le voci lette sono del 2014-2015, non serve come fonte corrente. |

Pagine regionali dell'elenco Rete PAC 2023-2027 (numero GAL in elenco):

- Abruzzo (8): https://www.reterurale.it/flex/cm/pages/ServeBLOB.php/L/IT/IDPagina/27383
- Basilicata (5): https://www.reterurale.it/flex/cm/pages/ServeBLOB.php/L/IT/IDPagina/27385
- Calabria (13): https://www.reterurale.it/flex/cm/pages/ServeBLOB.php/L/IT/IDPagina/27532
- Campania (15): https://www.reterurale.it/flex/cm/pages/ServeBLOB.php/L/IT/IDPagina/27533
- Emilia-Romagna (6): https://www.reterurale.it/flex/cm/pages/ServeBLOB.php/L/IT/IDPagina/27534
- Friuli Venezia Giulia (5): https://www.reterurale.it/flex/cm/pages/ServeBLOB.php/L/IT/IDPagina/27535
- Lazio (16): https://www.reterurale.it/flex/cm/pages/ServeBLOB.php/L/IT/IDPagina/27536
- Liguria (4): https://www.reterurale.it/flex/cm/pages/ServeBLOB.php/L/IT/IDPagina/27538
- Lombardia (15): https://www.reterurale.it/flex/cm/pages/ServeBLOB.php/L/IT/IDPagina/27539
- Marche (6): https://www.reterurale.it/flex/cm/pages/ServeBLOB.php/L/IT/IDPagina/27547
- Piemonte (14): https://www.reterurale.it/flex/cm/pages/ServeBLOB.php/L/IT/IDPagina/27548
- Provincia Autonoma di Bolzano (6): https://www.reterurale.it/flex/cm/pages/ServeBLOB.php/L/IT/IDPagina/27549
- Provincia Autonoma di Trento (1): https://www.reterurale.it/flex/cm/pages/ServeBLOB.php/L/IT/IDPagina/27550
- Puglia (23): https://www.reterurale.it/flex/cm/pages/ServeBLOB.php/L/IT/IDPagina/27551
- Sardegna (17): https://www.reterurale.it/flex/cm/pages/ServeBLOB.php/L/IT/IDPagina/27555
- Sicilia (23): https://www.reterurale.it/flex/cm/pages/ServeBLOB.php/L/IT/IDPagina/27569
- Toscana (7): https://www.reterurale.it/flex/cm/pages/ServeBLOB.php/L/IT/IDPagina/27571
- Umbria (5): https://www.reterurale.it/flex/cm/pages/ServeBLOB.php/L/IT/IDPagina/27572
- Valle d'Aosta (1): https://www.reterurale.it/flex/cm/pages/ServeBLOB.php/L/IT/IDPagina/27573
- Veneto (9): https://www.reterurale.it/flex/cm/pages/ServeBLOB.php/L/IT/IDPagina/27574
- Molise: selezione dei GAL 2023-2027 "non ancora conclusa" secondo Rete PAC. In `gal.json` ci sono i 4 GAL molisani 2014-2022 presi da GeoGAL (Alto Molise, Innova Plus, Molise Rurale, Molise verso il 2000), da riverificare.

Differenze rispetto al 2014-2022 notate: Lazio passa a 16 GAL (nuovi: Anius Pregius, Etruria Meridionale, Monti Lepini, Terre Sabine e Tiburtine, Tuscia, Versante Laziale PNA; confermato anche dalla graduatoria regionale DD G16088 del 30/11/2023); Lombardia 15 (nuovi: Lario Ceresio, Sebino Valle Camonica, Valle Trompia Bee Green Valley); Liguria 4 (non compare piu' il GAL Genovese); Trento 1 (solo Trentino Orientale; il vecchio dominio del GAL Trentino Centrale oggi ospita un sito estraneo); Abruzzo 8 (Gran Sasso Laga e Marsica al posto di Terre d'Abruzzo e Terre Aquilane); Toscana: Terre Etrusche al posto di Etruria.

## 2. Sicilia (23 GAL, elenco completo e verificato su tre fonti)

- Elenco ufficiale regionale con scheda per GAL: https://svilupporurale.regione.sicilia.it/gal/
- Graduatoria definitiva SRG06 (Allegato A al DRS 6408 del 1/12/2023): 23 GAL ammessi, gli stessi dell'elenco. Copia letta: https://www.galterrediaci.com/wp-content/uploads/2025/02/SRG06-All-A-graduatoria-def_6408_20231201firmato.pdf
- Nomi: Elimos, Eloro, Etna, Etna Sud, Golfo di Castellammare, ISC Madonie, Kalat, Metropoli Est, Natiblei, Nebrodi Plus, Rocca di Cerere Geopark, Sicani, Sicilia Centro Meridionale, Taormina Peloritani, Terra Barocca, Terre del Nisseno, Terre dell'Etna e dell'Alcantara, Terre di Aci, Terre Normanne, Tirrenico Mare Monti e Borghi, Tirreno Eolie, Valle del Belice, Valli del Golfo.
- Non esiste un GAL "Madonie" distinto da "ISC Madonie" (stesso soggetto, sito madoniegal.it); "Peloritani" oggi si chiama Taormina Peloritani.
- Tirreno Eolie: il sito galtirrenoeolie.it non rispondeva (503 / connessione chiusa), quindi non verificato. Rocca di Cerere: sito aperto ma senza una pagina bandi dedicata (avvisi in home page).

### Pubblicazione centralizzata in Sicilia
- Notizie e avvisi di tutti i GAL: https://svilupporurale.regione.sicilia.it/categoria/ultime-dai-gal/ - con feed RSS: https://svilupporurale.regione.sicilia.it/categoria/ultime-dai-gal/feed/ (la fonte piu' comoda per il job giornaliero).
- Bandi regionali CSR/PSP: https://svilupporurale.regione.sicilia.it/bandi-aperti/ e https://svilupporurale.regione.sicilia.it/bandi-chiusi/

## 3. Pagine regionali LEADER / GAL (indicate da Rete PAC come fonte regionale)
Non le ho aperte una per una, salvo Sicilia: vanno considerate "da verificare" come punti di raccolta bandi.

- Abruzzo: https://www2.regione.abruzzo.it/agricoltura/pac-2023-2027/elenco-interventi/intervento-srg06-leader-attuazione-strategie-sviluppo
- Basilicata: https://basilicatacsr.it/csr-basilicata-2023-27/leader/documentazione-di-riferimento/?cp=2
- Calabria: https://www.calabriapsr.it/leader
- Campania: https://agricoltura.regione.campania.it/CSR_2023-2027/SRG06.html#GAL
- Emilia-Romagna: https://agricoltura.regione.emilia-romagna.it/sviluppo-rurale-23-27/programma/interventi/leader-2023-2027/selezione-gal
- Friuli Venezia Giulia: https://europa.regione.fvg.it/it/programmi-36605/piano-strategico-della-politica-agricola-comune-2023-2027-del-friuli-venezia-giulia-39986/srg06-leader-attuazione-delle-strategie-di-sviluppo-locale-del-complemento-per-lo-sviluppo-rurale-csr-della-regione-autonoma-friuli-venezia-giulia-al-piano-strategico-pac-2023-2027-79808
- Lazio: il link riportato da Rete PAC e' sbagliato (punta alla pagina della Campania). Pagina regionale Lazio non individuata; la graduatoria e' in https://regione.lazio.it/sites/default/files/documentazione/AMB-DD-G16088-30-11-2023.pdf
- Liguria: https://www.agriligurianet.it/en/impresa/sostegno-economico/programma-di-sviluppo-rurale-psr-liguria/csr-2023-2027/gal.html
- Lombardia: https://ue.regione.lombardia.it/bando/RLM12024038803
- Marche: https://contenuti.regione.marche.it/Entra-in-Regione/CSR-Marche-2023-2027/Bandi/id_41153/6945
- Piemonte: https://www.regione.piemonte.it/governo/bollettino/abbonati/2023/49/attach/dda1610000939_10300.pdf
- Provincia Autonoma di Bolzano: https://agricoltura.provincia.bz.it/it/leader-2023-2027
- Provincia Autonoma di Trento: https://www.provincia.tn.it/Servizi/Bando-Intervento-SRG06-LEADER-attuazione-strategie-di-sviluppo-locale
- Puglia: https://psr.regione.puglia.it/-/csr-puglia-2023-2027-intervento-srg05-provvedimento-di-concessione-degli-aiuti-in-favore-di-23-gal
- Sardegna: https://www.regione.sardegna.it/169709797354365
- Sicilia: https://svilupporurale.regione.sicilia.it/gal/
- Toscana: https://www.regione.toscana.it/-/complemento-per-lo-sviluppo-rurale-2023-2027-leader
- Umbria: https://applicazioni.regione.umbria.it/bandi1;jsessionid=4F15A2D41D90362361A2B92E603BE87A?p_p_id=bandi_WAR_bandiportlet&p_p_lifecycle=2&p_p_state=maximized&p_p_mode=view&p_p_cacheability=cacheLevelPage&_bandi_WAR_bandiportlet_documentID=1559151&_bandi_WAR_bandiportlet_codPrat=2023-002-14150&_bandi_WAR_bandiportlet_documentName=DD+n.12862+del+2023&_bandi_WAR_bandiportlet_jspPage=%2Fdettaglio.jsp
- Valle d'Aosta: https://www.regione.vda.it/agricoltura/CSR_2023_2027/leader_sviluppo_locale_i.aspx
- Veneto: https://www.regione.veneto.it/web/agricoltura-e-foreste/sviluppo-locale-leader
- Campania pubblica una scheda per ogni GAL sul portale regionale (es. GAL Domitio Aurunco, che non ha un sito proprio): https://agricoltura.regione.campania.it/CSR_2023-2027/SRG06.html#GAL

## 4. FLAG / GALPA (pesca, PN FEAMPA 2021-2027)

- Elenco nazionale: https://www.feampa.it/clld/ (sito del PN FEAMPA, MASAF). Riporta "32 GAL ammessi, 30 selezionati, 28 convenzioni sottoscritte", l'elenco per regione con link ai siti e i PDF delle strategie. Solo HTML, nessun export.
- In `gal.json` ci sono 32 voci con tipo "FLAG". Senza sito nell'elenco nazionale: GAL Pesca SABIR (Basilicata), GAL Calabria Ionica, GAL Marche, Futuro GAL del Mare (Sardegna), GALP del Sud Est Sicilia.
- Solo pagina Facebook (non leggibile da un job): GAC Golfi di Castellammare e Carini, GAC Isole di Sicilia, FLAG Veneziano.
- Domini indicati ma non piu' validi: gacgolfoditermini.it risulta "dominio disponibile"; gacgolfodipatti.it mostra una pagina vuota; postmaster.galpamarical.it non raggiungibile.
- Sicilia, graduatoria strategie CLLD FEAMPA (Decreto 1106 del 19/12/2023, non letto): https://www.regione.sicilia.it/sites/default/files/2023-12/Decreto%20n.%201106%20del%2019.12.2023%20-%20Approvazione%20Graduatoria%20Definitiva%20Avviso%20Pubblico%20-%20Strategie%20CLLD%20-%20PN%20FEAMPA%202021-2027.pdf
- Il GAL Costa dei Trulli (pesca) usa lo stesso sito del GAL Terra dei Trulli e di Barsento.

## 5. Voci con "verificato": false (sito non aperto o contenuto non attendibile)

- [GAL] Calabria - GAL Sila Sviluppo: https://www.galsila.it/ - HTTP 200 
- [GAL] Campania - GAL Irpinia Consorzio: https://www.galirpinia.it/galnew/ - HTTP n/d - curl: (60) SSL: no alternative certificate subject
- [GAL] Lazio - GAL Etruria Meridionale: https://www.galetruriameridionale.it/ - HTTP 200 - Gal Etruria Meridionale – Sito in costruzione
- [GAL] Lazio - GAL Salto Cicolano: https://www.galsaltocicolano.it/ - HTTP 403 
- [GAL] Lombardia - GAL Valle Trompia Bee Green Valley: https://www.galvalletrompiabeegreenvalley.it/ - HTTP n/d - curl: (60) SSL certificate problem: unable to get
- [GAL] Piemonte - GAL Terre Astigiane: https://www.galterreastigiane.it/ - HTTP 200 - Un momento, per favore…
- [GAL] Piemonte - GAL Valli del Canavese: https://galvallidelcanavese.it/ - HTTP n/d - curl: (35) Recv failure: Connection reset by peer
- [GAL] Provincia Autonoma di Trento - GAL Trentino Orientale: https://www.galtrentinorientale.it/ - HTTP 200 - Un momento, per favore…
- [GAL] Puglia - GAL Daunofantino: https://galdaunofantino.com/ - HTTP 200 - Un momento, per favore…
- [GAL] Puglia - GAL Isola Salento: https://www.isolasalento.org/leader-2023-2027/ - HTTP 404 - 404 Not Found
- [GAL] Puglia - GAL Magna Grecia: https://www.galmagnagrecia.it/index.php/it/ - HTTP 404 - Pagina non trovata – Gal Magna Grecia
- [GAL] Puglia - GAL Terra d'Arneo: https://www.terradarneo.it/ - HTTP 200 - F. Dick Küchengabel – Bratengabel, Fleischgabel, 1
- [GAL] Puglia - GAL Valle d'Itria: https://www.galvalleditria.it/ - HTTP 200 - Un momento, per favore…
- [GAL] Sardegna - GAL Alta Gallura Gallura: https://www.galgallura.it/ - HTTP 500 
- [GAL] Sicilia - GAL Tirreno Eolie: https://www.galtirrenoeolie.it/ - HTTP n/d - curl: (35) Recv failure: Connection reset by peer
- [GAL] Veneto - GAL dell'Alta Marca Trevigiana: https://galaltamarca.tv.it/ - HTTP 200 - 请稍候…
- [GAL] Molise - GAL Alto Molise: http://www.galaltomolise.it - HTTP 200 
- [GAL] Molise - GAL Molise Rurale: http://www.galmoliserurale.it/ - HTTP n/d - curl: (35) Recv failure: Connection reset by peer
- [FLAG] Basilicata - GAL Pesca SABIR: (nessun sito noto) - HTTP n/d 
- [FLAG] Calabria - GAL Calabria Ionica: (nessun sito noto) - HTTP n/d 
- [FLAG] Calabria - GAL Marical: https://postmaster.galpamarical.it/ - HTTP n/d - curl: (56) CONNECT tunnel failed, response 502
- [FLAG] Marche - GAL Marche (GALPA Marche): (nessun sito noto) - HTTP n/d 
- [FLAG] Sardegna - Futuro GAL del Mare: (nessun sito noto) - HTTP n/d 
- [FLAG] Sicilia - GAC Golfo di Patti: http://gacgolfodipatti.it/ - HTTP 200 - gacgolfodipatti.it
- [FLAG] Sicilia - FLAG Golfo di Termini Imerese: https://www.gacgolfoditermini.it/ - HTTP 200 - gacgolfoditermini.it — Dominio disponibile
- [FLAG] Sicilia - GAC Golfi di Castellammare e Carini: https://www.facebook.com/gacgolfidicastellammareecarini/ - HTTP 200 - Facebook
- [FLAG] Sicilia - GAC Isole di Sicilia: https://www.facebook.com/gacisoledisicilia/ - HTTP 200 - Facebook
- [FLAG] Sicilia - GALP del Sud Est Sicilia: (nessun sito noto) - HTTP n/d 
- [FLAG] Veneto - FLAG Veneziano: https://www.facebook.com/flagveneziano/ - HTTP 200 - Facebook

Note su queste voci:
- "Un momento, per favore" / titolo in cinese = pagina di verifica anti-bot (Cloudflare o simili): il sito esiste ma un job automatico probabilmente verra' bloccato allo stesso modo.
- GAL Terra d'Arneo: il dominio terradarneo.it indicato da Rete PAC oggi mostra un negozio online estraneo. Non usarlo; sito attuale da cercare.
- GAL Isola Salento e GAL Magna Grecia: e' rotto solo l'indirizzo profondo indicato da Rete PAC; i domini isolasalento.org e galmagnagrecia.it rispondevano nella verifica precedente (su www1.isolasalento.org e galmagnagrecia.it/bandi/).
- GAL Sila Sviluppo e GAL Alto Molise: rispondono 200 ma con pagina senza contenuto leggibile.
- Errori di certificato SSL (Irpinia, Valle Trompia): il sito potrebbe funzionare da browser.

## 6. Metodo e limiti
- Siti: aperti uno per uno via HTTP il 18/11/2026; "verificato" = risposta 200 con contenuto coerente.
- `url_bandi`: ricavato automaticamente dal menu della home page (link "bandi", "bandi e avvisi", "avvisi"); controllato a mano solo per la Sicilia. In alcuni GAL punta ancora alla sezione PSR 2014-2020 perche' la sezione 2023-2027 non era in menu. Vuoto = nessuna pagina dedicata trovata (usare la home).
- I 199 GAL sono quelli dell'elenco Rete PAC; non ho confrontato regione per regione con le graduatorie regionali, tranne Sicilia, Lazio e Piemonte (14 GAL confermati).
