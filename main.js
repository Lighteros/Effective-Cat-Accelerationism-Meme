(() => {
  const canvas = document.getElementById("sky");
  const ctx = canvas.getContext("2d", { alpha: true });
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const glow = document.getElementById("glow");
  let w = 0;
  let h = 0;
  let stars = [];
  let bolts = [];
  let raf = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeStars() {
    const count = Math.min(220, Math.floor((w * h) / 9000));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      z: Math.random(),
      r: Math.random() * 1.35 + 0.25,
      tw: Math.random() * Math.PI * 2
    }));
  }

  function spawnBolt() {
    let x = Math.random() * w;
    let y = Math.random() * h * 0.45;
    const pts = [[x, y]];
    const segs = 7 + Math.floor(Math.random() * 6);
    for (let i = 0; i < segs; i += 1) {
      x += (Math.random() - 0.5) * 90;
      y += 16 + Math.random() * 34;
      pts.push([x, y]);
    }
    bolts.push({
      pts,
      life: 1,
      violet: Math.random() > 0.72
    });
  }

  function frame(t) {
    ctx.clearRect(0, 0, w, h);
    stars.forEach((star) => {
      const flicker = 0.35 + Math.abs(Math.sin(t * 0.0012 + star.tw)) * 0.65;
      const alpha = (0.22 + star.z * 0.75) * flicker;
      ctx.fillStyle = star.z > 0.86
        ? "rgba(176, 140, 255, " + alpha + ")"
        : "rgba(214, 246, 255, " + alpha + ")";
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r * (0.55 + star.z), 0, Math.PI * 2);
      ctx.fill();
      if (!reduce) {
        star.y += 0.04 + star.z * 0.2;
        if (star.y > h + 4) {
          star.y = -4;
          star.x = Math.random() * w;
        }
      }
    });

    if (!reduce && Math.random() < 0.01) spawnBolt();
    bolts = bolts.filter((bolt) => bolt.life > 0);
    bolts.forEach((bolt) => {
      bolt.life -= 0.028;
      ctx.beginPath();
      bolt.pts.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point[0], point[1]);
        else ctx.lineTo(point[0], point[1]);
      });
      ctx.strokeStyle = bolt.violet
        ? "rgba(160, 120, 255, " + bolt.life + ")"
        : "rgba(120, 245, 255, " + bolt.life + ")";
      ctx.lineWidth = 1.35;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 14;
      ctx.stroke();
      ctx.shadowBlur = 0;
    });
    raf = requestAnimationFrame(frame);
  }

  function boot() {
    resize();
    makeStars();
    bolts = [];
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(frame);
  }

  window.addEventListener("resize", () => {
    resize();
    makeStars();
  });
  boot();

  window.addEventListener("pointermove", (event) => {
    glow.style.transform = "translate(" + (event.clientX - 180) + "px, " + (event.clientY - 180) + "px)";
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("on");
    });
  }, { threshold: 0.18 });
  document.querySelectorAll(".reveal").forEach((node) => observer.observe(node));

  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav-toggle");
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
})();
