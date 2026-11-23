// =========================================================
//  Yaso Design — トップページの動き
//  - メニュー / ふわっと表示
//  - 道を描いて、スクロールに合わせて甲羅をクルクル回しながら滑らせる
// =========================================================
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const root = document.documentElement;

document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
requestAnimationFrame(() => setTimeout(() => root.classList.add("loaded"), 100));

// ===== メニュー =====
const menuBtn = document.querySelector(".menu-btn");
if (menuBtn) {
  const setMenu = (open) => {
    root.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
  };
  menuBtn.addEventListener("click", () => setMenu(!root.classList.contains("menu-open")));
  document.querySelectorAll(".menu a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
}

// ===== 画面に入ったら表示 =====
const showEls = document.querySelectorAll(".reveal, .message-text");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.2 });
  showEls.forEach((el) => io.observe(el));
} else {
  showEls.forEach((el) => el.classList.add("in"));
}


// =========================================================
//  道と甲羅
// =========================================================
const journey = document.getElementById("journey");
const svg = document.getElementById("road");
const shell = document.getElementById("shell");
if (journey && svg && shell) {
  const NS = "http://www.w3.org/2000/svg";
  const paths = ["road-edge", "road-body", "road-tuft", "road-line"].map((id) => document.getElementById(id)).filter(Boolean);
  const spin = shell.querySelector(".shell-spin");
  const vw = (v) => (parseFloat(v) * innerWidth) / 100;
  const cssPx = (name) => {
    const v = getComputedStyle(root).getPropertyValue(name).trim();
    return v.endsWith("vw") ? vw(v) : parseFloat(v);
  };
  const measure = (d) => {
    const p = document.createElementNS(NS, "path");
    p.setAttribute("d", d);
    svg.appendChild(p);
    const len = p.getTotalLength();
    return { p, len };
  };

  let segs = [];   // { y0, y1, path, len0, len1 }
  let full = null; // 全体のパス（位置を取る用）
  let total = 0;

  const build = () => {
    segs.forEach((s) => s.p.remove());
    if (full) full.p.remove();
    const W = innerWidth, vh = innerHeight;
    const H = journey.offsetHeight;
    const rx = cssPx("--road-x");
    const rw = cssPx("--road-w");
    const closing = document.querySelector(".closing");
    // むすびのボタンの少し下で、道が右へ曲がり始める（journey の上端からの距離）
    const jTop = journey.getBoundingClientRect().top;
    const pillBottom = closing.querySelector(".pill").getBoundingClientRect().bottom - jTop;
    const textEnd = Math.min(pillBottom + vh * 0.2, H - vh * 0.5);

    // ① 左の外から横向きに入ってきて、ゆるやかに曲がって下向きに
    const yIn = vh * 0.42;
    const y0 = vh * 0.06;
    const dIn = `M ${-W * 0.3} ${y0} C ${rx + W * 0.04} ${y0}, ${rx} ${y0 + vh * 0.12}, ${rx} ${yIn}`;
    // ② まっすぐ下へ
    const dMid = `M ${rx} ${yIn} L ${rx} ${textEnd}`;
    // ③ 最後は右下へカーブして抜けていく
    // ③ 最後は右下へカーブして、エンディングのコピーにぶつかる
    const t = document.querySelector(".ending-title").getBoundingClientRect();
    const hx = t.left + t.width * 0.35;          // ぶつかる位置（コピーの上の辺）
    const hy = t.top - jTop - Math.max(12, t.height * 0.05);
    const dOut = `M ${rx} ${textEnd} C ${rx} ${textEnd + vh * 0.35}, ${hx - W * 0.12} ${hy - vh * 0.35}, ${hx} ${hy}`;
    const d = `${dIn} L ${rx} ${textEnd} C ${rx} ${textEnd + vh * 0.35}, ${hx - W * 0.12} ${hy - vh * 0.35}, ${hx} ${hy}`;

    // 道を描くときは index.html の svg#road に path を戻す（いまは甲羅だけ）
    paths.forEach((p) => p.setAttribute("d", d));
    // 拡大縮小させず、ページの座標そのままで描く
    svg.removeAttribute("viewBox");
    svg.setAttribute("width", W);
    svg.setAttribute("height", H);

    const a = measure(dIn), b = measure(dMid), c = measure(dOut);
    [a, b, c].forEach((m) => m.p.setAttribute("visibility", "hidden"));
    full = measure(d);
    full.p.setAttribute("visibility", "hidden");
    total = full.len;
    // 画面の中心の高さ（y）→ 道の上の距離 への対応表
    segs = [
      { p: a.p, y0: 0, y1: yIn, len0: 0, len1: a.len },
      { p: b.p, y0: yIn, y1: textEnd, len0: a.len, len1: a.len + b.len },
      { p: c.p, y0: textEnd, y1: hy, len0: a.len + b.len, len1: total },
    ];
    target = targetLen();
    if (cur === null) cur = target;
  };

  const targetLen = () => {
    const y = scrollY + innerHeight * 0.52 - journey.offsetTop;
    if (!segs.length) return 0;
    if (y <= 0) return 0;
    for (const s of segs) {
      if (y <= s.y1) return s.len0 + ((y - s.y0) / (s.y1 - s.y0)) * (s.len1 - s.len0);
    }
    return total;
  };

  let cur = null, target = 0, angle = 0, running = false, exploded = false;
  const tick = () => {
    target = targetLen();
    const prev = cur;
    cur += (target - cur) * (reduceMotion ? 1 : 0.1);
    if (Math.abs(target - cur) < 0.3) cur = target;
    const v = cur - prev;

    const p = full.p.getPointAtLength(clamp(cur, 0, total));
    const q = full.p.getPointAtLength(clamp(cur + 2, 0, total));
    let dir = Math.atan2(q.y - p.y, q.x - p.x) * (180 / Math.PI) - 90; // 下向き＝0°
    if (v < 0) dir += 180; // 逆に進むときは後ろが反対
    angle += v * 2.2; // 進んだぶんだけクルクル

    shell.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${dir}deg)`;
    spin.style.transform = `rotate(${angle}deg)`;
    shell.style.setProperty("--dust", Math.abs(v) > 0.6 ? "running" : "paused");
    // 道の終わりの少し手前で、ちっちゃく爆発して消える（戻ればまた出てくる）
    // コピーにぶつかったら爆発して消える（戻ればまた出てくる）
    const boomAt = total - 2;
    if (!exploded && cur >= boomAt && v > 0) { exploded = true; boom(p.x, p.y); }
    if (exploded && cur < boomAt - 80) exploded = false;
    shell.style.opacity = cur <= 1 || exploded ? 0 : 1;

    running = cur !== target;
    if (running) requestAnimationFrame(tick);
  };
  const wake = () => { if (!running && full) { running = true; requestAnimationFrame(tick); } };
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

  // 爆発：光 + 輪2重 + 火花 + 星 + 甲羅のかけら + 煙
  const boom = (x, y) => {
    if (reduceMotion) return;
    const b = document.createElement("div");
    b.className = "boom";
    b.style.transform = `translate(${x}px, ${y}px)`;
    const rnd = (a, z) => a + Math.random() * (z - a);
    let html = '<span class="boom-flash"></span><span class="boom-ring"></span><span class="boom-ring boom-ring--2"></span>';
    const colors = ["#3fbf4c", "#c3f14b", "#ffd84a", "#ff8a4c", "#ff7eb6", "#3b4df6"];
    for (let k = 0; k < 30; k++) {
      const ang = (k / 30) * Math.PI * 2 + rnd(0, 0.3);
      const d = rnd(90, 190);
      html += `<i class="boom-spark" style="--dx:${(Math.cos(ang) * d).toFixed(1)}px;--dy:${(Math.sin(ang) * d).toFixed(1)}px;--c:${colors[k % colors.length]};--s:${rnd(7, 15).toFixed(1)}px;--t:${rnd(0.55, 0.9).toFixed(2)}s"></i>`;
    }
    for (let k = 0; k < 8; k++) {
      const ang = rnd(0, Math.PI * 2), d = rnd(70, 150);
      html += `<i class="boom-star" style="--dx:${(Math.cos(ang) * d).toFixed(1)}px;--dy:${(Math.sin(ang) * d).toFixed(1)}px;--c:${colors[k % colors.length]};--r:${Math.round(rnd(-360, 360))}deg">★</i>`;
    }
    for (let k = 0; k < 12; k++) {
      const ang = (k / 12) * Math.PI * 2 + rnd(0, 0.5), d = rnd(70, 150);
      html += `<i class="boom-shard" style="--dx:${(Math.cos(ang) * d).toFixed(1)}px;--dy:${(Math.sin(ang) * d + 60).toFixed(1)}px;--r:${Math.round(rnd(-720, 720))}deg;--bx:${Math.round(rnd(0, 100))}%;--by:${Math.round(rnd(0, 100))}%;--z:${rnd(0.8, 1.6).toFixed(2)}"></i>`;
    }
    for (let k = 0; k < 6; k++) {
      const ang = rnd(0, Math.PI * 2), d = rnd(20, 60);
      html += `<i class="boom-smoke" style="--dx:${(Math.cos(ang) * d).toFixed(1)}px;--dy:${(Math.sin(ang) * d - 30).toFixed(1)}px;--s:${rnd(30, 56).toFixed(0)}px;animation-delay:${(0.08 + k * 0.03).toFixed(2)}s"></i>`;
    }
    b.innerHTML = html;
    journey.appendChild(b);
    // ぶつかられたコピーが、ちょっとだけ跳ねる
    const title = document.querySelector(".ending-title");
    title.classList.remove("is-hit"); void title.offsetWidth; title.classList.add("is-hit");
    setTimeout(() => b.remove(), 1600);
  };

  // 甲羅はふつうの配置ではなく transform で動かす
  shell.style.left = "0";
  shell.style.top = "0";
  shell.style.translate = "-50% -50%";

  build();
  tick();
  addEventListener("scroll", wake, { passive: true });
  let rt;
  const rebuild = () => { clearTimeout(rt); rt = setTimeout(() => { build(); wake(); tick(); }, 120); };
  addEventListener("resize", rebuild);
  if ("ResizeObserver" in window) new ResizeObserver(rebuild).observe(journey);
}

// =========================================================
//  ファーストビュー
// =========================================================
// ① 縦書きコピーを1文字ずつポップさせる
{
  let n = 0;
  document.querySelectorAll("[data-pop]").forEach((col) => {
    const chars = [...col.textContent];
    col.textContent = "";
    chars.forEach((c) => {
      const s = document.createElement("span");
      s.className = "ch";
      s.textContent = c;
      s.setAttribute("aria-hidden", "true");
      s.dataset.i = n++;
      col.appendChild(s);
    });
  });
  const pop = () => document.querySelectorAll("[data-pop] .ch").forEach((s) => {
    setTimeout(() => s.classList.add("on"), 300 + s.dataset.i * 70);
  });
  if (reduceMotion) document.querySelectorAll("[data-pop] .ch").forEach((s) => s.classList.add("on"));
  else pop();
}

// ② 画像をフェードで切り替える（左端ののぞき画像はひとつ前の画像）
{
  const slider = document.getElementById("fv-slider");
  if (slider) {
    const main = [...slider.querySelectorAll(".fv-slides .fv-slide")];
    const peek = [...document.querySelectorAll(".fv-slides--peek .fv-slide")];
    const DUR = 5000;
    let i = 0, timer;
    const go = (k) => {
      i = (k + main.length) % main.length;
      main.forEach((m, j) => m.classList.toggle("is-on", j === i));
      peek.forEach((m, j) => m.classList.toggle("is-on", j === (i - 1 + main.length) % main.length));
    };
    go(0);
    if (!reduceMotion) timer = setInterval(() => go(i + 1), DUR);
  }
}

// ③ 画像の外周を、英字がぐるっと流れ続ける
{
  const svgEl = document.getElementById("fv-ring");
  if (svgEl) {
    const path = document.getElementById("fv-ring-path");
    const tp = document.getElementById("fv-ring-text");
    const UNIT = ["A LITTLE POSITIVITY,", "FOR EVERY DAY.", "YASO DESIGN"];
    let unitLen = 0, offset = 0;
    const build = () => {
      const r = svgEl.getBoundingClientRect();
      const w = r.width, h = r.height, rad = h / 2;
      // 右下 → 左へ → 左の半円を回って → 上を右へ（時計回り）
      path.setAttribute("d", `M ${w} ${h} L ${rad} ${h} A ${rad} ${rad} 0 0 1 ${rad} 0 L ${w} 0`);
      const total = path.getTotalLength();
      // 1セットの長さを測ってから、外周＋1セットぶん並べる
      tp.innerHTML = UNIT.map((t, k) => `<tspan class="${k === 2 ? "dim" : ""}">${t}</tspan><tspan class="dim"> ・ </tspan>`).join("");
      unitLen = tp.getComputedTextLength();
      const reps = Math.ceil(total / unitLen) + 2;
      tp.innerHTML = tp.innerHTML.repeat(reps);
    };
    build();
    let rt;
    addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(build, 150); });
    if (document.fonts) document.fonts.ready.then(build);
    if (!reduceMotion) {
      const loop = () => {
        offset = (offset + 0.35) % unitLen;
        tp.setAttribute("startOffset", -offset);
        requestAnimationFrame(loop);
      };
      loop();
    }
  }
}

// =========================================================
//  フッターのほげほげ：タップすると「I’m HOGEHOGE」としゃべる
// =========================================================
{
  const btn = document.querySelector(".foot-hoge");
  if (btn) {
    const say = btn.querySelector(".foot-say");
    let t;
    btn.addEventListener("click", () => {
      say.textContent = "I’m HOGEHOGE";
      say.classList.remove("on"); void say.offsetWidth; say.classList.add("on");
      clearTimeout(t);
      t = setTimeout(() => say.classList.remove("on"), 1800);
    });
  }
}
