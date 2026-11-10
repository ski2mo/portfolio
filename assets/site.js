/* 點火 — 인터랙션: 섹션 바로가기 · 문서 탭/장표 · 크게 보기 · 연료 현장 기록 */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var page = window.location.pathname.split('/').pop();
  var legacyPages = { '#work': 'project.html', '#about': 'profile.html', '#archive': 'archive.html' };
  if ((page === '' || page === 'index.html') && legacyPages[window.location.hash]) {
    window.location.replace(legacyPages[window.location.hash]);
    return;
  }
  var ON = 'text-decoration: underline; text-decoration-thickness: 2px; text-decoration-color: #e8461a; text-underline-offset: 5px';
  function tabStyle(a, on) {
    var s = a.getAttribute('style').replace(/;?\s*text-decoration[^;]*/g, '').replace(/;?\s*color: #6b6b65/g, '');
    a.setAttribute('style', s + (on ? '; ' + ON : '; color: #6b6b65'));
    a.setAttribute('aria-selected', on ? 'true' : 'false');
  }
  var ov = null, keyFn = null;
  function close() { if (ov) { ov.remove(); ov = null; document.body.style.overflow = ''; keyFn = null; } }
  function open(html) {
    close(); ov = document.createElement('div'); ov.className = 'jy-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
    ov.innerHTML = html; document.body.appendChild(ov); document.body.style.overflow = 'hidden';
    ov.addEventListener('click', function (e) { if (e.target === ov || e.target.closest('[data-x]')) { e.preventDefault(); close(); } });
    var f = $('[data-x]', ov); if (f) f.focus();
  }
  document.addEventListener('keydown', function (e) { if (!ov) return; if (e.key === 'Escape') close(); else if (keyFn) keyFn(e); });
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* 섹션 바로가기: 현재 섹션 밑줄 */
  var anchors = $$('[data-sb="anchors"] a');
  if (anchors.length) {
    var secs = anchors.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
    var spy = function () {
      var k = 0;
      secs.forEach(function (s, i) {
        if (s && s.getBoundingClientRect().top <= parseFloat(getComputedStyle(s).scrollMarginTop) + 2) k = i;
      });
      anchors.forEach(function (a, i) { tabStyle(a, i === k); a.removeAttribute('aria-selected'); });
    };
    window.addEventListener('scroll', spy, { passive: true }); spy();
  }

  /* 발화 상세: 문서 */
  var P = window.PROJECT, deck = document.getElementById('deck');
  if (P && deck && P.docs.length) {
    var tabs = $('[data-sb="dk-tabs"]', deck);
    var title = $('[data-sb="dk-title"]', deck);
    var body = $('[data-sb="dk-body"]', deck);
    var slide = $('[data-sb="dk-slide"]', deck);
    var thumbs = $('[data-sb="dk-thumbs"]', deck);
    var ctrl = $('[data-sb="dk-ctrl"]', deck);
    var count = $('[data-sb="dk-count"]', ctrl);
    var arrows = $$('button', ctrl);
    var pdfLink = $('[data-sb="dk-pdf"]', deck);
    var doc = P.docs[0], si = 0;

    function slideHTML() {
      return '<img src="' + esc(doc.slides[si]) + '" alt="' + esc(doc.title) + ' ' + (si + 1) + '쪽">';
    }

    function go(index) {
      si = Math.max(0, Math.min(doc.slides.length - 1, index));
      slide.innerHTML = slideHTML();
      count.textContent = (si + 1) + ' / ' + doc.slides.length;
      arrows[0].disabled = si === 0;
      arrows[1].disabled = si === doc.slides.length - 1;
      $$('button', thumbs).forEach(function (b, i) {
        b.setAttribute('aria-pressed', i === si ? 'true' : 'false');
      });
    }

    function select(nextDoc, tab) {
      doc = nextDoc;
      var hasSlides = doc.slides.length > 0;
      $$('button', tabs).forEach(function (b) {
        b.setAttribute('aria-pressed', b === tab ? 'true' : 'false');
      });
      title.textContent = doc.title;
      body.textContent = hasSlides ? '장표 ' + doc.slides.length + '장' :
        (doc.pdf ? 'PDF로 전체 문서를 볼 수 있습니다.' : '공개용 문서를 준비 중입니다.');
      slide.hidden = ctrl.hidden = thumbs.hidden = !hasSlides;
      pdfLink.hidden = !doc.pdf;
      if (doc.pdf) pdfLink.href = doc.pdf;
      else pdfLink.removeAttribute('href');

      thumbs.replaceChildren();
      if (hasSlides) {
        doc.slides.forEach(function (_, i) {
          var button = document.createElement('button');
          button.type = 'button';
          button.textContent = i + 1;
          button.setAttribute('aria-label', '장표 ' + (i + 1));
          button.addEventListener('click', function () { go(i); });
          thumbs.appendChild(button);
        });
        go(0);
      }
    }

    P.docs.forEach(function (item) {
      var button = document.createElement('button');
      button.type = 'button';
      button.textContent = item.type;
      button.setAttribute('aria-label', item.title);
      button.addEventListener('click', function () { select(item, button); });
      tabs.appendChild(button);
    });
    arrows[0].addEventListener('click', function () { go(si - 1); });
    arrows[1].addEventListener('click', function () { go(si + 1); });
    slide.addEventListener('click', function () {
      function draw() {
        var choices = doc.slides.map(function (_, i) {
          return '<button type="button" data-i="' + i + '" aria-pressed="' + (i === si) + '">' + (i + 1) + '</button>';
        }).join('');
        open('<div class="bar"><span>' + esc(doc.title) + '</span><span>' + (si + 1) + ' / ' + doc.slides.length +
          '</span><span>' + (doc.pdf ? '<a href="' + esc(doc.pdf) + '" data-pdf>PDF 보기 ↗</a>' : '') + '<a href="#" data-x>닫기 ✕</a></span></div>' +
          '<button class="nav p" aria-label="이전 장표">←</button><div class="sl">' + slideHTML() +
          '</div><button class="nav n" aria-label="다음 장표">→</button><div class="th" aria-label="장표 선택">' + choices +
          '</div><span class="hint">← → 키로 이동 · Esc로 닫기</span>');
        $('.nav.p', ov).onclick = function () { go(si - 1); draw(); };
        $('.nav.n', ov).onclick = function () { go(si + 1); draw(); };
        $('.th', ov).onclick = function (e) {
          var target = e.target.closest('[data-i]');
          if (target) { go(+target.dataset.i); draw(); }
        };
        $('[aria-pressed="true"]', ov).scrollIntoView({ block: 'nearest', inline: 'nearest' });
        var pdfButton = $('[data-pdf]', ov);
        if (pdfButton) pdfButton.onclick = function (e) { e.preventDefault(); pdf(doc); };
        keyFn = function (e) {
          if (e.key === 'ArrowLeft') { go(si - 1); draw(); }
          if (e.key === 'ArrowRight') { go(si + 1); draw(); }
        };
      }
      draw();
    });
    pdfLink.addEventListener('click', function (e) { e.preventDefault(); pdf(doc); });
    select(doc, tabs.firstElementChild);
  }

  function pdf(d) {
    if (!d.pdf) return;
    open('<div class="pdf"><div class="pb"><span>' + esc(d.title) + '</span><span>' +
      '<a href="' + esc(d.pdf) + '" download>다운로드 ↓</a><a href="#" data-x>닫기 ✕</a></span></div>' +
      '<iframe src="' + esc(d.pdf) + '" title="' + esc(d.title) + '"></iframe></div>');
  }

  /* 진행 과정 사진 크게 보기 */
  $$('[data-sb="rc-grid"] figure').forEach(function (f) {
    f.style.cursor = 'zoom-in';
    f.addEventListener('click', function () {
      var im = f.querySelector('img'), cap = f.querySelector('figcaption');
      open('<div class="ph"><div class="bar" style="position:static;display:flex;justify-content:space-between"><span>' + esc(cap ? cap.textContent.trim() : '') + '</span><a href="#" data-x>(닫기 ✕)</a></div><div class="im">' + (im ? '<img src="' + esc(im.src) + '" alt="' + esc(im.alt) + '">' : esc(f.firstElementChild.textContent)) + '</div></div>');
    });
  });

  /* 연료: 현장 기록 */
  var A = window.ARCHIVE;
  if (A) {
    $$('.jy-thumb').forEach(function (b) {
      b.addEventListener('click', function () {
        var it = A[+b.dataset.i];
        open('<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(836px,calc(100vw - 32px));box-sizing:border-box;display:flex;flex-wrap:wrap;align-items:flex-end;gap:24px;background:#fff;color:#1a1a18;padding:16px;letter-spacing:0">' +
          '<div style="flex:1 1 360px;aspect-ratio:13/10;background:' + esc(it.tone) + ';display:flex;align-items:flex-end;padding:12px;box-sizing:border-box;font-size:0.8125rem;color:#6b6b65">' + (it.img ? '<img src="' + esc(it.img) + '" alt="' + esc(it.act) + '" style="width:100%;height:100%;object-fit:cover">' : '[현장 사진 크게 보기]') + '</div>' +
          '<div style="flex:0 1 260px;display:flex;flex-direction:column;gap:14px"><span style="font-size:0.8125rem;letter-spacing:.06em">' + esc(it.no) + ' — ' + esc(it.period) + ' — ' + esc(it.cat) + '</span>' +
          '<div style="display:grid;grid-template-columns:56px minmax(0,1fr);gap:8px 10px;font-family:\'Archivo\',\'IBM Plex Sans KR\',sans-serif;font-size:1rem;line-height:1.6"><span style="font-size:0.8125rem;color:#6b6b65;padding-top:2px">활동</span><span>' + esc(it.act) + '</span><span style="font-size:0.8125rem;color:#6b6b65;padding-top:2px">맡은 일</span><span>[맡은 일 텍스트]</span><span style="font-size:0.8125rem;color:#6b6b65;padding-top:2px">배운 점</span><span>[배운 점 텍스트]</span></div>' +
          '<a href="#" data-x style="color:#1a1a18;min-height:44px;display:inline-flex;align-items:center">(닫기 −)</a></div></div>');
      });
    });
    $$('[data-ar-tabs] a').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault(); var c = a.textContent.trim();
        $$('[data-ar-tabs] a').forEach(function (b) { tabStyle(b, b === a); b.removeAttribute('aria-selected'); });
        $$('.jy-thumb').forEach(function (t) { t.classList.toggle('jy-off', c !== 'ALL' && t.dataset.cat !== c); });
        $$('#index [data-cat]').forEach(function (r) { r.classList.toggle('jy-hide', c !== 'ALL' && r.dataset.cat !== c); });
      });
    });
  }
})();
