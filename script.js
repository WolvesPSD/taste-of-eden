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

const toast = document.querySelector('.demo-toast');
let toastTimer;
document.querySelectorAll('.demo-button').forEach(button => button.addEventListener('click', () => {
  if (!toast) return;
  toast.textContent = `${button.dataset.demo}: Diese Funktion ist in der Vorschau noch nicht verbunden.`;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 5000);
}));

const slides = [...document.querySelectorAll('[data-slide]')];
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

const galleryImage = document.querySelector('#gallery-feature-image');
const galleryCaption = document.querySelector('#gallery-feature-caption');
const galleryThumbs = [...document.querySelectorAll('.gallery-thumb')];
let galleryIndex = 0;
function showGallery(index) {
  if (!galleryImage || !galleryCaption) return;
  galleryIndex = (index + galleryThumbs.length) % galleryThumbs.length;
  const button = galleryThumbs[galleryIndex];
  galleryImage.src = button.dataset.gallerySrc;
  galleryImage.alt = button.dataset.galleryAlt;
  galleryCaption.textContent = button.dataset.galleryCaption;
  galleryThumbs.forEach(thumb => thumb.setAttribute('aria-pressed', String(thumb === button)));
  button.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}
galleryThumbs.forEach((button, index) => button.addEventListener('click', () => showGallery(index)));
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
function openInquiry(type) {
  if (!dialog || !inquiryTitle) return;
  inquiryType = type === 'Catering' ? 'Catering' : 'Foodtruck';
  inquiryTitle.textContent = `${inquiryType} anfragen`;
  inquiryForm?.reset();
  const status = dialog.querySelector('.form-status');
  if (status) status.textContent = '';
  if (!dialog.open) dialog.showModal();
}
document.querySelectorAll('[data-inquiry]').forEach(button => button.addEventListener('click', event => {
  event.preventDefault();
  openInquiry(button.dataset.inquiry);
}));
dialog?.querySelector('.dialog-close')?.addEventListener('click', () => dialog.close());
dialog?.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
inquiryForm?.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(inquiryForm);
  const subject = `Taste of Eden – ${inquiryType}-Anfrage`;
  const body = [
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

