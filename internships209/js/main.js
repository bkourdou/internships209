// =============================================
//   Internships209 — Main JavaScript
//   Shared utilities across all pages
// =============================================

// --- Mobile menu ---
function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const btn  = document.querySelector('.nav-mobile-toggle');
  if (!menu) return;
  const isOpen = menu.classList.toggle('open');
  if (btn) btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}

function closeMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const btn  = document.querySelector('.nav-mobile-toggle');
  if (menu) menu.classList.remove('open');
  if (btn)  btn.setAttribute('aria-expanded', 'false');
}

// --- Language toggle (EN / ES) ---
const TRANSLATIONS = {
  es: {
    'Home':                    'Inicio',
    'Browse Listings':         'Ver Oportunidades',
    'Resources':               'Recursos',
    'For Employers':           'Para Empleadores',
    'About':                   'Sobre Nosotros',
    'Find an Internship':      'Buscar Pasantías',
    'Browse All Internships →':'Ver Todas las Pasantías →',
    'Guides & Resources':      'Guías y Recursos',
    'Browse by Category':      'Buscar por Categoría',
    'Featured Opportunities':  'Oportunidades Destacadas',
    'View All Listings →':     'Ver Todas →',
    'All Resources →':         'Todos los Recursos →',
    'Resources & Guides':      'Recursos y Guías',
    'Browse Internships':      'Ver Pasantías',
    'Filter Results':          'Filtrar Resultados',
    'Apply Filters':           'Aplicar Filtros',
    'Clear':                   'Limpiar',
    'Paid Only':               'Solo Pagadas',
    'Any Pay Type':            'Cualquier Tipo',
    'All Cities':              'Todas las Ciudades',
    'Remote / Hybrid OK':      'Remoto / Híbrido OK',
    'High School (14–18)':     'Preparatoria (14–18)',
    'College / University':    'Universidad',
    'Government':              'Gobierno',
    'Workforce Development':   'Desarrollo Laboral',
    'Private Sector':          'Sector Privado',
    'How to Get a Work Permit':'Cómo Obtener un Permiso de Trabajo',
    'Write Your First Resume': 'Escribe tu Primer Currículum',
    "Can't Afford Unpaid?":    '¿No Puedes Trabajar Sin Pago?',
    'Read guide →':            'Leer guía →',
    'See options →':           'Ver opciones →',
  }
};

let currentLang = localStorage.getItem('lang') || 'en';

function toggleLang() {
  currentLang = currentLang === 'en' ? 'es' : 'en';
  localStorage.setItem('lang', currentLang);
  applyLang();
}

function applyLang() {
  const isES = currentLang === 'es';
  const btn = document.getElementById('langBtn');
  if (btn) {
    btn.textContent = isES ? 'EN' : 'ES';
    btn.title = isES ? 'Switch to English' : 'Switch to Spanish';
  }
  document.documentElement.lang = isES ? 'es' : 'en';

  // Swap text on elements with data-en / data-es attributes
  document.querySelectorAll('[data-en][data-es]').forEach(el => {
    const text = isES ? el.getAttribute('data-es') : el.getAttribute('data-en');
    if (text) el.innerHTML = text;
  });

  // Also swap text nodes in elements that contain translateable strings
  document.querySelectorAll('[data-translate]').forEach(el => {
    const key = el.getAttribute('data-translate');
    const val = isES ? (TRANSLATIONS.es[key] || key) : key;
    el.textContent = val;
  });
}

// --- Accordion ---
function toggleAccordion(btn) {
  const item = btn.closest('.accordion-item');
  const isOpen = item.classList.contains('open');
  // Close all siblings and update their aria-expanded
  const siblings = item.parentElement.querySelectorAll('.accordion-item');
  siblings.forEach(s => {
    s.classList.remove('open');
    const h = s.querySelector('.accordion-header');
    if (h) h.setAttribute('aria-expanded', 'false');
  });
  // Toggle current
  if (!isOpen) {
    item.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }
}

