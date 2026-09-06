import Lenis from "lenis";
import gsap from "gsap";

declare global {
  interface Window {
    __APP_BOOTED__?: boolean;
    __SOUND_ACTIVE__?: boolean;
    showToast?: (msg: string) => void;
  }
}

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch = window.matchMedia("(pointer: coarse)").matches;

/* ============ SMOOTH SCROLL (Lenis) ============ */
let lenis: Lenis | null = null;

function initLenis() {
  if (prefersReduced) return;
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 });
  function raf(time: number) {
    lenis?.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis?.scrollTo(target as HTMLElement, { offset: -80, duration: 1.2 });
    });
  });
}

/* ============ HEADER + SCROLL PROGRESS ============ */
function initHeader() {
  const header = document.getElementById("site-header");
  const progress = document.getElementById("scroll-progress");
  const setProgress = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const ratio = max > 0 ? h.scrollTop / max : 0;
    if (progress) progress.style.transform = `scaleX(${ratio})`;
    if (header) header.classList.toggle("is-scrolled", h.scrollTop > 24);
  };
  setProgress();
  window.addEventListener("scroll", setProgress, { passive: true });
  lenis?.on("scroll", setProgress);
}

/* ============ MAGNETIC FLUID CURSOR ============ */
function initCustomCursor() {
  if (prefersReduced || isTouch) return;

  const dot = document.querySelector<HTMLElement>(".cursor-dot");
  const ring = document.querySelector<HTMLElement>(".cursor-ring");
  if (!dot || !ring) return;

  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
  });

  function renderCursor() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    if (ring) ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  const interactiveElements = document.querySelectorAll(
    'a, button, [role="button"], input, .card-hover, .spotlight-card, .sanctuary-node'
  );

  interactiveElements.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      document.body.classList.add("cursor-hover");
      playInterfaceChime(900, 0.015, 0.04);
    });
    el.addEventListener("mouseleave", () => {
      document.body.classList.remove("cursor-hover");
    });
  });
}

/* ============ PROCEDURAL WEB AUDIO SYNTHESIZER ============ */
let audioCtx: AudioContext | null = null;
let ambientGain: GainNode | null = null;
let ambientOsc1: OscillatorNode | null = null;
let ambientOsc2: OscillatorNode | null = null;
let isSoundPlaying = false;

function initAudio() {
  const soundBtn = document.getElementById("sound-toggle");
  if (!soundBtn) return;

  const getAudioContext = () => {
    if (!audioCtx) {
      const AudioClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new AudioClass();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  };

  const startAmbientSound = () => {
    const ctx = getAudioContext();
    ambientGain = ctx.createGain();
    ambientGain.gain.setValueAtTime(0.001, ctx.currentTime);
    ambientGain.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + 1.5);

    // Warm organic low root (nature drone)
    ambientOsc1 = ctx.createOscillator();
    ambientOsc1.type = "sine";
    ambientOsc1.frequency.setValueAtTime(110, ctx.currentTime); // A2

    // Ethereal fifth
    ambientOsc2 = ctx.createOscillator();
    ambientOsc2.type = "triangle";
    ambientOsc2.frequency.setValueAtTime(164.81, ctx.currentTime); // E3

    ambientOsc1.connect(ambientGain);
    ambientOsc2.connect(ambientGain);
    ambientGain.connect(ctx.destination);

    ambientOsc1.start();
    ambientOsc2.start();
    isSoundPlaying = true;
    soundBtn.classList.add("is-playing");
  };

  const stopAmbientSound = () => {
    if (!audioCtx || !ambientGain) return;
    ambientGain.gain.setValueAtTime(ambientGain.gain.value, audioCtx.currentTime);
    ambientGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8);
    setTimeout(() => {
      try {
        ambientOsc1?.stop();
        ambientOsc2?.stop();
        ambientOsc1?.disconnect();
        ambientOsc2?.disconnect();
      } catch {}
      ambientOsc1 = null;
      ambientOsc2 = null;
    }, 850);
    isSoundPlaying = false;
    soundBtn.classList.remove("is-playing");
  };

  soundBtn.addEventListener("click", () => {
    if (!isSoundPlaying) {
      startAmbientSound();
      showToast(document.documentElement.lang === "fa" ? "صدای امبینت فعال شد" : "Ambient soundscape activated");
    } else {
      stopAmbientSound();
      showToast(document.documentElement.lang === "fa" ? "صدا قطع شد" : "Sound muted");
    }
    window.__SOUND_ACTIVE__ = isSoundPlaying;
  });
}

