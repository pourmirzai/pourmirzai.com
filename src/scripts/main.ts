import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ============ SMOOTH SCROLL (Lenis) + anchor handling ============ */
let lenis: Lenis | null = null;

function initLenis() {
  if (prefersReduced) return;
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

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
    if (header) header.classList.toggle("py-shadow", h.scrollTop > 24);
    if (header)
      header.classList.toggle("is-scrolled", h.scrollTop > 24);
  };
  setProgress();
  lenis ? lenis.on("scroll", setProgress) : window.addEventListener("scroll", setProgress, { passive: true });
}

/* ============ REVEAL ON SCROLL ============ */
let revealTweens: gsap.core.Tween[] = [];

function buildReveals() {
  revealTweens.forEach((t) => t.kill());
  revealTweens = [];
  if (prefersReduced) return;

  const vh = window.innerHeight;
  gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
    const rect = el.getBoundingClientRect();
    const alreadyInView = rect.top < vh * 0.9;
    if (alreadyInView) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }
    const tween = gsap.fromTo(
      el,
      { y: 28, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      }
    );
    revealTweens.push(tween);
  });
  ScrollTrigger.refresh();
}

/* ============ HERO ENTRANCE ============ */
function initHero() {
  const hero = document.getElementById("hero");
  if (!hero) return;
  if (prefersReduced) {
    gsap.set("[data-hero-anim]", { opacity: 1, y: 0 });
    return;
  }
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.from(".hero-side-nature", { xPercent: -8, opacity: 0, duration: 1 })
    .from(".hero-side-tech", { xPercent: 8, opacity: 0, duration: 1 }, "<")
    .from("[data-hero-anim]", { y: 24, opacity: 0, duration: 0.7, stagger: 0.12 }, "-=0.4")
    .from(".hero-cta", { y: 16, opacity: 0, duration: 0.6, stagger: 0.1 }, "-=0.3");
}

/* ============ STATS COUNTERS ============ */
function initCounters() {
  gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
    const target = Number(el.dataset.count || "0");
    if (prefersReduced) {
      el.textContent = localize(target);
      return;
    }
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          v: target,
          duration: 1.8,
          ease: "power2.out",
          onUpdate: () => (el.textContent = localize(Math.round(obj.v))),
        });
      },
    });
  });
}

function localize(n: number): string {
  const lang = (localStorage.getItem("lang") as "fa" | "en") || "fa";
  try {
    return new Intl.NumberFormat(lang === "en" ? "en-US" : "fa-IR").format(n);
  } catch {
    return String(n);
  }
}

/* ============ TERMINAL TYPEWRITER ============ */
const SNIPPETS = [
  "const mission = 'Save the Asiatic Cheetah';",
  "git commit -m 'protect 5600 hectares'",
  "npm run build:sarvinwildlife",
  "camera_traps.deploy({ location: 'Touran' })",
  "await survey('Miandasht Wildlife Refuge')",
  "docker compose up conservation-api",
];

function initTerminal() {
  const target = document.getElementById("terminal-line");
  const cursor = document.getElementById("terminal-cursor");
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
  setTimeout(tick, 600);
  if (cursor) gsap.to(cursor, { opacity: 0, duration: 0.6, repeat: -1, yoyo: true, ease: "power0" });
}

/* ============ NATURE PARTICLES (canvas dust/sand) ============ */
function initParticles() {
  const canvas = document.getElementById("nature-particles") as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  if (prefersReduced) return;

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
    const count = Math.min(70, Math.floor((w * h) / 14000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -(Math.random() * 0.4 + 0.1),
      a: Math.random() * 0.5 + 0.1,
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

  // pause when offscreen
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          if (!raf) draw();
        } else {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      });
    },
    { threshold: 0 }
  );
  io.observe(parent);
}

/* ============ CHEETAH BREATHING ============ */
function initCheetah() {
  const el = document.querySelector(".cheetah-art");
  if (!el || prefersReduced) return;
  gsap.to(el, { scale: 1.03, duration: 3.2, repeat: -1, yoyo: true, ease: "sine.inOut" });
}

/* ============ BOOT ============ */
function boot() {
  initLenis();
  initHeader();
  initHero();
  initCounters();
  initTerminal();
  initParticles();
  initCheetah();
  buildReveals();

  window.addEventListener("langchange", () => {
    // counters & text already re-localized by i18n; refresh reveal triggers
    buildReveals();
    ScrollTrigger.refresh();
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
