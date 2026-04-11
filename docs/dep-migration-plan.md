# Dependency Migration Plan

Created: 2026-04-11

## Current State

| Package | Current | Latest | Jump |
|---------|---------|--------|------|
| typescript | 5.9.3 | 6.0.2 | Major |
| vite | 6.4.2 | 8.0.8 | Major (skip 7) |
| @vitejs/plugin-react | 4.7.0 | 6.0.1 | Major |
| eslint | 8.57.1 | 10.2.0 | Major (skip 9) |
| @typescript-eslint/eslint-plugin | 7.18.0 | 8.58.1 | Major |
| @typescript-eslint/parser | 7.18.0 | 8.58.1 | Major |
| eslint-plugin-react-hooks | 4.6.2 | 7.0.1 | Major |
| eslint-plugin-react-refresh | 0.4.26 | 0.5.2 | Minor |
| react | 18.3.1 | 19.2.5 | Major |
| react-dom | 18.3.1 | 19.2.5 | Major |
| @types/react | 18.3.28 | 19.2.14 | Major |
| @types/react-dom | 18.3.7 | 19.2.3 | Major |
| react-router-dom | 6.30.3 | 7.14.0 | Major |
| match-sorter | 6.3.4 | 8.2.0 | Major |
| @types/jquery | 3.5.34 | 4.0.0 | Major |
| rollup-plugin-visualizer | 6.0.11 | 7.0.1 | Major |

## Coupling Map

These MUST upgrade together:
- **ESLint 10** + **@typescript-eslint 8** + **eslint-plugin-react-hooks 7** + **eslint-plugin-react-refresh 0.5** (all require flat config)
- **Vite 8** + **@vitejs/plugin-react 6** (plugin tied to Vite version)
- **React 19** + **@types/react 19** + **react-dom 19** + **@types/react-dom 19**

---

## Phase 1: Low-Risk Independents

**Effort: ~30 min | Risk: Low**

### 1a. match-sorter 6 → 8
- No actual API changes between v6-v8
- `npm install match-sorter@latest`
- Verify: search/sort behavior unchanged

### 1b. rollup-plugin-visualizer 6 → 7
- `npm install rollup-plugin-visualizer@latest`
- Verify: `npm run analyze` still works

### 1c. @types/jquery 3 → 4
- Only used for type hints, not runtime
- Consider: do we even use jQuery? If not, remove entirely
- `npm install @types/jquery@latest` or `npm uninstall @types/jquery`

**Deploy after Phase 1.**

---

## Phase 2: ESLint Ecosystem (Flat Config Migration)

**Effort: ~2 hours | Risk: Medium**

This is the biggest config change. ESLint 10 drops `.eslintrc.*` entirely.

### What changes
- Delete `.eslintrc.cjs`
- Create `eslint.config.js` (flat config format)
- Update `package.json` lint script (should work as-is)
- Update all ESLint-related packages together

### Steps
1. Install new versions:
   ```
   npm install --save-dev eslint@latest @typescript-eslint/eslint-plugin@latest @typescript-eslint/parser@latest eslint-plugin-react-hooks@latest eslint-plugin-react-refresh@latest globals
   ```
2. Delete `.eslintrc.cjs`
3. Create `eslint.config.js`:
   ```js
   import js from '@eslint/js'
   import globals from 'globals'
   import tsPlugin from '@typescript-eslint/eslint-plugin'
   import tsParser from '@typescript-eslint/parser'
   import reactHooks from 'eslint-plugin-react-hooks'
   import reactRefresh from 'eslint-plugin-react-refresh'

   export default [
     { ignores: ['dist', 'node_modules', 'functions'] },
     {
       files: ['**/*.{ts,tsx}'],
       languageOptions: {
         ecmaVersion: 2020,
         sourceType: 'module',
         parser: tsParser,
         globals: globals.browser,
       },
       plugins: {
         '@typescript-eslint': tsPlugin,
         'react-hooks': reactHooks,
         'react-refresh': reactRefresh,
       },
       rules: {
         ...js.configs.recommended.rules,
         ...tsPlugin.configs.recommended.rules,
         ...reactHooks.configs.recommended.rules,
         'react-refresh/only-export-components': 'warn',
       },
     },
   ]
   ```
