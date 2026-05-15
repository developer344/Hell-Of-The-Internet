/* circle.js — Circle page dramatic reveal + fire */
(function () {
  "use strict";

  /* ── Trigger CSS reveal ── */
  window.addEventListener("DOMContentLoaded", () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.classList.add("loaded");
      });
    });
  });

  /* ── Fire particle system (same as main.js, lighter) ── */
  const canvas = document.getElementById("circle-fire");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let W,
    H,
    particles = [];

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  class Ember {
    constructor() {
      this.reset(true);
    }

    reset(initial) {
      this.x = Math.random() * W;
      this.y = initial ? Math.random() * H : H + 10;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = -(Math.random() * 2 + 0.7);
      this.life = Math.random() * 0.7 + 0.3;
      this.maxLife = this.life;
      this.size = Math.random() * 3 + 0.8;
      this.wobble = Math.random() * Math.PI * 2;
      this.wobbleSpeed = (Math.random() - 0.5) * 0.07;
      const r = [255, 255, 220][Math.floor(Math.random() * 3)];
      const g = Math.floor(Math.random() * 80 + 20);
      this.color = `${r},${g},0`;
    }

    update() {
      this.wobble += this.wobbleSpeed;
      this.x += this.vx + Math.sin(this.wobble) * 0.35;
      this.y += this.vy;
      this.life -= 0.005;
      if (this.life <= 0 || this.y < -10) this.reset(false);
    }

    draw() {
      const a = (this.life / this.maxLife) * 0.9;
      const g = ctx.createRadialGradient(
        this.x,
        this.y,
        0,
        this.x,
        this.y,
        this.size,
      );
      g.addColorStop(0, `rgba(255,220,150,${a})`);
      g.addColorStop(0.5, `rgba(${this.color},${a * 0.7})`);
      g.addColorStop(1, `rgba(${this.color},0)`);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    }
  }

  for (let i = 0; i < 80; i++) particles.push(new Ember());

  (function frame() {
    ctx.clearRect(0, 0, W, H);
    const grd = ctx.createLinearGradient(0, H, 0, 0);
    grd.addColorStop(0, "rgba(139,0,0,0.18)");
    grd.addColorStop(0.5, "rgba(60,0,0,0.06)");
    grd.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    for (const p of particles) {
      p.update();
      p.draw();
    }
    requestAnimationFrame(frame);
  })();

  /* ── Enter button shimmer on hover ── */
  const btn = document.querySelector(".enter-btn");
  if (btn) {
    btn.addEventListener("mouseenter", () => {
      // Extra burst from button position
      const rect = btn.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      for (let i = 0; i < 12; i++) {
        const e = new Ember();
        e.x = Math.random() * rect.width + (rect.left - canvasRect.left);
        e.y = H - (canvasRect.bottom - rect.bottom) + rect.height / 2;
        e.vy = -(Math.random() * 3 + 2);
        e.size = Math.random() * 4 + 2;
        e.life = Math.random() * 0.5 + 0.3;
        e.maxLife = e.life;
        particles.push(e);
        if (particles.length > 120) particles.splice(80, 1);
      }
    });
  }
})();
