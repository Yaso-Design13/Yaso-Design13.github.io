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

// Release Log：画面の真ん中にあるリリースに合わせて、右の大きな数字をカウントアップ
const logItems = [...document.querySelectorAll(".log-item")];
const logBig = document.getElementById("log-big");
if (logItems.length && logBig) {
  const digitEls = [...logBig.querySelectorAll(".digit")];
  const caption = document.getElementById("log-caption-n");
  let current = -1;
  const setCount = (i) => {
    if (i === current) return;
    current = i;
    const s = String(i + 1).padStart(2, "0");
    digitEls.forEach((d, k) => d.querySelector(".roll").style.setProperty("--d", s[k]));
    caption.textContent = s;
    logBig.style.setProperty("--log-accent", logItems[i].dataset.accent);
    logItems.forEach((el, k) => el.classList.toggle("on", k === i));
  };
  const pick = () => {
    const mid = window.innerHeight * 0.55;
    let best = 0;
    let bestDist = Infinity;
    logItems.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const dist = Math.abs(r.top + r.height / 2 - mid);
      if (dist < bestDist) { bestDist = dist; best = i; }
    });
    setCount(best);
  };
  let lTicking = false;
  window.addEventListener("scroll", () => {
    if (lTicking) return;
    lTicking = true;
    requestAnimationFrame(() => { pick(); lTicking = false; });
  }, { passive: true });
  pick();
}
