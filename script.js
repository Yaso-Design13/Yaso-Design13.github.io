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

// My Policy：画面の上の方に散らばった単語が、スクロールに合わせて下へ降りてきて一文に揃う
const gathers = [...document.querySelectorAll("[data-gather]")];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (gathers.length && !reduceMotion) {
  // 毎回同じ散らばり方になるよう、決まった乱数を使う
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  const split = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(" "));
          } else {
            const span = document.createElement("span");
            span.className = "g";
            span.textContent = part;
            frag.appendChild(span);
          }
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        split(child);
      }
    });
  };

  const blocks = gathers.map((el) => {
    split(el);
    const words = [...el.querySelectorAll(".g")].map((g) => ({
      g,
      rx: rand(), // 横の散らばり位置
      ry: rand(), // どれだけ上から降りてくるか
      rd: rand(), // 動き出すタイミングのずれ
      dx: 0,
      dy: 0,
    }));
    // 散らばり先はマス目に1語ずつ割り振って、単語同士が重なりにくいようにする
    const order = words.map((_, i) => i).sort(() => rand() - 0.5);
    words.forEach((w, i) => (w.cell = order[i]));
    return { el, words };
  });

  // 散らばり先を計算：横は画面幅いっぱい、縦は「止まった画面」の上側の空き
  const layout = () => {
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const margin = Math.min(40, vw * 0.04);
    blocks.forEach(({ el, words }) => {
      const stage = el.closest(".policy-stage");
      words.forEach((w) => (w.g.style.transform = "none"));
      const sentenceTop = el.getBoundingClientRect().top;
      const stageTop = stage.getBoundingClientRect().top;
      // 止まった画面での文の位置（画面上端から）
      const restTop = sentenceTop - stageTop;
      const areaTop = Math.min(130, vh * 0.16);
      const areaBottom = restTop + el.offsetHeight * 0.35;
      const cols = vw < 640 ? 2 : 3;
      const rows = Math.ceil(words.length / cols);
      const cellW = (vw - margin * 2) / cols;
      const cellH = (areaBottom - areaTop) / rows;
      words.forEach((w) => {
        const r = w.g.getBoundingClientRect();
        const col = w.cell % cols;
        const row = Math.floor(w.cell / cols);
        const x = margin + col * cellW + w.rx * Math.max(0, cellW - r.width);
        const targetX = Math.min(x, vw - margin - r.width);
        const wordRest = r.top - stageTop; // 揃ったときの単語の位置
        const targetY = areaTop + row * cellH + w.ry * Math.max(0, cellH - r.height);
        w.dx = targetX - r.left;
        w.dy = targetY - wordRest;
      });
    });
  };

  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const update = () => {
    const vh = window.innerHeight;
    blocks.forEach(({ el, words }) => {
      const block = el.closest(".policy-block");
      const r = block.getBoundingClientRect();
      // 画面が止まっている間（ブロックの高さ − 1画面ぶん）の 75% で揃いきる
      const p = -r.top / ((block.offsetHeight - vh) * 0.75);
      words.forEach((w) => {
        const t = Math.min(Math.max((p - w.rd * 0.35) / 0.65, 0), 1);
        const k = 1 - ease(t);
        w.g.style.transform = k < 0.001 ? "none" : `translate3d(${(w.dx * k).toFixed(1)}px, ${(w.dy * k).toFixed(1)}px, 0)`;
      });
    });
  };

  let gTicking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (gTicking) return;
      gTicking = true;
      requestAnimationFrame(() => {
        update();
        gTicking = false;
      });
    },
    { passive: true }
  );
  window.addEventListener("resize", () => {
    layout();
    update();
  });
  // フォント読み込み後に位置を測り直す
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
    layout();
    update();
  });
  layout();
  update();
}
