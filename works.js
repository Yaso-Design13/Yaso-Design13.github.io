// =========================================================
//  Works ページ
//  作品を追加・差し替えるときは、下の WORKS を編集するだけでOK。
//  images に画像パスを入れると、仮表示（アイコン）から本番画像に切り替わる。
//    main    … 中央の大きなカード（縦長 3:4）
//    sub     … 左端を流れるカード（縦長 3:4）
//    bubbles … 丸く切り抜く画像3枚 [左上・左下・右下]（正方形 1:1）
// =========================================================
const WORKS = [
  {
    id: "sticker",
    name: "sticker",
    category: "Photo & Video",
    accent: "#8fe36a",
    icon: "images/work-sticker.png",
    url: "https://apps.apple.com/jp/app/id6811901999",
    images: {},
  },
  {
    id: "stubo",
    name: "STUBO",
    category: "Travel",
    accent: "#4b63f0",
    icon: "images/work-stubo.jpg",
    url: "https://apps.apple.com/jp/app/stubo-%E6%97%85%E8%A1%8C%E4%BA%88%E5%AE%9A%E3%82%92%E3%83%81%E3%82%B1%E3%83%83%E3%83%88%E3%81%A7%E5%85%B1%E6%9C%89/id6801696906",
    images: {
      main: "images/STUBO/stubo-top.png",
      sub: "images/STUBO/stubo-ticket.png",
      bubbles: ["images/STUBO/char-2.svg", "images/work-stubo.jpg", "images/STUBO/stubo-vlog.png"],
    },
  },
  {
    id: "pickers",
    name: "PICKERS",
    category: "Graphics & Design",
    accent: "#ff7a3c",
    icon: "images/work-pickers.png",
    url: "https://apps.apple.com/jp/app/pickers-%E3%82%AB%E3%83%A9%E3%83%BC%E6%8E%A2%E3%81%97/id6793430061",
    images: {},
  },
  {
    id: "routon",
    name: "ROUTON",
    category: "Health & Fitness",
    accent: "#8fce2b",
    icon: "images/work-routon.png",
    url: "https://apps.apple.com/jp/app/routon-%E3%83%A9%E3%83%B3%E3%83%8B%E3%83%B3%E3%82%B0-%E3%81%95%E3%82%93%E3%81%BD%E3%81%AE%E8%A8%98%E9%8C%B2/id6790777455",
    images: {},
  },
  {
    id: "mojimoji",
    name: "mojimoji",
    category: "Photo & Video",
    accent: "#3a3a3a",
    icon: "images/work-mojimoji.png",
    url: "https://apps.apple.com/jp/app/mojimoji-%E6%96%87%E5%AD%97%E6%8E%A2%E3%81%97-%E3%82%B3%E3%83%A9%E3%83%BC%E3%82%B8%E3%83%A5/id6787369039",
    images: {},
  },
  {
    id: "sanpo",
    name: "さんぽしよ",
    category: "Health & Fitness",
    accent: "#101014",
    icon: "images/work-sanpo.png",
    url: "https://apps.apple.com/jp/app/%E3%81%95%E3%82%93%E3%81%BD%E3%81%97%E3%82%88/id6758305298",
    images: {},
  },
];

document.getElementById("year").textContent = new Date().getFullYear();
document.documentElement.classList.add("wk-ready");

const n = WORKS.length;
const pad = (v) => String(v).padStart(2, "0");
const $ = (id) => document.getElementById(id);
$("wk-total").textContent = pad(n);

// 画像があれば <img>、なければアイコンを使った仮表示
const media = (src, w, kind) => {
  if (src) {
    const fit = src.endsWith(".svg") ? "contain" : "cover";
    return `<img src="${src}" alt="" loading="lazy" style="object-fit:${fit}" />`;
  }
  return `<img class="ph ph--${kind}" src="${w.icon}" alt="" loading="lazy" />`;
};

// ---- 中央と左のカード列 ----
const mainCards = WORKS.map((w) => {
  const a = document.createElement("a");
  a.className = "wk-card";
  a.href = w.url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.dataset.umamiEvent = `works-${w.name}`;
  a.setAttribute("aria-label", `${w.name} を App Store で見る`);
  a.style.setProperty("--accent", w.accent);
  a.innerHTML = media(w.images.main, w, "main");
  $("wk-main").appendChild(a);
  return a;
});
const subCards = WORKS.map((w) => {
  const d = document.createElement("span");
  d.className = "wk-card wk-card--sub";
  d.style.setProperty("--accent", w.accent);
  d.innerHTML = media(w.images.sub, w, "sub");
  $("wk-sub").appendChild(d);
  return d;
});

