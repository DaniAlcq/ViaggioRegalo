// ============ Helper ============ //
const $ = (sel, root = document) => root.querySelector(sel);

function showToast(msg, type = 'info') {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show', type);
  setTimeout(() => t.classList.remove('show', type), 1800);
}

// ============ Dati ============ //
const SAMPLE_OFFERS = [
  { city: 'Crociera Nord Europa', price: "Gratis", rating: 4.9, img: 'img/crociera.jpg',
    description: 'Un viaggio tra fiordi spettacolari, paesaggi mozzafiato e capitali nordiche ricche di fascino e storia.' },
  { city: 'Istanbul e Cappadocia', price: "Gratis", rating: 4.9, img: 'img/instanbul.jpg',
    description: 'Scopri i bazar colorati di Istanbul e vola in mongolfiera tra le valli uniche della Cappadocia.' },
  { city: 'Miami', price: "Gratis", rating: 5.0, img: 'img/miami.avif',
    description: 'Spiagge infinite, nightlife elettrizzante e un’atmosfera solare tutto l’anno: la magia di Miami ti aspetta.' },
  { city: 'Dublino', price: "Gratis", rating: 4.6, img: 'img/dublino.jpg',
    description: 'Un mix di pub storici, musica dal vivo e paesaggi verdi: l’Irlanda parte dal cuore di Dublino.' },
  { city: 'Amsterdam', price: "Gratis", rating: 4.7, img: 'img/amsterdam.png',
    description: 'Canali pittoreschi, musei di fama mondiale e biciclette ovunque: vivi l’atmosfera unica di Amsterdam.' },
  { city: 'Stoccolma', price: "Gratis", rating: 4.6, img: 'img/stoccolma.jpg',
    description: 'La “Venezia del Nord”: un arcipelago incantevole, design moderno e tradizioni svedesi senza tempo.' },
  { city: 'Siviglia', price: "Gratis", rating: 4.5, img: 'img/sevilla.jpg',
    description: 'Flamenco, tapas e la maestosa Giralda: Siviglia è pura passione andalusa.' },
  { city: 'Praga', price: "Gratis", rating: 4.4, img: 'img/praga.jpg',
    description: 'Il ponte Carlo, il castello e birrerie storiche: la città delle cento torri ha un fascino magico.' },
  { city: 'Copenhagen', price: "Gratis", rating: 4.5, img: 'img/copenhagen.jpg',
    description: 'Design scandinavo, hygge e la celebre Sirenetta: una città moderna con il calore nordico.' },
  { city: 'Oslo', price: "Gratis", rating: 4.3, img: 'img/oslo.jpg',
    description: 'La capitale norvegese tra natura incontaminata e architettura all’avanguardia.' },
  { city: 'Santorini', price: "Gratis", rating: 4.6, img: 'img/santorini.jpg',
    description: 'L’isola più romantica della Grecia, famosa per le case bianche a picco sul mare e tramonti indimenticabili.', isNew: true },
  { city: 'Edimburgo', price: "Gratis", rating: 4.7, img: 'img/edimburgo.avif',
    description: 'Capitale della Scozia, con un castello imponente, vicoli medievali e festival culturali di fama mondiale.', isNew: true },
  { city: 'Bruges', price: "Gratis", rating: 4.5, img: 'img/bruges.jpg',
    description: 'Una città fiabesca del Belgio, con canali romantici, architettura medievale e atmosfere pittoresche.', isNew: true },
  { city: 'Madeira', price: "Gratis", rating: 4.7, img: 'img/madeira.jpg',
    description: 'Isola portoghese nel cuore dell’Atlantico, tra montagne verdi, sentieri panoramici e mare cristallino.', isNew: true }
];

// ============ Utility Top Rated (globali) ============ //
function getTopRated(items, n = 3) {
  return [...items].sort((a,b) => b.rating - a.rating || a.city.localeCompare(b.city)).slice(0, n);
}
const GLOBAL_TOP = getTopRated(SAMPLE_OFFERS, 3);
const isTopCity = (city) => GLOBAL_TOP.some(t => t.city === city);