// --- Date utilities ---
// Parse YYYY-MM-DD as LOCAL midnight to avoid UTC-offset off-by-one errors
function _parseLocalDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function daysUntil(dateStr) {
  if (!dateStr || dateStr === 'Rolling') return null;
  const target = _parseLocalDate(dateStr);
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.ceil((target - todayMidnight) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr) {
  if (!dateStr || dateStr === 'Rolling') return dateStr;
  const d = _parseLocalDate(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// --- Category label ---
function catLabel(cat) {
  const map = {
    government: '🏛 Government',
    workforce: '💼 Workforce',
    private: '🏢 Private',
    education: '🎓 College'
  };
  return map[cat] || cat;
}

// --- Listing card renderer (used on homepage featured) ---
function renderListingCard(l) {
  const days = daysUntil(l.deadline);
  const urgentClass = days !== null && days <= 14 ? 'urgent' : '';
  const deadlineText = l.deadline === 'Rolling'
    ? '<span class="badge badge-gray">Rolling deadline</span>'
    : (days !== null && days <= 14
      ? `<span class="badge badge-orange">⚠️ Closes ${formatDate(l.deadline)}</span>`
      : `<span style="font-size:0.8rem; color:var(--gray-500);">Deadline: ${formatDate(l.deadline)}</span>`);

  return `
    <a href="${l.applyUrl}" target="_blank" rel="noopener noreferrer" class="listing-card" style="text-decoration:none;">
      <div class="listing-org">${l.org} · ${l.city}</div>
      <div class="listing-title">${l.title}</div>
      <div class="listing-meta">
        ${l.type === 'paid' || l.type === 'mixed'
          ? '<span class="badge badge-green">💵 Paid</span>'
          : '<span class="badge badge-gray">Unpaid</span>'}
        <span class="badge badge-blue">${catLabel(l.category)}</span>
        ${l.remote ? '<span class="badge badge-gray">🖥 Remote OK</span>' : ''}
      </div>
      <div class="listing-desc">${l.description}</div>
      <div class="listing-footer">
        ${deadlineText}
        <span style="font-size:0.82rem; color:var(--blue-700); font-weight:600;">Apply →</span>
      </div>
    </a>`;
}

// --- Full listing card (used on browse/listings page) ---
function renderListingCardFull(l) {
  const days = daysUntil(l.deadline);
  const isUrgent = days !== null && days <= 14;
  const urgentClass = isUrgent ? 'urgent' : '';
  const isNew = l.dateAdded && (new Date() - _parseLocalDate(l.dateAdded)) < (14 * 24 * 60 * 60 * 1000);

  let deadlineText = '';
  if (l.deadline === 'Rolling') {
    deadlineText = 'Rolling deadline';
  } else if (days !== null && days < 0) {
    deadlineText = 'Deadline passed';
  } else if (days !== null) {
    deadlineText = `Deadline: ${formatDate(l.deadline)}${isUrgent ? ' ⚠️' : ''}`;
  }

  return `
    <a href="${l.applyUrl}" target="_blank" rel="noopener noreferrer" class="listing-card" style="text-decoration:none;">
      <div class="listing-org">${l.org} · ${l.city}</div>
      <div class="listing-title">${l.title}</div>
      <div class="listing-meta">
        ${isNew ? '<span class="badge badge-orange">✨ New</span>' : ''}
        ${l.type === 'paid' || l.type === 'mixed'
          ? '<span class="badge badge-green">💵 Paid</span>'
          : '<span class="badge badge-gray">Unpaid</span>'}
        <span class="badge badge-blue">${catLabel(l.category)}</span>
        ${l.remote ? '<span class="badge badge-gray">🖥 Remote OK</span>' : ''}
        ${l.pay    ? `<span class="badge badge-gray">${l.pay}</span>` : ''}
      </div>
      <div class="listing-desc">${l.description}</div>
      <div style="font-size:0.82rem; color:var(--gray-500); margin-bottom:0.85rem;">
        <strong>Ages:</strong> ${l.ageMin}–${l.ageMax} &nbsp;·&nbsp;
        <strong>Duration:</strong> ${l.duration} &nbsp;·&nbsp;
        <strong>Hours:</strong> ${l.hours}
      </div>
      <div class="listing-footer">
        <span class="listing-deadline ${urgentClass}">${deadlineText}</span>
        <span class="btn btn-primary btn-sm">Apply →</span>
      </div>
    </a>`;
}

// --- Smooth scroll for anchor links (with reliable nav offset) ---
document.addEventListener('DOMContentLoaded', () => {
  applyLang(); // restore saved language on page load

  // Initialize aria-expanded on mobile toggle button
  const mobileToggle = document.querySelector('.nav-mobile-toggle');
  if (mobileToggle) {
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileToggle.setAttribute('aria-controls', 'mobileMenu');
  }

  // Escape key closes mobile menu and accordions
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeMobileMenu();
    }
  });

  // Close mobile menu when clicking outside of it
  document.addEventListener('click', e => {
    const menu = document.getElementById('mobileMenu');
    const toggle = document.querySelector('.nav-mobile-toggle');
    if (menu && menu.classList.contains('open') &&
        !menu.contains(e.target) && e.target !== toggle && !toggle?.contains(e.target)) {
      closeMobileMenu();
    }
  });

  // Initialize aria-expanded on all accordion header buttons
  document.querySelectorAll('.accordion-header').forEach(btn => {
    btn.setAttribute('aria-expanded', 'false');
  });
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const hrefVal = a.getAttribute('href');
      if (!hrefVal || hrefVal === '#') return;
      const target = document.querySelector(hrefVal);
      if (target) {
        e.preventDefault();
        // Use getBoundingClientRect for a reliable offset that accounts for sticky nav height
        const navHeight = document.querySelector('.nav')?.offsetHeight || 64;
        const targetTop = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 16;
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
      }
    });
  });

  // Mark active nav link (skip links with hash or query params to avoid false positives)
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#')) return; // skip anchor-only links
    const cleanHref = href.split('?')[0].split('#')[0];
    if (cleanHref === path) link.classList.add('active');
  });

  // --- Back-to-top button (injected on all pages) ---
  const btt = document.createElement('button');
  btt.id = 'backToTop';
  btt.setAttribute('aria-label', 'Back to top');
  btt.innerHTML = '↑';
  btt.style.cssText = [
    'position:fixed', 'bottom:1.5rem', 'right:1.5rem', 'z-index:900',
    'width:2.75rem', 'height:2.75rem', 'border-radius:50%',
    'background:var(--blue-700,#1A56A4)', 'color:#fff',
    'border:none', 'font-size:1.25rem', 'line-height:1',
    'cursor:pointer', 'opacity:0', 'transition:opacity 0.25s, transform 0.25s',
    'transform:translateY(8px)', 'box-shadow:0 2px 8px rgba(0,0,0,0.18)'
  ].join(';');
  document.body.appendChild(btt);

  const onScroll = () => {
    const show = window.scrollY > 400;
    btt.style.opacity = show ? '1' : '0';
    btt.style.transform = show ? 'translateY(0)' : 'translateY(8px)';
    btt.style.pointerEvents = show ? 'auto' : 'none';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
});
