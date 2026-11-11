# The Museum of Palak — Website 15

A single-page, static React + TypeScript website. It has no backend, accounts, database, or API dependency. The birthday countdown and interactive exhibits run entirely in the visitor's browser.

## Requirements
- Node.js 20 or newer
- npm

## Run locally
1. Extract the ZIP.
2. Open the extracted `museum-of-palak` folder in VS Code (or another editor).
3. Open a terminal in that folder.
4. Run:

   ```bash
   npm install
   npm run dev
   ```

5. Open the local URL Vite prints (usually `http://localhost:5173`).

Do not double-click `index.html` to preview the development version. Vite needs to serve the project.

## Build the static website
Run:

```bash
npm run build
```

The ready-to-host static website is created in `dist/`. Upload the **contents** of `dist/` to a static host such as GitHub Pages, Netlify, or Cloudflare Pages. No server is required.

## Add your pictures and Shinchan
Put images in `public/assets/images/` using these exact names:

- `palak-01.jpg` — Grand Gallery portrait 001
- `palak-02.jpg` — Grand Gallery portrait 002
- `palak-03.jpg` — Specimen 002-A
- `palak-04.jpg` — Specimen 002-B
- `palak-05.jpg` — Specimen 002-C
- `shinchan.png` — small Shinchan visitor sticker

You can use `.png` or `.webp` instead, but if you change the extension, also update the image paths in `src/content.ts`.

If you have only 4 photos, remove one object from `specimens` in `src/content.ts`. If you have only 3, remove two. The page layout adjusts automatically.

The site currently shows designed purple placeholders if a photo has not been added yet.

## Optional ambience
Put an audio file at `public/assets/audio/ambience.mp3`. The site never autoplays audio; visitors must turn it on using SOUND OFF in the top bar.

## Edit text and exhibits
Most visible copy is in `src/content.ts`:
- Museum title, subtitle and entrance note
- Grand Gallery captions
- Specimen captions
- Archive file contents
- Interactive question/answer content
- Restricted Collection reveal text
- Birthday message

The interactive behaviours and layout are in `src/App.tsx`; styling is in `src/styles.css`.

## Countdown behaviour
The countdown uses `Asia/Kolkata` time:
- Counts down to November 20 at 00:00 IST.
- Shows the birthday celebration during November 20 in India.
- Resets to the next November 20 after the birthday day ends.

The current year is calculated automatically. You do not need to change it every year.

## Secret exhibit
The small, faint star at the lower-right of the Restricted Collection is the direct unlock control for testing. The visible “REQUEST A HINT” button sends visitors back to the museum entrance with a clue to inspect the museum seal. The star is intentionally subtle but accessible by keyboard.

## Libraries
- React + TypeScript
- Vite
- Tailwind CSS (base utilities)
- Framer Motion
- GSAP + ScrollTrigger
- Lucide React icons

All core libraries are free and open source. Google Fonts are loaded from Google Fonts when internet is available; system fallbacks are included.

## Notes
- This is one continuous scrolling page (`src/App.tsx`), not multiple HTML pages.
- It is a static-site project, but requires `npm install` and a local dev server for development.
- Reduced-motion preferences are respected.
- Mobile layouts and touch interactions are included.
