// =========================================================
//  Works ページ
//  作品を追加・差し替えるときは、下の WORKS を編集するだけでOK。
//  images に画像パスを入れると、仮表示（アイコン）から本番画像に切り替わる。
//    main    … 中央の大きなカード（縦長 3:4）
//    sub     … 左端を流れるカード（縦長 3:4）。なければ main を使う
//    bubbles … 右下の丸い画像（正方形 1:1）。[左上, 左下, 右下] の3番目だけ使う
//  crop  … 左下の丸に、メインビジュアルのどこを切り抜くか [横%, 縦%, 拡大率]
//  crop2 … 右下の丸に切り抜く場所（なければ bubbles の3番目を使う）
//  左上の角丸四角には、いつも icon（アプリアイコン）が入る
// =========================================================
const WORKS = [
  {
    id: "sticker",
    name: "sticker",
    category: "Photo & Video",
    accent: "#8fe36a",
    icon: "images/work-sticker.png",
    url: "https://apps.apple.com/jp/app/id6811901999",
    crop: [72, 79, 2.6],
    crop2: [70, 24, 3],
    images: { main: "images/visual/sticker.jpg" },
  },
  {
    id: "stubo",
    name: "STUBO",
    category: "Travel",
    accent: "#4b63f0",
    icon: "images/work-stubo.jpg",
    url: "https://apps.apple.com/jp/app/stubo-%E6%97%85%E8%A1%8C%E4%BA%88%E5%AE%9A%E3%82%92%E3%83%81%E3%82%B1%E3%83%83%E3%83%88%E3%81%A7%E5%85%B1%E6%9C%89/id6801696906",
    crop: [50, 46, 1.8],
    images: {
      main: "images/STUBO/stubo-top.png",
      sub: "images/STUBO/stubo-ticket.png",
      bubbles: ["images/STUBO/char-2.svg", "images/work-stubo.jpg", "images/STUBO/stubo-vlog.png"],
    },
  },
  {
    id: "routon",
    name: "ROUTON",
    category: "Health & Fitness",
    accent: "#8fce2b",
    icon: "images/work-routon.png",
    url: "https://apps.apple.com/jp/app/routon-%E3%83%A9%E3%83%B3%E3%83%8B%E3%83%B3%E3%82%B0-%E3%81%95%E3%82%93%E3%81%BD%E3%81%AE%E8%A8%98%E9%8C%B2/id6790777455",
    crop: [79, 13, 3],
    crop2: [62, 30, 2.2],
    images: { main: "images/visual/routon.jpg" },
  },
  {
    id: "mojimoji",
    name: "mojimoji",
    category: "Photo & Video",
    accent: "#3a3a3a",
    icon: "images/work-mojimoji.png",
    url: "https://apps.apple.com/jp/app/mojimoji-%E6%96%87%E5%AD%97%E6%8E%A2%E3%81%97-%E3%82%B3%E3%83%A9%E3%83%BC%E3%82%B8%E3%83%A5/id6787369039",
    crop: [82, 31, 3.2],
    crop2: [49, 22, 3],
    images: { main: "images/visual/mojimoji.jpg" },
  },
  {
    id: "sanpo",
    name: "さんぽしよ",
    category: "Health & Fitness",
    accent: "#101014",
    icon: "images/work-sanpo.png",
    url: "https://apps.apple.com/jp/app/%E3%81%95%E3%82%93%E3%81%BD%E3%81%97%E3%82%88/id6758305298",
    crop: [50, 72, 3],
    crop2: [77, 78, 3],
    images: { main: "images/visual/sanpo.jpg" },
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
  d.innerHTML = media(w.images.sub || w.images.main, w, "sub"); // sub がなければメインビジュアルを流用
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
    if (b === 0) {
      // 左上：角丸四角のアプリアイコン
      layer.innerHTML = `<img src="${w.icon}" alt="" loading="lazy" style="object-fit:cover" />`;
    } else if (w.images.main && ((b === 1 && w.crop) || (b === 2 && w.crop2))) {
      // 左下・右下：メインビジュアルの一部を拡大して切り抜く（指定した点が円の中心に来る）
      const [x, y, z] = b === 1 ? w.crop : w.crop2;
      layer.innerHTML = `<img class="crop" src="${w.images.main}" alt="" loading="lazy"
        style="width:${z * 100}%; translate:-${x}% -${y}%" />`;
    } else {
      layer.innerHTML = media((w.images.bubbles || [])[b], w, `b${b}`);
    }
    inner.appendChild(layer);
  });
  el.appendChild(inner);
  return { el, layers: [...inner.children] };
});

// ---- カーソルについてくる矢印（マウス操作の端末だけ） ----
const cursor = $("wk-cursor");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
if (finePointer) {
  let tx = innerWidth / 2, ty = innerHeight / 2, cx = tx, cy = ty;
  window.addEventListener("pointermove", (e) => {
    tx = e.clientX;
    ty = e.clientY;
    // 表示中の中央カードの上にいるときだけ見せる
    cursor.classList.toggle("on", !!e.target.closest(".wk-card.is-active"));
  });
  document.addEventListener("pointerleave", () => cursor.classList.remove("on"));
  const follow = () => {
    cx += (tx - cx) * 0.22;
    cy += (ty - cy) * 0.22;
    cursor.style.translate = `${cx.toFixed(1)}px ${cy.toFixed(1)}px`;
    requestAnimationFrame(follow);
  };
  follow();
}

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
  cursor.style.setProperty("--accent", w.accent);
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
