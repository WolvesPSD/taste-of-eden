// Bearbeitbare Inhalte aus Pages CMS. Das vorhandene HTML bleibt als Fallback sichtbar.
const mediaUrl = value => {
  if (typeof value !== 'string') return null;
  const path = value.replace(/^\/+/, '');
  if (!path.startsWith('assets/') || path.includes('..') || /[?#\\]/.test(path)) return null;
  return path;
};

const setText = (selector, value) => {
  const element = document.querySelector(selector);
  if (element && typeof value === 'string') element.textContent = value;
};

const setImage = (selector, path, alt) => {
  const element = document.querySelector(selector);
  const url = mediaUrl(path);
  if (!element || !url) return;
  element.src = url;
  if (typeof alt === 'string') element.alt = alt;
};

function applyHome(content) {
  if (Array.isArray(content.hero) && content.hero.length) {
    const container = document.querySelector('.hero');
    const validSlides = content.hero.filter(item => mediaUrl(item.main) && mediaUrl(item.secondary));
    if (container && validSlides.length) {
      container.querySelectorAll('[data-slide]').forEach(slide => slide.remove());
      const shade = container.querySelector('.hero-shade');
      validSlides.forEach((item, index) => {
        const slide = document.createElement('div');
        slide.className = `hero-images${index === 0 ? ' is-active' : ''}`;
        slide.dataset.slide = '';
        slide.setAttribute('aria-hidden', String(index !== 0));
        for (const [kind, url, alt] of [['main', mediaUrl(item.main), item.main_alt], ['secondary', mediaUrl(item.secondary), item.secondary_alt]]) {
          const frame = document.createElement('div');
          frame.className = `hero-image hero-image-${kind}`;
          const image = document.createElement('img');
          image.src = url;
          image.alt = typeof alt === 'string' ? alt : '';
          frame.append(image);
          slide.append(frame);
        }
        container.insertBefore(slide, shade);
      });
      document.dispatchEvent(new Event('sitecontent:hero'));
    }
  }

  if (Array.isArray(content.highlights) && content.highlights.length) {
    const grid = document.querySelector('.dish-grid');
    if (grid) {
      grid.replaceChildren();
      content.highlights.forEach((item, index) => {
        const url = mediaUrl(item.image);
        if (!url) return;
        const card = document.createElement('article');
        card.className = 'dish-card';
        const image = document.createElement('img');
        image.src = url;
        image.alt = item.alt || '';
        image.loading = 'lazy';
        const copy = document.createElement('div');
        const number = document.createElement('span');
        number.textContent = String(index + 1).padStart(2, '0');
        const title = document.createElement('h3');
        title.textContent = item.title || '';
        const description = document.createElement('p');
        description.textContent = item.description || '';
        copy.append(number, title, description);
        card.append(image, copy);
        grid.append(card);
      });
    }
  }

  setText('.gallery-heading > p', content.gallery_intro);
  if (Array.isArray(content.gallery) && content.gallery.length) {
    const thumbs = document.querySelector('.gallery-thumbs');
    const validImages = content.gallery.filter(item => mediaUrl(item.image));
    if (thumbs && validImages.length) {
      thumbs.replaceChildren();
      validImages.forEach((item, index) => {
        const url = mediaUrl(item.image);
        if (!url) return;
        const button = document.createElement('button');
        button.className = 'gallery-thumb';
        button.type = 'button';
        button.setAttribute('aria-pressed', String(index === 0));
        button.setAttribute('aria-label', `${item.caption || 'Bild'} anzeigen`);
        button.dataset.gallerySrc = url;
        button.dataset.galleryAlt = item.alt || '';
        button.dataset.galleryCaption = item.caption || '';
        const image = document.createElement('img');
        image.src = url;
        image.alt = '';
        image.loading = 'lazy';
        const label = document.createElement('span');
        label.textContent = item.thumb_label || item.caption || '';
        button.append(image, label);
        thumbs.append(button);
      });
      document.dispatchEvent(new Event('sitecontent:gallery'));
    }
  }
}

function applyMenu(content) {
  setText('.menu-hero > div > p:last-child', content.intro);
  setImage('.menu-hero > img', content.image, content.image_alt);
  setText('.menu-note', content.note);
  setText('.menu-end > p', content.closing);
  if (!Array.isArray(content.categories) || !content.categories.length) return;
  const wrapper = document.querySelector('.menu-categories');
  if (!wrapper) return;
  wrapper.replaceChildren();
  content.categories.forEach(category => {
    const section = document.createElement('section');
    section.className = 'menu-category';
    const eyebrow = document.createElement('p');
    eyebrow.className = 'eyebrow';
    eyebrow.textContent = category.eyebrow || '';
    const title = document.createElement('h2');
    title.textContent = category.title || '';
    const list = document.createElement('ul');
    (Array.isArray(category.items) ? category.items : []).forEach(entry => {
      const item = document.createElement('li');
      const name = document.createElement('span');
      name.textContent = typeof entry === 'string' ? entry : entry?.name || '';
      item.append(name);
      if (entry && typeof entry.price === 'string' && entry.price.trim()) {
        const price = document.createElement('span');
        price.className = 'menu-price';
        price.textContent = entry.price.trim();
        item.append(price);
      }
      list.append(item);
    });
    section.append(eyebrow, title, list);
    if (category.note) {
      const note = document.createElement('p');
      note.className = 'menu-small';
      note.textContent = category.note;
      section.append(note);
    }
    wrapper.append(section);
  });
}

function applyEvents(content) {
  setText('.events-lead', content.lead);
  setText('.events-panel > p:not([class])', content.description);
  setText('.event-copy > p:not([class])', content.teaser);
  setImage('.events-truck > img', content.truck_image, content.truck_alt);
  setImage('.events-table-visual > img', content.table_image, content.table_alt);
  setImage('.events-dish > img', content.dish_image, content.dish_alt);
}

function applySpecial(content) {
  document.querySelectorAll('[data-special]').forEach(section => {
    const active = content.enabled === true && typeof content.title === 'string' && content.title.trim();
    section.hidden = !active;
    if (!active) return;
    const write = (selector, value) => {
      const element = section.querySelector(selector);
      if (element) {
        element.textContent = typeof value === 'string' ? value : '';
        element.hidden = !value;
      }
    };
    write('[data-special-eyebrow]', content.eyebrow);
    write('[data-special-title]', content.title);
    write('[data-special-date]', content.date);
    write('[data-special-description]', content.description);
    const reserve = section.querySelector('[data-special-reserve]');
    if (reserve) {
      reserve.hidden = content.reservation_enabled !== true;
      reserve.textContent = typeof content.reservation_label === 'string' && content.reservation_label.trim()
        ? content.reservation_label.trim()
        : 'Reservierung anfragen';
    }
    const reservationNotice = section.querySelector('[data-special-reservation-notice]');
    if (reservationNotice) reservationNotice.hidden = content.reservation_enabled !== true;
    const image = section.querySelector('[data-special-image]');
    const imagePath = mediaUrl(content.image);
    if (image) {
      image.hidden = !imagePath;
      if (imagePath) {
        image.src = imagePath;
        image.alt = content.image_alt || '';
      }
    }
    const link = section.querySelector('[data-special-link]');
    const destination = typeof content.link_url === 'string' ? content.link_url.trim() : '';
    const allowed = /^https:\/\//.test(destination) || /^(?:[a-z0-9-]+\.html)(?:#[a-z0-9-]+)?$/i.test(destination);
    if (link) {
      link.hidden = !allowed || !content.link_label;
      if (allowed && content.link_label) {
        link.href = destination;
        link.textContent = content.link_label;
        if (destination.startsWith('https://')) {
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
        } else {
          link.removeAttribute('target');
          link.removeAttribute('rel');
        }
      }
    }
  });
}

async function loadContent(name, apply) {
  try {
    const response = await fetch(`content/${name}.json`, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    apply(await response.json());
  } catch (error) {
    console.warn(`Bearbeitbare Inhalte (${name}) nicht geladen; HTML-Fallback bleibt sichtbar.`, error);
  }
}

const page = document.body.dataset.page;
if (page === 'home') {
  loadContent('home', applyHome);
  loadContent('events', applyEvents);
  loadContent('special', applySpecial);
} else if (page === 'menu') {
  loadContent('menu', applyMenu);
} else if (page === 'events') {
  loadContent('events', applyEvents);
  loadContent('special', applySpecial);
}
