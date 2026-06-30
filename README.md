# Morteza Pourmirzai â€” Personal Website

> **Where Nature Meets Code** â€” the personal site of Morteza Pourmirzai, wildlife
> conservationist (Asiatic cheetah) and web developer.

A single-page, bilingual (FA/EN), fully animated personal website built with
**Astro 7 + Tailwind CSS v4 + GSAP + Lenis**. Dark theme, split-screen hero
(nature Ã— tech), RTL-aware, served as a static build via Docker + nginx.

> Requires **Node â‰¥ 22.12.0**. The project uses npm 11's `allowScripts`
> (declared in `package.json`) so `esbuild`/`sharp` install scripts can run.

---

## Tech Stack

| Layer       | Choice                                  |
| ----------- | --------------------------------------- |
| Framework   | Astro 7 (static output)                 |
| Styling     | Tailwind CSS v4 (`@tailwindcss/vite`)   |
| Animation   | GSAP, Lenis smooth scroll, IntersectionObserver reveals |
| i18n        | Custom, **no reload** toggle (FA/EN)    |
| Fonts       | Vazirmatn, Inter, Noto Sans Arabic (self-hosted via `@fontsource`) |
| Icons       | Inline SVG (no icon-lib dependency)     |
| Contact     | Spam-safe masked email (no backend)     |

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

```text
public/              favicon.svg, og.svg, robots.txt
src/
â”œâ”€â”€ components/
â”‚   â”œâ”€â”€ Hero.astro  About.astro  TwoWorlds.astro
â”‚   â”œâ”€â”€ Press.astro  Contact.astro
â”‚   â”œâ”€â”€ Icon.astro            # inline SVG icon set
â”‚   â””â”€â”€ svg/                  # EcoNetworkSVG, IranMapSVG, HabitatTopoSVG, FootprintSVG
â”œâ”€â”€ data/ topo.ts             # topographic contour + corridor path data
â”œâ”€â”€ i18n/ fa.json en.json     # all bilingual content
â”œâ”€â”€ layouts/ Layout.astro     # head, header, footer, scripts
â”œâ”€â”€ pages/ index.astro        # assembles all sections
â”œâ”€â”€ scripts/
â”‚   â”œâ”€â”€ i18n.ts               # language toggle + list re-render
â”‚   â””â”€â”€ main.ts               # Lenis, GSAP reveals, terminal, particles, counters
â””â”€â”€ styles/ global.css        # theme tokens, components, RTL, reduced-motion
```

## i18n (Bilingual, no reload)

- Default language is **Persian (FA, RTL)**, rendered server-side.
- The toggle button in the header swaps to **English (EN, LTR)** instantly via JS.
- Translatable nodes carry `data-i18n="path.to.key"`; lists carry
  `data-i18n-list="timeline|nature-projects|..."` and are rebuilt on toggle.
- Preference is persisted in `localStorage` under the `lang` key; the
  `<html lang/dir>` is set before first paint to avoid any flash.

## Content

All copy lives in `src/i18n/fa.json` and `src/i18n/en.json` â€” edit those files to
update any text, links, projects, stats or timeline entries.

## Customisation Cheatsheet

| Want to changeâ€¦            | Edit                                  |
| -------------------------- | ------------------------------------- |
| Colors / fonts / tokens    | `src/styles/global.css` (`@theme`)    |
| Any text                   | `src/i18n/{fa,en}.json`               |
| Section order / page       | `src/pages/index.astro`               |
| Animations                 | `src/scripts/main.ts`                 |
| Social links               | `src/layouts/Layout.astro`, `Contact.astro` |
| Contact email (masked)     | `src/components/Contact.astro`        |

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

The project ships with a multi-stage **Dockerfile** and **docker-compose.yml**
that build the static site and serve it with **nginx**.

```bash
docker compose up --build      # builds dist/ then serves on port 80
```

- Build stage (`node:22-alpine`): `npm ci` + `npm run build` â†’ `dist/`
- Runtime stage (`nginx:1.27-alpine`): serves `dist/` on `:80` via `nginx.conf`
  (gzip, long-cache hashed assets, SPA fallback).

For static hosts (Cloudflare Pages / Vercel / Netlify): build command
`npm run build`, output directory `dist`.

---

Â© Morteza Pourmirzai. Built with Astro, GSAP and love for the cheetah.