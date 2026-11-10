# TOS Algae Removal Services — Website

A polished, single-page marketing site for a professional algae, mold, and surface-growth removal business. Built as a dependency-light static site with a real-time WebGL backdrop, scroll-driven storytelling, and a conversion-focused contact flow.

![Status](https://img.shields.io/badge/status-active-brightgreen)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)

---

## Overview

The site walks a visitor through a narrative — **the problem → why it happens → the solution → the process → proof → trust → contact** — using a chapter-based layout with progress tracking. It is designed to look credible and load fast while remaining fully static (no build step, no framework).

### Highlights

- **Real-time WebGL background** — a custom GLSL fragment shader (fBm domain-warped fluid) rendered with Three.js on a full-screen quad.
- **Scroll choreography** — GSAP + ScrollTrigger reveal animations, chapter progress bar, and an active-chapter indicator.
- **Smooth scrolling** — Lenis, integrated with the GSAP ticker.
- **Before/after slider** — draggable comparison component built on a native range input (keyboard- and touch-accessible).
- **Accessible contact form** — client-side validation, inline error messaging, and a one-tap "Send via WhatsApp" handoff.
- **Reduced-motion aware** — honours `prefers-reduced-motion` by disabling animation and smooth scroll.
- **Responsive** — mobile-first breakpoints with a dedicated full-screen mobile menu.
- **SEO tooling** — a Python script that generates `sitemap.xml` and `robots.txt` and audits page metadata.

---

## Project Structure

```
tos-algae-removal/
├── index.html                      # Main site (current "vanta" dark theme)
├── styles.css                      # Base styles + theme overrides
├── app.js                          # WebGL scene, animations, UI, form logic
├── seo-sitemap.py                  # SEO: sitemap.xml + robots.txt generator
├── .gitignore
├── LICENSE
├── TOS-original-tweaked/           # Earlier variant (light/original theme)
└── TOS-algae-removal-redesigned/   # Earlier redesigned variant
```

> The two variant folders are preserved for reference/history. The root files are the canonical, current version.

---

## Getting Started

The site is fully static — no build step required.

1. Clone the repository:
   ```bash
   git clone https://github.com/Allowz/tos-algae-removal.git
   cd tos-algae-removal
   ```

2. Open `index.html` in a browser, **or** serve it locally (recommended, so the CDN scripts and relative paths behave exactly as in production):
   ```bash
   # Python 3
   python -m http.server 8080
   # then visit http://localhost:8080
   ```

### Dependencies (loaded via CDN)

| Library | Purpose |
| --- | --- |
| [Three.js](https://threejs.org/) `0.160.0` | WebGL renderer for the shader background |
| [GSAP](https://gsap.com/) `3.12.5` + ScrollTrigger | Scroll-driven animations |
| [Lenis](https://github.com/darkroomengineering/lenis) `1.1.13` | Smooth scrolling |
| Google Fonts | Archivo + Sora typefaces |

No `npm install` is needed. If you prefer to self-host these, download them and update the `<script>`/`<link>` tags in `index.html`.

---

## SEO Tooling

`seo-sitemap.py` is a small automation utility (standard library only — no `pip install` required).

```bash
python seo-sitemap.py
```

It will:

- Generate `sitemap.xml` from the page configuration.
- Generate `robots.txt` referencing the sitemap.
- Extract and print `<title>` and `<meta name="description">` from the HTML files for a quick audit.

**Before deploying**, update `SITE_URL` at the top of `seo-sitemap.py` to your real domain, then re-run the script.

---

## Customisation

| What | Where |
| --- | --- |
| Brand colours & spacing | CSS custom properties in `:root` (`styles.css`) |
| Theme (dark "vanta" overrides) | Bottom section of `styles.css` |
| Phone / WhatsApp numbers | `index.html` (`tel:` and `wa.me` links) |
| Shader look & feel | `fragmentShader` and `setPalette()` in `app.js` |
| Copy / sections | `index.html` |

---

## Accessibility Notes

- The WebGL canvas is `aria-hidden` (decorative only).
- Navigation exposes `aria-expanded` / `aria-controls` state.
- Form errors are surfaced inline and tied to their fields.
- `prefers-reduced-motion` disables animation and smooth scrolling.

---

## Roadmap

- [ ] Add a persistent light/dark theme toggle (currently dark-only).
- [ ] Add a `CONTRIBUTING.md` and issue templates.
- [ ] Add an automated SEO/link-check GitHub Action.
- [ ] Add real project photography for the before/after section.
- [ ] Add a lightweight unit test for the SEO generator.

---

## License

Released under the MIT License — see [`LICENSE`](LICENSE).

---

<p align="center"><em>We remove. We protect. You enjoy a clean, healthy space.</em></p>