function playInterfaceChime(freq = 880, vol = 0.02, duration = 0.05) {
  if (!isSoundPlaying || !audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch {}
}

/* ============ TOAST NOTIFICATION ============ */
function showToast(message: string) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast-msg";
  toast.innerHTML = `
    <span class="text-tech-cyan">✓</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("toast-show");
  });

  setTimeout(() => {
    toast.classList.remove("toast-show");
    setTimeout(() => toast.remove(), 400);
  }, 2800);
}
window.showToast = showToast;

/* ============ SPOTLIGHT & 3D TILT EFFECT ============ */
function initSpotlightTilt() {
  if (prefersReduced || isTouch) return;

  const cards = document.querySelectorAll<HTMLElement>(".spotlight-card, .fusion-card");
  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      gsap.to(card, {
        rotationX: rotateX,
        rotationY: rotateY,
        duration: 0.25,
        ease: "power1.out",
        transformPerspective: 1000,
        overwrite: "auto",
      });
    });

    card.addEventListener("mouseleave", () => {
      gsap.to(card, {
        rotationX: 0,
        rotationY: 0,
        duration: 0.5,
        ease: "power2.out",
        overwrite: "auto",
      });
    });
  });
}

/* ============ HERO TERMINAL TABS & EXECUTION ============ */
const TERMINAL_DATA = {
  ops: [
    "camera_traps.sync({ region: 'Touran', corridor: 'Miandasht' })",
    "telemetry.alert({ species: 'Acinonyx', status: 'verified' })",
    "rangers.dispatch({ sector: 'Eastern Corridor', status: 'secure' })",
    "habitat.waterPoints.status('optimal', { count: 18 })",
  ],
  deploy: [
    "git checkout -b feature/sanctuary-monitoring",
    "docker compose -f docker-compose.prod.yml up -d",
    "cloudflare.cache.purge({ zone: 'pourmirzai.com' })",
    "n8n.workflows.trigger('cheetah-alert-stream')",
  ],
  ai: [
    "model = load_weights('yolov9-felidae-v3.pt')",
    "preds = model.detect('camera_trap_042.jpg', conf=0.94)",
    "logger.info('Match verified: Asiatic Cheetah (Acinonyx)')",
    "export_geojson(coords=[35.84, 55.42], status='live')",
  ],
};

function initTerminalTabs() {
  const terminalLine = document.getElementById("terminal-line");
  const tabBtns = document.querySelectorAll<HTMLButtonElement>("[data-term-tab]");
  if (!terminalLine) return;

  let activeTab: "ops" | "deploy" | "ai" = "ops";
  let step = 0;
  let charIdx = 0;
  let isDeleting = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  function typeTick() {
    const list = TERMINAL_DATA[activeTab];
    const full = list[step];
    if (!isDeleting) {
      charIdx++;
      terminalLine!.textContent = full.slice(0, charIdx);
      if (charIdx >= full.length) {
        isDeleting = true;
        timer = setTimeout(typeTick, 2400);
        return;
      }
      timer = setTimeout(typeTick, 45 + Math.random() * 40);
    } else {
      charIdx--;
      terminalLine!.textContent = full.slice(0, charIdx);
      if (charIdx <= 0) {
        isDeleting = false;
        step = (step + 1) % list.length;
        timer = setTimeout(typeTick, 400);
        return;
      }
      timer = setTimeout(typeTick, 25);
    }
  }

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.termTab as "ops" | "deploy" | "ai";
      if (!tab || tab === activeTab) return;
      activeTab = tab;
      step = 0;
      charIdx = 0;
      isDeleting = false;

      tabBtns.forEach((b) => {
        const isSelected = b === btn;
        b.classList.toggle("text-tech-cyan", isSelected);
        b.classList.toggle("border-tech-cyan/40", isSelected);
        b.classList.toggle("bg-tech-cyan/10", isSelected);
        b.classList.toggle("text-muted", !isSelected);
      });

      if (timer) clearTimeout(timer);
      terminalLine!.textContent = "";
      typeTick();
      playInterfaceChime(1050, 0.02, 0.06);
    });
  });

  typeTick();
}

/* ============ SANCTUARY MAP INTERACTIVE TELEMETRY HUD ============ */
function initSanctuaryMap() {
  const nodes = document.querySelectorAll<SVGGElement>(".sanctuary-node");
  const hud = document.getElementById("sanctuary-hud");
  const nameEl = document.getElementById("hud-sanctuary-name");
  const areaEl = document.getElementById("hud-sanctuary-area");
  const roleEl = document.getElementById("hud-sanctuary-role");

  if (!hud || !nameEl || !areaEl || !roleEl) return;

  nodes.forEach((node) => {
    const showData = () => {
      const name = node.dataset.sanctuaryName || "";
      const area = node.dataset.sanctuaryArea || "";
      const role = node.dataset.sanctuaryRole || "";

      nameEl.textContent = name;
      areaEl.textContent = area;
      roleEl.textContent = role;

      hud.classList.remove("opacity-0", "translate-y-2");
      hud.classList.add("opacity-100", "translate-y-0");
      playInterfaceChime(780, 0.015, 0.05);
    };

    const hideData = () => {
      hud.classList.add("opacity-0", "translate-y-2");
      hud.classList.remove("opacity-100", "translate-y-0");
    };

    node.addEventListener("mouseenter", showData);
    node.addEventListener("focus", showData);
    node.addEventListener("mouseleave", hideData);
    node.addEventListener("blur", hideData);
  });
}

/* ============ INSTANT CLIPBOARD COPY ============ */
function initClipboardCopy() {
  const copyBtns = document.querySelectorAll<HTMLElement>("[data-copy-text]");
  copyBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const text = btn.dataset.copyText || "morteza@pourmirzai.com";
      navigator.clipboard.writeText(text).then(() => {
        const isFa = document.documentElement.lang === "fa";
        showToast(isFa ? "آدرس ایمیل در کلیپ‌بورد کپی شد!" : "Email copied to clipboard!");
        playInterfaceChime(1200, 0.03, 0.08);
      });
    });
  });
}

/* ============ REVEAL ON SCROLL ============ */
function initReveals() {
  const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
  if (prefersReduced || !("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
  );
  els.forEach((el) => io.observe(el));

  window.addEventListener("langchange", () => {
    document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.95) el.classList.add("is-visible");
      else io.observe(el);
    });
  });
}

/* ============ STATS COUNTERS ============ */
function localize(n: number): string {
  const lang = (localStorage.getItem("lang") as "fa" | "en") || "en";
  try {
    return new Intl.NumberFormat(lang === "en" ? "en-US" : "fa-IR").format(n);
  } catch {
    return String(n);
  }
}

function initCounters() {
  const els = Array.from(document.querySelectorAll<HTMLElement>("[data-count]"));
  if (prefersReduced || !("IntersectionObserver" in window)) {
    els.forEach((el) => (el.textContent = localize(Number(el.dataset.count || "0"))));
    return;
  }
  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        const target = Number(el.dataset.count || "0");
        const start = performance.now();
        const dur = 1600;
        const step = (now: number) => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = localize(Math.round(target * eased));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        obs.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );
  els.forEach((el) => io.observe(el));
}

/* ============ HERO ENTRANCE (GSAP) ============ */
function initHero() {
  if (prefersReduced) {
    gsap.set("[data-hero-anim]", { opacity: 1, y: 0 });
    return;
  }
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.from(".hero-bg", { opacity: 0, duration: 1.0 })
    .from("[data-hero-anim]", { y: 26, opacity: 0, duration: 0.7, stagger: 0.12 }, "-=0.5")
    .from(".hero-cta", { y: 16, opacity: 0, duration: 0.6, stagger: 0.1 }, "-=0.35")
    .from(".fusion-card", {
      scale: 0.9,
      opacity: 0,
      duration: 0.7,
      stagger: 0.15,
      ease: "back.out(1.2)"
    }, "-=0.4");
}

/* ============ SCROLL-SPY ============ */
function initScrollSpy() {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("[data-nav-link]"));
  if (!links.length) return;

  const byHref = new Map<string, HTMLAnchorElement>();
  const sections: HTMLElement[] = [];
  links.forEach((a) => {
    const id = a.getAttribute("href") || "";
    const sec = id ? document.querySelector(id) : null;
    if (sec) {
      byHref.set(id, a);
      sections.push(sec as HTMLElement);
    }
  });
  if (!sections.length) return;

  const setActive = (id: string | null) => {
    links.forEach((a) => {
      const match = a.getAttribute("href") === id;
      a.classList.toggle("is-active", match);
      if (match) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  };

  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) setActive("#" + (visible[0].target as HTMLElement).id);
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5, 1] }
  );
  sections.forEach((s) => io.observe(s));
}

/* ============ DUAL-NATURE / TECH NEURAL PARTICLE CANVAS ============ */
function initParticles() {
  const canvas = document.getElementById("fusion-particles") as HTMLCanvasElement | null;
  if (!canvas || prefersReduced) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const parent = canvas.parentElement as HTMLElement;
  let w = 0;
  let h = 0;
  let raf = 0;

  type P = {
    x: number;
    y: number;
    r: number;
    vx: number;
    vy: number;
    a: number;
    type: "nature" | "tech";
    hue: number;
  };
  let particles: P[] = [];
  let mouseX = -500;
  let mouseY = -500;

  const resize = () => {
    w = parent.clientWidth;
    h = parent.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(75, Math.floor((w * h) / 14000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2.2 + 0.8,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(Math.random() * 0.4 + 0.1),
      a: Math.random() * 0.5 + 0.2,
      type: Math.random() > 0.5 ? "nature" : "tech",
      hue: Math.random() > 0.5 ? 42 : 168,
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, w, h);

    // Neural connections between close particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 85) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          const alpha = (1 - dist / 85) * 0.18;
          ctx.strokeStyle = p1.type === p2.type && p1.type === "tech"
            ? `rgba(100, 255, 218, ${alpha})`
            : `rgba(199, 154, 58, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    for (const p of particles) {
      // Gentle cursor repulsion
      const dx = mouseX - p.x;
      const dy = mouseY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 140) {
        const force = (1 - dist / 140) * 0.6;
        p.vx -= (dx / dist) * force;
        p.vy -= (dy / dist) * force;
      }

      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.98;
      p.vy *= 0.98;

      if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.type === "nature"
        ? `hsla(${p.hue}, 70%, 55%, ${p.a})`
        : `hsla(${p.hue}, 85%, 65%, ${p.a})`;
      ctx.fill();
    }
    raf = requestAnimationFrame(draw);
  };

  resize();
  draw();

  window.addEventListener("resize", () => {
    cancelAnimationFrame(raf);
    resize();
    draw();
  });

  document.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });
}

/* ============ BOOT SYSTEM ============ */
function boot() {
  window.__APP_BOOTED__ = true;
  try {
    initReveals();
  } catch (e) {
    document.documentElement.classList.add("reveal-safe");
  }

  const safe = (name: string, fn: () => void) => {
    try {
      fn();
    } catch (e) {
      console.error(name + " failed", e);
    }
  };

  safe("lenis", initLenis);
  safe("header", initHeader);
  safe("cursor", initCustomCursor);
  safe("audio", initAudio);
  safe("spotlight", initSpotlightTilt);
  safe("terminalTabs", initTerminalTabs);
  safe("sanctuaryMap", initSanctuaryMap);
  safe("clipboard", initClipboardCopy);
  safe("hero", initHero);
  safe("scrollspy", initScrollSpy);
  safe("counters", initCounters);
  safe("particles", initParticles);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
