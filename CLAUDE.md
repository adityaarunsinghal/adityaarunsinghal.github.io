# Element Tracker

Last verified: 2026-02-26

## Tech Stack
- Language: TypeScript 5.x
- Framework: React 18 with Vite
- Styling: CSS Modules
- Database: Firebase Firestore
- Auth: Firebase Auth
- Testing: Vitest

## Commands
- `npm run dev` - Start development server (port 5173)
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Run ESLint

## Project Structure
- `src/components/` - React components
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utilities and libraries
- `src/styles/` - Global styles
- `firestore.rules` - Firestore security rules
- `docs/implementation-plans/` - Phase-based implementation documentation

## Key Routes
- `/` - Static website landing
- `/login` - Authentication
- `/progress` - Element tracking dashboard (auth-gated)
- `/lovesingy` - Private app (auth-gated)

## Conventions
- Component structure: folder with Component.tsx and Component.css
- Authentication: PrivateRoute wrapper for protected routes
- Firestore collections: kebab-case naming (element-tracker)
- Date format: YYYY-MM-DD for document IDs

## Firebase Configuration
- Firestore collections:
  - `element-tracker` - Daily element tracking entries
  - `love-ingy-messages` - Love messages
  - `trmnl-config` - TRMNL configuration
- Auth: Email whitelist in firestore.rules

## Boundaries
- Safe to edit: `src/`, `firestore.rules`
- Never touch: Firebase project config, `.env` files
- Immutable: Past Firestore entries (audit trail)