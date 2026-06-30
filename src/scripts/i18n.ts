import fa from "../i18n/fa.json";
import en from "../i18n/en.json";

type Dict = typeof fa;

const DICTS: Record<string, Dict> = { fa, en };
type Lang = keyof typeof DICTS;

const STORAGE_KEY = "lang";

/* ---------- helpers ---------- */
function getByPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function asString(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function localizeNum(n: number, lang: Lang): string {
  try {
    return new Intl.NumberFormat(lang === "en" ? "en-US" : "fa-IR").format(n);
  } catch {
    return String(n);
  }
}

/* ---------- list renderers ---------- */
const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string)
  );

function renderTimeline(items: { year: string; text: string }[]): string {
  return items
    .map(
      (it) => `
      <li class="timeline-item relative ps-8 pb-8" data-reveal>
        <span class="timeline-dot absolute start-0 top-1.5 grid h-3 w-3 place-items-center rounded-full bg-nature-gold-bright ring-4 ring-nature-gold-bright/15"></span>
        <span class="font-mono text-sm font-semibold text-tech-cyan">${escapeHtml(it.year)}</span>
        <p class="mt-1 text-sm text-muted">${escapeHtml(it.text)}</p>
      </li>`
    )
    .join("");
}

function renderNatureProjects(items: { name: string; desc: string; url: string }[]): string {
  return items
    .map(
      (p) => `
      <a ${p.url ? `href="${escapeHtml(p.url)}" target="_blank" rel="noopener noreferrer"` : 'role="group"'} class="group flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:border-nature-gold/40">
        <span class="min-w-0">
          <span class="block font-semibold text-text">${escapeHtml(p.name)}</span>
          <span class="block text-sm text-muted">${escapeHtml(p.desc)}</span>
        </span>
        ${p.url ? '<svg viewBox="0 0 24 24" class="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-nature-gold-bright" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 4h6v6m0-6L10 14M19 14v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ""}
      </a>`
    )
    .join("");
}

function renderAchievements(items: string[]): string {
  return items
    .map(
      (t) => `
      <li class="flex items-start gap-3" data-reveal>
        <span class="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-nature-gold-bright/15 text-nature-gold-bright">
          <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>
        </span>
        <span class="text-sm text-text/90">${escapeHtml(t)}</span>
      </li>`
    )
    .join("");
}

function renderStack(items: string[]): string {
  return items
    .map(
      (t) => `<span class="pill border-tech-cyan/20 bg-tech-cyan/5 text-tech-cyan/90" data-reveal>${escapeHtml(t)}</span>`
    )
    .join("");
}

function renderRepos(items: { name: string; desc: string; tag: string; url: string }[]): string {
  return items
    .map(
      (r) => `
      <a href="${escapeHtml(r.url)}" target="_blank" rel="noopener noreferrer" class="card card-hover group" data-reveal>
        <div class="flex items-center justify-between">
          <span class="flex items-center gap-2 font-mono text-sm font-semibold text-text">
            <svg viewBox="0 0 24 24" class="h-4 w-4 text-muted" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.5 2.87 8.32 6.84 9.67.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.46-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.36-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05A9.36 9.36 0 0 1 12 6.84c.85 0 1.71.12 2.51.34 1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z"></path></svg>
            ${escapeHtml(r.name)}
          </span>
          <svg viewBox="0 0 24 24" class="h-4 w-4 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-tech-cyan" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6m0-6L10 14M19 14v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"></path></svg>
        </div>
        <p class="mt-2 text-sm text-muted">${escapeHtml(r.desc)}</p>
        <span class="pill mt-3 border-white/10 bg-white/5 text-muted">${escapeHtml(r.tag)}</span>
      </a>`
    )
    .join("");
}

