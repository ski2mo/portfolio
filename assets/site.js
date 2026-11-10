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
      var y = window.scrollY + 140, k = 0;
      secs.forEach(function (s, i) { if (s && s.offsetTop <= y) k = i; });
      anchors.forEach(function (a, i) { tabStyle(a, i === k); a.removeAttribute('aria-selected'); });
    };
    window.addEventListener('scroll', spy, { passive: true }); spy();
  }

  /* 발화 상세: 문서 */
  var P = window.PROJECT, deck = document.getElementById('deck');
  if (P && deck) {
    var docs = P.docs.filter(function (d) { return !d.planned; }), type = 'ALL', di = 0, si = 0;
    var list = function () { return docs.filter(function (d) { return type === 'ALL' || d.type === type; }); };
    var N = function () { var d = list()[di]; return d && d.slides.length ? d.slides.length : 8; };
    var two = function (n) { return (n < 10 ? '0' : '') + n; };
    var title = $('[data-sb="dk-title"]'), body = $('[data-sb="dk-body"]'), slide = $('[data-sb="dk-slide"]'), thumbs = $('[data-sb="dk-thumbs"]'), ctrl = $('[data-sb="dk-ctrl"]');
    var slideHTML = function (d, i) { return d && d.slides[i] ? '<img src="' + esc(d.slides[i]) + '" alt="' + esc(d.title) + ' ' + (i + 1) + '쪽" style="width:100%;height:100%;object-fit:contain;display:block">' : '[' + esc(d ? d.type : '문서') + ' — 장표 ' + two(i + 1) + ']'; };
    var render = function () {
      var d = list()[di];
      title.textContent = d ? d.title : '문서 준비 중';
      if (body) body.textContent = d ? d.type + ' · ' + N() + '장' + (list().length > 1 ? ' — 이 종류의 문서 ' + list().length + '건 중 ' + (di + 1) : '') : '';
      slide.innerHTML = slideHTML(d, si) + '<span style="position: absolute; right: 12px; bottom: 12px">(크게 보기 ⤢)</span>';
      slide.style.cursor = 'zoom-in';
      $$('span', ctrl)[0].textContent = two(si + 1) + ' / ' + two(N());
      var cells = $$('div', thumbs), proto = cells[0].getAttribute('style').replace(/;?\s*(opacity|outline|outline-offset):[^;]*/g, '');
      var h = ''; for (var i = 0; i < N(); i++) h += '<div role="button" tabindex="0" data-i="' + i + '" style="' + proto + (i === si ? '; outline: 2px solid #e8461a; outline-offset: -2px' : '; opacity: 0.75') + '; cursor: pointer">' + two(i + 1) + '</div>';
      thumbs.innerHTML = h;
      var a = $$('a', ctrl); a[0].style.opacity = si === 0 ? .3 : 1; a[1].style.opacity = si === N() - 1 ? .3 : 1;
    };
    var go = function (i) { si = Math.max(0, Math.min(N() - 1, i)); render(); };
    $$('[data-sb="dk-tabs"] a').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); if (a.getAttribute('aria-disabled')) return; type = a.dataset.type; di = 0; si = 0; $$('[data-sb="dk-tabs"] a').forEach(function (b) { if (!b.getAttribute('aria-disabled')) tabStyle(b, b === a); }); render(); });
    });
    var ca = $$('a', ctrl);
    ca[0].addEventListener('click', function (e) { e.preventDefault(); go(si - 1); });
    ca[1].addEventListener('click', function (e) { e.preventDefault(); go(si + 1); });
    thumbs.addEventListener('click', function (e) { var t = e.target.closest('[data-i]'); if (t) go(+t.dataset.i); });
    var big = function () {
      var d = list()[di]; if (!d) return;
      var draw = function () {
        var th = ''; for (var i = 0; i < N(); i++) th += '<button data-i="' + i + '"' + (i === si ? ' class="on"' : '') + '>' + two(i + 1) + '</button>';
        open('<div class="bar"><span>' + esc(P.name) + ' — ' + esc(d.title) + '</span><span>' + two(si + 1) + ' / ' + two(N()) + '</span><span><a href="#" data-pdf>(PDF 전체보기 ↗)</a><a href="#" data-x>(닫기 ✕)</a></span></div>' +
          '<button class="nav p" aria-label="이전 장표">←</button><div class="sl">' + slideHTML(d, si) + '</div><button class="nav n" aria-label="다음 장표">→</button>' +
          '<div class="th">' + th + '</div><span class="hint">← → 키로 이동 · Esc로 닫기</span>');
        $('.nav.p', ov).onclick = function () { go(si - 1); draw(); };
        $('.nav.n', ov).onclick = function () { go(si + 1); draw(); };
        $('.th', ov).onclick = function (e) { var t = e.target.closest('[data-i]'); if (t) { go(+t.dataset.i); draw(); } };
        $('[data-pdf]', ov).onclick = function (e) { e.preventDefault(); pdf(d); };
        keyFn = function (e) { if (e.key === 'ArrowLeft') { go(si - 1); draw(); } if (e.key === 'ArrowRight') { go(si + 1); draw(); } };
      };
      draw();
    };
    slide.addEventListener('click', big);
    var dp = $('[data-sb="dk-pdf"]'); if (dp) dp.addEventListener('click', function (e) { e.preventDefault(); pdf(list()[di]); });
    render();
  }
  function pdf(d) {
    if (!d) return;
    open('<div class="pdf"><div class="pb"><span>' + esc(d.title) + '.pdf</span><span>' + (d.pdf ? '<a href="' + esc(d.pdf) + '" download>(다운로드 ↓)</a>' : '') + '<a href="#" data-x>(닫기 ✕)</a></span></div>' +
      (d.pdf ? '<iframe src="' + esc(d.pdf) + '" title="' + esc(d.title) + '"></iframe>' : '<div class="empty">[PDF 파일 연결 전 — assets 폴더에 PDF를 넣고 경로를 지정하세요]</div>') + '</div>');
  }
  var pb = $('[data-sb="pdfbtn"]');
  if (pb && P) pb.addEventListener('click', function (e) { e.preventDefault(); pdf(P.docs.filter(function (d) { return !d.planned; })[0]); });

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
          '<div style="flex:1 1 360px;aspect-ratio:13/10;background:' + esc(it.tone) + ';display:flex;align-items:flex-end;padding:12px;box-sizing:border-box;font-size:10px;color:#6b6b65">' + (it.img ? '<img src="' + esc(it.img) + '" alt="' + esc(it.act) + '" style="width:100%;height:100%;object-fit:cover">' : '[현장 사진 크게 보기]') + '</div>' +
          '<div style="flex:0 1 260px;display:flex;flex-direction:column;gap:14px"><span style="font-size:10px;letter-spacing:.06em">' + esc(it.no) + ' — ' + esc(it.period) + ' — ' + esc(it.cat) + '</span>' +
          '<div style="display:grid;grid-template-columns:56px minmax(0,1fr);gap:8px 10px;font-family:\'Archivo\',\'IBM Plex Sans KR\',sans-serif;font-size:12px;line-height:1.6"><span style="font-size:10px;color:#6b6b65;padding-top:2px">활동</span><span>' + esc(it.act) + '</span><span style="font-size:10px;color:#6b6b65;padding-top:2px">맡은 일</span><span>[맡은 일 텍스트]</span><span style="font-size:10px;color:#6b6b65;padding-top:2px">배운 점</span><span>[배운 점 텍스트]</span></div>' +
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
