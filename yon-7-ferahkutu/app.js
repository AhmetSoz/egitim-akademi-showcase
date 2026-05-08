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

  try {
    const saved = localStorage.getItem('akademi-lang');
    if (saved) setLanguage(saved);
  } catch(e) {}

  langBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      setLanguage(btn.dataset.setLang);
    });
  });

  // 4. Bento Preloader
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

  // 3. Spring Reveal Animations (Bento Cards)
  const revealElements = document.querySelectorAll('.reveal');
  const revealOptions = {
    threshold: 0.1,
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

  // 4. Demo Form Submit
  const demoForm = document.querySelector('[data-demo]');
  if(demoForm) {
    demoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = demoForm.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;
      const isEn = root.getAttribute('data-lang') === 'en';
      
      btn.innerHTML = isEn ? "Applied!" : "Başvuruldu!";
      btn.style.background = "var(--accent)";
      btn.style.color = "#fff";
      
      setTimeout(() => {
        demoForm.reset();
        btn.innerHTML = originalText;
        btn.style.background = "";
        btn.style.color = "";
      }, 3000);
    });
  }

  // 5. Lenis Smooth Scroll Init
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

  // 6. Magnetic Buttons
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
