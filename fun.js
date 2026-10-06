(() => {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rand = (min, max) => Math.random() * (max - min) + min;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  /* =========================================================
     FX: confetti, sparkles & emoji bursts
     ========================================================= */
  const fx = document.createElement("canvas");
  fx.className = "fx-canvas";
  document.body.appendChild(fx);
  const ctx = fx.getContext("2d");
  const root = document.documentElement;
  function paletteColors() {
    const cs = getComputedStyle(root);
    return ["--a1", "--a2", "--a3"].map((v) => cs.getPropertyValue(v).trim()).concat("#facc15", "#ffffff");
  }
  let pieces = [];
  let fxRunning = false;

  function resizeFx() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    fx.width = innerWidth * dpr;
    fx.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resizeFx();
  addEventListener("resize", resizeFx);

  function burst(x, y, opts = {}) {
    if (reduceMotion) return;
    const {
      count = 40, speed = 9, spread = Math.PI * 2, angle = -Math.PI / 2,
      gravity = 0.25, size = 8, life = 90, shapes = ["rect", "circle", "star"], emojis = null,
    } = opts;
    const COLORS = paletteColors();
    for (let i = 0; i < count; i++) {
      const a = angle + (Math.random() - 0.5) * spread;
      const v = speed * rand(0.35, 1.1);
      pieces.push({
        x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: gravity,
        rot: rand(0, Math.PI * 2), vr: rand(-0.25, 0.25),
        size: size * rand(0.6, 1.3), color: pick(COLORS), shape: pick(shapes),
        emoji: emojis ? pick(emojis) : null, life, max: life,
      });
    }
    if (!fxRunning) requestAnimationFrame(fxLoop);
  }

  function rain({ count = 160, emojis = null, size = 9 } = {}) {
    if (reduceMotion) return;
    const COLORS = paletteColors();
    for (let i = 0; i < count; i++) {
      pieces.push({
        x: rand(0, innerWidth), y: rand(-innerHeight * 0.6, -20), vx: rand(-1, 1), vy: rand(2, 5), g: 0.05,
        rot: rand(0, Math.PI * 2), vr: rand(-0.15, 0.15), size: size * rand(0.7, 1.3),
        color: pick(COLORS), shape: pick(["rect", "circle", "star"]), emoji: emojis ? pick(emojis) : null,
        life: 400, max: 400,
      });
    }
    if (!fxRunning) requestAnimationFrame(fxLoop);
  }

  function drawStar(r) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const rad = i % 2 ? r * 0.45 : r;
      const a = (i * Math.PI) / 5;
      ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
    }
    ctx.closePath();
    ctx.fill();
  }

  function fxLoop() {
    fxRunning = true;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    pieces = pieces.filter((p) => --p.life > 0 && p.y < innerHeight + 60);

    for (const p of pieces) {
      p.vx *= 0.985;
      p.vy += p.g;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.min(1, p.life / (p.max * 0.3));
      ctx.fillStyle = p.color;
      if (p.emoji) {
        ctx.font = `${p.size * 3}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.emoji, 0, 0);
      } else if (p.shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === "star") {
        drawStar(p.size * 0.7);
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }
      ctx.restore();
    }

    if (pieces.length) requestAnimationFrame(fxLoop);
    else { fxRunning = false; ctx.clearRect(0, 0, innerWidth, innerHeight); }
  }

  document.addEventListener("click", (e) => {
    if (e.target.closest("#gameArena, .terminal")) return;
    burst(e.clientX, e.clientY, { count: 14, speed: 4.5, size: 6, gravity: 0.12, life: 45, shapes: ["star", "circle"] });
  });

  /* =========================================================
     ACHIEVEMENTS
     ========================================================= */
  const ACHIEVEMENTS = {
    explorer: { icon: "🧭", title: "Explorer", desc: "Scrolled all the way to the end" },
    theme: { icon: "🌗", title: "Light & Shadow", desc: "Switched the theme" },
    hacker: { icon: "💻", title: "Hacker", desc: "Opened the secret terminal" },
    hunter: { icon: "🐛", title: "Bug Hunter", desc: "Scored 15+ in Bug Smasher" },
    party: { icon: "🎉", title: "Party Animal", desc: "Unlocked party mode" },
    curious: { icon: "🔍", title: "Curious Cat", desc: "Clicked the logo 5 times" },
    contact: { icon: "✉️", title: "Let's Talk", desc: "Copied the email address" },
    hire: { icon: "🤝", title: "Great Decision", desc: "Ran sudo hire-elham" },
    painter: { icon: "🎨", title: "Painter", desc: "Changed the color palette" },
  };
  const TOTAL = Object.keys(ACHIEVEMENTS).length;
  const unlocked = new Set(JSON.parse(localStorage.getItem("achievements") || "[]"));
  const achStack = $("#achStack");
  const achCount = $("#achCount");

  const updateAchCount = () => { achCount.textContent = `${unlocked.size}/${TOTAL}`; };
  updateAchCount();

  function unlock(id) {
    if (unlocked.has(id) || !ACHIEVEMENTS[id]) return;
    unlocked.add(id);
    localStorage.setItem("achievements", JSON.stringify([...unlocked]));
    updateAchCount();

    const a = ACHIEVEMENTS[id];
    const toast = document.createElement("div");
    toast.className = "ach-toast";
    toast.innerHTML = `
      <div class="ach-toast__icon">${a.icon}</div>
      <div>
        <div class="ach-toast__label">Achievement unlocked · ${unlocked.size}/${TOTAL}</div>
        <div class="ach-toast__title">${a.title}</div>
        <div class="ach-toast__desc">${a.desc}</div>
      </div>`;
    achStack.appendChild(toast);
    const r = achCount.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top, { count: 30, speed: 8, size: 7 });
    setTimeout(() => toast.classList.add("out"), 3600);
    setTimeout(() => toast.remove(), 4000);

    if (unlocked.size === TOTAL) {
      setTimeout(() => {
        rain({ count: 220 });
        rain({ count: 40, emojis: ["🏆", "👑", "💜"] });
      }, 800);
    }
  }

  $("#themeToggle").addEventListener("click", () => unlock("theme"));
  $("#copyEmail").addEventListener("click", () => unlock("contact"));

  addEventListener("scroll", () => {
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 60) unlock("explorer");
  }, { passive: true });

  /* =========================================================
     COLOR PALETTES
     ========================================================= */
  const PALETTES = {
    violet: "Violet Dream",
    sunset: "Sunset",
    ocean: "Ocean",
    candy: "Candy",
    matrix: "Matrix",
    lava: "Lava",
    random: "Surprise!",
  };
  const paletteEl = $("#palette");
  const paletteToggle = $("#paletteToggle");
  const paletteName = $("#paletteName");
  const swatches = $$(".swatch");

  function randomPalette() {
    const h = Math.floor(rand(0, 360));
    const shift = pick([120, 150, 60]);
    return {
      "--a1": `hsl(${h} 85% 62%)`,
      "--a2": `hsl(${(h + shift) % 360} 85% 60%)`,
      "--a3": `hsl(${(h + shift * 2) % 360} 85% 65%)`,
    };
  }

  function applyPalette(name, vars) {
    ["--a1", "--a2", "--a3"].forEach((v) => root.style.removeProperty(v));
    if (name === "random") {
      vars = vars || randomPalette();
      Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
      localStorage.setItem("paletteVars", JSON.stringify(vars));
    }
    root.dataset.palette = name;
    localStorage.setItem("palette", name);
    swatches.forEach((s) => s.classList.toggle("active", s.dataset.palette === name));
    paletteName.textContent = PALETTES[name];
  }

  function splash(x, y) {
    if (reduceMotion) return;
    const s = document.createElement("div");
    s.className = "paint-splash";
    s.style.left = x + "px";
    s.style.top = y + "px";
    s.style.background = `radial-gradient(circle, var(--a1), var(--a2) 60%, var(--a3))`;
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 950);
  }

  function setPalette(name, x = innerWidth / 2, y = 60) {
    if (!PALETTES[name]) return false;
    applyPalette(name);
    splash(x, y);
    burst(x, y, { count: 40, speed: 9, angle: Math.PI / 2, spread: Math.PI * 1.6 });
    unlock("painter");
    return true;
  }

  const savedPalette = localStorage.getItem("palette");
  if (savedPalette && PALETTES[savedPalette]) {
    applyPalette(savedPalette, savedPalette === "random" ? JSON.parse(localStorage.getItem("paletteVars") || "null") : undefined);
  } else {
    applyPalette("violet");
  }

  paletteToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = paletteEl.classList.toggle("open");
    paletteToggle.setAttribute("aria-expanded", open);
  });
  swatches.forEach((s) => {
    s.addEventListener("click", (e) => {
      e.stopPropagation();
      setPalette(s.dataset.palette, e.clientX, e.clientY);
    });
    s.addEventListener("mouseenter", () => { paletteName.textContent = PALETTES[s.dataset.palette]; });
    s.addEventListener("mouseleave", () => { paletteName.textContent = PALETTES[root.dataset.palette]; });
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#palette")) {
      paletteEl.classList.remove("open");
      paletteToggle.setAttribute("aria-expanded", "false");
    }
  });

  /* =========================================================
     LOGO EASTER EGG
     ========================================================= */
  const logo = $(".nav__logo");
  let logoClicks = 0;
  let logoTimer;
  logo.addEventListener("click", () => {
    logoClicks++;
    clearTimeout(logoTimer);
    logoTimer = setTimeout(() => { logoClicks = 0; }, 1500);
    if (logoClicks >= 5) {
      logoClicks = 0;
      logo.classList.remove("spin");
      void logo.offsetWidth;
      logo.classList.add("spin");
      const r = logo.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, { count: 60, speed: 10, angle: Math.PI / 2, spread: Math.PI * 1.4 });
      unlock("curious");
    }
  });

  /* =========================================================
     PARTY MODE (Konami code)
     ========================================================= */
  let partyTimer;
  function party(on = !document.body.classList.contains("party")) {
    document.body.classList.toggle("party", on);
    clearTimeout(partyTimer);
    if (on) {
      rain({ count: 200 });
      rain({ count: 30, emojis: ["🎉", "🥳", "💃", "✨", "🎊"] });
      unlock("party");
      partyTimer = setTimeout(() => party(false), 12000);
    }
    return on;
  }

  const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
  let konamiPos = 0;

  /* =========================================================
     SAY HELLO & DRAGGABLE BADGES
     ========================================================= */
  $("#sayHello").addEventListener("click", () => {
    rain({ count: 50, emojis: ["👋", "💜", "✨", "🚀", "😊"], size: 10 });
  });

  $$(".floating-badge").forEach((badge) => {
    let startX = 0, startY = 0, baseX = 0, baseY = 0, dragging = false;
    badge.title = "Drag me!";
    badge.addEventListener("pointerdown", (e) => {
      dragging = true;
      badge.setPointerCapture(e.pointerId);
      badge.classList.add("dragging");
      startX = e.clientX;
      startY = e.clientY;
    });
    badge.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      badge.style.translate = `${baseX + e.clientX - startX}px ${baseY + e.clientY - startY}px`;
    });
    const end = (e) => {
      if (!dragging) return;
      dragging = false;
      baseX += e.clientX - startX;
      baseY += e.clientY - startY;
      badge.classList.remove("dragging");
      burst(e.clientX, e.clientY, { count: 12, speed: 4, size: 5, gravity: 0.1, life: 40 });
    };
    badge.addEventListener("pointerup", end);
    badge.addEventListener("pointercancel", end);
  });

  /* =========================================================
     TAB TITLE & CONSOLE EASTER EGGS
     ========================================================= */
  const originalTitle = document.title;
  document.addEventListener("visibilitychange", () => {
    document.title = document.hidden ? "👋 Come back, I miss you!" : originalTitle;
  });

  console.log(
    "%c👋 Hey there, fellow developer!",
    "font-size:20px;font-weight:bold;background:linear-gradient(90deg,#8b5cf6,#22d3ee);color:#fff;padding:8px 14px;border-radius:8px;"
  );
  console.log("%cPress ` to open the terminal, or try the Konami code ↑↑↓↓←→←→BA 🎮", "font-size:13px;color:#22d3ee;");

  /* =========================================================
     TERMINAL
     ========================================================= */
  const terminal = $("#terminal");
  const termWindow = $(".terminal__window");
  const termBody = $("#terminalBody");
  const termForm = $("#terminalForm");
  const termInput = $("#terminalInput");
  const history = [];
  let historyPos = 0;
  let greeted = false;

  function print(html, cls = "") {
    const line = document.createElement("div");
    line.className = "t-line " + cls;
    line.innerHTML = html;
    termBody.appendChild(line);
    termBody.scrollTop = termBody.scrollHeight;
  }

  function openTerminal() {
    terminal.classList.add("open");
    unlock("hacker");
    if (!greeted) {
      greeted = true;
      print(`<span class="t-accent">
  ███████╗██╗  ██╗
  ██╔════╝██║  ██║
  █████╗  ███████║
  ██╔══╝  ██╔══██║
  ███████╗██║  ██║
  ╚══════╝╚═╝  ╚═╝</span>`);
      print("Welcome to Elham's portfolio terminal v1.0 ✨");
      print(`Type <span class="t-ok">help</span> to see what you can do.`, "t-muted");
    }
    setTimeout(() => termInput.focus(), 50);
  }

  function closeTerminal() {
    terminal.classList.remove("open");
    termInput.blur();
  }

  function goTo(id) {
    closeTerminal();
    setTimeout(() => $(id)?.scrollIntoView({ behavior: "smooth" }), 250);
  }

  const JOKES = [
    "Why do programmers prefer dark mode? Because light attracts bugs. 🐛",
    "A SQL query walks into a bar, walks up to two tables and asks: “Can I join you?”",
    "There are 10 types of people: those who understand binary and those who don't.",
    "Why did the developer go broke? Because she used up all her cache. 💸",
    "!false — it's funny because it's true.",
    "How many front-end developers does it take to change a light bulb? None, that's a back-end problem. 💡",
    "I'd tell you a UDP joke, but you might not get it.",
    "Why was the Angular component so calm? It had good change detection. 🧘‍♀️",
    "CSS is easy. It's like riding a bike… that's on fire… and the ground is on fire… and everything is on fire. 🔥",
  ];

  const FILES = {
    "about.md": "about",
    "skills.json": "skills",
    "experience.log": "experience",
    "projects": "projects",
    "contact.vcf": "contact",
    "secret.txt": null,
  };

  const COMMANDS = {
    help: () => {
      print(`Available commands:
  <span class="t-ok">whoami</span>         who is Elham?
  <span class="t-ok">about</span>          short bio
  <span class="t-ok">skills</span>         tech stack
  <span class="t-ok">experience</span>     work history
  <span class="t-ok">projects</span>       featured projects
  <span class="t-ok">contact</span>        how to reach me
  <span class="t-ok">goto</span> &lt;section&gt;  jump to a section (about, skills, play…)
  <span class="t-ok">play</span>           start Bug Smasher 🐛
  <span class="t-ok">joke</span>           random dev joke
  <span class="t-ok">party</span>          🎉
  <span class="t-ok">theme</span>          toggle dark / light
  <span class="t-ok">color</span> &lt;name&gt;   violet, sunset, ocean, candy, matrix, lava, random 🎨
  <span class="t-ok">achievements</span>   your progress 🏆
  <span class="t-ok">ls</span>, <span class="t-ok">cat</span> &lt;file&gt;, <span class="t-ok">echo</span>, <span class="t-ok">date</span>, <span class="t-ok">clear</span>, <span class="t-ok">exit</span>
  <span class="t-muted">…and a few hidden ones 👀</span>`);
    },
    whoami: () => print("Elham Hesham Mohamed 👩‍💻 Senior Front-End Developer · Angular · React · TypeScript"),
    about: () => print(`5+ years building scalable, accessible and multilingual web apps.
Currently at <span class="t-accent">AlmavivA S.p.A.</span> building Italian government platforms:
public health (FSE 2.0), fishing, maps and notifications.`),
    skills: () => print(`<span class="t-accent">frontend</span>  Angular, React, Next.js, TypeScript, JavaScript, SCSS, Bootstrap, MUI
<span class="t-accent">angular</span>   Signals, Reactive Forms, DI, Routing & Guards, Transloco
<span class="t-accent">backend</span>   Node.js, Express, REST APIs, MongoDB, Django
<span class="t-accent">quality</span>   Jasmine, Karma, SonarQube, Code Reviews, a11y
<span class="t-accent">devops</span>    Git, GitLab, CI/CD, Docker, Jenkins, Kubernetes, AWS`),
    experience: () => print(`<span class="t-ok">2025 → now</span>   Senior Front-End Developer @ AlmavivA S.p.A. (Italy)
<span class="t-ok">2022 → 2024</span>  Front-End Developer @ EYouth
<span class="t-ok">2021 → 2022</span>  Full Stack Software Engineer @ Insight Global (US teams)`),
    projects: () => print(`🏥 FSE 2.0 — Public Health Platform (Italy)
🎣 Fishing Platform · 🗺️ Maps Platforms · 🔔 Notifications Platform
🎓 Taibah University LMS · DEPI · Nextera Education · EYouth Learning
🌍 AYCCC · 💡 AYTF · 💼 EYouth Business`),
    contact: () => print(`✉️  <a href="mailto:elhamhesham18@gmail.com">elhamhesham18@gmail.com</a>
📱 <a href="tel:+201000600258">+20 100 060 0258</a>
💼 <a href="https://linkedin.com/in/webdeveloberelhamelsergany" target="_blank" rel="noopener">linkedin.com/in/webdeveloberelhamelsergany</a>
🐙 <a href="https://github.com/ElhamHeshamElsergany" target="_blank" rel="noopener">github.com/ElhamHeshamElsergany</a>`),
    goto: (args) => {
      const id = (args[0] || "").replace("#", "");
      if ($(`#${id}`)) { print(`Navigating to ${id}…`, "t-ok"); goTo(`#${id}`); }
      else print(`goto: unknown section "${id}". Try: about, skills, experience, projects, education, play, contact`, "t-err");
    },
    cd: (args) => COMMANDS.goto(args),
    play: () => { print("Loading Bug Smasher… 🐛", "t-ok"); goTo("#play"); setTimeout(startGame, 900); },
    game: () => COMMANDS.play(),
    joke: () => print(pick(JOKES)),
    party: () => print(party() ? "🎉 Party mode ON! (12 seconds of pure joy)" : "Party mode OFF. Back to work 💼", "t-ok"),
    theme: () => { $("#themeToggle").click(); print(`Theme switched to ${document.documentElement.dataset.theme} mode.`, "t-ok"); },
    color: (args) => {
      const name = (args[0] || "").toLowerCase();
      if (!name) return print(`Current palette: ${PALETTES[root.dataset.palette]}. Options: ${Object.keys(PALETTES).join(", ")}`, "t-muted");
      if (setPalette(name)) print(`🎨 Palette changed to ${PALETTES[name]}!`, "t-ok");
      else print(`color: unknown palette "${escapeHtml(name)}". Try: ${Object.keys(PALETTES).join(", ")}`, "t-err");
    },
    colour: (args) => COMMANDS.color(args),
    achievements: () => {
      const lines = Object.entries(ACHIEVEMENTS).map(([id, a]) =>
        unlocked.has(id) ? `<span class="t-ok">✔</span> ${a.icon} ${a.title} <span class="t-muted">· ${a.desc}</span>` : `<span class="t-muted">🔒 ??? · keep exploring</span>`);
      print(`🏆 ${unlocked.size}/${TOTAL} unlocked\n` + lines.join("\n"));
    },
    ls: () => print(Object.keys(FILES).map((f) => (f === "projects" ? `<span class="t-accent">${f}/</span>` : f)).join("   ")),
    cat: (args) => {
      const f = args[0];
      if (!f) return print("cat: missing file name", "t-err");
      if (f === "secret.txt") return print("🤫 Try the Konami code on your keyboard: ↑ ↑ ↓ ↓ ← → ← → B A\n…and someone said the logo likes being clicked. A lot.", "t-accent");
      if (f in FILES) return COMMANDS[FILES[f]]();
      print(`cat: ${f}: No such file or directory`, "t-err");
    },
    echo: (args) => print(args.join(" ") || " "),
    date: () => print(new Date().toString()),
    hello: () => print("Hi there! 👋 Thanks for stopping by. Type 'contact' if you'd like to talk."),
    hi: () => COMMANDS.hello(),
    coffee: () => print("☕ Brewing coffee…\nError 418: I'm a teapot 🍵", "t-accent"),
    sudo: (args) => {
      if (args.join(" ") === "hire-elham" || args.join(" ") === "hire elham") {
        print("[sudo] password for recruiter: ********", "t-muted");
        setTimeout(() => print("✅ Permission granted. Excellent decision!", "t-ok"), 500);
        setTimeout(() => print("📨 Opening email client…", "t-ok"), 1100);
        setTimeout(() => {
          rain({ count: 200 });
          rain({ count: 30, emojis: ["🤝", "🎉", "💜", "🚀"] });
          unlock("hire");
        }, 700);
        setTimeout(() => { location.href = "mailto:elhamhesham18@gmail.com?subject=Let's%20work%20together!"; }, 2200);
      } else {
        print("Nice try 😏 You are not in the sudoers file. This incident will be reported.\n(psst… try: sudo hire-elham)", "t-err");
      }
    },
    rm: () => {
      termWindow.classList.remove("shake");
      void termWindow.offsetWidth;
      termWindow.classList.add("shake");
      print("🚫 Whoa there! Not on my watch. This portfolio is protected by unit tests 🧪", "t-err");
    },
    vim: () => print("You are now stuck in vim forever. Just kidding 😄 (:q! works here too)", "t-accent"),
    ":q!": () => closeTerminal(),
    hire: () => print("Did you mean: <span class=\"t-ok\">sudo hire-elham</span> ? 😉"),
    clear: () => { termBody.innerHTML = ""; },
    exit: () => closeTerminal(),
  };

  function runCommand(raw) {
    const input = raw.trim();
    print(escapeHtml(input), "t-cmd");
    if (!input) return;
    history.push(input);
    historyPos = history.length;
    const [cmd, ...args] = input.split(/\s+/);
    const fn = COMMANDS[cmd.toLowerCase()];
    if (fn) fn(args);
    else print(`command not found: ${escapeHtml(cmd)}. Type <span class="t-ok">help</span> for the list of commands.`, "t-err");
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
  }

  termForm.addEventListener("submit", (e) => {
    e.preventDefault();
    runCommand(termInput.value);
    termInput.value = "";
  });

  termInput.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" && history.length) {
      e.preventDefault();
      historyPos = Math.max(0, historyPos - 1);
      termInput.value = history[historyPos];
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      historyPos = Math.min(history.length, historyPos + 1);
      termInput.value = history[historyPos] || "";
    } else if (e.key === "Tab") {
      e.preventDefault();
      const v = termInput.value.toLowerCase();
      const match = Object.keys(COMMANDS).filter((c) => c.startsWith(v) && c !== ":q!");
      if (match.length === 1) termInput.value = match[0] + " ";
      else if (match.length > 1) print(match.join("   "), "t-muted");
    }
  });

  $("#terminalBtn").addEventListener("click", openTerminal);
  $("#terminalClose").addEventListener("click", closeTerminal);
  $("#achBtn").addEventListener("click", () => { openTerminal(); runCommand("achievements"); });
  terminal.addEventListener("click", (e) => { if (e.target === terminal) closeTerminal(); });
  termBody.addEventListener("click", () => termInput.focus());

  document.addEventListener("keydown", (e) => {
    const typing = e.target.matches("input, textarea");
    if (e.key === "Escape" && terminal.classList.contains("open")) return closeTerminal();
    if (!typing && (e.key === "`" || e.key === "~")) {
      e.preventDefault();
      terminal.classList.contains("open") ? closeTerminal() : openTerminal();
      return;
    }
    if (typing) return;
    const key = e.key.toLowerCase();
    if (key === KONAMI[konamiPos]) konamiPos++;
    else if (key === "arrowup") konamiPos = konamiPos === 2 ? 2 : 1;
    else konamiPos = 0;
    if (konamiPos === KONAMI.length) { konamiPos = 0; party(true); }
  });

  /* =========================================================
     BUG SMASHER GAME
     ========================================================= */
  const arena = $("#gameArena");
  const overlay = $("#gameOverlay");
  const scoreEl = $("#gameScore");
  const timeEl = $("#gameTime");
  const bestEl = $("#gameBest");
  const GAME_TIME = 20;
  const TYPES = [
    { emoji: "🐛", pts: 1, speed: 1.6, weight: 62, cls: "" },
    { emoji: "🐞", pts: 3, speed: 3.4, weight: 18, cls: "bug--fast" },
    { emoji: "🚀", pts: -5, speed: 1.1, weight: 20, cls: "bug--feature" },
  ];
  let best = +localStorage.getItem("bugBest") || 0;
  let score = 0, timeLeft = GAME_TIME, playing = false;
  let bugs = [], clockTimer, spawnTimer, rafId, lastFrame = 0;
  bestEl.textContent = best;

  function bump(el, value) {
    el.textContent = value;
    el.classList.remove("bump");
    void el.offsetWidth;
    el.classList.add("bump");
  }

  function pickType() {
    let r = Math.random() * TYPES.reduce((s, t) => s + t.weight, 0);
    return TYPES.find((t) => (r -= t.weight) < 0) || TYPES[0];
  }

  function startGame() {
    if (playing) return;
    bugs.forEach((b) => b.el.remove());
    bugs = [];
    score = 0;
    timeLeft = GAME_TIME;
    playing = true;
    scoreEl.textContent = 0;
    timeEl.textContent = timeLeft;
    arena.classList.remove("danger");
    overlay.classList.add("hidden");

    clockTimer = setInterval(() => {
      timeLeft--;
      bump(timeEl, timeLeft);
      if (timeLeft <= 5) arena.classList.add("danger");
      if (timeLeft <= 0) endGame();
    }, 1000);

    spawnBug();
    lastFrame = performance.now();
    rafId = requestAnimationFrame(gameLoop);
  }

  function spawnBug() {
    if (!playing) return;
    const type = pickType();
    const w = arena.clientWidth, h = arena.clientHeight;
    const size = 58;
    const el = document.createElement("button");
    el.className = `bug ${type.cls}`;
    el.setAttribute("aria-label", type.pts < 0 ? "Feature, don't squash" : "Bug");
    el.innerHTML = `<span>${type.emoji}</span>`;
    const difficulty = 1 + (GAME_TIME - timeLeft) / GAME_TIME;
    const angle = rand(0, Math.PI * 2);
    const bug = {
      el, type, size,
      x: rand(0, w - size), y: rand(0, h - size),
      vx: Math.cos(angle) * type.speed * difficulty, vy: Math.sin(angle) * type.speed * difficulty,
      life: rand(2200, 3400) / difficulty, dead: false,
    };
    el.addEventListener("pointerdown", (e) => { e.preventDefault(); squash(bug, e); });
    arena.appendChild(el);
    bugs.push(bug);
    placeBug(bug);

    const delay = Math.max(260, 750 - (GAME_TIME - timeLeft) * 24);
    spawnTimer = setTimeout(spawnBug, delay);
  }

  function placeBug(b) {
    const flip = b.type.pts > 0 && b.vx > 0 ? -1 : 1;
    b.el.style.transform = `translate(${b.x}px, ${b.y}px) scaleX(${flip})`;
  }

  function gameLoop(now) {
    if (!playing) return;
    const dt = Math.min(48, now - lastFrame);
    lastFrame = now;
    const w = arena.clientWidth, h = arena.clientHeight;
    const k = dt / 16.67;

    for (const b of bugs) {
      if (b.dead) continue;
      b.x += b.vx * k;
      b.y += b.vy * k;
      if (b.x < 0 || b.x > w - b.size) { b.vx *= -1; b.x = Math.max(0, Math.min(w - b.size, b.x)); }
      if (b.y < 0 || b.y > h - b.size) { b.vy *= -1; b.y = Math.max(0, Math.min(h - b.size, b.y)); }
      if (Math.random() < 0.01) {
        const a = rand(0, Math.PI * 2), s = Math.hypot(b.vx, b.vy);
        b.vx = Math.cos(a) * s;
        b.vy = Math.sin(a) * s;
      }
      b.life -= dt;
      if (b.life <= 0) removeBug(b, "escaped");
      else placeBug(b);
    }
    bugs = bugs.filter((b) => !b.dead || b.el.isConnected);
    rafId = requestAnimationFrame(gameLoop);
  }

  function removeBug(b, cls) {
    b.dead = true;
    b.el.classList.add(cls);
    setTimeout(() => b.el.remove(), 350);
  }

  function popup(x, y, text, negative) {
    const p = document.createElement("span");
    p.className = "game__pop" + (negative ? " neg" : "");
    p.textContent = text;
    p.style.left = x + "px";
    p.style.top = y + "px";
    arena.appendChild(p);
    setTimeout(() => p.remove(), 900);
  }

  function squash(b, e) {
    if (b.dead || !playing) return;
    const r = arena.getBoundingClientRect();
    const px = e.clientX - r.left, py = e.clientY - r.top;
    score = Math.max(0, score + b.type.pts);
    bump(scoreEl, score);

    if (b.type.pts < 0) {
      b.el.querySelector("span").textContent = "💔";
      popup(px, py, "−5 feature broken!", true);
      arena.classList.remove("shake");
      void arena.offsetWidth;
      arena.classList.add("shake");
    } else {
      b.el.querySelector("span").textContent = "💥";
      popup(px, py, `+${b.type.pts}`, false);
      burst(e.clientX, e.clientY, { count: b.type.pts > 1 ? 26 : 14, speed: 5, size: 6, gravity: 0.15, life: 40 });
    }
    removeBug(b, "squashed");
  }

  function rankFor(s) {
    if (s < 5) return ["🐣", "Intern Debugger", "Every senior started somewhere!"];
    if (s < 12) return ["🔧", "Junior Bug Fixer", "Not bad! The QA team is mildly impressed."];
    if (s < 20) return ["🎯", "Senior Bug Hunter", "Production is safe in your hands."];
    if (s < 30) return ["🏆", "SonarQube Legend", "Zero code smells detected. Wow."];
    return ["👑", "Bug Exterminator", "Okay… you should probably hire yourself. Or me 😉"];
  }

  function endGame() {
    playing = false;
    clearInterval(clockTimer);
    clearTimeout(spawnTimer);
    cancelAnimationFrame(rafId);
    arena.classList.remove("danger");
    bugs.forEach((b) => removeBug(b, "escaped"));

    const newBest = score > best;
    if (newBest) {
      best = score;
      localStorage.setItem("bugBest", best);
      bump(bestEl, best);
    }
    const [emoji, title, msg] = rankFor(score);
    $("#gameEmoji").textContent = emoji;
    $("#gameTitle").textContent = `${score} points · ${title}`;
    $("#gameMsg").textContent = newBest && score > 0 ? `🎉 New best score! ${msg}` : msg;
    $("#gameStart span").textContent = "Play Again";
    overlay.classList.remove("hidden");

    if (score >= 15) unlock("hunter");
    if (newBest && score > 0) {
      const r = arena.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, { count: 90, speed: 12 });
    }
  }

  $("#gameStart").addEventListener("click", startGame);
})();