// ============ Render Cards ============ //
function renderCards(items, containerId = 'results', counterId = 'resultsCount', withBadge = false) {
  const wrap = document.getElementById(containerId);
  const counter = counterId ? document.getElementById(counterId) : null;
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
      ${withBadge === 'top' ? '<span class="badge-top">★ Top</span>' : ''}
      ${withBadge === 'new' ? '<span class="badge-new">New</span>' : ''}
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

// Risultati principali: escludi SEMPRE le top rated globali
function renderResults(items) {
  const filtered = items.filter(it => !isTopCity(it.city));
  renderCards(filtered, 'results', 'resultsCount');
}

// ============ Date Picker ============ //
function setMinDates() {
  const inEl = $('#andata');
  const outEl = $('#ritorno');
  if (!inEl || !outEl) return;
  const today = new Date(); today.setHours(0,0,0,0);
  const iso = today.toISOString().slice(0,10);
  inEl.min = iso; outEl.min = iso;
}
function ensureCheckoutAfterCheckin() {
  const inEl = $('#andata');
  const outEl = $('#ritorno');
  if (!inEl || !outEl || !inEl.value) return;
  const inDate = new Date(inEl.value);
  const nextDay = new Date(inDate.getTime() + 24*60*60*1000);
  const iso = nextDay.toISOString().slice(0,10);
  outEl.min = iso;
  if (outEl.value && new Date(outEl.value) <= inDate) outEl.value = iso;
}

// ============ Fake search ============ //
function fakeSearch(q) {
  const wrap = $('#results');
  if (wrap) {
    wrap.innerHTML = '';
    const sk = document.createElement('div');
    sk.className = 'card';
    sk.innerHTML = `<div class="p"><div class="muted">Caricamento…</div></div>`;
    wrap.appendChild(sk);
  }
  return new Promise(resolve => {
    setTimeout(() => {
      const term = (q.destinazione || '').trim().toLowerCase();
      if (!term) { resolve([...SAMPLE_OFFERS]); return; }
      resolve(SAMPLE_OFFERS.filter(o => o.city.toLowerCase().includes(term)));
    }, 700);
  });
}

// ============ Init ============ //
window.addEventListener('load', () => {
  setMinDates();
  ensureCheckoutAfterCheckin();

  // Risultati iniziali (senza le top rated)
  const initial = SAMPLE_OFFERS.slice(0, 10);
  renderResults(initial);

  // Novità (solo isNew)
  const news = SAMPLE_OFFERS.filter(o => o.isNew === true);
  if (news.length) {
    renderCards(news, 'newsResults', 'newsCount', 'new');
    const nc = $('#newsCount'); if (nc) nc.textContent = `${news.length} novità`;
    $('#novita')?.classList.remove('hidden');
  }

  // Top Rated (globali)
  renderCards(GLOBAL_TOP, 'topResults', 'topCount', 'top');
  $('#top-rated')?.classList.remove('hidden');
});

$('#andata')?.addEventListener('change', ensureCheckoutAfterCheckin);

// ============ Submit ricerca ============ //
const form = $('#searchForm');
if (form) form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  const q = Object.fromEntries(fd.entries());

  if (!q.andata || !q.ritorno) { showToast('Seleziona le date'); return; }

  const term = (q.destinazione || '').trim().toLowerCase();
  const results = await fakeSearch(q);

  // Risultati (sempre senza top rated)
  renderResults(results);

  if (!term) {
    // destinazione vuota → mostra Novità e Top Rated
    const news = SAMPLE_OFFERS.filter(o => o.isNew);
    if (news.length) {
      renderCards(news, 'newsResults', 'newsCount', 'new');
      const nc = $('#newsCount'); if (nc) nc.textContent = `${news.length} novità`;
    } else {
      renderCards(SAMPLE_OFFERS.slice(-3), 'newsResults', 'newsCount');
      const nc = $('#newsCount'); if (nc) nc.textContent = `Novità recenti`;
    }
    renderCards(GLOBAL_TOP, 'topResults', 'topCount', 'top');
    $('#novita')?.classList.remove('hidden');
    $('#top-rated')?.classList.remove('hidden');
  } else {
    // destinazione compilata → nascondi sezioni extra
    $('#novita')?.classList.add('hidden');
    $('#top-rated')?.classList.add('hidden');
  }

  showToast(results.length ? 'Ecco le migliori offerte' : 'Nessuna offerta trovata');
});

// ============ Dialog Dettagli ============ //
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-details]');
  if (!btn) return;

  const city = btn.dataset.details;
  const offer = SAMPLE_OFFERS.find(o => o.city === city);
  if (!offer) return;

  $('#detailsTitle').innerHTML = `<div style="text-align:center;">${offer.city}</div>`;
  const imgEl = $('#detailsImg');
  imgEl.src = offer.img;
  imgEl.alt = `Foto di ${offer.city}`;

  $('#detailsText').innerHTML =
    `<div style="text-align:center;">
       <strong>Prezzo:</strong> ${offer.price} — <strong>Rating:</strong> ${offer.rating}
     </div>`;

  $('#detailsDesc').textContent = offer.description || 'Nessuna descrizione disponibile.';
  $('#detailsDialog').showModal();
});

