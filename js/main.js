/* Main JS for Kode site (shared across pages) */

(function () {
  // Utility: mark current page in nav
  function setActiveNav() {
    const links = document.querySelectorAll('.site-nav .nav-link');
    const path = location.pathname.split('/').pop() || 'index.html';
    links.forEach(a => {
      const href = a.getAttribute('href') || '';
      // Normalize index path
      let normalizedHref = href.split('/').pop() || 'index.html';
      if (normalizedHref === '') normalizedHref = 'index.html';
      if (normalizedHref === path) {
        a.setAttribute('aria-current', 'page');
        a.classList.add('active');
      } else {
        a.removeAttribute('aria-current');
        a.classList.remove('active');
      }
    });
  }

  // Typewriter (home only)
  const words = [
    "Ignite Your Brand with Kode...",
    "Web Design. Graphic Design. Websites. Edits. Logos.",
    "Creativity Meets Code.",
    "Bring Your Vision To Life!"
  ];
  let twElem = null;
  let wordIndex = 0, charIndex = 0, isDeleting = false, twTimeout = null;

  function initTypewriter() {
    twElem = document.getElementById("typewriter");
    if (!twElem) return;
    function getLongestWord(words) {
      let max = '';
      for (let w of words) if (w.length > max.length) max = w;
      return max;
    }
    const longest = getLongestWord(words);
    twElem.style.minWidth = (longest.length * 1.15) + "ch";
    typeWriter();
  }

  function typeWriter() {
    if (!twElem) return;
    let word = words[wordIndex];
    if (isDeleting) charIndex--;
    else charIndex++;
    twElem.textContent = word.substring(0, charIndex);
    let typeSpeed = isDeleting ? 35 : 75;
    if (!isDeleting && charIndex === word.length) {
      typeSpeed = 1200; isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      typeSpeed = 470;
    }
    twTimeout = setTimeout(typeWriter, typeSpeed);
  }

  // Scroll helper used on home
  function scrollToServices() {
    const el = document.getElementById('services');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  // Tooltip focus handlers for service cards
  function initCardTooltips() {
    document.querySelectorAll('.service-card').forEach(card => {
      const tip = card.querySelector('.tooltip');
      card.addEventListener('focus', () => { if (tip) tip.style.opacity = 1; });
      card.addEventListener('blur', () => { if (tip) tip.style.opacity = 0; });
      card.addEventListener('mouseover', () => { if (tip) tip.style.opacity = 1; });
      card.addEventListener('mouseout', () => { if (tip) tip.style.opacity = 0; });
    });
  }

  // Contact form handling (AJAX to Formspree with graceful fallback)
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    const successEl = document.getElementById('form-success');
    const errorEl = document.getElementById('form-error');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (successEl) successEl.hidden = true;
      if (errorEl) errorEl.hidden = true;

      const action = form.getAttribute('action');
      const formData = new FormData(form);
      // Send with fetch; if it fails, let the user know and fallback to native submit
      fetch(action, {
        method: form.method || 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      }).then(resp => {
        if (resp.ok) {
          if (successEl) { successEl.hidden = false; }
          form.reset();
        } else {
          return resp.json().then(data => Promise.reject(data));
        }
      }).catch(() => {
        // Show error notice; don't auto-fallback
        if (errorEl) { errorEl.hidden = false; }
      });
    });
  }

  // Attach view services button on home
  function initViewServicesButton() {
    const btn = document.getElementById('view-services');
    if (!btn) return;
    btn.addEventListener('click', () => {
      // Prefer smooth scroll when on the home page preview; otherwise navigate to services page
      const servicesEl = document.getElementById('services');
      if (servicesEl && location.pathname.endsWith('index.html') || location.pathname === '/') {
        servicesEl.scrollIntoView({ behavior: 'smooth' });
      } else {
        location.href = 'services.html';
      }
    });
  }

  // Init on DOM ready
  document.addEventListener('DOMContentLoaded', function () {
    setActiveNav();
    initCardTooltips();
    initContactForm();
    initViewServicesButton();
    // If the page is index, typewriter initialisation is handled inline by index.html script for clarity.
  });

  // Expose some helpers globally for inline usage from index.html
  window.initTypewriter = initTypewriter;
  window.scrollToServices = scrollToServices;

})();
