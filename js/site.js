/* NeuraUX site behaviour. Vanilla JS, no dependencies.
   Every effect is progressive: without this file the content
   is complete and readable. */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  function reduced() { return reduceMQ.matches; }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  /* Event hooks. No analytics platform is loaded (the Privacy Policy does not
     cover one yet). Events go to window.dataLayer only if a later, approved
     tool creates it, and are always dispatched as a DOM event. */
  function track(name, detail) {
    var data = Object.assign({ event: name }, detail || {});
    if (Array.isArray(window.dataLayer)) window.dataLayer.push(data);
    doc.dispatchEvent(new CustomEvent('neuraux:track', { detail: data }));
  }
  function headerH() { return parseFloat(getComputedStyle(root).getPropertyValue('--header-h')) || 64; }

  /* ---------- Header: transparent at top, charcoal on scroll ---------- */
  var header = doc.querySelector('[data-header]');
  function onHeaderScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
  }

  /* ---------- Mobile menu ---------- */
  var toggle = doc.querySelector('[data-menu-toggle]');
  var menu = doc.querySelector('[data-menu]');
  var menuOpen = false;

  function setMenu(open, returnFocus) {
    if (!toggle || !menu || open === menuOpen) return;
    menuOpen = open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Close' : 'Menu';
    header.classList.toggle('is-open', open);
    doc.body.classList.toggle('menu-open', open);
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(function () {
        menu.classList.add('is-open');
        var first = menu.querySelector('a');
        if (first) first.focus();
      });
    } else {
      menu.classList.remove('is-open');
      var hide = function () { if (!menuOpen) menu.hidden = true; };
      if (reduced()) hide(); else setTimeout(hide, 260);
      if (returnFocus) toggle.focus();
    }
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () { setMenu(!menuOpen, false); });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false, false);
    });
    doc.addEventListener('keydown', function (e) {
      if (!menuOpen) return;
      if (e.key === 'Escape') { setMenu(false, true); return; }
      if (e.key === 'Tab') {
        // Keep focus inside the open menu (toggle + menu links)
        var items = [toggle].concat(Array.prototype.slice.call(menu.querySelectorAll('a')));
        var i = items.indexOf(doc.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
        else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
      }
    });
    window.matchMedia('(min-width: 900px)').addEventListener('change', function (mq) {
      if (mq.matches) setMenu(false, false);
    });
  }

  /* ---------- In-view reveals (only on components that opt in) ---------- */
  var revealTargets = doc.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduced()) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Experience journey: line draws with scroll ---------- */
  var journey = doc.querySelector('[data-journey]');
  var journeyNodes = journey ? journey.querySelectorAll('.journey__node') : [];
  var journeyLive = journey && !reduced();
  function updateJourney() {
    if (!journeyLive) return;
    var rect = journey.getBoundingClientRect();
    var vh = window.innerHeight;
    var p = clamp((vh * 0.85 - rect.top) / (vh * 0.55), 0, 1);
    journey.style.setProperty('--jp', p.toFixed(3));
    var n = journeyNodes.length;
    journeyNodes.forEach(function (node, i) {
      node.classList.toggle('is-on', p >= (i / (n - 1)) * 0.98);
    });
  }
  if (journeyLive) {
    journeyNodes.forEach(function (node) { node.classList.remove('is-on'); });
    journey.style.setProperty('--jp', '0');
  }

  /* ---------- Tabs (WAI-ARIA tabs pattern: arrow keys, Home and End move and select) ---------- */
  doc.querySelectorAll('[data-tabs]').forEach(function (wrap) {
    var list = wrap.querySelector('[role="tablist"]');
    var tabs = Array.prototype.slice.call(wrap.querySelectorAll('[role="tab"]'));
    var panels = tabs.map(function (t) { return doc.getElementById(t.getAttribute('aria-controls')); });
    if (!list || !tabs.length) return;
    // Without JS every panel shows in sequence with its own heading.
    list.hidden = false;
    wrap.classList.add('is-tabbed');
    var select = function (i, focus) {
      tabs.forEach(function (t, k) {
        var on = k === i;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        panels[k].hidden = !on;
      });
      if (focus) tabs[i].focus();
    };
    var userSelect = function (i, focus) {
      select(i, focus);
      if (wrap.dataset.track) track(wrap.dataset.track, { tab: tabs[i].id });
    };
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { userSelect(i, false); });
      t.addEventListener('keydown', function (e) {
        var n = tabs.length, next = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % n;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + n) % n;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = n - 1;
        if (next !== null) { e.preventDefault(); userSelect(next, true); }
      });
    });
    select(0, false);
  });

  /* ---------- Scroll + resize loop (one rAF per frame) ---------- */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      onHeaderScroll();
      updateJourney();
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onHeaderScroll();
  updateJourney();

  /* ---------- Event hooks: clicks, section views, FAQ opens ---------- */
  doc.addEventListener('click', function (e) {
    var el = e.target.closest('[data-track]');
    if (el && !el.hasAttribute('data-tabs') && !el.hasAttribute('data-explorer')) track(el.getAttribute('data-track'), { label: el.textContent.trim().slice(0, 80) });
  });
  var viewTargets = doc.querySelectorAll('[data-track-view]');
  if ('IntersectionObserver' in window && viewTargets.length) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        track(en.target.getAttribute('data-track-view'));
        vio.unobserve(en.target);
      });
    }, { threshold: 0.4 });
    viewTargets.forEach(function (el) { vio.observe(el); });
  }
  doc.querySelectorAll('details[data-track-open]').forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) track(d.getAttribute('data-track-open'), { question: d.querySelector('summary').textContent.trim() });
    });
  });

  /* ---------- Explorer: pick one item, show its detail panel ----------
     Without JS every panel is visible in order. */
  doc.querySelectorAll('[data-explorer]').forEach(function (ex) {
    var picks = Array.prototype.slice.call(ex.querySelectorAll('[data-pick]'));
    var panels = picks.map(function (b) { return doc.getElementById(b.getAttribute('aria-controls')); });
    if (!picks.length) return;
    ex.classList.add('is-live');
    var show = function (i, user) {
      picks.forEach(function (b, k) {
        b.setAttribute('aria-pressed', String(k === i));
        if (panels[k]) panels[k].hidden = k !== i;
      });
      if (user && ex.dataset.track) track(ex.dataset.track, { item: picks[i].getAttribute('data-pick') });
      // On narrow screens the panel sits below the list: bring it into view.
      if (user && panels[i] && window.innerWidth < 900) {
        var r = panels[i].getBoundingClientRect();
        if (r.top > window.innerHeight * 0.75 || r.top < headerH()) {
          window.scrollTo({ top: r.top + window.scrollY - headerH() - 16, behavior: reduced() ? 'auto' : 'smooth' });
        }
      }
    };
    picks.forEach(function (b, i) {
      b.addEventListener('click', function () { show(i, true); });
    });
    var start = picks.findIndex(function (b) { return b.getAttribute('aria-pressed') === 'true'; });
    show(start < 0 ? 0 : start, false);
  });

  /* ---------- Self-check list: count what sounds familiar ---------- */
  doc.querySelectorAll('[data-checklist]').forEach(function (list) {
    var out = doc.getElementById(list.getAttribute('data-checklist'));
    if (!out) return;
    var n = out.querySelector('[data-tally-n]');
    var msg = out.querySelector('[data-tally-msg]');
    var update = function () {
      var c = list.querySelectorAll('input:checked').length;
      n.textContent = String(c);
      msg.textContent = c >= 3
        ? 'Three or more. An Audit is probably worth a conversation.'
        : c > 0 ? 'Keep going. Three or more usually means an Audit is worth investigating.' : 'Tick the ones that sound familiar.';
    };
    list.addEventListener('change', update);
    update();
  });

  /* ---------- Qualification forms on service pages: compose an email ---------- */
  doc.querySelectorAll('[data-qualify]').forEach(function (qf) {
    var key = qf.getAttribute('data-qualify');
    var started = false;
    qf.addEventListener('focusin', function () {
      if (started) return;
      started = true;
      track(key + '_form_start');
    });
    var setErr = function (input, msg) {
      var err = doc.getElementById(input.id + '-err');
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (err) err.textContent = msg || '';
    };
    qf.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      qf.querySelectorAll('[required]').forEach(function (input) {
        var v = input.value.trim();
        var bad = input.type === 'email' ? !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) : !v;
        setErr(input, bad ? (input.getAttribute('data-err') || 'Please complete this field.') : '');
        if (bad && !firstBad) firstBad = input;
      });
      if (firstBad) { firstBad.focus(); return; }
      var lines = [];
      qf.querySelectorAll('[data-q]').forEach(function (group) {
        var label = group.getAttribute('data-q');
        var val;
        var boxes = group.querySelectorAll('input[type="checkbox"]:checked, input[type="radio"]:checked');
        if (group.querySelector('input[type="checkbox"], input[type="radio"]')) {
          val = Array.prototype.map.call(boxes, function (b) { return b.value; }).join(', ');
        } else {
          var f = group.querySelector('input, select, textarea');
          val = f ? f.value.trim() : '';
        }
        lines.push(label + ': ' + (val || '(not provided)'));
      });
      var company = qf.querySelector('[name="company"]');
      var subject = qf.getAttribute('data-subject') + (company && company.value.trim() ? ' (' + company.value.trim() + ')' : '');
      window.location.href = 'mailto:hello@neuraux.co.za?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
      track(key + '_form_complete');
      var st = qf.querySelector('[data-status]');
      if (st) st.textContent = 'Your email app should now open with your answers ready to send. Nothing is sent until you press send. If it didn\'t open, email hello@neuraux.co.za directly.';
    });
  });

  /* ---------- Sticky mobile CTA: shown after the hero, hidden near the form ---------- */
  var sticky = doc.querySelector('[data-sticky-cta]');
  if (sticky && 'IntersectionObserver' in window) {
    var heroEl = doc.querySelector('[data-sticky-after]');
    var hideEls = doc.querySelectorAll('[data-sticky-hide]');
    var pastHero = false, nearForm = false;
    var hidingNow = {};
    var syncSticky = function () {
      var on = pastHero && !nearForm && !menuOpen;
      sticky.classList.toggle('is-on', on);
      sticky.setAttribute('aria-hidden', String(!on));
      sticky.querySelectorAll('a').forEach(function (a) { a.tabIndex = on ? 0 : -1; });
    };
    if (heroEl) new IntersectionObserver(function (en) { pastHero = !en[0].isIntersecting && en[0].boundingClientRect.top < 0; syncSticky(); }).observe(heroEl);
    var hio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { hidingNow[en.target.id] = en.isIntersecting; });
      nearForm = Object.keys(hidingNow).some(function (k) { return hidingNow[k]; });
      syncSticky();
    });
    hideEls.forEach(function (el) { hio.observe(el); });
    syncSticky();
  }

  /* ---------- Contact form: compose an email (no backend yet) ---------- */
  var form = doc.querySelector('[data-enquiry]');
  if (form) {
    var labels = {
      audit: 'AI Experience Audit',
      blueprint: 'Conversation Design Blueprint',
      agency: 'Agency partnership',
      unsure: 'Not sure yet'
    };
    var params = new URLSearchParams(window.location.search);
    var pre = params.get('enquiry');
    if (pre && labels[pre]) {
      var radio = form.querySelector('input[name="interest"][value="' + pre + '"]');
      if (radio) radio.checked = true;
    }

    var status = form.querySelector('[data-status]');
    var setError = function (input, msg) {
      var err = doc.getElementById(input.id + '-err');
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (err) err.textContent = msg || '';
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.elements.name;
      var email = form.elements.email;
      var company = form.elements.company;
      var firstBad = null;
      [[name, 'Please add your name.'], [company, 'Please add your company.']].forEach(function (pair) {
        var bad = !pair[0].value.trim();
        setError(pair[0], bad ? pair[1] : '');
        if (bad && !firstBad) firstBad = pair[0];
      });
      var emailBad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      setError(email, emailBad ? 'Please add a valid work email.' : '');
      if (emailBad && !firstBad) firstBad = email;
      if (firstBad) { firstBad.focus(); return; }

      var checked = form.querySelector('input[name="interest"]:checked');
      var interest = checked ? labels[checked.value] : labels.unsure;
      var notes = form.elements.notes.value.trim();
      var body = [
        'Name: ' + name.value.trim(),
        'Work email: ' + email.value.trim(),
        'Company: ' + company.value.trim(),
        "I'm interested in: " + interest,
        '',
        'What we are running or planning:',
        notes || '(not provided)'
      ].join('\n');
      var subject = 'Enquiry: ' + interest + ' (' + company.value.trim() + ')';
      window.location.href = 'mailto:hello@neuraux.co.za?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      if (status) status.textContent = 'Your email app should now open with your enquiry ready to send. Nothing is sent until you press send. If it didn\'t open, email hello@neuraux.co.za directly.';
    });
  }
})();
