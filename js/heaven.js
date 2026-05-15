/* heaven.js — Garden pan, canvas sky, decorative interactions, crystal portals */
(function () {
  'use strict';

  const WORLD_W    = 2800;
  const WORLD_H    = 2000;
  const PAN_EASE   = 0.055;
  const EDGE_ZONE  = 0.16;
  const EDGE_SPEED = 3.4;

  const world    = document.getElementById('garden-world');
  const viewport = document.getElementById('garden-viewport');
  const canvas   = document.getElementById('heaven-canvas');
  const portal   = document.getElementById('heaven-portal');
  const msg      = document.getElementById('garden-msg');
  const minimap  = document.getElementById('minimap');
  const minimapVP = document.getElementById('minimap-vp');

  /* ── Custom cursor ── */
  const cursor = document.createElement('div');
  cursor.id = 'cursor';
  document.body.appendChild(cursor);

  /* ── Camera ── */
  let camX = WORLD_W / 2 - window.innerWidth  / 2;
  let camY = WORLD_H / 2 - window.innerHeight / 2;
  let tX = camX, tY = camY;
  let mouseX = 0, mouseY = 0;
  let isDragging = false, dragSX = 0, dragSY = 0, dragCX = 0, dragCY = 0;
  let portalOpen = false;
  let msgTimer = null;

  function clamp(x, y) {
    return [
      Math.max(0, Math.min(WORLD_W - window.innerWidth,  x)),
      Math.max(0, Math.min(WORLD_H - window.innerHeight, y))
    ];
  }

  /* ── Main loop ── */
  function loop() {
    if (!portalOpen) {
      camX += (tX - camX) * PAN_EASE;
      camY += (tY - camY) * PAN_EASE;
      [camX, camY] = clamp(camX, camY);
      world.style.transform = `translate(${-camX}px, ${-camY}px)`;
      updateMinimap();
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  /* ── Edge pan on mousemove ── */
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
    if (isDragging || portalOpen) return;

    const vw = window.innerWidth, vh = window.innerHeight;
    const ez = EDGE_ZONE * vw, ey = EDGE_ZONE * vh;
    let dx = 0, dy = 0;
    if (mouseX < ez)       dx = -((ez - mouseX) / ez) * EDGE_SPEED;
    else if (mouseX > vw - ez) dx = ((mouseX - (vw - ez)) / ez) * EDGE_SPEED;
    if (mouseY < ey)       dy = -((ey - mouseY) / ey) * EDGE_SPEED;
    else if (mouseY > vh - ey) dy = ((mouseY - (vh - ey)) / ey) * EDGE_SPEED;
    const [nx, ny] = clamp(tX + dx, tY + dy);
    tX = nx; tY = ny;
  });

  /* ── Drag pan ── */
  viewport.addEventListener('mousedown', (e) => {
    if (portalOpen) return;
    isDragging = true; dragSX = e.clientX; dragSY = e.clientY; dragCX = camX; dragCY = camY;
    document.body.style.cursor = 'grabbing';
  });
  document.addEventListener('mouseup', () => { isDragging = false; document.body.style.cursor = ''; });
  document.addEventListener('mousemove', (e) => {
    if (!isDragging || portalOpen) return;
    const [nx, ny] = clamp(dragCX - (e.clientX - dragSX), dragCY - (e.clientY - dragSY));
    tX = nx; tY = ny;
  });

  /* Touch */
  let tSX = 0, tSY = 0, tCX = 0, tCY = 0;
  viewport.addEventListener('touchstart', (e) => {
    tSX = e.touches[0].clientX; tSY = e.touches[0].clientY; tCX = camX; tCY = camY;
  }, { passive: true });
  viewport.addEventListener('touchmove', (e) => {
    if (portalOpen) return;
    const [nx, ny] = clamp(tCX - (e.touches[0].clientX - tSX), tCY - (e.touches[0].clientY - tSY));
    tX = nx; tY = ny;
  }, { passive: true });

  /* ── Show decorative message ── */
  function showMsg(text) {
    if (!msg) return;
    msg.textContent = text;
    msg.classList.add('visible');
    clearTimeout(msgTimer);
    msgTimer = setTimeout(() => msg.classList.remove('visible'), 3000);
  }

  /* ── Spawn birds from an element ── */
  function spawnBirds(el) {
    const rect = el.getBoundingClientRect();
    for (let i = 0; i < 4; i++) {
      const b = document.createElement('div');
      const bx = (Math.random() - 0.5) * 140;
      const by = -(45 + Math.random() * 50);
      b.style.cssText = `
        position:fixed;
        left:${rect.left + rect.width/2}px;
        top:${rect.top + 10}px;
        font-size:${9 + Math.random()*5}px;
        pointer-events:none;
        z-index:300;
        --bx:${bx}px;
        --by:${by}px;
        animation:birdFly ${0.7+Math.random()*0.5}s ease-out ${i*0.12}s both;
      `;
      b.textContent = '🐦';
      document.body.appendChild(b);
      setTimeout(() => b.remove(), 1300);
    }
  }

  /* ── CRYSTAL PORTALS ── */
  document.querySelectorAll('.garden-crystal').forEach(c => {
    c.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
    c.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    c.addEventListener('click', () => openPortal(c));
    c.setAttribute('role', 'button'); c.setAttribute('tabindex', '0');
    c.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' ') openPortal(c); });
  });

  function openPortal(c) {
    const virtue = c.dataset.virtue || 'VIRTUE';
    const name   = c.dataset.name   || '— YOUR SITE —';
    const desc   = c.dataset.desc   || '';
    const url    = c.dataset.url    || '#';
    const color  = c.dataset.color  || 'pink';
    const colorMap = { pink:'var(--hv-pink2)', cyan:'var(--hv-cyan2)', purple:'var(--hv-purple2)', gold:'var(--hv-gold2)', mint:'var(--hv-mint2)' };

    document.getElementById('portal-virtue-name').textContent = virtue;
    document.getElementById('portal-virtue-name').style.color = colorMap[color] || 'var(--hv-pink2)';
    document.getElementById('portal-site-name').textContent   = name;
    document.getElementById('portal-description').textContent = desc;
    const btn = document.getElementById('portal-enter-btn');
    btn.href = url;
    btn.style.display = (url === 'YOUR_SITE_URL' || url === '#') ? 'none' : '';
    portal.classList.add('open');
    portal.removeAttribute('aria-hidden');
    portalOpen = true;
  }

  window.closePortal = function () {
    portal.classList.remove('open');
    portal.setAttribute('aria-hidden', 'true');
    portalOpen = false;
  };
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && portalOpen) window.closePortal(); });
  portal && portal.addEventListener('click', e => { if (e.target === portal) window.closePortal(); });

  /* ── DECORATIVE INTERACTIONS ── */

  /* Trees → shake + birds */
  document.querySelectorAll('.garden-tree').forEach(t => {
    t.addEventListener('mouseenter', () => cursor.classList.add('decorating'));
    t.addEventListener('mouseleave', () => cursor.classList.remove('decorating'));
    t.addEventListener('click', () => {
      if (t.classList.contains('shake')) return;
      spawnBirds(t);
      t.classList.add('shake');
      showMsg(t.dataset.msg || 'The forest breathes.');
      setTimeout(() => t.classList.remove('shake'), 750);
    });
  });

  /* Fountain → ripple burst */
  document.querySelectorAll('.garden-fountain').forEach(f => {
    f.addEventListener('mouseenter', () => cursor.classList.add('decorating'));
    f.addEventListener('mouseleave', () => cursor.classList.remove('decorating'));
    f.addEventListener('click', () => {
      f.classList.add('ripple');
      showMsg(f.dataset.msg || 'The water remembers every stone it touched.');
      setTimeout(() => f.classList.remove('ripple'), 1200);
    });
  });

  /* Flowers → bloom each petal */
  document.querySelectorAll('.garden-flower-patch').forEach(p => {
    p.addEventListener('mouseenter', () => cursor.classList.add('decorating'));
    p.addEventListener('mouseleave', () => cursor.classList.remove('decorating'));
    p.addEventListener('click', () => {
      showMsg(p.dataset.msg || 'They bloom for no one, and everyone.');
      p.querySelectorAll('.garden-flower').forEach((f, i) => {
        setTimeout(() => {
          f.classList.add('bloom');
          setTimeout(() => f.classList.remove('bloom'), 600);
        }, i * 80);
      });
    });
  });

  /* Mushrooms → glow pulse */
  document.querySelectorAll('.garden-mushroom-cluster').forEach(m => {
    m.addEventListener('mouseenter', () => cursor.classList.add('decorating'));
    m.addEventListener('mouseleave', () => cursor.classList.remove('decorating'));
    m.addEventListener('click', () => {
      if (m.classList.contains('glow-pulse')) return;
      m.classList.add('glow-pulse');
      showMsg(m.dataset.msg || 'Something grows here, patient and silent.');
      setTimeout(() => m.classList.remove('glow-pulse'), 700);
    });
  });

  /* Lanterns → fast swing */
  document.querySelectorAll('.garden-lantern').forEach(l => {
    l.addEventListener('mouseenter', () => cursor.classList.add('decorating'));
    l.addEventListener('mouseleave', () => cursor.classList.remove('decorating'));
    l.addEventListener('click', () => {
      if (l.classList.contains('swing-fast')) return;
      l.classList.add('swing-fast');
      showMsg(l.dataset.msg || 'Every light was once someone\'s idea.');
      setTimeout(() => l.classList.remove('swing-fast'), 1000);
    });
  });

  /* ── MINIMAP ── */
  const MM_W = 112, MM_H = 80;
  document.querySelectorAll('.garden-crystal').forEach(c => {
    const dot = document.createElement('div');
    dot.className = 'mm-dot';
    const lx = parseFloat(c.style.left) / WORLD_W * MM_W;
    const ly = parseFloat(c.style.top)  / WORLD_H * MM_H;
    const colorMap = { cyan:'#00e5ff', pink:'#ff6eb4', purple:'#b44fff', gold:'#ffe066', mint:'#00ffb3' };
    dot.style.cssText = `left:${lx}px; top:${ly}px; background:${colorMap[c.dataset.color]||'#fff'};`;
    minimap.appendChild(dot);
  });

  function updateMinimap() {
    if (!minimapVP) return;
    minimapVP.style.left   = (camX / WORLD_W * MM_W) + 'px';
    minimapVP.style.top    = (camY / WORLD_H * MM_H) + 'px';
    minimapVP.style.width  = (window.innerWidth  / WORLD_W * MM_W) + 'px';
    minimapVP.style.height = (window.innerHeight / WORLD_H * MM_H) + 'px';
  }

  /* ── SVG CONSTELLATION LINES between adjacent crystals ── */
  const svgNS = 'http://www.w3.org/2000/svg';
  const pathSVG = document.createElementNS(svgNS, 'svg');
  pathSVG.id = 'garden-paths';
  pathSVG.setAttribute('width', WORLD_W);
  pathSVG.setAttribute('height', WORLD_H);
  world.insertBefore(pathSVG, world.firstChild);

  const crystals = Array.from(document.querySelectorAll('.garden-crystal'));
  for (let i = 0; i < crystals.length - 1; i++) {
    const a = crystals[i], b = crystals[i + 1];
    const ax = parseFloat(a.style.left), ay = parseFloat(a.style.top);
    const bx = parseFloat(b.style.left), by = parseFloat(b.style.top);
    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', ax); line.setAttribute('y1', ay);
    line.setAttribute('x2', bx); line.setAttribute('y2', by);
    line.setAttribute('stroke', '#b44fff');
    line.setAttribute('stroke-width', '1');
    line.setAttribute('stroke-opacity', '0.1');
    line.setAttribute('stroke-dasharray', '4 9');
    pathSVG.appendChild(line);
  }

  /* ── CANVAS: sky, mountains, nebulae, stars, sparkles ── */
  const ctx = canvas.getContext('2d');
  let CW, CH;
  function resizeCanvas() { CW = canvas.width = window.innerWidth; CH = canvas.height = window.innerHeight; }
  window.addEventListener('resize', () => { resizeCanvas(); updateMinimap(); });
  resizeCanvas();

  /* Mountain definitions (x as fraction of CW, height in px, width in px) */
  const MOUNTAIN_SETS = [
    /* Back range — deep purple */
    [
      { fx: -0.1, h: 180, w: 440, c: '#16053a' },
      { fx:  0.15, h: 130, w: 340, c: '#16053a' },
      { fx:  0.35, h: 200, w: 520, c: '#16053a' },
      { fx:  0.65, h: 150, w: 380, c: '#16053a' },
      { fx:  0.85, h: 220, w: 480, c: '#16053a' },
      { fx:  1.1,  h: 140, w: 360, c: '#16053a' },
    ],
    /* Mid range — slightly lighter */
    [
      { fx: -0.05, h: 120, w: 380, c: '#1e0850' },
      { fx:  0.22, h: 160, w: 460, c: '#1e0850' },
      { fx:  0.5,  h: 110, w: 300, c: '#1e0850' },
      { fx:  0.72, h: 170, w: 440, c: '#1e0850' },
      { fx:  1.0,  h: 130, w: 360, c: '#1e0850' },
    ],
  ];

  const NEBULAE = [
    { wx: 400,  wy: 400,  r: 340, color: '#b44fff', op: 0.055 },
    { wx: 1350, wy: 650,  r: 410, color: '#00e5ff', op: 0.045 },
    { wx: 2150, wy: 300,  r: 300, color: '#ff6eb4', op: 0.06  },
    { wx: 800,  wy: 1350, r: 370, color: '#ffe066', op: 0.038 },
    { wx: 1900, wy: 1500, r: 330, color: '#b44fff', op: 0.05  },
    { wx: 2500, wy: 950,  r: 310, color: '#00ffb3', op: 0.045 },
  ];

  const STARS = Array.from({ length: 280 }, () => ({
    x: Math.random(), y: Math.random() * 0.72,
    r: Math.random() * 1.7 + 0.3,
    base: Math.random() * 0.5 + 0.12,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.008 + 0.003,
    color: ['#ffffff','#e8b4ff','#80f4ff','#ffe066','#ffb3e0'][Math.floor(Math.random()*5)],
  }));

  class Sparkle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * CW;
      this.y = Math.random() * CH * 0.78;
      this.vy = -(Math.random() * 0.35 + 0.08);
      this.vx = (Math.random() - 0.5) * 0.14;
      this.life = Math.random() * 0.7 + 0.2; this.maxL = this.life;
      this.r = Math.random() * 1.4 + 0.28;
      const cols = ['255,110,180','0,229,255','180,79,255','255,224,102','0,255,179'];
      this.rgb = cols[Math.floor(Math.random()*cols.length)];
    }
    update() {
      this.x += this.vx; this.y += this.vy; this.life -= 0.003;
      if (this.life <= 0 || this.y < -10) this.reset();
    }
    draw() {
      const a = (this.life / this.maxL) * 0.65;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(${this.rgb},${a})`;
      ctx.shadowBlur = 5; ctx.shadowColor = `rgba(${this.rgb},0.5)`;
      ctx.fill(); ctx.shadowBlur = 0;
    }
  }
  const sparkles = Array.from({ length: 60 }, () => new Sparkle());

  let t = 0;

  function drawMountain(x, y, w, h, color) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w * 0.5, y - h);
    ctx.lineTo(x + w, y);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function drawFrame() {
    t += 0.01;
    ctx.clearRect(0, 0, CW, CH);

    /* Sky gradient */
    const sky = ctx.createLinearGradient(0, 0, 0, CH);
    sky.addColorStop(0,   '#080114');
    sky.addColorStop(0.38,'#0f0228');
    sky.addColorStop(0.72,'#1e0550');
    sky.addColorStop(1,   '#2a0a60');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, CW, CH);

    /* Back mountains */
    const baseY = CH * 0.74;
    MOUNTAIN_SETS[0].forEach(m => drawMountain(m.fx * CW - camX * 0.06, baseY, m.w, m.h, m.c));
    MOUNTAIN_SETS[1].forEach(m => drawMountain(m.fx * CW - camX * 0.1, baseY + 30, m.w, m.h, m.c));

    /* Ground mist */
    const mist = ctx.createLinearGradient(0, CH * 0.68, 0, CH);
    mist.addColorStop(0, 'transparent');
    mist.addColorStop(0.5, '#0f022818');
    mist.addColorStop(1, '#0f022840');
    ctx.fillStyle = mist; ctx.fillRect(0, 0, CW, CH);

    /* Nebulae (20% parallax) */
    NEBULAE.forEach(nb => {
      const sx = nb.wx - camX * 0.2 - (WORLD_W - CW) * 0.1;
      const sy = nb.wy - camY * 0.2 - (WORLD_H - CH) * 0.1;
      const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, nb.r);
      const hex = Math.round(nb.op * 255).toString(16).padStart(2,'0');
      g.addColorStop(0, nb.color + hex);
      g.addColorStop(1, nb.color + '00');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(sx, sy, nb.r, 0, Math.PI*2); ctx.fill();
    });

    /* Stars (30% parallax) */
    ctx.save();
    STARS.forEach(s => {
      const a = s.base + Math.sin(s.phase + t * s.speed * 100) * (s.base * 0.6);
      const sx = s.x * WORLD_W - camX * 0.3;
      const sy = s.y * WORLD_H - camY * 0.3;
      if (sx < -4 || sx > CW+4 || sy < -4 || sy > CH+4) return;
      ctx.beginPath(); ctx.arc(sx, sy, s.r, 0, Math.PI*2);
      ctx.fillStyle = s.color; ctx.globalAlpha = a; ctx.fill();
    });
    ctx.globalAlpha = 1; ctx.restore();

    /* Sparkles */
    sparkles.forEach(s => { s.update(); s.draw(); });

    /* Vignette */
    const vig = ctx.createRadialGradient(CW/2, CH/2, CH*0.22, CW/2, CH/2, CW*0.72);
    vig.addColorStop(0, 'transparent');
    vig.addColorStop(1, 'rgba(8,1,20,0.5)');
    ctx.fillStyle = vig; ctx.fillRect(0, 0, CW, CH);

    requestAnimationFrame(drawFrame);
  }
  requestAnimationFrame(drawFrame);

})();
