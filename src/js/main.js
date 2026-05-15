/* main.js — Landing page fire particle system */
(function () {
  'use strict';

  const canvas = document.getElementById('fire-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  /* ── Ember Particle ── */
  class Ember {
    constructor() { this.reset(true); }

    reset(initial) {
      this.x  = Math.random() * W;
      this.y  = initial ? Math.random() * H : H + 10;
      this.vx = (Math.random() - 0.5) * 0.8;
      this.vy = -(Math.random() * 1.8 + 0.6);
      this.life   = Math.random() * 0.6 + 0.4;   // 0.4–1.0
      this.maxLife = this.life;
      this.size   = Math.random() * 3.5 + 1;
      this.wobble = Math.random() * Math.PI * 2;
      this.wobbleSpeed = (Math.random() - 0.5) * 0.06;
      /* colour gradient: white core → orange → crimson */
      const r = [255, 220, 180][Math.floor(Math.random() * 3)];
      const g = [Math.floor(Math.random() * 80 + 40)];
      this.color = `${r},${g},0`;
    }

    update() {
      this.wobble += this.wobbleSpeed;
      this.x += this.vx + Math.sin(this.wobble) * 0.4;
      this.y += this.vy;
      this.life -= 0.006;
      if (this.life <= 0 || this.y < -10) this.reset(false);
    }

    draw() {
      const alpha = (this.life / this.maxLife) * 0.85;
      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
      gradient.addColorStop(0,   `rgba(255,220,180,${alpha})`);
      gradient.addColorStop(0.4, `rgba(${this.color},${alpha * 0.8})`);
      gradient.addColorStop(1,   `rgba(${this.color},0)`);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  }

  /* ── Smoke wisp ── */
  class Smoke {
    constructor() { this.reset(true); }

    reset(initial) {
      this.x    = Math.random() * W;
      this.y    = initial ? Math.random() * H * 0.5 : H * 0.7 + Math.random() * H * 0.3;
      this.vx   = (Math.random() - 0.5) * 0.3;
      this.vy   = -(Math.random() * 0.5 + 0.2);
      this.life = Math.random() * 0.5 + 0.2;
      this.maxLife = this.life;
      this.size = Math.random() * 20 + 10;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.size += 0.15;
      this.life -= 0.003;
      if (this.life <= 0 || this.y < -60) this.reset(false);
    }

    draw() {
      const alpha = (this.life / this.maxLife) * 0.08;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(80,20,0,${alpha})`;
      ctx.fill();
    }
  }

  /* ── Init particles ── */
  const EMBER_COUNT = 120;
  const SMOKE_COUNT = 25;
  for (let i = 0; i < EMBER_COUNT; i++) particles.push(new Ember());
  for (let i = 0; i < SMOKE_COUNT;  i++) particles.push(new Smoke());

  /* ── Render loop ── */
  function frame() {
    ctx.clearRect(0, 0, W, H);
    // Subtle base glow at bottom
    const grd = ctx.createLinearGradient(0, H, 0, 0);
    grd.addColorStop(0,   'rgba(139,0,0,0.15)');
    grd.addColorStop(0.4, 'rgba(60,0,0,0.05)');
    grd.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    for (const p of particles) {
      p.update();
      p.draw();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ── Hover flare on circle bands ── */
  document.querySelectorAll('.circle-band').forEach(band => {
    band.addEventListener('mouseenter', () => {
      // Burst 8 extra embers from the band's position
      const rect  = band.getBoundingClientRect();
      const baseY = rect.top + rect.height / 2;
      // canvas is positioned at the bottom half, offset accordingly
      const canvasTop = canvas.getBoundingClientRect().top;
      for (let i = 0; i < 8; i++) {
        const e = new Ember();
        e.x = Math.random() * rect.width + rect.left;
        e.y = baseY - canvasTop;
        e.vy = -(Math.random() * 3 + 1.5);
        e.life = Math.random() * 0.5 + 0.4;
        e.maxLife = e.life;
        e.size = Math.random() * 4 + 2;
        particles.push(e);
        // Trim to avoid unbounded growth
        if (particles.length > EMBER_COUNT + SMOKE_COUNT + 40) {
          particles.splice(EMBER_COUNT + SMOKE_COUNT, 1);
        }
      }
    });
  });

})();
