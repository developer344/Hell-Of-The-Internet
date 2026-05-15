/* judgment.js — Dilemma choice + cinematic transition to Heaven or Hell */
(function () {
  "use strict";

  const overlay = document.getElementById("transition-overlay");

  /**
   * Called by the choice buttons.
   * @param {'heaven'|'hell'} verdict
   */
  window.judgeMe = function (verdict) {
    if (overlay.classList.contains("active")) return; // already transitioning

    overlay.classList.add("active");

    const isHell = verdict === "hell";
    const destination = isHell ? "hell.html" : "heaven.html";

    // ── Phase 1: flash & colour bloom ──────────────────────────────
    // Start transparent, punch to the realm's colour
    overlay.style.transition = "none";
    overlay.style.opacity = "0";
    overlay.style.background = isHell
      ? "radial-gradient(ellipse at 50% 100%, #ff2200 0%, #8b0000 40%, #000000 100%)"
      : "radial-gradient(ellipse at 50% 0%, #ffffff 0%, #c0e8ff 30%, #8b60c8 70%, #1a0533 100%)";

    // Force reflow so the transition registers
    void overlay.offsetWidth;

    overlay.style.transition = "opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
    overlay.style.opacity = "1";

    // ── Phase 2: hold briefly, then navigate ──────────────────────
    setTimeout(() => {
      // Fade out content, keep overlay, then navigate
      window.location.href = destination;
    }, 900);
  };

  // ── Keyboard accessibility: allow Enter/Space on buttons ──────────
  // (already handled natively by <button>)

  // ── Subtle cursor trail on the judgment page ──────────────────────
  const stage = document.querySelector(".stage");
  if (!stage) return;

  let trail = [];
  const MAX_TRAIL = 8;

  document.addEventListener("mousemove", (e) => {
    const dot = document.createElement("div");
    dot.style.cssText = `
      position: fixed;
      left: ${e.clientX}px;
      top: ${e.clientY}px;
      width: 4px; height: 4px;
      border-radius: 50%;
      background: #ffffff18;
      pointer-events: none;
      z-index: 50;
      transform: translate(-50%, -50%);
      transition: opacity 0.6s ease;
    `;
    document.body.appendChild(dot);
    trail.push(dot);

    // Fade & remove old dots
    requestAnimationFrame(() => {
      dot.style.opacity = "0";
    });
    setTimeout(() => {
      dot.remove();
    }, 600);

    if (trail.length > MAX_TRAIL) {
      const old = trail.shift();
      old.remove();
    }
  });
})();
