# Aditya Singhal Website

Public document build and stack checked: 2026-10-21

## Tech Stack
- Language: TypeScript 6.x
- Framework: Vite static document generation; React 19 for private apps
- Styling: Plain CSS (per-component .css files)
- Database: Firebase Firestore
- Auth: Firebase Auth (Google OAuth)
- Hosting: GitHub Pages (gh-pages branch)
- Testing: Workshop static-artifact and browser checks; manual verification for other application features

## Commands
- `pnpm dev` - Start development server
- `pnpm build` - Type-check, build app entries, and generate public/workshop HTML and discovery files
- `pnpm check:site` - Check homepage/schema, app isolation, shortcuts, and legacy routing
- `pnpm check:workshop` - Check generated workshop routes, metadata, content, and assets
- `pnpm run deploy` - Build and deploy to GitHub Pages (gh-pages -d dist) (must use `run` — `pnpm deploy` is reserved)
- `pnpm lint` - Run ESLint
- `pnpm preview` - Preview production build locally

## Deployment
1. Code lives on `master` branch
2. `pnpm run deploy` builds to `dist/` and pushes to `gh-pages` branch
3. GitHub Pages serves from `gh-pages` branch
4. Custom domain: adityasinghal.com (redirects from adityaarunsinghal.github.io)
5. Public pages and app entries have physical HTML documents; a generated 404 helper preserves known legacy bookmarks and case variants
6. Firestore rules deployed separately: `pnpm dlx firebase-tools deploy --only firestore:rules --project aditya-singhal-website`

## Project Structure
- `src/components/` - React components (folder per component: Component.tsx + Component.css)
- `src/hooks/` - Custom React hooks (useAuth)
- `src/contexts/` - React contexts (AuthContext)
- `src/firebase.ts` - Firebase initialization (exports auth, db, firebaseapp)
- `src/config.ts` - App configuration (ALLOWED_EMAILS)
- `src/router.tsx` - React app routes and bridges to public documents
- `src/site/` - Public content, homepage template, metadata, shortcuts, and compatibility routing
- `app.html` - Private app entry template, compiled separately from the public homepage
- `firestore.rules` - Firestore security rules
- `scripts/build-site-pages.mjs` - Generate public HTML, app entries, shortcuts, discovery files, and custom 404
- `docs/` - Design plans, implementation plans, test plans
- `scripts/` - Dev utilities (seed-mock-data.ts)

## Key Routes
- `/` - Static website landing page
- `/login` - Google OAuth authentication
- `/progress` - Element tracking dashboard (auth-gated, single user)
- `/lovesingy` - Private app (auth-gated)
- `/translate` - Translation tool (auth-gated)
- `/agentic-ai-workshop/` - Current course, statically generated
- `/agentic-ai-workshop-2025/` - Historical course archive

Read `src/workshop/AGENTS.md` before changing workshop pages. Public documents use ordinary navigation; app URLs retain React Router and Firebase authentication. Test physical serving with `python3 scripts/serve-static-preview.py` as well as Vite development. Keep the résumé unlisted in public navigation and discovery files.

## Firebase
- Project: `aditya-singhal-website`
- Config via env vars: `.env` with `VITE_FIREBASE_*` keys
- Firestore collections:
  - `element-tracker` - Daily element entries (access: adityaarunsinghal@gmail.com only)
  - `love-ingy-messages` - Love messages (access: 3 whitelisted emails)
  - `trmnl-config` - TRMNL configuration (access: 3 whitelisted emails)

## Conventions
- Component structure: folder with Component.tsx and Component.css
- Authentication: PrivateRoute wrapper for protected routes
- Imports: `@/` path alias (configured in tsconfig + vite.config)
- Firestore collections: kebab-case naming
- Firestore document IDs: YYYY-MM-DD for date-keyed collections

## Boundaries
- Safe to edit: `src/`, `firestore.rules`, `docs/`
- Never touch: `.env` (contains Firebase secrets), Firebase project config
- Deploy separately: Firestore rules (via firebase-tools CLI)
