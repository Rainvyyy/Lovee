(function () {
  const canvas = document.getElementById("particle-canvas");
  const ctx = canvas.getContext("2d");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let width, height, particles;
  const COLORS = ["rgba(185,214,255,", "rgba(232,242,255,", "rgba(248,243,234,"];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function createParticles() {
    const count = Math.min(70, Math.floor((width * height) / 22000));
    particles = Array.from({ length: count }, () => spawn());
  }

  function spawn() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2 + 0.5,
      speedY: Math.random() * 0.35 + 0.08,
      driftX: Math.random() * 0.3 - 0.15,
      alpha: Math.random() * 0.5 + 0.15,
      flicker: Math.random() * 0.02 + 0.005,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      phase: Math.random() * Math.PI * 2,
    };
  }

  function tick() {
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      p.phase += p.flicker;
      const glow = 0.5 + Math.sin(p.phase) * 0.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + (p.alpha * glow).toFixed(3) + ")";
      ctx.fill();

      p.y -= p.speedY;
      p.x += p.driftX;

      if (p.y < -10) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
    }
    requestAnimationFrame(tick);
  }

  function init() {
    resize();
    createParticles();
    if (!prefersReducedMotion) {
      requestAnimationFrame(tick);
    } else {
      tick();
    }
  }

  window.addEventListener("resize", () => {
    resize();
    createParticles();
  });

  init();
})();