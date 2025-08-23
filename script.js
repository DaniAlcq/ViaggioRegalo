// Helper
const $ = (sel, root=document) => root.querySelector(sel);

function showToast(msg, type='info') {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1800);
}

const SAMPLE_OFFERS = [
  { 
    city: 'Crociera Nord Europa', 
    price: "gratis", 
    rating: 4.9, 
    img: 'img/crociera.jpg', 
    description: 'Un viaggio tra fiordi spettacolari, paesaggi mozzafiato e capitali nordiche ricche di fascino e storia.' 
  },
  { 
    city: 'Instanbul e Cappadocia', 
    price: "gratis", 
    rating: 4.9, 
    img: 'img/instanbul.jpg',
    description: 'Scopri i bazar colorati di Istanbul e vola in mongolfiera tra le valli uniche della Cappadocia.'
  },
  { 
    city: 'Miami', 
    price: "gratis", 
    rating: 5, 
    img: 'img/miami.avif',
    description: 'Spiagge infinite, nightlife elettrizzante e un’atmosfera solare tutto l’anno: la magia di Miami ti aspetta.'
  },
  { 
    city: 'Dublino', 
    price: "gratis", 
    rating: 4.6, 
    img: 'img/dublino.jpg',
    description: 'Un mix di pub storici, musica dal vivo e paesaggi verdi: l’Irlanda parte dal cuore di Dublino.'
  },
  { 
    city: 'Amsterdam', 
    price: "gratis", 
    rating: 4.7, 
    img: 'img/amsterdam.png',
    description: 'Canali pittoreschi, musei di fama mondiale e biciclette ovunque: vivi l’atmosfera unica di Amsterdam.'
  },
  { 
    city: 'Stoccolma', 
    price: "gratis", 
    rating: 4.6, 
    img: 'img/stoccolma.jpg',
    description: 'La “Venezia del Nord”: un arcipelago incantevole, design moderno e tradizioni svedesi senza tempo.'
  },
  { 
    city: 'Siviglia',
    hotel: 'Da decidere', 
    price: "gratis", 
    rating: 4.5, 
    img: 'img/sevilla.jpg',
    description: 'Flamenco, tapas e la maestosa Giralda: Siviglia è pura passione andalusa.'
  },
  { 
    city: 'Praga', 
    price: "gratis", 
    rating: 4.4, 
    img: 'img/praga.jpg',
    description: 'Il ponte Carlo, il castello e birrerie storiche: la città delle cento torri ha un fascino magico.'
  },
  { 
    city: 'Copenhagen', 
    price: "gratis", 
    rating: 4.5, 
    img: 'img/copenhagen.jpg',
    description: 'Design scandinavo, hygge e la celebre Sirenetta: una città moderna con il calore nordico.'
  },
  { 
    city: 'Oslo', 
    price: "gratis", 
    rating: 4.3, 
    img: 'img/oslo.jpg',
    description: 'La capitale norvegese tra natura incontaminata e architettura all’avanguardia.'
  },
];


function setMinDates() {
  const inEl = $('#checkin');
  const outEl = $('#checkout');
  if (!inEl || !outEl) return;
  const today = new Date(); today.setHours(0,0,0,0);
  const iso = today.toISOString().slice(0,10);
  inEl.min = iso; outEl.min = iso;
}
function ensureCheckoutAfterCheckin() {
  const inEl = $('#checkin');
  const outEl = $('#checkout');
  if (!inEl || !outEl || !inEl.value) return;
  const inDate = new Date(inEl.value);
  const nextDay = new Date(inDate.getTime() + 24*60*60*1000);
  const iso = nextDay.toISOString().slice(0,10);
  outEl.min = iso;
  if (outEl.value && new Date(outEl.value) <= inDate) outEl.value = iso;
}

function renderResults(items) {
  const wrap = $('#results');
  const counter = $('#resultsCount');
  if (!wrap) return;
  wrap.innerHTML = '';
  if (!items.length) {
    if (counter) counter.textContent = 'Nessun risultato trovato.';
    return;
  }
  if (counter) counter.textContent = `${items.length} offerte trovate`;
  const frag = document.createDocumentFragment();
  for (const it of items) {
    const art = document.createElement('article');
    art.className = 'card';
    art.setAttribute('role', 'listitem');
    art.innerHTML = `
      <img src="${it.img}" alt="${it.city}" loading="lazy" />
      <div class="p">
        <div class="title">${it.city}</div>
        <div class="muted">Valutazione <span class="rating">★ ${it.rating}</span></div>
        <div class="muted"><span class="price">${it.price}</span></div>
        <div style="margin-top:10px; display:flex; gap:8px;">
          <button class="btn" type="button" data-book="${it.city}">Prenota</button>

         <button class="btn ghost" type="button" data-details="${it.city}">Dettagli</button>
        </div>
      </div>`;
    frag.appendChild(art);
  }
  wrap.appendChild(frag);
}