// ============ Prenotazione + EmailJS ============ //
let currentOffer = null;
let currentBooking = null;

document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-book]');
  if (!btn) return;

  const city = btn.dataset.book;
  const offer = SAMPLE_OFFERS.find(o => o.city === city);
  if (!offer) return;

  const andata = $('#andata')?.value || '';
  const ritorno = $('#ritorno')?.value || '';
  const ospiti  = $('#ospiti')?.value || '1';

  currentOffer = offer;
  currentBooking = { andata, ritorno, ospiti };

  $('#bookCity').textContent = offer.city;
  $('#bookDates').textContent = andata && ritorno ? `${andata} → ${ritorno}` : 'non specificate';
  $('#bookGuests').textContent = ospiti;
  $('#bookTrip').textContent = `Prezzo: ${offer.price} — Rating: ${offer.rating}`;

  $('#bookDialog').showModal();
});

// URL assoluti (utile su GitHub Pages)
function absoluteUrl(path) {
  try { return new URL(path, document.baseURI).href; }
  catch { return path; }
}

// EmailJS invio
async function sendViaEmailJS(offer, booking, user) {
  const templateParams = {
    to_email: user.uemail, // destinatario dinamico (se il tuo template lo permette)
    fname: user.fname,
    lname: user.lname,
    uemail: user.uemail,
    city: offer.city,
    dates: `${booking.andata || '-'} → ${booking.ritorno || '-'}`,
    guests: booking.ospiti,
    price: offer.price,
    img: absoluteUrl(offer.img),
    logo: absoluteUrl("img/Travellers.png")
  };

  try {
    await emailjs.send("service_y3flxfj", "template_9r4kifx", templateParams);
    showToast("Prenotazione inviata!");
  } catch (err) {
    console.error(err);
    showToast("Errore nell'invio della prenotazione", "error");
  }
}

// Click su "Sì" → apri form utente
$('#confirmBookBtn')?.addEventListener('click', () => {
  $('#bookDialog').close();
  $('#userFormDialog').showModal();
});

// Submit form utente
$('#userForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentOffer || !currentBooking) return;

  const fname = $('#fname').value.trim();
  const lname = $('#lname').value.trim();
  const uemail = $('#uemail').value.trim();

  await sendViaEmailJS(currentOffer, currentBooking, { fname, lname, uemail });
  $('#userFormDialog').close();
});

// Chiudi bookDialog clic fuori
const bookDlg = $('#bookDialog');
bookDlg?.addEventListener('click', (e) => {
  const r = bookDlg.getBoundingClientRect();
  const outside = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
  if (outside) bookDlg.close();
});

document.getElementById("proposalForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const pname = document.getElementById("pname").value.trim();
  const psurname = document.getElementById("psurname").value.trim();
  const pdest = document.getElementById("pdest").value.trim();
  const pemail = document.getElementById("pemail").value.trim();

  const templateParams = {
    fname: pname,
    lname: psurname,
    destination: pdest,
    uemail: pemail
  };

  try {
    await emailjs.send("service_y3flxfj", "template_proposal", templateParams);
    showToast("Proposta inviata, grazie!");
    document.getElementById("proposalForm").reset();
  } catch (err) {
    console.error(err);
    showToast("Errore nell'invio della proposta", "error");
  }
});
// === PROPOSTE DESTINAZIONI === //
const proposalForm = document.getElementById("proposalForm");

if (proposalForm) {
  proposalForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // raccogli dati dal form
    const fname = document.getElementById("fname").value.trim();
    const lname = document.getElementById("lname").value.trim();
    const uemail = document.getElementById("uemail").value.trim();
    const destination = document.getElementById("destination").value.trim();

    // controlli minimi
    if (!fname || !lname || !uemail || !destination) {
      showToast("Compila tutti i campi", "error");
      return;
    }

    // parametri per EmailJS
    const templateParams = {
      fname,
      lname,
      uemail,
      destination
    };

    try {
      await emailjs.send(
        "service_y3flxfj",     // <-- il tuo Service ID
        "template_eeff50b",   // <-- il Template ID che hai creato per le proposte
        templateParams
      );
      showToast("Proposta inviata con successo!");
      proposalForm.reset(); // pulisce il form
    } catch (err) {
      console.error(err);
      showToast("Errore nell'invio della proposta", "error");
    }
  });
}
