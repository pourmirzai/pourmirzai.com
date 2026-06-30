import Lenis from "lenis";
import gsap from "gsap";

declare global {
  interface Window {
    __APP_BOOTED__?: boolean;
  }
}

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ============ SMOOTH SCROLL (Lenis, decoupled) + anchors ============ */
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

/* ============ REVEAL ON SCROLL (IntersectionObserver — reliable) ============ */
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

  // Re-scan new [data-reveal] added after language change
  window.addEventListener(
    "langchange",
    () => {
      document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.95) el.classList.add("is-visible");
        else io.observe(el);
      });
    },
    { once: false }
  );
}

/* ============ STATS COUNTERS (IntersectionObserver) ============ */
function localize(n: number): string {
  const lang = (localStorage.getItem("lang") as "fa" | "en") || "fa";
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
        if (prefersReduced) {
          el.textContent = localize(target);
        } else {
          const start = performance.now();
          const dur = 1600;
          const step = (now: number) => {
            const p = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = localize(Math.round(target * eased));
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
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
    .from(".hero-cta", { y: 16, opacity: 0, duration: 0.6, stagger: 0.1 }, "-=0.35");
}

/* ============ SCROLL-SPY: active nav link ============ */
function initScrollSpy() {
  const links = Array.from(
    document.querySelectorAll<HTMLAnchorElement>("[data-nav-link]")
  );
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

  if (!("IntersectionObserver" in window)) {
    setActive("#about");
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      // pick the most-visible section
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) setActive("#" + (visible[0].target as HTMLElement).id);
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5, 1] }
  );
  sections.forEach((s) => io.observe(s));
}

/* ============ TERMINAL TYPEWRITER ============ */
// Alternates between the two worlds: conservation fieldwork <-> web development.
const SNIPPETS = [
  "camera_traps.deploy({ site: 'Touran' })",
  "git push origin main",
  "track.cheetah({ id: 'AC-14', corridor: true })",
  "npm run build:portfolio",
  "restore.habitat('Miandasht', 5600)",
  "docker compose up -d",
  "survey.report({ species: 'leopard' })",
  "npx tailwindcss init",
];

function initTerminal() {
  const target = document.getElementById("terminal-line");
  if (!target) return;
  if (prefersReduced) {
    target.textContent = SNIPPETS[0];
    return;
  }
  let s = 0;
  let c = 0;
  let deleting = false;
  const tick = () => {
    const full = SNIPPETS[s];
    if (!deleting) {
      c++;
      target.textContent = full.slice(0, c);
      if (c >= full.length) {
        deleting = true;
        return setTimeout(tick, 1800);
      }
      return setTimeout(tick, 55 + Math.random() * 50);
    } else {
      c--;
      target.textContent = full.slice(0, c);
      if (c <= 0) {
        deleting = false;
        s = (s + 1) % SNIPPETS.length;
        return setTimeout(tick, 400);
      }
      return setTimeout(tick, 30);
    }
  };
  setTimeout(tick, 700);
}

/* ============ NATURE PARTICLES (canvas dust) ============ */
function initParticles() {
  const canvas = document.getElementById("nature-particles") as HTMLCanvasElement | null;
  if (!canvas || prefersReduced) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const parent = canvas.parentElement as HTMLElement;
  let w = 0;
  let h = 0;
  let raf = 0;
  type P = { x: number; y: number; r: number; vx: number; vy: number; a: number };
  let particles: P[] = [];

  const resize = () => {
    w = parent.clientWidth;
    h = parent.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(60, Math.floor((w * h) / 16000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.4,
      vx: (Math.random() - 0.5) * 0.22,
      vy: -(Math.random() * 0.35 + 0.08),
      a: Math.random() * 0.45 + 0.1,
    }));
  };
  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -5) {
        p.y = h + 5;
        p.x = Math.random() * w;
      }
      if (p.x < -5) p.x = w + 5;
      if (p.x > w + 5) p.x = -5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(199, 154, 58, ${p.a})`;
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
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          if (!raf) draw();
        } else {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      }),
    { threshold: 0 }
  );
  io.observe(parent);
}

/* ============ BOOT (each step isolated so one failure can't hide content) ============ */
function boot() {
  window.__APP_BOOTED__ = true;
  // Reveal MUST be set up first; everything else is a progressive enhancement.
  try {
    initReveals();
  } catch (e) {
    document.documentElement.classList.add("reveal-safe");
    console.error("reveal init failed", e);
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
  safe("hero", initHero);
  safe("scrollspy", initScrollSpy);
  safe("counters", initCounters);
  safe("terminal", initTerminal);
  safe("particles", initParticles);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