function fakeSearch(q) {
  const wrap = $('#results');
  if (wrap) {
    wrap.innerHTML = '';
    for (let i=0;i<1;i++) {
      const sk = document.createElement('div');
      sk.className = 'card';
      sk.innerHTML = `<div class="p"><div class="muted">Caricamento…</div></div>`;
      wrap.appendChild(sk);
    }
  }
  return new Promise(resolve => {
    setTimeout(() => {
      const term = (q.destinazione || '').toLowerCase();
      resolve(SAMPLE_OFFERS.filter(o => o.city.toLowerCase().includes(term)));
    }, 700);
  });
}

// Inizializzazione
window.addEventListener('load', () => {
  setMinDates();
  ensureCheckoutAfterCheckin();
  renderResults(SAMPLE_OFFERS.slice(0,10));

  const inEl = $('#checkin');
  if (inEl) inEl.addEventListener('change', ensureCheckoutAfterCheckin);

  const form = $('#searchForm');
  if (form) form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const q = Object.fromEntries(fd.entries());

    // DESTINAZIONE PUÒ ESSERE VUOTA → in quel caso mostriamo tutto
    // (se vuoi che le date siano opzionali, togli anche il check sotto)
    if (!q.andata || !q.ritorno) { showToast('Seleziona le date'); return; }

    const results = await fakeSearch(q); // se q.destinazione è vuota => tutte le offerte
    renderResults(results);
    showToast(results.length ? 'Ecco le migliori offerte' : 'Nessuna offerta trovata');
  });
});

document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-details]');
  if (!btn) return;

  const city = btn.dataset.details;
  const offer = SAMPLE_OFFERS.find(o => o.city === city);
  if (!offer) return;

  // titolo
  document.getElementById('detailsTitle').textContent = offer.city;

  // immagine
  const imgEl = document.getElementById('detailsImg');
  imgEl.src = offer.img;
  imgEl.alt = `Foto di ${offer.city}`;

  // testo
 // testo base
document.getElementById('detailsText').textContent =
`Prezzo: ${offer.price} — Rating: ${offer.rating}`;

// descrizione personalizzata
const descEl = document.getElementById('detailsDesc');
descEl.textContent = offer.description || 'Nessuna descrizione disponibile.';

  document.getElementById('detailsDialog').showModal();
});


let currentOffer = null;
let currentBooking = null;

// apri dialog quando clicchi Prenota
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-book]');
  if (!btn) return;

  const city = btn.dataset.book;
  const offer = SAMPLE_OFFERS.find(o => o.city === city);
  if (!offer) return;

  const andata = document.querySelector('#andata')?.value || '';
  const ritorno = document.querySelector('#ritorno')?.value || '';
  const ospiti  = document.querySelector('#ospiti')?.value || '1';

  currentOffer = offer;
  currentBooking = { andata, ritorno, ospiti };

  document.getElementById('bookCity').textContent = offer.city;
  document.getElementById('bookDates').textContent = andata && ritorno ? `${andata} → ${ritorno}` : 'non specificate';
  document.getElementById('bookGuests').textContent = ospiti;
  document.getElementById('bookTrip').textContent = `Prezzo: ${offer.price} — Rating: ${offer.rating}`;

  document.getElementById('bookDialog').showModal();
});



async function sendViaEmailJS(offer, booking) {
  const templateParams = {
    to_email: "uno@esempio.it,due@esempio.it", // se lo usi nel template come destinatario
    email: "dani.lcq@gmail.com",               // mostrato nel footer (facoltativo)
    city: currentOffer.city,
    dates: `${currentBooking.andata || '-'} → ${currentBooking.ritorno || '-'}`,
    guests: currentBooking.ospiti,
    price: currentOffer.price,                 // es. "Gratis"
    taxes: "Amarmi",                           // o "€ 0,00" / quello che vuoi
    total: currentOffer.price,                 // es. "Gratis"
    img: window.location.origin + "/" + currentOffer.img.replace(/^\.\//, ''),
    logo: window.location.origin + "/img/Travellers.png"
  };
  

  try {
    await emailjs.send(
      "service_y3flxfj",   // es. service_abc123
      "template_9r4kifx",  // es. template_booking
      templateParams
    );
    showToast("Prenotazione inviata via EmailJS!");
  } catch (err) {
    console.error(err);
    showToast("Errore nell'invio della prenotazione", "error");
  }
}

// click su "Sì"
document.getElementById("confirmBookBtn").addEventListener("click", async () => {
  if (!currentOffer || !currentBooking) return;
  await sendViaEmailJS(currentOffer, currentBooking);
});


