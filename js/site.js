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
  var revealTargets = doc.querySelectorAll('[data-reveal], [data-scorecard]');
  if ('IntersectionObserver' in window && !reduced()) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        entry.target.dispatchEvent(new CustomEvent('reveal'));
        io.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Audit stage: pinned scroll story ---------- */
  var stage = doc.querySelector('[data-stage]');
  var stageState = null;

  if (stage) {
    var sticky = stage.querySelector('.stage__sticky');
    var head = stage.querySelector('.stage__head');
    var frame = stage.querySelector('[data-stage-frame]');
    var audit = stage.querySelector('[data-audit]');
    var caption = stage.querySelector('[data-stage-caption]');
    var stepBtns = stage.querySelectorAll('[data-goto]');
    var tabs = audit ? audit.querySelectorAll('.audit__tabs span') : [];
    var pinMQ = window.matchMedia('(min-width: 1024px) and (min-height: 680px)');
    var captions = [
      ['Sample audit interface', 'Illustrative example, not a client result. One AI experience, one channel, reviewed end to end.'],
      ['The scorecard', 'Six dimensions, each scored 1 to 5. The pattern shows where the experience breaks.'],
      ['A finding', 'Each finding is ranked by severity and backed by evidence from real, anonymised conversations.'],
      ['The design response', 'Every finding comes with a fix: what the assistant should do instead.']
    ];
    var tabForStep = [0, 1, 2, 3];
    var stepTargets = [0.04, 0.32, 0.58, 0.88];
    var currentStep = -1;
    var fit = 1;

    stageState = { pinned: false };

    var setStep = function (n) {
      if (n === currentStep) return;
      currentStep = n;
      audit.setAttribute('data-step', String(n));
      caption.innerHTML = '<strong>' + captions[n][0] + '</strong>' + captions[n][1];
      stepBtns.forEach(function (b, i) {
        if (i === n) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
      });
      tabs.forEach(function (t, i) { t.classList.toggle('is-active', i === tabForStep[n]); });
    };

    var measureFit = function () {
      fit = 1;
      if (!stageState.pinned) return;
      var cs = getComputedStyle(sticky);
      var avail = sticky.clientHeight - head.offsetHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - 16;
      var natural = audit.offsetHeight;
      fit = clamp(avail / natural, 0.72, 1);
    };

    var updateStage = function () {
      if (!stageState.pinned) return;
      var hh = headerH();
      var rect = stage.getBoundingClientRect();
      var total = stage.offsetHeight - sticky.offsetHeight;
      var p = clamp((hh - rect.top) / total, 0, 1);
      var approach = clamp((rect.top - hh) / (window.innerHeight * 0.7), 0, 1);
      var s = fit * (1 - 0.04 * approach);
      frame.style.transform = 'scale(' + s.toFixed(4) + ')';
      var n = p < 0.2 ? 0 : p < 0.46 ? 1 : p < 0.74 ? 2 : 3;
      setStep(n);
    };

    var applyPin = function () {
      var shouldPin = pinMQ.matches && !reduced();
      stageState.pinned = shouldPin;
      stage.classList.toggle('is-pinned', shouldPin);
      if (!shouldPin) {
        frame.style.transform = '';
        currentStep = -1;
        audit.setAttribute('data-step', '0');
        caption.innerHTML = '<strong>' + captions[0][0] + '</strong>' + captions[0][1];
        tabs.forEach(function (t, i) { t.classList.toggle('is-active', i === 0); });
      } else {
        measureFit();
        updateStage();
      }
    };

    stepBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var i = Number(btn.getAttribute('data-goto'));
        var top = stage.getBoundingClientRect().top + window.scrollY - headerH();
        var total = stage.offsetHeight - sticky.offsetHeight;
        window.scrollTo({ top: top + stepTargets[i] * total, behavior: reduced() ? 'auto' : 'smooth' });
      });
    });

    stageState.apply = applyPin;
    stageState.update = updateStage;
    stageState.measure = measureFit;
    applyPin();
    pinMQ.addEventListener('change', applyPin);
    reduceMQ.addEventListener('change', applyPin);
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

  /* ---------- Scorecard: populate, count, explain ---------- */
  var scorecard = doc.querySelector('[data-scorecard]');
  if (scorecard) {
    var dims = {
      clarity: ['Clarity', 4, 'Users know what it can and can\'t do.', 'The opening message, how scope is explained, and how ambiguous requests are handled.', 'Can a first-time user tell what this assistant is for?'],
      trust: ['Trust', 3, 'Users can judge when to rely on an answer.', 'AI disclosure, how confidence is expressed, and whether sources are shown.', 'Would a user know when to double-check an answer?'],
      recovery: ['Recovery', 2, 'It handles failure without dead ends.', 'Fallback messages, repeated misunderstandings, and whether there is always a route to a person.', 'When the assistant fails, does the user know what to do next?'],
      efficiency: ['Efficiency', 4, 'Tasks get done in the fewest sensible turns.', 'Up to 15 core tasks, walked through end to end.', 'How many turns does it take to finish a real task?'],
      tone: ['Tone', 4, 'It sounds like your brand, and suits the moment.', 'Voice consistency, and how tone shifts in sensitive or stressful moments.', 'Does it sound like you, even when the news is bad?'],
      compliance: ['Compliance safety', 4, 'Advice limits and POPIA consent, by design.', 'Advice boundaries, disclaimers, and how personal information and consent are handled.', 'Could this answer be mistaken for legal or financial advice?']
    };
    var detail = scorecard.querySelector('[data-dim-detail]');
    var buttons = scorecard.querySelectorAll('[data-dim]');
    var totalEl = scorecard.querySelector('[data-total]');
    var swapTimer;

    var show = function (key) {
      var d = dims[key];
      if (!d) return;
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-dim') === key)); });
      var write = function () {
        detail.querySelector('[data-dim-score]').textContent = 'Scored ' + d[1] + ' of 5';
        detail.querySelector('[data-dim-name]').textContent = d[0];
        detail.querySelector('[data-dim-def]').textContent = d[2];
        detail.querySelector('[data-dim-look]').textContent = d[3];
        detail.querySelector('[data-dim-q]').textContent = d[4];
        detail.classList.remove('is-swap');
      };
      if (reduced()) { write(); return; }
      clearTimeout(swapTimer);
      detail.classList.add('is-swap');
      swapTimer = setTimeout(write, 140);
    };

    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    buttons.forEach(function (b) {
      b.addEventListener('click', function () { show(b.getAttribute('data-dim')); });
      b.addEventListener('mouseenter', function () {
        if (finePointer.matches && b.getAttribute('aria-pressed') !== 'true') show(b.getAttribute('data-dim'));
      });
    });

    if (!reduced() && 'IntersectionObserver' in window && totalEl) {
      totalEl.textContent = '0';
      scorecard.addEventListener('reveal', function () {
        var start = null;
        var target = 21;
        var delay = 350;
        var dur = 1100;
        var tick = function (t) {
          if (start === null) start = t;
          var k = clamp((t - start - delay) / dur, 0, 1);
          var eased = 1 - Math.pow(1 - k, 3);
          totalEl.textContent = String(Math.round(eased * target));
          if (k < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }
  }

  /* ---------- Scroll + resize loop (one rAF per frame) ---------- */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      onHeaderScroll();
      if (stageState) stageState.update();
      updateJourney();
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () {
    if (stageState && stageState.pinned) stageState.measure();
    onScroll();
  });
  window.addEventListener('load', function () {
    if (stageState && stageState.pinned) { stageState.measure(); stageState.update(); }
  });
  onHeaderScroll();
  updateJourney();

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
