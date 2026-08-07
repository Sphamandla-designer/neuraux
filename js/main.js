/* NeuraUX v4 — scroll choreography & product interactions */

(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- nav + page progress ---------- */
  const nav = document.getElementById('nav');
  const pageBar = document.getElementById('pageBar');
  const onScrollChrome = () => {
    nav.classList.toggle('solid', window.scrollY > 40);
    if (pageBar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      pageBar.style.width = `${Math.min(100, (window.scrollY / max) * 100).toFixed(2)}%`;
    }
  };
  onScrollChrome();
  window.addEventListener('scroll', onScrollChrome, { passive: true });

  /* ---------- progressive reveal ---------- */
  const revealables = document.querySelectorAll('.reveal');
  const metricsEl = document.getElementById('metrics');
  let counted = false;

  const runCounter = () => {
    if (counted) return;
    counted = true;
    const el = document.getElementById('replyMetric');
    if (!el) return;
    const start = performance.now(), dur = 1600;
    const tick = now => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      const mins = Math.round(240 - eased * 236);
      el.textContent = mins >= 60 ? `${Math.round(mins / 60)} hrs` : `${mins} min`;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (reduced) {
    revealables.forEach(el => el.classList.add('in'));
    const el = document.getElementById('replyMetric');
    if (el) el.textContent = '4 min';
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        if (entry.target.id === 'metrics' || entry.target.contains(metricsEl)) runCounter();
        io.unobserve(entry.target);
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    revealables.forEach(el => io.observe(el));
    if (metricsEl) io.observe(metricsEl);
  }

  /* ---------- hero ticker ---------- */
  const tickerMsgs = [
    'Enquiry captured from website form',
    'AI replied on WhatsApp in 42 seconds',
    'Budget and timing qualified automatically',
    'Viewing booked · Saturday 09:30',
    'CRM record updated — no re-typing',
    'Handed to consultant with full context',
  ];
  const tickerEl = document.getElementById('tickerText');
  if (tickerEl && !reduced) {
    let idx = 0;
    setInterval(() => {
      idx = (idx + 1) % tickerMsgs.length;
      tickerEl.style.opacity = '0';
      setTimeout(() => {
        tickerEl.textContent = tickerMsgs[idx];
        tickerEl.style.opacity = '1';
      }, 320);
    }, 2600);
  }

  /* ---------- friction hover story ---------- */
  const frictionCaption = document.getElementById('frictionCaption');
  const defaultCaption = 'One enquiry. Watch it stall at every stop.';
  document.querySelectorAll('.f-step').forEach(step => {
    const note = step.dataset.revealNote;
    const show = () => {
      if (!frictionCaption) return;
      frictionCaption.textContent = `What the customer feels here: ${note.toLowerCase()}`;
      frictionCaption.classList.add('hot');
    };
    const hide = () => {
      if (!frictionCaption) return;
      frictionCaption.textContent = defaultCaption;
      frictionCaption.classList.remove('hot');
    };
    step.addEventListener('mouseenter', show);
    step.addEventListener('mouseleave', hide);
    step.addEventListener('focus', show);
    step.addEventListener('blur', hide);
  });

  /* ---------- magnetic buttons ---------- */
  if (!reduced && matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('[data-magnet]').forEach(btn => {
      btn.style.transition = 'transform .18s ease, background .3s, box-shadow .45s';
      btn.addEventListener('mousemove', ev => {
        const r = btn.getBoundingClientRect();
        const dx = (ev.clientX - r.left - r.width / 2) / r.width;
        const dy = (ev.clientY - r.top - r.height / 2) / r.height;
        btn.style.transform = `translate(${(dx * 6).toFixed(1)}px, ${(dy * 5).toFixed(1)}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = 'translate(0,0)'; });
    });
  }

  if (reduced) return; // everything below is decorative motion

  /* ---------- depth parallax + hero settle ---------- */
  const layers = [...document.querySelectorAll('[data-speed]')].map(el => ({
    el,
    speed: parseFloat(el.dataset.speed) || 0,
  }));
  const heroStage = document.getElementById('heroStage');
  const mobile = () => window.matchMedia('(max-width: 640px)').matches;

  let ticking = false;
  const frame = () => {
    ticking = false;
    if (mobile()) {
      layers.forEach(({ el }) => { el.style.transform = ''; });
      if (heroStage) { heroStage.style.opacity = ''; heroStage.style.scale = ''; }
      return;
    }
    const vh = window.innerHeight;
    for (const { el, speed } of layers) {
      const rect = el.getBoundingClientRect();
      const offset = rect.top + rect.height / 2 - vh / 2;
      el.style.transform = `translateY(${(-offset * speed).toFixed(1)}px)`;
    }
    if (heroStage) {
      const p = Math.min(Math.max(window.scrollY / vh, 0), 1);
      heroStage.style.scale = String(1 + p * 0.08);
      heroStage.style.opacity = String(1 - p * 0.8);
    }
  };
  const requestFrame = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(frame); }
  };
  window.addEventListener('scroll', requestFrame, { passive: true });
  window.addEventListener('resize', requestFrame);
  requestFrame();
})();
