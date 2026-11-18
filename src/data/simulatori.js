// Simulatori di contributo: definizione dei campi. Il calcolo è in public/js/simulatori.js.
// Le regole vanno ricontrollate quando cambia la normativa (vedi "aggiornato" in ogni simulatore).
module.exports = [
  {
    slug: 'nuova-sabatini', bando_id: 'nuova-sabatini', titolo: 'Simulatore Nuova Sabatini', aggiornato: '2026-11-18',
    intro: 'Stima il contributo in conto impianti della Nuova Sabatini: è pari agli interessi calcolati, in via convenzionale, su un finanziamento di cinque anni di importo uguale all\'investimento.',
    campi: [
      { nome: 'importo', etichetta: 'Importo del finanziamento (€)', tipo: 'numero', min: 20000, max: 4000000, valore: 100000 },
      { nome: 'linea', etichetta: 'Tipo di investimento', tipo: 'scelta', opzioni: [['2.75', 'Beni strumentali ordinari (2,75%)'], ['3.575', 'Investimenti 4.0 o green (3,575%)'], ['5', 'Capitalizzazione - micro e piccole imprese (5%)'], ['3.575m', 'Capitalizzazione - medie imprese (3,575%)']] }
    ],
    nota: 'Finanziamenti ammessi da 20.000 € a 4.000.000 €. Il contributo viene erogato dal Ministero in quote annuali. Stima non vincolante.'
  },
  {
    slug: 'resto-al-sud', bando_id: 'resto-al-sud', titolo: 'Simulatore Resto al Sud 2.0', aggiornato: '2026-11-18',
    intro: 'Stima il contributo a fondo perduto di Resto al Sud 2.0 per chi avvia un\'attività nelle regioni del Mezzogiorno (18-34 anni, inoccupati, inattivi o disoccupati).',
    campi: [
      { nome: 'modo', etichetta: 'Tipo di agevolazione', tipo: 'scelta', opzioni: [['voucher', 'Voucher di avvio'], ['programma', 'Programma di investimento']] },
      { nome: 'importo', etichetta: 'Spesa prevista (€)', tipo: 'numero', min: 1000, max: 200000, valore: 60000 },
      { nome: 'innovativo', etichetta: 'Acquisto di beni innovativi, digitali o per il risparmio energetico (solo voucher)', tipo: 'spunta' }
    ],
    nota: 'Voucher fino a 40.000 € (50.000 € per beni innovativi, digitali o sostenibili). Programmi di investimento: 75% fino a 120.000 €, 70% oltre 120.000 € e fino a 200.000 €. Sportello aperto fino a esaurimento fondi. Stima non vincolante: per i programmi oltre 120.000 € è calcolata con il 70% sull\'intero importo.'
  },
  {
    slug: 'autoimpiego-centro-nord', bando_id: 'autoimpiego-centro-nord', titolo: 'Simulatore Autoimpiego Centro-Nord', aggiornato: '2026-11-18',
    intro: 'Stima il contributo a fondo perduto di Autoimpiego Centro-Nord per chi avvia un\'attività nelle regioni del Centro e del Nord (18-34 anni, inoccupati, inattivi o disoccupati).',
    campi: [
      { nome: 'modo', etichetta: 'Tipo di agevolazione', tipo: 'scelta', opzioni: [['voucher', 'Voucher di avvio'], ['programma', 'Programma di investimento']] },
      { nome: 'importo', etichetta: 'Spesa prevista (€)', tipo: 'numero', min: 1000, max: 200000, valore: 60000 },
      { nome: 'innovativo', etichetta: 'Acquisto di beni innovativi, digitali o sostenibili (solo voucher)', tipo: 'spunta' }
    ],
    nota: 'Voucher fino a 30.000 € (40.000 € per beni innovativi, digitali o sostenibili). Programmi di investimento: 65% fino a 120.000 €, 60% oltre 120.000 € e fino a 200.000 €. Sportello aperto fino a esaurimento fondi. Stima non vincolante: per i programmi oltre 120.000 € è calcolata con il 60% sull\'intero importo.'
  },
  {
    slug: 'zes-unica', bando_id: 'zes-unica-credito-imposta', titolo: 'Simulatore credito d\'imposta ZES Unica', aggiornato: '2026-11-18',
    intro: 'Stima il credito d\'imposta per investimenti nella ZES Unica del Mezzogiorno, in base alla regione e alla dimensione dell\'impresa.',
    campi: [
      { nome: 'regione', etichetta: 'Regione dell\'investimento', tipo: 'scelta', opzioni: [['a', 'Campania, Calabria, Sicilia, Puglia'], ['b', 'Basilicata, Molise, Sardegna'], ['c', 'Abruzzo, Marche, Umbria (zone ammissibili)']] },
      { nome: 'dimensione', etichetta: 'Dimensione dell\'impresa', tipo: 'scelta', opzioni: [['p', 'Piccola'], ['m', 'Media'], ['g', 'Grande']] },
      { nome: 'importo', etichetta: 'Investimento (€)', tipo: 'numero', min: 200000, max: 50000000, valore: 500000 }
    ],
    nota: 'Investimento minimo 200.000 €; le aliquote indicate valgono per progetti fino a 50 milioni di euro. Il credito effettivamente utilizzabile dipende dal riparto fissato dall\'Agenzia delle Entrate dopo le domande: nel 2025 è stato il 60,3811% del richiesto; la percentuale 2026 non è ancora nota. Stima non vincolante.'
  }
];
