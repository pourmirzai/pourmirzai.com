#< CLIXML
# Morteza Pourmirzai — Personal Website

> Where Nature Meets Code — Personal site of Morteza Pourmirzai, wildlife conservationist and web developer.

A single-page, bilingual FA/EN personal website. Built with Astro 7 + Tailwind CSS v4 + GSAP + Lenis.

## Tech Stack
| Layer | Choice |
|-------|--------|
| Framework | Astro 7 (static) |
| Styling | Tailwind CSS v4 |
| Animation | GSAP, Lenis smooth scroll |
| i18n | Custom bilingual toggle |
| Fonts | Vazirmatn, Inter (self-hosted) |
| Contact | Spam-safe masked email |

## Getting Started
```bash
npm install
npm run dev  # http://localhost:4321
```

## Scripts
| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview production build |

## i18n
- Persian RTL default, instant toggle to English LTR
- Content in `src/i18n/fa.json` and `src/i18n/en.json`

## Deploy
```bash
npm run build  # or: docker compose up --build
```
Static output: `dist/` | Docker: nginx on port 80

---

© Morteza Pourmirzai. Built with Astro and love for the cheetah.