// ---- 丸い画像3つ（作品ぶんの層を重ねて、表示中だけ見せる） ----
const bubbles = [0, 1, 2].map((b) => {
  const el = $(`wk-b${b}`);
  const inner = document.createElement("span");
  inner.className = "bubble-in";
  WORKS.forEach((w) => {
    const layer = document.createElement("span");
    layer.className = "bubble-layer";
    layer.style.setProperty("--accent", w.accent);
    const src = (w.images.bubbles || [])[b];
    layer.innerHTML = media(src, w, `b${b}`);
    inner.appendChild(layer);
  });
  el.appendChild(inner);
  return { el, layers: [...inner.children] };
});

// ---- 表示 ----
let active = 0;
const prevOff = new Map();
const wrap = (d) => {
  let o = ((d % n) + n) % n;
  if (o > n / 2) o -= n;
  return o;
};
const place = (card, off) => {
  const before = prevOff.get(card);
  // 列の端から反対側へ回り込むカードは、アニメさせずに瞬間移動
  card.classList.toggle("jump", before !== undefined && Math.abs(off - before) > 1);
  card.style.setProperty("--off", off);
  card.classList.toggle("is-active", off === 0);
  card.style.visibility = Math.abs(off) > 2 ? "hidden" : "visible";
  prevOff.set(card, off);
};

const render = () => {
  const w = WORKS[active];
  mainCards.forEach((c, i) => place(c, wrap(i - active)));
  subCards.forEach((c, i) => place(c, -wrap(i - active)));
  mainCards.forEach((c, i) => c.setAttribute("tabindex", i === active ? "0" : "-1"));

  bubbles.forEach(({ el, layers }) => {
    el.style.setProperty("--accent", w.accent);
    layers.forEach((l, i) => l.classList.toggle("on", i === active));
  });

  const go = $("wk-go");
  go.href = w.url;
  go.dataset.umamiEvent = `works-arrow-${w.name}`;
  go.style.setProperty("--accent", w.accent);
  $("wk-go-label").textContent = `${w.name} を App Store で見る`;

  // タイトル：1文字ずつせり上がる
  const letters = [...w.name]
    .map((ch, i) => `<span class="ch" style="--i:${i}">${ch === " " ? "&nbsp;" : ch}</span>`)
    .join("");
  $("wk-title").innerHTML = `
    <h2 class="wk-name"><span class="visually-hidden">${w.name}</span><span aria-hidden="true">${letters}</span></h2>
    <p class="wk-cat">${w.category}</p>`;

  $("wk-now").textContent = pad(active + 1);
  if (location.hash !== `#${w.id}`) history.replaceState(null, "", `#${w.id}`);
};

// ---- 操作：ホイール・スワイプ・キーで1作品ずつ ----
const LOCK_MS = 950;
let lastStep = 0;
const step = (dir) => {
  const now = performance.now();
  if (now - lastStep < LOCK_MS) return;
  lastStep = now;
  active = (active + dir + n) % n;
  render();
};

let acc = 0;
let prevAbs = 0;
let lastWheel = 0;
window.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    const now = performance.now();
    const abs = Math.abs(e.deltaY);
    // トラックパッドの慣性（だんだん小さくなる連続入力）は無視する
    const inertia = now - lastWheel < 120 && abs <= prevAbs;
    prevAbs = abs;
    lastWheel = now;
    if (now - lastStep < LOCK_MS || inertia) { acc = 0; return; }
    acc += e.deltaY;
    if (Math.abs(acc) > 30) {
      step(acc > 0 ? 1 : -1);
      acc = 0;
    }
  },
  { passive: false }
);

let touchY = null;
window.addEventListener("touchstart", (e) => { touchY = e.touches[0].clientY; }, { passive: true });
window.addEventListener("touchmove", (e) => { if (touchY !== null) e.preventDefault(); }, { passive: false });
window.addEventListener("touchend", (e) => {
  if (touchY === null) return;
  const dy = touchY - e.changedTouches[0].clientY;
  touchY = null;
  if (Math.abs(dy) > 40) step(dy > 0 ? 1 : -1);
});

window.addEventListener("keydown", (e) => {
  if (["ArrowDown", "PageDown", " "].includes(e.key)) { e.preventDefault(); step(1); }
  if (["ArrowUp", "PageUp"].includes(e.key)) { e.preventDefault(); step(-1); }
});

// トップページから works.html#stubo のように来たら、その作品から始める
const fromHash = () => {
  const i = WORKS.findIndex((w) => `#${w.id}` === location.hash);
  return i < 0 ? 0 : i;
};
window.addEventListener("hashchange", () => {
  const i = fromHash();
  if (i !== active) { active = i; render(); }
});

active = fromHash();
render();
requestAnimationFrame(() => document.documentElement.classList.add("loaded"));
