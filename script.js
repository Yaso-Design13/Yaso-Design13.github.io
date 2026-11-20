// フッターの年号を自動更新
document.getElementById("year").textContent = new Date().getFullYear();

// 読み込み完了でヒーローの文字をせり上げる
requestAnimationFrame(() => document.documentElement.classList.add("loaded"));

// スクロールで要素をふわっと表示
const items = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  items.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 70}ms`;
    io.observe(el);
  });
} else {
  items.forEach((el) => el.classList.add("in"));
}

// ヒーロー：スクロール量に合わせて、カードを1枚ずつ積む
const pin = document.querySelector(".hero-pin");
const stacked = pin ? [...pin.querySelectorAll(".card")] : [];
if (pin && stacked.length && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const ease = (t) => 1 - Math.pow(1 - t, 3); // 最後にふわっと着地
  let cur = 0;     // 実際に表示している進み具合
  let running = false;
  const target = () => {
    const range = pin.offsetHeight - window.innerHeight;
    return Math.min(Math.max(-pin.getBoundingClientRect().top / range, 0), 1);
  };
  const draw = () => {
    const seg = 1 / stacked.length;
    stacked.forEach((card, i) => {
      const t = Math.min(Math.max((cur - i * seg) / seg, 0), 1);
      card.style.setProperty("--t", ease(t).toFixed(4));
    });
  };
  // スクロールに少し遅れてついていくことで、ゆっくり重なって見えるようにする
  const tick = () => {
    const goal = target();
    cur += (goal - cur) * 0.08;
    if (Math.abs(goal - cur) < 0.0005) cur = goal;
    draw();
    running = cur !== goal;
    if (running) requestAnimationFrame(tick);
  };
  const wake = () => { if (!running) { running = true; requestAnimationFrame(tick); } };
  window.addEventListener("scroll", wake, { passive: true });
  window.addEventListener("resize", wake);
  cur = target(); // 途中から再読み込みしたときは、その位置から始める
  draw();
}

// ステートメント：単語ごとに分割し、スクロール量に合わせて1語ずつ濃くする
const statement = document.querySelector("[data-words]");
if (statement) {
  const wrapWords = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
          } else {
            const span = document.createElement("span");
            span.className = "w";
            span.textContent = part;
            frag.appendChild(span);
          }
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        wrapWords(child);
      }
    });
  };
  wrapWords(statement);

  const words = statement.querySelectorAll(".w");
  let ticking = false;
  const update = () => {
    const rect = statement.getBoundingClientRect();
    const vh = window.innerHeight;
    // 文の上端が画面の85%に来たら開始、35%に来たら全語点灯
    const progress = (vh * 0.85 - rect.top) / (vh * 0.5);
    const lit = Math.round(Math.min(Math.max(progress, 0), 1) * words.length);
    words.forEach((w, i) => w.classList.toggle("on", i < lit));
    ticking = false;
  };
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true }
  );
  window.addEventListener("resize", update);
  update();
}
