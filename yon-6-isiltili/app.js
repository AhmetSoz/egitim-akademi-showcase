document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;

  // 1. Dil Seçimi ve LocalStorage Senkronizasyonu
  const langBtns = document.querySelectorAll('[data-set-lang]');
  
  function setLanguage(lang) {
    root.setAttribute('data-lang', lang);
    root.setAttribute('lang', lang);
    langBtns.forEach(b => {
      if(b.dataset.setLang === lang) b.classList.add('active');
      else b.classList.remove('active');
    });
    try { localStorage.setItem('akademi-lang', lang); } catch(e) {}
  }

  // Başlangıçta kayıtlı dili oku
  try {
    const saved = localStorage.getItem('akademi-lang');
    if (saved) setLanguage(saved);
  } catch(e) {}

  // Buton tıklamaları
  langBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      setLanguage(btn.dataset.setLang);
    });
  });

  // 2. Çok Yumuşak Intersection Observer (Glassmorphism Blur Reveal)
  const revealElements = document.querySelectorAll('.reveal');
  const revealOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    });
  }, revealOptions);

  revealElements.forEach(el => revealObserver.observe(el));

  // 3. Demo Form Submit
  const demoForm = document.querySelector('[data-demo]');
  if(demoForm) {
    demoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = demoForm.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;
      const isEn = root.getAttribute('data-lang') === 'en';
      
      btn.innerHTML = isEn ? "Sent!" : "Gönderildi!";
      btn.style.background = "var(--accent)";
      
      setTimeout(() => {
        demoForm.reset();
        btn.innerHTML = originalText;
        btn.style.background = "";
      }, 3000);
    });
  }

  // 4. Preloader
  const preloader = document.getElementById('preloader');
  if (preloader) {
    if (sessionStorage.getItem('akademi-loader-seen')) {
      preloader.style.display = 'none';
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => {
          preloader.classList.add('exit');
          setTimeout(() => preloader.remove(), 1200);
          sessionStorage.setItem('akademi-loader-seen', '1');
        }, 1500);
      });
    }
  }

  // 5. Ambient Mouse Tracking
  const ambient = document.querySelector('.ambient');
  if(ambient) {
    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 40;
      const y = (e.clientY / window.innerHeight - 0.5) * 40;
      ambient.style.transform = `translate(${x}px, ${y}px)`;
    });
  }

  // 6. 3D Tilt Effect on Cards
  const tiltCards = document.querySelectorAll('.train-card, .stat-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xc = rect.width / 2;
      const yc = rect.height / 2;
      const dx = x - xc;
      const dy = y - yc;
      card.style.transform = `perspective(1000px) rotateY(${dx / 20}deg) rotateX(${-dy / 20}deg) translateY(-8px)`;
      card.style.transition = `none`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg) translateY(0)`;
      card.style.transition = `transform 0.5s ease`;
    });
  });

  // 7. Lenis Smooth Scroll Init
  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // 8. Magnetic Buttons
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = `translate(0px, 0px)`;
    });
  });
});

// ============================================================
// FLOATING DOCK — Yön Seçimi + Açılışı İzle
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.floating-dock')) return; // duplicate guard
  const dock = document.createElement('div');
  dock.className = 'floating-dock';
  dock.innerHTML =
    '<a href="../index.html" class="dock-btn dock-back">' +
      '<span class="rp-ico arr-back" aria-hidden="true">←</span>' +
      '<span class="rp-tr">Yön Seçimi</span>' +
      '<span class="rp-en">Pick Direction</span>' +
    '</a>' +
    '<button type="button" class="dock-btn dock-replay">' +
      '<span class="rp-ico" aria-hidden="true">▶</span>' +
      '<span class="rp-tr">Açılışı İzle</span>' +
      '<span class="rp-en">Replay Intro</span>' +
    '</button>';
  document.body.appendChild(dock);
  dock.querySelector('.dock-replay').addEventListener('click', () => {
    try {
      sessionStorage.removeItem('akademi-loader-seen');
      sessionStorage.removeItem('akademi-showcase-loader-seen');
    } catch(e) {}
    location.reload();
  });
});
