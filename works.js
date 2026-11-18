// =========================================================
//  Works ページ
//  作品を追加・差し替えるときは、下の WORKS を編集するだけでOK。
//  images の main / circle / mini に画像パスを入れると、仮表示から本番画像に切り替わる。
//    main   … 中央の大きなカード（縦長 3:4）
//    circle … 丸く切り抜く画像（正方形 1:1）
//    mini   … 小さな縦長カード（スマホ画面 9:16 など）
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
      circle: "images/STUBO/char-2.svg",
      mini: "images/STUBO/stubo-ticket.png",
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

const pad = (n) => String(n).padStart(2, "0");
const $scenes = document.getElementById("wk-scenes");
const $titles = document.getElementById("wk-titles");
const $index = document.getElementById("wk-index");
const $snaps = document.getElementById("wk-snaps");
const $now = document.getElementById("wk-now");
document.getElementById("wk-total").textContent = pad(WORKS.length);
document.getElementById("wk").style.setProperty("--n", WORKS.length);

// 画像があれば <img>、なければアイコンを使った仮表示
const fill = (src, w, fit = "cover") =>
  src
    ? `<img src="${src}" alt="" loading="lazy" style="object-fit:${fit}" />`
    : `<img class="ph" src="${w.icon}" alt="" loading="lazy" />`;

WORKS.forEach((w, i) => {
  const flip = i % 2 === 1 ? " flip" : "";
  const isSvg = (s) => s && s.endsWith(".svg");

  // シーン（画像の集まり）
  const scene = document.createElement("div");
  scene.className = `wk-scene${flip}`;
  scene.style.setProperty("--accent", w.accent);
  scene.innerHTML = `
    <span class="el el-mini" style="--s:1.35">${fill(w.images.mini, w)}</span>
    <a class="el el-main" style="--s:1" href="${w.url}" target="_blank" rel="noopener noreferrer"
       data-umami-event="works-${w.name}" aria-label="${w.name} を App Store で見る">
      ${fill(w.images.main, w)}
      <span class="go" aria-hidden="true">↗</span>
    </a>
    <span class="el el-icon" style="--s:0.6"><img src="${w.icon}" alt="" /></span>
    <span class="el el-circle" style="--s:1.7">${fill(w.images.circle, w, isSvg(w.images.circle) ? "contain" : "cover")}</span>
  `;
  $scenes.appendChild(scene);

  // 名前とカテゴリ
  const title = document.createElement("div");
  title.className = "wk-title";
  title.innerHTML = `
    <h2 class="wk-name">${w.name}</h2>
    <span class="pill">${w.category}</span>
  `;
  $titles.appendChild(title);

  // 右側の目次
  const li = document.createElement("li");
  li.innerHTML = `<button type="button" data-i="${i}"><span>${pad(i + 1)}</span>${w.name}</button>`;
  $index.appendChild(li);

  // スクロールの止まり位置
  const snap = document.createElement("div");
  snap.className = "wk-snap";
  snap.id = w.id;
  $snaps.appendChild(snap);
});

const scenes = [...$scenes.children];
const titles = [...$titles.children];
const indexBtns = [...$index.querySelectorAll("button")];
const section = document.getElementById("wk");
let active = -1;

const update = () => {
  const unit = $snaps.firstElementChild.offsetHeight || window.innerHeight;
  const progress = Math.min(Math.max(-section.getBoundingClientRect().top / unit, 0), WORKS.length - 1);

  scenes.forEach((scene, i) => {
    const p = progress - i; // 0 = 表示中、+1 = 上へ抜けた、-1 = 下から来る
    const near = Math.abs(p) < 1.2;
    scene.style.visibility = near ? "visible" : "hidden";
    if (!near) return;
    scene.style.setProperty("--p", p.toFixed(4));
    scene.style.setProperty("--o", Math.max(0, 1 - Math.abs(p) * 1.4).toFixed(3));
  });

  const now = Math.round(progress);
  if (now !== active) {
    active = now;
    $now.textContent = pad(now + 1);
    titles.forEach((t, i) => t.classList.toggle("on", i === now));
    indexBtns.forEach((b, i) => b.classList.toggle("on", i === now));
    document.documentElement.style.setProperty("--wk-accent", WORKS[now].accent);
  }
};

let ticking = false;
window.addEventListener(
  "scroll",
  () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    }
  },
  { passive: true }
);
window.addEventListener("resize", update);

// 目次クリックでその作品へ
indexBtns.forEach((b) =>
  b.addEventListener("click", () => {
    document.getElementById(WORKS[+b.dataset.i].id).scrollIntoView({ behavior: "smooth" });
  })
);

update();
requestAnimationFrame(() => document.documentElement.classList.add("loaded"));
