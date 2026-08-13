/* =========================================================
   PURELANE GLOBAL JS
   Reveal-on-scroll (.pl-rv) + scroll-driven scene crossfade
   (data-scene zones). Include once in theme.liquid before </body>.
   Respects prefers-reduced-motion.
   ========================================================= */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- reveal on scroll ---------- */
  var revs = document.querySelectorAll('.pl-rv');
  if ('IntersectionObserver' in window && !reduce) {
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('pl-in');
          ro.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    revs.forEach(function (el) { ro.observe(el); });
  } else {
    revs.forEach(function (el) { el.classList.add('pl-in'); });
  }

  /* ---------- scene crossfade (scroll driven) ---------- */
  var scenes = [].slice.call(document.querySelectorAll('.pl-scene'));
  var zones = [].slice.call(document.querySelectorAll('[data-scene]'));
  var stage = document.getElementById('pl-scenes');
  var current = 1;

  function setScene(n) {
    if (n === current) return;
    current = n;
    scenes.forEach(function (s, i) { s.classList.toggle('pl-on', i + 1 === n); });
    if (stage) stage.setAttribute('data-d', String(n));
  }

  function pickScene() {
    if (!zones.length) return;
    var focus = window.scrollY + window.innerHeight * 0.5;
    var n = 1;
    for (var i = 0; i < zones.length; i++) {
      var z = zones[i], top = 0, el = z;
      while (el) { top += el.offsetTop; el = el.offsetParent; }
      if (top <= focus) n = parseInt(z.getAttribute('data-scene'), 10) || n;
    }
    setScene(n);
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(function () { pickScene(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });

  pickScene();

  /* ---------- hero product rotator ---------- */
  document.querySelectorAll('[data-hero-rotator]').forEach(function (stageEl) {
    var slides = [].slice.call(stageEl.querySelectorAll('.pl-hslide'));
    var dotsWrap = stageEl.parentElement.querySelector('[data-hero-dots]');
    var dots = dotsWrap ? [].slice.call(dotsWrap.querySelectorAll('button')) : [];
    var idx = 0, timer = null, autoplayMs = parseInt(stageEl.getAttribute('data-autoplay') || '0', 10);

    function show(i) {
      idx = i;
      slides.forEach(function (s, j) { s.classList.toggle('pl-on', j === i); });
      dots.forEach(function (d, j) { d.classList.toggle('pl-on', j === i); });
    }

    dots.forEach(function (d, i) {
      d.addEventListener('click', function () {
        show(i);
        restartAutoplay();
      });
    });

    function restartAutoplay() {
      if (timer) clearInterval(timer);
      if (autoplayMs > 0 && !reduce) {
        timer = setInterval(function () {
          show((idx + 1) % slides.length);
        }, autoplayMs);
      }
    }

    show(0);
    restartAutoplay();
  });
})();