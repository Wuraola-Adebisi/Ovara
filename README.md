# Ovara

Ovara brings everyday wellbeing activities into one personal space: movement, nutrition, hydration, routines and reflection.

**Your everyday, in better balance.**

## Current MVP build

The application includes:

- A first-use profile and wellbeing-preferences flow.
- A personal overview with activity, hydration and routine summaries.
- Activity logging, editable records and a seven-day step history.
- Meal logging and hydration tracking.
- Custom routines with completion tracking.
- A personal journal with saved mood and reflection.
- Browser persistence so a tester can return to the same data on the same device.

The current build uses seeded starting records and browser storage. The profile flow simulates account setup; it is **not production authentication**. Data is not synced across devices, shared with a research dashboard, or backed up to a server. Do not enter sensitive health information into this build. Supabase, secure authentication, device integrations and centralised tester analytics are planned for a later milestone.

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

Open the local URL printed by Vite in your terminal (usually http://localhost:5173).

## Production build

```bash
npm run build
npm run preview
```

## Reset local test data

The MVP stores its profile and records in browser local storage. To start onboarding again, clear the site's local storage in your browser's developer tools, then refresh the page.

## Product principles

- Personal wellbeing, not medical diagnosis or treatment.
- Inclusive of different fitness levels and personal goals.
- Clear about what is sample data and what a person has recorded.
- International-ready: units, locale, dates and time zones should be user preferences.
- Sensitive personal records require explicit access controls before a production launch.
