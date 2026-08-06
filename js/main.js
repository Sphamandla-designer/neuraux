/* NeuraUX — scroll choreography
   Reveals, depth parallax, hero expansion, horizontal process journey. */

(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- nav state ---------- */
  const nav = document.getElementById('nav');
  const setNav = () => nav.classList.toggle('solid', window.scrollY > 40);
  setNav();
  window.addEventListener('scroll', setNav, { passive: true });

  /* ---------- progressive reveal ---------- */
  const revealables = document.querySelectorAll('.reveal');
  if (reduced) {
    revealables.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    revealables.forEach(el => io.observe(el));
  }

  if (reduced) return; // everything below is motion

  /* ---------- depth parallax ---------- */
  const layers = [...document.querySelectorAll('[data-speed]')].map(el => ({
    el,
    speed: parseFloat(el.dataset.speed) || 0,
  }));

  /* ---------- hero expansion on scroll ---------- */
  const heroStage = document.getElementById('heroStage');

  /* ---------- horizontal process journey ---------- */
  const processSection = document.querySelector('.process');
  const processTrack = document.getElementById('processTrack');
  const processBar = document.getElementById('processBar');
  const desktopProcess = () => window.matchMedia('(min-width: 901px)').matches;

  let ticking = false;

  const frame = () => {
    ticking = false;
    const vh = window.innerHeight;

    // parallax: offset from viewport centre, scaled per layer
    for (const { el, speed } of layers) {
      const rect = el.getBoundingClientRect();
      const offset = rect.top + rect.height / 2 - vh / 2;
      el.style.transform = `translateY(${(-offset * speed).toFixed(1)}px)`;
    }

    // hero: composition gently expands as it leaves
    if (heroStage) {
      const p = Math.min(Math.max(window.scrollY / vh, 0), 1);
      heroStage.style.scale = String(1 + p * 0.12);
      heroStage.style.opacity = String(1 - p * 0.85);
    }

    // process: vertical scroll drives horizontal travel
    if (processSection && processTrack && desktopProcess()) {
      const rect = processSection.getBoundingClientRect();
      const total = rect.height - vh;
      const p = Math.min(Math.max(-rect.top / total, 0), 1);
      const travel = processTrack.scrollWidth - window.innerWidth;
      processTrack.style.transform = `translateX(${(-p * Math.max(travel, 0)).toFixed(1)}px)`;
      if (processBar) processBar.style.width = `${(p * 100).toFixed(2)}%`;
    } else if (processTrack) {
      processTrack.style.transform = '';
    }
  };

  const requestFrame = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(frame);
    }
  };

  window.addEventListener('scroll', requestFrame, { passive: true });
  window.addEventListener('resize', requestFrame);
  requestFrame();
})();
