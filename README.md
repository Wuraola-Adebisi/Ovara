# Ovara

Ovara brings everyday wellbeing into one thoughtful space: movement, nourishment, hydration, routines and reflection.

**Feel good in your own way.**

## What's included

- A public site: home, approach, contact, privacy and terms pages.
- A setup step for name, optional email, goals and the areas to track.
- Today page with step, water and routine progress, a weekly steps chart and a mood check-in.
- Activity log with duration, optional steps and distance.
- Food notes with optional energy estimates, and a water log.
- Routines with daily ticks and kept history, a daily journal, goals, insights and a calendar.
- Preferences for units, targets and browser reminders, plus download and reset of all data.
- Everything saves in the browser on the current device.

## Stack

- React 18, TypeScript and Vite
- Tailwind CSS v4 (Vite plugin), with design tokens in `src/index.css`
- React Router and Lucide React
- Bricolage Grotesque and Figtree, bundled through Fontsource (no third-party font requests)

## Run locally

Use Node.js 20 or later.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually http://localhost:5173).

## Contact form

The contact form opens the visitor's email application. Set the destination inbox in a local `.env` file:

```bash
VITE_CONTACT_EMAIL=your-inbox@example.com
```

The `.env.example` file shows the variable name. Do not commit private credentials or secrets.

## Build check

```bash
npm run build
```

A GitHub Actions workflow also runs the TypeScript and Vite build check on pushes and pull requests to `main`.

## Deploying on Vercel

`vercel.json` rewrites every path to `index.html` so direct links such as `/app/insights` work after a refresh.

## Saved information

The personal space currently saves profile details and entries in browser storage on the device being used. There is no cross-device sync or cloud backup. The Privacy page explains this clearly. Clear the website's local storage or use **Reset my space** on the Preferences page. **Download my data** saves a JSON copy first.

## Product principles

- Personal wellbeing, not medical diagnosis or treatment.
- Inclusive of different fitness levels and personal goals.
- No compulsory calorie target or single definition of progress.
- Clear about what is stored and where it is stored.
- Sensitive personal records need strong access controls and careful handling.
