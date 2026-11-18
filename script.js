const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.top-nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Menü schliessen' : 'Menü öffnen');
    nav.classList.toggle('is-open', open);
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Menü öffnen');
    nav.classList.remove('is-open');
  }));
}

let slides = [...document.querySelectorAll('[data-slide]')];
const counter = document.querySelector('.hero-count');
let slideIndex = 0;
function showSlide(index) {
  if (!slides.length) return;
  slideIndex = (index + slides.length) % slides.length;
  slides.forEach((slide, i) => {
    const active = i === slideIndex;
    slide.classList.toggle('is-active', active);
    slide.setAttribute('aria-hidden', String(!active));
  });
  if (counter) counter.textContent = `${String(slideIndex + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
}
document.querySelectorAll('[data-carousel]').forEach(button => button.addEventListener('click', () => {
  showSlide(slideIndex + (button.dataset.carousel === 'next' ? 1 : -1));
}));
document.addEventListener('sitecontent:hero', () => {
  slides = [...document.querySelectorAll('[data-slide]')];
  showSlide(0);
});

const galleryImage = document.querySelector('#gallery-feature-image');
const galleryCaption = document.querySelector('#gallery-feature-caption');
let galleryThumbs = [...document.querySelectorAll('.gallery-thumb')];
let galleryIndex = 0;
function showGallery(index) {
  if (!galleryImage || !galleryCaption || !galleryThumbs.length) return;
  galleryIndex = (index + galleryThumbs.length) % galleryThumbs.length;
  const button = galleryThumbs[galleryIndex];
  galleryImage.src = button.dataset.gallerySrc;
  galleryImage.alt = button.dataset.galleryAlt;
  galleryCaption.textContent = button.dataset.galleryCaption;
  galleryThumbs.forEach(thumb => thumb.setAttribute('aria-pressed', String(thumb === button)));
  const strip = button.parentElement;
  if (strip) {
    const bounds = strip.getBoundingClientRect();
    const imageBounds = button.getBoundingClientRect();
    const left = imageBounds.left < bounds.left
      ? imageBounds.left - bounds.left
      : imageBounds.right > bounds.right ? imageBounds.right - bounds.right : 0;
    const top = imageBounds.top < bounds.top
      ? imageBounds.top - bounds.top
      : imageBounds.bottom > bounds.bottom ? imageBounds.bottom - bounds.bottom : 0;
    if (left || top) strip.scrollBy({ left, top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
}
document.querySelector('.gallery-thumbs')?.addEventListener('click', event => {
  const button = event.target.closest('.gallery-thumb');
  const index = galleryThumbs.indexOf(button);
  if (index >= 0) showGallery(index);
});
document.addEventListener('sitecontent:gallery', () => {
  galleryThumbs = [...document.querySelectorAll('.gallery-thumb')];
  showGallery(0);
});
document.querySelectorAll('[data-gallery-step]').forEach(button => button.addEventListener('click', () => {
  showGallery(galleryIndex + Number(button.dataset.galleryStep));
}));

const mascotDialog = document.querySelector('.mascot-dialog');
document.querySelector('.gallery-secret')?.addEventListener('click', () => mascotDialog?.showModal());
mascotDialog?.querySelectorAll('.mascot-close, .mascot-done').forEach(button => {
  button.addEventListener('click', () => mascotDialog.close());
});
mascotDialog?.addEventListener('click', event => {
  if (event.target === mascotDialog) mascotDialog.close();
});

const edenDialog = document.querySelector('.eden-dialog');
const homeBrand = document.querySelector('[data-logo-secret]');
let logoTapCount = 0;
let lastLogoTap = 0;
homeBrand?.addEventListener('click', event => {
  event.preventDefault();
  const now = Date.now();
  logoTapCount = now - lastLogoTap < 1800 ? logoTapCount + 1 : 1;
  lastLogoTap = now;
  if (logoTapCount >= 3) {
    logoTapCount = 0;
    edenDialog?.showModal();
    return;
  }
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
});
edenDialog?.querySelectorAll('.eden-close, .eden-done').forEach(button => {
  button.addEventListener('click', () => edenDialog.close());
});
edenDialog?.addEventListener('click', event => {
  if (event.target === edenDialog) edenDialog.close();
});

const truckTimers = new WeakMap();
document.querySelectorAll('.truck-secret').forEach(button => button.addEventListener('click', () => {
  const scene = button.closest('.event-photo, .events-truck');
  const surprise = scene?.querySelector('.truck-surprise');
  const live = scene?.querySelector('.truck-live');
  if (!surprise) return;
  clearTimeout(truckTimers.get(surprise));
  surprise.classList.remove('is-playing');
  void surprise.offsetWidth;
  scene.classList.add('is-surprising');
  surprise.classList.add('is-playing');
  if (live) live.textContent = 'Bis bald!';
  truckTimers.set(surprise, setTimeout(() => {
    surprise.classList.remove('is-playing');
    scene.classList.remove('is-surprising');
    if (live) live.textContent = '';
  }, 4300));
}));

const dialog = document.querySelector('.inquiry-dialog');
const inquiryTitle = document.querySelector('#inquiry-title');
const inquiryForm = document.querySelector('#inquiry-form');
let inquiryType = 'Foodtruck';
let inquiryEventTitle = '';
function openInquiry(type, eventTitle = '') {
  if (!dialog || !inquiryTitle) return;
  inquiryType = ['Catering', 'Foodtruck', 'Reservierung'].includes(type) ? type : 'Foodtruck';
  inquiryEventTitle = inquiryType === 'Reservierung' ? eventTitle : '';
  inquiryTitle.textContent = inquiryType === 'Reservierung' ? 'Reservierung anfragen' : `${inquiryType} anfragen`;
  inquiryForm?.reset();
  const reservation = inquiryType === 'Reservierung';
  const dateInput = inquiryForm?.elements.namedItem('event');
  if (dateInput) {
    dateInput.required = reservation;
    dateInput.placeholder = reservation ? 'Datum und Uhrzeit' : 'Wann und wofür?';
  }
  const dateLabel = dialog.querySelector('[data-inquiry-date-label]');
  if (dateLabel) dateLabel.textContent = reservation ? 'Wunschtermin' : 'Termin / Anlass';
  const guestsLabel = dialog.querySelector('[data-reservation-guests]');
  if (guestsLabel) guestsLabel.hidden = !reservation;
  const guestsInput = inquiryForm?.elements.namedItem('guests');
  if (guestsInput) guestsInput.required = reservation;
  const intro = dialog.querySelector('[data-inquiry-intro]');
  if (intro) intro.textContent = reservation
    ? 'Das Formular öffnet einen E-Mail-Entwurf. Die Anfrage wird erst versendet, wenn Sie die Nachricht dort abschicken. Eine Reservierung gilt erst nach Bestätigung durch das Restaurant.'
    : 'Dieses Formular öffnet einen E-Mail-Entwurf. Es sendet und speichert selbst keine Daten.';
  const status = dialog.querySelector('.form-status');
  if (status) status.textContent = '';
  if (!dialog.open) dialog.showModal();
}
document.querySelectorAll('[data-inquiry]').forEach(button => button.addEventListener('click', event => {
  event.preventDefault();
  const eventTitle = button.closest('[data-special]')?.querySelector('[data-special-title]')?.textContent?.trim() || '';
  openInquiry(button.dataset.inquiry, eventTitle);
}));
dialog?.querySelector('.dialog-close')?.addEventListener('click', () => dialog.close());
dialog?.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
inquiryForm?.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(inquiryForm);
  const reservation = inquiryType === 'Reservierung';
  const subject = reservation
    ? `Taste of Eden – Reservierungsanfrage${inquiryEventTitle ? `: ${inquiryEventTitle}` : ''}`
    : `Taste of Eden – ${inquiryType}-Anfrage`;
  const body = reservation
    ? [
      `Event: ${inquiryEventTitle || 'Besonderer Anlass'}`,
      `Name: ${data.get('name') || ''}`,
      `E-Mail: ${data.get('email') || ''}`,
      `Wunschtermin: ${data.get('event') || ''}`,
      `Personen: ${data.get('guests') || ''}`,
      '',
      String(data.get('message') || '')
    ].join('\n')
    : [
      `Name: ${data.get('name') || ''}`,
      `E-Mail: ${data.get('email') || ''}`,
      `Termin / Anlass: ${data.get('event') || ''}`,
      '',
      String(data.get('message') || '')
    ].join('\n');
  const mailto = `mailto:tasteofedenklg@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const status = dialog?.querySelector('.form-status');
  if (status) status.textContent = 'Ihr E-Mail-Programm sollte jetzt einen Entwurf öffnen. Die Nachricht wurde noch nicht versendet.';
  window.location.href = mailto;
});
if (location.hash === '#foodtruck-anfrage') openInquiry('Foodtruck');
if (location.hash === '#catering-anfrage') openInquiry('Catering');