4. Run `npm run lint` and fix any new issues
5. Verify pre-commit hook still works

**Deploy after Phase 2.**

---

## Phase 3: TypeScript 6

**Effort: ~1 hour | Risk: Medium**

### Key breaking changes
- Stricter `noImplicitAny` for async functions without explicit return types
- `moduleResolution: "bundler"` is now default (we already have this set)

### Steps
1. `npm install --save-dev typescript@latest`
2. Run `npx tsc --noEmit` to find new errors
3. Add explicit return types where needed (mainly async functions)
4. Verify build: `npm run build`

**Deploy after Phase 3.**

---

## Phase 4: Vite 8 + Plugin

**Effort: ~1 hour | Risk: Medium**

### Key breaking changes
- Rolldown replaces Rollup (Rust-based bundler, faster)
- Requires Node >= 20.19
- `rollupOptions.output.manualChunks` object format → must use function format
- Oxc replaces esbuild for JSX/TS transforms

### Steps
1. Update `engines` in package.json: `"node": ">=20.19.0"`
2. `npm install --save-dev vite@latest @vitejs/plugin-react@latest`
3. Check `vite.config.ts` for any `rollupOptions` or `esbuildOptions` that need updating
4. Run `npm run dev` and `npm run build`
5. Verify dev server hot reload works

**Deploy after Phase 4.**

---

## Phase 5: React 19

**Effort: ~1-2 hours | Risk: Medium**

### Key breaking changes
- `ReactDOM.render()` removed (we use `createRoot` — already fine)
- Stricter Strict Mode behavior
- `ref` is now a regular prop (no more `forwardRef` needed)
- `useContext()` → can use `use(Context)` (optional)

### Steps
1. `npm install react@latest react-dom@latest @types/react@latest @types/react-dom@latest`
2. Run `npm run build` — fix any type errors
3. Test all pages manually:
   - `/` landing page
   - `/login` auth flow
   - `/progress` element tracker (donut, heatmap, streak, entry CRUD)
   - `/lovesingy` and `/translate`
4. Check for any `forwardRef` usage that can be simplified

**Deploy after Phase 5.**

---

## Phase 6: React Router 7

**Effort: ~1 hour | Risk: Low-Medium**

### Key breaking changes
- Minimal from v6 — mostly additive features
- `react-router-dom` re-exports from `react-router`
- Loader data requests add `.data` suffix (only affects data routers)

### Steps
1. `npm install react-router-dom@latest`
2. We use `BrowserRouter` + `Routes` + `Route` — should work without changes
3. Test all route transitions, especially PrivateRoute redirects
4. Test `/login` → redirect back to protected page flow

**Deploy after Phase 6.**

---

## Verification Checklist (After Each Phase)

- [ ] `npm run lint` passes
- [ ] `npm run build` passes (no TS errors)
- [ ] `npm run dev` — dev server starts, hot reload works
- [ ] Manual test: `/progress` — donut chart, period toggle, heatmap, entry create/edit/delete
- [ ] Manual test: `/login` — Google OAuth flow
- [ ] Manual test: `/` — landing page renders
- [ ] `npm audit` — no new vulnerabilities introduced
- [ ] Git commit + push + deploy

---

## Timeline

Each phase should be its own commit/deploy cycle. Don't batch phases — if something breaks, you want to know exactly which upgrade caused it.

Recommended order: Phase 1 → 2 → 3 → 4 → 5 → 6

Phase 3 (TypeScript) can be swapped before Phase 2 (ESLint) if preferred, since they're independent. All other phases should follow this order due to coupling.
