/* js/main.js
   Improved shared JS for the Kode site (shared across pages).
   - Contact form: only shows success after confirmed 2xx response.
   - Clears the form AFTER success (form.reset()).
   - Disables submit while sending to prevent double submits.
   - Better error messages and console logging for debugging.
   - Other helpers: nav highlighting, typewriter init, tooltips, view services button.
*/

(function () {
  // --- Nav highlighting ---
  function setActiveNav() {
    const links = document.querySelectorAll('.site-nav .nav-link');
    const path = location.pathname.split('/').pop() || 'index.html';
    links.forEach(a => {
      const href = a.getAttribute('href') || '';
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

  // --- Typewriter (home only) ---
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

  // --- Scroll helper used on home ---
  function scrollToServices() {
    const el = document.getElementById('services');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  // --- Tooltip focus handlers for service cards ---
  function initCardTooltips() {
    document.querySelectorAll('.service-card').forEach(card => {
      const tip = card.querySelector('.tooltip');
      if (!tip) return;
      card.addEventListener('focus', () => { tip.style.opacity = 1; });
      card.addEventListener('blur', () => { tip.style.opacity = 0; });
      card.addEventListener('mouseover', () => { tip.style.opacity = 1; });
      card.addEventListener('mouseout', () => { tip.style.opacity = 0; });
    });
  }

  // --- Contact form handling (AJAX to Formspree) ---
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const successEl = document.getElementById('form-success');
    const errorEl = document.getElementById('form-error');
    const submitButton = form.querySelector('button[type="submit"]');

    function setSending(isSending) {
      if (submitButton) {
        submitButton.disabled = isSending;
        submitButton.setAttribute('aria-busy', isSending ? 'true' : 'false');
      }
    }

    function showSuccess(msg) {
      if (successEl) {
        successEl.hidden = false;
        successEl.textContent = msg || 'Thanks — your message was sent. We will be in touch within 24 hours.';
      }
      if (errorEl) errorEl.hidden = true;
    }

    function showError(msg) {
      if (errorEl) {
        errorEl.hidden = false;
        errorEl.textContent = msg || 'Oops — there was a problem sending your message. Please try again or email us directly.';
      }
      if (successEl) successEl.hidden = true;
    }

    async function onSubmit(e) {
      e.preventDefault();

      // hide prior messages
      if (successEl) successEl.hidden = true;
      if (errorEl) errorEl.hidden = true;

      // Basic client-side validity; if invalid, let browser show message
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const action = (form.getAttribute('action') || '').trim();
      if (!action) {
        console.error('Contact form has no action attribute.');
        showError('Form misconfigured: no action URL.');
        return;
      }

      const method = (form.method || 'POST').toUpperCase();
      const data = new FormData(form);

      setSending(true);

      try {
        const res = await fetch(action, {
          method: method,
          body: data,
          headers: { 'Accept': 'application/json' }
        });

        // parse response based on content-type
        const contentType = res.headers.get('content-type') || '';
        let responseBody = null;
        try {
          if (contentType.includes('application/json')) {
            responseBody = await res.json();
          } else {
            responseBody = await res.text();
          }
        } catch (parseErr) {
          responseBody = null;
          console.warn('Could not parse response body', parseErr);
        }

        if (res.ok) {
          // Only AFTER confirmed success:
          showSuccess();
          // Clear the form AFTER success:
          form.reset();
          // Move focus to the first input for accessibility
          const firstInput = form.querySelector('input, textarea, select');
          if (firstInput) firstInput.focus();
        } else {
          // Non-2xx: surface message when available
          console.error('Form submission failed', res.status, responseBody);
          if (responseBody) {
            if (typeof responseBody === 'object' && responseBody.error) {
              showError('Server: ' + responseBody.error);
            } else if (typeof responseBody === 'string') {
              showError(responseBody);
            } else {
              showError('Server returned an error. Status: ' + res.status);
            }
          } else {
            showError('Server returned status ' + res.status + '. See console for details.');
          }
        }
      } catch (err) {
        // Network/CORS or other fetch error
        console.error('Network/fetch error while sending form:', err);
        showError('Network error while sending the form. If the problem persists, email us directly.');
        // NOTE: intentionally not auto-falling back to native submit to avoid duplicate sends.
      } finally {
        setSending(false);
      }
    }

    // Ensure single listener
    form.removeEventListener('submit', onSubmit);
    form.addEventListener('submit', onSubmit);
  }

  // --- Attach view services button on home ---
  function initViewServicesButton() {
    const btn = document.getElementById('view-services');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const servicesEl = document.getElementById('services');
      const isHome = location.pathname.endsWith('index.html') || location.pathname === '/';
      if (servicesEl && isHome) {
        servicesEl.scrollIntoView({ behavior: 'smooth' });
      } else {
        location.href = 'services.html';
      }
    });
  }

  // --- Init on DOM ready ---
  document.addEventListener('DOMContentLoaded', function () {
    setActiveNav();
    initCardTooltips();
    initContactForm();
    initViewServicesButton();

    const isHome = location.pathname.endsWith('index.html') || location.pathname === '/';
    if (isHome) initTypewriter();
  });

  // Expose helpers if needed
  window.initTypewriter = initTypewriter;
  window.scrollToServices = scrollToServices;

})();
