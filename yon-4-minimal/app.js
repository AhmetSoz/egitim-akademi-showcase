// Dil tercihini hemen uygula (FOUC önleme)
(function() {
  try {
    const saved = localStorage.getItem('akademi-lang') || 'tr';
    document.documentElement.setAttribute('data-lang', saved);
    document.documentElement.setAttribute('lang', saved);
  } catch(e) {}
})();

document.addEventListener('DOMContentLoaded', () => {

  // ========== LOADER (anasayfada her açılışta, alt sayfalarda 1 kez) ==========
  const loader = document.getElementById('loader');
  if (loader) {
    const params = new URLSearchParams(location.search);
    const forceIntro = params.has('intro');
    const isHome = /(?:^|\/)index\.html?$/i.test(location.pathname) || /\/$/.test(location.pathname) || location.pathname === '';
    const seen = sessionStorage.getItem('akademi-loader-seen');
    // Anasayfada her zaman göster, alt sayfalarda sadece ilk seferde
    const shouldShow = forceIntro || isHome || !seen;
    if (!shouldShow) {
      loader.remove();
    } else {
      sessionStorage.setItem('akademi-loader-seen', '1');

      // Bg-fill (alt → üst dolma) animasyonunu tetikle
      requestAnimationFrame(() => loader.classList.add('filling'));

      // % sayaç + SVG ring stroke-dashoffset senkron
      const counter = document.getElementById('loaderCount');
      const ringFill = loader.querySelector('.ring-fill');
      const fillDuration = 2200; // bg-fill ile uyumlu
      const tStart = performance.now();
      // easeOutExpo — başta hızlı, sona doğru yavaşlayan premium his
      const ease = (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      function tick(now) {
        const lin = Math.min((now - tStart) / fillDuration, 1);
        const p = ease(lin);
        if (counter) counter.textContent = Math.round(p * 100);
        if (ringFill) ringFill.setAttribute('stroke-dashoffset', (100 - p * 100).toFixed(2));
        if (lin < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);

      // Min loader süresi: animasyonlar otursun
      const minTime = 2800;
      const start = performance.now();
      const removeLoader = () => {
        const elapsed = performance.now() - start;
        const wait = Math.max(0, minTime - elapsed);
        setTimeout(() => {
          loader.classList.add('exit');
          // Exit transition'ı tamamlanmadan kaldırma (panel split'ler 1.5s+ sürer)
          setTimeout(() => loader.remove(), 1700);
        }, wait);
      };
      if (document.readyState === 'complete') removeLoader();
      else window.addEventListener('load', removeLoader);
    }
  }

  // ========== SCROLL PROGRESS BAR ==========
  const sp = document.getElementById('scrollProgress');
  if (sp) {
    const update = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      sp.style.width = max > 0 ? (h.scrollTop / max * 100) + '%' : '0';
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  // ========== FLOATING DOCK (Yön seçimi + Açılışı İzle) ==========
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

  // ========== DİL DEĞİŞTİRİCİ (kısa renk flash + smooth body geçişi) ==========
  let flashing = false;
  document.querySelectorAll('[data-set-lang]').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.setLang;
      const current = document.documentElement.getAttribute('data-lang');
      if (lang === current || flashing) return;
      flashing = true;

      // Kısa renk flash overlay'i — sayfa kapanmaz, sadece akıntı geçer
      const flash = document.createElement('div');
      flash.className = 'lang-flash';
      document.body.appendChild(flash);

      // Flash'ın ortasında dil değişimi (renkler en görünür anda)
      setTimeout(() => {
        document.documentElement.setAttribute('data-lang', lang);
        document.documentElement.setAttribute('lang', lang);
        document.querySelectorAll('[data-set-lang]').forEach(b => b.classList.remove('active'));
        document.querySelectorAll(`[data-set-lang="${lang}"]`).forEach(b => b.classList.add('active'));
        try { localStorage.setItem('akademi-lang', lang); } catch(e) {}
      }, 180);

      // Flash bitince temizle
      setTimeout(() => {
        flash.remove();
        flashing = false;
      }, 750);
    });
    if (btn.dataset.setLang === document.documentElement.getAttribute('data-lang')) {
      btn.classList.add('active');
    }
  });

  // ========== KELİME KELİME BAŞLIK ANİMASYONU ==========
  // .stagger-text içindeki TR ve EN spanlarını kelimelere böl, her birine gecikme ver.
  document.querySelectorAll('.stagger-text').forEach(host => {
    host.querySelectorAll('[data-tr], [data-en]').forEach(langSpan => {
      // <em>...</em> bloklarını koru, geri kalan boşlukla ayrılmış kelimeleri sar
      const original = langSpan.innerHTML;
      const wrapped = original.replace(
        /(<(em|strong|i|b)[^>]*>[^<]*<\/(em|strong|i|b)>|[^\s<]+)/g,
        '<span class="word">$1</span>'
      );
      langSpan.innerHTML = wrapped;
    });
    // Her kelimeye artan gecikme — premium tempo
    host.querySelectorAll('.word').forEach((w, i) => {
      w.style.setProperty('--word-delay', (i * 0.09) + 's');
    });
  });

  // ========== AUTO-STAGGER (kart, modül, etkinlik vs.) ==========
  // Şu kapsayıcıların doğrudan çocuklarına sıralı gecikme ver.
  const staggerParents = [
    '.trainings-grid', '.training-grid', '.training-row',
    '.events-grid', '.event-list',
    '.modules', '.module-list',
    '.gallery-grid', '.gp-grid', '.tmg-grid', '.training-gallery-grid', '.gallery-preview-grid',
    '.stats-grid', '.stats',
    '.features',
    '.feature-icon-row',
    '.theme-cards', '.directions'
  ];
  staggerParents.forEach(sel => {
    document.querySelectorAll(sel).forEach(parent => {
      [...parent.children].forEach((child, i) => {
        if (!child.classList.contains('reveal')) child.classList.add('reveal');
        child.dataset.staggerIndex = i;
      });
    });
  });

  // ========== INTERSECTION OBSERVER (scroll-trigger reveal) ==========
  // rootMargin pozitif: element viewport'a girmeden önce trigger olur,
  // yavaş animasyon scroll ile senkron akar
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const idx = el.dataset.staggerIndex;
        if (idx !== undefined) {
          // 0.10s artışla kademeli, 7 sonrası sabit kalır
          const delay = Math.min(parseInt(idx, 10), 7) * 0.10;
          el.style.transitionDelay = delay + 's';
        }
        el.classList.add('in');
        io.unobserve(el);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px 80px 0px' });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // ========== FORM DEMO ==========
  document.querySelectorAll('form[data-demo]').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const lang = document.documentElement.getAttribute('data-lang');
      alert(lang === 'tr'
        ? 'Demo formdur — başvurunuz kayıt edilmedi. Gerçek site yayına alındığında çalışır olacak.'
        : 'This is a demo form — your application was not saved. Will be active when the real site goes live.');
    });
  });

  // ========== FİLTRE BUTONLARI ==========
  document.querySelectorAll('.filter-bar').forEach(bar => {
    bar.addEventListener('click', e => {
      if (e.target.classList.contains('filter-btn')) {
        bar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
      }
    });
  });

  // ========== SAYFA İÇİ YUMUŞAK GEÇİŞ (anchor linkleri) ==========
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href === '#' || href.length < 2) return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});
