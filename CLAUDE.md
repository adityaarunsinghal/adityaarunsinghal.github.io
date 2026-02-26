# Aditya Singhal Website

Last verified: 2026-02-26

## Tech Stack
- Language: TypeScript 5.x
- Framework: React 18 with Vite
- Styling: Plain CSS (per-component .css files)
- Database: Firebase Firestore
- Auth: Firebase Auth (Google OAuth)
- Hosting: GitHub Pages (gh-pages branch)
- Testing: No automated test infrastructure — manual browser testing only

## Commands
- `npm run dev` - Start development server
- `npm run build` - Production build (tsc + vite build)
- `npm run deploy` - Build and deploy to GitHub Pages (gh-pages -d dist)
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally

## Deployment
1. Code lives on `master` branch
2. `npm run deploy` builds to `dist/` and pushes to `gh-pages` branch
3. GitHub Pages serves from `gh-pages` branch
4. Custom domain: adityasinghal.com (redirects from adityaarunsinghal.github.io)
5. SPA routing handled by `public/404.html` redirect trick
6. Firestore rules deployed separately: `npx firebase-tools deploy --only firestore:rules --project aditya-singhal-website`

## Project Structure
- `src/components/` - React components (folder per component: Component.tsx + Component.css)
- `src/hooks/` - Custom React hooks (useAuth)
- `src/contexts/` - React contexts (AuthContext)
- `src/firebase.ts` - Firebase initialization (exports auth, db, firebaseapp)
- `src/config.ts` - App configuration (ALLOWED_EMAILS)
- `src/router.tsx` - All routes defined here
- `firestore.rules` - Firestore security rules
- `public/404.html` - SPA redirect for GitHub Pages
- `docs/` - Design plans, implementation plans, test plans
- `scripts/` - Dev utilities (seed-mock-data.ts)

## Key Routes
- `/` - Static website landing page
- `/login` - Google OAuth authentication
- `/progress` - Element tracking dashboard (auth-gated, single user)
- `/lovesingy` - Private app (auth-gated)
- `/translate` - Translation tool (auth-gated)

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
