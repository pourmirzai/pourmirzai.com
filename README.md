# Morteza Pourmirzai — Personal Website

> **Where Nature Meets Code** — the personal site of Morteza Pourmirzai, wildlife
> conservationist (Asiatic cheetah) and web developer.

A single-page, bilingual (FA/EN), fully animated personal website built with
**Astro 7 + Tailwind CSS v4 + GSAP + Lenis**. Dark theme, split-screen hero
(nature × tech), RTL-aware, deployable as a static site to Cloudflare Pages /
Vercel.

> Requires **Node ≥ 22.12.0**. The project uses npm 11's `allowScripts`
> (declared in `package.json`) so `esbuild`/`sharp` install scripts can run.

---

## Tech Stack

| Layer       | Choice                                  |
| ----------- | --------------------------------------- |
| Framework   | Astro 7 (static output)                    |
| Styling     | Tailwind CSS v4 (`@tailwindcss/vite`)      |
| Animation   | GSAP, Lenis smooth scroll, IntersectionObserver reveals |
| i18n        | Custom, **no reload** toggle (FA/EN)    |
| Fonts       | Vazirmatn, Inter, JetBrains Mono (self-hosted via `@fontsource`) |
| Icons       | Inline SVG (no icon-lib dependency)     |
| Contact     | Formspree-ready (no backend)            |

## Getting Started

```bash
npm install
npm run dev      # http://localhost:4321
```

## Scripts

| Command           | Description                                  |
| ----------------- | -------------------------------------------- |
| `npm run dev`     | Start the dev server                         |
| `npm run build`   | Type-check (`astro check`) + production build to `dist/` |
| `npm run preview` | Preview the production build locally          |

## Project Structure

```
public/              favicon.svg, og.svg, robots.txt
src/
├── components/
│   ├── Hero.astro  About.astro  TwoWorlds.astro
│   ├── Press.astro  Contact.astro
│   ├── Icon.astro            # inline SVG icon set
│   └── svg/                  # EcoNetworkSVG, IranMapSVG, FootprintSVG
├── i18n/ fa.json en.json      # all bilingual content
├── layouts/ Layout.astro      # head, header, footer, scripts
├── pages/ index.astro         # assembles all sections
├── scripts/
│   ├── i18n.ts                # language toggle + list re-render
│   └── main.ts                # Lenis, GSAP reveals, terminal, particles, counters
└── styles/ global.css         # theme tokens, components, RTL, reduced-motion
```

## i18n (Bilingual, no reload)

- Default language is **Persian (FA, RTL)**, rendered server-side.
- The toggle button in the header swaps to **English (EN, LTR)** instantly via JS.
- Translatable nodes carry `data-i18n="path.to.key"`; lists carry
  `data-i18n-list="timeline|nature-projects|..."` and are rebuilt on toggle.
- Preference is persisted in `localStorage` under the `lang` key; the
  `<html lang/dir>` is set before first paint to avoid any flash.

## Content

All copy lives in `src/i18n/fa.json` and `src/i18n/en.json` — edit those files to
update any text, links, projects, stats or timeline entries.

## Customisation Cheatsheet

| Want to change…            | Edit                                  |
| -------------------------- | ------------------------------------- |
| Colors / fonts / tokens    | `src/styles/global.css` (`@theme`)    |
| Any text                   | `src/i18n/{fa,en}.json`               |
| Section order / page       | `src/pages/index.astro`               |
| Animations                 | `src/scripts/main.ts`                 |
| Social links               | `src/layouts/Layout.astro`, `Contact.astro` |
| Contact form endpoint      | `Contact.astro` → `action="https://formspree.io/f/..."` |

## Contact

The Contact section shows social links and a **spam-safe masked email**
(`info [at] sarvinwildlife [dot] com`) that reveals the real address on
click/focus. Edit it in `src/components/Contact.astro`.

## Accessibility & Performance

- Respects `prefers-reduced-motion` (disables Lenis, reveals, particles, counters).
- Semantic HTML, skip-link, aria labels, focus-visible styles.
- Particle canvas pauses when off-screen.
- Self-hosted fonts, inlined critical CSS, lazy reveal.

## Deploy

Static output in `dist/`. On **Cloudflare Pages** set:

- Build command: `npm run build`
- Output directory: `dist`

(Works the same on Vercel / Netlify.)

---

© Morteza Pourmirzai. Built with Astro, GSAP and love for the cheetah.
