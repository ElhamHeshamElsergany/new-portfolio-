(() => {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------------- Theme ---------------- */
  const root = document.documentElement;
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) root.dataset.theme = savedTheme;
  $("#themeToggle").addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    localStorage.setItem("theme", next);
  });

  $("#year").textContent = new Date().getFullYear();

  /* ---------------- Loader ---------------- */
  document.body.classList.add("loading");
  const loader = $("#loader");
  const loaderFill = $("#loaderFill");
  const loaderCount = $("#loaderCount");
  let progress = 0;

  const loadTick = setInterval(() => {
    progress = Math.min(100, progress + Math.random() * 9 + 3);
    loaderFill.style.width = progress + "%";
    loaderCount.textContent = Math.floor(progress) + "%";
    if (progress >= 100) {
      clearInterval(loadTick);
      setTimeout(finishLoading, 250);
    }
  }, reduceMotion ? 10 : 70);

  function finishLoading() {
    loader.classList.add("done");
    document.body.classList.remove("loading");
    setTimeout(startExperience, 300);
  }

  function startExperience() {
    initReveal();
    animateName();
    typeRoles();
    typeCode();
  }

  /* ---------------- Custom cursor ---------------- */
  if (finePointer && !reduceMotion) {
    document.body.classList.add("has-cursor");
    const dot = $(".cursor-dot");
    const ring = $(".cursor-ring");
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;

    addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    });

    (function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    })();

    document.addEventListener("mouseover", (e) => {
      if (e.target.closest("a, button, [data-hover]")) ring.classList.add("hover");
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest("a, button, [data-hover]")) ring.classList.remove("hover");
    });
    addEventListener("mousedown", () => ring.classList.add("click"));
    addEventListener("mouseup", () => ring.classList.remove("click"));
    document.addEventListener("mouseleave", () => { dot.style.opacity = ring.style.opacity = 0; });
    document.addEventListener("mouseenter", () => { dot.style.opacity = ring.style.opacity = 1; });
  }

  /* ---------------- Hero name split ---------------- */
  const splitEl = $(".split-text");
  const nameText = splitEl.textContent;
  splitEl.setAttribute("aria-label", nameText);
  splitEl.innerHTML = [...nameText]
    .map((ch, i) => `<span class="char" aria-hidden="true" style="transition-delay:${i * 55}ms">${ch === " " ? "&nbsp;" : ch}</span>`)
    .join("");

  function animateName() {
    splitEl.classList.add("in");
  }

  /* ---------------- Typing roles ---------------- */
  const roles = [
    "Italian government platforms.",
    "scalable Angular apps.",
    "delightful React UIs.",
    "accessible interfaces.",
    "multilingual platforms.",
    "clean, tested code.",
    "healthcare booking flows.",
  ];

  function typeRoles() {
    const el = $("#typed");
    let r = 0, c = 0, deleting = false;

    (function tick() {
      const word = roles[r];
      el.textContent = word.slice(0, c);
      let delay = deleting ? 35 : 75;

      if (!deleting && c === word.length) { delay = 1800; deleting = true; }
      else if (deleting && c === 0) { deleting = false; r = (r + 1) % roles.length; delay = 350; }
      c += deleting ? -1 : 1;
      setTimeout(tick, delay);
    })();
  }

  /* ---------------- Code window typing ---------------- */
  const codeSegments = [
    ["c", "// Hello, recruiter 👋\n"],
    ["k", "const "], ["b", "developer"], ["", " = {\n"],
    ["p", "  name"], ["", ": "], ["s", '"Elham Hesham"'], ["", ",\n"],
    ["p", "  role"], ["", ": "], ["s", '"Senior Front-End Developer"'], ["", ",\n"],
    ["p", "  experience"], ["", ": "], ["n", "6"], ["", " + "], ["s", '" years"'], ["", ",\n"],
    ["p", "  company"], ["", ": "], ["s", '"AlmavivA S.p.A. (Italy)"'], ["", ",\n"],
    ["p", "  building"], ["", ": "], ["s", '"Italian gov platforms"'], ["", ",\n"],
    ["p", "  stack"], ["", ": ["], ["s", '"Angular"'], ["", ", "], ["s", '"React"'], ["", ", "], ["s", '"TypeScript"'], ["", "],\n"],
    ["p", "  loves"], ["", ": ["], ["s", '"a11y"'], ["", ", "], ["s", '"i18n"'], ["", ", "], ["s", '"clean code"'], ["", "],\n"],
    ["p", "  openToWork"], ["", ": "], ["k", "true"], ["", ",\n"],
    ["", "};\n\n"],
    ["b", "developer"], ["", "."], ["p", "build"], ["", "("], ["s", '"something amazing ✨"'], ["", ");"],
  ];

  function typeCode() {
    const target = $("#codeTyped");
    if (reduceMotion) {
      target.innerHTML = codeSegments.map(([cls, txt]) => `<span class="${cls ? "tok-" + cls : ""}">${escapeHtml(txt)}</span>`).join("");
      return;
    }
    let seg = 0, ch = 0, span = null;

    (function tick() {
      if (seg >= codeSegments.length) return;
      const [cls, txt] = codeSegments[seg];
      if (ch === 0) {
        span = document.createElement("span");
        if (cls) span.className = "tok-" + cls;
        target.appendChild(span);
      }
      const chars = [...txt];
      span.textContent += chars[ch];
      ch++;
      if (ch >= chars.length) { seg++; ch = 0; }
      const last = chars[ch - 1] || "";
      setTimeout(tick, last === "\n" ? 140 : 22 + Math.random() * 30);
    })();
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
  }

  /* ---------------- Reveal on scroll ---------------- */
  function initReveal() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = +el.dataset.delay || 0;
        setTimeout(() => {
          el.classList.add("in");
          const scrambler = el.querySelector(".scramble");
          if (scrambler) scramble(scrambler);
          const fill = el.querySelector(".bar__fill");
          if (fill) fill.style.width = fill.dataset.width + "%";
          $$(".counter", el).forEach(animateCounter);
        }, delay);
        io.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });

    $$(".reveal").forEach((el) => io.observe(el));
  }

  /* ---------------- Counters ---------------- */
  function animateCounter(el) {
    const target = +el.dataset.target;
    const duration = 1800;
    const start = performance.now();
    (function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      el.textContent = Math.round(target * eased);
      if (t < 1) requestAnimationFrame(step);
    })(start);
  }

  /* ---------------- Text scramble ---------------- */
  const glyphs = "!<>-_\\/[]{}—=+*^?#ABCDEFabcdef0123456789";

  function scramble(el) {
    if (reduceMotion || el.dataset.busy) return;
    el.dataset.busy = "1";
    const final = el.dataset.text;
    let frame = 0;
    const total = final.length * 3;

    (function step() {
      el.textContent = [...final]
        .map((ch, i) => {
          if (ch === " ") return " ";
          if (frame / 3 > i) return ch;
          return glyphs[Math.floor(Math.random() * glyphs.length)];
        })
        .join("");
      frame++;
      if (frame <= total) requestAnimationFrame(step);
      else { el.textContent = final; delete el.dataset.busy; }
    })();
  }

  $$(".scramble").forEach((el) => el.addEventListener("mouseenter", () => scramble(el)));

  /* ---------------- 3D tilt ---------------- */
  if (finePointer && !reduceMotion) {
    $$(".tilt").forEach((card) => {
      const max = +card.dataset.tiltMax || 10;
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        card.style.transition = "transform 0.1s ease-out";
        card.style.transform = `perspective(1000px) rotateX(${(0.5 - y) * max}deg) rotateY(${(x - 0.5) * max}deg) scale(1.02)`;
        card.style.setProperty("--mx", x * 100 + "%");
        card.style.setProperty("--my", y * 100 + "%");
      });
      card.addEventListener("mouseleave", () => {
        card.style.transition = "transform 0.6s cubic-bezier(.2,.8,.2,1)";
        card.style.transform = "";
      });
    });
  }

  /* ---------------- Magnetic buttons ---------------- */
  if (finePointer && !reduceMotion) {
    $$(".magnetic").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------------- Skills tabs ---------------- */
  const tabs = $$(".skills__tab");
  const indicator = $(".skills__indicator");

  function moveIndicator(tab) {
    indicator.style.left = tab.offsetLeft + "px";
    indicator.style.top = tab.offsetTop + "px";
    indicator.style.width = tab.offsetWidth + "px";
    indicator.style.height = tab.offsetHeight + "px";
  }

  function staggerChips(panel) {
    $$(".skill-chip", panel).forEach((chip, i) => {
      chip.style.animation = "none";
      void chip.offsetWidth;
      chip.style.animation = "";
      chip.style.animationDelay = i * 45 + "ms";
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.toggle("active", t === tab));
      $$(".skills__panel").forEach((p) => p.classList.toggle("active", p.dataset.panel === tab.dataset.tab));
      moveIndicator(tab);
      staggerChips($(`.skills__panel[data-panel="${tab.dataset.tab}"]`));
    });
  });

  const syncIndicator = () => moveIndicator($(".skills__tab.active"));
  addEventListener("load", syncIndicator);
  addEventListener("resize", syncIndicator);
  syncIndicator();
  staggerChips($(".skills__panel.active"));

  /* ---------------- Project filters ---------------- */
  const filterBtns = $$(".filter-btn");
  const cards = $$(".project-card");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.toggle("active", b === btn));
      const f = btn.dataset.filter;
      cards.forEach((card) => {
        const match = f === "all" || card.dataset.category === f;
        if (match) {
          card.classList.remove("gone");
          requestAnimationFrame(() => requestAnimationFrame(() => card.classList.remove("hide")));
        } else {
          card.classList.add("hide");
          setTimeout(() => { if (card.classList.contains("hide")) card.classList.add("gone"); }, 400);
        }
      });
    });
  });

  /* ---------------- Nav, progress, timeline ---------------- */
  const nav = $("#nav");
  const progressBar = $("#scrollProgress");
  const backToTop = $("#backToTop");
  const timeline = $("#timeline");
  const timelineProgress = $("#timelineProgress");
  let lastY = scrollY;
  let ticking = false;

  function onScroll() {
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    progressBar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

    nav.classList.toggle("scrolled", y > 40);
    const menuOpen = $("#navLinks").classList.contains("open");
    nav.classList.toggle("hidden", !menuOpen && y > lastY && y > 400);
    backToTop.classList.toggle("show", y > 700);

    const r = timeline.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.65 - r.top) / r.height));
    timelineProgress.style.height = p * 100 + "%";

    lastY = y;
    ticking = false;
  }

  addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  backToTop.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));

  const navLinks = $$(".nav__link");
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + entry.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$("main section[id]").forEach((s) => sectionObserver.observe(s));

  /* ---------------- Mobile menu ---------------- */
  const burger = $("#burger");
  const linksWrap = $("#navLinks");
  burger.addEventListener("click", () => {
    const open = linksWrap.classList.toggle("open");
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  });
  navLinks.forEach((l) => l.addEventListener("click", () => {
    linksWrap.classList.remove("open");
    burger.classList.remove("open");
    document.body.style.overflow = "";
  }));

  /* ---------------- Copy email ---------------- */
  const toast = $("#toast");
  $("#copyEmail").addEventListener("click", async () => {
    const email = "elhamhesham18@gmail.com";
    try {
      await navigator.clipboard.writeText(email);
      toast.textContent = "Email copied to clipboard ✨";
    } catch {
      location.href = "mailto:" + email;
      return;
    }
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2200);
  });

  /* ---------------- Particle network ---------------- */
  const canvas = $("#particles");
  const ctx = canvas.getContext("2d");
  const hero = $(".hero");
  const mouse = { x: -9999, y: -9999 };
  let particles = [];
  let heroVisible = true;
  let dpr = 1;

  function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = hero.offsetWidth * dpr;
    canvas.height = hero.offsetHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(110, Math.floor((hero.offsetWidth * hero.offsetHeight) / 14000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * hero.offsetWidth,
      y: Math.random() * hero.offsetHeight,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 1.8 + 0.6,
    }));
  }

  let dotColor = "#8b5cf6";
  let linkColor = "#22d3ee";
  function readParticleColors() {
    const cs = getComputedStyle(root);
    dotColor = cs.getPropertyValue("--a1").trim() || dotColor;
    linkColor = cs.getPropertyValue("--a2").trim() || linkColor;
  }
  readParticleColors();
  new MutationObserver(readParticleColors).observe(root, { attributes: true, attributeFilter: ["data-palette", "data-theme", "style"] });

  function drawParticles() {
    const w = hero.offsetWidth, h = hero.offsetHeight;
    ctx.clearRect(0, 0, w, h);
    const linkDist = 130;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (!reduceMotion) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const d = Math.hypot(dx, dy);
        if (d < 120 && d > 0) {
          p.x += (dx / d) * 1.4;
          p.y += (dy / d) * 1.4;
        }
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = dotColor;
      ctx.fill();

      ctx.strokeStyle = dotColor;
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dist = Math.hypot(p.x - q.x, p.y - q.y);
        if (dist < linkDist) {
          ctx.globalAlpha = 0.25 * (1 - dist / linkDist);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }

      const md = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      if (md < 200) {
        ctx.strokeStyle = linkColor;
        ctx.globalAlpha = 0.4 * (1 - md / 200);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  function particleLoop() {
    if (heroVisible) drawParticles();
    if (!reduceMotion) requestAnimationFrame(particleLoop);
  }

  hero.addEventListener("mousemove", (e) => {
    const r = hero.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  hero.addEventListener("mouseleave", () => { mouse.x = mouse.y = -9999; });

  new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; }).observe(hero);

  let resizeTimer;
  addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeCanvas, 150);
  });

  resizeCanvas();
  particleLoop();
})();