function renderPress(items: { name: string; url: string }[]): string {
  return items
    .map(
      (o) => `
      <a href="${escapeHtml(o.url || "#")}" ${o.url && o.url !== "#" ? 'target="_blank" rel="noopener noreferrer"' : ""} class="press-logo card card-hover group flex h-28 items-center justify-center text-center" data-reveal>
        <span class="font-mono text-lg font-semibold tracking-tight text-muted transition-colors group-hover:text-text">${escapeHtml(o.name)}</span>
      </a>`
    )
    .join("");
}

const RENDERERS: Record<string, (dict: Dict) => string> = {
  timeline: (d) => renderTimeline(d.about.timeline),
  "nature-projects": (d) => renderNatureProjects(d.worlds.nature.projects),
  "nature-achievements": (d) => renderAchievements(d.worlds.nature.achievements),
  "tech-stack": (d) => renderStack(d.worlds.tech.stack),
  "tech-repos": (d) => renderRepos(d.worlds.tech.repos),
  press: (d) => renderPress(d.press.outlets),
};

/* ---------- apply language ---------- */
function applyLang(lang: Lang) {
  const dict = DICTS[lang];
  const el = document.documentElement;
  el.lang = lang;
  el.dir = lang === "fa" ? "rtl" : "ltr";

  // text nodes
  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((node) => {
    const val = getByPath(dict, node.dataset.i18n || "");
    node.textContent = asString(val);
  });

  // innerHTML nodes
  document.querySelectorAll<HTMLElement>("[data-i18n-html]").forEach((node) => {
    const val = getByPath(dict, node.dataset.i18nHtml || "");
    node.innerHTML = asString(val);
  });

  // placeholders
  document.querySelectorAll<HTMLElement>("[data-i18n-ph]").forEach((node) => {
    const val = getByPath(dict, node.dataset.i18nPh || "");
    node.setAttribute("placeholder", asString(val));
  });

  // aria-labels (e.g. form fields)
  document.querySelectorAll<HTMLElement>("[data-i18n-aria]").forEach((node) => {
    const val = getByPath(dict, node.dataset.i18nAria || "");
    node.setAttribute("aria-label", asString(val));
  });

  // lists
  document.querySelectorAll<HTMLElement>("[data-i18n-list]").forEach((node) => {
    const key = node.dataset.i18nList || "";
    const renderer = RENDERERS[key];
    if (renderer) node.innerHTML = renderer(dict);
  });

  // counters (re-localize numbers)
  document.querySelectorAll<HTMLElement>("[data-count]").forEach((node) => {
    const target = Number(node.dataset.count || "0");
    node.textContent = localizeNum(target, lang);
  });

  // document title + meta description
  document.title = asString(dict.meta.title);
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", asString(dict.meta.description));

  window.dispatchEvent(new CustomEvent("langchange", { detail: { lang } }));
}

/* ---------- toggle ---------- */
function currentLang(): Lang {
  return (localStorage.getItem(STORAGE_KEY) as Lang) || "en";
}

function setLang(lang: Lang) {
  localStorage.setItem(STORAGE_KEY, lang);
  applyLang(lang);
}

function toggleLang() {
  setLang(currentLang() === "fa" ? "en" : "fa");
}

/* ---------- boot ---------- */
function boot() {
  applyLang(currentLang());

  const toggle = document.getElementById("lang-toggle");
  toggle?.addEventListener("click", toggleLang);

  // mobile menu
  const menuBtn = document.getElementById("menu-toggle");
  const menu = document.getElementById("mobile-menu");
  menuBtn?.addEventListener("click", () => {
    const open = menu?.classList.toggle("flex") ?? false;
    menu?.classList.toggle("hidden", !open);
    menuBtn.setAttribute("aria-expanded", String(open));
  });
  document.querySelectorAll<HTMLAnchorElement>(".mobile-link").forEach((a) => {
    a.addEventListener("click", () => {
      menu?.classList.add("hidden");
      menu?.classList.remove("flex");
      menuBtn?.setAttribute("aria-expanded", "false");
    });
  });

  // year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
