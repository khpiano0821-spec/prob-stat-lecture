// 웹 발표 화면: 한 장씩 표시, 클릭·방향키로 이동, 정답(.frag) 차례로 공개
(function () {
  var canvas = document.getElementById('canvas');
  var slides = Array.prototype.slice.call(canvas.querySelectorAll(':scope > section'));
  var notes = document.getElementById('notes');
  var count = document.getElementById('count');
  var progress = document.getElementById('progress');
  var cur = 0;

  function fit() {
    var s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    canvas.style.transform = 'scale(' + s + ')';
  }

  function frags(sl) {
    return Array.prototype.slice.call(sl.querySelectorAll('.frag'))
      .sort(function (a, b) { return a.dataset.order - b.dataset.order; });
  }

  function leave(sl) {
    sl.classList.remove('active');
    sl.querySelectorAll('video').forEach(function (v) { v.pause(); });
    sl.querySelectorAll('iframe.embed').forEach(function (f) { f.removeAttribute('srcdoc'); });
  }

  function enter(sl, showAll) {
    sl.classList.add('active');
    frags(sl).forEach(function (f) { f.classList.toggle('shown', !!showAll); });
    // 시뮬레이션은 장에 들어올 때마다 처음부터 시작
    sl.querySelectorAll('iframe.embed').forEach(function (f) { f.srcdoc = f.dataset.srcdoc; });
  }

  function go(i, showAll) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    if (slides[cur]) leave(slides[cur]);
    cur = i;
    enter(slides[cur], showAll);
    count.textContent = (cur + 1) + ' / ' + slides.length;
    progress.style.width = ((cur + 1) / slides.length * 100) + '%';
    var aside = slides[cur].querySelector('aside');
    notes.textContent = aside ? aside.textContent : '(메모 없음)';
    history.replaceState(null, '', '#' + (cur + 1));
  }

  function next() {
    var hidden = frags(slides[cur]).filter(function (f) { return !f.classList.contains('shown'); });
    if (hidden.length) hidden[0].classList.add('shown');
    else go(cur + 1);
  }

  function prev() { go(cur - 1, true); }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ' || e.key === 'Enter') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || e.key === 'Backspace') { e.preventDefault(); prev(); }
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(slides.length - 1, true);
    else if (e.key === 'f' || e.key === 'F') {
      if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen();
    } else if (e.key === 'n' || e.key === 'N') notes.hidden = !notes.hidden;
  });

  document.getElementById('stage').addEventListener('click', function (e) {
    if (e.target.closest('video, a')) return;
    if (e.clientX < window.innerWidth * 0.25) prev(); else next();
  });

  var tx = null;
  document.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (tx === null) return;
    var dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) { dx < 0 ? next() : prev(); }
    tx = null;
  });

  window.addEventListener('resize', fit);
  fit();
  var start = parseInt(location.hash.slice(1), 10);
  go(isNaN(start) ? 0 : start - 1);
})();
