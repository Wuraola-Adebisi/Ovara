# Ovara

Ovara brings everyday wellbeing into one thoughtful space: movement, nourishment, hydration, routines and reflection.

**Feel good in your own way.**

## What's included

- A visual public homepage with an editorial wellness identity and photography.
- About, Contact, Privacy and Terms pages.
- A personal wellbeing space with profile setup and preferences.
- Activity logging and a seven-day movement view.
- Meal notes and hydration tracking, without a compulsory calorie target.
- Custom routines and completion tracking.
- Mood check-ins and a personal journal.
- Browser-based saving so entries remain available in the same browser.

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS v4 (Vite plugin)
- React Router
- Lucide React

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

## Saved information

The personal space currently saves profile details and entries in browser storage on the device being used. There is no cross-device sync or cloud backup. The Privacy page explains this clearly. Clear the website's local storage or use **Reset your space** to start over.

## Product principles

- Personal wellbeing, not medical diagnosis or treatment.
- Inclusive of different fitness levels and personal goals.
- No compulsory calorie target or single definition of progress.
- Clear about what is stored and where it is stored.
- Sensitive personal records need strong access controls and careful handling.
