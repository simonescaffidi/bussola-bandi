// Schede complete dei bandi in evidenza (quelli con simulatore). Applicate a ogni avvio.
const db = require('./db');
const { upsertBando } = require('./bandi-store');

const SPESE_AVVIO = 'Macchinari, impianti, attrezzature e arredi nuovi; software, servizi informatici e app; immobilizzazioni immateriali; consulenze tecniche (fino al 30% del contributo). Per i programmi di investimento anche opere edili (fino al 50% del programma). Non sono ammessi immobili e terreni.';
const PROC_AVVIO = ['Verifica i requisiti (età 18-34 anni e stato di inoccupato, inattivo o disoccupato).', 'Prepara il piano d\'impresa con le spese previste.', 'Presenta la domanda online sulla piattaforma Invitalia con SPID, CIE o CNS.', 'Invitalia valuta le domande in ordine di arrivo, fino a esaurimento dei fondi.'];

const SCHEDE = [
  {
    bando: { id: 'nuova-sabatini', title_it: 'Nuova Sabatini', title_en: 'Nuova Sabatini', ente: 'MIMIT - Ministero delle Imprese e del Made in Italy', livello: 'nazionale', tipo: 'impresa', regione: 'Nazionale', settore: 'generale',
      categoria_it: 'Contributo in conto impianti', categoria_en: 'Capital grant', scadenza: 'a sportello',
      importo_it: 'Contributo pari agli interessi su finanziamenti da 20.000 € a 4.000.000 €', importo_en: 'Grant equal to the interest on loans from €20,000 to €4,000,000',
      sintesi_it: 'Sostiene le micro, piccole e medie imprese che acquistano o prendono in leasing macchinari, impianti, attrezzature, hardware, software e tecnologie digitali. Il contributo è pari agli interessi calcolati su un finanziamento di cinque anni al tasso del 2,75% (3,575% per investimenti 4.0 e green).',
      sintesi_en: 'Supports micro, small and medium enterprises buying or leasing machinery, plant, equipment, hardware, software and digital technology. The grant equals the interest on a five-year loan at 2.75% (3.575% for Industry 4.0 and green investments).',
      link: 'https://www.mimit.gov.it/it/incentivi/beni-strumentali-nuova-sabatini-presentazione-domande', fonte: 'MIMIT', beneficiari: 'Micro, piccole e medie imprese' },
    simulatore: 'nuova-sabatini',
    dettagli: { beneficiari: 'Micro, piccole e medie imprese di tutti i settori, con sede in Italia.', spese: 'Macchinari, impianti, beni strumentali e attrezzature nuovi; hardware, software e tecnologie digitali.', procedura: ['Scegli una banca o una società di leasing convenzionata.', 'Presenta la domanda di agevolazione insieme alla richiesta di finanziamento.', 'La banca delibera il finanziamento e prenota il contributo presso il Ministero.', 'A investimento concluso richiedi l\'erogazione del contributo.'],
      faq: [['Quanto vale il contributo?', 'Su un finanziamento di 100.000 € circa 7.700 € in linea ordinaria e circa 10.100 € per investimenti 4.0 o green.'], ['C\'è una scadenza?', 'No, la misura è a sportello fino a esaurimento delle risorse.']] }
  },
  {
    bando: { id: 'resto-al-sud', title_it: 'Resto al Sud 2.0', title_en: 'Resto al Sud 2.0', ente: 'Invitalia', livello: 'nazionale', tipo: 'entrambi', regione: 'Multiregionale', settore: 'generale',
      categoria_it: 'Contributo a fondo perduto', categoria_en: 'Non-repayable grant', scadenza: 'a sportello',
      importo_it: 'Voucher fino a 40.000 € (50.000 € per beni innovativi) oppure fondo perduto 75% fino a 120.000 € e 70% fino a 200.000 €', importo_en: 'Voucher up to €40,000 (€50,000 for innovative goods) or a grant of 75% up to €120,000 and 70% up to €200,000',
      sintesi_it: 'Incentivo per giovani tra 18 e 34 anni inoccupati, inattivi o disoccupati che avviano un\'attività d\'impresa o di lavoro autonomo in Abruzzo, Basilicata, Calabria, Campania, Molise, Puglia, Sardegna e Sicilia. Sportello aperto dal 15 ottobre 2025 fino a esaurimento dei fondi.',
      sintesi_en: 'Incentive for people aged 18 to 34 who are not in employment and start a business or self-employment in Abruzzo, Basilicata, Calabria, Campania, Molise, Puglia, Sardinia and Sicily. Open since 15 October 2025 until funds run out.',
      link: 'https://www.invitalia.it/incentivi-e-strumenti/resto-al-sud-20', fonte: 'Invitalia', data_apertura: '2025-10-15', beneficiari: 'Giovani 18-34 anni inoccupati, inattivi o disoccupati' },
    simulatore: 'resto-al-sud',
    dettagli: { beneficiari: 'Giovani tra 18 e 34 anni in condizione di marginalità, inoccupati, inattivi o disoccupati, che avviano una nuova attività nelle regioni del Mezzogiorno.', spese: SPESE_AVVIO, procedura: PROC_AVVIO,
      faq: [['Voucher o programma di investimento?', 'Il voucher copre le spese di avvio fino a 40.000 € (50.000 € per beni innovativi). Il programma di investimento finanzia progetti più grandi, fino a 200.000 €, con un contributo del 75% o del 70%.'], ['Posso comprare un immobile?', 'No, immobili e terreni non sono ammessi.']] }
  },
  {
    bando: { id: 'autoimpiego-centro-nord', title_it: 'Autoimpiego Centro-Nord', title_en: 'Self-Employment Centre-North', ente: 'Invitalia', livello: 'nazionale', tipo: 'entrambi', regione: 'Multiregionale', settore: 'generale',
      categoria_it: 'Contributo a fondo perduto', categoria_en: 'Non-repayable grant', scadenza: 'a sportello',
      importo_it: 'Voucher fino a 30.000 € (40.000 € per beni innovativi) oppure fondo perduto 65% fino a 120.000 € e 60% fino a 200.000 €', importo_en: 'Voucher up to €30,000 (€40,000 for innovative goods) or a grant of 65% up to €120,000 and 60% up to €200,000',
      sintesi_it: 'Incentivo per giovani tra 18 e 34 anni inoccupati, inattivi o disoccupati che avviano un\'attività d\'impresa o di lavoro autonomo nelle regioni del Centro e del Nord Italia. Sportello aperto dal 15 ottobre 2025 fino a esaurimento dei fondi.',
      sintesi_en: 'Incentive for people aged 18 to 34 who are not in employment and start a business or self-employment in Central and Northern Italy. Open since 15 October 2025 until funds run out.',
      link: 'https://www.invitalia.it/incentivi-e-strumenti/autoimpiego-centro-nord', fonte: 'Invitalia', data_apertura: '2025-10-15', beneficiari: 'Giovani 18-34 anni inoccupati, inattivi o disoccupati' },
    simulatore: 'autoimpiego-centro-nord',
    dettagli: { beneficiari: 'Giovani tra 18 e 34 anni in condizione di marginalità, inoccupati, inattivi o disoccupati, che avviano una nuova attività in Piemonte, Valle d\'Aosta, Liguria, Lombardia, Veneto, Friuli-Venezia Giulia, Trentino-Alto Adige, Emilia-Romagna, Toscana, Lazio, Umbria e Marche.', spese: SPESE_AVVIO, procedura: PROC_AVVIO, faq: [] }
  },
  {
    bando: { id: 'zes-unica-credito-imposta', title_it: 'Credito d\'imposta ZES Unica 2026-2028', title_en: 'ZES Unica tax credit 2026-2028', ente: 'Agenzia delle Entrate / Struttura di missione ZES', livello: 'nazionale', tipo: 'impresa', regione: 'Multiregionale', settore: 'generale',
      categoria_it: 'Credito d\'imposta', categoria_en: 'Tax credit', scadenza: '2027-05-30', data_apertura: '2027-03-31', data_chiusura: '2027-05-30',
      importo_it: 'Credito dal 15% al 60% dell\'investimento, per progetti da 200.000 € a 100 milioni di €', importo_en: 'Credit from 15% to 60% of the investment, for projects from €200,000 to €100 million',
      sintesi_it: 'Credito d\'imposta per le imprese che investono in beni strumentali nelle regioni della ZES Unica: Basilicata, Calabria, Campania, Molise, Puglia, Sardegna, Sicilia e le zone ammissibili di Abruzzo, Marche e Umbria. La comunicazione preventiva per gli investimenti 2026 si è chiusa il 30 maggio 2026; per gli investimenti 2027 la finestra è dal 31 marzo al 30 maggio 2027.',
      sintesi_en: 'Tax credit for businesses investing in capital goods in the ZES Unica regions of Southern Italy. The advance notice window for 2026 investments closed on 30 May 2026; for 2027 investments it runs from 31 March to 30 May 2027.',
      link: 'https://www.agenziaentrate.gov.it/', fonte: 'Agenzia delle Entrate', beneficiari: 'Imprese di ogni dimensione' },
    simulatore: 'zes-unica',
    dettagli: { beneficiari: 'Imprese di qualsiasi dimensione che realizzano investimenti in strutture produttive nelle regioni della ZES Unica.', spese: 'Macchinari, impianti e attrezzature nuovi (anche in leasing); terreni e immobili strumentali, entro il 50% dell\'investimento. Esclusi i beni destinati alla vendita e i materiali di consumo.', procedura: ['Invia la comunicazione preventiva all\'Agenzia delle Entrate nella finestra dal 31 marzo al 30 maggio.', 'Realizza gli investimenti entro il 31 dicembre dell\'anno.', 'Invia la comunicazione integrativa a gennaio dell\'anno successivo, a pena di decadenza.', 'Utilizza il credito in compensazione nella misura fissata dal riparto, con certificazione del revisore.'],
      faq: [['Riceverò tutto il credito calcolato?', 'Non è detto: se le richieste superano i fondi, l\'Agenzia delle Entrate riduce il credito in proporzione. Nel 2025 il credito utilizzabile è stato il 60,3811% di quello richiesto.']] }
  }
];

async function applicaSchede() {
  for (const s of SCHEDE) {
    await upsertBando(Object.assign({ origine: 'manuale', provincia: '' }, s.bando));
    await db.query(`UPDATE bandi SET dettagli=$2, simulatore=$3, in_evidenza=true WHERE id=$1`, [s.bando.id, JSON.stringify(s.dettagli), s.simulatore]);
  }
  return SCHEDE.length;
}
module.exports = { applicaSchede };
