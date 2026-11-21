// Shared helpers for the demos. No dependencies.
const $ = (s) => document.querySelector(s);
function cssv(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
function rgbv(name) { return cssv(name).split(',').map(Number); }

// Hi-DPI canvas with a logical coordinate system of w x h.
function initCanvas(c, w, h) {
  const d = window.devicePixelRatio || 1;
  c.width = Math.round(w * d); c.height = Math.round(h * d);
  c.style.width = w + 'px'; c.style.aspectRatio = w + ' / ' + h;
  const g = c.getContext('2d'); g.scale(d, d); g.W = w; g.H = h;
  return g;
}
// Pointer position in logical canvas coordinates.
function pointer(c, e, w, h) {
  const r = c.getBoundingClientRect();
  return [(e.clientX - r.left) * w / r.width, (e.clientY - r.top) * h / r.height];
}
// Wire a range input #id to a readout #id-v and a callback.
function bind(id, fn, fmt) {
  const el = $('#' + id), out = $('#' + id + '-v');
  const up = () => { if (out) out.textContent = fmt ? fmt(+el.value) : el.value; if (fn) fn(+el.value); };
  el.addEventListener('input', up); up(); return el;
}
function randn() {
  let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
// Paint a low-res scalar field fn(x,y)->[r,g,b,a(0..255)] over the whole canvas. x,y in [-1,1], y up.
function heat(g, n, fn) {
  const off = heat._c || (heat._c = document.createElement('canvas'));
  off.width = n; off.height = n;
  const og = off.getContext('2d'), im = og.createImageData(n, n);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const c = fn((i + 0.5) / n * 2 - 1, 1 - (j + 0.5) / n * 2), k = (j * n + i) * 4;
    im.data[k] = c[0]; im.data[k + 1] = c[1]; im.data[k + 2] = c[2]; im.data[k + 3] = c[3];
  }
  og.putImageData(im, 0, 0);
  g.imageSmoothingEnabled = true;
  g.drawImage(off, 0, 0, g.W, g.H);
}
// Map data coords in [-1,1] to canvas.
const X = (g, x) => (x + 1) / 2 * g.W, Y = (g, y) => (1 - y) / 2 * g.H;
function dot(g, x, y, col, r) {
  g.beginPath(); g.arc(X(g, x), Y(g, y), r || 4, 0, 7); g.fillStyle = col; g.fill();
  g.lineWidth = 1; g.strokeStyle = cssv('--card'); g.stroke();
}
// Toy 2-D datasets. Returns [{x,y,t}], t in {0,1}.
function dataset(kind, n) {
  const P = []; n = n || 200;
  for (let i = 0; i < n; i++) {
    const t = i % 2; let x, y;
    if (kind === 'linear') { x = (t ? 0.45 : -0.45) + randn() * 0.22; y = (t ? 0.35 : -0.35) + randn() * 0.22; }
    else if (kind === 'xor') {
      const sx = Math.random() < 0.5 ? -1 : 1, sy = t ? -sx : sx;
      x = sx * 0.5 + randn() * 0.15; y = sy * 0.5 + randn() * 0.15;
    } else if (kind === 'rings') {
      const a = Math.random() * 2 * Math.PI, r = t ? Math.random() * 0.32 : 0.62 + Math.random() * 0.26;
      x = r * Math.cos(a); y = r * Math.sin(a);
    } else { // spiral
      const u = (i >> 1) / (n / 2), r = 0.08 + u * 0.85, a = u * 3.4 * Math.PI + t * Math.PI;
      x = r * Math.cos(a) + randn() * 0.025; y = r * Math.sin(a) + randn() * 0.025;
    }
    P.push({ x: Math.max(-0.98, Math.min(0.98, x)), y: Math.max(-0.98, Math.min(0.98, y)), t });
  }
  return P;
}
