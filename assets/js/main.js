/* Learnlike — site interactions and the 3D "ll" mark. */
(function () {
  'use strict';

  var SITE = { CONTACT_EMAIL: 'support@learnlike.co.in' };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var body = document.body;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };

  var yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- header + mobile menu ---------- */
  var hdr = $('.hdr');
  var burger = $('.burger');
  function setMenu(open) {
    body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  burger.addEventListener('click', function () { setMenu(!body.classList.contains('menu-open')); });
  $$('.mnav a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ---------- reveal ---------- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    $$('.reveal').forEach(function (el) { io.observe(el); });
  } else { $$('.reveal').forEach(function (el) { el.classList.add('in'); }); }

  /* ---------- copy email ---------- */
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = b.getAttribute('data-copy');
      var done = function () { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy'; }, 1600); };
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(done, done); else done();
    });
  });

  /* ---------- forms: open the visitor's email app with the message filled in ---------- */
  $$('form[data-mailto]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!f.reportValidity()) return;
      var lines = [];
      $$('input,select,textarea', f).forEach(function (el) {
        if (!el.name || el.type === 'submit' || el.type === 'checkbox' && !el.checked) return;
        var lab = el.closest('label');
        var name = lab ? lab.firstChild.textContent.trim() : el.name;
        if (el.value) lines.push(name + ': ' + el.value);
      });
      var subject = f.getAttribute('data-subject') || 'Website enquiry';
      location.href = 'mailto:' + SITE.CONTACT_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
      var ok = $('.sent', f); if (ok) ok.hidden = false;
    });
  });

  /* ---------- pre-fill form choices from links such as contact.html?subject=Partnership ---------- */
  try {
    var qs = new URLSearchParams(location.search);
    [['subject', 'subject'], ['book', 'book']].forEach(function (pair) {
      var v = qs.get(pair[0]); if (!v) return;
      $$('select[name="' + pair[1] + '"]').forEach(function (sel) {
        Array.prototype.forEach.call(sel.options, function (o) { if (o.text.toLowerCase().indexOf(v.toLowerCase()) === 0) sel.value = o.value || o.text; });
      });
    });
  } catch (e) {}

  /* ---------- pointer light ---------- */
  var light = $('.light');
  var ptr = { x: innerWidth / 2, y: innerHeight / 2, nx: 0, ny: 0 };
  var lp = { x: ptr.x, y: ptr.y };
  addEventListener('pointermove', function (e) {
    if (e.pointerType === 'mouse') ptr.moved = true;
    ptr.x = e.clientX; ptr.y = e.clientY;
    ptr.nx = e.clientX / innerWidth * 2 - 1; ptr.ny = e.clientY / innerHeight * 2 - 1;
  }, { passive: true });

  /* ---------- vision words ---------- */
  var big = $('#bigline');
  var words = [];
  if (big) {
    var html = big.innerHTML.split(/<br\s*\/?>/i).map(function (line) {
      return line.trim().split(/\s+/).map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' ');
    }).join('<br>');
    big.innerHTML = html;
    words = $$('.w', big);
  }
  var vms = $$('.vm div');

  /* ---------- values track ---------- */
  var track = $('#track');
  var pps = $$('.pp');
  var bars = $$('.pr-bar i b');
  var prNow = $('#prNow');

  /* ---------- approach flow ---------- */
  var flow = $('#flow');
  var steps = $$('.st');
  var fBase = $('#fBase'), fLit = $('#fLit');
  var flowLen = 0;
  function buildFlow() {
    if (!flow) return;
    var fr = flow.getBoundingClientRect();
    var pts = steps.map(function (s) {
      var d = $('.dot', s).getBoundingClientRect();
      return [d.left - fr.left + d.width / 2, d.top - fr.top + d.height / 2];
    });
    var d = 'M' + pts[0][0] + ' ' + pts[0][1];
    for (var i = 1; i < pts.length; i++) {
      var p = pts[i - 1], q = pts[i];
      if (Math.abs(q[1] - p[1]) < 2 || Math.abs(q[0] - p[0]) < 2) { d += ' L' + q[0] + ' ' + q[1]; }
      else {
        // run level from each dot, then bend just before the next one so the line never crosses step text
        var bend = Math.min(70, (q[0] - p[0]) * 0.45);
        d += ' L' + (q[0] - bend) + ' ' + p[1] + ' C' + (q[0] - bend * 0.35) + ' ' + p[1] + ' ' + (q[0] - bend * 0.35) + ' ' + q[1] + ' ' + q[0] + ' ' + q[1];
      }
    }
    fBase.setAttribute('d', d); fLit.setAttribute('d', d);
    flowLen = fLit.getTotalLength();
    fLit.style.strokeDasharray = flowLen;
    fLit.style.strokeDashoffset = flowLen;
  }

  /* ---------- nav + rail ---------- */
    var rail = $('.rail');
  var railItems = $$('.rail li');
  var secs = $$('main section[id]');

  function secProgress(el) {
    var r = el.getBoundingClientRect();
    var span = r.height - innerHeight;
    return span > 0 ? clamp(-r.top / span, 0, 1) : clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1);
  }

  function onScroll() {
    hdr.classList.toggle('scrolled', scrollY > 20);

    // current section
    if (!secs.length) return;
    var cur = secs[0].id;
    secs.forEach(function (s) { if (s.getBoundingClientRect().top < innerHeight * 0.45) cur = s.id; });
    if (rail) {
      rail.classList.toggle('show', cur !== 'platform');
      rail.classList.toggle('hide', cur === 'contact');
      railItems.forEach(function (li) { li.classList.toggle('on', li.getAttribute('data-st') === cur); });
    }

    // vision words
    var vis = $('#vision');
    if (vis && words.length) {
      var p = secProgress(vis);
      var n = Math.round(clamp(p / 0.6, 0, 1) * words.length);
      words.forEach(function (w, i) { w.classList.toggle('on', i < n); });
      vms.forEach(function (v, i) { v.classList.toggle('on', p > 0.62 + i * 0.08); });
    }

    // values
    var pr = $('#values');
    if (pr && track) {
      var q = secProgress(pr);
      var maxX = track.scrollWidth - innerWidth + parseFloat(getComputedStyle(track).paddingLeft);
      track.style.transform = 'translate3d(' + (-q * Math.max(0, maxX)) + 'px,0,0)';
      var idx = clamp(Math.round(q * (pps.length - 1)), 0, pps.length - 1);
      pps.forEach(function (el, i) { el.classList.toggle('on', i === idx); });
      bars.forEach(function (b, i) {
        var seg = clamp(q * pps.length - i, 0, 1);
        b.style.transform = 'scaleX(' + seg + ')';
      });
      if (prNow) prNow.textContent = ('0' + (idx + 1)).slice(-2);
    }

    // flow
    if (flow && flowLen) {
      var fr = flow.getBoundingClientRect();
      var fp = clamp((innerHeight * 0.75 - fr.top) / (fr.height + innerHeight * 0.2), 0, 1);
      fLit.style.strokeDashoffset = flowLen * (1 - fp);
      steps.forEach(function (s, i) { s.classList.toggle('on', fp >= i / steps.length + 0.02); });
    }
  }

  var scrollQueued = false;
  addEventListener('scroll', function () { if (scrollQueued) return; scrollQueued = true; requestAnimationFrame(function () { scrollQueued = false; onScroll(); }); }, { passive: true });
  addEventListener('resize', function () { buildFlow(); onScroll(); });

  function start() {
    body.classList.add('ready');
    buildFlow(); onScroll();
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start); else start();
  setTimeout(start, 900);

  /* ---------- light loop ---------- */
  if (matchMedia('(hover:hover)').matches) (function tick() {
    var dx = ptr.x - lp.x, dy = ptr.y - lp.y;
    if (Math.abs(dx) + Math.abs(dy) > 0.5) {
      lp.x += dx * 0.06; lp.y += dy * 0.06;
      if (light) light.style.transform = 'translate3d(' + lp.x + 'px,' + lp.y + 'px,0)';
    }
    requestAnimationFrame(tick);
  })();

  /* ---------- CTA neon lines ---------- */
  (function neon() {
    var cv = $('#neon'); if (!cv) return;
    var ctx = cv.getContext('2d'); var w, h, dpr, on = false, t = 0;
    function size() { dpr = Math.min(devicePixelRatio || 1, 1.25); w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size(); addEventListener('resize', size);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { on = e[0].isIntersecting; }).observe(cv); else on = true;
    var cols = ['rgba(150,100,240,', 'rgba(112,66,193,', 'rgba(211,108,242,'];
    function draw() {
      requestAnimationFrame(draw);
      if (!on) return;
      t += reduce ? 0 : 0.006;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
      for (var k = 0; k < 9; k++) {
        var c = cols[k % 3];
        ctx.beginPath();
        for (var x = 0; x <= w; x += 12) {
          var y = h * 0.62 + Math.sin(x * 0.0026 + t * (1 + k * 0.13) + k) * (40 + k * 9) + Math.sin(x * 0.006 - t * 1.7 + k * 2) * 14 + (k - 4) * 16;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = c + (0.10 + (k % 3) * 0.05) + ')';
        ctx.lineWidth = 1 + (k % 2);
        ctx.shadowBlur = 8; ctx.shadowColor = c + '0.35)';
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
    draw();
  })();

  /* ---------- 3D "ll" mark ---------- */
  function initGL() {
    var canvas = $('#gl');
    if (!window.THREE || !canvas) { document.documentElement.classList.add('no-gl'); return; }
    var THREE = window.THREE;
    var renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); }
    catch (e) { document.documentElement.classList.add('no-gl'); return; }
    var DPR = Math.min(devicePixelRatio || 1, innerWidth < 768 ? 1.5 : 1.75);
    renderer.setPixelRatio(DPR);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0, 12);
    var mark = new THREE.Group(); scene.add(mark);

    var lowPower = (navigator.hardwareConcurrency || 4) <= 4 || innerWidth < 768;
    var N = innerWidth < 768 ? 2600 : lowPower ? 4200 : 5600;
    var rnd = Math.random;
    function gauss() { return (rnd() + rnd() + rnd() - 1.5) / 1.5; }

    /* ---------- shapes: each fills an N*3 array ---------- */
    function rrPoint(sz, r) {             // random point inside a rounded square
      var h = sz / 2;
      for (;;) {
        var x = (rnd() * 2 - 1) * h, y = (rnd() * 2 - 1) * h;
        var dx = Math.max(Math.abs(x) - (h - r), 0), dy = Math.max(Math.abs(y) - (h - r), 0);
        if (dx * dx + dy * dy <= r * r) return [x, y];
      }
    }
    function strokePath(x0) {             // one "l": straight down, then curving right
      var path = new THREE.CurvePath();
      path.add(new THREE.LineCurve3(new THREE.Vector3(x0, 0.92, 0), new THREE.Vector3(x0, -0.38, 0)));
      path.add(new THREE.CubicBezierCurve3(new THREE.Vector3(x0, -0.38, 0), new THREE.Vector3(x0, -0.78, 0), new THREE.Vector3(x0 + 0.18, -0.9, 0), new THREE.Vector3(x0 + 0.56, -0.8, 0)));
      return path;
    }
    var P1 = strokePath(-0.72), P2 = strokePath(0.08);
    var isStroke = new Float32Array(N);
    function shapeLL() {
      var a = new Float32Array(N * 3);
      for (var i = 0; i < N; i++) {
        if (i >= N * 0.64) {              // the two white strokes (drawn last, on top of the tile)
          var pth = i % 2 ? P1 : P2, t = rnd(), pt = pth.getPointAt(t);
          var ang = rnd() * Math.PI * 2, rr = 0.17 * Math.sqrt(rnd());
          a[i * 3] = pt.x + Math.cos(ang) * rr; a[i * 3 + 1] = pt.y + Math.sin(ang) * rr * 0.9; a[i * 3 + 2] = 0.42 + Math.sin(ang) * rr;
          isStroke[i] = 1;
        } else {                          // the purple tile: both faces and the rim
          var q = rrPoint(3, 0.55), face = rnd();
          var z = face < 0.45 ? 0.24 : face < 0.9 ? -0.24 : (rnd() * 2 - 1) * 0.24;
          if (face >= 0.9) {              // push rim points to the edge
            var hh = 1.5, ex = Math.abs(q[0]) > Math.abs(q[1]);
            if (ex) q[0] = Math.sign(q[0]) * hh; else q[1] = Math.sign(q[1]) * hh;
          }
          a[i * 3] = q[0]; a[i * 3 + 1] = q[1]; a[i * 3 + 2] = z;
        }
      }
      return a;
    }
    function shapeGlobe() {
      var a = new Float32Array(N * 3), g = Math.PI * (3 - Math.sqrt(5));
      for (var i = 0; i < N; i++) {
        var y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = g * i, R = 1.75 + gauss() * 0.04;
        if (i % 7 === 0) R *= 0.55 + rnd() * 0.35;  // inner core
        a[i * 3] = Math.cos(th) * r * R; a[i * 3 + 1] = y * R; a[i * 3 + 2] = Math.sin(th) * r * R;
      }
      return a;
    }
    function shapeRing() {
      var a = new Float32Array(N * 3);
      for (var i = 0; i < N; i++) {
        var u = rnd() * Math.PI * 2, v = rnd() * Math.PI * 2, R = 1.45, r = 0.42 + gauss() * 0.03;
        a[i * 3] = (R + r * Math.cos(v)) * Math.cos(u); a[i * 3 + 1] = r * Math.sin(v); a[i * 3 + 2] = (R + r * Math.cos(v)) * Math.sin(u);
      }
      return a;
    }
    function shapeHelix() {
      var a = new Float32Array(N * 3);
      for (var i = 0; i < N; i++) {
        var t = rnd(), y = (t - 0.5) * 3.6, ang = t * Math.PI * 5, k = i % 5;
        if (k < 4) {
          var o = k % 2 ? Math.PI : 0, R = 0.95;
          a[i * 3] = Math.cos(ang + o) * R + gauss() * 0.06; a[i * 3 + 1] = y + gauss() * 0.04; a[i * 3 + 2] = Math.sin(ang + o) * R + gauss() * 0.06;
        } else {                          // rungs between the strands
          var step = Math.round(t * 24) / 24, ang2 = step * Math.PI * 5, f = rnd() * 2 - 1;
          a[i * 3] = Math.cos(ang2) * 0.95 * f; a[i * 3 + 1] = (step - 0.5) * 3.6; a[i * 3 + 2] = Math.sin(ang2) * 0.95 * f;
        }
      }
      return a;
    }
    function shapeWave() {
      var a = new Float32Array(N * 3), side = Math.ceil(Math.sqrt(N));
      for (var i = 0; i < N; i++) {
        var gx = (i % side) / side - 0.5, gz = Math.floor(i / side) / side - 0.5, x = gx * 4.4, z = gz * 4.4;
        a[i * 3] = x; a[i * 3 + 1] = Math.sin(x * 1.6) * 0.32 + Math.cos(z * 1.9) * 0.28; a[i * 3 + 2] = z;
      }
      return a;
    }
    function shapeLattice() {
      var a = new Float32Array(N * 3), h = 1.35;
      for (var i = 0; i < N; i++) {
        var c = [(rnd() * 2 - 1) * h, (rnd() * 2 - 1) * h, (rnd() * 2 - 1) * h];
        var ax = i % 3, bx = (i + 1) % 3;           // place on the cube's edges
        c[ax] = Math.sign(c[ax] || 1) * h; c[bx] = Math.sign(c[bx] || 1) * h;
        if (i % 4 === 0) { c = [(Math.floor(rnd() * 3) - 1) * h * 0.66, (Math.floor(rnd() * 3) - 1) * h * 0.66, (Math.floor(rnd() * 3) - 1) * h * 0.66].map(function (v) { return v + gauss() * 0.05; }); }
        a[i * 3] = c[0]; a[i * 3 + 1] = c[1]; a[i * 3 + 2] = c[2];
      }
      return a;
    }
    function shapeStar() {
      var a = new Float32Array(N * 3), pts = [];
      for (var k = 0; k < 10; k++) { var ang = Math.PI / 2 + k * Math.PI / 5, R = k % 2 ? 0.78 : 1.85; pts.push([Math.cos(ang) * R, Math.sin(ang) * R]); }
      function inside(x, y) { var c = false; for (var i = 0, j = 9; i < 10; j = i++) { var xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1]; if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) c = !c; } return c; }
      for (var i = 0; i < N; i++) {
        var x, y; do { x = (rnd() * 2 - 1) * 1.85; y = (rnd() * 2 - 1) * 1.85; } while (!inside(x, y));
        var depth = 0.34 * (1 - Math.min(1, Math.hypot(x, y) / 1.85));   // puffed in the middle
        a[i * 3] = x; a[i * 3 + 1] = y - 0.1; a[i * 3 + 2] = (rnd() < 0.5 ? 1 : -1) * (0.06 + depth);
      }
      return a;
    }
    var SHAPES = [shapeLL(), shapeGlobe(), shapeRing(), shapeHelix(), shapeWave(), shapeLattice(), shapeStar()];

    var scatter = new Float32Array(N * 3), seed = new Float32Array(N), colLL = new Float32Array(N * 3), colAlt = new Float32Array(N * 3);
    var pal = [new THREE.Color('#5d32b4'), new THREE.Color('#7042C1'), new THREE.Color('#8457d6'), new THREE.Color('#9b62dc'), new THREE.Color('#52299f')];
    var light = new THREE.Color('#ffffff'), tileC = new THREE.Color('#7042C1');
    for (var i = 0; i < N; i++) {
      var r = 6 + rnd() * 6, th = rnd() * Math.PI * 2, ph = Math.acos(rnd() * 2 - 1);
      scatter[i * 3] = r * Math.sin(ph) * Math.cos(th); scatter[i * 3 + 1] = r * Math.cos(ph); scatter[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th) - 2;
      seed[i] = rnd();
      var c1 = isStroke[i] ? light : tileC.clone().lerp(pal[Math.floor(rnd() * pal.length)], rnd() * 0.7);
      colLL[i * 3] = c1.r; colLL[i * 3 + 1] = c1.g; colLL[i * 3 + 2] = c1.b;
      var c2 = pal[Math.floor(rnd() * pal.length)];
      colAlt[i * 3] = c2.r; colAlt[i * 3 + 1] = c2.g; colAlt[i * 3 + 2] = c2.b;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(SHAPES[0], 3));
    for (var k = 0; k < SHAPES.length; k++) geo.setAttribute('p' + k, new THREE.BufferAttribute(SHAPES[k], 3));
    geo.setAttribute('scatter', new THREE.BufferAttribute(scatter, 3));
    geo.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
    geo.setAttribute('stroke', new THREE.BufferAttribute(isStroke, 1));
    geo.setAttribute('cLL', new THREE.BufferAttribute(colLL, 3));
    geo.setAttribute('cAlt', new THREE.BufferAttribute(colAlt, 3));

    var uni = {
      uW0: { value: 1 }, uW1: { value: 0 }, uW2: { value: 0 }, uW3: { value: 0 }, uW4: { value: 0 }, uW5: { value: 0 }, uW6: { value: 0 },
      uIntro: { value: reduce ? 1 : 0 }, uTime: { value: 0 }, uSize: { value: 33 * DPR }, uMouse: { value: new THREE.Vector3(99, 99, 0) },
      uAlpha: { value: 1 }, uBurst: { value: 0 }
    };
    var mat = new THREE.ShaderMaterial({
      uniforms: uni, transparent: true, depthWrite: false,
      vertexShader: [
        'attribute vec3 p0; attribute vec3 p1; attribute vec3 p2; attribute vec3 p3; attribute vec3 p4; attribute vec3 p5; attribute vec3 p6;',
        'attribute vec3 scatter; attribute float seed; attribute float stroke; attribute vec3 cLL; attribute vec3 cAlt;',
        'uniform float uW0, uW1, uW2, uW3, uW4, uW5, uW6, uIntro, uTime, uSize, uBurst; uniform vec3 uMouse;',
        'varying vec3 vCol; varying float vA;',
        'void main(){',
        '  vec3 p = p0*uW0 + p1*uW1 + p2*uW2 + p3*uW3 + p4*uW4 + p5*uW5 + p6*uW6;',
        '  float wave = uW4;',
        '  p.y += wave * (sin(p.x*1.6 + uTime*1.2)*0.12 + cos(p.z*1.9 + uTime*0.9)*0.1);',
        '  p += vec3(sin(uTime*0.7 + seed*40.0), cos(uTime*0.6 + seed*30.0), sin(uTime*0.5 + seed*20.0)) * (0.018 + (1.0-uW0)*0.02);',
        '  float t = clamp(uIntro*1.7 - seed*0.7, 0.0, 1.0); t = t*t*(3.0-2.0*t);',
        '  p += normalize(p + vec3(0.0001)) * uBurst * (0.5 + seed * 1.6);',
        '  p = mix(scatter, p, t);',
        '  vec2 d = p.xy - uMouse.xy; float dist = length(d);',
        '  p.xy += normalize(d + 0.0001) * 0.55 * exp(-dist*dist*2.6) * t;',
        '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
        '  gl_Position = projectionMatrix * mv;',
        '  float sz = mix(0.75, 1.2, seed) * (1.0 + stroke*uW0*0.3);',
        '  gl_PointSize = uSize * sz / -mv.z;',
        '  vCol = mix(cAlt, cLL, uW0);',
        '  vA = mix(0.82, 0.97, seed) * mix(0.3, 1.0, t); vA = mix(vA, 1.0, stroke*uW0);',
        '}'].join('\n'),
      fragmentShader: [
        'uniform float uAlpha; varying vec3 vCol; varying float vA;',
        'void main(){ vec2 c = gl_PointCoord - 0.5; float d = length(c); if (d > 0.5) discard;',
        '  float a = smoothstep(0.5, 0.26, d) * vA * uAlpha; gl_FragColor = vec4(vCol, a); }'].join('\n')
    });
    var points = new THREE.Points(geo, mat);
    mark.add(points);

    /* ---------- which shape belongs to which section ---------- */
    var secEls = $$('main > section');
    // 0 ll · 1 globe · 2 ring · 3 helix · 4 wave · 5 lattice · 6 star
    var page = (location.pathname.split('/').pop() || 'index.html').replace('.html', '');
    var PAGE_SHAPE = { about: 1, solutions: 5, careers: 3, partners: 2, accolades: 6, contact: 4 };
    var HOME = { platform: 0, solutions: 1, vision: 2, values: 3, approach: 4, programs: 5, contact: 6 };
    var shapeOf = {}, cycle = [1, 2, 3, 4, 5, 6], ci = 0, isHome = !(page in PAGE_SHAPE);
    if (!isHome) ci = cycle.indexOf(PAGE_SHAPE[page]) + 1;
    secEls.forEach(function (sec, i) { shapeOf[i] = 0; });   // the ll logo in every section
    var centers = [];
    function measure() {
      centers = secEls.map(function (s) { var r = s.getBoundingClientRect(); return r.top + scrollY + Math.min(r.height, innerHeight) / 2; });
    }

    var anchors = $$('[data-anchor]');
    var st = { x: 0, y: 0, s: 1, a: 1, init: false };
    var W = [0, 0, 0, 0, 0, 0, 0]; W[shapeOf[0] || 0] = 1;
    for (var w0 = 0; w0 < 7; w0++) uni['uW' + w0].value = W[w0];
    var spinTarget = 0, spinNow = 0, burstV = 0, lastSec = 0;

    function resize() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); measure(); }
    resize(); addEventListener('resize', resize); addEventListener('load', measure);

    var smooth = function (a, b, x) { x = clamp((x - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };
    var mouseW = new THREE.Vector3(), ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), ndc = new THREE.Vector2();
    var clock = new THREE.Clock();

    function frame() {
      requestAnimationFrame(frame);
      if (document.hidden) { clock.getDelta(); return; }
      var dt = Math.min(clock.getDelta(), 0.1), t = clock.elapsedTime;
      uni.uTime.value = t;
      if (!reduce) uni.uIntro.value = Math.min(1, uni.uIntro.value + dt / 2.2);

      // target shape weights from scroll position
      var mid = scrollY + innerHeight / 2, target = [0, 0, 0, 0, 0, 0, 0];
      if (!centers.length) measure();
      var j = 0; while (j < centers.length - 1 && centers[j + 1] <= mid) j++;
      var a = shapeOf[j] || 0, b = shapeOf[Math.min(j + 1, centers.length - 1)] || 0;
      var f = j < centers.length - 1 ? smooth(0.35, 0.75, (mid - centers[j]) / Math.max(1, centers[j + 1] - centers[j])) : 0;
      if (mid < centers[0]) f = 0;
      target[a] += 1 - f; target[b] += f;
      var kk = reduce ? 1 : 1 - Math.exp(-dt * 4);
      for (var n = 0; n < 7; n++) { W[n] = lerp(W[n], target[n], kk); uni['uW' + n].value = W[n]; }
      var secNow = j + (f > 0.5 ? 1 : 0);
      if (secNow !== lastSec) { lastSec = secNow; spinTarget += Math.PI * 2; burstV = 1; }
      burstV = Math.max(0, burstV - dt * 1.4);
      uni.uBurst.value = reduce ? 0 : Math.sin(burstV * Math.PI) * 0.8;

      // where to draw: on the nearest stage, or softly in the background
      var vh = innerHeight, best = null, bestD = 1e9;
      anchors.forEach(function (el) { var r = el.getBoundingClientRect(), d = Math.abs(r.top + r.height / 2 - vh / 2); if (d < bestD) { bestD = d; best = r; } });
      var visH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), visW = visH * camera.aspect;
      var onStage = best ? 1 - smooth(vh * 0.35, vh * 0.75, bestD) : 0;
      var tx = 0, ty = 0, ts = Math.max(visH * 0.95, visW * 0.62) / 3.4, ta = 0.36;
      if (best) {
        var px = Math.min(best.width, best.height) * (innerWidth < 768 ? 0.8 : 0.86);
        var sx = ((best.left + best.width / 2) / innerWidth - 0.5) * visW, sy = -((best.top + best.height / 2) / vh - 0.5) * visH, ss = (px / vh) * visH / 3.4;
        tx = lerp(tx, sx, onStage); ty = lerp(ty, sy, onStage); ts = lerp(ts, ss, onStage); ta = lerp(ta, 1, onStage);
      }
      var k2 = reduce ? 1 : 1 - Math.exp(-dt * 5);
      if (!st.init) { st.x = tx; st.y = ty; st.s = ts; st.a = ta; st.init = true; }
      st.x = lerp(st.x, tx, k2); st.y = lerp(st.y, ty, k2); st.s = lerp(st.s, ts, k2); st.a = lerp(st.a, ta, k2);
      mark.position.set(st.x, st.y + (reduce ? 0 : Math.sin(t * 1.1) * 0.06 * st.s), 0);
      mark.scale.setScalar(Math.max(0.001, st.s));
      uni.uAlpha.value = st.a;

      // rotation: gentle sway while showing the logo, a slow turn for other shapes
      if (!reduce) {
        spinNow = lerp(spinNow, spinTarget, 1 - Math.exp(-dt * 2.2));
        points.rotation.y = Math.sin(t * 0.45) * 0.38 + ptr.nx * 0.22 + spinNow;
        points.rotation.x = lerp(points.rotation.x, ptr.ny * 0.16, 0.05);
      }

      // mouse in the logo's own space, for the push-away effect
      ndc.set(ptr.x / innerWidth * 2 - 1, -(ptr.y / innerHeight) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      if (!ptr.moved) uni.uMouse.value.set(99, 99, 0);
      else if (ray.ray.intersectPlane(plane, mouseW)) { points.updateMatrixWorld(); uni.uMouse.value.copy(points.worldToLocal(mouseW.clone())); }
      renderer.render(scene, camera);
    }
    frame();
  }

  /* floating demo button appears after the hero */
  (function () {
    var fab = $('.fab-demo'); if (!fab) return;
    function upd() { fab.classList.toggle('show', scrollY > innerHeight * 0.6 && !body.classList.contains('menu-open')); }
    addEventListener('scroll', upd, { passive: true }); upd();
  })();

  /* rotating word under a heading */
  $$('.rot').forEach(function (el) {
    var words = (el.getAttribute('data-words') || '').split(','), i = 0;
    if (words.length < 2 || reduce) return;
    setInterval(function () {
      if (document.hidden) return;
      el.classList.remove('in'); el.classList.add('out');
      setTimeout(function () { i = (i + 1) % words.length; el.textContent = words[i]; el.classList.remove('out'); el.classList.add('in'); }, 340);
    }, 2600);
  });

  /* product logos orbiting the ll in 3D */
  (function () {
    var orb = $('.orbit'); if (!orb || reduce) return;
    var chips = $$('.oc', orb), n = chips.length, vis = true;
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { vis = e[0].isIntersecting; }).observe(orb);
    var t0 = performance.now(), tilt = 0;
    (function loop(now) {
      requestAnimationFrame(loop);
      if (!vis || document.hidden) return;
      var w = orb.clientWidth, h = orb.clientHeight, t = (now - t0) / 1000;
      var half = chips[0].offsetWidth / 2, box = orb.getBoundingClientRect();
      var room = Math.min(box.left + w / 2, innerWidth - (box.left + w / 2)) - half - 10;   // keep chips on screen
      var Rx = Math.max(60, Math.min(w * 0.6, 320, room)), Ry = Math.min(h * 0.5, 250);
      tilt += ((ptr.nx || 0) * 0.25 - tilt) * 0.05;
      for (var k = 0; k < n; k++) {
        var a = t * 0.32 + k / n * Math.PI * 2, z = Math.sin(a);           // z: -1 back, +1 front
        var x = Math.cos(a) * Rx, y = z * Ry + Math.cos(a) * Rx * tilt * 0.25;
        var sc = 0.72 + (z + 1) * 0.2, op = 0.35 + (z + 1) * 0.325;
        var c = chips[k];
        c.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) scale(' + sc.toFixed(3) + ')';
        c.style.opacity = op.toFixed(3);
        c.style.zIndex = z > 0 ? 3 : 1;
        c.style.filter = z < -0.2 ? 'blur(' + ((-z - 0.2) * 2).toFixed(2) + 'px)' : 'none';
      }
    })(t0);
  })();

  /* ================= site-wide motion ================= */
  (function motion() {
    // progress bar
    var bar = document.createElement('div'); bar.className = 'progress'; body.appendChild(bar);
    function prog() { var h = document.documentElement.scrollHeight - innerHeight; bar.style.transform = 'scaleX(' + (h > 0 ? scrollY / h : 0) + ')'; }
    addEventListener('scroll', prog, { passive: true }); prog();

    // smooth page changes
    $$('a[href]').forEach(function (a) {
      var h = a.getAttribute('href');
      if (!/\.html(\?|#|$)/.test(h) || a.target || h.indexOf('://') > -1) return;
      a.addEventListener('click', function (e) {
        var here = location.pathname.split('/').pop() || 'index.html', to = h.split(/[?#]/)[0];
        if (to === here || e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault(); body.classList.add('leaving');
        setTimeout(function () { location.href = h; }, reduce ? 0 : 320);
      });
    });
    addEventListener('pageshow', function () { body.classList.remove('leaving'); });
    if (reduce) return;

    var io2 = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io2.unobserve(e.target); if (e.target._onIn) e.target._onIn(); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    // staggered children
    var groups = '.boxes,.people,.team,.quotes,.media,.gallery,.logos,.plist,.courses,.books,.steps,.jobs,.regions,.info,.areas,.stats,.tl,.grid,.crumbs,.actions';
    $$(groups).forEach(function (g) {
      Array.prototype.forEach.call(g.children, function (c, i) {
        if (c.classList.contains('rv')) return;
        c.classList.add('rv'); c.style.setProperty('--d', (i % 8) * 75 + 'ms'); io2.observe(c);
      });
    });

    // headings: word-by-word reveal
    $$('.h2,.sub,.prod-head h3,.band h2,.book h3,.media h3,.box h3').forEach(function (el) {
      if (el.closest('.big') || el.id === 'bigline') return;
      var n = 0;
      (function walk(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (c) {
          if (c.nodeType === 3) {
            var parts = c.textContent.split(/(\s+)/), frag = document.createDocumentFragment();
            parts.forEach(function (w) {
              if (!w) return;
              if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
              var o = document.createElement('span'); o.className = 'wd';
              var i2 = document.createElement('span'); i2.textContent = w; i2.style.setProperty('--d', Math.min(n++, 14) * 55 + 'ms');
              o.appendChild(i2); frag.appendChild(o);
            });
            c.parentNode.replaceChild(frag, c);
          } else if (c.nodeType === 1 && c.tagName !== 'BR' && !c.classList.contains('status')) walk(c);
        });
      })(el);
      el.classList.add('wsplit'); io2.observe(el);
    });

    // numbers count up
    $$('.stat b,.tl-y > b').forEach(function (el) {
      var m = el.textContent.trim().match(/^(\d[\d,]*)(.*)$/); if (!m || /\//.test(m[2])) return;
      var end = parseInt(m[1].replace(/,/g, ''), 10), suf = m[2], isYear = end > 1900 && end < 2100;
      el._onIn = function () {
        var t0 = performance.now(), from = isYear ? end - 12 : 0, dur = 1600;
        (function step(now) {
          var x = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - x, 3);
          el.textContent = Math.round(from + (end - from) * e).toLocaleString('en-IN') .replace(/,/g, isYear ? '' : ',') + suf;
          if (x < 1) requestAnimationFrame(step);
        })(t0);
      };
      el.textContent = (isYear ? end - 12 : 0) + suf; io2.observe(el);
    });

    // photos wipe in
    // (watch the container, not the image: a fully clipped image never counts as visible)
    var wipes = $$('.person img,.media img,.gallery img,.photo img,.book img');
    var io3 = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target._img.classList.add('in'); io3.unobserve(e.target); } });
    }, { threshold: 0.08 });
    wipes.forEach(function (img) { var box = img.parentElement; box._img = img; img.classList.add('wipe'); io3.observe(box); });
    // safety net: anything on screen is always shown
    setInterval(function () {
      if (document.hidden) return;
      wipes.forEach(function (img) { if (img.classList.contains('in')) return; var r = img.parentElement.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) img.classList.add('in'); });
      $$('.rv:not(.in),.wsplit:not(.in),.reveal:not(.in)').forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) { el.classList.add('in'); if (el._onIn) el._onIn(); } });
    }, 1200);

    // icons draw their lines
    $$('.area svg').forEach(function (svg) {
      var parts = $$('path,rect,circle', svg);
      parts.forEach(function (p, i) {
        var L = p.getTotalLength ? p.getTotalLength() : 200;
        p.style.strokeDasharray = L; p.style.strokeDashoffset = L;
        p.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(.16,.8,.2,1) ' + (i * 120) + 'ms';
      });
      svg._onIn = function () { parts.forEach(function (p) { p.style.strokeDashoffset = 0; }); };
      io2.observe(svg);
    });

    // cards tilt toward the pointer
    if (matchMedia('(hover:hover)').matches) {
      $$('.card,.box,.course,.quote,.person,.media article,.ind,.job,.book img,.band').forEach(function (c) {
        c.classList.add('tilt');
        c.addEventListener('pointermove', function (e) {
          var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
          var lift = c.classList.contains('band') ? 0 : -6;
          c.style.transform = 'perspective(900px) rotateX(' + (-y * 6) + 'deg) rotateY(' + (x * 7) + 'deg) translateY(' + lift + 'px)';
        });
        c.addEventListener('pointerleave', function () { c.style.transform = ''; });
      });
      // buttons lean toward the cursor
      $$('.btn').forEach(function (b) {
        b.addEventListener('pointermove', function (e) {
          var r = b.getBoundingClientRect();
          b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.18) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.28) + 'px)';
        });
        b.addEventListener('pointerleave', function () { b.style.transform = ''; });
      });
    }

    // custom cursor and click ripples
    if (matchMedia('(hover:hover)').matches) {
      var ring = document.createElement('div'); ring.className = 'cursor';
      var dot = document.createElement('div'); dot.className = 'cursor-dot';
      body.appendChild(ring); body.appendChild(dot);
      var cx = innerWidth / 2, cy = innerHeight / 2, rx = cx, ry = cy;
      addEventListener('pointermove', function (e) { cx = e.clientX; cy = e.clientY; dot.style.transform = 'translate(' + cx + 'px,' + cy + 'px)'; }, { passive: true });
      (function loop() { rx += (cx - rx) * 0.18; ry += (cy - ry) * 0.18; ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)'; requestAnimationFrame(loop); })();
      document.addEventListener('pointerover', function (e) { ring.classList.toggle('big', !!e.target.closest('a,button,summary,.card,.box,.person,.media article,.gallery figure,.ind,.course,.mem,.logos span')); });
    }
    $$('.btn').forEach(function (b) {
      b.addEventListener('click', function (e) {
        var r = b.getBoundingClientRect(), d = Math.max(r.width, r.height), sp = document.createElement('span');
        sp.className = 'ripple'; sp.style.width = sp.style.height = d + 'px';
        sp.style.left = (e.clientX - r.left - d / 2) + 'px'; sp.style.top = (e.clientY - r.top - d / 2) + 'px';
        b.appendChild(sp); setTimeout(function () { sp.remove(); }, 750);
      });
    });

    // solutions jump menu follows the section you are reading
    var jl = $$('.jump a');
    if (jl.length) {
      var targets = jl.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
      addEventListener('scroll', function () {
        var cur = 0; targets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top < innerHeight * 0.35) cur = i; });
        jl.forEach(function (a, i) { a.classList.toggle('on', i === cur); });
        var on = jl[cur]; if (on) { var nav = on.parentNode; nav.scrollLeft += (on.offsetLeft - nav.scrollLeft - nav.clientWidth / 2 + on.clientWidth / 2) * 0.2; }
      }, { passive: true });
    }

    // gentle parallax on large photos
    var par = $$('.photo img,.band');
    addEventListener('scroll', function () {
      par.forEach(function (el) {
        var r = el.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
        var c = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        if (el.tagName === 'IMG' && el.classList.contains('in')) el.style.transform = 'translateY(' + (c * -24) + 'px) scale(1.06)';
      });
    }, { passive: true });
  })();

  function loadGL() {
    if (window.THREE) return initGL();
    var sc = document.createElement('script'); sc.src = 'assets/js/three.min.js'; sc.async = true;
    sc.onload = initGL; sc.onerror = function () { document.documentElement.classList.add('no-gl'); };
    document.head.appendChild(sc);
  }
  var startGL = function () { ('requestIdleCallback' in window) ? requestIdleCallback(loadGL, { timeout: 600 }) : setTimeout(loadGL, 200); };
  if (document.readyState === 'complete') startGL(); else addEventListener('load', startGL);
})();

/* image warm-up: after the page is idle, start fetching every lazy image (they're small) so nothing waits for scroll */
(function(){
  function warm(){
    var imgs=[].slice.call(document.querySelectorAll('img[loading="lazy"]')), i=0;
    (function next(){ var n=0; while(i<imgs.length&&n<4){ imgs[i++].loading='eager'; n++; } if(i<imgs.length) setTimeout(next,150); })();
  }
  if(document.readyState==='complete') setTimeout(warm,300); else addEventListener('load',function(){ setTimeout(warm,300); });
})();
