/* js/main.js
   Enhanced interactive engine for Kode Creative Studio (Light Mode Edition):
   1. Interactive Neural-Node Particle Canvas (reacts to mouse movement)
   2. 3D Perspective Tilt Cards with dynamic light sheen
   3. Magnetic CTA Buttons
   4. Interactive Service Category Filter (Services Page)
   5. Typewriter Hero Engine
   6. Smart Service Pre-Selection via URL (?service=...)
   7. Formspree AJAX Submission with full validation
*/

(function () {
  'use strict';

  // --- 1. Interactive Neural-Constellation Canvas ---
  function initNeuralCanvas() {
    const canvas = document.getElementById('neural-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = { x: null, y: null, radius: 160 };

    window.addEventListener('mousemove', e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mouseout', () => {
      mouse.x = null;
      mouse.y = null;
    });

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      createParticles();
    });

    let particles = [];

    function createParticles() {
      particles = [];
      const count = Math.min(Math.floor((width * height) / 18000), 75);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.55,
          vy: (Math.random() - 0.5) * 0.55,
          size: Math.random() * 2.2 + 1.2
        });
      }
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Draw node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 119, 255, 0.35)';
        ctx.fill();

        // Connect nearby nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.hypot(dx, dy);

          if (dist < 135) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 119, 255, ${(1 - dist / 135) * 0.16})`;
            ctx.lineWidth = 1;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Interactive cursor tether
        if (mouse.x !== null && mouse.y !== null) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);

          if (dist < mouse.radius) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 162, 255, ${(1 - dist / mouse.radius) * 0.42})`;
            ctx.lineWidth = 1.3;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    }

    createParticles();
    animate();
  }

  // --- 2. Navigation & Mobile Drawer ---
  function initNavigation() {
    const links = document.querySelectorAll('.site-nav .nav-link');
    const path = location.pathname.split('/').pop() || 'index.html';

    links.forEach(a => {
      const href = a.getAttribute('href') || '';
      const normalizedHref = href.split('/').pop() || 'index.html';
      if (normalizedHref === path) {
        a.setAttribute('aria-current', 'page');
        a.classList.add('active');
      } else {
        a.removeAttribute('aria-current');
        a.classList.remove('active');
      }
    });

    const toggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.site-nav');
    if (toggle && nav) {
      toggle.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(isOpen));
      });
    }
  }

  // --- 3. Hero Typewriter ---
  const words = [
    "Ignite Your Brand with Kode.",
    "Web Design. Engineering. Identity.",
    "Where Aesthetic Precision Meets Code.",
    "Bring Your Digital Vision to Life."
  ];
  let twElem = null;
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function initTypewriter() {
    twElem = document.getElementById('typewriter');
    if (!twElem) return;
    typeWriterLoop();
  }

  function typeWriterLoop() {
    if (!twElem) return;
    const currentWord = words[wordIndex];

    charIndex = isDeleting ? charIndex - 1 : charIndex + 1;
    twElem.textContent = currentWord.substring(0, charIndex);

    let speed = isDeleting ? 30 : 65;

    if (!isDeleting && charIndex === currentWord.length) {
      speed = 1800;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      speed = 400;
    }

    setTimeout(typeWriterLoop, speed);
  }

  // --- 4. 3D Tilt Cards, Specular Sheen & Click Routing ---
  function initCards() {
    const tiltCards = document.querySelectorAll('.tilt-card');

    tiltCards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Update light sheen position
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);

        // Subtle 3D tilt
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -4.5;
        const rotateY = ((x - centerX) / centerX) * 4.5;

        card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    });

    // Clickable service cards route to contact form with service selected
    const serviceCards = document.querySelectorAll('.service-card[data-service]');
    serviceCards.forEach(card => {
      const navigateToService = () => {
        const serviceName = card.getAttribute('data-service');
        if (serviceName) {
          location.href = `contact.html?service=${encodeURIComponent(serviceName)}`;
        }
      };

      card.addEventListener('click', navigateToService);
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigateToService();
        }
      });
    });
  }

  // --- 5. Magnetic Buttons ---
  function initMagneticButtons() {
    const buttons = document.querySelectorAll('.magnetic-btn');
    buttons.forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.18;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.22;
        btn.style.transform = `translate(${x}px, ${y}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0px, 0px)';
      });
    });
  }

  // --- 6. Interactive Service Filter Tabs (Services Page) ---
  function initServiceFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.service-card[data-category]');
    if (!filterBtns.length || !cards.length) return;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        const filter = btn.getAttribute('data-filter');

        cards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.classList.remove('hidden-card');
          } else {
            card.classList.add('hidden-card');
          }
        });
      });
    });
  }

  // --- 7. Pre-fill Contact Form from URL Query ---
  function initServicePreselect() {
    const selectEl = document.getElementById('service-select');
    if (!selectEl) return;

    const params = new URLSearchParams(window.location.search);
    const requestedService = params.get('service');
    if (!requestedService) return;

    const options = Array.from(selectEl.options);
    const match = options.find(
      opt => opt.value.toLowerCase() === requestedService.toLowerCase()
    );
    if (match) {
      selectEl.value = match.value;
    }
  }

  // --- 8. Scroll Reveal Observer ---
  function initScrollReveal() {
    const revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;

    if (!('IntersectionObserver' in window)) {
      revealEls.forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    revealEls.forEach(el => observer.observe(el));
  }

  // --- 9. Smooth Scroll Button on Home ---
  function initViewServicesButton() {
    const btn = document.getElementById('view-services');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const servicesEl = document.getElementById('services');
      if (servicesEl) {
        servicesEl.scrollIntoView({ behavior: 'smooth' });
      } else {
        location.href = 'services.html';
      }
    });
  }

  // --- 10. Contact Form AJAX Handler (Formspree) ---
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const successEl = document.getElementById('form-success');
    const errorEl = document.getElementById('form-error');
    const submitButton = form.querySelector('button[type="submit"]');
    const btnText = submitButton ? submitButton.querySelector('.btn-text') : null;
    const defaultBtnLabel = btnText ? btnText.textContent : 'Transmit Message';

    function setSending(isSending) {
      if (!submitButton) return;
      submitButton.disabled = isSending;
      submitButton.setAttribute('aria-busy', isSending ? 'true' : 'false');
      if (btnText) {
        btnText.textContent = isSending ? 'Transmitting...' : defaultBtnLabel;
      }
    }

    function showSuccess(msg) {
      if (successEl) {
        successEl.hidden = false;
        successEl.textContent = msg || "Transmission received — we'll be in touch within 24 hours.";
      }
      if (errorEl) errorEl.hidden = true;
    }

    function showError(msg) {
      if (errorEl) {
        errorEl.hidden = false;
        errorEl.textContent = msg || 'Transmission failed — please try again or email kodecreativestudio@gmail.com directly.';
      }
      if (successEl) successEl.hidden = true;
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      if (successEl) successEl.hidden = true;
      if (errorEl) errorEl.hidden = true;

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const action = (form.getAttribute('action') || '').trim();
      if (!action) {
        showError('Form configuration error: missing endpoint.');
        return;
      }

      const data = new FormData(form);
      setSending(true);

      try {
        const res = await fetch(action, {
          method: (form.method || 'POST').toUpperCase(),
          body: data,
          headers: { Accept: 'application/json' }
        });

        const contentType = res.headers.get('content-type') || '';
        let responseBody = null;
        try {
          responseBody = contentType.includes('application/json')
            ? await res.json()
            : await res.text();
        } catch (_) {
          responseBody = null;
        }

        if (res.ok) {
          showSuccess();
          form.reset();
        } else {
          if (responseBody && typeof responseBody === 'object' && responseBody.error) {
            showError(`Server error: ${responseBody.error}`);
          } else {
            showError(`Transmission error (Status ${res.status}). Please try again.`);
          }
        }
      } catch (err) {
        console.error('Network error while sending form:', err);
        showError('Network error while transmitting. Please check your connection or email us directly.');
      } finally {
        setSending(false);
      }
    });
  }

  // --- Boot ---
  document.addEventListener('DOMContentLoaded', () => {
    initNeuralCanvas();
    initNavigation();
    initTypewriter();
    initCards();
    initMagneticButtons();
    initServiceFilters();
    initServicePreselect();
    initScrollReveal();
    initViewServicesButton();
    initContactForm();
  });
})();
