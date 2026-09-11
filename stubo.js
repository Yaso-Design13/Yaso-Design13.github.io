// ===== 年号 =====
(function () {
  var y = new Date().getFullYear();
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = y; });
})();

var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ===== スクロール表示（reveal / 特大英字）=====
(function () {
  var targets = document.querySelectorAll(".reveal, .display-en");
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("in"); });
    return;
  }
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        // 同じ親の中の並び順で少しずつ遅らせる（スタッガー）
        var siblings = el.parentElement
          ? Array.prototype.filter.call(el.parentElement.children, function (c) {
              return c.classList.contains("reveal");
            })
          : [];
        var idx = siblings.indexOf(el);
        el.style.transitionDelay = (idx > 0 ? idx * 90 : 0) + "ms";
        el.classList.add("in");
        io.unobserve(el);
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
  );
  targets.forEach(function (el) { io.observe(el); });
})();

// ===== スクショ横スクロール：1枚目を中央に、両端も見切れで揃える =====
(function () {
  var s = document.querySelector(".st-screens");
  var track = document.querySelector(".st-screens-track");
  if (!s || !track) return;
  var first = track.querySelector(".st-screen");
  function layout() {
    if (!first) return;
    var pad = Math.max(20, Math.round((s.clientWidth - first.offsetWidth) / 2));
    track.style.paddingLeft = pad + "px";
    track.style.paddingRight = pad + "px";
    s.scrollLeft = 0; // 1枚目が中央に来る
  }
  layout();
  window.addEventListener("load", layout);
  window.addEventListener("resize", layout);
})();

// ===== 下部固定ダウンロードボタンの表示制御 =====
// ヒーローを過ぎたら表示、最後のCTAが見えたら隠す
(function () {
  var sticky = document.querySelector(".st-sticky-cta");
  var hero = document.querySelector(".st-hero");
  var cta = document.querySelector(".st-cta-wrap");
  if (!sticky || !("IntersectionObserver" in window)) {
    if (sticky) sticky.classList.add("show");
    return;
  }
  var heroVisible = true;
  var ctaVisible = false;
  function update() {
    if (!heroVisible && !ctaVisible) sticky.classList.add("show");
    else sticky.classList.remove("show");
  }
  if (hero) {
    new IntersectionObserver(function (es) {
      heroVisible = es[0].isIntersecting;
      update();
    }, { threshold: 0.35 }).observe(hero);
  }
  if (cta) {
    new IntersectionObserver(function (es) {
      ctaVisible = es[0].isIntersecting;
      update();
    }, { threshold: 0.2 }).observe(cta);
  }
})();

// ===== 軽いパララックス（[data-parallax]）=====
(function () {
  if (reduce) return;
  var items = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
  if (!items.length) return;
  var ticking = false;

  function update() {
    var vh = window.innerHeight;
    items.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) return;
      var speed = parseFloat(el.getAttribute("data-parallax")) || 0.05;
      // 画面中央からの距離で移動量を決める
      var offset = (rect.top + rect.height / 2 - vh / 2) * speed;
      el.style.transform = "translate3d(0," + (-offset).toFixed(1) + "px,0)";
    });
    ticking = false;
  }
  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  update();
})();
