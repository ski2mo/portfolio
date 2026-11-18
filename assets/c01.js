/* Concept01 — interactions: project index accordion, expand all, scroll spy, reveal, footer dots */
(function () {
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  /* 1. Project index: one row opens in place */
  var rows = $$('.row');
  function setRow(row, open) {
    var btn = row.querySelector('button');
    if (open) row.setAttribute('data-open', ''); else row.removeAttribute('data-open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  rows.forEach(function (row) {
    row.querySelector('button').addEventListener('click', function () {
      var willOpen = !row.hasAttribute('data-open');
      if (!allOpen) rows.forEach(function (r) { if (r !== row) setRow(r, false); });
      setRow(row, willOpen);
      if (willOpen && !allOpen) {
        setTimeout(function () {
          var top = row.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }, 120);
      }
    });
  });

  /* 2. (What I make) — expand / collapse all */
  var allBtn = document.querySelector('[data-all]');
  var allLabel = document.querySelector('[data-all-label]');
  var allOpen = false;
  if (allBtn) {
    allBtn.addEventListener('click', function () {
      allOpen = !allOpen;
      rows.forEach(function (r) { setRow(r, allOpen); });
      allBtn.setAttribute('aria-expanded', allOpen ? 'true' : 'false');
      allBtn.querySelector('svg').style.transform = allOpen ? 'rotate(180deg)' : '';
      if (allLabel) allLabel.textContent = allOpen ? 'Collapse all' : 'Expand all';
    });
  }

  /* 3. Scroll spy: current section stays black, others grey */
  var links = $$('[data-spy]');
  var secs = links.map(function (a) { return document.getElementById(a.getAttribute('data-spy')); });
  var dots = $$('.dots i');
  function spy() {
    var k = -1;
    secs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top <= window.innerHeight * 0.35) k = i; });
    links.forEach(function (a, i) {
      a.classList.toggle('dim', k !== -1 && i !== k);
      if (i === k) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    if (dots.length === 2) { dots[0].classList.toggle('on', k === -1); dots[1].classList.toggle('on', k !== -1); }
  }
  window.addEventListener('scroll', spy, { passive: true });
  window.addEventListener('resize', spy);
  spy();

  /* 4. Reveal on scroll */
  var rv = $$('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -12% 0px' });
    rv.forEach(function (el) { io.observe(el); });
  } else {
    rv.forEach(function (el) { el.classList.add('in'); });
  }
  /* 5. Archive filter */
  var fb = $$('[data-filter]');
  fb.forEach(function (b) {
    b.addEventListener('click', function () {
      var c = b.getAttribute('data-filter');
      fb.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      rows.forEach(function (r) { r.classList.toggle('off', c !== 'all' && r.getAttribute('data-cat') !== c); });
    });
  });
})();

/* copy buttons */
document.querySelectorAll('[data-copy]').forEach(function (b) {
  var label = b.textContent;
  b.addEventListener('click', function () {
    var t = b.getAttribute('data-copy');
    var ok = function () { b.textContent = 'Copied'; b.classList.add('done'); setTimeout(function () { b.textContent = label; b.classList.remove('done'); }, 1600); };
    var fb = function () { var a = document.createElement('textarea'); a.value = t; a.setAttribute('readonly', ''); a.style.position = 'fixed'; a.style.opacity = '0'; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); ok(); } catch (e) {} a.remove(); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(t).then(ok, fb); else fb();
  });
});
