# Bussola Bandi - registro fonti regionali (verifica del 18/11/2026)

Registro completo: `regioni.json` (111 fonti, 93 verificate, 20 regioni con Trento e Bolzano separate).

## Metodo e significato di "verificato"

- `verificato: true` = la pagina è stata aperta il 18/11/2026, ha risposto HTTP 200 e titolo/contenuto corrispondono a un elenco di bandi/avvisi.
- `verificato: false` = non sono riuscito ad aprirla. Tre cause:
  1. il sito non risponde dal nostro ambiente cloud (timeout: probabile blocco degli IP non italiani). L'URL viene dall'indice del motore di ricerca, quindi esiste, ma il contenuto non è stato letto;
  2. captcha (Regione Marche, Radware) o 403 (Regione Campania, vecchio sito Valle d'Aosta);
  3. sito solo JavaScript (Sardegna Programmazione, sottositi provincia.bz.it): risponde 200 ma il contenuto non è leggibile senza browser.
- I feed indicati come "dichiarato (non aperto)" sono presenti nell'HTML della pagina ma non sono stati scaricati.

Conseguenza pratica: se anche il task giornaliero di ingest gira da IP non italiani, le fonti del punto 1 falliranno allo stesso modo. Vanno lette da un IP italiano o dal browser del Mac.

## Sicilia

### IRFIS FinSicilia - misure nella categoria "Avvisi aperti"

Fonte: https://www.irfis.it/category/articoli-misure-aperte/ (2 pagine)
RSS dedicato: https://www.irfis.it/category/articoli-misure-aperte/feed/

Sono le 13 misure che IRFIS classifica come aperte al 18/11/2026. Non ho aperto le singole schede: scadenze e disponibilità residua dei fondi sono da leggere in ciascuna.

| # | Misura | URL |
|---|--------|-----|
| 1 | Contrasto della povertà energetica (art. 36 L.R. 1/2026) | https://www.irfis.it/poverta-energetica/ |
| 2 | Finanziamenti agevolati e fondo perduto per investimenti dopo i danni del "Ciclone Harry", inclusa la frana di Niscemi (termini riaperti l'8/10/2026) | https://www.irfis.it/finanziamenti-agevolati-e-contributi-a-fondo-perduto-per-la-realizzazione-di-investimenti-a-seguito-dei-danni-causati-dal-ciclone-harry-ivi-compresa-la-frana-di-niscemi/ |
| 3 | Interventi in favore dell'Editoria - nuova iniziativa 2026 | https://www.irfis.it/interventi-in-favore-delleditoria-nuova-iniziativa-2026/ |
| 4 | Finanziamenti agevolati del capitale circolante - imprese del commercio | https://www.irfis.it/finanziamenti-agevolati-del-capitale-circolante-in-favore-di-imprese-operanti-nel-settore-del-commercio/ |
| 5 | Finanziamenti agevolati per programmi di investimento - imprese del commercio | https://www.irfis.it/finanziamenti-agevolati-per-la-realizzazione-di-programmi-di-investimento-in-favore-di-imprese-operanti-nel-settore-del-commercio/ |
| 6 | Prestito d'onore studenti universitari | https://www.irfis.it/prestito-donore-studenti-universitari/ |
| 7 | Incentivi al lavoro agile - South Working (art. 3 L.R. 1/2026) | https://www.irfis.it/incentivi-a-sostegno-del-lavoro-agile-south-working-art-3-l-r-n-1-del-5-gennaio-2026/ |
| 8 | Incentivi alle assunzioni a tempo indeterminato (art. 1 L.R. 1/2026) | https://www.irfis.it/avviso-incentivi-a-sostegno-delle-assunzioni-a-tempo-indeterminato/ |
| 9 | Incentivi alle assunzioni connesse a progetti di investimento iniziale (art. 2 L.R. 1/2026) | https://www.irfis.it/avviso-incentivi-a-sostegno-delle-assunzioni-connesse-a-progetti-di-investimento-iniziale/ |
| 10 | Fondo perduto per consumatori in procedura di sovraindebitamento | https://www.irfis.it/contributo-a-fondo-perduto-per-i-consumatori-che-accedono-alle-procedure-di-sovraindebitamento/ |
| 11 | Fondo perduto per abbattimento interessi sui prestiti al consumo per beni durevoli - annualità 2026 | https://www.irfis.it/contributi-a-fondo-perduto-per-labbattimento-degli-interessi-sui-prestiti-al-consumo-per-lacquisto-di-beni-durevoli-annualita-2026/ |
| 12 | Interventi per imprese soggette a misure di prevenzione | https://www.irfis.it/interventi-in-favore-delle-imprese-soggette-a-misure-di-prevenzione/ |
| 13 | Agevolazioni per imprese turistiche alberghiere ed extralberghiere | https://www.irfis.it/avviso-agevolazioni-per-le-imprese-del-settore-turistico-alberghiero-ed-extralberghiero/ |

Altre misure in evidenza nella home IRFIS, non presenti nella categoria "aperte" (stato da controllare): Cluster (38,6 mln), Contributi mutui imprese (45 mln), Caro mutui famiglie prima casa (50 mln), Editoria 2024 (2,2 mln), Fare Impresa in Sicilia - FAINSICILIA (26 mln), Agenzie di distribuzione e servizi stampa (5 mln), Edicole (5 mln).

Altre categorie utili: tutte le misure https://www.irfis.it/category/articoli-misure-agevolative/ ; chiuse https://www.irfis.it/category/articoli-misure-chiuse/

### CRIAS e IRCAC non esistono più come fonti separate

Dal 28/04/2026 sono fuse in **IRCA - Istituto Regionale per il Credito Agevolato**. `crias.it` e `ircac.it` reindirizzano a https://www.ircasicilia.it/

- Avvisi: https://www.ircasicilia.it/avvisi/ (RSS https://www.ircasicilia.it/avvisi/feed/)
- AgriPesca: primo avviso IRCA, 5 milioni per agricoltura e pesca, domande dal 30 novembre 2026
- Più Artigianato: piattaforma riaperta dal 16 ottobre - https://www.ircasicilia.it/piu-arigianato/ (l'URL contiene davvero il refuso "arigianato")

### Regione Siciliana: un solo listing, filtrabile per dipartimento

https://www.regione.sicilia.it/istituzioni/servizi-informativi/bandi

Filtri a faccette nell'URL: `f[0]=category:22` (avvisi pubblici), `category:20` gare, `category:21` concorsi, `category:23` manifestazioni di interesse, `group:N` struttura, `expired:0/1`. Nessun RSS.

Dipartimenti con avvisi presenti (codice `group`): Attività Produttive 12+14, Agricoltura 7+26, Pesca 7+27, Sviluppo Rurale 7+28, Turismo 4+18, Acqua e Rifiuti 13+41, Famiglia e Politiche Sociali 11+39, Beni Culturali 16+22, Programmazione 3+56, Ambiente 5+20.

Senza faccetta al momento della verifica (da seguire dalla pagina del dipartimento): Energia, Lavoro, Formazione Professionale, Istruzione. Gli avvisi di Lavoro e Formazione escono soprattutto su sicilia-fse.it.

### Fondi UE Sicilia

- EuroInfoSicilia, bandi aperti: https://www.euroinfosicilia.it/bandi-e-avvisi-aperti/?sezione=aperti (4 aperti, 0 in scadenza, 106 chiusi) - RSS https://www.euroinfosicilia.it/feed/
- PR FESR 21-27: https://www.euroinfosicilia.it/bandi-e-avvisi-pr-fesr-21-27/
- FSC 21-27: https://www.euroinfosicilia.it/bandi-e-avvisi-fsc-sicilia-21-27/
- FSE+: https://www.sicilia-fse.it/avvisi-e-bandi (nessun RSS)
- PSR/CSR: https://www.psrsicilia.it/bandi-aperti/ - RSS https://www.psrsicilia.it/feed/

### Altri enti siciliani

- ZES Unica: https://www.strutturazes.gov.it/ - non verificato (non raggiungibile). È una fonte nazionale e gestisce autorizzazione unica e credito d'imposta, non bandi a graduatoria.
- Città Metropolitana di Palermo: https://cittametropolitana.pa.it/ (senza www) - RSS https://cittametropolitana.pa.it/feed/
- Città Metropolitana di Catania: https://www.cittametropolitana.ct.it/it/menu/179240 - feed https://www.cittametropolitana.ct.it/it/feeds
- Città Metropolitana di Messina: solo bandi di gara, https://www.cittametropolitana.me.it/servizi/servizi-alle-imprese/bandi-di-gara/
- Sviluppo Italia Sicilia: sito non raggiungibile, nessuna evidenza di bandi attivi. Da non includere.

## Fonti con RSS verificato (le più semplici da agganciare)

| Regione | Fonte | Feed |
|---|---|---|
| Sicilia | IRFIS misure aperte | https://www.irfis.it/category/articoli-misure-aperte/feed/ |
| Sicilia | IRCA avvisi | https://www.ircasicilia.it/avvisi/feed/ |
| Sicilia | EuroInfoSicilia | https://www.euroinfosicilia.it/feed/ |
| Sicilia | PSR Sicilia | https://www.psrsicilia.it/feed/ |
| Piemonte | Bandi Regione Piemonte | https://bandi.regione.piemonte.it/tutti/rss.xml |
| Valle d'Aosta | Elenco bandi (Europa) | https://new.regione.vda.it/rss?projection=1112 |
| Toscana | Sviluppo Toscana bandi | https://www.sviluppo.toscana.it/bandi/feed/ |
| Lazio | Lazio Europa bandi | https://www.lazioeuropa.it/bandi/feed/ |
| Lazio | Lazio Innova bandi | https://www.lazioinnova.it/bandi/feed/ |
| Calabria | Regione Calabria bandi | https://www.regione.calabria.it/feed/?post_type=rc-procedure |
| Calabria | Calabria Europa | https://calabriaeuropa.regione.calabria.it/feed/ |
| Umbria | Gepafin | https://gepafin.it/feed/ |
| Abruzzo | FiRA | https://www.fira.it/feed/ |
| Sardegna | SFIRS | https://www.sfirs.it/feed/ |
| Sardegna | Sardegna Agricoltura scadenze | https://www.sardegnaagricoltura.it/rss/scadenze.rss |
| Valle d'Aosta | Finaosta bandi e avvisi | https://www.finaosta.com/tag/bandi-e-avvisi/feed/ |
| Friuli-VG | Pagina RSS regionale | https://www.regione.fvg.it/rafvg/cms/RAFVG/rss/ |

Fincalabra ha un feed (`/web/index.php/bandi?format=feed&type=rss`) che risponde ma è quasi vuoto: l'elenco è caricato via JavaScript.

## Cose diverse da come ci si aspetta

- **Veneto Sviluppo**: le misure di finanza agevolata sono su https://agevolazioni.venetoinnovazione.it/ (Veneto Innovazione).
- **Finpiemonte**: la pagina è `/agevolazioni`; `/bandi` dà 404.
- **Finlombarda**: elenco misure su `/it/prodotti-e-servizi/prodotti-servizi`.
- **Sviluppumbria**: `/avvisi-pubblici`; `/bandi` dà 404.
- **Sviluppo Italia Molise**: dominio attuale `.com`.
- **Sviluppo Basilicata**: pagina utile `/kweb-sviluppobasilicata/sito/sb/incentivi`.
- **Friulia** e **IDM Alto Adige**: non pubblicano elenchi di bandi (Friulia fa equity; IDM ha solo una pagina panoramica).
- **Valle d'Aosta**: il portale valido è `new.regione.vda.it`; il vecchio dà 403/404.
- **POR Puglia**: il portale `por.regione.puglia.it` è ancora intitolato 2014-2020.

## Non verificati (18)

Regione Umbria, Regione Marche, SVEM, Regione Abruzzo (portale principale), Regione Molise (portale principale), Regione Campania (portale principale), Europa Campania, Regione Puglia (portale principale e feed bandi), Portale Bandi Basilicata, AVEPA, ART-ER, Sardegna Programmazione, tre sottositi della Provincia di Bolzano, vecchio portale Valle d'Aosta, ZES Unica, Sviluppo Italia Sicilia.

Per quasi tutte queste regioni c'è comunque almeno una fonte verificata alternativa (portale fondi UE o finanziaria). Restano scoperte del tutto solo le **Marche**.

Lacune residue: pagina bandi PR FESR del Friuli-Venezia Giulia e pagina bandi FESR/FSE+ di Bolzano non individuate.
